import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { Send, Paperclip, Info, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import authService from "./LoginPage/LoginProcess/ValidateLogin";
import { useAuth } from "./LoginPage/LoginProcess/AuthProvider";
import MoreVertIcon from '@mui/icons-material/MoreVert';
const ChatWindow = ({ selectedChat, messages, onAddMessage, currentUserId, messagesEndRef, updateChat }) => {
  console.log(messages);
  const [newMessage, setNewMessage] = useState("");
  const [media, setMedia] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [allUsers, setAllUsers] = useState([]);
  const { onlineUsers } = useAuth();
  // State để quản lý menu tùy chọn tin nhắn
  const [showOptionsMenu, setShowOptionsMenu] = useState(null);
  // State để quản lý tin nhắn đang chỉnh sửa
  const [editingMessage, setEditingMessage] = useState(null);

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

  // Xử lý click bên ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = () => setShowOptionsMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navigate = useNavigate();

  // Process messages received via WebSocket
  const handleWebSocketMessage = (messageOutput) => {
    try {
      const msg = JSON.parse(messageOutput.body);
      console.log("Received message:", msg);

      // Check if this is related to current chat
      if (msg.chatBoxId === selectedChat?.chatBoxID) {
        onAddMessage(msg);
        updateChat();
      }
    } catch (error) {
      console.error("Error processing websocket message:", error);
    }
  };

  // Setup WebSocket connection
  useEffect(() => {
    if (!selectedChat?.chatBoxID) return;

    const client = Stomp.over(() => new SockJS("http://localhost:8080/chat"));
    client.debug = () => { };

    setIsLoading(true);

    client.connect({}, (frame) => {
      console.log("✅ WebSocket connection established:", frame);
      setConnected(true);
      setStompClient(client);
      setIsLoading(false);

      // Subscribe to topic for this chat
      client.subscribe(`/topic/messages/${selectedChat.chatBoxID}`, handleWebSocketMessage);
    }, (error) => {
      console.error("WebSocket connection error:", error);
      setIsLoading(false);
    });

    return () => {
      if (client && client.connected) {
        client.disconnect(() => {
          console.log("WebSocket disconnected");
        });
      }
      setConnected(false);
      setStompClient(null);
    };
  }, [selectedChat?.chatBoxID]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !media) || !selectedChat) return;

    let mediaList = [];

    // Khi đang ở chế độ chỉnh sửa tin nhắn, không xử lý media
    if (media && !editingMessage) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", media);

      try {
        const uploadRes = await axios.post("http://localhost:8080/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const mediaUrl = uploadRes.data.url;

        // Tạo đối tượng MediaModel phù hợp với backend
        mediaList.push({
          // Không cần messageMediaID vì nó được tạo tự động từ backend
          mediaType: "image",
          mediaURL: mediaUrl,
          // Không cần message vì nó sẽ được liên kết từ backend
          // chatBox sẽ được thiết lập từ backend
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        setIsLoading(false);
        return;
      }
    }

    // Get current user from localStorage
    const storedUser = localStorage.getItem("currentUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    // Kiểm tra xem đang chỉnh sửa tin nhắn hay tạo tin nhắn mới
    if (editingMessage) {
      // Gửi yêu cầu cập nhật tin nhắn
      try {
        const updatePayload = {
          messageId: editingMessage.messageId,
          text: newMessage,
          // Các thông tin khác cần thiết
        };

        await axios.put(`http://localhost:8080/messages/update`, updatePayload);

        // Cập nhật tin nhắn trong state hiện tại
        // const updatedMessages = messages.map(msg => 
        //   msg.messageId === editingMessage.messageId ? {...msg, text: newMessage} : msg
        // );

        // Cập nhật state

        // Reset trạng thái chỉnh sửa
        setEditingMessage(null);
        setNewMessage("");
        setMedia(null);
      } catch (error) {
        console.error("Error updating message:", error);
      }

      return;
    }

    // Create message object
    const messagePayload = {
      senderId: user?.userID || currentUserId,
      receiverId: selectedChat.chatBoxID,
      chatBoxId: selectedChat.chatBoxID,
      text: newMessage,
      mediaList: mediaList,  // MediaModel array được định dạng phù hợp
    };

    console.log("Sending message:", messagePayload);
    try {
      // Send via WebSocket if connected
      if (stompClient && connected) {
        stompClient.send("/app/chat/send", {
          "content-type": "application/json"
        }, JSON.stringify(messagePayload));
      } else {
        // Fallback to HTTP if WebSocket not connected
        await axios.post("http://localhost:8080/messages/send", messagePayload);
      }

      // Reset input fields
      setNewMessage("");
      setMedia(null);
      setIsLoading(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setIsLoading(false);
    }
  };

  // Xử lý hiển thị menu tùy chọn
  const handleShowOptions = (e, messageId) => {
    e.stopPropagation(); // Ngăn sự kiện lan truyền để không đóng menu ngay lập tức
    setShowOptionsMenu(prevId => prevId === messageId ? null : messageId);
  };

  // Xử lý thu hồi tin nhắn
  const handleRecallMessage = async (messageId) => {
    try {
      await axios.put(`http://localhost:8080/messages/recall/${messageId}`);
      // Cập nhật UI sau khi thu hồi tin nhắn thành công

      setShowOptionsMenu(null);
    } catch (error) {
      console.error("Error recalling message:", error);
    }
  };

  // Xử lý chỉnh sửa tin nhắn
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.text);
    setShowOptionsMenu(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
    }
  };

  // Group messages by sender for UI display
  const groupedMessages = messages.reduce((acc, msg) => {
    const lastGroup = acc[acc.length - 1];

    if (lastGroup && lastGroup.userId === msg.userId) {
      lastGroup.messages.push(msg);
    } else {
      acc.push({
        userId: msg.userId,
        messages: [msg]
      });
    }

    return acc;
  }, []);

  // Tắt chế độ chỉnh sửa
  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
    setMedia(null); // Đảm bảo xóa media nếu có khi hủy chỉnh sửa
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat header */}
      {selectedChat ? (
        <>
          <div className="flex items-center p-3 border-b border-gray-300">
            <div className="flex items-center flex-1">
              <img
                src={selectedChat.chatBoxImage || "http://localhost:8080/assets/default-avatar.jpg"}
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-3">
                <h2 className="font-semibold">{selectedChat.chatBoxName || `Chat ${selectedChat.chatBoxID}`}</h2>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Info size={20} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {groupedMessages.length > 0 ? (
              groupedMessages.map((group, groupIndex) => {
                const isCurrentUser = group.userId === currentUserId;

                const user = allUsers.find(user => user.userID === group.userId);
                const isOnline = onlineUsers.includes(user?.userID);

                return (
                  <div key={groupIndex} className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    {!isCurrentUser && (
                      <div className="relative mr-2">
                        <img
                          src={user?.avatarURL ? 'http://localhost:8080/uploads' + user.avatarURL : "http://localhost:8080/uploads/avatars/default.jpg"}
                          alt={user?.fullName || "User"}
                          className="w-8 h-8 rounded-full cursor-pointer"
                          onClick={() => navigate(`/profile/${user?.userID}`)}
                        />
                        {isOnline && (
                          <div className="absolute right-0 bg-green-400 h-2 w-2 rounded-full border border-white p-1" />
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start ml-2'}`}>
                      {group.messages.map((msg, i) => {
                        const isRecalled = msg.display === false;
                        const isOwn = isCurrentUser;

                        return (
                          <div
                            key={msg.messageId}
                            className={`relative p-3 mb-1 rounded-2xl ${isRecalled
                                ? 'bg-white text-gray-500 italic'
                                : isOwn
                                  ? 'bg-blue-500 text-white group'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                          >
                            {isRecalled ? (
                              <div>Đã thu hồi một tin nhắn</div>
                            ) : (
                              <>
                                {isOwn && (
                                  <div className="absolute top-1 left-[-40px] -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                                      onClick={(e) => handleShowOptions(e, msg.messageId)}
                                    >
                                      <MoreVertIcon size={16} className="text-gray-500" />
                                    </button>

                                    {showOptionsMenu === msg.messageId && (
                                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                                        <div className="py-1">
                                          {(!msg.mediaList || msg.mediaList.length === 0) && (
                                            <button
                                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                              onClick={() => handleEditMessage(msg)}
                                            >
                                              Chỉnh sửa
                                            </button>
                                          )}
                                          <button
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            onClick={() => handleRecallMessage(msg.messageId)}
                                          >
                                            Thu hồi
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div>{msg.text}</div>
                                {msg.mediaList?.length > 0 &&
                                  msg.mediaList.map((media) => (
                                    <img
                                      key={media.messageMediaID}
                                      src={media.mediaURL}
                                      alt="media"
                                      className="mt-2 rounded max-w-xs"
                                    />
                                  ))}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {isLoading ?
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div> :
                  <p>Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
                }
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="p-3 border-t border-gray-300">
            {/* Hiển thị trạng thái chỉnh sửa nếu có */}
            {editingMessage && (
              <div className="flex justify-between items-center mb-2 px-3 py-1 bg-blue-50 rounded">
                <span className="text-sm text-blue-600">Đang chỉnh sửa tin nhắn</span>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={cancelEdit}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Chỉ hiển thị preview hình ảnh khi không ở chế độ chỉnh sửa */}
            {media && !editingMessage && (
              <div className="mb-2 relative inline-block">
                <img
                  src={URL.createObjectURL(media)}
                  alt="Preview"
                  className="h-20 rounded border border-gray-300"
                />
                <button
                  className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-white"
                  onClick={() => setMedia(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center bg-gray-100 rounded-full p-1">
              {/* Chỉ hiển thị nút Paperclip khi không ở chế độ chỉnh sửa */}
              {!editingMessage && (
                <button
                  className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
                  onClick={handleFileClick}
                >
                  <Paperclip size={20} />
                </button>
              )}

              <input
                type="text"
                className="flex-1 p-2 bg-transparent focus:outline-none"
                placeholder={editingMessage
                  ? "Chỉnh sửa tin nhắn..."
                  : `Nhắn tin với ${selectedChat.chatBoxName || "người dùng"}`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />

              <button
                className={`p-2 rounded-full ${newMessage.trim() || media ? 'bg-blue-500 text-white' : 'text-gray-400'
                  }`}
                onClick={handleSendMessage}
                disabled={(!newMessage.trim() && !media) || isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send size={20} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Chọn một cuộc trò chuyện để bắt đầu
        </div>
      )
      }
    </div >
  );
};
export default ChatWindow;
