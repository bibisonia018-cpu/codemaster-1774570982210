import React, { useState, useEffect, useRef } from 'react';
import { encryptMessage, decryptMessage } from '../utils/crypto';

function ChatRoom({ socket, chatInfo, setChatInfo }) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const messagesEndRef = useRef(null);

  const { roomId, username, secretKey } = chatInfo;

  useEffect(() => {
    // Listen for incoming live messages
    const receiveMessageHandler = (data) => {
      // Decrypt the incoming message immediately
      const decryptedText = decryptMessage(data.encryptedText, secretKey);
      setMessageList((list) => [...list, { ...data, text: decryptedText }]);
    };

    // Load history messages
    const loadMessagesHandler = (messages) => {
      const decryptedMessages = messages.map(msg => ({
        ...msg,
        text: decryptMessage(msg.encryptedText, secretKey)
      }));
      setMessageList(decryptedMessages);
    };

    socket.on("receive_message", receiveMessageHandler);
    socket.on("load_messages", loadMessagesHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
      socket.off("load_messages", loadMessagesHandler);
    };
  }, [socket, secretKey]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      // 1. Encrypt the message locally
      const encryptedData = encryptMessage(currentMessage, secretKey);

      const messageData = {
        roomId: roomId,
        sender: username,
        encryptedText: encryptedData,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      // 2. Send only ciphertext to server
      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  const leaveRoom = () => {
    setChatInfo({ joined: false, roomId: '', username: '', secretKey: '' });
    // Reload window to clear all memory completely
    window.location.reload(); 
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 flex flex-col h-[80vh]">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
        <div>
          <h3 className="text-xl font-bold text-green-400">Room: {roomId}</h3>
          <p className="text-xs text-gray-400">🔒 End-to-End Encrypted</p>
        </div>
        <button onClick={leaveRoom} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold">
          Leave & Destroy
        </button>
      </div>

      {/* Chat Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messageList.map((msg, index) => {
          const isMe = msg.sender === username;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-green-700 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                <div className="text-sm break-words">{msg.text || "⚠️ Decryption Failed"}</div>
                <div className="text-[10px] text-gray-300 mt-1 flex justify-between gap-4">
                  <span>{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Footer */}
      <div className="p-4 bg-gray-900 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a secret message..."
          className="flex-1 p-3 rounded bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => { e.key === "Enter" && sendMessage(); }}
        />
        <button onClick={sendMessage} className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-bold">
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;