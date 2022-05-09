import '../index.css';
import{BrowserRouter, Routes, Route, Link, useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import axios from 'axios';

const frameStyle = {
    width:"70%",
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
    width:"200px",
    height:"40px",
    margin:"10px 10px",
    fontSize:"20px",
    textAlign:"center",
    // backgroundColor:"palegreen",
}
const buttonStyle = {
    width:"150px",
    height:"40px",
    margin:"10px 10px",
    boxSizing:"content-box",
    bottom: "10px",
    cursor: "pointer",
    // backgroundColor:"palegreen",
}

const Home = ({setUser}) =>{
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
            alert("請輸入暱稱");
            return
        }
        await getUserIdAndSetUser();
        try{
            let roomData = await axios.get(`${process.env.REACT_APP_DOMAIN_URL}/api/1.0/room/random`); 
            navigate(`/game/${roomData.data.roomId}`);
        }catch(err){
            console.log("game page: ", err.response.data);
            alert("房間已滿， \r\n請稍等一下或建立新房間。")
        }
    }

    async function goRoomList(){
        if(userName == ""){
            alert("請輸入暱稱");
            return
        }
        await getUserIdAndSetUser();
        navigate(`/rooms`);
    }
    

    return(
        <div className="frame_border" style={frameStyle}>
            <div style={{textAlign:"center", fontSize:"40px", marginTop:"40px"}}>Fun.io</div>


            <div style={{display:"flex"}}>
                <div style={innerBoxStyle}>
                    <div style={divFlexStyle}>
                        <img src="https://avatars.dicebear.com/api/male/john.svg?mood[]=happy&mood[]=sad" style={{width:"100px", height:"100px", margin:"20px"}}></img>
                    </div>
                    <div style={divFlexStyle}>
                        <label>暱稱 </label>
                        <input className="component_border" type="text" style={inputStyle} onChange={(e)=>setUserName(e.target.value)} />
                    </div>
                    <div style={divFlexStyle}>
                        {/* <Link to="/rooms"> */}
                            <button  className="component_border" style={buttonStyle} onClick={goRoomList}>房間</button>
                        {/* </Link> */}
                        {/* <Link to="/game"> */}
                            <button  className="component_border" style={buttonStyle} onClick={joinGame} >快速加入</button>
                        {/* </Link> */}
                    </div>                    
                </div>

                <div style={stick}></div>

                <div style={innerBoxStyle}>
                    <div style={divFlexStyle} >
                        <input  className="component_border" type="email" style={inputStyle}/>
                    </div> 
                    <div style={divFlexStyle} >
                        <label style={lebelStyle}>e-mail </label>
                        <input  className="component_border" type="email" style={inputStyle} onChange={(e)=>setEmail(e.target.value)} />
                    </div>
                    <div style={divFlexStyle} >
                        <label style={lebelStyle} >password </label>
                        <input  className="component_border" type="email" style={inputStyle} onChange={(e)=>setPassword(e.target.value)} />
                    </div> 
                    <div style={divFlexStyle}>
                        <Link to="/rooms">
                            <button className="component_border" style={buttonStyle}>sign in</button>
                        </Link>
                        <Link to="/rooms">
                            <button className="component_border" style={buttonStyle}>sign up</button>
                        </Link>
                    </div>
                </div>
            </div>
            
        </div>
               
    )
}

export default Home