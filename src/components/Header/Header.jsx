import { Avatar, Badge, Divider, Menu, MenuItem } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import fblogo from "../../assets/facebook-logo.jpg"
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HomeIcon from '@mui/icons-material/Home';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import NotificationsSharpIcon from '@mui/icons-material/NotificationsSharp';
import KeyboardArrowDownSharpIcon from '@mui/icons-material/KeyboardArrowDownSharp';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";
import authService from "../LoginPage/LoginProcess/ValidateLogin";
import { useAuth } from "../LoginPage/LoginProcess/AuthProvider";
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import PersonIcon from '@mui/icons-material/Person';
import { notification } from "antd";
const Header = () => {
  const notificationsTest = [
    {
      id: 1,
      type: 'friend_request',
      user: {
        name: 'Huyền Ngọc Lê',
        avatar: 'https://via.placeholder.com/40',
        followersCount: null
      },
      time: '1 ngày',
      isRead: false
    },
    {
      id: 2,
      type: 'friend_request',
      user: {
        name: 'Ne Ri',
        avatar: 'https://via.placeholder.com/40',
        followersCount: 739
      },
      time: '5 ngày',
      isRead: false
    },
    {
      id: 3,
      type: 'mention',
      user: {
        name: 'Zeus De Prince',
        avatar: 'https://via.placeholder.com/40',
        followersCount: null
      },
      content: 'đã nhắc đến bạn và những người khác ở một bình luận trong Ổ Béo Phì.',
      time: '3 ngày',
      isRead: false
    },
    {
      id: 4,
      type: 'mention',
      user: {
        name: 'Zeus De Prince',
        avatar: 'https://via.placeholder.com/40',
        followersCount: null
      },
      content: 'đã nhắc đến bạn và những người khác ở một bình luận trong Ổ Béo Phì.',
      time: '4 ngày',
      isRead: false
    },
    {
      id: 5,
      type: 'friend_request',
      user: {
        name: 'No Muối Tám',
        avatar: 'https://via.placeholder.com/40',
        followersCount: 1400
      },
      time: '5 ngày',
      isRead: false
    }
  ];
  
  const { notifications } = useAuth();
  console.log(notifications);
  // Hàm để tính thời gian tương đối
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

  // Lọc thông báo trong 24 giờ qua
  const filterRecentNotifications = (notifications) => {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    return notifications.filter(notification => {
      const creationDate = new Date(notification.creationDate);
      return creationDate >= oneDayAgo && notification.type!=="MESSAGE";
    } );
  };

  const filterPreviousotifications = (notifications) => {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    return notifications.filter(notification => {
      const creationDate = new Date(notification.creationDate);
      return creationDate < oneDayAgo && notification.type!=="MESSAGE";
    } );
  };


  const getNotificationIcon = (type) => {
    switch (type) {
      case "FRIEND_REQUEST":
        return <PersonIcon className="text-white" fontSize="small" />;
      case "LIKE":
        return <ThumbUpAltIcon className="text-white" fontSize="small" />;
      case "COMMENT":
        return <ChatBubbleIcon className="text-white"  fontSize="small"/>;
      default:
        return null;
    }
  };

  // Trong component của bạn:
  const recentNotifications = filterRecentNotifications(notifications);

  const previousNotifications = filterPreviousotifications(notifications);

  const navigate = useNavigate();
  const [search, setSearch] = React.useState("")

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const searchRef = useRef(null); // Tham chiếu đến vùng chứa ô tìm kiếm và dropdown


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

  const handleEnterInput = (value) => {
    navigate(`/search/top?q=${value}`);
  }
  // Xử lý khi click bên ngoài vùng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchActive(false); // Ẩn dropdown nếu click ra ngoài
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);

  };

  const handleLogout = () => {
    authService.logout();

    setTimeout(() => {
      navigate("/login");
    }, 200);
  };

  const handleSearchUser = (e) => {
    setSearch(e.target.value)
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleRemoveSearch = (searchToRemove) => {
    console.log(searchToRemove);
    setRecentSearches(recentSearches.filter(search => search !== searchToRemove));
  };

  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
    const filteredUsers = allUsers.filter(user => user.fullName.toLowerCase().includes(value.toLowerCase()));

    if (filteredUsers.length > 0) {
      // Lấy danh sách fullName từ các user đã lọc
      setRecentSearches(filteredUsers.map(user => user.fullName));
    } else {
      setRecentSearches([value]); // Đặt recentSearches thành mảng rỗng nếu không có kết quả
    }
  }




  //Thông báo
  // Thêm state để theo dõi việc click
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const notificationPopupRef = useRef(null);

  // Xử lý khi click vào biểu tượng thông báo
  const handleNotificationClick = () => {
    setShowNotifications(prevState => !prevState);
  };

  // Xử lý khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      // Kiểm tra nếu click ngoài cả biểu tượng thông báo và dropdown
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        notificationPopupRef.current &&
        !notificationPopupRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    // Thêm event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="sticky top-0 z-50 bg-white flex items-center p-2 lg:px-5 shadow-md justify-between">
      {/* Left */}
      <div className="relative flex-grow max-w-xs" ref={searchRef}>
        <div className="flex items-center space-x-2">
          <div onClick={() => navigate("/")} className="cursor-pointer">
            <Avatar src={fblogo} sx={{ width: 40, height: 40 }} className="mr-2" />
          </div>
          <div className="flex-grow flex items-center space-x-2 bg-gray-100 rounded-full p-2">
            <button className="text-gray-600">
              <SearchIcon />
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm trên Facebook"
              className="w-full bg-transparent outline-none"
              value={searchTerm}
              onChange={(e) => { handleSearchTermChange(e.target.value) }}
              onFocus={() => setIsSearchActive(true)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                  handleEnterInput(e.target.value);
                  setIsSearchActive(false);
                }
              }}
            />
          </div>
        </div>

        {isSearchActive && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 border">
            <div className="p-4">
              {/* <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Mới đây</h3>
            <button className="text-blue-500">Chỉnh sửa</button>
          </div> */}
              {recentSearches.length === 0 ? (
                <div className="text-gray-500">Xin mời nhập tìm kiếm</div>
              ) : (
                recentSearches.map((search) => (
                  <div
                    key={search}
                    className="flex items-center justify-between hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                    onClick={() => {
                      navigate(`/search/top?q=${search}`);
                      setIsSearchActive(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <AccessTimeIcon className="text-gray-500 w-5 h-5" />
                      <span>{search}</span>
                    </div>
                    <button onClick={() => handleRemoveSearch(search)}>
                      <CloseIcon className="text-gray-500 w-5 h-5 cursor-pointer" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center space-x-4">
        <HomeIcon sx={{ width: 40, height: 40 }} className="icon cursor-pointer p-2 hover:bg-gray-200 rounded-full" />
        <ChatBubbleIcon
          sx={{ width: 40, height: 40 }}
          className="icon cursor-pointer p-2 hover:bg-gray-200 rounded-full"
          onClick={() => navigate("/messages")}
        />
        <div
          ref={notificationRef}
          className="relative"
        >
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsSharpIcon
              sx={{ width: 40, height: 40 }}
              className="icon cursor-pointer p-2 hover:bg-gray-200 rounded-full"
              onClick={handleNotificationClick}
            />
          </Badge>

          {/* Notification Popup */}
          {showNotifications && (
            <div
              ref={notificationPopupRef}
              className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50"
              style={{ maxHeight: '80vh', overflowY: 'auto' }}
            >
              <div className="flex justify-between items-center p-4">
                <h2 className="text-2xl font-bold">Thông báo</h2>
                <div className="text-gray-600 cursor-pointer">...</div>
              </div>

              <div className="flex space-x-2 px-4 pb-2">
                <button className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  Tất cả
                </button>
                <button className="hover:bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                  Chưa đọc
                </button>
              </div>

              {/* Lời mời kết bạn */}
              <div className="px-4 py-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Mới nhất</h3>
                  <a href="#" className="text-blue-500 text-sm">Xem tất cả</a>
                </div>

                {recentNotifications.slice(0, 3).map(notification => {
                  // Lấy thông tin user từ danh sách users dựa vào senderID
                  const sender = allUsers.find(user => user.userID === notification.senderID);

                  // Xác định nội dung thông báo
                  let content = notification.content;

                  return (
                    <div key={notification.notificationID} className="flex items-start space-x-2 mb-3 relative">
                      <div className="relative">
                        <Avatar src={sender?.avatarURL ? `http://localhost:8080/uploads${sender.avatarURL}` : "http://localhost:8080/uploads/avatars/default.jpg"} className="w-10 h-10" />
                        <div className={`absolute -bottom-1 -right-1 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs p-3 ${ notification.type === "COMMENT" ? "bg-green-500" : "bg-blue-500"}`}>
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

                        {/* {notification.type === "FRIEND_REQUEST" && (
                          <div className="flex space-x-2 mt-2">
                            <button className="bg-blue-500 text-white px-4 py-1 rounded text-sm font-medium">
                              Xác nhận
                            </button>
                            <button className="bg-gray-200 text-black px-4 py-1 rounded text-sm font-medium">
                              Xóa
                            </button>
                          </div>
                        )} */}
                      </div>
                      {notification.isReadFlag === 0 && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  )
                })}
              </div>

              <Divider />

              {/* Trước đó */}
              <div className="px-4 py-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Trước đó</h3>
                  <a href="#" className="text-blue-500 text-sm">Xem tất cả</a>
                </div>

                {previousNotifications.slice(0, 7).map(notification => {
                  // Lấy thông tin user từ danh sách users dựa vào senderID
                  const sender = allUsers.find(user => user.userID === notification.senderID);

                  // Xác định nội dung thông báo
                  let content = notification.content;

                  return (
                    <div key={notification.notificationID} className="flex items-start space-x-2 mb-3 relative">
                      <div className="relative">
                        <Avatar src={sender?.avatarURL ? `http://localhost:8080/uploads${sender.avatarURL}` : "http://localhost:8080/uploads/avatars/default.jpg"} className="w-10 h-10" />
                        <div className={`absolute -bottom-1 -right-1 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs p-3 ${ notification.type === "COMMENT" ? "bg-green-500" : "bg-blue-500"}`}>
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

                        {/* {notification.type === "FRIEND_REQUEST" && (
                          <div className="flex space-x-2 mt-2">
                            <button className="bg-blue-500 text-white px-4 py-1 rounded text-sm font-medium">
                              Xác nhận
                            </button>
                            <button className="bg-gray-200 text-black px-4 py-1 rounded text-sm font-medium">
                              Xóa
                            </button>
                          </div>
                        )} */}
                      </div>
                      {notification.isReadFlag === 0 && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  )
                })}

                {/* Thêm lời mời kết bạn vào phần "Trước đó" */}
                {/* {notificationsTest.filter(n => n.type === 'friend_request').slice(3).map(notification => (
                  <div key={notification.id} className="flex items-start space-x-2 mb-3 relative">
                    <div className="relative">
                      <Avatar src={notification.user.avatar} className="w-10 h-10" />
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        <i className="fas fa-user-plus"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{notification.user.name}</span> đã gửi cho bạn lời mời kết bạn.
                      </p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                      {notification.user.followersCount && (
                        <p className="text-xs text-gray-500">Có {notification.user.followersCount} người theo dõi</p>
                      )}
                      <div className="flex space-x-2 mt-2">
                        <button className="bg-blue-500 text-white px-4 py-1 rounded text-sm font-medium">
                          Xác nhận
                        </button>
                        <button className="bg-gray-200 text-black px-4 py-1 rounded text-sm font-medium">
                          Xóa
                        </button>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))} */}
              </div>

              <div className="p-3">
                <button className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded text-sm font-medium">
                  Xem thông báo trước đó
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 cursor-pointer bg-gray-200 rounded-full p-1" onClick={handleClick}>
          <Avatar sx={{ width: 40, height: 40 }} />
          <KeyboardArrowDownSharpIcon sx={{ width: 20, height: 20, color: "gray" }} />
        </div>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>My account</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </div>
    </div>
  )
}
export default Header;
