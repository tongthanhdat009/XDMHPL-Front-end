import React from 'react'
import { useNavigate } from 'react-router-dom';
const FriendCard = ({id, name, mutualFriends, isAvatar, type, onClick1, onClick2 }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <div className="relative pb-[100%]">
                <img src={isAvatar} alt={name} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="p-2">
                <h3 className="font-medium text-xs cursor-pointer" onClick={() => navigate(`/profile/${id}`)}>{name}</h3>
                {mutualFriends ? (
                    <div className="flex items-center mt-0.5 text-xs text-gray-500">
                        <div className="flex -space-x-1 mr-1">
                            <div className="w-3 h-3 rounded-full bg-gray-300 border border-white"></div>
                            <div className="w-3 h-3 rounded-full bg-gray-400 border border-white"></div>
                        </div>
                        {mutualFriends}
                    </div>
                ) : (
                    <div className="mt-0.5 text-xs text-gray-500 p-2"></div>
                )}

                {type === "pending" ? (
                    <div className="mt-1.5 grid grid-cols-1 gap-1">
                        <button className="w-full py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 cursor-pointer" onClick={onClick1}>
                            Xác nhận
                        </button>
                        <button className="w-full py-1 bg-gray-200 text-xs font-medium rounded hover:bg-gray-300 cursor-pointer" onClick={onClick2}>
                            Hủy
                        </button>
                    </div>
                ) : type === "suggesting" ? (
                    <div className="mt-1.5 grid grid-cols-1 gap-1">
                        <button className="w-full py-1 bg-blue-100 text-blue-500 text-xs font-medium rounded hover:bg-gray-100 cursor-pointer" onClick={onClick1}>
                            Thêm bạn bè
                        </button>
                        {/* <button className="w-full py-1 bg-gray-200 text-xs font-medium rounded hover:bg-gray-300 cursor-pointer" onClick={onClick2}>
                            Gỡ
                        </button> */}
                    </div>
                ) : (
                    <div className="mt-1.5 grid grid-cols-1 gap-1">
                        <button className="w-full py-1 bg-blue-100 text-blue-500 text-xs font-medium rounded hover:bg-gray-100 cursor-pointer" onClick={onClick1}>
                            Nhắn tin
                        </button>
                        <button className="w-full py-1 bg-gray-200 text-xs font-medium rounded hover:bg-gray-300 cursor-pointer" onClick={onClick2}>
                            Hủy kết bạn
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendCard