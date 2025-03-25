import React from "react";

const ChatList = ({ chats, onSelectChat }) => {
  return (
    <div className="w-1/4 bg-gray-200 p-4">
      {/* Tiêu đề có gạch dưới */}
      <h2 className="text-lg font-bold pb-2 mb-4 border-b border-gray-400">Chats</h2>

      {chats.map((chat, index) => (
        <div
          key={chat.id}
          className={`flex items-start p-3 cursor-pointer hover:bg-gray-300 rounded-lg transition ${
            index !== chats.length - 1 ? "border-b border-gray-400" : ""
          }`}
          onClick={() => onSelectChat(chat)}
        >
          {/* Avatar */}
          <img src={chat.avatar} alt="avatar" className="w-12 h-12 rounded-full mr-3" />

          {/* Nội dung chat */}
          <div className="flex-1 min-w-0">
            {/* Dòng trên cùng: Tên nhóm/chat + Giờ */}
            <div className="flex justify-between items-center">
              <span className="font-semibold truncate">{chat.name}</span>
              <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{chat.lastMessageTime}</span>
            </div>

            {/* Tin nhắn cuối */}
            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
