import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useLocation } from "react-router-dom";

import EditProfileModal from '../CreatePost/EditProfileModal';
import MiddlePart from './ProfileMiddlePart';
import EditBioModal from '../CreatePost/EditBioModal';
import authService from '../LoginPage/LoginProcess/ValidateLogin';

const ProfileContent = ({ selectedTab, setSelectedTab }) => {
    const location = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [friends, setFriends] = useState([]);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isEditBioModalOpen, setIsEditBioModalOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("currentUser"));
        const currentId = userInfo?.userID;
        setCurrentUserId(currentId);

        const viewedUserId = parseInt(id) || currentId;
        if (viewedUserId) {
            const fetchDatas = async () => {
                try {
                  const users = await authService.getAllUsers();
                  setUserData(users.find(user => user.userID === viewedUserId));
                  setAllUsers(users);
                } catch (error) {
                  console.error("Error fetching posts:", error);
                }
            };
            fetchDatas();
        }

        setSelectedTab("posts");

    }, [id]);

    useEffect(() => {
            setFriends(allUsers.filter((user) => {
                return userData.friends.some((friend) => friend.userID === user.userID && friend.status === "ACCEPTED") || 
                       userData.friendOf.some((friend) => friend.userID === user.userID && friend.status === "ACCEPTED");
            }));
    }, [id, allUsers, userData]);

    const handleEditProfile = () => {
        setIsEditProfileModalOpen(true);
    };

    const handleEditBio = () => {
        setIsEditBioModalOpen(true);
    };

    const handleSaveProfile = async (updatedData) => {
        try {
            const response = await fetch(`http://localhost:8080/users/${currentUserId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
    
            if (response.ok) {
                // Cập nhật thành công
                console.log("Thông tin cá nhân đã được cập nhật.");
                setIsEditProfileModalOpen(false); // Đóng modal sau khi lưu thành công
                window.location.reload(); // Reload trang sau khi cập nhật thành công
            } else {
                // Nếu có lỗi từ API
                const error = await response.text();
                console.error("Cập nhật thông tin thất bại:", error);
                alert("Có lỗi khi cập nhật thông tin.");
            }
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            alert("Lỗi kết nối với máy chủ.");
        }
    };
    
    const handleSaveBio = async (newBio) => {
        try {
            const response = await fetch(`http://localhost:8080/users/${currentUserId}/bio`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBio),
            });
    
            if (response.ok) {
                // Cập nhật thành công
                console.log("Tiểu sử đã được cập nhật.");
                setIsEditBioModalOpen(false); // Đóng modal sau khi lưu thành công
                window.location.reload(); // Reload trang sau khi cập nhật thành công
            } else {
                // Nếu có lỗi từ API
                const error = await response.text();
                console.error("Cập nhật tiểu sử thất bại:", error);
                alert("Có lỗi khi cập nhật tiểu sử.");
            }
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            alert("Lỗi kết nối với máy chủ.");
        }
    };
    
    const handleNavigateProfile = (userID) => {
        navigate(`/profile/${userID}`);
        setSelectedTab("posts");
    };

    const getAvatarUrl = (avatarPath) => {
        if (avatarPath) {
          return `http://localhost:8080${avatarPath}`;
        }
        return "http://localhost:8080/uploads/avatars/default.jpg";
      };

    return (
        <div className="flex justify-center w-full p-4">
            <div className="flex gap-6 w-full max-w-[1140px] flex-col md:flex-row">
                {/* Left section */}
                <div className="min-w-[428px] space-y-3 my-8">
                    <div className="bg-white p-4 rounded-lg shadow flex flex-col text-left">
                        <h2 className="text-lg font-semibold mb-4">Giới thiệu</h2>
                        <div className="mb-4">
                            {userData?.bio && (
                                <p className="text-sm text-gray-700 italic py-2 text-center">
                                    "{userData.bio}"
                                </p>
                            )}
                            {currentUserId === userData?.userID && (
                                <button className="text-white text-base bg-blue-600 hover:bg-blue-500 rounded-md py-2 mt-2 w-full" onClick={handleEditBio}>
                                    Chỉnh sửa tiểu sử
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span>Email:</span>
                                <span className="font-medium">{userData?.email || '...'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Số điện thoại:</span>
                                <span className="font-medium">{userData?.phoneNumber || '...'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ngày sinh:</span>
                                <span className="font-medium">
                                    {userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : '...'}
                                </span>
                            </div>
                            {currentUserId === userData?.userID && (
                                <button className="text-white text-base bg-blue-600 hover:bg-blue-500 rounded-md py-2 mt-2 w-full" onClick={handleEditProfile}>
                                    Chỉnh sửa thông tin
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Bạn bè</h2>
                            <button
                                className="text-white bg-blue-600 hover:bg-blue-500 rounded-md px-4 py-2"
                                onClick={() => setSelectedTab("friends")}
                            >
                                Xem tất cả
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {friends.length > 0 ? (
                                friends.slice(0, 9).map(friend => (
                                    <div
                                        key={friend.userID}
                                        className="flex flex-col items-center cursor-pointer"
                                        onClick={() => handleNavigateProfile(friend.userID)}
                                    >
                                        <img
                                            src={getAvatarUrl(friend.avatar)}
                                            alt={friend.fullName}
                                            className="w-24 h-24 rounded-full object-cover mb-2"
                                        />
                                        <p className="text-sm font-semibold">{friend.fullName}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600">Không có bạn bè</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right section */}
                <div className="flex-1 my-8">
                    {selectedTab === "friends" ? (
                        <div className="bg-white p-4 rounded-lg shadow min-h-[527px]">
                            <h2 className="text-xl font-semibold mb-4">Danh sách bạn bè</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {friends.length > 0 ? (
                                    friends.map(friend => (
                                        <div
                                            key={friend.userID}
                                            className="flex flex-col items-center cursor-pointer text-center"
                                            onClick={() => handleNavigateProfile(friend.userID)}
                                        >
                                            <img
                                                src={getAvatarUrl(friend.avatar)}
                                                alt={friend.fullName}
                                                className="w-24 h-24 rounded-full object-cover mb-2"
                                            />
                                            <p className="text-sm font-semibold text-center">{friend.fullName}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600">Không có bạn bè</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <MiddlePart />
                    )}
                </div>

            </div>
            {/* Modals */}
            {isEditProfileModalOpen && (
            <EditProfileModal
                userData={userData}
                onClose={() => setIsEditProfileModalOpen(false)}
                onSave={handleSaveProfile}
            />
            )}

            {isEditBioModalOpen && (
            <EditBioModal
                userData={userData}
                onClose={() => setIsEditBioModalOpen(false)}
                onSave={handleSaveBio}
            />
            )}
        </div>
    );
};

export default ProfileContent;