import '../index.css';
import{BrowserRouter, Routes, Route, Link, useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { swAlert } from '../util/alert';

const frameStyle = {
    width:"65%",
    height:"500px",
    margin:"80px auto",
    // backgroundColor:"palegreen",
}
const innerBoxStyle = {
    width:"50%",
    margin:"50px auto 10px",
    // backgroundColor:"palegreen",
}
const divFlexStyle = {
    display: "flex",
    justifyContent: "center", 
    alignItems:"center",
    // marginTop: "20px",
}
const stick = {
    height:"300px",
    width:"0px",
    borderStyle: "solid",
    borderWidth: "0px 4px 0px 0px",
    borderColor: "black",
    marginTop: "50px",
    boxSizing: "border-box"
}
const lebelStyle = {
    width:"20%",
    textAlign:"center"
}
const inputStyle = {
    width:"190px",
    height:"40px",
    margin:"10px 10px",
    fontSize:"20px",
    textAlign:"center",
    // backgroundColor:"palegreen",
}
const buttonStyle = {
    width:"140px",
    height:"40px",
    margin:"10px 10px",
    boxSizing:"content-box",
    bottom: "10px",
    cursor: "pointer",
    // backgroundColor:"palegreen",
}
const regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

const Home = ({setUser, tmpRoomId, setTmpRoomId}) =>{
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function getUserIdAndSetUser(){
        let resData = await axios.get(`${process.env.REACT_APP_DOMAIN_URL}/api/1.0/user/userId`); 
        let userId = resData.data.userId  + "-" + userName;
        let user = {userId, userName, email, password};
        setUser(user);
    }

    async function joinGame(){
        if(userName == ""){
            swAlert("please enter your name");
            return
        }
        await getUserIdAndSetUser();

        if(tmpRoomId){
            navigate(`/game/${tmpRoomId}`);
            setTmpRoomId(null);
            return
        }

        try{
            let roomData = await axios.get(`${process.env.REACT_APP_DOMAIN_URL}/api/1.0/room/random`); 
            navigate(`/game/${roomData.data.roomId}`);
        }catch(err){
            console.log("game page: ", err.response.data);
            swAlert("not empty room, \r\n you can create a game room");
            // alert("房間已滿， \r\n請稍等一下或建立新房間。")
        }
    }

    async function goRoomList(){
        if(userName == ""){
            swAlert("please enter your name");
            // alert("請輸入暱稱");
            return
        }
        await getUserIdAndSetUser();
        if(tmpRoomId){
            navigate(`/game/${tmpRoomId}`);
            setTmpRoomId(null);
            return
        }
        navigate(`/rooms`);
    }

    async function signUp(){
        let name = userName;
        if(!name || !email || !password){
            swAlert("name, email and password are required");
            return
        }
        if(!regex.test(email)) {
            swAlert("invalid email");
            return
        }

        try{
            let data = {name, email, password}
            let resData = await axios.post(`${process.env.REACT_APP_DOMAIN_URL}/api/1.0/user/signUp`, data);
            resData = resData.data.data;
            let access_token = resData.access_token;
            window.localStorage.setItem("access_token", access_token);
            let user = {userId: resData.user.id, userName: resData.user.name, email, password};
            setUser(user);
            navigate(`/rooms/`);
        }catch(err){
            console.log("home page: ", err.response.data);
            swAlert("sigup fail");
        }
    
    }
    async function signIn(){
        if(!email || !password){
            swAlert("email and password are required");
            return
        }
        if(!regex.test(email)) {
            swAlert("invalid email");
            return
        }

        try{
            let data = {provider:"native", email, password}
            let resData = await axios.post(`${process.env.REACT_APP_DOMAIN_URL}/api/1.0/user/signIn`, data);
            resData = resData.data.data;
            let access_token = resData.access_token;
            window.localStorage.setItem("access_token", access_token);
            let user = {userId: resData.user.id, userName: resData.user.name, email, password};
            setUser(user);
            navigate(`/rooms/`);
        }catch(err){
            console.log("home page: ", err.response.data);
            swAlert("signin fail");
        }
    }
    
    return(
        <div className="frame_border" style={frameStyle}>
            <div style={{textAlign:"center", fontSize:"50px", marginTop:"40px"}}>F u n . i o</div>


            <div style={{display:"flex"}}>
                <div style={innerBoxStyle}>
                    <div style={divFlexStyle}>
                        <img src="https://avatars.dicebear.com/api/male/john.svg?mood[]=happy&mood[]=sad" style={{width:"100px", height:"100px", margin:"20px"}}></img>
                    </div>
                    <div style={divFlexStyle}>
                        <label>nickname </label>
                        <input className="component_border" maxLength="20" type="text" style={inputStyle} onChange={(e)=>setUserName(e.target.value)}  placeHolder="enter nickname"/>
                    </div>
                    <div style={divFlexStyle}>
                        {/* <Link to="/rooms"> */}
                            <button  className="component_border" style={buttonStyle} onClick={goRoomList}>GAME ROOM</button>
                        {/* </Link> */}
                        {/* <Link to="/game"> */}
                            <button  className="component_border" style={buttonStyle} onClick={joinGame} >PLAY</button>
                        {/* </Link> */}
                    </div>                    
                </div>

                <div style={stick}></div>

                <div style={innerBoxStyle}>
                    <div style={divFlexStyle} >
                        <input  className="component_border" maxLength="30" type="email" style={inputStyle} placeHolder="enter name"/>
                    </div> 
                    <div style={divFlexStyle} >
                        <label style={lebelStyle}>e-mail </label>
                        <input  className="component_border" maxLength="30" type="email" style={inputStyle} onChange={(e)=>setEmail(e.target.value)} placeHolder="enter email" />
                    </div>
                    <div style={divFlexStyle} >
                        <label style={lebelStyle} >password </label>
                        <input  className="component_border" maxLength="30" type="password" style={inputStyle} onChange={(e)=>setPassword(e.target.value)} placeHolder="enter password" />
                    </div> 
                    <div style={divFlexStyle}>
                        {/* <Link to="/rooms"> */}
                            <button onClick={signIn} className="component_border" style={buttonStyle}>SIGN IN</button>
                        {/* </Link> */}
                        {/* <Link to="/rooms"> */}
                            <button onClick={signUp} className="component_border" style={buttonStyle}>SIGN UP</button>
                        {/* </Link> */}
                    </div>
                </div>
            </div>
            
        </div>
               
    )
}

export default Home