import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import authService from './ValidateLogin'  // đường dẫn tới file authService
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs';
// 1. Tạo Context
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser())
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Tự động kết nối/ngắt kết nối khi user thay đổi
  useEffect(() => {
    if (user) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    // Cleanup khi component unmount
    return () => {
      if (connected) {
        sendOfflineStatus();
        disconnectWebSocket();
      }
    };
  }, [user]);

  // Xử lý sự kiện đóng tab/trình duyệt để gửi trạng thái offline
  useEffect(() => {
    const handleBeforeUnload = () => {
      sendOfflineStatus();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [connected]);

  // Sync khi storage thay đổi (ví dụ user đăng nhập từ tab khác)
  useEffect(() => {
    const handleStorage = () => setUser(authService.getCurrentUser());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Kết nối WebSocket
  const connectWebSocket = () => {
    if (!user || isConnecting || connected) return;

    setIsConnecting(true);

    const socket = new SockJS('http://localhost:8080/ws');
    const stomp = Stomp.over(socket);
    
    // Header cho kết nối
    const headers = {
      'userId': user.userID.toString(),
      'Authorization': user.token // Nếu có token
    };

    stomp.connect(headers, (frame) => {
      console.log("🔌 WebSocket Connected!", frame);
      setStompClient(stomp);
      setConnected(true);
      setIsConnecting(false);
      // Gửi trạng thái online sau khi kết nối thành công
      sendOnlineStatus(stomp);
      
    }, (error) => {
      console.error("❌ Lỗi kết nối WebSocket:", error);
      setIsConnecting(false);
      setConnected(false);
      
      // Thử kết nối lại sau 5 giây
      setTimeout(() => {
        if (user && !connected && !isConnecting) {
          connectWebSocket();
        }
      }, 5000);
    });

    // Xử lý khi kết nối bị đóng
    socket.onclose = () => {
      console.log("🔌 Kết nối WebSocket đã đóng");
      setConnected(false);
      setStompClient(null);
      
      // Thử kết nối lại sau 5 giây
      setTimeout(() => {
        if (user && !connected && !isConnecting) {
          connectWebSocket();
        }
      }, 5000);
    };
  };

  // Ngắt kết nối WebSocket
  const disconnectWebSocket = () => {
    if (stompClient && connected) {
      // Gửi trạng thái offline trước khi ngắt kết nối
      sendOfflineStatus(stompClient);
      
      // Ngắt kết nối
      stompClient.disconnect(() => {
        console.log("🔌 WebSocket đã ngắt kết nối");
        setConnected(false);
        setStompClient(null);
      });
    }
  };

  // Gửi trạng thái online
  const sendOnlineStatus = (client = stompClient) => {
    if (client && connected && user) {
      const payload = { userId: user.userID };
      console.log("📤 Gửi trạng thái online");
      client.send('/app/status/online', {}, JSON.stringify(payload));
    }
  };

  // Gửi trạng thái offline
  const sendOfflineStatus = (client = stompClient) => {
    if (client && connected && user) {
      const payload = { userId: user.userID };
      console.log("📤 Gửi trạng thái offline");
      client.send('/app/status/offline', {}, JSON.stringify(payload));
    }
  };

  const login = async (...args) => {
    const result = await authService.login(...args);
    if (result.success) {
      setUser(authService.getCurrentUser());
      // WebSocket sẽ được kết nối tự động nhờ useEffect phía trên
    }
    return result;
  };

  const logout = () => {
    disconnectWebSocket();
    authService.logout();
    setUser(null);
  };


  return (
    <AuthContext.Provider value={{
      stompClient,
      user,
      connected, // Export để component con biết trạng thái kết nối
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
}