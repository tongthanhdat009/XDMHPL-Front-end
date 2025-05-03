import React, { useState, useEffect } from "react";
import axios from "axios";

const RightMenu = ({ selectedChat, onUpdateChat, currentUserId }) => {
  const [boxChatName, setBoxChatName] = useState(selectedChat?.chatBoxName || "Tên nhóm");
  const [boxChatImage, setBoxChatImage] = useState("/assets/default-avatar.jpg");
  const [sentImages, setSentImages] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (selectedChat?.chatBoxID && currentUserId) {
      fetchChatDetails();
      fetchChatImages();
    }
  }, [selectedChat, currentUserId]);

  const fetchChatDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/chat/info/${selectedChat.chatBoxID}/${currentUserId}`
      );
      const chatData = response.data;
      setBoxChatName(chatData.chatBoxName || "Nhóm đã bị khóa");
      // Đảm bảo rằng URL hình ảnh đúng với thư mục public/assets/
      setBoxChatImage(chatData.chatBoxImage || "/assets/default-avatar.jpg");
    } catch (error) {
      console.error("Lỗi khi lấy thông tin nhóm:", error);
      alert("Không thể kết nối tới máy chủ để lấy thông tin nhóm!");
    }
  };

  const fetchChatImages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/chat/images/${selectedChat.chatBoxID}`
      );
  
      console.log("Dữ liệu ảnh trả về:", response.data); // Xem dữ liệu gốc
  
      const fixedMedia = (response.data || []).map((media) => {
        try {
          const parsed = JSON.parse(media.mediaURL);
          if (parsed.fileName) {
            return {
              ...media,
              fileName: parsed.fileName,
              mediaURL: `http://localhost:8080/assets/${parsed.fileName}`
            };
          } else if (parsed.url) {
            const fileNameFromUrl = parsed.url.split("/").pop();
            return {
              ...media,
              fileName: fileNameFromUrl,
              mediaURL: parsed.url
            };
          }
        } catch (e) {
          // Không phải JSON, lấy từ mediaURL bình thường
          const fileName = media.mediaURL.split("/").pop();
          return {
            ...media,
            fileName: fileName,
            mediaURL: media.mediaURL
          };
        }
      });
  
      setSentImages(fixedMedia);
    } catch (error) {
      console.error("Lỗi khi lấy ảnh của nhóm:", error);
    }
  };
  
  

  const handleNameChange = async () => {
    if (boxChatName.trim() === "") {
      alert("Tên nhóm không được để trống!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/chat/update/${selectedChat.chatBoxID}`,
        new URLSearchParams({
          name: boxChatName,
          imageUrl: boxChatImage,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.status === 200) {
        onUpdateChat({
          ...selectedChat,
          chatBoxName: boxChatName,
          chatBoxImage: boxChatImage,
        });
        alert("Cập nhật thành công!");
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error.response?.data || error.message);
      alert("Cập nhật thất bại!");
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Tạo form data để gửi ảnh lên server
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        // Gửi ảnh lên server (ví dụ endpoint là /upload)
        const response = await axios.post('http://localhost:8080/uploads', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        // Giả sử server trả về tên ảnh (ví dụ: "400ffa2c-673d-4e85-ab1e-92f75657631c.jpg")
        const imageName = response.data.fileName;
  
        // Cập nhật URL hình ảnh với tên ảnh trả về từ server
        setBoxChatImage(`/assets/${imageName}`);
      } catch (error) {
        console.error("Lỗi khi tải ảnh lên:", error);
      }
    }
  };
  

  const handleNameInputChange = (e) => {
    setBoxChatName(e.target.value);
  };

  const isFormValid = boxChatName.trim() !== "";

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setBoxChatName(selectedChat?.chatBoxName || "Tên nhóm");
    setBoxChatImage(selectedChat?.chatBoxImage || "/assets/default-avatar.jpg");
  };

  return (
    <div className="w-1/4 bg-gray-100 p-6 border-l border-gray-300">
      {selectedChat ? (
        <>
          <h2 className="text-center text-lg font-bold pb-3 border-b border-gray-300">Thông tin nhóm</h2>
          <div className="flex flex-col items-center mt-4">
            <img
              src={boxChatImage}
              alt="avatar"
              className="w-20 h-20 rounded-full border shadow-lg"
            />
            <div className="mt-3">
              <span className="text-lg font-semibold">{boxChatName}</span>
            </div>
          </div>

          {isEditMode ? (
            <>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Nhập tên mới..."
                  value={boxChatName}
                  onChange={handleNameInputChange}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border p-2 w-full"
                />
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-400 text-white px-4 py-2 rounded w-1/3"
                >
                  Hủy
                </button>
                <button
                  onClick={handleNameChange}
                  disabled={!isFormValid}
                  className={`mt-2 ${!isFormValid ? 'bg-gray-400' : 'bg-green-500'} text-white px-4 py-2 rounded w-1/3`}
                >
                  Cập nhật
                </button>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <button
                onClick={() => setIsEditMode(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              >
                Chỉnh sửa
              </button>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold border-b pb-2">Ảnh đã gửi</h3>
            <div className="grid grid-cols-3 gap-2 mt-2">
                    {sentImages.length > 0 ? (
          sentImages.map((img, index) => {
          
            return (
              <img
              key={index}
              src={img.mediaURL}
              alt="sent"
              className="w-full h-20 object-cover rounded"
            />
            
            );
          })
        ) : (
          <p className="text-sm text-gray-500 col-span-3">Chưa có ảnh nào.</p>
        )}

            </div>
          </div>
        </>
      ) : (
        <p className="text-center">Chọn nhóm để xem thông tin</p>
      )}
    </div>
  );
};

export default RightMenu;
