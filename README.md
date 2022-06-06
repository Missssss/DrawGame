
# Fun.io
#### An online game where you can paint, interact and chat with friends in real time.
<img src="https://i.imgur.com/wSyZXIE.png" width="260px"/>

## Table of content
- [Demo](#demo)
- [Game Flow](#game-flow)
- [Technique](#technique)
- [Asynchronization Issue](#asynchronization-issue)
- [Race Condition](#race-condition)

## Demo
- By simply entering your nickname, you can instantly join the game.
- You can also join the game by registering and logging in.
<!-- ![Imgur](https://imgur.com/BKKWBLw.gif|width=100) -->
<img src="https://imgur.com/BKKWBLw.gif"  width="600px"/>


- Choose your favorite avatar by clicking on the icon.
<!-- ![Imgur](https://i.imgur.com/HXabd9G.gif) -->
<img id="avatar" src="https://i.imgur.com/HXabd9G.gif"  width="600px"/>

- Choose a gaming room to join the game.
<!-- ![Imgur](https://i.imgur.com/HtQrP23.png) -->
<img src="https://i.imgur.com/HtQrP23.png"  width="600px"/>

- It's your turn to be a painter, choose a puzzle and start painting.
- The brush contains a color changing feature as well as an eraser.
- You can also go back to the previous step if you want to adjust the current painting.
<!-- ![aaa](https://i.imgur.com/0R52GcW.gif) -->
<img src="https://i.imgur.com/0R52GcW.gif"  width="600px"/>

- Chat with other players in the chat room in the lower right corner.
- Guess the puzzle in the answer room, and get points for correct answers
<!-- ![Imgur](https://i.imgur.com/cJg2hl6.gif) -->
<img src="https://i.imgur.com/cJg2hl6.gif"  width="600px"/>

## Game Flow
<!-- ![Imgur](https://i.imgur.com/LiHWwBN.png) -->
<img src="https://i.imgur.com/LiHWwBN.png"  width="600px"/>

## Technique
#### Backend
- Node.js
- Express.js
- Socket.IO
- Redis
- MySQL
- Docker
#### Frontend
- React.js
- JavaScript
- HTML
- CSS

## Asynchronization Issue
- The round's holder or drawer transmit events to the server, which notifies all other clients at same time, such that each player triggers the event virtually simultaneously.
<!-- ![Imgur](https://i.imgur.com/bDzLrYN.gif) -->
<img src="https://i.imgur.com/bDzLrYN.gif"  width="600px"/>

## Race Condition
- Solve race condition by using INCR and  HSET data structure in Redis.
<!-- ![Imgur](https://i.imgur.com/SKOi4xX.png) -->
<img src="https://i.imgur.com/SKOi4xX.png"  width="600px"/>