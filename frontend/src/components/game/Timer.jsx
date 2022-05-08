import React, { useEffect, useState } from "react";
import { CountdownCircleTimer, useCountdown } from "react-countdown-circle-timer";
import "../../css/countDownTimer.css"

const timerStyle = {
    position: "absolute",
    right: "10px",
    bottom: "90px"
}

const Timer = ({duration, isDrawingRef, setIsTimesUp}) => {

    const {
        path,
        pathLength,
        stroke,
        strokeDashoffset,
        remainingTime,
        elapsedTime,
        size,
        strokeWidth,
    } = useCountdown({ isPlaying: true, duration: 7, colors: '#abc' })

    return(
        <div style={timerStyle}>
            <CountdownCircleTimer
            key={duration}
            isPlaying
            duration={duration}
            colors={['#004777', '#F7B801', '#A30000', '#A30000']}
            colorsTime={[80, 60, 40, 20]}
            strokeWidth={8}
            size={80}
            onComplete={()=>{setIsTimesUp(true)}}
            // children= {{remainingTime: duration}}
            >
            {({ remainingTime }) => remainingTime}
            </CountdownCircleTimer>
        </div>
    )
}


export default Timer;