import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import authService from './ValidateLogin'  // đường dẫn tới file authService
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs';
// 1. Tạo Context
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser())
  const [friendsOnlineStatus, setFriendsOnlineStatus] = useState({})
  const stompClientRef = useRef(null)

  // Kết nối WebSocket khi user đăng nhập
  useEffect(() => {
    // Ngắt kết nối cũ nếu có
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.disconnect()
      stompClientRef.current = null
    }

    // Kết nối mới nếu user đăng nhập
    if (user) {
      connectWebSocket()
    }

    // Hàm dọn dẹp khi component unmount
    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        sendOfflineStatus()
        stompClientRef.current.disconnect()
      }
    }
  }, [user])

  // Xử lý sự kiện đóng tab/trình duyệt để gửi trạng thái offline
  useEffect(() => {
    const handleBeforeUnload = () => {
      sendOfflineStatus()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [user])

  // Sync khi storage thay đổi (ví dụ user đăng nhập từ tab khác)
  useEffect(() => {
    const handleStorage = () => setUser(authService.getCurrentUser())
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Callback function để xử lý tin nhắn online status nhận được
  const onOnlineStatusReceive = (payload) => {
    console.log("fdssdfs");
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
  }

  const payload = user ? { userId: user.userID } : null;
  
  // Kết nối WebSocket
  const connectWebSocket = () => {
    if (!user) return;

    console.log("🔌 Đang kết nối WebSocket...");
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);
    
    // Thêm user ID vào header khi kết nối
    const headers = {
      'userId': user.userID.toString()
    };

    stompClient.connect(headers, frame => {
      console.log("🔌 Kết nối WebSocket thành công:", frame);
      stompClientRef.current = stompClient;

      console.log(`🔔 Đăng ký nhận thông báo tại: /user/${user.userID}/statususer`);
      
      // Sử dụng cách mới để subscribe với callback riêng
      const subscription = stompClient.subscribe(
        `/user/${user.userID}/statususer`, 
        onOnlineStatusReceive
      );
      
      console.log("🔔 Đăng ký subscription thành công:", subscription.id);

      // Gửi thông báo online sau khi kết nối thành công
      sendOnlineStatus();
      
      // Thiết lập heartbeat
      // startHeartbeat();
    }, error => {
      console.error("❌ Lỗi kết nối WebSocket:", error);
      // Thử kết nối lại sau 3 giây
      setTimeout(connectWebSocket, 3000);
    });

    // Xử lý khi kết nối bị đóng
    socket.onclose = () => {
      console.log("🔌 Kết nối WebSocket đã đóng");
      stompClientRef.current = null;
      // Thử kết nối lại sau 3 giây
      setTimeout(connectWebSocket, 3000);
    };
  };

  // Gửi trạng thái online
  const sendOnlineStatus = () => {
    if (stompClientRef.current && stompClientRef.current.connected && user) {
      console.log("📤 Gửi trạng thái online");
      stompClientRef.current.send('/app/status/online', {}, JSON.stringify(payload));
    }
  };

  // Gửi trạng thái offline
  const sendOfflineStatus = () => {
    if (stompClientRef.current && stompClientRef.current.connected && user) {
      console.log("📤 Gửi trạng thái offline");
      stompClientRef.current.send('/app/status/offline', {}, JSON.stringify(payload));
    }
  };

  // Thiết lập heartbeat để duy trì kết nối
  // const startHeartbeat = () => {
  //   const intervalId = setInterval(() => {
  //     if (stompClientRef.current && stompClientRef.current.connected && user) {
  //       console.log("💓 Gửi heartbeat");
  //       stompClientRef.current.send('/app/status/heartbeat', {}, JSON.stringify(payload));
  //     } else {
  //       clearInterval(intervalId);
  //     }
  //   }, 60000); // 1 phút

  //   // Lưu intervalId để có thể clear khi cần
  //   stompClientRef.current.heartbeatIntervalId = intervalId;
  // };

  const login = async (...args) => {
    const result = await authService.login(...args);
    if (result.success) {
      setUser(authService.getCurrentUser());
      // WebSocket sẽ được kết nối tự động nhờ useEffect phía trên
    }
    return result;
  };

  const logout = () => {
    // Gửi trạng thái offline trước khi đăng xuất
    sendOfflineStatus();
    
    // Ngắt kết nối WebSocket
    if (stompClientRef.current) {
      if (stompClientRef.current.heartbeatIntervalId) {
        clearInterval(stompClientRef.current.heartbeatIntervalId);
      }
      stompClientRef.current.disconnect();
      stompClientRef.current = null;
    }

    // Đăng xuất và xóa state
    authService.logout();
    setUser(null);
    setFriendsOnlineStatus({});
  };

  // Hàm để lấy trạng thái online của một người dùng cụ thể
  const isFriendOnline = (userId) => {
    return !!friendsOnlineStatus[userId];
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      friendsOnlineStatus,
      isFriendOnline
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// 2. Custom Hook
export const useAuth = () => {
  return useContext(AuthContext)
}