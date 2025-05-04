import React, { useState } from 'react'
import { Avatar } from '@mui/material';
import { useAuth } from '../LoginPage/LoginProcess/AuthProvider';

const Contact = ({ contact, onClick }) => {
  const { onlineUsers } = useAuth();
  const isOnline = onlineUsers.includes(contact.userID);
  return (
    <div className='flex items-center space-x-3 mb-2 relative hover:bg-gray-200 cursor-pointer p-2 rounded-xl' onClick={onClick}>
      <Avatar
        className='rounded-full'
        src={contact.avatarURL ? 'http://localhost:8080/uploads' + contact.avatarURL :"http://localhost:8080/uploads/avatars/default.jpg"}
        width={50}
        height={50}
        alt={contact.fullName}
      />
      <p>{contact.fullName}</p>
      {isOnline && (
        <div className="absolute bottom-2 left-11 bg-green-400 h-3 w-3 rounded-full" />
      )}
    </div>
  );
};

export default Contact