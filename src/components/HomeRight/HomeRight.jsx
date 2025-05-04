import React, { useEffect, useState } from 'react'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import Contact from './Contact';
import ChatBox from './ChatBox.';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import { useAuth } from '../LoginPage/LoginProcess/AuthProvider';
import { all } from 'axios';

const HomeRight = () => {
  const [currentChat, setCurrentChat] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [chatboxes, setChatboxes] = useState([]);
  const currentUser = authService.getCurrentUser();
  const { onlineUsers } = useAuth();

  console.log(onlineUsers);
  
  // Fetch users và chatboxes khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await authService.getAllUsers();
        setAllUsers(users);
        
        // Fetch thông tin các chatbox của người dùng hiện tại
        const userChatboxes = await fetchUserChatboxes(currentUser.userID);
        setChatboxes(userChatboxes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Hàm lấy danh sách chatbox của người dùng
  const fetchUserChatboxes = async (userId) => {
    try {
      // Thay thế bằng API call thực tế của bạn
      const response = await fetch(`http://localhost:8080/chatbox/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch chatboxes');
      return await response.json();
    } catch (error) {
      console.error("Error fetching chatboxes:", error);
      return [];
    }
  };

  // Hàm tạo chatbox mới giữa hai người dùng
  const createNewChatbox = async (userId1, userId2) => {
    try {
      // Thay thế bằng API call thực tế của bạn
      const response = await fetch('http://localhost:8080/chatbox/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId1: userId1,
          userId2: userId2,
          chatBoxName: null, // Chatbox 1-1 không cần tên
          imageURL: null, // Có thể dùng avatar của người kia
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create chatbox');
      return await response.json();
    } catch (error) {
      console.error("Error creating chatbox:", error);
      return null;
    }
  };

  // Hàm tìm chatbox hiện có giữa hai người dùng
  const findExistingChatbox = (userId1, userId2) => {
    return chatboxes.find(chatbox => {
      // Kiểm tra xem chatbox có chứa cả hai userID không
      // Giả sử mỗi chatbox có thuộc tính chatBoxDetails chứa thông tin về các thành viên
      const userIds = chatbox.chatBoxDetails.map(detail => detail.userID);
      return userIds.includes(userId1) && userIds.includes(userId2);
    });
  };

  const handleOpenChat = async (contact) => {
    // Nếu đã mở chat với người này rồi, không làm gì cả
    if (currentChat && currentChat.userID === contact.userID) {
      return;
    }

    // Tìm chatbox hiện có giữa currentUser và contact
    const existingChatbox = findExistingChatbox(currentUser.userID, contact.userID);
    
    if (existingChatbox) {
      // Nếu đã có chatbox, mở nó lên
      setCurrentChat({
        ...contact,
        chatBoxID: existingChatbox.chatBoxID
      });
    } else {
      // Nếu chưa có chatbox, tạo mới
      const newChatbox = await createNewChatbox(currentUser.userID, contact.userID);
      
      if (newChatbox) {
        // Cập nhật danh sách chatboxes
        setChatboxes([...chatboxes, newChatbox]);
        
        // Mở chatbox mới
        setCurrentChat({
          ...contact,
          chatBoxID: newChatbox.chatBoxID
        });
      }
    }
  };

  const handleCloseChat = () => {
    setCurrentChat(null);
  };

  const contactsUsers = allUsers.length > 0 
  ? allUsers.filter(user => currentUser.userID !== user.userID) 
  : [];

  return (
    <div className='hidden lg:flex flex-col w-60 p-2 mt-5'>
      <div className='flex justify-between items-center text-gray-500 mb-5'>
          <h2 className='text-xl'>Contacts</h2>
          <div className='flex space-x-2'>
              <SearchRoundedIcon className='h-6' />
              <MoreHorizRoundedIcon className='h-6' />
          </div>
      </div>

      {contactsUsers.map((contact) => (
        <Contact 
          key={contact.userID} 
          contact={contact}
          onClick={() => handleOpenChat(contact)}
        />
      ))}

      <div className="fixed bottom-0 right-4">
        {currentChat && (
          <ChatBox 
            contact={currentChat} 
            onClose={handleCloseChat} 
            chatBoxID={currentChat.chatBoxID}
          />
        )}
      </div>
    </div>
  );
}

export default HomeRight