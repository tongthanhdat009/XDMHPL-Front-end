import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Settings, Send, Paperclip, Info, X, Edit, Image } from 'lucide-react';
import { useSearchParams } from "react-router-dom";
import authService from "./LoginPage/LoginProcess/ValidateLogin";

const ChatList = ({ chats, selectedChat, onSelectChat, loading, currentUserId }) => {
  const [allUsers, setAllUsers] = useState([]);
  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const users = await authService.getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchDatas();
  }, []);
  // const [searchParams] = useSearchParams();
  // const q = Number(searchParams.get("chatboxId")); // Lấy giá trị q từ URL
  // console.log(q);
  // Xác định xem chat hiện tại có phải là nhóm hay không

  const [searchTerm, setSearchTerm] = useState('');
  // useEffect(() => {
  //   if (q && chats && chats.length > 0) {
  //     console.log("Searching for chat with ID:", q);
  //     const chatBox = chats.find(chat => Number(chat.chatBoxID) === q);
  //     if (chatBox) {
  //       console.log("Found matching chat:", chatBox);
  //       onSelectChat(chatBox);
  //     } else {
  //       console.log("No matching chat found for ID:", q);
  //     }
  //   }
  // }, [q, chats]);
  const filteredChats = chats.filter(chat =>
    (chat.chatBoxName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log(filteredChats);
  function formatTime(timeString) {
    const now = new Date();
    const time = new Date(timeString);
    const diff = Math.floor((now - time) / 1000); // chênh lệch giây

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;

    const isToday = now.toDateString() === time.toDateString();
    if (isToday) {
      return time.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }

    return time.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  }

  return (
    <div className="w-1/4 border-r border-gray-300 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-300 flex justify-between items-center">
        <h1 className="text-xl font-bold">Đoạn chat</h1>
        <div className="flex space-x-2">
          {/* <button className="p-2 rounded-full hover:bg-gray-200">
            <Settings size={20} />
          </button> */}
        </div>
      </div>

      {/* <div className="p-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm trên Messenger"
            className="w-full p-2 pl-8 bg-gray-100 rounded-full text-sm focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} className="absolute left-2 top-2.5 text-gray-500" />
        </div>
      </div> */}

      <div className="flex p-2 border-b border-gray-200">
        <button className="flex-1 py-2 font-medium text-blue-600 border-b-2 border-blue-600">
          Hộp thư
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isGroupChat = chat?.group === true;
            console.log(isGroupChat);
            console.log(currentUserId);
            // Xác định userId của người đối diện trong chat 1-1
            const otherUserId = !isGroupChat && chat?.chatBoxDetails ?
              chat.chatBoxDetails.find(detail => detail.userID !== currentUserId)?.userID :
              null;
            const userOpposite = allUsers.find(user => user.userID === otherUserId);
            console.log(userOpposite);
            return (
              <div
                key={chat.chatBoxID}
                className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedChat?.chatBoxID === chat.chatBoxID ? 'bg-blue-50' : ''
                  }`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="relative">
                  <img
                    src={isGroupChat ? chat.imageURL : "http://localhost:8080/uploads"+userOpposite.avatarURL}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${chat.unread ? 'text-black' : 'text-gray-700'}`}>
                      {isGroupChat ? chat.chatBoxName : userOpposite.fullName}
                    </span>
                    <span className="text-xs text-gray-500">{chat.lastMessage ? formatTime(chat.lastMessage.time) : ''}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`truncate ${chat.unread ? 'font-medium text-black' : 'text-gray-500'}`}>
                      {chat.lastMessage ? (chat.lastMessage.display === false ? 'Đã thu hồi tin nhắn' : chat.lastMessage.text) : 'Bắt đầu cuộc trò chuyện'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
