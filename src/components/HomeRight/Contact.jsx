import React, { useState } from 'react'
import ChatBox from './ChatBox.';

const Contact = ({ contact, onClick }) => {
  return (
    <div className='flex items-center space-x-3 mb-2 relative hover:bg-gray-200 cursor-pointer p-2 rounded-xl' onClick={onClick}>
      <img
        className='rounded-full'
        src={contact.src}
        width={50}
        height={50}
        alt={contact.name}
      />
      <p>{contact.name}</p>
      <div className='absolute bottom-2 left-11 bg-green-400 h-3 w-3 rounded-full'/>
    </div>
  );
};

export default Contact