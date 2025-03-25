import React, { useState, useEffect } from "react";

const RightMenu = ({ selectedChat, onUpdateChat }) => {
  const [boxChatName, setBoxChatName] = useState(selectedChat?.name || "Tên nhóm");
  const [boxChatImage, setBoxChatImage] = useState(selectedChat?.avatar || "/images/default-avatar.jpg");
  const [newBoxChatName, setNewBoxChatName] = useState("");
  const [sentImages, setSentImages] = useState(selectedChat?.sentImages || []);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (selectedChat) {
      setBoxChatName(selectedChat.name);
      setBoxChatImage(selectedChat.avatar || "/images/default-avatar.jpg");
      setSentImages(selectedChat.sentImages || []);
    }
  }, [selectedChat]);

  // Đổi tên nhóm
  const handleNameChange = () => {
    if (newBoxChatName.trim() !== "") {
      const updatedChat = { ...selectedChat, name: newBoxChatName };
      onUpdateChat(updatedChat);
      setNewBoxChatName("");
    }
  };

  // Đổi ảnh nhóm
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const updatedChat = { ...selectedChat, avatar: imageUrl };
      onUpdateChat(updatedChat);
    }
  };

  return (
    <div className="w-1/4 bg-gray-100 p-6 border-l border-gray-300">
      {selectedChat && (
        <>
          {/* Tiêu đề */}
          <h2 className="text-center text-lg font-bold pb-3 border-b border-gray-300">Thông tin nhóm</h2>

          {/* Avatar và Tên nhóm */}
          <div className="flex flex-col items-center mt-4">
            <img src={boxChatImage} alt="avatar" className="w-20 h-20 rounded-full border shadow-lg" />
            <div className="mt-3">
              <span className="text-lg font-semibold">{boxChatName}</span>
            </div>
          </div>

          {/* Nút chỉnh sửa */}
          <button onClick={() => setIsEditing(!isEditing)} className="w-full bg-blue-500 text-white px-4 py-2 rounded mt-4">
            {isEditing ? "Lưu" : "Chỉnh sửa"}
          </button>

          {/* Khu vực chỉnh sửa */}
          {isEditing && (
            <>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Nhập tên mới..."
                  value={newBoxChatName}
                  onChange={(e) => setNewBoxChatName(e.target.value)}
                  className="border p-2 w-full rounded"
                />
                <button onClick={handleNameChange} className="mt-2 bg-green-500 text-white px-4 py-2 rounded w-full">
                  Đổi tên
                </button>
              </div>
              <div className="mt-4">
                <input type="file" accept="image/*" onChange={handleImageChange} className="border p-2 w-full" />
              </div>
            </>
          )}

          {/* 📸 Ảnh đã gửi */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold border-b pb-2">Ảnh đã gửi</h3>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {sentImages.length > 0 ? (
                sentImages.map((img, index) => (
                  <img key={index} src={img} alt="sent" className="w-full h-20 object-cover rounded" />
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-3">Chưa có ảnh nào.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RightMenu;
