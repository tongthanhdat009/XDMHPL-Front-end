import React, { useState, useEffect, useRef } from "react";
import ChatList from "./ChatList.jsx";
import ChatWindow from "./ChatWindow.jsx";
import RightMenu from "./RightMenu.jsx";
import axios from "axios";
import authService from "./LoginPage/LoginProcess/ValidateLogin.jsx";
import Header from "./Header/Header.jsx";

const Messenger = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const storedUser = localStorage.getItem("currentUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = user.userID;

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        await authService.getAllPostsFormDB();
        await authService.getAllUsersFormDB();
        await authService.getCurrentUserFormDB(user.userID);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchDatas();
  }, []);




  // Fetch chat list
  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/chatbox/sidebar/${currentUserId}`);
      setChats(res.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages by chatbox ID
  const fetchMessages = async (chatBoxID) => {
    if (!chatBoxID) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/messages/${chatBoxID}`);
      // Process messages to ensure no duplicates based on messageId
      const uniqueMessages = Array.from(
        new Map(res.data.map(msg => [msg.messageId || `${msg.senderId}-${msg.timestamp}`, msg])).values()
      );
      setMessages(uniqueMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchChats();
  }, []);

  // Load messages when chat selected
  useEffect(() => {
    if (selectedChat?.chatBoxID) {
      fetchMessages(selectedChat.chatBoxID);
    }
  }, [selectedChat]);

  // Check if selectedChat still exists in chats list
  useEffect(() => {
    if (selectedChat && !chats.find(c => c.chatBoxID === selectedChat.chatBoxID)) {
      setSelectedChat(null);
      setMessages([]);
    }
  }, [chats]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages([]); // Reset messages when selecting new chat
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
    // Check if message already exists to prevent duplicates
    console.log(newMsg)
    setMessages(prev => {
      const msgId = newMsg.messageId || `${newMsg.senderId}-${newMsg.timestamp}`;
      const exists = prev.some(m => 
        (m.messageId && m.messageId === newMsg.messageId) || 
        (m.userId === newMsg.userId && m.text === newMsg.text && m.time === newMsg.time)
      );
      
      if (exists) {
        return prev.map(m => 
          m.messageId === newMsg.messageId ? newMsg : m
        );
      }
  
      return [...prev, newMsg];
    });
  };
  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      <Header />
      <div className="flex h-screen">
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          loading={loading}
          currentUserId={currentUserId}
        />
        <ChatWindow
          selectedChat={selectedChat}
          messages={messages}
          onAddMessage={handleAddMessage}
          currentUserId={currentUserId}
          messagesEndRef={messagesEndRef}
          updateChat={fetchChats}
        />
        <RightMenu
          selectedChat={selectedChat}
          onUpdateChat={handleUpdateChat}
          currentUserId={currentUserId}
          updateChat={fetchChats}
        />
      </div>
    </div>
  );
};

export default Messenger;
