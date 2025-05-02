import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Divider, IconButton, Modal, Typography } from '@mui/material'
import React, { use, useEffect, useRef, useState } from 'react'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShareIcon from '@mui/icons-material/Share';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import VideoThumbnail from './VideoThumbnail';
import MediaModal from './MediaModal';
import CreateSharePostModal from '../CreatePost/CreateSharePostModal';
import SharepostModal from './SharepostModal';
import EditSharePostModal from '../EditPost/EditSharePostModal';
import { useAuth } from '../LoginPage/LoginProcess/AuthProvider';
// import PostModal from './PostModal';
const SharepostCard = ({ item, userPost, originalPost, userOriginalPost, updatePosts, allUsers, updateUsers, updateCurentUser }) => {
    const currentUser = authService.getCurrentUser();

    dayjs.extend(relativeTime);
    dayjs.locale('vi');
    const totalShares = item.shareCount;
    const createdAt = item.creationDate;
    const totalComments = item.commentCount;
    const totalLikes = item.likeCount;
    const formattedTime = dayjs(createdAt).format("DD [tháng] M [lúc] HH:mm");
    const [showPostModal, setShowPostModal] = React.useState(false);
    const [showProfileTooltip, setShowProfileTooltip] = React.useState(false);

    const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });
    const profileRef = React.useRef(null);
    const tooltipRef = React.useRef(null);

    const timeoutRef = React.useRef(null);
    const navigate = useNavigate();

    const {stompClient } = useAuth();

    const handleShowComments = () => {
        setShowPostModal(true);
    };

    const handleClosePostModal = () => {
        setShowPostModal(false);
    };

    const handleLikePost = async () => {
        try {
            const Like = {
                postId: item.postID,
                userId: currentUser.userID
            }
            const result = await authService.likePost({Like, sendNotifyLikeToServer});
            if (result.success) {
                await updatePosts();
            } else {
                console.error("Error liking post:", result.error);
            }
        } catch (error) {
            console.error("Error in form submission:", error);
        }
    };


    const sendNotifyLikeToServer = (newMessage) => {
        if (stompClient && newMessage) {
        console.log("📤 Sending message:", newMessage);
        stompClient.send(`/app/like/notification`, {}, JSON.stringify(newMessage));
        }
    };

    const handleProfileMouseEnter = (e) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX
        });
        setShowProfileTooltip(true);
    };

    const handleProfileMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            if (!tooltipRef.current || !tooltipRef.current.matches(':hover')) {
                setShowProfileTooltip(false);
            }
        }, 300);
    };

    const handleTooltipMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleTooltipMouseLeave = () => {
        setShowProfileTooltip(false);
    };

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);


    const sendFriendRequest = async () => {
        const reqData = {
            senderId: currentUser.userID,
            receiverId: item.userID
        };

        try {
            const result = await authService.sentFriendRequest(reqData)
            console.log(result)
            if (result.success) {
                // Gọi callback để cập nhật danh sách bài viết
                await updateCurentUser();
                await updatePosts();
                await updateUsers();
            } else {
                // Xử lý lỗi
                console.error("Error liking post:", result.error);
            }
        } catch (error) {
            console.error("Error in form submission:", error);
        }

    };

    const deleteFriend =async () => {
        const inFriendOf = currentUser.friendOf.find(
            (friend) => friend.userID === item.userID
        );

        const reqData = {
            senderId: inFriendOf ? item.userID : currentUser.userID,
            receiverId: inFriendOf ? currentUser.userID : item.userID
        };

        try {
            const result = await authService.deleteFriendRequest(reqData)
            console.log(result)
            if (result.success) {
                await updateCurentUser();
                await updatePosts();
                await updateUsers();
            } else {
                // Xử lý lỗi
                console.error("Error liking post:", result.error);
            }
        } catch (error) {
            console.error("Error in form submission:", error);
        }

    };

    const acceptFriend = async() => {
        // const friendRequest = currentUser.friendOf.find(
        //     (friend) => friend.userID === item.userID && friend.status === "PENDING"
        // );
        const reqData = {
            senderId: item.userID,
            receiverId: currentUser.userID
        };

        try {
            const result = await authService.acceptFriendRequest(reqData)
            console.log(result)
            if (result.success) {
                await updateCurentUser();
                await updatePosts();
                await updateUsers();
            } else {
                // Xử lý lỗi
                console.error("Error liking post:", result.error);
            }
        } catch (error) {
            console.error("Error in form submission:", error);
        }


    };

    const isSent = currentUser.friends.some(
        (friend) => friend.userID === item.userID && friend.status === "PENDING"
    );

    const isReceived = currentUser.friendOf.some(
        (friend) => friend.userID === item.userID && friend.status === "PENDING"
    );

    const isFriend = currentUser.friends.some(
        (friend) => friend.userID === item.userID && friend.status === "ACCEPTED"
    ) || currentUser.friendOf.some(
        (friend) => friend.userID === item.userID && friend.status === "ACCEPTED"
    );

    //Open/Close CreateShare

    // Close shareModal when clicking outside
    const shareModalRef = React.useRef(null);

    const [showShareModal, setShowShareModal] = React.useState(false);
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareModalRef.current && !shareModalRef.current.contains(event.target)) {
                setShowShareModal(false);
            }
        };

        if (showShareModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showShareModal]);
    const openSharePost = () => {
        setShowShareModal(true);
    };

    const closeSharePost = () => {
        setShowShareModal(false);
    }

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showMediaModal, setShowMediaModal] = useState(false);
    // Hàm để mở modal với ảnh/video được chọn
    const openMediaModal = (index) => {
        setCurrentMediaIndex(index);
        setShowMediaModal(true);
    };

    const isLikedByCurrentUser = item.likes.some(
        (like) => like.userId === currentUser.userID
    );



    //Confirm delete
    const [showConfirmModal, setShowConfirmModal] = React.useState(false);

    const handleDelete = () => {
        setShowConfirmModal(true); // Hiển thị modal xác nhận
    };

    const handleConfirmDelete = async () => {
        try {
            // Gọi API xóa bài viết ở đây
            const result = await authService.deletePost(item.postID);
            if (result.success) {
                await updatePosts();
            }
            else {
                // Xử lý lỗi
                console.error("Error deleting post:", result.error);
            }
            setShowConfirmModal(false);
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmModal(false);
    };

    //Phần xử lý post setting
    const [showPostMenu, setShowPostMenu] = useState(false);
    const menuRef = useRef(null);

    const handlePostSetting = () => {
        setShowPostMenu((prev) => !prev); // Toggle trạng thái menu
    };

    // Đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowPostMenu(false);
            }
        };

        if (showPostMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPostMenu]);


    //EditPost
    const [openEditPostModal, setOpenEditPostModal] = React.useState(false);
    const handleCloseEditPostModal = () => setOpenEditPostModal(false);
    const handleOpenEditPostModal = () => {
        setOpenEditPostModal(true);
    }
    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header của người share post */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                    <div
                        ref={profileRef}
                        onMouseEnter={handleProfileMouseEnter}
                        onMouseLeave={handleProfileMouseLeave}
                        onClick={() => navigate(`/profile/${item.userID}`)}
                    >
                        <Avatar
                            className="w-10 h-10 rounded-full cursor-pointer"
                        />
                    </div>
                    <div>
                        <div
                            className="font-semibold text-sm cursor-pointer hover:underline"
                            onMouseEnter={handleProfileMouseEnter}
                            onMouseLeave={handleProfileMouseLeave}
                            onClick={() => navigate(`/profile/${item.userID}`)}
                        >
                            {userPost.fullName}
                        </div>
                        <div className="text-xs text-gray-500">{formattedTime}</div>
                    </div>
                </div>
                <div ref={menuRef} className="relative">
                    {
                        currentUser.userID === item.userID && (
                            <>
                                <button
                                    onClick={handlePostSetting}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                >
                                    <MoreHorizIcon size={20} />
                                </button>
                            </>
                        )
                    }

                    {showPostMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-lg z-50 py-1 border border-gray-200">
                            <div className="flex flex-col">

                                <div className="border-t border-gray-200 my-1"></div>

                                {/* Chỉnh sửa bài viết */}
                                <button className="flex items-center px-4 py-2 hover:bg-gray-100 text-left" onClick={handleOpenEditPostModal}>
                                    <span className="mr-3">✏️</span>
                                    <span className="font-medium" >Chỉnh sửa bài viết</span>
                                </button>

                                <div className="border-t border-gray-200 my-1"></div>

                                {/* Chuyển vào thùng rác */}
                                <button className="flex items-center px-4 py-2 hover:bg-gray-100 text-left" onClick={handleDelete}>
                                    <span className="mr-3">🗑️</span>
                                    <span className="font-medium">Chuyển vào thùng rác</span>
                                    {/* <div className="text-xs text-gray-500 ml-8">Các trang trong thùng rác sẽ bị xóa sau 30 ngày.</div> */}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Nội dung của người share */}
            {item.content && (
                <div className="px-3 pb-3 text-sm">
                    {item.content}
                </div>
            )}



            {/* Original Post Card - Bài viết gốc được share */}
            {
                originalPost ? (
                    <>
                        <div className="mx-3 mb-3 border rounded-lg overflow-hidden">
                            {/* Header của bài viết gốc */}
                            <div className="flex items-center p-3 bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <div onClick={() => navigate(`/profile/${originalPost.userID}`)}>
                                        <Avatar
                                            className="w-8 h-8 rounded-full cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <div
                                            className="font-semibold text-sm cursor-pointer hover:underline"
                                            onClick={() => navigate(`/profile/${originalPost.userID}`)}
                                        >
                                            {userOriginalPost.fullName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {originalPost ? dayjs(originalPost.creationDate).format("DD [tháng] M [lúc] HH:mm") : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Nội dung bài viết gốc */}
                            <div className="px-3 pb-3 text-sm">
                                {originalPost ? originalPost.content : ""}
                            </div>

                            {/* Media bài viết gốc */}
                            {originalPost.mediaList && originalPost.mediaList.length > 0 && (
                                <div className={`grid gap-1 ${originalPost.mediaList.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {originalPost.mediaList.map((media, index) => {
                                        const maxVisibleItems = 4;
                                        const showOverlay = originalPost.mediaList.length > maxVisibleItems && index === maxVisibleItems - 1;

                                        if (index >= maxVisibleItems) return null;

                                        return (
                                            <div
                                                key={media.postMediaID}
                                                className="relative overflow-hidden cursor-pointer"
                                                onClick={() => openMediaModal(index)}
                                            >
                                                {media.type === "image" ? (
                                                    <img
                                                        src={'http://localhost:8080' + media.mediaURL}
                                                        alt={`Post media ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        style={{ aspectRatio: index === 0 && originalPost.mediaList.length === 1 ? 'auto' : '1/1' }}
                                                    />
                                                ) : media.type === "video" ? (
                                                    <VideoThumbnail
                                                        videoUrl={media.mediaURL}
                                                        index={index}
                                                        totalMedia={originalPost.mediaList.length}
                                                    />
                                                ) : null}

                                                {/* Overlay cho "+X" indicator */}
                                                {showOverlay && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                        <span className="text-white text-2xl font-bold">
                                                            +{originalPost.mediaList.length - maxVisibleItems + 1}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Media Modal */}
                            <MediaModal
                                isOpen={showMediaModal}
                                handleClose={() => setShowMediaModal(false)}
                                mediaList={originalPost.mediaList || []}
                                currentIndex={currentMediaIndex}
                                setCurrentIndex={setCurrentMediaIndex}
                            />

                        </div>
                    </>
                ) : (
                <div className="mx-3 mb-3 border rounded-lg overflow-hidden bg-gray-100 p-4 text-center">
                    <Typography variant="body2" color="text.secondary">
                        Nội dung này hiện không hiển thị
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Lỗi này thường do chủ sở hữu chỉ chia sẻ nội dung với một nhóm nhỏ, thay đổi người được xem hoặc đã xóa nội dung.
                    </Typography>
                </div>
                )
            }

            {/* Profile Tooltip */}
            {showProfileTooltip && (
                <div
                    ref={tooltipRef}
                    className="absolute bg-white rounded-lg shadow-md z-50 w-100"
                    style={{
                        top: tooltipPosition.top + 'px',
                        left: tooltipPosition.left + 'px'
                    }}
                    onMouseEnter={handleTooltipMouseEnter}
                    onMouseLeave={handleTooltipMouseLeave}
                >
                    <div className="relative">
                        <button
                            className="absolute top-2 right-2 bg-gray-200 rounded-full p-1"
                            onClick={() => setShowProfileTooltip(false)}
                        >
                            <span className="text-gray-600 text-sm">×</span>
                        </button>

                        <div className="p-4">
                            <div className="flex items-center space-x-3 mb-2">
                                <Avatar
                                    className="w-12 h-12 rounded-full"
                                />
                                <div>
                                    <div className="font-semibold">
                                        {userPost.fullName}
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 flex items-center mb-2">
                                <span className="mr-2">
                                    <PersonIcon fontSize="small" />
                                </span>
                                <span>
                                    36 bạn chung bao gồm Song Anh và Phạm Thư
                                </span>
                            </div>

                            <div className="text-sm text-gray-600 flex items-center mb-3">
                                <span className="mr-2">
                                    <HomeIcon fontSize="small" />
                                </span>
                                <span>
                                    Sống tại Biên Hòa
                                </span>
                            </div>

                            <div className="flex space-x-2">
                                {
                                    currentUser.userID === item.userID ? (
                                        <>
                                            <button className="flex-1 bg-gray-200 text-gray-800 py-1 px-2 rounded-md text-sm font-medium flex items-center justify-center">
                                                <PersonAddIcon fontSize="small" className="mr-1" />
                                                Thêm vào tin
                                            </button>
                                            <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center">
                                                <ChatBubbleIcon fontSize="small" className="mr-1" />
                                                Chỉnh sửa trang cá nhân
                                            </button>
                                        </>
                                    ) : isSent ? (
                                        <>
                                            <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center cursor-pointer hover:bg-gray-300" onClick={deleteFriend}>
                                                <PersonAddIcon fontSize="small" className="mr-1" />
                                                Hủy lời mời
                                            </button>
                                            <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center">
                                                <ChatBubbleIcon fontSize="small" className="mr-1" />
                                                Nhắn tin
                                            </button>
                                        </>
                                    ) : isReceived ? (
                                        <>
                                            <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center cursor-pointer hover:bg-gray-300" onClick={acceptFriend}>
                                                <PersonAddIcon fontSize="small" className="mr-1" />
                                                Chấp nhận lời mời
                                            </button>
                                            <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center">
                                                <ChatBubbleIcon fontSize="small" className="mr-1" />
                                                Nhắn tin
                                            </button>
                                        </>
                                    ) : isFriend ? (
                                        <>
                                            <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center cursor-pointer hover:bg-gray-300" onClick={deleteFriend}>
                                                <PersonAddIcon fontSize="small" className="mr-1" />
                                                Hủy kết bạn
                                            </button>
                                            <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center">
                                                <ChatBubbleIcon fontSize="small" className="mr-1" />
                                                Nhắn tin
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center cursor-pointer hover:bg-gray-300" onClick={sendFriendRequest}>
                                                <PersonAddIcon fontSize="small" className="mr-1" />
                                                kết bạn
                                            </button>
                                            <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center">
                                                <ChatBubbleIcon fontSize="small" className="mr-1" />
                                                Nhắn tin
                                            </button>
                                        </>
                                    )
                                }

                                <button className="bg-gray-200 text-gray-800 p-2 rounded-md">
                                    <MoreHorizIcon fontSize="small" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Interactions */}
            <div className="flex justify-between p-3 text-sm text-gray-600 border-t">
                <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                    <IconButton onClick={handleLikePost}>
                        {isLikedByCurrentUser ? <ThumbUpIcon className='text-blue-500' /> : <ThumbUpOutlinedIcon />}
                    </IconButton>
                    <span>{totalLikes} thích</span>
                </div>
                <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                    <IconButton onClick={handleShowComments}>
                        <ChatBubbleIcon />
                    </IconButton>
                    <span>{totalComments} bình luận</span>
                </div>
                {
                    <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                        <IconButton onClick={openSharePost}>
                            <ShareIcon />
                        </IconButton>
                        <span>{totalShares} Chia sẻ</span>
                    </div>
                }
            </div>

            {/* Post Modal */}
            <SharepostModal
                isOpen={showPostModal}
                handleClose={handleClosePostModal}
                post={item}
                userPost={userPost}
                originalPost={originalPost}
                userOriginalPost={userOriginalPost}
                updatePosts={updatePosts}
                allUsers={allUsers}

                handleOpenCreatePostModal={openSharePost}
            />

            {/* Edit Post Modal */}
            <div>
                <EditSharePostModal handleClose={handleCloseEditPostModal} open={openEditPostModal} updatePosts={updatePosts} item={item} />
            </div>

            {/* Share Modal */}
            <div>
                <CreateSharePostModal open={showShareModal} handleClose={closeSharePost} shareModalRef={shareModalRef} item={item} userPost={userPost} updatePosts={updatePosts} />
            </div>


            {/* Modal xác nhận xóa */}
            <Modal
                open={showConfirmModal}
                onClose={handleCancelDelete}
                aria-labelledby="confirm-delete-title"
                aria-describedby="confirm-delete-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                        width: '400px',
                        textAlign: 'center',
                    }}
                >
                    <Typography id="confirm-delete-title" variant="h6" component="h2">
                        Xác nhận xóa
                    </Typography>
                    <Typography id="confirm-delete-description" sx={{ mt: 2 }}>
                        Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.
                    </Typography>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="contained" color="error" onClick={handleConfirmDelete}>
                            Xóa
                        </Button>
                        <Button variant="outlined" onClick={handleCancelDelete}>
                            Hủy
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};
export default SharepostCard