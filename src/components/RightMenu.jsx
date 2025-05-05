import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {Info, X, Edit } from 'lucide-react';

const RightMenu = ({ selectedChat, onUpdateChat, currentUserId }) => {
  const [chatInfo, setChatInfo] = useState({
    name: "",
    image: "/assets/default-avatar.jpg" 
  });
  console.log(currentUserId);
  const [sentImages, setSentImages] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedChat?.chatBoxID && currentUserId) {
      fetchChatDetails();
      fetchChatImages();
    }
  }, [selectedChat, currentUserId]);

  const fetchChatDetails = async () => {
    if (!selectedChat) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/chatbox/info/${selectedChat.chatBoxID}/${currentUserId}`
      );
      const chatData = response.data;
      
      setChatInfo({
        name: chatData.chatBoxName || "Nhóm đã bị khóa",
        image: chatData.chatBoxImage || "/assets/default-avatar.jpg"
      });
      
      setNewName(chatData.chatBoxName || "");
    } catch (error) {
      console.error("Error fetching group info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatImages = async () => {
    if (!selectedChat) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/chatbox/images/${selectedChat.chatBoxID}`
      );
      
      const processedImages = (response.data || []).map((media) => {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(media.mediaURL);
          if (parsed.fileName) {
            return {
              ...media,
              fileName: parsed.fileName,
              mediaURL: `http://localhost:8080/assets/${parsed.fileName}`
            };
          } else if (parsed.url) {
            return {
              ...media,
              fileName: parsed.url.split("/").pop(),
              mediaURL: parsed.url
            };
          }
        } catch (e) {
          // Not JSON, use mediaURL directly
          return {
            ...media,
            fileName: media.mediaURL.split("/").pop(),
            mediaURL: media.mediaURL
          };
        }
      });
      
      setSentImages(processedImages);
    } catch (error) {
      console.error("Error fetching chat images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = async () => {
    if (!newName.trim()) {
      alert("Tên nhóm không được để trống!");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8080/chatbox/update/${selectedChat.chatBoxID}`,
        new URLSearchParams({
          name: newName,
          imageUrl: chatInfo.image,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.status === 200) {
        setChatInfo({
          ...chatInfo,
          name: newName
        });
        
        onUpdateChat({
          ...selectedChat,
          chatBoxName: newName,
          chatBoxImage: chatInfo.image,
        });
        
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Error updating:", error.response?.data || error.message);
      alert("Cập nhật thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post('http://localhost:8080/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageName = response.data.fileName;
      const imageUrl = `/assets/${imageName}`;
      
      setChatInfo({
        ...chatInfo,
        image: imageUrl
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Không thể tải ảnh lên!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setNewName(chatInfo.name);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  if (!selectedChat) {
    return null;
  }

  return (
    <div className="w-1/4 bg-white border-l border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Thông tin và kênh</h3>
        <button 
          className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <X size={18} /> : <Info size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center p-4 border-b border-gray-200">
            {isEditMode && (
              <div className="absolute right-4 top-20 bg-white p-1 rounded-full shadow-md">
                <button 
                  className="p-1 bg-blue-500 rounded-full text-white"
                  onClick={handleImageClick}
                >
                  <Edit size={16} />
                </button>
              </div>
            )}
            
            <img
              src={chatInfo.image || "http://localhost:8080/assets/default-avatar.jpg"}
              alt="Group Avatar"
              className="w-24 h-24 rounded-full border shadow-sm object-cover cursor-pointer"
              onClick={isEditMode ? handleImageClick : undefined}
            />
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {isEditMode ? (
              <div className="mt-3 w-full">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên nhóm..."
                />
                
                <div className="flex mt-3 space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 py-2 bg-gray-200 text-gray-800 rounded font-medium"
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleNameChange}
                    className="flex-1 py-2 bg-blue-500 text-white rounded font-medium flex justify-center items-center"
                    disabled={isLoading || !newName.trim()}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      "Lưu"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="mt-3 text-lg font-semibold">{chatInfo.name}</h3>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-medium flex items-center"
                >
                  <Edit size={16} className="mr-1" /> Chỉnh sửa
                </button>
              </>
            )}
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Ảnh đã chia sẻ</h3>
              {sentImages.length > 0 && (
                <button className="text-blue-500 text-sm">Xem tất cả</button>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : sentImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {sentImages.slice(0, 9).map((img, index) => (
                  <div key={index} className="aspect-square overflow-hidden">
                    <img
                      src={img.mediaURL}
                      alt="Shared media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-2">Chưa có ảnh nào được chia sẻ</p>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-2">File và liên kết</h3>
            <div className="py-2 px-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">Chưa có file nào được chia sẻ</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightMenu;
