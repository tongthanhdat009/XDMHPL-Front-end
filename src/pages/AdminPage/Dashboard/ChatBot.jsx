import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import axios from 'axios'; // Thư viện Axios để gọi API
const ChatBot = () => {
  const [messages, setMessages] = useState([
    // Example initial message
    { id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // Ref for scrolling to bottom

  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSend = async (e) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      // --- Gọi API Backend Spring Boot ---
      const response = await axios.post('http://localhost:8080/admin/send-chat', { 
        message: userMessage
      });

      const botResponseText = response.data.reply;

      if (botResponseText) {
         setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponseText, sender: 'bot' }]);
      } else {
         throw new Error("Invalid response from server");
      }
      // --- Kết thúc gọi API ---

    } catch (error) {
      console.error("Lỗi khi gọi chatbot backend:", error);
      const errorMessage = error.response?.data?.reply || // Lấy lỗi từ reply của Spring Boot nếu có
                           error.response?.data?.error ||
                           "Xin lỗi, đã có lỗi xảy ra khi kết nối tới AI.";
      setMessages(prev => [...prev, { id: Date.now() + 1, text: errorMessage, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 h-fit rounded-lg shadow-md mx-auto mt-10 mb-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-800 text-center">Chat Bot</h1>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col " style={{ height: '70vh' }}>

        {/* Message Display Area */}
        <div className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto bg-gray-100 ">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start max-w-xs md:max-w-md lg:max-w-lg ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white ${message.sender === 'bot' ? 'bg-blue-500' : 'bg-green-500'}`}>
                  {message.sender === 'bot' ? <FaRobot size={16} /> : <FaUser size={16} />}
                </div>
                {/* Message Bubble */}
                <div
                  className={`mx-2 px-4 py-2 rounded-lg shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          {/* Dummy div to help scroll to bottom */}
          <div ref={messagesEndRef} />
          {/* Loading indicator */}
          {isLoading && (
             <div className="flex justify-start">
               <div className="flex items-start">
                 <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-blue-500 text-white">
                   <FaRobot size={16} />
                 </div>
                 <div className="mx-2 px-4 py-2 rounded-lg shadow-sm bg-white text-gray-500 border border-gray-200 italic">
                   Bot đang soạn...
                 </div>
               </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              className="flex-grow px-4 py-2 text-gray-700 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`p-2 rounded-full text-white transition-colors duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={isLoading}
              aria-label="Gửi tin nhắn"
            >
              <FaPaperPlane size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;