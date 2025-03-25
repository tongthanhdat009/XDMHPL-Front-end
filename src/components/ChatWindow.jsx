import React, { useState } from "react";

const ChatWindow = ({ selectedChat, messages }) => {
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="w-1/2 bg-white p-4 flex flex-col">
      {selectedChat ? (
        <>
          {/* Tiêu đề chat */}
          <h2 className="text-lg font-bold mb-2">Chat với {selectedChat.name}</h2>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 border p-2 h-[70vh] overflow-auto">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>

          {/* Ô nhập tin nhắn */}
          <div className="mt-2 border-t pt-2 flex items-center">
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Nhập @, tin nhắn tới ${selectedChat.name}`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg">Gửi</button>
          </div>
        </>
      ) : (
        <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
      )}
    </div>
  );
};

export default ChatWindow;
