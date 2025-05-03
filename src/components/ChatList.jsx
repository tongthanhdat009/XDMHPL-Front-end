import React, { useEffect, useState } from "react";
import axios from "axios";

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const storedUser = localStorage.getItem("currentUser");
        const user = storedUser ? JSON.parse(storedUser) : null;
  
        if (!user || !user.userId) {
          console.warn("Không tìm thấy userId trong localStorage");
          return;
        }
  
        const response = await axios.get(`http://localhost:8080/chat/sidebar/${user.userId}`);
        setChats(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách chat:", error);
      }
    };
  
    fetchChats();
  }, []);
  
  

  const handleSelectChat = (chat) => {
    onSelectChat(chat);  // Truyền chat vào Messenger
  };

  return (
    <div className="w-1/4 bg-gray-200 p-4">
      <h2 className="text-lg font-bold pb-2 mb-4 border-b border-gray-400">Danh Sách </h2>

      {chats.map((chat, index) => {
        const chatBoxImage = chat.imageURL;
       
       
       
       
        const chatBoxName = chat.chatBoxName;
        const otherUserName = chat.otherUserName;

        return (
          <div
            key={chat.chatBoxID}  // Đây là id của chat, đảm bảo dùng đúng tên
            className={`flex items-start p-3 cursor-pointer hover:bg-gray-300 rounded-lg transition ${
              index !== chats.length - 1 ? "border-b border-gray-400" : ""
            }`}
            onClick={() => handleSelectChat(chat)}  // Khi chọn chat, gửi thông tin chat vào Messenger
          >
            <img
              src={chatBoxImage}
              alt="avatar"
              className="w-12 h-12 rounded-full mr-3"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold truncate">{chatBoxName}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{otherUserName}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
