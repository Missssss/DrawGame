import '../index.css';
import{BrowserRouter, Routes, Route, Link, useNavigate} from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


const frameStyle = {
    width:"40%",
    height:"500px",
    margin:"50px auto",
    // backgroundColor:"palegreen",
}
const divFlexStyle = {
    display: "flex",
    justifyContent: "center", 
    alignItems:"center",
    // borderWidth:"1px"
    // marginTop: "20px",
}
const lebelStyle = {
    width:"15%",
    textAlign:"center"
}
const inputStyle = {
    width:"200px",
    height:"40px",
    margin:"10px 10px",
    fontSize:"20px",
    textAlign:"center",
    boxSizing:"content-box",
    // backgroundColor:"palegreen",
}
const buttonStyle = {
    width:"150px",
    height:"40px",
    margin:"40px 10px",
    boxSizing:"content-box",
    bottom: "10px",
    cursor: "pointer",
    // backgroundColor:"palegreen",
}

const Create = ({setRoomInfo, socket}) =>{
    const [mode, setMode] = useState("general");
    const [theme, setTheme] = useState("general");
    const [playerLimit, setPlayerLimit] = useState(5);
    const [score, setScore] = useState(20);

    const navigate = useNavigate();
    async function createRoom(){
        let resData = await axios.post(`${process.env.REACT_APP_DOMAIN_URL}/api/1.0/room`, {mode, theme, playerLimit, score})
        let roomInfo = resData.data; 
        setRoomInfo(roomInfo);

        socket.emit("createRoom", roomInfo);
        console.log(`createRoom: ${roomInfo.roomId}`)
        navigate(`/game/${roomInfo.roomId}`)
    }
    
    useEffect(() => {
        console.log("changeSetting")
    },[mode, theme, playerLimit, score])

    return (
        <div style={frameStyle} className="frame_border" >
            <div style={{textAlign:"center", fontSize:"40px", margin:"30px auto 30px"}}>配置</div>
            
            <div style={divFlexStyle}>
                <label style={lebelStyle}>遊戲模式</label>
                <select disabled style={inputStyle} className="component_border" onChange={(e)=>setMode(e.target.value)}>
                    <option disabled>請選擇模式</option>
                    <option value="general">普通模式</option>
                    <option value="double" disabled>雙人模式</option>
                </select>
            </div>
            <div style={divFlexStyle}>
                <label style={lebelStyle}>主題</label>
                <select disabled style={inputStyle} className="component_border" onChange={(e)=>setTheme(e.target.value)}>
                    <option disabled>請選擇主題</option>
                    <option value="general">綜合</option>
                    <option value="animal" disabled>動物</option>
                    <option value="food" disabled>食物</option>
                </select>
            </div>
            <div style={divFlexStyle}>
                <label style={lebelStyle}>人數上限</label>
                <select  style={inputStyle} className="component_border" onChange={(e)=>setPlayerLimit(e.target.value)}>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                </select>
            </div>
            <div style={divFlexStyle}>
                <label style={lebelStyle}>目標分數</label>
                <select  style={inputStyle} className="component_border" onChange={(e)=>setScore(e.target.value)}>
                    <option value="50">50</option>
                    <option value="70">70</option>
                    <option value="100">100</option>
                    <option value="120">120</option>
                    <option value="150">150</option>
                    <option value="180">180</option>
                    <option value="200">200</option>
                    <option value="250">250</option>
                </select>
            </div>

            <div style={divFlexStyle}>
                {/* <Link to={"/game/"+"roomId"} > */}
                    <button onClick={createRoom} className="component_border" style={buttonStyle}>開始遊戲</button>
                {/* </Link> */}
            </div>
            
        </div>
    )
}

export default Create;