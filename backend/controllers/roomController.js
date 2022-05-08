const { v4: uuidv4 } = require('uuid');
const redisClient =  require("../util/redis");
const ROOM_EXPIRE = 60 * 50;  //先設置5分鐘房間會被銷毀
const ROOM_PREFIX = "room--"

// await client.set('key', JSON.stringify(camp));
// const value = await client.get('key');
// JSON.parse(value)

let roomMap = {} ////
const createRoom =  async (req, res) => {
    let config = req.body;
    let roomId = uuidv4()
    roomMap[roomId] = {...config, roomId, playerCount:1, playerList:[]} ////

    let roomKey = ROOM_PREFIX + roomId;
    await redisClient.set(roomKey, JSON.stringify({...config, roomId, playerCount:1, playerList:[]}));
    redisClient.expire(roomKey, ROOM_EXPIRE)
    
    console.log("createRoom: ",{...config, roomId, playerCount:1}, )
      
    res.status(200).send({...config, roomId, playerCount:1}) ; 
}

const getRoom =  async (req, res) => {
    let roomId = req.params.roomId;
    let room = await redisClient.get((ROOM_PREFIX + roomId));
    if(!room){
        res.status(300).json({error: 'room is not exit'}); 
        console.log(roomId, "room is not exit");
        return;
    }
    let roomInfo = roomMap[roomId] ////
    room = JSON.parse(room)
    console.log("getRoom: ", room);
    res.status(200).send(room); 
}

const getRandomRoom =  async (req, res) => {
    let allRoomKeys = await redisClient.keys(ROOM_PREFIX+"*");
    console.log(allRoomKeys);

    for(roomKey of allRoomKeys){
        let room = await redisClient.get(roomKey);
        room = JSON.parse(room);
        if(room.playerCount < room.playerLimit){
            console.log("getRandomRoom: ", room)
            res.status(200).send(room);
            return
        }
    }
    res.status(400).send("rooms all full");
}

const getAllRooms =  async (req, res) => {
    let allRoomKeys = await redisClient.keys((ROOM_PREFIX+"*"));
    let roomList = [];
    for(roomKey of allRoomKeys){
        let room = JSON.parse(await redisClient.get(roomKey));
        roomList.push(room);
    }
    res.status(200).send(roomList); 
}


module.exports = {
    createRoom,
    getRoom,
    getRandomRoom,
    getAllRooms,
};