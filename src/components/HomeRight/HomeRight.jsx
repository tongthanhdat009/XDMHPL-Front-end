import React, { useEffect, useState } from 'react'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import Contact from './Contact';
import ChatBox from './ChatBox.';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import { useAuth } from '../LoginPage/LoginProcess/AuthProvider';
import { all } from 'axios';
import { useNavigate } from 'react-router-dom';
import ChatBotBox from './ChatBotBox';

const HomeRight = () => {
  const [currentChat, setCurrentChat] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [chatboxes, setChatboxes] = useState([]);
  const currentUser = authService.getCurrentUser();
  const { onlineUsers } = useAuth();

  const navigate = useNavigate();
  
  // Thêm chatbot vào danh sách contacts
  const chatbotContact = {
    userID: 'chatbot',
    fullName: 'Chat Bot',
    avatarURL: '/avatars/chatbot.jpg',
    isBot: true // Thêm flag để nhận biết đây là bot
  };

  // Fetch users và chatboxes khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await authService.getAllUsers();
        const usersWithoutAdmin = users.filter(user => user.role !== 'admin');
        setAllUsers(usersWithoutAdmin);
        
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
    // Nếu là chatbot, không cần tạo chatbox thực sự trong DB
    if (userId2 === 'chatbot') {
      return {
        chatBoxID: 'virtual-chatbot-id',
        chatBoxDetails: [
          { userID: userId1 },
          { userID: 'chatbot' }
        ]
      };
    }

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
    // Nếu là chatbot, trả về chatbox ảo
    if (userId2 === 'chatbot') {
      return {
        chatBoxID: 'virtual-chatbot-id',
        chatBoxDetails: [
          { userID: userId1 },
          { userID: 'chatbot' }
        ]
      };
    }

    return chatboxes.find(chatbox => {
      // Kiểm tra xem chatbox có chứa cả hai userID không
      const userIds = chatbox.chatBoxDetails.map(detail => detail.userID);
      return userIds.includes(userId1) && userIds.includes(userId2);
    });
  };

  const handleOpenChat = async (contact) => {
    console.log(contact);
    // Xử lý đặc biệt cho chatbot
    if (contact.isBot) {
      // Luôn mở chatbox trực tiếp với chatbot
      setCurrentChat(contact);
    } else {
      // Đối với người dùng thường, chuyển hướng đến trang messages
      const existingChatbox = findExistingChatbox(currentUser.userID, contact.userID);
      
      if (existingChatbox) {
        // Nếu đã có chatbox, chuyển hướng đến trang messages
        navigate(`/messages`);
      } else {
        // Nếu chưa có chatbox, tạo mới trước rồi chuyển hướng
        const newChatbox = await createNewChatbox(currentUser.userID, contact.userID);
        
        if (newChatbox) {
          // Cập nhật danh sách chatboxes
          setChatboxes([...chatboxes, newChatbox]);
          navigate(`/messages`);
        }
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
          {/* <SearchRoundedIcon className='h-6' /> */}
          {/* <MoreHorizRoundedIcon className='h-6' /> */}
        </div>
      </div>

      {/* Hiển thị ChatBot đầu tiên */}
      <Contact 
        key="chatbot" 
        contact={chatbotContact}
        onClick={() => handleOpenChat(chatbotContact)}
      />

      {/* Hiển thị danh sách người dùng thông thường */}
      {contactsUsers.map((contact) => (
        <Contact 
          key={contact.userID} 
          contact={contact}
          onClick={() => handleOpenChat(contact)}
        />
      ))}

      {/* Hiển thị ChatBox nếu đang có chat đang mở */}
      <div className="fixed bottom-0 right-4">
        {currentChat && (
          currentChat.isBot ? (
            // Sử dụng ChatBotBox cho chatbot
            <ChatBotBox
              contact={currentChat}
              onClose={handleCloseChat}
            />
          ) : (
            // Sử dụng ChatBox thông thường cho người dùng khác
            <></>
          )
        )}
      </div>
    </div>
  );
};

export default HomeRight