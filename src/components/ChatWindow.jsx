import React, { useState, useEffect } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const ChatWindow = ({ selectedChat, messages, onAddMessage }) => {
  const [newMessage, setNewMessage] = useState("");
  const [media, setMedia] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !media) return;

    let mediaList = [];

    // Nếu có file ảnh, upload lên /upload
    if (media) {
      const formData = new FormData();
      formData.append("file", media);
    
      try {
        const uploadRes = await axios.post("http://localhost:8080/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
    
        const mediaUrl = uploadRes.data.url; // Đường dẫn ảnh từ server
    
        // Push vào mediaList
        mediaList.push({
          mediaURL: mediaUrl,
          mediaType: "image", // hoặc để trống để backend tự đoán
        });
      } catch (error) {
        console.error("Lỗi upload ảnh:", error);
        return;
      }
    }
    
    const storedUser = localStorage.getItem("currentUser");
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    const messagePayload = {
      senderId: user?.id || 0, // fallback = 0 nếu không có user
      receiverId: selectedChat?.chatBoxID,
      chatBoxId: selectedChat?.chatBoxID,
      text: newMessage,
      mediaList: mediaList,
    };
    

    try {
      // Gửi qua WebSocket
      if (stompClient) {
        stompClient.send("/app/chat/send", {}, JSON.stringify(messagePayload));
      }

      // Gửi tin nhắn lên UI
      onAddMessage(messagePayload);

      setNewMessage("");
      setMedia(null);
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    }
  };

  // Kết nối WebSocket
  useEffect(() => {
    if (!selectedChat?.chatBoxID) return;

    const socket = new SockJS("http://localhost:8080/chat");
    const client = Stomp.over(socket);

    client.connect({}, (frame) => {
      console.log("✅ Kết nối WebSocket thành công:", frame);
      setConnected(true);
      setStompClient(client);

      // Subscribe tới topic chung
      client.subscribe("/topic/messages", (messageOutput) => {
        const msg = JSON.parse(messageOutput.body);

        // Chỉ xử lý nếu là tin nhắn của box đang chọn
        if (msg.chatBoxId === selectedChat.chatBoxID) {
          onAddMessage(msg);
        }
      });
    });

    return () => {
      if (client) client.disconnect();
    };
  }, [selectedChat?.chatBoxID]);

  return (
    <div className="w-1/2 bg-white p-4 flex flex-col">
      {selectedChat ? (
        <>
         <div className="bg-blue-100 text-blue-800 text-2xl font-bold px-6 py-3 rounded mb-4 shadow">
            {selectedChat.chatBoxName || `Chatbox ID: ${selectedChat.chatBoxID}`}
          </div>



          <div className="flex-1 border p-2 h-[70vh] overflow-auto">
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div key={idx} className="mb-2">
                  <strong>{msg.senderName || "Bạn"}:</strong> {msg.text}
                  {msg.mediaList && msg.mediaList.length > 0 && (
                    <div className="mt-1">
                      {msg.mediaList.map((media, i) => (
                        
                        <img
        key={media.mediaURL || i}
        src={media.mediaURL}
        alt="Media"
        className="max-w-xs mt-1 rounded"
      />
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>Chưa có tin nhắn nào</p>
            )}
          </div>

          <div className="mt-2 border-t pt-2 flex items-center">
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Nhập tin nhắn tới ${selectedChat.chatBoxName || "Người dùng"}`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMedia(e.target.files[0])}
              className="ml-2 p-2 border rounded-lg"
            />
            <button
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
              onClick={handleSendMessage}
              disabled={!connected}
            >
              Gửi
            </button>
          </div>
        </>
      ) : (
        <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
      )}
    </div>
  );
};

export default ChatWindow;
