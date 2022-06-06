import '../../index.css';
import React, { useState, useEffect, Component, useRef, Fragment } from 'react';

const chatFrameStayle = {
    width:"90%",
    height:"75%",
    margin:"5px auto 2px",
    overflow:"auto",
}

const chatBannerStyle = {
    width:"130px",
    height:"40px",
    backgroundColor:"white",
    top: "-25px",
    right:"30px",
    zIndex:"1",
    position:"absolute",
    textAlign:"center",
    verticalAlign:"center",
    lineHeight:"40px",
    fontSize:"20px" ,
    fontWeight:"600"
}

const chatInputStayle = {
    width:"91%",
    height:"25px",
    margin: "0px 5px 2px 10px",
}

const bingoStyle = {
    color: "#2376DD",
    fontWeight: "600",
}


const AnswerRoom = ({socket, riddle, user, room, isDrawFinish, isDrawingRef, isShowRank, BREAK_DURATION, RANK_DURATION}) => {
    const [message, setMessage] = useState({name:user.userName, text:""});
    const [chat, setChat] = useState([]);
    const [isBingo, setIsBingo] = useState(false);
    const [isInputPause, setisInputPause] = useState(false);
    const chatRef = useRef(null)

    useEffect(() => {
        socket.on("message", (message) => {
            setChat((pre) => {
                return [...pre, message]
            })
            chatRef.current.scrollIntoView();
        })

        return () => {
            socket.off("message"); 
        }
    }, [])

    useEffect(() => {
        if(isDrawFinish){
            setisInputPause(true);
            setChat([]);
            setIsBingo(false);
            setTimeout(()=>{
                setisInputPause(false);
            }, BREAK_DURATION * 1000)
        }
    }, [isDrawFinish])
    useEffect(() => {
        if(isShowRank){
            setisInputPause(true);
            setChat([]);
            setIsBingo(false);
            setTimeout(()=>{
                setisInputPause(false);
            }, RANK_DURATION * 1000)
        }
    }, [isShowRank])


    function onTextChange(e){
        setMessage({name:user.userName, text: e.target.value});
    }

    function sendMessage(e) {
        e.preventDefault();
        socket.emit("message", {message, room})
        console.log("socket.emit message", room)
        if(message.text == riddle){
            setIsBingo(true);
            socket.emit("bingo", room)
            console.log("socket.emit bingo", room)
        }
        setMessage({name:user.userName, text:""})
    }

    
    const renderChat = () => {
        return chat.map(({name, text}, index) => {
            if(text == riddle){
                return <div key={index} style={bingoStyle}>{name}: ✔ 答對了!</div>
            }
            return <div key={index}>{name}: {text}</div>
        })
    }

    return(
        <React.Fragment>
            <div style={chatBannerStyle} className="frame_border">ANSWER</div>
            <div  style={chatFrameStayle}>
                {renderChat()}
                <div ref={chatRef}></div>
            </div>
            <form onSubmit={sendMessage}>
                {isDrawingRef.current 
                    ?<input disabled={true} onChange={onTextChange} style={chatInputStayle} value={message.text} className="answer_input"  type="text" name="answer"  placeholder="開始你的繪畫"  maxLength="100" ></input>
                    :isInputPause
                    ?<input disabled={true} onChange={onTextChange} style={chatInputStayle} value={message.text} className="answer_input"  type="text" name="answer"  placeholder="即將開始下回合"  maxLength="100" ></input>
                    :isBingo
                    ?<input disabled={true} onChange={onTextChange} style={chatInputStayle} value={message.text} className="answer_input"  type="text" name="answer"  placeholder="恭喜你答對了"  maxLength="100" ></input>
                    :<input onChange={onTextChange} style={chatInputStayle} value={message.text} className="answer_input"  type="text" name="answer"  placeholder="請輸入你的答案"  maxLength="100" ></input>
                }
            </form>
        </React.Fragment>
    )

}


export default AnswerRoom;