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
        socket.join(`draw--${room.roomId}`);
        socket.join(`roomAnswer--${room.roomId}`);
        socket.join(`roomChat--${room.roomId}`);

        //通知roomLsit某room人數更新
        let ids = await io.in(`roomAnswer--${room.roomId}`).allSockets()
        let playerCount = ids.size;
        room.playerCount = playerCount;
        io.emit("joinGame", room);

        //通知game有人加入
        socket.to(`roomAnswer--${room.roomId}`).emit("playerJoin",room);

        //更新redis裡此room的playerCount
        setRoomInfo(room)

        socket.on('disconnect', () => {
            socket.to(`roomAnswer--${room.roomId}`).emit("playerLeave",room); //通知game有人離開
            io.emit("leaveGame", room) //通知roomLsit某room人數減少
            decrRoomPlayer(room) //減少redis裡此room的playerCount
            console.log('a user leave game');
        });

        io.to(`roomChat--${room.roomId}`).emit("joinGame","aaaaaaaa");
        socket.to(`roomChat--${room.roomId}`).emit("joinGame","bbbbbbbbb");
        socket.emit("joinGame","cccccccc");

        console.log("ids",ids)
        console.log("ids count",ids.size)
        // console.log("sids",io.sockets.adapter.rooms)
        // console.log("sids",io.sockets.adapter.sids)

    });

    socket.on("leaveGame", async(room) => {
        socket.to(`roomAnswer--${room.roomId}`).emit("playerLeave", room); //通知game有人離開
        io.emit("leaveGame", room) //通知roomLsit某room人數減少
        decrRoomPlayer(room) //減少redis裡此room的playerCount
        console.log('a user leave game');
    })

    socket.on("gameStart", (room) => {
        io.to(`roomAnswer--${room.roomId}`).emit("gameStart", room);
        setRoomInfo(room);
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
    socket.on("bingo", (room) => {
        console.log("socket.on(bingo", room)
        io.to(`roomAnswer--${room.roomId}`).emit("bingo", room);
    })

});

async function setRoomInfo(room){
    const ROOM_PREFIX = "room--";
    // let redisRoom = await redisClient.get((ROOM_PREFIX + room.roomId));
    // if(!redisRoom){
    //     return;
    // }
    // redisRoom = JSON.parse(redisRoom)
    // redisRoom.playerCount = room.playerCount;
    await redisClient.set((ROOM_PREFIX + room.roomId), JSON.stringify(room));
    redisClient.expire((ROOM_PREFIX + room.roomId), 60 * 30)
}

async function decrRoomPlayer(room){
    const ROOM_PREFIX = "room--";
    let redisRoom = await redisClient.get((ROOM_PREFIX + room.roomId));
    if(!redisRoom){
        return;
    }
    redisRoom = JSON.parse(redisRoom);
    let newPlayerList = redisRoom.playerList.filter((player) => player.userId != room.currUserId);
    redisRoom.playerList = newPlayerList;
    redisRoom.playerCount = newPlayerList.length;
    await redisClient.set((ROOM_PREFIX + room.roomId), JSON.stringify(redisRoom));
    redisClient.expire((ROOM_PREFIX + room.roomId), 60 * 30);
}



app.use('/api/1.0', rateLimit, [
    require('./routes/roomRoute'),
    require('./routes/userRoute'),
]);


// let roomMap = {}
// app.post('/api/1.0/', async function (req, res) {
//     let config = req.body;
//     let roomId = uuidv4()
//     roomMap[roomId] = {...config, roomId}
//     console.log(roomMap, "=======")
      
//     res.status(200).send({...config, roomId}) ; 
// })

// app.get('/api/1.0/roomInfo/:roomId', async function (req, res) {
//     let roomId = req.params.roomId
//     if(!(roomId in roomMap)){
//         res.status(300).json({error: 'room is not exit'}); 
//         console.log(roomId, "===aaaaaaaa===")
//         return;
//     }
//     let roomInfo = roomMap[roomId]
//     console.log(roomId in roomMap, "===bbbbbb====")
//     console.log(roomInfo, "===bbbbbb====")
//     res.status(200).send({roomInfo}) ; 
// })

server.listen(3000, () => {
    console.log('listening on *:3000');
});

// app.listen(3000, () => {
//     console.log(`Example app listening at http://localhost:${3000}`);
// });