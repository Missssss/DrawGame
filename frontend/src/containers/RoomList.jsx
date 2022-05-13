import '../index.css';
import{BrowserRouter, Routes, Route, Link, useNavigate} from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Room from '../components/roomList/Room';
import { swAlert, enterName } from '../util/alert';

const frameStyle = {
    width:"70%",
    height:"500px",
    margin:"100px auto",
    position: "relative",
    // backgroundColor:"palegreen",
}
const roomListStyle = {
    width:"80%",
    height:"60%",
    margin:"25px auto 10px",
    overflow: "auto",
    display: "flex",
    flexWrap: "wrap", //| nowrap | wrap-reverse,
    // backgroundColor:"paleturquoise",
}
const divFlexStyle = {
    display: "flex",
    justifyContent: "center", 
    alignItems:"center",
    // marginTop: "20px",
}
const buttonStyle = {
    width:"150px",
    height:"40px",
    margin:"10px 20px",
    boxSizing:"content-box",
    bottom: "10px",
    cursor: "pointer",
    // backgroundColor:"palegreen",
}
const roomStyle = {
    width:"23%",
    height:"50%",
    margin:"3px",
    // backgroundColor:"pink",
}
const roomImgStyle = {
    width:"50%",
    height:"60%",
    margin: "0 auto",
    display:"block"
}

// const socket = io(process.env.REACT_APP_SOCKETIO_URL);

const RoomList = ({socket}) =>{
    const [roomList, setRoomList] = useState([]);
    const [currentRoomId, setCurrentRoomId] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // 先取得全部房間
        async function getRoomList(){
            let resData = await axios.get(`${process.env.REACT_APP_DOMAIN_URL}/api/1.0/rooms`);
            console.log("roomList: ", resData.data);
            setRoomList(resData.data);
        }
        getRoomList();
    },[])

    useEffect(() =>{
        //監聽createRoom 更新roomList
        socket.on("createRoom", (room) => {
            console.log(`socket on createRoom: `, room.roomId)
            
            // setRoomList([...roomList, room]);//底下[]有放roomList就行了,似乎是這樣才能抓到最新狀態
            setRoomList((pre) => {
                return [...pre, room]
            })
        })

        socket.on("joinGame", (room) => {
            //底下[]有放roomList就能run了
            // let newRoomList = [...roomList]
            console.log(`socket on joinGame: `, room)
            let newRoomList = JSON.parse(JSON.stringify(roomList));
            for(let newRoom of newRoomList){
                if(newRoom.roomId == room.roomId && newRoom.playerCount < newRoom.playerLimit){
                    newRoom.playerCount = room.playerCount;
                    break;
                }
            }
            setRoomList(newRoomList)

            // setRoomList((pre) => {
            //     // let newRoomList = JSON.parse(JSON.stringify(pre));
            //    let newRoomList = [...pre]
            //     for(let newRoom of newRoomList){
            //         if(newRoom.roomId == room.roomId && newRoom.playerCount < newRoom.playerLimit){
            //             newRoom.playerCount++;
            //             break;
            //         }
            //     }
            //     return newRoomList;
            // })
        })

        socket.on("leaveGame", (room) => {
            console.log(`socket on leaveGame: `, room.roomId)
            let newRoomList = JSON.parse(JSON.stringify(roomList));
            for(let newRoom of newRoomList){
                if(newRoom.roomId == room.roomId && newRoom.playerCount >= 1){
                    newRoom.playerCount = room.playerCount;
                    break;
                }
            }
            setRoomList(newRoomList);
        })

        socket.on("roomStart", (room) => {
            let newRoomList = JSON.parse(JSON.stringify(roomList));
            for(let newRoom of newRoomList){
                if(newRoom.roomId == room.roomId){
                    newRoom.isStart = true;
                    break;
                }
            }
            setRoomList(newRoomList);
        })

        socket.on("roomFree", (room) => {
            console.log(" socket.on roomFree",room)
            let newRoomList = JSON.parse(JSON.stringify(roomList));
            for(let newRoom of newRoomList){
                if(newRoom.roomId == room.roomId){
                    newRoom.isStart = false;
                    break;
                }
            }
            setRoomList(newRoomList);
            
        })

        return () => {
            socket.off("createRoom");
            socket.off("joinGame");
            socket.off("leaveGame");
            socket.off("roomStart");
            socket.off("roomFree");
        }
    },[roomList])

    function joinGame(){
        let gameRoom = roomList.find((room, i) => {
            return room.roomId == currentRoomId;
        })

        if(gameRoom.isStart){
            swAlert("game has started");
            return;
        }

        if(!gameRoom){
            swAlert("room has expired");
            return;
        }

        if(gameRoom.playerCount >= gameRoom.playerLimit ){
            swAlert("room is full");
            return;
        }

        navigate(`/game/${currentRoomId}`)
    }

    return (
        <div style={frameStyle} className="frame_border">
            <div style={{textAlign:"center", fontSize:"40px", margin:"20px auto 0px"}}>GAME ROOM</div>
            <div style={roomListStyle} className="frame_border">
                {roomList.map((room, index) => {
                    return <Room 
                        setCurrentRoomId={setCurrentRoomId} 
                        roomBorder={(room.roomId==currentRoomId)? {color:"blue", width:"5px"}: {color:"black", width:"3px"}} 
                        key={room.roomId} 
                        room={room}></Room> 
                })}
            </div>
            
            <div style={divFlexStyle}>
                <Link to="/create">
                    <button className="component_border" style={buttonStyle}>創立房間</button>
                </Link>
                {/* <Link to="/game"> */}
                    <button onClick={joinGame} className="component_border" style={buttonStyle}>加入房間</button>
                {/* </Link> */}
            </div>

            
        </div>
    )
}

export default RoomList;