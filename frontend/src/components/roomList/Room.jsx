import '../../index.css';
import{BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';



const roomImgStyle = {
    width:"45%",
    height:"45%",
    margin: "0 auto",
    display:"block"
}
const divFlexStyle = {
    width:"95%",
    display: "flex",
    justifyContent: "center", 
    alignItems:"center",
    marginLeft: "5px",
}
const roomInfoStyle = {
    fontSize:"25px",
    textAlign:"center",
    width:"70px",
    height:"10%",
    margin: "5px",
}
const playerCurrenStyle = {
    fontSize:"16px",
    textAlign:"left",
    width:"20%",
    height:"10%",
}
const scoreCurrenStyle = {
    fontSize:"16px",
    textAlign:"left",
    width:"20%",
    height:"10%",
}

function modeTranslate(mode){
    if(mode == "general"){
        mode = "綜合"
    }else if(mode == "anmial"){
        mode = "動物"
    }else if(mode == "food"){
        mode = "食物"
    }else if(mode == "song"){
        mode = "歌曲"
    }
    return mode
}


const Room = ({room,  setCurrentRoomId, roomBorder}) => {
    const [borderColor, setBorderColor] = useState("black");
    const [borderWidth, setBorderWidth] = useState("3px");
    const [isHover, setIsHover] = useState(true);
    const [isChoise, setIsChoise] = useState(false);

    useEffect(() => {
        resetBorder()
    },[roomBorder])

    useEffect(() => {
        setIsHover(false);
    },[isChoise])
    
    const roomStyle = {
        width:"23%",
        height:"60%",
        margin:"3px",
        borderColor: borderColor,
        borderWidth: borderWidth,
    }
    function resetBorder(){
        setBorderColor(roomBorder.color);
        setBorderWidth(roomBorder.width);
        setIsHover(true);
    }

    function onMouseMove(e){
        if(isHover){
            setBorderColor("yellow");
            setBorderWidth("5px");
        }
    }
    function onMouseOut(e){
        if(isHover){
            resetBorder();
        }
    }
    function onMouseUp(e){
        setCurrentRoomId(room.roomId)
        setIsChoise(!isChoise);
    }

    return(
        <div onMouseUp={onMouseUp} onMouseMove={onMouseMove} onMouseOut={onMouseOut} className="component_border" style={roomStyle}>
            <img src={require("../../img/general.gif")} alt="" style={roomImgStyle}/>
            <div style={divFlexStyle}>
                <div style={roomInfoStyle}>{modeTranslate(room.mode)}</div>
                <div style={roomInfoStyle}>{room? "#" + room.roomId.substring(0, 4): "#"}</div>
            </div>
            <div style={divFlexStyle}>
                <img src={require("../../img/playerIcon.gif")} alt="" style={playerCurrenStyle}/>
                <div style={playerCurrenStyle}>{room.playerCount + "/" + room.playerLimit}</div>
                <img src={require("../../img/scoreIcon.gif")} alt="" style={scoreCurrenStyle}/>
                <div style={scoreCurrenStyle}>{0 + "/" + room.score}</div>
            </div>
        </div>
    )
}

export default Room;