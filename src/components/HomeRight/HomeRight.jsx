import React, { useEffect, useState } from 'react'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import Contact from './Contact';
import ChatBox from './ChatBox.';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import { useAuth } from '../LoginPage/LoginProcess/AuthProvider';

const HomeRight = () => {
  const [openChats, setOpenChats] = useState([]);
  const {connected, stompClient,user } = useAuth();
  const [friendsOnlineStatus, setFriendsOnlineStatus] = useState({})
  console.log("connected", connected);

  // Xử lý tin nhắn online status nhận được
  useEffect(() => {
    let subscription = null;
    
    if (connected && stompClient && user) {
      // Đăng ký nhận thông báo trạng thái online/offline
      console.log(`🔔 Đăng ký nhận thông báo tại: /user/${user.userID}/queue/statususer`);
      
      const onOnlineStatusReceive = (payload) => {
        console.log("🚀 Raw WebSocket payload:", payload);
        
        if (!payload.body) {
          console.log("❌ Không có body trong payload");
          return;
        }
        
        try {
          const statusUpdate = JSON.parse(payload.body);
          console.log("✅ Friend status update parsed:", statusUpdate);
          
          // Cập nhật state với thông tin online status mới
          setFriendsOnlineStatus(prev => ({
            ...prev,
            [statusUpdate.userId]: statusUpdate.online
          }));
        } catch (error) {
          console.error("❌ Lỗi khi parse JSON:", error);
        }
      };
      
      subscription = stompClient.subscribe(
        `/user/${user.userID}/queue/statususer`, 
        onOnlineStatusReceive
      );
      
      console.log("🔔 Đăng ký subscription thành công:", subscription.id);
    }
    
    // Cleanup function to unsubscribe when component unmounts or dependencies change
    return () => {
      if (subscription) {
        console.log("🔌 Hủy đăng ký subscription:", subscription.id);
        subscription.unsubscribe();
      }
    };
  }, [connected, stompClient, user]); // Dependencies: re-run when these change

  console.log("friendsOnlineStatus", friendsOnlineStatus);
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

  const [allUsers, setAllUsers] = useState([]);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
      const fetchDatas = async () => {
        try {
          const users = await authService.getAllUsers();
          setAllUsers(users);
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      };
  
      fetchDatas();
  }, []);

  const acceptedFriends = allUsers.length > 0 ? [
    ...currentUser.friends
        .filter((friend) => friend.status === "ACCEPTED")
        .map((friend) => allUsers.find((user) => user.userID === friend.userID)),
    ...currentUser.friendOf
        .filter((friend) => friend.status === "ACCEPTED")
        .map((friend) => allUsers.find((user) => user.userID === friend.userID))
].filter(Boolean) : []; // Đảm bảo loại bỏ các giá trị undefined
  console.log(acceptedFriends);

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

      {acceptedFriends.map((contact) => (
        <Contact 
          key={contact.userID} 
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