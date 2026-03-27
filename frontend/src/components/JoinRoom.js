import React, { useState } from 'react';

function JoinRoom({ socket, setChatInfo }) {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId && username && secretKey) {
      socket.emit("join_room", roomId);
      // Store info locally in React state. Secret Key is NOT sent over socket.
      setChatInfo({ joined: true, roomId, username, secretKey });
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-400">🛡️ Secret Chat</h2>
      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Room ID (e.g., Matrix99)"
          className="p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => setRoomId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Anonymous Username"
          className="p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="E2E Encryption Password"
          className="p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          onChange={(e) => setSecretKey(e.target.value)}
          required
        />
        <p className="text-xs text-gray-400">
          * Your Encryption Password never leaves your device. Both users must use the same password to read messages.
        </p>
        <button type="submit" className="mt-4 p-3 bg-green-600 hover:bg-green-700 rounded font-bold transition-colors">
          Join Secure Room
        </button>
      </form>
    </div>
  );
}

export default JoinRoom;