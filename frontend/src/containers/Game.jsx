import '../index.css';
import{BrowserRouter, Routes, Route, Link, useParams, useNavigate} from 'react-router-dom';
import React, { useState, useEffect, Component, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useInsertionEffect } from 'react';
import Draw from '../components/game/Draw';
import Timer from '../components/game/Timer';
import AnswerRoom from '../components/game/AnswerRoom';
import ChatRoom from '../components/game/ChatRoom';


const frameStyle = {
    width:"70%",
    height:"600px",
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
const drawStyle = {
    position:"relative",
    height:"400px",
    margin:"5px",
    // backgroundColor:"paleturquoise",
    boxSizing: "border-box",
}
const ChatStyle = {
    width:"50%",
    height:"200px",
    margin:"5px",
    overflow:"auto",
    // backgroundColor:"paleturquoise",
    boxSizing:"border-box",
}
const playerListStyle = {
    width:"30%",
    height:"600px",
    margin:"5px",
    overflow: "auto",
    // backgroundColor:"paleturquoise",
    boxSizing: "border-box",
}
const playerStyle = {
    width:"90%",
    height:"75px",
    margin:"5px auto",
    // backgroundColor:"",
}
const avatarStyle = {
    width:"90px",
    height:"70px",
    backgroundImage: "url(/../img/general.gif)",
}
const playerInfoStyle = {
    fontSize:"16px",
    fontWeight:"600",
    // color:"#138FE8",
    width:"100%",
    height:"20px",
    overflow:"hidden",
}

const ROUND_DURATION = 30;
const CHOICE_DURATION = 10;
const MISS_DURATION = 8;
const BREAK_DURATION = 10;
const RANK_DURATION = 20;
const BONUS = 3

const Game = ({socket, user}) =>{
    // const [socket, setSocket] = useState(null);
    const [canSocketInit, setCanSocketInit] = useState(false)
    const [playerList, setPlayerList] = useState([]);
    const [avatar, setAvatar] = useState(["happy","haha","cry","kiss","wink","bored","neutro","cold","sob","kookoo","surprise","wow","angry","sleep","cynical",]);
    const [gameInfo, setGameInfo] = useState(null);
    
    const [score, setScore] = useState(0);
    const [duration, setDuration] = useState(ROUND_DURATION);
    const [isYourTurn, setIsYourTurn] = useState(false);
    const [riddle, setRiddle] = useState(null);
    const [isStart, setIsStart] = useState(false);
    const [round, setRound] = useState(0);
    const [isMiss, setIsMiss] = useState(false);
    const [isTimesUp, setIsTimesUp] = useState(false);
    const [isDrawFinish, setIsDrawFinish] = useState(false);
    const [isShowRank, setIsShowRank] = useState(false);
    const [rankList, setRankList] = useState([]);
    const isDrawingRef = useRef(false);  //只有drawUser會true
    const bingoCountRef = useRef(0)


    const {roomId}  = useParams();
    const navigate = useNavigate();
    
    // console.log("socket.id:", socket.id);
    // console.log("playerList:", playerList);
    useEffect(() => {
        async function gameInit(){
            // if(!user.userId){
            //     alert("請設定暱稱")
            //     navigate("/")
            // }

            // window.onbeforeunload =  function (e) {
            //     console.log("bbbbbb")
            //     alert("bbbbbb")
            // };

            // window.addEventListener("visibilityState", function(){
            //     console.log("eeeeeee")
            //     alert("eeeeeee")
            // })
            // window.addEventListener("popstate", function(){
            //     console.log("popstate")
            //     alert("popstate")
            // })
            try{
                let resData = await axios.get(`http://localhost:3000/api/1.0/room/${roomId}`);
                let gameRoom = resData.data;
                if(gameRoom.playerCount >= gameRoom.playerLimit){
                    alert("人數已滿");
                    navigate("/rooms")
                    return;
                }
                // if(gameRoom.isStart){
                //     alert("遊戲已開始\n請選擇其他房間");
                //     navigate("/rooms")
                //     return;
                // }
                let newPlayerList = gameRoom.playerList.filter((player) => player.userId != user.userId);
                user.score = 0;
                newPlayerList.push(user);
                gameRoom.playerList = newPlayerList;
                gameRoom.currUserId = user.userId;  //記錄此client的使用者 當要刪掉時很好用
                gameRoom.holder = newPlayerList[0];

                //第0 round holder先
                // if(round == 0 && newPlayerList[0].userId == user.userId){
                //     gameRoom.drawUser = user;
                //     setIsYourTurn(true)
                // }
                setPlayerList(newPlayerList);
                setGameInfo(gameRoom);
                setCanSocketInit(true);

            } catch (err) {
                console.log("game page: room not exit", err);
                navigate("/")
                return;
            }
        } 
        gameInit();
    },[]);

    // useEffect(() => {
    //     console.log("1111111111111")
    //     if(!canSocketInit){
    //         console.log("canSocketInit:", canSocketInit)
    //         return;
    //     }

    //     socket.on("playerJoin", (room) => {
    //         setPlayerAndGame(room);
    //         console.log("plyerJoin", room.playerList)
    //     })

    //     // TODO emit 來的room不是完整的  //玩家離開後holder drawer的影響
    //     socket.on("playerLeave", (room) => {
    //         console.log("plyerLeave1",room);

    //         setPlayerList((pre) => {
    //             console.log("plyerLeave2",pre);
    //             let newPlayerList = JSON.parse(JSON.stringify(pre));
    //             newPlayerList = newPlayerList.filter((player) => player.userId != room.currUserId)
    //             gameInfo.playerList = newPlayerList;
    //             gameInfo.playerCount = newPlayerList.length;
    //             setGameInfo({...gameInfo});
    //             return newPlayerList;
    //         });
    //     })
    //     socket.on("gameStart", (room) => {
    //         setIsStart(true);
    //         setDuration(ROUND_DURATION);
    //         if(room.drawUser.userId == gameInfo.currUserId){
    //             setIsYourTurn(true);
    //         }
    //         setPlayerAndGame(room);
    //         console.log("socket.on gameStart", room.drawUser)
    //     })
    //     socket.on("gameRiddle", (room) => {
    //         setRiddle(room.riddle);
    //         console.log("socket.on gameRiddle", room.riddle)
    //     })
    //     socket.on("missRound", (room) => {
    //         setPlayerAndGame(room);
    //         setIsMiss(true);
    //         setDuration(MISS_DURATION);
    //         console.log("socket.on missRound", room.drawUser)
    //     })
    //     socket.on("nextRound", (room) => {
    //         console.log("socket.on nextRound", room);
    //         bingoCountRef.current = 0;  //breakView後在設為0 如果在finishRoud設可能會顯示missView
    //         let lastPlayerList = room.playerList;
    //         let drawUserIndex = 0;
    //         //找出下一 round user
    //         for(let i = 0; i < lastPlayerList.length; i++){
    //             if(lastPlayerList[i].userId == room.drawUser.userId){
    //                 drawUserIndex = (i + 1) % lastPlayerList.length;
    //                 break;
    //             }
    //         }
    //         room.drawUser = lastPlayerList[drawUserIndex];
    //         room.isStart = true;
    //         setPlayerAndGame(room);
    //         if(user.userId == lastPlayerList[drawUserIndex].userId){
    //             socket.emit("gameStart", room);
    //             console.log("socket.emit gameStart", room)
    //         }
    //     })
    //     socket.on("finishRound", (room) => {
    //         setRiddle(null);
    //         let rank = [...room.playerList];
    //         rank.sort(function(a, b){
    //             return b.score - a.score
    //         })
    //         setRankList(rank);
    //         if(rank[0].score >= room.score){
    //             setIsShowRank(true);
    //             return;
    //         }

    //         setPlayerAndGame(room);
    //         setIsDrawFinish(true);
    //         setDuration(BREAK_DURATION);
    //         console.log("socket.on finishRound", room.drawUser);
    //     })

    //     socket.on("bingo", (room) => {
    //         bingoCountRef.current += 1;
    //         //計分10至1  //畫者得3分
    //         let point = 11 - bingoCountRef.current;
    //         point = point > 0? point: 1

    //         for(let player of room.playerList){
    //             if(player.userId == room.currUserId){
    //                 player.score = player.score? (player.score + point): point;
    //             }
    //             if(player.userId == room.drawUser.userId){
    //                 player.score = player.score? (player.score + BONUS): BONUS;
    //             }
    //         }
    //         setPlayerAndGame(room);

    //         if(gameInfo.currUserId == room.currUserId){
    //             setScore(pre => pre + point);
    //         } 
    //         if(gameInfo.currUserId == room.drawUser.userId){
    //             setScore(pre => pre + BONUS);
    //         }

    //         //判斷是否進入下一回合
    //         if(bingoCountRef.current < room.playerList.length - 1){
    //             return;
    //         }
    //         if(isDrawingRef.current){
    //             setIsYourTurn(false);
    //             isDrawingRef.current = false;
    //             socket.emit("finishRound", room);  //注意要emit room 因為丟gameInfo會丟到當初on時舊的的狀態
    //             console.log("socket.emit finishRound", room);
    //         }
    //         console.log("socket.on bingo", bingoCountRef.current);
    //     })

    //     socket.emit("joinGame", gameInfo); //發送給roomlist
    //     console.log("socket emit joinGame:",gameInfo)


    //     return () => {
    //         socket.off("playerJoin");
    //         socket.off("plyerLeave");
    //         socket.off("gameStart");
    //         socket.off("gameRiddle");
    //         socket.off("missRound");
    //         socket.off("nextRound");
    //         socket.off("finishRound");
    //         socket.off("bingo");
    //         socket.emit("leaveGame", gameInfo); //按上一頁會觸發(因為按上一頁socket不會斷)
    //     }
    // },[canSocketInit])

    // //控制Rank 出現20秒
    // useEffect(() => {
    //     if(isShowRank){
    //         setTimeout(() => {
    //             bingoCountRef.current = 0;
    //             setIsShowRank(false);
    //             setRankList([]);
    //             setIsStart(false);

    //             let newRoom = {...gameInfo}
    //             let newPlaylerList = [...gameInfo.playerList]
    //             for(let i = 0; i < newPlaylerList.length; i++){
    //                 newPlaylerList[i].score = 0;
    //             }
    //             newRoom.playerList = newPlaylerList;
    //             setGameInfo(newRoom);
    //         }, RANK_DURATION * 1000)  
    //     }
    // }, [isShowRank])
    
    // //控制是否emit missRound,進而出現miss畫面
    // useEffect(() => {
    //     if(isYourTurn){
    //         setTimeout(() => {
    //             if(!isDrawingRef.current && bingoCountRef.current == 0){
    //                 setIsYourTurn(false);
    //                 socket.emit("missRound", gameInfo);
    //                 console.log("socket.emit missRound")
    //             }
    //         }, CHOICE_DURATION * 1000)
    //     }
    // },[isYourTurn])

    // //missView 8秒後 進下一round
    // useEffect(() => {
    //     if(isMiss){
    //         setTimeout(() => {
    //             setIsMiss(false);
    //             //統一由drawUser通知  //TODO 萬一此user離開
    //             if(user.userId == gameInfo.drawUser.userId){
    //                 socket.emit("nextRound", gameInfo);
    //                 console.log("socket.emit nextRound", gameInfo)
    //             }
    //         }, MISS_DURATION * 1000)
    //     }
    // },[isMiss])

    // //畫完後由drawUser emit roundFinish 進而出現break畫面
    // useEffect(() => {
    //     //只有drawUser 此時isDrawingRef是true
    //     if(isDrawingRef.current){
    //         setIsYourTurn(false);
    //         isDrawingRef.current = false;
    //         socket.emit("finishRound", gameInfo);
    //     }
    //    setIsTimesUp(false)
    // }, [isTimesUp])

    // //breakView 10秒後 進下一round
    // useEffect(() => {
    //     if(isDrawFinish){
    //         setTimeout(() => {
    //             setIsDrawFinish(false);
    //             //統一由drawUser通知  //TODO 萬一此user離開
    //             if(user.userId == gameInfo.drawUser.userId){
    //                 socket.emit("nextRound", gameInfo);
    //                 console.log("socket.emit nextRound", gameInfo)
    //             }
    //         }, BREAK_DURATION * 1000)  
    //     }
    // },[isDrawFinish])



    const waitingStartView = () => {
        const startButtonStyle = {
            position:"absolute",
            left: "250px",
            top:"150px",
            width:"200px",
            height:"40px",
            margin:"10px 10px",
            boxSizing:"content-box",
            bottom: "10px",
            cursor: "pointer",
            // backgroundColor:"palegreen",
        }

        if(!gameInfo){
            return
        }

        if(isStart){
            return
        }

        let holderId =  gameInfo.holder.userId;
        let currUserId = user.userId;

        if(holderId == user.userId && playerList.length <= 1){
            return(
                <div style={startButtonStyle}>等待其他玩家加入...</div>
            );
        }
        if(holderId == user.userId && playerList.length > 1){
            return(
                <div style={startButtonStyle}>
                    <div>其他玩家等你開始...</div>
                    <button onClick={goStart} style={{width:"150px", height:"40px",margin:"20px 0px"}} className="component_border">開始</button>
                </div>
                
            )
        }
        if(holderId != user.userId){
            return(
                <div style={startButtonStyle}>等待房主開始...</div>
            );
        }
        
    }

    const choiceView = () => {
        const riddleFlexStyle = {
            position:"absolute",
            left: "130px",
            top:"150px",
            display: "flex",
            justifyContent: "center", 
            alignItems:"center",
            // marginTop: "20px",
        }

        const riddleButtonStyle = {
            width:"150px",
            height:"40px",
            margin:"10px 10px",
            boxSizing:"content-box",
            bottom: "10px",
            cursor: "pointer",
            // backgroundColor:"palegreen",
        }
        let riddleList = ["窗戶","桌子","椅子","門","電腦","滑鼠"];
        let randomCount = Math.round(Math.random() * 1000);
        if(!isStart){
            return;
        }
        if(!isYourTurn){
            return;
        }
        console.log("=====================", isDrawingRef.current, riddle)
        if(isDrawingRef.current){
            return;
        }

        return(
            <div style={riddleFlexStyle}>
                <button onClick={chooseRiddle} className="component_border" style={riddleButtonStyle}>{riddleList[randomCount % 6]}</button>
                <button onClick={chooseRiddle} className="component_border" style={riddleButtonStyle}>{riddleList[(randomCount + 1) % 6]}</button>
            </div>
        )
       
    }

    const missView = () => {
        const startButtonStyle = {
            position:"absolute",
            left: "250px",
            top:"150px",
            width:"200px",
            height:"40px",
            margin:"10px 10px",
            boxSizing:"content-box",
            bottom: "10px",
            cursor: "pointer",
            // backgroundColor:"palegreen",
        }
        if(isMiss){
            return(
                <div style={startButtonStyle}>{gameInfo.drawUser.userName}錯過他的回合...</div>
            )
        }
    }

    const breakiView = () => {
        const breakStyle = {
            position:"absolute",
            left: "250px",
            top:"150px",
            width:"300px",
            height:"40px",
            margin:"10px 10px",
            bottom: "10px",
            cursor: "pointer",
            // backgroundColor:"palegreen",
        }
        if(isDrawFinish){
            return(
                <div style={breakStyle}>
                    {bingoCountRef.current >= playerList.length - 1
                        ?<div style={{margin:"5px auto"}}>太棒了! 大家都答對了</div>
                        :<div style={{margin:"5px 20px"}}>謎底是: {riddle}</div>
                    }
                    <div style={{margin:"5px auto"}}>下回合即將開始...</div>
                </div>
            )
        }
    }

    const rankView = () => {
        const rankStyle = {
            position:"absolute",
            left: "240px",
            top:"30px",
            width:"400px",
            height:"100px",
            margin:"10px 10px",
        }
        const rankPlayerStyle = {
            margin:"10px ",
        }
        const rankImgStyle = {
            width:"150px",
            height:"130px",
            margin:"10px 0px",
        }
        if(isShowRank){
            return(
                <div style={rankStyle}>
                    <div style={rankPlayerStyle}>第一名 {rankList[0]?rankList[0].userName:"從缺"}</div>
                    <div style={rankPlayerStyle}>第二名 {rankList[1]?rankList[1].userName:"從缺"}</div>
                    <div style={rankPlayerStyle}>第三名 {rankList[2]?rankList[2].userName:"從缺"}</div>
                    <img style={rankImgStyle} src={require("../img/rank.png")}></img>
                </div>
            )
        }
    }

    function  goStart(e){
        gameInfo.isStart = true;
        gameInfo.drawUser = user;
        socket.emit("gameStart", gameInfo);
        console.log("socket.emit gameStart");
    }
    function chooseRiddle(e){
        let riddle = e.target.innerHTML;
        isDrawingRef.current = true;
        console.log("isDrawingRef.current=========",isDrawingRef.current)
        setRiddle(riddle);
        gameInfo.riddle= riddle;
        socket.emit("gameRiddle", gameInfo);
        console.log("socket.emit gameRiddle", riddle);
    }
    // function setPlayerAndGame(room){
    //     //update playerList
    //     setPlayerList(room.playerList);

    //     //update gameInfo
    //     let newGameInfo = JSON.parse(JSON.stringify(gameInfo));
    //     newGameInfo.playerList = room.playerList;
    //     newGameInfo.playerCount = room.playerList.length;
    //     newGameInfo.currUserId = user.userId;
    //     newGameInfo.holder = room.playerList[0];
    //     newGameInfo.drawUser = room.drawUser
    //     setGameInfo(newGameInfo);
    //     console.log("newGameInfo", newGameInfo)
    // }
    

    return (
        <div style={frameStyle} >
            <div style={divFlexStyle} >
                <div style={playerListStyle} className="frame_border">
                    
                {playerList.map((player) => {
                        return <div key={player.userId} style={playerStyle} className="component_border">
                                    <div style={divFlexStyle} >
                                        <img style={avatarStyle} src={require(`../img/${avatar[Math.floor(Math.random()*15)]}.gif`)} /*</div>className="component_border"*/></img>
                                        <div style={{width:"50%"}}>
                                            <div style={playerInfoStyle} /*className="component_border"*/ >{player.userName}</div>
                                            <div style={playerInfoStyle} /*className="component_border"*/ >得分 {player.score || 0}</div>
                                        </div>
                                    </div>
                                </div>
                    })}

                </div>

                <div style={{width:"700px", heigh:"600px"}}>
                    <div style={drawStyle} className="frame_border">
                        {waitingStartView()}
                        {!isDrawingRef.current? choiceView(): <></>}
                        {missView()}
                        {breakiView()}
                        {rankView()}
                        <Draw isShowRank={isShowRank} isDrawingRef={isDrawingRef} isDrawFinish={isDrawFinish} isYourTurn={isYourTurn} socket={socket}></Draw>
                        {isStart? <Timer setIsTimesUp={setIsTimesUp} isDrawingRef={isDrawingRef} duration={duration}/>: <></>}
                    </div>
                    <div style={divFlexStyle} >
                        <div style={ChatStyle} className="frame_border">
                            <AnswerRoom isShowRank={isShowRank} isDrawingRef={isDrawingRef} isDrawFinish={isDrawFinish} room={gameInfo} socket={socket} user={user} riddle={riddle}/>
                        </div>
                        <div style={ChatStyle}  className="frame_border">
                            <ChatRoom room={gameInfo} socket={socket} user={user}/>
                        </div>    
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Game;