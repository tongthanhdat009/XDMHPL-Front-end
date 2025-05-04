/* src/components/NotificationOverlay/NotificationOverlay.jsx */
import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import { useAuth } from '../LoginPage/LoginProcess/AuthProvider';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import PersonIcon from '@mui/icons-material/Person';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useNavigate } from 'react-router-dom';

const NotificationOverlay = () => {
  const user = authService.getCurrentUser();
  const [loading, setLoading] = useState(false);
  const { notifications, markNotificationAsRead } = useAuth();
  const navigate = useNavigate();
 
  const [allUsers, setAllUsers] = useState([]);
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

  // Load thêm thông báo


  const getRelativeTime = (dateString) => {
    const now = new Date();
    const creationDate = new Date(dateString);
    const diffInMs = now - creationDate;

    // Chuyển đổi mili giây thành phút
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    // Chuyển đổi thành giờ
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    // Chuyển đổi thành ngày
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };
  // Format time
  
  const [filterType, setFilterType] = useState("all"); // "all" hoặc "unread"

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const filterRecentNotifications = (notifications) => {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    return notifications.filter(notification => {
      const creationDate = new Date(notification.creationDate);
      return creationDate >= oneDayAgo && notification.type !== "MESSAGE";
    });
  };

  const filterPreviousotifications = (notifications) => {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    return notifications.filter(notification => {
      const creationDate = new Date(notification.creationDate);
      return creationDate < oneDayAgo && notification.type !== "MESSAGE";
    });
  };

  // Lọc tất cả thông báo chưa đọc
  const filterUnreadNotifications = (notifications) => {
    return notifications.filter(notification =>
      notification.isReadFlag === 0 && notification.type !== "MESSAGE"
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "FRIEND_REQUEST":
        return <PersonIcon className="text-white" fontSize="small" />;
      case "LIKE":
        return <ThumbUpAltIcon className="text-white" fontSize="small" />;
      case "COMMENT":
        return <ChatBubbleIcon className="text-white" fontSize="small" />;
      default:
        return null;
    }
  };
  // Trong component của bạn:
  const recentNotifications = filterRecentNotifications(notifications);
  const previousNotifications = filterPreviousotifications(notifications);
  const handleNotificationItemClick = (notification) => {
    if (notification.isReadFlag === 0) {
      markNotificationAsRead(notification.notificationID);
    }
    switch (notification.type) {
      case "FRIEND_REQUEST":
        navigate(`/profile/${notification.senderID}`);
        break;
      case "LIKE":
        navigate(`/post/${notification.postID}`);
        break;
      case "COMMENT":
        navigate(`/post/${notification.postID}?commentId=${notification.commentID}`);
        break;
      default:
        break;
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Thông báo</h1>
        {/* <button
          onClick={markAllAsRead}
          disabled={loading}
          className="text-sm text-blue-500 hover:underline"
        >
          Đánh dấu tất cả đã đọc
        </button> */}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`${filterType === "all" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"} px-3 py-1 rounded-full text-sm font-medium`}
          onClick={() => handleFilterChange("all")}
        >
          Tất cả
        </button>
        <button
          className={`${filterType === "unread" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"} px-3 py-1 rounded-full text-sm font-medium`}
          onClick={() => handleFilterChange("unread")}
        >
          Chưa đọc
        </button>
      </div>

      {/* Hiển thị thông báo theo loại lọc đã chọn */}
      {filterType === "all" ? (
        <>
          {/* Phần hiển thị thông báo mới nhất khi chọn "Tất cả" */}
          {recentNotifications.length > 0 && (
            <div className="px-4 py-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Mới nhất</h3>
              </div>

              {recentNotifications.map(notification => {
                // Lấy thông tin user từ danh sách users dựa vào senderID
                const sender = allUsers.find(user => user.userID === notification.senderID);

                // Xác định nội dung thông báo
                let content = notification.content;

                return (
                  <div key={notification.notificationID} className="flex items-start space-x-2 mb-3 p-2 relative cursor-pointer hover:bg-gray-200 hover:rounded-2xl" onClick={() => handleNotificationItemClick(notification)}>
                    <div className="relative">
                      <Avatar src={sender?.avatarURL ? `http://localhost:8080/uploads${sender.avatarURL}` : "http://localhost:8080/uploads/avatars/default.jpg"} className="w-10 h-10" />
                      <div className={`absolute -bottom-1 -right-1 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs p-3 ${notification.type === "COMMENT" ? "bg-green-500" : "bg-blue-500"}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{sender?.fullName || "Người dùng"}</span>{" "}
                        {notification.type === "FRIEND_REQUEST" && content}
                        {notification.type === "LIKE" && content}
                        {notification.type === "COMMENT" && content}
                      </p>
                      <p className="text-xs text-gray-500">{getRelativeTime(notification.creationDate)}</p>
                    </div>
                    {notification.isReadFlag === 0 && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {(recentNotifications.length > 0 && previousNotifications.length > 0) && <Divider />}

          {/* Phần hiển thị thông báo trước đó khi chọn "Tất cả" */}
          {previousNotifications.length > 0 && (
            <div className="px-4 py-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Trước đó</h3>
              </div>

              {previousNotifications.map(notification => {
                // Lấy thông tin user từ danh sách users dựa vào senderID
                const sender = allUsers.find(user => user.userID === notification.senderID);

                // Xác định nội dung thông báo
                let content = notification.content;

                return (
                  <div key={notification.notificationID} className="flex items-start space-x-2 mb-3 relative cursor-pointer p-2 hover:bg-gray-200 hover:rounded-2xl" onClick={() => handleNotificationItemClick(notification)}>
                    <div className="relative">
                      <Avatar src={sender?.avatarURL ? `http://localhost:8080/uploads${sender.avatarURL}` : "http://localhost:8080/uploads/avatars/default.jpg"} className="w-10 h-10" />
                      <div className={`absolute -bottom-1 -right-1 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs p-3 ${notification.type === "COMMENT" ? "bg-green-500" : "bg-blue-500"}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{sender?.fullName || "Người dùng"}</span>{" "}
                        {notification.type === "FRIEND_REQUEST" && content}
                        {notification.type === "LIKE" && content}
                        {notification.type === "COMMENT" && content}
                      </p>
                      <p className="text-xs text-gray-500">{getRelativeTime(notification.creationDate)}</p>
                    </div>
                    {notification.isReadFlag === 0 && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        /* Hiển thị tất cả thông báo chưa đọc khi chọn "Chưa đọc" */
        <>
          {filterUnreadNotifications(notifications).length > 0 ? (
            <div className="px-4 py-2">
              {filterUnreadNotifications(notifications).map(notification => {
                // Lấy thông tin user từ danh sách users dựa vào senderID
                const sender = allUsers.find(user => user.userID === notification.senderID);

                // Xác định nội dung thông báo
                let content = notification.content;

                return (
                  <div key={notification.notificationID} className="flex items-start space-x-2 mb-3 p-2 relative cursor-pointer hover:bg-gray-200 hover:rounded-2xl" onClick={() => handleNotificationItemClick(notification)}>
                    <div className="relative">
                      <Avatar src={sender?.avatarURL ? `http://localhost:8080/uploads${sender.avatarURL}` : "http://localhost:8080/uploads/avatars/default.jpg"} className="w-10 h-10" />
                      <div className={`absolute -bottom-1 -right-1 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs p-3 ${notification.type === "COMMENT" ? "bg-green-500" : "bg-blue-500"}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{sender?.fullName || "Người dùng"}</span>{" "}
                        {notification.type === "FRIEND_REQUEST" && content}
                        {notification.type === "LIKE" && content}
                        {notification.type === "COMMENT" && content}
                      </p>
                      <p className="text-xs text-gray-500">{getRelativeTime(notification.creationDate)}</p>
                    </div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-gray-500">Không có thông báo chưa đọc</p>
            </div>
          )}
        </>
      )}

      {/* Hiển thị thông báo khi không có thông báo nào cả */}
      {filterType === "all" && recentNotifications.length === 0 && previousNotifications.length === 0 && (
        <div className="px-4 py-6 text-center">
          <p className="text-gray-500">Không có thông báo</p>
        </div>
      )}

      {filterType === "all" && previousNotifications.length > 0 && (
        <div className="p-3">
          <button className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded text-sm font-medium">
            Xem thông báo trước đó
          </button>
        </div>
      )}
    </div>

  );
};

export default NotificationOverlay;