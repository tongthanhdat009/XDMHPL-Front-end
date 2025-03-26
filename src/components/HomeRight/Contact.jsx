import React, { useState } from 'react'
import ChatBox from './ChatBox.';

const Contact = ({src, name}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <>
      <div className='flex items-center space-x-3 mb-2 relative hover:bg-gray-200 cursor-pointer p-2 rounded-xl' onClick={() => setIsChatOpen(true)}>
        <img
            className='rounded-full'
            src={src}
            width={50}
            height={50}
        />
        <p>{name}</p>
        <div className='absolute bottom-2 left-11 bg-green-400 h-3 w-3 rounded-full'/>
      </div>

      {isChatOpen && (
        <ChatBox
          contact={{src, name}} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}
    </>
  )
}

export default Contact