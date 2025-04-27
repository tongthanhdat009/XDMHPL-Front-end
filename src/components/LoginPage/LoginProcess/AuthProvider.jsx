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

  const payload = user ? { userId: user.user.userID } : null;
  // Kết nối WebSocket
  const connectWebSocket = () => {
    if (!user) return

    const socket = new SockJS('http://localhost:8080/ws')
    const stompClient = Stomp.over(socket)

    stompClient.connect({}, frame => {
      console.log('Connected to WebSocket:', frame)
      stompClientRef.current = stompClient

      // Đăng ký nhận thông báo về trạng thái bạn bè
      stompClient.subscribe(`/user/${user.user.fullName}/queue/friend-status`, message => {
        const statusUpdate = JSON.parse(message.body)
        setFriendsOnlineStatus(prev => ({
          ...prev,
          [statusUpdate.userId]: statusUpdate.online
        }))
      })

      // Gửi thông báo rằng người dùng(đang đăng nhập) đã online
      sendOnlineStatus()

      // Thiết lập heartbeat
      startHeartbeat()
    }, error => {
      console.error('WebSocket connection error:', error)
      // Thử kết nối lại sau 3 giây
      setTimeout(connectWebSocket, 3000)
    })

    // Xử lý khi kết nối bị đóng
    socket.onclose = () => {
      console.log('WebSocket connection closed')
      stompClientRef.current = null
      // Thử kết nối lại sau 3 giây
      setTimeout(connectWebSocket, 3000)
    }
  }

  // Gửi trạng thái online
  const sendOnlineStatus = () => {
    if (stompClientRef.current && stompClientRef.current.connected && user) {
      stompClientRef.current.send('/app/status/online', {} , JSON.stringify(payload));
    }
  }

  // Gửi trạng thái offline
  const sendOfflineStatus = () => {
    if (stompClientRef.current && stompClientRef.current.connected && user) {
      stompClientRef.current.send(
        '/app/status/offline' ,{} ,JSON.stringify(payload))
    }
  }

  // Thiết lập heartbeat để duy trì kết nối
  const startHeartbeat = () => {
    const intervalId = setInterval(() => {
      if (stompClientRef.current && stompClientRef.current.connected && user) {
        stompClientRef.current.send(
          '/app/status/heartbeat',{} ,JSON.stringify(payload))
      } else {
        clearInterval(intervalId)
      }
    }, 60000) // 1 phút

    // Lưu intervalId để có thể clear khi cần
    stompClientRef.current.heartbeatIntervalId = intervalId
  }

  const login = async (...args) => {
    const result = await authService.login(...args)
    if (result.success) {
      setUser(authService.getCurrentUser())
      // WebSocket sẽ được kết nối tự động nhờ useEffect phía trên
    }
    return result
  }


  const logout = () => {
    // Gửi trạng thái offline trước khi đăng xuất
    sendOfflineStatus()
    // Ngắt kết nối WebSocket
    if (stompClientRef.current) {
      if (stompClientRef.current.heartbeatIntervalId) {
        clearInterval(stompClientRef.current.heartbeatIntervalId)
      }
      stompClientRef.current.disconnect()
      stompClientRef.current = null
    }


    authService.logout()
    setUser(null)

    setFriendsOnlineStatus({})
  }


  // Hàm để lấy trạng thái online của một người dùng cụ thể
  const isFriendOnline = (username) => {
    return !!friendsOnlineStatus[username]
  }
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
  )
}

// 2. Custom Hook
export const useAuth = () => {
  return useContext(AuthContext)
}