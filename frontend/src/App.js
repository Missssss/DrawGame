import Home from './containers/Home';
import RoomList from './containers/RoomList';
import Create from './containers/Create';
import Game from './containers/Game';
import{BrowserRouter, Routes, Route, Link, useParams} from 'react-router-dom'
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// const socket = io(process.env.REACT_APP_SOCKETIO_URL)
function App() {
  const [socket, setSocket] = useState(io(process.env.REACT_APP_SOCKETIO_URL));
  const [user, setUser] = useState({})
  const [roomInfo, setRoomInfo] = useState({}); //{roomId, theme, playerCount, score}

  useEffect(() => {
    console.log("app roomInfo: ", roomInfo);
    console.log("app user: ", user);
  },[user, roomInfo]);
  

  return (
    <BrowserRouter>
      {/* <Link to="/">    home</Link>
      <Link to="/Rooms">    abc</Link> */}
      <Routes>
        <Route path="/" element={<Home setUser={setUser} />}/>
        <Route path="/rooms" element={<RoomList socket={socket}/>} />
        <Route path="/create" element={<Create socket={socket} setRoomInfo={setRoomInfo}/>} />
        <Route path="/game/:roomId" element={<Game socket={socket} roomInfo={roomInfo} user={user}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
