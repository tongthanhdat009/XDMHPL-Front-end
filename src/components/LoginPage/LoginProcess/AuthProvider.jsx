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
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Thêm state lưu danh sách người dùng online
  const [notify, setNotify] = useState([]); // Thêm state lưu danh sách người dùng online

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
      'username': user.username
    };

    stomp.connect(headers, (frame) => {
      console.log("🔌 WebSocket Đã kết nối!", frame);

      // Thêm bộ lắng nghe debug để xem tất cả tin nhắn đến
      stomp.debug = function (str) {
        console.log("STOMP Debug:", str);
      };

      setStompClient(stomp);
      setConnected(true);
      setIsConnecting(false);

      // In thông tin kết nối
      console.log("Đã kết nối với user:", user.username);
      console.log("Session ID:", stomp.ws._transport.url.split('/').pop());

      // Gửi trạng thái online sau khi kết nối thành công
      sendOnlineStatus(stomp);

      // Đăng ký nhận cập nhật về trạng thái người dùng
      subscribeToUserStatuses(stomp);

      // Đăng ký nhận cập nhật về thống báo
      subscribeToNotifications(stomp);

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

  // Đăng ký nhận thông báo trạng thái người dùng
  const subscribeToUserStatuses = (client = stompClient) => {
    if (client && user) {
      // Đăng ký nhận cập nhật trạng thái người dùng
      console.log(`Đăng ký nhận thông báo tại: /topic/status/${user.username}`);

      client.subscribe(`/topic/status/${user.username}`, (message) => {
        console.log("📥 Đã nhận tin nhắn:", message);
        try {
          const response = JSON.parse(message.body);
          console.log("📥 Nhận cập nhật trạng thái:", response);

          // Xử lý thông báo trạng thái người dùng
          if (response.userId && response.online !== undefined) {
            setOnlineUsers(prev => {
              const newSet = new Set(Array.from(prev));

              if (response.online) {
                newSet.add(response.userId);
              } else {
                newSet.delete(response.userId);
              }

              return newSet;
            });
          }

          // Xử lý danh sách người dùng online
          if (response.onlineFriends) {
            setOnlineUsers(new Set(response.onlineFriends));
            console.log("Đã cập nhật danh sách người dùng online:", response.onlineFriends);
          }
        } catch (e) {
          console.error("Lỗi khi xử lý trạng thái:", e);
        }
      });

      // Sau khi kết nối, gửi trạng thái online để server cập nhật
      sendOnlineStatus(client);

      // Yêu cầu danh sách người dùng đang online
      requestOnlineUsersList(client);

    }
  };

  // Đăng ký nhận thông báo
  const subscribeToNotifications = (client = stompClient) => {
    if (client && user) {
      console.log(`Đăng ký nhận thông báo tại: /topic/notifications/${user.username}`);

      client.subscribe(`/topic/notifications/${user.username}`, (message) => {
        console.log("📥 Đã nhận tin nhắn:", message);
        try {
          const response = JSON.parse(message.body);
          setNotify(prev => [...prev, response]);

        } catch (e) {
          console.error("Lỗi khi xử lý trạng thái:", e);
        }
      });

      // Yêu cầu danh sách thông báo
      requestNotificationsList(client);
    }
  };

  const requestNotificationsList = (client = stompClient) => {
    if (client && user) {
      const payload = { userId: user.userID, username: user.username };
      console.log("📤 Yêu cầu danh sách thông báo");
      client.send('/app/status/get-notification', {}, JSON.stringify(payload));
    }
  };

  const requestOnlineUsersList = (client = stompClient) => {
    if (client && user) {
      const payload = { userId: user.userID, username: user.username };
      console.log("📤 Yêu cầu danh sách người dùng online");
      client.send('/app/status/get-online-users', {}, JSON.stringify(payload));
    }
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
    if (client && user) {
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

  // Kiểm tra người dùng có online không
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
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
      onlineUsers: Array.from(onlineUsers), // Export danh sách người dùng online
      isUserOnline, // Export hàm kiểm tra người dùng có online không
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