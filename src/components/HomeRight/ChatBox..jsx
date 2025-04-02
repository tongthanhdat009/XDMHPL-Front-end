import React, { useState } from 'react';
const ChatBox = ({ contact, onClose }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([{
        text: 'Hello, how can I help you?fdfdfdf',
        sender: 'userReceive',
        timestamp: new Date().toLocaleTimeString()
    },{
        text: 'huh',
        sender: 'userReceive',
        timestamp: new Date().toLocaleTimeString()
    }]);

    const handleSendMessage = () => {
        if (message.trim()) {
            setMessages([...messages, {
                text: message,
                sender: 'userSend',
                timestamp: new Date().toLocaleTimeString()
            }]);
            setMessage('');
        }
        console.log(messages);
    };

    return (
        <div className="w-90 h-[500px] bg-white shadow-lg rounded-t-lg border border-gray-200 flex flex-col z-50">
            {/* Chat Header */}
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <img
                        src={contact.src}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <div className="font-semibold">{contact.name}</div>
                        <div className="text-xs text-green-500">Đang hoạt động</div>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:bg-gray-200 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow h-[400px] overflow-y-auto p-3 space-y-2">
                <div className="flex flex-col items-center mb-4">
                    <div className='relative'>
                        <img className='rounded-full w-20 h-20 object-cover' src={contact.src} alt={contact.name} />
                        <div className='absolute bottom-0 right-0 bg-green-400 h-4 w-4 rounded-full border-2 border-white' />
                    </div>
                    <div className='text-center mt-2'>
                        <h2 className='font-semibold text-lg'>{contact.name}</h2>
                        <p className='text-sm text-gray-500'>Các bạn là bạn bè trên Facebook</p>
                    </div>
                </div>

                {messages.map((msg, index) => (
                    <div key={index} className="relative group">
                        {/* Timestamp that appears on hover */}
                        {msg.sender === 'userSend' && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                                {msg.timestamp}
                            </div>
                        )}

                        {/* Timestamp that appears on hover */}
                        {msg.sender === 'userReceive' && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                                {msg.timestamp}
                            </div>
                        )}

                        {/* Message content */}
                        <div className={`flex ${msg.sender === 'userSend' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-2 rounded-lg break-words whitespace-normal overflow-wrap-anywhere ${msg.sender === 'userSend' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
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
            </div>
        </div>
    );
};
export default ChatBox;