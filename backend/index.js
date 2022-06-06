require('dotenv').config();
const { rateLimit } = require('./util/ratelimiter');
const { v4: uuidv4 } = require('uuid');
const redisClient =  require("./util/redis");
// Express Initialization
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors')


app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const io = new Server(server, {
    cors: {
      origin: "*",  //"http://localhost:3001",
      methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {
    let count = 0 
    console.log('a user connected');
    console.log("socketID:", socket.id, ++count)
    console.log("rooms:", io.sockets.adapter.rooms)
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});

io.on('connection', (socket) => {
    socket.on("draw", (coordinate) => {
        // console.log(coordinate)
        socket.broadcast.emit("draw", coordinate)
    });
    socket.on("recordStage", () => {
        socket.broadcast.emit("recordStage")
    });
    socket.on("changeColor", (color) => {
        socket.broadcast.emit("changeColor", color)
    });
    socket.on("changeLineWidth", (lineWidth) => {
        socket.broadcast.emit("changeLineWidth", lineWidth)
    });
    socket.on("clearCanvas", () => {
        socket.broadcast.emit("clearCanvas")
    });
    socket.on("undo", () => {
        socket.broadcast.emit("undo")
    });

    //
    socket.on('unsubscribe',function(room){  
        try{
            console.log('[socket]','leave room :', room);
            socket.leave(room);
            socket.to(room).emit('user left', socket.id);
        }catch(e){
            console.log('[error]','leave room :', e);
            socket.emit('error','couldnt perform requested action');
        }
    })

    //
    socket.on("createRoom", (room) => {
        console.log(`createRoom: ${room.roomId}`)////////
        socket.broadcast.emit("createRoom", room)
    });
    socket.on("joinGame", async(room) => {
        console.log(`joinGame: ${room.roomId}`)
        
        //加入遊戲前先離開沒釋放掉的room
        for(roomName of socket.rooms){
            if(roomName.startsWith("roomAnswer--") || roomName.startsWith("roomChat--")){
                socket.leave(roomName);
            }
        }
        socket.join(`roomAnswer--${room.roomId}`);
        socket.join(`roomChat--${room.roomId}`);

        let ids = await io.in(`roomAnswer--${room.roomId}`).allSockets();
        let playerCount = ids.size;
        room.playerCount = playerCount;
        let newRoom = await incrRoomPlayer(room); //更新redis裡此room的playerList
        
        //通知roomLsit某room人數更新
        io.emit("joinGame", newRoom);

        //通知game有人加入
        socket.to(`roomAnswer--${room.roomId}`).emit("playerJoin", newRoom);

        socket.on('disconnect', () => {
            console.log("flush disconnect", newRoom)
            socket.to(`roomAnswer--${room.roomId}`).emit("playerLeave",newRoom); //通知game有人離開
            io.emit("leaveGame", newRoom) //通知roomLsit某room人數減少
            decrRoomPlayer(newRoom) //減少redis裡此room的playerCount
        });

        console.log("socket on joinGame, ids",ids);
        console.log("socket on joinGame, ids count",ids.size);

        // console.log("sids",io.sockets.adapter.rooms) //取得全部room
        // console.log("sids",io.sockets.adapter.sids) 
        // io.to(`roomChat--${room.roomId}`).emit("joinGame","aaaaaaaa"); //房內全部
        // socket.to(`roomChat--${room.roomId}`).emit("joinGame","bbbbbbbbb"); // 房內自己以外
        // socket.emit("joinGame","cccccccc"); //全部自己以外

    });

    socket.on("leaveGame", async(room) => {
        console.log("goback disconnect", room)
        for(roomName of socket.rooms){
            if(roomName.startsWith("roomAnswer--") || roomName.startsWith("roomChat--")){
                socket.leave(roomName);
            }
        }
        let ids = await io.in(`roomAnswer--${room.roomId}`).allSockets();
        room.playerCount = ids.size;
        socket.to(`roomAnswer--${room.roomId}`).emit("playerLeave", room); //通知game有人離開
        io.emit("leaveGame", room) //通知roomLsit某room人數減少
        decrRoomPlayer(room) //減少redis裡此room的playerCount
    })

    socket.on("roomFree", (room) => {
        //通知roomList room.isStart false
        io.emit("roomFree", room);
    })

    //TODO: 原本有setRoomInfo()現在改成updatePlayerInRoom還未測試有沒有bug  //A有! 分數沒被更新至redis 從這裡emit newRoom 會沒分數
    socket.on("gameStart", async (room) => {
        await updatePlayerAndRoom (room); //更新房間資訊(玩家分數)到redis
        let newRoom = await updatePlayerInRoom(room); //開始前都更新全部有哪些人及順序,避免不一致
        io.to(`roomAnswer--${room.roomId}`).emit("gameStart", newRoom);
        //通知roomList room.isStart == true
        io.emit("roomStart", newRoom);
    })
    socket.on("gameRiddle", (room) => {
        io.to(`roomAnswer--${room.roomId}`).emit("gameRiddle", room);
    })
    socket.on("missRound", (room) => {
        io.to(`roomAnswer--${room.roomId}`).emit("missRound", room);
    })
    socket.on("nextRound", (room) => {
        io.to(`roomAnswer--${room.roomId}`).emit("nextRound", room);
    })
    socket.on("finishRound", (room) => {
        io.to(`roomAnswer--${room.roomId}`).emit("finishRound", room);
    })

    socket.on("message", ({message, room}) => {
        console.log("socket.on(message", room)
        io.to(`roomAnswer--${room.roomId}`).emit("message", message);
    })

    socket.on("chat", ({message, room}) => {
        io.to(`roomChat--${room.roomId}`).emit("chat", message);
    })
    socket.on("bingo", async(room) => {
        console.log("socket.on(bingo", room)
       
        io.to(`roomAnswer--${room.roomId}`).emit("bingo", room);
    })
});


const ROOM_PREFIX = "room:";
const ROOMP_PREFIX = "roomP:"; //區別用 讓keys(room:*)只取得到room
const ROOM_PLAYER_INCR_PREFIX = "roomIncr"
const ROOM_EXPIRE = 60 * 30;

async function incrRoomPlayer(room){
    const playerKey = ROOMP_PREFIX + room.roomId + ":playerList";
    const playerIncrKey = ROOM_PLAYER_INCR_PREFIX + room.roomId;

    room.currUser.order = await redisClient.incr(playerIncrKey); //紀錄進來的順序
    await redisClient.hSet(playerKey, room.currUserId, JSON.stringify(room.currUser));
    let newRoom = await updatePlayerInRoom(room);
    return newRoom;
}

async function decrRoomPlayer(room){
    const roomKey = ROOM_PREFIX + room.roomId
    const playerKey = ROOMP_PREFIX + room.roomId + ":playerList";

    let redisRoom = await redisClient.get((roomKey));
    if(!redisRoom){
        return;
    }
    redisRoom = JSON.parse(redisRoom);
    await redisClient.hDel(playerKey, room.currUserId);
    updatePlayerInRoom (redisRoom);
}

async function updatePlayerInRoom (room) {
    const roomKey = ROOM_PREFIX + room.roomId
    const playerKey = ROOMP_PREFIX + room.roomId + ":playerList";
    const playerIncrKey = ROOM_PLAYER_INCR_PREFIX + room.roomId;

    let  playerList = await redisClient.hVals(playerKey); //get hset all value by key
    playerList = playerList.map( user => JSON.parse(user));
    playerList.sort((a, b) => (a.order - b.order));
    room.playerList = playerList;
    room.playerCount = playerList.length; 
    await redisClient.set(roomKey, JSON.stringify(room));
    redisClient.expire(roomKey, ROOM_EXPIRE);
    redisClient.expire(playerKey, ROOM_EXPIRE);
    redisClient.expire(playerIncrKey, ROOM_EXPIRE);
    return room;
}


async function updatePlayerAndRoom (room) {
    const roomKey = ROOM_PREFIX + room.roomId
    const playerKey = ROOMP_PREFIX + room.roomId + ":playerList";
    
    await redisClient.set(roomKey, JSON.stringify(room));
    for(let player of room.playerList){
        await redisClient.hSet(playerKey, player.userId, JSON.stringify(player));
    }
}





app.use('/api/1.0', rateLimit, [
    require('./routes/roomRoute'),
    require('./routes/userRoute'),
]);



server.listen(3000, () => {
    console.log('listening on *:3000');
});

// app.listen(3000, () => {
//     console.log(`Example app listening at http://localhost:${3000}`);
// });