import React, { useState, useEffect } from "react";
import ChatList from "./ChatList.jsx";
import ChatWindow from "./ChatWindow.jsx";
import RightMenu from "./RightMenu.jsx";
import axios from "axios";

const Messenger = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);

  const currentUserId = 1; 

  // Hàm lấy danh sách chat
  const fetchChats = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/chatbox/sidebar/${currentUserId}`);
      setChats(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chat:", error);
    }
  };

  // Hàm lấy tin nhắn theo chatbox ID
  const fetchMessages = async (chatBoxID) => {
    if (!chatBoxID) return;
    try {
      const res = await axios.get(`http://localhost:8080/messages/${chatBoxID}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
    }
  };

  // Gọi khi mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Gọi khi chọn chat mới
  useEffect(() => {
    if (selectedChat?.chatBoxID) {
      fetchMessages(selectedChat.chatBoxID);
    }
  }, [selectedChat]);

  // Kiểm tra selectedChat có còn tồn tại trong danh sách chats
  useEffect(() => {
    if (selectedChat && !chats.find(c => c.chatBoxID === selectedChat.chatBoxID)) {
      setSelectedChat(null);
      setMessages([]);
    }
  }, [chats]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages([]); // Reset tin nhắn khi chọn chat mới
  };

  const handleUpdateChat = (updatedChat) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.chatBoxID === updatedChat.chatBoxID ? updatedChat : chat
      )
    );

    if (selectedChat?.chatBoxID === updatedChat.chatBoxID) {
      setSelectedChat(updatedChat);
    }
  };

  const handleAddMessage = (newMsg) => {
    setMessages(prev => [...prev, newMsg]);
  };

  return (
    <div className="flex h-screen">
      <ChatList
        chats={chats}
        onSelectChat={handleSelectChat}
      />
      <ChatWindow
        selectedChat={selectedChat}
        messages={messages}
        onAddMessage={handleAddMessage}
      />
      <RightMenu
        selectedChat={selectedChat}
        onUpdateChat={handleUpdateChat}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default Messenger;
