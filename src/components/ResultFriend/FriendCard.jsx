import React from 'react'
const FriendCard = ({ name, mutualFriends, followers, image, isPlaceholder, isAvatar, type, onClick1, onClick2 }) => {
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <div className="relative pb-[100%]">
                {isPlaceholder ? (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="gray" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                ) : isAvatar ? (
                    <div className="absolute inset-0 bg-blue-500 flex items-center justify-center">
                        <div className="w-12 h-12 bg-blue-700"></div>
                    </div>
                ) : (
                    <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
                )}
            </div>
            <div className="p-2">
                <h3 className="font-medium text-xs">{name}</h3>
                {
                    mutualFriends ? (
                        <div className="flex items-center mt-0.5 text-xs text-gray-500">
                        <div className="flex -space-x-1 mr-1">
                            <div className="w-3 h-3 rounded-full bg-gray-300 border border-white"></div>
                            <div className="w-3 h-3 rounded-full bg-gray-400 border border-white"></div>
                        </div>
                        {mutualFriends}
                    </div>
                    ) : followers ? (
                        <div className="mt-0.5 text-xs text-gray-500">
                        {followers}
                    </div>
                    ) : (
                        <div className="mt-0.5 text-xs text-gray-500 p-2">
                            
                        </div>
                    )
                }

                {
                    type === "pending" ? (
                        <div className="mt-1.5 grid grid-cols-1 gap-1">
                            <button className="w-full py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 cursor-pointer" onClick={onClick1}>
                                Xác nhận
                            </button>
                            <button className="w-full py-1 bg-gray-200 text-xs font-medium rounded hover:bg-gray-300 cursor-pointer" onClick={onClick2}>
                                Huy
                            </button>
                        </div>
                    ) : (
                        <div className="mt-1.5 grid grid-cols-1 gap-1">
                            <button className="w-full py-1 bg-blue-100 text-blue-500 text-xs font-medium rounded hover:bg-gray-100 cursor-pointer" onClick={onClick1}>
                                Thêm bạn bè
                            </button>
                            <button className="w-full py-1 bg-gray-200 text-xs font-medium rounded hover:bg-gray-300 cursor-pointer" onClick={onClick2}>
                                Gỡ
                            </button>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default FriendCard