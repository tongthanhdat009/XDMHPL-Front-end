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
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  // Lấy notify từ localStorage nếu có
  const [notify, setNotify] = useState(() => {
    try {
      const savedNotify = localStorage.getItem(`notifications_${user?.userID}`);
      return savedNotify ? JSON.parse(savedNotify) : [];
    } catch (e) {
      console.error("Lỗi khi đọc thông báo từ localStorage:", e);
      return [];
    }
  });
  const [subscriptions, setSubscriptions] = useState({});

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

  // Lưu notify vào localStorage khi nó thay đổi
  useEffect(() => {
    if (user && notify) {
      try {
        localStorage.setItem(`notifications_${user.userID}`, JSON.stringify(notify));
      } catch (e) {
        console.error("Lỗi khi lưu thông báo vào localStorage:", e);
      }
    }
  }, [notify, user]);

  // Xử lý sự kiện đồng bộ thông báo giữa các tab
  useEffect(() => {
    // Hàm xử lý khi có thay đổi từ tab khác
    const handleStorageChange = (e) => {
      if (user && e.key === `notifications_${user.userID}`) {
        try {
          const newNotifications = JSON.parse(e.newValue);
          if (newNotifications && Array.isArray(newNotifications)) {
            setNotify(newNotifications);
            console.log("Đã đồng bộ thông báo từ tab khác");
          }
        } catch (e) {
          console.error("Lỗi khi đồng bộ thông báo:", e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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

    // Kiểm tra xem đã có kết nối khác chưa (giữa các tab)
    const existingConnectionId = sessionStorage.getItem(`wsConnection_${user.userID}`);
    const tabId = Date.now().toString(); // ID duy nhất cho tab hiện tại

    // Thêm giá trị ngẫu nhiên để tránh trùng lặp giữa các tab được mở cùng lúc
    sessionStorage.setItem(`wsConnection_${user.userID}`, tabId);

    const socket = new SockJS('http://localhost:8080/ws');
    const stomp = Stomp.over(socket);

    // Header cho kết nối
    const headers = {
      'username': user.username,
      'tabId': tabId
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
      console.log("Tab ID:", tabId);

      // Gửi trạng thái online sau khi kết nối thành công
      sendOnlineStatus(stomp);

      // Đăng ký nhận cập nhật về trạng thái người dùng
      subscribeToUserStatuses(stomp);

      // Đăng ký nhận cập nhật về thông báo
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

      // Xóa thông tin kết nối từ sessionStorage nếu là tab sở hữu kết nối
      if (sessionStorage.getItem(`wsConnection_${user.userID}`) === tabId) {
        sessionStorage.removeItem(`wsConnection_${user.userID}`);
      }

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
      // Hủy đăng ký cũ nếu có
      if (subscriptions.statusSubscription) {
        try {
          subscriptions.statusSubscription.unsubscribe();
        } catch (e) {
          console.error("Lỗi khi hủy đăng ký trạng thái:", e);
        }
      }

      const statusSub = client.subscribe(`/topic/status/${user.username}`, (message) => {
        try {
          const response = JSON.parse(message.body);
          console.log("📥 Nhận cập nhật trạng thái:", response);

          // Xử lý thông báo trạng thái người dùng
          if (response.userId && response.online !== undefined) {
            setOnlineUsers(prev => {
              const newSet = new Set(prev); // Tạo bản sao của Set hiện tại

              if (response.online) {
                newSet.add(response.userId); // Chỉ thêm userId
              } else {
                newSet.delete(response.userId); // Chỉ xóa userId
              }

              return newSet;
            });
          }

          // Xử lý danh sách người dùng online
          if (response.onlineUsers && Array.isArray(response.onlineUsers)) {
            const onlineUserIds = response.onlineUsers
              .filter(user => user.online) // Chỉ lấy user online
              .map(user => user.userId); // Lấy danh sách userId
            setOnlineUsers(new Set(onlineUserIds));
            console.log("Đã cập nhật danh sách người dùng online:", onlineUserIds);
          }
        } catch (e) {
          console.error("Lỗi khi xử lý trạng thái:", e);
        }
      });

      // Lưu subscription để có thể hủy đăng ký sau này
      setSubscriptions(prev => ({ ...prev, statusSubscription: statusSub }));

      // Sau khi kết nối, gửi trạng thái online để server cập nhật
      sendOnlineStatus(client);

      // Yêu cầu danh sách người dùng đang online
      requestOnlineUsersList(client);
    }
  };

  // Đăng ký nhận thông báo
  const subscribeToNotifications = (client = stompClient) => {
    if (client && user) {
      // Hủy đăng ký cũ nếu có
      if (subscriptions.notificationSubscription) {
        try {
          subscriptions.notificationSubscription.unsubscribe();
        } catch (e) {
          console.error("Lỗi khi hủy đăng ký thông báo:", e);
        }
      }

      const notifySub = client.subscribe(`/topic/notifications/${user.username}`, (message) => {
        console.log("📥 Đã nhận thông báo:", message);
        try {
          const response = JSON.parse(message.body);

          // Kiểm tra xem response có phải là mảng không
          if (Array.isArray(response)) {
            // Nếu là mảng (phản hồi từ requestNotificationsList), thay thế toàn bộ
            // Lọc các phần tử hợp lệ
            const validNotifications = response.filter(item => item && item.notificationID);
            console.log("Nhận danh sách thông báo từ server:", validNotifications);
            setNotify(validNotifications);
          } else if (response.notificationID) {
            // Nếu là một thông báo đơn lẻ và có id, thêm vào nếu chưa tồn tại
            setNotify(prev => {
              // Kiểm tra xem thông báo đã tồn tại chưa
              if (prev.some(item => item.notificationID === response.notificationID)) {
                return prev; // Không thêm nếu đã tồn tại
              }
              const newNotify = [...prev, response]; // Thêm nếu chưa tồn tại
              return newNotify;
            });
          } else {
            // Trường hợp khác, có thể là thông báo không có id
            console.log("Nhận thông báo không có id:", response);
            // Bạn có thể thêm logic xử lý khác tại đây
          }
        } catch (e) {
          console.error("Lỗi khi xử lý thông báo:", e);
        }
      });

      // Lưu subscription để có thể hủy đăng ký sau này
      setSubscriptions(prev => ({ ...prev, notificationSubscription: notifySub }));

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

      // Hủy tất cả các đăng ký
      Object.values(subscriptions).forEach(subscription => {
        try {
          if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
          }
        } catch (e) {
          console.error("Lỗi khi hủy đăng ký:", e);
        }
      });

      // Xóa danh sách đăng ký
      setSubscriptions({});

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

  // Xóa thông báo
  const clearNotification = (notificationId) => {
    setNotify(prev => prev.filter(notification => notification.notificationID !== notificationId));
    // Đồng thời gửi request xóa thông báo đến server nếu cần
    if (stompClient && connected && user) {
      const payload = { userId: user.userID, notificationId: notificationId };
      stompClient.send('/app/status/clear-notification', {}, JSON.stringify(payload));
    }
  };

  // Xóa tất cả thông báo
  const clearAllNotifications = () => {
    setNotify([]);
    // Đồng thời gửi request xóa tất cả thông báo đến server nếu cần
    if (stompClient && connected && user) {
      const payload = { userId: user.userID };
      stompClient.send('/app/status/clear-all-notifications', {}, JSON.stringify(payload));
    }
  };

  // Đánh dấu thông báo đã đọc
  const markNotificationAsRead = (notificationId) => {
    setNotify(prev =>
      prev.map(notification =>
        notification.notificationID === notificationId
          ? { ...notification, isReadFlag: true }
          : notification
      )
    );

    // Gửi cập nhật tới server nếu cần
    if (stompClient && connected && user) {
      const payload = { UserID: user.userID, notificationID: notificationId };
      stompClient.send('/app/status/mark-notification-read', {}, JSON.stringify(payload));
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
    // Xóa thông báo khỏi localStorage khi đăng xuất
    if (user) {
      localStorage.removeItem(`notifications_${user.userID}`);
    }
    authService.logout();
    setUser(null);
    setNotify([]);
  };

  return (
    <AuthContext.Provider value={{
      stompClient,
      user,
      connected,
      onlineUsers: Array.from(onlineUsers),
      notifications: notify,
      isUserOnline,
      clearNotification,
      clearAllNotifications,
      markNotificationAsRead, // Thêm hàm đánh dấu đã đọc
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