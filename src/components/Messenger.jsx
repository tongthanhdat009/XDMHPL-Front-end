import React, { useState } from "react";
import ChatList from "./ChatList.jsx";
import ChatWindow from "./ChatWindow.jsx";
import RightMenu from "./RightMenu.jsx";

const Messenger = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const [chats, setChats] = useState([
    { id: 1, name: "Nhóm 1", avatar: "/images/group1.jpg", lastMessage: "Xin chào!", lastMessageTime: "10:00 AM", sentImages: [] },
    { id: 2, name: "Nhóm 2", avatar: "/images/group2.jpg", lastMessage: "Hẹn gặp lại!", lastMessageTime: "12:30 PM", sentImages: [] }
  ]);

  const messages = selectedChat
    ? [
        { sender: "Alice", text: "Hello!" },
        { sender: "You", text: "Hi Alice!" },
      ]
    : [];

    const handleSelectChat = (chat) => {
      setSelectedChat(chat);
    };
  
    const handleUpdateChat = (updatedChat) => {
      setChats((prevChats) =>
        prevChats.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
      );
      setSelectedChat(updatedChat);
    };

  return (
    <div className="flex h-screen">
    <ChatList chats={chats} onSelectChat={handleSelectChat} />
      <ChatWindow selectedChat={selectedChat} messages={messages} />
      <RightMenu selectedChat={selectedChat} onUpdateChat={handleUpdateChat} />
    </div>
  );
};

export default Messenger;
