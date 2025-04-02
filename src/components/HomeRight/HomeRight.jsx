import React, { useState } from 'react'
import contacts from './PopularUserCard'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import Contact from './Contact';
import ChatBox from './ChatBox.';
const HomeRight = () => {
  const [openChats, setOpenChats] = useState([]);

  const handleOpenChat = (contact) => {
    if (openChats.find(chat => chat.id === contact.id)) {
      return;
    }

    let newOpenChats;
    
    if (openChats.length >= 3) {
      newOpenChats = [...openChats.slice(1), contact];
    } else {
      newOpenChats = [...openChats, contact];
    }
    
    setOpenChats(newOpenChats);
  };

  const handleCloseChat = (contactId) => {
    setOpenChats(openChats.filter(chat => chat.id !== contactId));
  };

  return (
    <div className='hidden lg:flex flex-col w-60 p-2 mt-5'>
      <div className='flex justify-between items-center text-gray-500 mb-5'>
          <h2 className='text-xl'>Contacts</h2>
          <div className='flex space-x-2'>
              <SearchRoundedIcon className='h-6' />
              <MoreHorizRoundedIcon className='h-6' />
          </div>
      </div>

      {contacts.map((contact) => (
        <Contact 
          key={contact.id} 
          contact={contact}
          onClick={() => handleOpenChat(contact)}
        />
      ))}

      <div className="fixed bottom-0 right-4 flex space-x-4">
        {openChats.map((chat) => (
          <ChatBox 
            key={chat.id}
            contact={chat} 
            onClose={() => handleCloseChat(chat.id)} 
          />
        ))}
      </div>
    </div>
  );
}

export default HomeRight