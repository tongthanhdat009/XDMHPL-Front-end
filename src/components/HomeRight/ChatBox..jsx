import React, { useEffect, useRef, useState } from 'react';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import { useAuth } from '../LoginPage/LoginProcess/AuthProvider';
const ChatBox = ({ contact, onClose, chatBoxID }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const { stompClient } = useAuth();
    const currentUser = authService.getCurrentUser();

    // Fetch messages khi chatbox được mở
    useEffect(() => {
      const fetchMessages = async () => {
        try {
          // Thay thế bằng API call thực tế của bạn
          const response = await fetch(`http://localhost:8080/chatboxes/${chatBoxID}/messages`);
          if (!response.ok) throw new Error('Failed to fetch messages');
          const data = await response.json();
          
          // Chuyển đổi dữ liệu tin nhắn từ API
          const formattedMessages = data.map(msg => ({
            text: msg.text,
            sender: msg.chatBox.chatBoxDetails.some(detail => 
              detail.id.userID === currentUser.userID
            ) ? 'userSend' : 'userReceive',
            timestamp: new Date(msg.time).toLocaleTimeString(),
            seen: msg.seen === 1,
            id: msg.messageID,
            media: msg.mediaList || []
          }));
          
          setMessages(formattedMessages);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      if (chatBoxID) {
        // fetchMessages();
      }
    }, [chatBoxID]);

    // Đăng ký WebSocket để nhận tin nhắn mới
    useEffect(() => {
      if (stompClient && chatBoxID) {
        const subscription = stompClient.subscribe(`/topic/chatbox/${chatBoxID}`, message => {
          const receivedMsg = JSON.parse(message.body);
          
          // Chuyển đổi tin nhắn nhận được
          const newMessage = {
            text: receivedMsg.text,
            sender: receivedMsg.senderID === currentUser.userID ? 'userSend' : 'userReceive',
            timestamp: new Date(receivedMsg.time).toLocaleTimeString(),
            seen: receivedMsg.seen === 1,
            id: receivedMsg.messageID,
            media: receivedMsg.mediaList || []
          };
          
          setMessages(prev => [...prev, newMessage]);
        });
        
        // Hủy đăng ký khi component unmount
        return () => {
          subscription.unsubscribe();
        };
      }
    }, [stompClient, chatBoxID]);

    // Cuộn xuống tin nhắn mới nhất khi messages thay đổi
    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Hàm gửi tin nhắn
    const handleSendMessage = async () => {
        if (!message.trim()) return;
        
        try {
            // Gửi tin nhắn tới API
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatBoxID: chatBoxID,
                    text: message
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            
            // Xóa nội dung input sau khi gửi
            setMessage('');
            
            // Không cần thêm tin nhắn vào state vì sẽ nhận qua WebSocket
        } catch (error) {
            console.error("Error sending message:", error);
            // Nếu có lỗi, vẫn hiển thị tin nhắn trên UI để UX tốt hơn
            const tempMessage = {
                text: message,
                sender: 'userSend',
                timestamp: new Date().toLocaleTimeString(),
                seen: false,
                temporary: true // Đánh dấu là tin nhắn tạm thời
            };
            
            setMessages([...messages, tempMessage]);
            setMessage('');
        }
    };

    // Đánh dấu tin nhắn đã đọc
    const markMessagesAsSeen = async () => {
        // Lọc tin nhắn chưa đọc và không phải do người dùng hiện tại gửi
        const unreadMessages = messages.filter(
            msg => msg.sender === 'userReceive' && !msg.seen
        );
        
        // Gửi yêu cầu đánh dấu đã đọc cho từng tin nhắn
        for (const msg of unreadMessages) {
            if (msg.id) {  // Chỉ xử lý tin nhắn có ID (đã lưu trong DB)
                try {
                    await fetch(`/api/messages/${msg.id}/seen`, {
                        method: 'PUT'
                    });
                } catch (error) {
                    console.error(`Error marking message ${msg.id} as seen:`, error);
                }
            }
        }
    };

    // Khi chatbox được hiển thị, đánh dấu các tin nhắn là đã đọc
    useEffect(() => {
        markMessagesAsSeen();
    }, [messages]);

    return (
        <div className="w-80 h-[500px] bg-white shadow-lg rounded-t-lg border border-gray-200 flex flex-col z-50">
            {/* Chat Header */}
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <img
                        src={contact.avatar || `/api/placeholder/50/50?text=${contact.fullName.charAt(0)}`}
                        alt={contact.fullName}
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <div className="font-semibold">{contact.fullName}</div>
                        <div className="text-xs text-green-500">
                          {contact.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:bg-gray-200 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-3 space-y-2">
                <div className="flex flex-col items-center mb-4">
                    <div className='relative'>
                        <img 
                          className='rounded-full w-20 h-20 object-cover' 
                          src={contact.avatar || `/api/placeholder/50/50?text=${contact.fullName.charAt(0)}`}
                          alt={contact.fullName} 
                        />
                        {contact.isOnline && (
                          <div className='absolute bottom-0 right-0 bg-green-400 h-4 w-4 rounded-full border-2 border-white' />
                        )}
                    </div>
                    <div className='text-center mt-2'>
                        <h2 className='font-semibold text-lg'>{contact.fullName}</h2>
                        <p className='text-sm text-gray-500'>Các bạn là bạn bè trên Facebook</p>
                    </div>
                </div>

                {messages.map((msg, index) => (
                    <div key={index} className="relative group">
                        {/* Timestamp hiển thị khi hover */}
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity absolute ${msg.sender === 'userSend' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10`}>
                            {msg.timestamp}
                        </div>

                        {/* Nội dung tin nhắn */}
                        <div className={`flex ${msg.sender === 'userSend' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-2 rounded-lg break-words whitespace-normal overflow-wrap-anywhere ${msg.sender === 'userSend' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-t flex items-center space-x-2 bg-white">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Aa"
                    className="flex-grow bg-gray-100 rounded-full px-4 py-2 outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white rounded-full p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
            </div>
        </div>
    );
};
export default ChatBox;