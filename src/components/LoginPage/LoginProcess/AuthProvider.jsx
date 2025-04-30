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

  // ...existing code...

  // Kết nối WebSocket
  const connectWebSocket = () => {
    // --- KIỂM TRA CHẶT CHẼ HƠN ---
    // Đảm bảo user và user.userID đều tồn tại
    if (!user || !user.userID || isConnecting || connected) {
        if (!user || !user.userID) {
            console.warn("Attempted to connect WebSocket without a valid user ID.");
        }
        return;
    }
    // --- KẾT THÚC KIỂM TRA ---

    setIsConnecting(true);

    const stomp = Stomp.over(() => {
        console.log("Creating new SockJS connection...");
        return new SockJS('http://localhost:8080/ws');
    });

    // Header cho kết nối
    // --- Dòng 71 --- Đã được bảo vệ bởi kiểm tra ở trên
    const headers = {
      'userId': user.userID.toString()
    };

    // stomp.reconnect_delay = 5000;

    stomp.connect(headers, (frame) => {
      console.log("🔌 WebSocket Đã kết nối!", frame);

      stomp.debug = function(str) {
        console.log("STOMP Debug:", str);
      };

      setStompClient(stomp);
      setConnected(true);
      setIsConnecting(false);

      // --- KIỂM TRA TRƯỚC KHI LOG ---
      console.log("Đã kết nối với user:", user?.userID); // Sử dụng optional chaining

      sendOnlineStatus(stomp);
      subscribeToUserStatuses(stomp);

    }, (error) => {
      console.error("❌ Lỗi kết nối WebSocket:", error);
      setIsConnecting(false);
      setConnected(false);
      setStompClient(null);

      // Thử kết nối lại thủ công (có thể không cần nếu dùng reconnect_delay)
      // setTimeout(() => {
      //   // Kiểm tra lại user và userID trước khi thử lại
      //   if (user && user.userID && !connected && !isConnecting) {
      //     connectWebSocket();
      //   }
      // }, 5000);
    });

    stomp.onWebSocketError = (error) => {
        console.error('Error with websocket', error);
        setConnected(false);
        setIsConnecting(false);
        setStompClient(null);
    };

    stomp.onWebSocketClose = (event) => {
        console.log('Websocket closed', event);
        setConnected(false);
        setIsConnecting(false);
        setStompClient(null);
        // Thử kết nối lại thủ công (có thể không cần nếu dùng reconnect_delay)
        // setTimeout(() => {
        //   // Kiểm tra lại user và userID trước khi thử lại
        //   if (user && user.userID && !connected && !isConnecting) {
        //     connectWebSocket();
        //   }
        // }, 5000);
    };
  };

  // Đăng ký nhận thông báo trạng thái người dùng
  const subscribeToUserStatuses = (client = stompClient) => {
    // --- KIỂM TRA user VÀ user.userID ---
    if (client && user && user.userID) {
      console.log(`Đăng ký nhận thông báo tại: /user/${user.userID}/queue/statususer`);

      client.subscribe(`/user/${user.userID}/queue/statususer`, (message) => {
        // ... (xử lý message như cũ) ...
        console.log("📥 Đã nhận tin nhắn:", message);
        try {
          const response = JSON.parse(message.body);
          console.log("📥 Nhận cập nhật trạng thái:", response);

          // Xử lý thông báo trạng thái người dùng
          if (response.userId && response.online !== undefined) {
            setOnlineUsers(prev => {
              const newSet = new Set(prev); // Tạo Set mới từ Set cũ

              if (response.online) {
                newSet.add(response.userId);
              } else {
                newSet.delete(response.userId);
              }

              return newSet; // Trả về Set mới
            });
          }

          // Xử lý danh sách người dùng online ban đầu
          if (response.onlineUsers) { // Giả sử server trả về key là onlineUsers
            setOnlineUsers(new Set(response.onlineUsers));
            console.log("Đã cập nhật danh sách người dùng online:", response.onlineUsers);
          }
        } catch (e) {
          console.error("Lỗi khi xử lý trạng thái:", e);
        }
      });

      sendOnlineStatus(client);
      requestOnlineUsersList(client);
    } else {
        console.warn("Không thể đăng ký nhận status: client hoặc user/userID không hợp lệ.");
    }
  };

  const requestOnlineUsersList = (client = stompClient) => {
    // --- KIỂM TRA user VÀ user.userID ---
    if (client && user && user.userID) {
      const payload = { userId: user.userID };
      console.log("📤 Yêu cầu danh sách người dùng online");
      client.send('/app/status/get-online-users', {}, JSON.stringify(payload));
    }
  };

  // Ngắt kết nối WebSocket
  const disconnectWebSocket = () => {
    // Kiểm tra stompClient trước khi truy cập thuộc tính/phương thức
    if (stompClient && stompClient.connected) {
      // Gửi trạng thái offline trước khi ngắt kết nối
      sendOfflineStatus(stompClient);

      stompClient.disconnect(() => {
        console.log("🔌 WebSocket đã ngắt kết nối");
      });
    }
    // Luôn reset state dù có kết nối hay không
    setConnected(false);
    setStompClient(null);
    setIsConnecting(false);
  };


  // Gửi trạng thái online
  const sendOnlineStatus = (client = stompClient) => {
    // --- KIỂM TRA client, user VÀ user.userID ---
    if (client && client.connected && user && user.userID) {
      const payload = { userId: user.userID };
      console.log("📤 Gửi trạng thái online");
      client.send('/app/status/online', {}, JSON.stringify(payload));
    }
  };

  // Gửi trạng thái offline
  const sendOfflineStatus = (client = stompClient) => {
    // --- KIỂM TRA client, connected, user VÀ user.userID ---
    // Chỉ gửi nếu thực sự đang kết nối
    if (client && connected && user && user.userID) {
      const payload = { userId: user.userID };
      console.log("📤 Gửi trạng thái offline");
      try {
        client.send('/app/status/offline', {}, JSON.stringify(payload));
      } catch (error) {
        console.warn("Không thể gửi trạng thái offline, kết nối có thể đang đóng:", error);
      }
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