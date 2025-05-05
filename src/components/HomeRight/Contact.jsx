import React, { useState } from 'react'
import { Avatar } from '@mui/material';
import { useAuth } from '../LoginPage/LoginProcess/AuthProvider';
import { FaRobot } from 'react-icons/fa';

const Contact = ({ contact, onClick }) => {
  const { onlineUsers } = useAuth();
  // Chatbot luôn được xem là online
  const isOnline = contact.isBot ? true : onlineUsers.includes(contact.userID);

  return (
    <div className='flex items-center space-x-3 mb-2 relative hover:bg-gray-200 cursor-pointer p-2 rounded-xl' onClick={onClick}>
      {contact.isBot ? (
        // Hiển thị icon cho chatbot
        <div className="h-[50px] w-[50px] rounded-full bg-blue-500 flex items-center justify-center text-white">
          <FaRobot size={24} />
        </div>
      ) : (
        // Hiển thị avatar cho người dùng thông thường
        <Avatar
          className='rounded-full'
          src={contact.avatarURL ? 'http://localhost:8080/uploads' + contact.avatarURL : "http://localhost:8080/uploads/avatars/default.jpg"}
          width={50}
          height={50}
          alt={contact.fullName}
        />
      )}
      <p>{contact.fullName}</p>
      {isOnline && (
        <div className="absolute bottom-2 left-11 bg-green-400 h-3 w-3 rounded-full" />
      )}
    </div>
  );
};

export default Contact