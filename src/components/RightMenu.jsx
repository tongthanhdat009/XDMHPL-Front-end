import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {Info, X, Edit, ChevronRight, ChevronLeft } from 'lucide-react';

const RightMenu = ({ selectedChat, onUpdateChat, currentUserId, updateChat }) => {
  const [chatInfo, setChatInfo] = useState({
    name: "",
    image: "/assets/default-avatar.jpg" 
  });
  const [sentImages, setSentImages] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Thêm state cho modal hiển thị ảnh
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
        image: chatData.imageURL ? `${chatData.imageURL}` : "http://localhost:8080/assets/default-avatar.jpg"
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

        updateChat();
        
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
      
      // Cập nhật đường dẫn đầy đủ
      const fullImageUrl = `http://localhost:8080/public${imageUrl}`;
      setChatInfo({
        ...chatInfo,
        image: fullImageUrl
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

  // Xử lý khi click vào ảnh để mở modal
  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  // Xử lý khi đóng modal
  const closeImageModal = () => {
    setShowImageModal(false);
  };

  // Xử lý khi chuyển đến ảnh trước đó
  const goToPreviousImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex === 0 ? sentImages.length - 1 : prevIndex - 1));
  };

  // Xử lý khi chuyển đến ảnh tiếp theo
  const goToNextImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex === sentImages.length - 1 ? 0 : prevIndex + 1));
  };

  // Xử lý khi nhấn phím mũi tên để điều hướng trong modal
  const handleKeyDown = (e) => {
    if (!showImageModal) return;
    
    if (e.key === 'ArrowLeft') {
      goToPreviousImage();
    } else if (e.key === 'ArrowRight') {
      goToNextImage();
    } else if (e.key === 'Escape') {
      closeImageModal();
    }
  };

  // Thêm event listener cho phím mũi tên
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showImageModal, selectedImageIndex]);

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
              src={chatInfo.image}
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
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : sentImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 max-h-64 overflow-y-auto">
                {sentImages.map((img, index) => (
                  <div key={index} className="aspect-square overflow-hidden">
                    <img
                      src={img.mediaURL}
                      alt="Shared media"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openImageModal(index)}
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

      {/* Image Modal */}
      {showImageModal && sentImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="p-4 flex justify-end">
              <button 
                onClick={closeImageModal}
                className="text-white hover:bg-gray-800 p-2 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center relative">
              {/* Previous Button */}
              <button 
                onClick={goToPreviousImage}
                className="absolute left-4 text-white hover:bg-gray-800 p-2 rounded-full"
              >
                <ChevronLeft size={32} />
              </button>

              {/* Image */}
              <div className="max-w-4xl max-h-full px-10">
                <img
                  src={sentImages[selectedImageIndex].mediaURL}
                  alt="Enlarged view"
                  className="max-w-full max-h-[calc(100vh-120px)] object-contain"
                />
              </div>

              {/* Next Button */}
              <button 
                onClick={goToNextImage}
                className="absolute right-4 text-white hover:bg-gray-800 p-2 rounded-full"
              >
                <ChevronRight size={32} />
              </button>
            </div>
            
            {/* Footer - Image Counter */}
            <div className="p-4 text-center text-white">
              <span>{selectedImageIndex + 1} / {sentImages.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightMenu;
