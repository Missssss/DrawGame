import '../../index.css';
import React, { useState, useEffect, Component, useRef, Fragment } from 'react';

const chatFrameStayle = {
    width:"90%",
    height:"75%",
    margin:"5px auto 2px",
    overflow:"auto",
}

const chatInputStayle = {
    width:"91%",
    height:"25px",
    margin: "0px 5px 2px 10px",
}

const chatStyle = {
    color: "#49C628", //#54E87C
    // fontWeight: "600",
}


const ChatRoom = ({socket, riddle, user, room}) => {
    // const [message, setMessage] = useState({name:user.userName, text:""});
    // const [chat, setChat] = useState([]);
    // const chatRef = useRef(null)

    // useEffect(() => {
    //     socket.on("chat", (message) => {
    //         setChat((pre) => {
    //             return [...pre, message]
    //         })
    //         chatRef.current.scrollIntoView();
    //     })

    //     return () => {
    //         socket.off("chat");
    //     }
    // }, [])


    // function onTextChange(e){
    //     setMessage({name:user.userName, text: e.target.value});
    // }

    // function sendMessage(e) {
    //     e.preventDefault();
    //     socket.emit("chat", {message, room})
    //     setMessage({name:user.userName, text:""})
    // }

    
    // const renderChat = () => {
    //     return chat.map(({name, text}, index) => {
    //         return <div key={index} style={chatStyle}>{name}: {text}</div>
    //     })
    // }

    return(
        <React.Fragment>
            <div  style={chatFrameStayle}>
                {renderChat()}
                <div ref={chatRef}></div>
            </div>
            <form onSubmit={sendMessage}  >
                <input onChange={onTextChange} style={chatInputStayle} value={message.text} className="answer_input"  type="text" name="answer"  placeholder="發送訊息"  maxLength="100" ></input>
            </form>
        </React.Fragment>
    )

}


export default ChatRoom;