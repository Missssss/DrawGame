import '../../index.css';
import '../../css/draw.css';
import io from 'socket.io-client';
import{BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import eraser from '../../img/eraser.png'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import Timer from './Timer'



let startPointX, startPointY, endPointX, endPointY;
let CANVAS_STAGES = [];
const Draw = ({socket, isDrawingRef, isDrawFinish, isShowRank, isYourTurn}) => {
    let canvasRef = useRef(null);
    let ctx = useRef(null);
    let canvas = canvasRef.current;
   
    useEffect(() => {
        canvasInit();
        canvas.addEventListener("mousedown", downHandler)

        //-------監聽事件
        socket.on("draw", function(value){
            // console.log(value)
            let {startPointX, startPointY, endPointX, endPointY} = value
            ctx.current.beginPath();
            ctx.current.moveTo(startPointX, startPointY);
            ctx.current.lineTo(endPointX, endPointY);
            ctx.current.stroke();
        })
        socket.on("recordStage", function(value){
            CANVAS_STAGES.push(ctx.current.getImageData(0, 0, canvas.width, canvas.height))
        })
        socket.on("changeColor", function(value){
            ctx.current.strokeStyle = value;
        })
        socket.on("changeLineWidth", function(value){
            ctx.current.lineWidth = value;
        })
        socket.on("clearCanvas", function(value){
            ctx.current.clearRect(0, 0, canvas.width, canvas.height);
            CANVAS_STAGES = [];
        })
        socket.on("undo", function(value){
            let index = CANVAS_STAGES.length - 1
            if(index < 0){
                return;
            }

            if(index == 0){
                ctx.current.clearRect(0, 0, canvas.width, canvas.height)
            }else{
                CANVAS_STAGES.pop(); 
                ctx.current.putImageData(CANVAS_STAGES[index-1], 0, 0);
            }
        })
    }, [])

    useEffect(() => {
        if(isYourTurn){
            canvasInit();
        }
    }, [isYourTurn]);
    useEffect(() => {
        if(isDrawFinish){
            clearCanvas();
            canvasInit();
        }
    }, [isDrawFinish]);
    useEffect(() => {
        if(isShowRank){
            clearCanvas();
            canvasInit();
        }
    }, [isShowRank]);



    function canvasInit() {
        canvas = canvasRef.current;
        canvas.width = 680;  
        canvas.height = 315; 

        let contex = canvas.getContext("2d");
        ctx.current = contex;
        let DRAW_COLOR = "black"; 
        let DRAW_WIDTH = "3";
        ctx.current.strokeStyle = DRAW_COLOR;
        ctx.current.lineWidth = DRAW_WIDTH;
        ctx.current.lineCap = "round";
        ctx.current.lineJoin = "round"
    }
    
    //-------mouse事件
    function downHandler(e){
        //isYourTurn and 選完謎底後才能畫
        if(!isDrawingRef.current){
            return;
        }
        // 滑鼠按下去時得到座標存在變數中作為等等畫圖的起點
        startPointX = e.offsetX;
        startPointY = e.offsetY;
        canvas.addEventListener("mousemove", moveHandler);
        canvas.addEventListener("mouseup", stopHandler);
        canvas.addEventListener("mouseout", stopHandler);
    };
    
    // let ww = 0;
    // let hh = 0;
    function moveHandler(e) {
        if(!isDrawingRef.current){
            return;
        }
        // 滑鼠在移動時我們把新的座標存下來作為終點
        endPointX = e.offsetX;
        endPointY = e.offsetY;
    
        // 畫圖四步驟
        ctx.current.beginPath();
        ctx.current.moveTo(startPointX, startPointY);
        ctx.current.lineTo(endPointX, endPointY);
        ctx.current.stroke();
        socket.emit("draw", {startPointX, startPointY, endPointX, endPointY})
    
        // 把終點改為新的起點
        startPointX = endPointX;
        startPointY = endPointY;
        
    };
    function stopHandler(e){
        canvas.removeEventListener("mousemove", moveHandler);
        canvas.removeEventListener("mouseup", stopHandler);
        canvas.removeEventListener("mouseout", stopHandler);
    
        //每個步驟都記錄下來
        CANVAS_STAGES.push(ctx.current.getImageData(0, 0, canvas.width, canvas.height))
        socket.emit("recordStage");
    };

    function changeColor(e){
        let color = e.target.style.backgroundColor || e.target.value || "white";
        ctx.current.strokeStyle = color;
        console.log("changeColor", color)
        socket.emit("changeColor", color)
    }
    function changeLineWidth(e){
        let lineWidth = e.target.value;
        ctx.current.lineWidth = lineWidth
        socket.emit("changeLineWidth", lineWidth)
    }
    function clearCanvas(){
        ctx.current.clearRect(0, 0, canvas.width, canvas.height);
        CANVAS_STAGES = [];
        socket.emit("clearCanvas");
    }
    function undo(){   
        let index = CANVAS_STAGES.length - 1
        if(index < 0){
            return;
        }

        if(index == 0){
            ctx.current.clearRect(0, 0, canvas.width, canvas.height)
        }else{
            CANVAS_STAGES.pop(); 
            ctx.current.putImageData(CANVAS_STAGES[index-1], 0, 0);
        }
        socket.emit("undo");
    }


    return(
        <React.Fragment>
            <canvas id="draw" ref={canvasRef}></canvas>
            
            {isDrawingRef.current?
                <div className="tools">
                    <button onClick={clearCanvas} type="button" className="clear"></button>
                    <button onClick={undo} type="button" className="undo"></button>

                    <div className="eraser" onClick={changeColor}></div>
                    <div onClick={changeColor} className="color" style={{background: "black"}}></div>
                    <div onClick={changeColor} className="color" style={{background: "grey"}}></div>
                    <div onClick={changeColor} className="color" style={{background: "red"}}></div>
                    <div onClick={changeColor} className="color" style={{background: "orange"}}></div>
                    <div onClick={changeColor} className="color" style={{background: "yellow"}}></div>
                    <div onClick={changeColor} className="color" style={{background: "green"}}></div>
                    <div onClick={changeColor} className="color" style={{background: "blue"}}></div>
                    <div onClick={changeColor} className="color" style={{background: "purple"}}></div>

                    <input onInput={changeColor} type="color" className="color-pocker"/>
                    <input onInput={changeLineWidth} type="range" defaultValue="2" min="1" max="100" className="pen-range"/>
                </div>
            :<></>}
            
        </React.Fragment>
    )
}


export default Draw;