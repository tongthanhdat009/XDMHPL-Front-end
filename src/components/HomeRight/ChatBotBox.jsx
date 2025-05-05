import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { FaRobot } from 'react-icons/fa';

const ChatBotBox = ({ contact, onClose }) => {
    const [messages, setMessages] = useState([
        // Tin nhắn chào mặc định từ bot
        { id: 1, text: "Xin chào! Tôi là ChatBot. Tôi có thể giúp gì cho bạn?", sender: 'bot', timestamp: new Date().toLocaleTimeString() }
      ]);
      const [message, setMessage] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const messagesEndRef = useRef(null);
    
      // Cuộn xuống tin nhắn mới nhất khi messages thay đổi
      useEffect(() => {
        scrollToBottom();
      }, [messages]);
    
      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      };
    
      // Hàm gửi tin nhắn đến chatbot
      const handleSendMessage = async () => {
        if (!message.trim() || isLoading) return;
    
        // Thêm tin nhắn của người dùng vào danh sách
        const userMessage = {
          id: Date.now(),
          text: message,
          sender: 'user',
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);
    
        try {
          // Gọi API Chatbot
          const response = await axios.post('http://localhost:8080/admin/send-chat', { 
            message: message.trim()
          });
    
          const botResponseText = response.data.reply;
    
          // Thêm tin nhắn từ bot vào danh sách
          if (botResponseText) {
            const botMessage = {
              id: Date.now() + 1,
              text: botResponseText,
              sender: 'bot',
              timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, botMessage]);
          } else {
            throw new Error("Invalid response from server");
          }
        } catch (error) {
          console.error("Lỗi khi gọi chatbot backend:", error);
          const errorMessage = error.response?.data?.reply || 
                              error.response?.data?.error ||
                              "Xin lỗi, đã có lỗi xảy ra khi kết nối tới AI.";
          
          const errorMsg = {
            id: Date.now() + 1,
            text: errorMessage,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString()
          };
          
          setMessages(prev => [...prev, errorMsg]);
        } finally {
          setIsLoading(false);
        }
      };
    
      return (
        <div className="w-80 h-[500px] bg-white shadow-lg rounded-t-lg border border-gray-200 flex flex-col z-50">
          {/* ChatBot Header */}
          <div className="flex justify-between items-center p-3 bg-blue-100 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <FaRobot size={20} />
              </div>
              <div>
                <div className="font-semibold">{contact ? contact.fullName : "ChatBot"}</div>
                <div className="text-xs text-green-500">Luôn trực tuyến</div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:bg-gray-200 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
    
          {/* ChatBot Messages */}
          <div className="flex-grow overflow-y-auto p-3 space-y-2 bg-gray-50">
            <div className="flex flex-col items-center mb-4">
              <div className='w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white'>
                <FaRobot size={40} />
              </div>
              <div className='text-center mt-2'>
                <h2 className='font-semibold text-lg'>{contact.fullName}</h2>
                <p className='text-sm text-gray-500'>Trợ lý AI luôn sẵn sàng giúp đỡ bạn</p>
              </div>
            </div>
    
            {messages.map((msg, index) => (
              <div key={index} className="relative group">
                {/* Timestamp hiển thị khi hover */}
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity absolute ${msg.sender === 'user' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10`}>
                  {msg.timestamp}
                </div>
    
                {/* Nội dung tin nhắn */}
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-2 rounded-lg break-words whitespace-normal overflow-wrap-anywhere ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-black border border-gray-200'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
    
            {/* Hiển thị trạng thái "đang soạn" khi bot đang xử lý */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-2 rounded-lg bg-white text-black border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
    
          {/* Message Input */}
          <div className="p-3 border-t flex items-center space-x-2 bg-white">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Nhập tin nhắn với ChatBot..."
              className="flex-grow bg-gray-100 rounded-full px-4 py-2 outline-none"
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage}
              className={`rounded-full p-2 ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      );
}

export default ChatBotBox