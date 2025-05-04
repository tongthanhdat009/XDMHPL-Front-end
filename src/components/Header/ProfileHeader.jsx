import React, { useEffect, useState } from 'react';
import { FaUserPlus, FaComments } from 'react-icons/fa';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import { useAuth } from '../LoginPage/LoginProcess/AuthProvider';

const ProfileHeader = ({ selectedTab, setSelectedTab }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [friendStatus, setFriendStatus] = useState(""); // "kết bạn", "đang chờ", "bạn bè"
    const [selectedAvatar, setSelectedAvatar] = useState(null); // lưu ảnh chọn từ máy tính
    const [isModalOpen, setIsModalOpen] = useState(false); // quản lý trạng thái modal
    const [previewImage, setPreviewImage] = useState(null); // ảnh preview
    const [selectedCoverPhoto, setSelectedCoverPhoto] = useState(null); // Lưu ảnh bìa chọn từ máy tính
    const [isCoverModalOpen, setIsCoverModalOpen] = useState(false); // Trạng thái modal ảnh bìa
    const [previewCoverImage, setPreviewCoverImage] = useState(null); // Ảnh preview bìa
    const currentUser = authService.getCurrentUser();
    const [allUsers, setAllUsers] = useState([]);

    const updateUsers = async () => {
        try {
          const result = await authService.getAllUsersFormDB();
          if (result.success) {
            setAllUsers(result.data); // Cập nhật danh sách bài viết
          }
        } catch (error) {
          console.error("Error updating posts:", error);
        }
      };
    
    const updateCurentUser = async () => {
        try {
          const result = await authService.getCurrentUserFormDB(currentUser.userID);
        } catch (error) {
          console.error("Error updating posts:", error);
        }
    }
    
    // Sửa hàm updateCurrentUser
    const updateCurrentUser = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            const result = await authService.getCurrentUserFormDB(currentUser.userID);
            
            // Cập nhật userData nếu đây là profile của người dùng hiện tại
            const pathParts = location.pathname.split('/');
            const profileUserId = parseInt(pathParts[pathParts.length - 1]);
            
            if (profileUserId === currentUser.userID) {
                setUserData(result.data); // Giả sử API trả về data trong trường này
            } else {
                // Nếu đang xem profile người khác, cần fetch lại thông tin của họ
                const profileData = await authService.getUserByIdFromDB(profileUserId);
                setUserData(profileData.data);
            }
        } catch (error) {
            console.error("Error updating current user:", error);
        }
    };
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const profileUserId = parseInt(pathParts[pathParts.length - 1]);
        const currentId = parseInt(currentUser?.userID);

        if (profileUserId && currentId) {
            setIsCurrentUser(currentId === profileUserId);

            const fetchDatas = async () => {
                try {
                  const users = await authService.getAllUsers();
                  setUserData(users.find(user => user.userID === profileUserId));
                  setAllUsers(users);
                } catch (error) {
                  console.error("Error fetching posts:", error);
                }
            };
            fetchDatas();


            axios.get(`http://localhost:8080/friendrequests/friend-status`, {
                params: {
                    userID: currentId,
                    friendUserID: profileUserId
                }
            })
            .then(res => {
                setFriendStatus(res.data.toLowerCase()); // "kết bạn", "bạn bè", "đang chờ"
            })
            .catch(err => {
                console.error("Lỗi khi lấy trạng thái bạn bè:", err);
                setFriendStatus("kết bạn"); // fallback
            });
        }
    }, [location.pathname]);

    const [friends, setFriends] = useState([]);
    console.log(allUsers.filter((user) => {
        return userData.friends.some((friend) => friend.userID === user.userID && friend.status === "ACCEPTED") || 
               userData.friendOf.some((friend) => friend.userID === user.userID && friend.status === "ACCEPTED");
    }));
    useEffect(() => {
        const filteredFriends = allUsers.filter((user) => {
            return userData.friends.some((friend) => friend.userID === user.userID && friend.status === "ACCEPTED") ||
                   userData.friendOf.some((friend) => friend.userID === user.userID && friend.status === "ACCEPTED");
        });
        
        setFriends(filteredFriends);
        console.log("Friends sau khi lọc:", filteredFriends);
    }, [allUsers, userData, location.pathname]);

    const handleNavigate = () => {
        navigate('/messages');
    };

    const {stompClient } = useAuth();
    const sendFriendRequest = async (currentId, profileId) => {
        const data = {
            senderId: currentId,
            receiverId: profileId
        };
        console.log(data)
        try {
            const result = await authService.sentFriendRequest({data, sendNotifyFriendRequestToServer})
            console.log(result)
        } catch (error) {
            console.error("Error in form submission:", error);
        }

    };

    const sendNotifyFriendRequestToServer = (newMessage) => {
        if (stompClient && newMessage) {
        console.log("📤 Sending message:", newMessage);
        stompClient.send(`/app/friendRequest/notification`, {}, JSON.stringify(newMessage));
        }
    };

    const handleFriendAction = async () => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const currentId = parseInt(currentUser?.userID);
        const profileId = parseInt(location.pathname.split('/').pop());
        try {
            if (friendStatus === "kết bạn") {
                sendFriendRequest(currentId, profileId);
                setFriendStatus("đang chờ");
            }
            else if (friendStatus === "đang chờ") {
                await axios.delete(`http://localhost:8080/friendrequests/${currentId}/${profileId}`);
                setFriendStatus("kết bạn");
            }
            else if (friendStatus === "chờ xác nhận") {
                await axios.put(`http://localhost:8080/friendrequests/${profileId}/${currentId}`);
                setFriendStatus("bạn bè");
            }
            else if (friendStatus === "bạn bè") {
                await axios.delete(`http://localhost:8080/friendrequests/${currentId}/${profileId}`);
                setFriendStatus("kết bạn");
            }
            
            // Cập nhật dữ liệu người dùng
            await updateCurrentUser();
            
            // Cập nhật danh sách người dùng
            const updatedUsers = await authService.getAllUsersFormDB();
            if (updatedUsers.success) {
                setAllUsers(updatedUsers.data);
                
                // Lấy thông tin chi tiết của người dùng profile hiện tại
                const pathParts = location.pathname.split('/');
                const profileUserId = parseInt(pathParts[pathParts.length - 1]);
                const profileUser = updatedUsers.data.find(user => user.userID === profileUserId);
                
                if (profileUser) {
                    setUserData(profileUser);
                    
                    // Cập nhật danh sách bạn bè trực tiếp
                    const updatedFriends = updatedUsers.data.filter((user) => {
                        return profileUser.friends.some((friend) => friend.userID === user.userID && friend.status === "ACCEPTED") || 
                               profileUser.friendOf.some((friend) => friend.userID === user.userID && friend.status === "ACCEPTED");
                    });
                    
                    setFriends(updatedFriends);
                }
            }
        } catch (error) {
            console.error("Lỗi khi thực hiện hành động bạn bè:", error);
        }
        
    };

    const renderFriendButton = () => {
        let label = "";
        let disabled = false;
        let bgColor = "";
        let hoverColor = "";

        console.log("friendStatus", friendStatus);
        switch (friendStatus) {
            case "kết bạn":
                label = "Kết bạn";
                bgColor = "bg-blue-600";
                hoverColor = "hover:bg-blue-700";
                break;
            case "đang chờ":
                label = "Hủy lời mời";
                bgColor = "bg-gray-400";
                hoverColor = "hover:bg-gray-400";
                // disabled = true;
                break;
            case "bạn bè":
                label = "Hủy kết bạn";
                bgColor = "bg-gray-400";
                hoverColor = "hover:bg-gray-500";
                break;
            case "chờ xác nhận":
                label = "Chấp nhận";
                bgColor = "bg-blue-600";
                hoverColor = "hover:bg-blue-700";
                break;
            default:
                return null;
        }

        return (
            <button
                className={`flex items-center gap-2 px-4 py-2 ${bgColor} text-white rounded-lg ${hoverColor}`}
                onClick={handleFriendAction}
                disabled={disabled}
            >
                <FaUserPlus /> {label}
            </button>
        );
    };

    const handleAvatarClick = () => {
        if (isCurrentUser) {
            setIsModalOpen(true);
        }
    };
    const handleCoverClick = () => {
        if (isCurrentUser) {
            setIsCoverModalOpen(true);
        }
    };
    const handleCoverFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setPreviewCoverImage(URL.createObjectURL(file)); // Hiển thị ảnh preview
            setSelectedCoverPhoto(file); // Lưu tệp ảnh bìa đã chọn
        }
    };
    
    const handleSaveCoverPhoto = () => {
        const formData = new FormData();
        formData.append("coverPhoto", selectedCoverPhoto);
    
        const userId = currentUser?.userID;
    
        // Kiểm tra nếu userId có giá trị hợp lệ
        if (!userId) {
            console.error("User ID không hợp lệ!");
            return;
        }
    
        // Gửi ảnh bìa lên backend và cập nhật thông tin người dùng
        axios.post(`http://localhost:8080/users/${userId}/upload-cover`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        .then((response) => {
            // Cập nhật ảnh bìa mới từ response
            console.log(response.data);
            setUserData((prevData) => ({
                ...prevData,
                coverPhotoUrl: response.data // Cập nhật ảnh bìa mới
            }));
            setIsCoverModalOpen(false); // Đóng modal sau khi lưu ảnh
        }).then( async(response) => {
            await updateCurentUser();
            await updateUsers();
        })
        .catch((err) => {
            console.error("Lỗi khi lưu ảnh bìa:", err);
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file)); // Hiển thị ảnh đã chọn trong modal
            setSelectedAvatar(file); // Lưu tệp ảnh đã chọn
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false); // Đóng modal khi nhấn hủy
    };

    const handleSaveAvatar = () => {
        const formData = new FormData();
        formData.append("avatar", selectedAvatar);
    
        const userId = currentUser?.userID; // Lấy đúng userId từ currentUser
        
        // Kiểm tra nếu userId có giá trị hợp lệ
        if (!userId) {
            console.error("User ID không hợp lệ!");
            return;
        }
        
        // Gửi ảnh lên backend và cập nhật thông tin người dùng
        axios.post(`http://localhost:8080/users/${userId}/upload-avatar`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        .then((response) => {
            // Cập nhật avatar sau khi lưu thành công
            setUserData((prevData) => ({
                ...prevData,
                avatarURL: response.data // Cập nhật avatar mới từ response
            }));
            setIsModalOpen(false); // Đóng modal sau khi lưu
        }).then(async (response) => {
            await updateCurentUser();
            await updateUsers();
        })
        .catch((err) => {
            console.error("Lỗi khi lưu avatar:", err);
        });
    };

    return (
        <div className="flex flex-col">
            <div className='h-[480px] relative bg-white px-50 pb-20'>
                <img 
                    src={userData?.coverPhotoUrl ? `http://localhost:8080/uploads${userData.coverPhotoUrl}` : "http://localhost:8080/uploads/covers/default.jpg"}
                    alt="Cover"
                    className="w-full h-full object-cover rounded-b-lg shadow-ml"
                    onClick={handleCoverClick}
                />
            </div>
            <div className='h-[120px] bg-white rounded-lg mt-[-50px] relative'>
                <div className='w-4/5 mx-auto bg-white h-full flex items-center justify-between pl-14 pr-14'>
                    {/* Avatar và tên */}
                    <div className="flex items-center">
                        <div className="relative">
                        <div className="translate-x-10 -translate-y-12 h-[178px] w-[178px] rounded-full border-4 border-white overflow-hidden">
                            <img 
                                src={userData?.avatarURL ? `http://localhost:8080/uploads${userData.avatarURL}` : "http://localhost:8080/uploads/avatars/default.jpg"}
                                alt="Profile"
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={handleAvatarClick}
                            />
                        </div>
                        </div>
                        <div className="ml-12 -mt-15">
                            <h2 className="text-4xl font-semibold text-black">{userData?.fullName}</h2>
                            {console.log("Friends:", friends)}
                            <p className="text-sm text-gray-600 mt-1">
                                {friends.length} bạn bè 
                            </p>
                            <div className="flex mt-2 space-x-2">
                                {friends.slice(0, 5).map(friend => (
                                    <img
                                        key={friend.userID}
                                        src={`http://localhost:8080/uploads${friend.avatarURL || '/avatars/default.jpg'}`}
                                        alt={friend.fullName}
                                        className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500"
                                        onClick={() => navigate(`/profile/${friend.userID}`)}
                                        title={friend.fullName}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Nút kết bạn và nhắn tin */}
                    {!isCurrentUser && userData && (
                        <div className="flex gap-4">
                            {renderFriendButton()}
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={handleNavigate}>
                                <FaComments /> Nhắn tin
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {isCoverModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center z-50">
                    <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-md"></div>

                    <div className="bg-white p-6 rounded-xl shadow-xl w-[400px] relative z-10">
                        <h2 className="text-xl font-semibold text-center mb-6">Chọn ảnh bìa</h2>

                        {/* Preview Image */}
                        <div className="mb-6 flex justify-center">
                            <img
                                src={ previewCoverImage ||"http://localhost:8080/uploads/covers/default.jpg"}
                                alt="Preview"
                                className="w-full h-[150px] object-cover border-4 border-gray-300"
                            />
                        </div>

                        {/* File Input */}
                        <div className="mb-6">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverFileChange}
                                className="w-full text-sm text-gray-700 file:py-2 file:px-4 file:border file:rounded-lg file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-between items-center">
                            <button
                                className="w-1/2 py-2 px-4 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                                onClick={() => setIsCoverModalOpen(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="w-1/2 py-2 px-4 mx-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                onClick={handleSaveCoverPhoto}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Chọn ảnh */}
            {isModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center z-50">
                    {/* Nền mờ với backdrop-filter */}
                    <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-md"></div>
                    
                    {/* Modal */}
                    <div className="bg-white p-6 rounded-xl shadow-xl w-[400px] relative z-10">
                        <h2 className="text-xl font-semibold text-center mb-6">Chọn ảnh đại diện</h2>
                        {/* Preview Image */}
                        <div className="mb-6 flex justify-center">
                            <img 
                                src={previewImage || "http://localhost:8080/uploads/avatars/default.jpg"}
                                alt="Preview" 
                                className="w-50 h-50 object-cover border-4 border-gray-300" 
                            />
                        </div>

                        {/* File Input */}
                        <div className="mb-6">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="w-full text-sm text-gray-700 file:py-2 file:px-4 file:border file:rounded-lg file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-between items-center">
                            <button 
                                className="w-1/2 py-2 px-4 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                                onClick={handleCloseModal}
                            >
                                Hủy
                            </button>
                            <button 
                                className="w-1/2 py-2 px-4 mx-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                onClick={handleSaveAvatar}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <div className="h-[60px] bg-white shadow-lg flex flex-col px-52">
                <div className="flex items-start">
                    <button
                        className={`px-4 py-4 hover:bg-gray-100 text-gray-500 ${selectedTab === 'posts' ? 'border-b-4 border-black !text-black' : ''}`}
                        onClick={() => setSelectedTab('posts')}
                    >
                        Bài viết
                    </button>
                    <button
                        className={`px-4 py-4 hover:bg-gray-100 text-gray-500 ${selectedTab === 'friends' ? 'border-b-4 border-black !text-black' : ''}`}
                        onClick={() => setSelectedTab('friends')}
                    >
                        Bạn bè
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;