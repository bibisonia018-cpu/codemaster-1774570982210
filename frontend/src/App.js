import React, { useState } from 'react';
import JoinRoom from './components/JoinRoom';
import ChatRoom from './components/ChatRoom';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:5000"); // Backend URL

function App() {
  const [chatInfo, setChatInfo] = useState({
    joined: false,
    roomId: '',
    username: '',
    secretKey: '' // NEVER sent to the server
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      {!chatInfo.joined ? (
        <JoinRoom socket={socket} setChatInfo={setChatInfo} />
      ) : (
        <ChatRoom socket={socket} chatInfo={chatInfo} setChatInfo={setChatInfo} />
      )}
    </div>
  );
}

export default App;