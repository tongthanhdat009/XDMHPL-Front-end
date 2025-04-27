import { Avatar, Box, Button, Divider, IconButton, MenuItem, Modal, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShareIcon from '@mui/icons-material/Share';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import MediaModal from './MediaModal';
import VideoThumbnail from './VideoThumbnail';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CreateSharePostModal from '../CreatePost/CreateSharePostModal';
import PostModal from './PostModal';
import EditPostModal from '../EditPost/EditPostModal';
const PostCard = ({ item, userPost, updatePosts, allUsers,  updateUsers, updateCurentUser }) => {

    const currentUser = authService.getCurrentUser();
    // console.log(currentUser);
    // console.log(item);
    // console.log(userPost);
    dayjs.extend(relativeTime);
    dayjs.locale('vi');
    const createdAt = item.creationDate;
    const totalComments = item.commentCount;
    const totalLikes = item.likeCount;
    const totalShares = item.shareCount;
    const formattedTime = dayjs(createdAt).format("DD [tháng] M [lúc] HH:mm");
    const [showPostModal, setShowPostModal] = React.useState(false);
    const [showProfileTooltip, setShowProfileTooltip] = React.useState(false);
    const [showShareModal, setShowShareModal] = React.useState(false);
    const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });
    const profileRef = React.useRef(null);
    const tooltipRef = React.useRef(null);
    const shareModalRef = React.useRef(null);
    // const { post, auth } = useSelector(store => store);
    // console.log('post', post);
    const timeoutRef = React.useRef(null);
    const navigate = useNavigate();

    const handleShowComments = () => {
        setShowPostModal(true);
    };

    const handleClosePostModal = () => {
        setShowPostModal(false);
    };

    const handleLikePost = async () => {
        try {
            const result = await authService.likePost(item.postID, currentUser.userID);
            console.log(result)
            if (result.success) {
                // Gọi callback để cập nhật danh sách bài viết
                await updatePosts();
            } else {
                // Xử lý lỗi
                console.error("Error liking post:", result.error);
            }
        } catch (error) {
            console.error("Error in form submission:", error);
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
        // Sử dụng timeout để có thể di chuyển chuột từ profile tới tooltip
        timeoutRef.current = setTimeout(() => {
            // Chỉ ẩn tooltip nếu chuột không di chuyển vào tooltip
            if (!tooltipRef.current || !tooltipRef.current.matches(':hover')) {
                setShowProfileTooltip(false);
            }
        }, 300);
    };

    const handleTooltipMouseEnter = () => {
        // Hủy timeout nếu có, để không ẩn tooltip
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleTooltipMouseLeave = () => {
        // Ẩn tooltip khi rời khỏi cả profile và tooltip
        setShowProfileTooltip(false);
    };

    // Xóa timeout khi component unmount
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);


    // Close shareModal when clicking outside
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

    const acceptFriend = async() => {
        const reqData = {
            senderId: item.userID,
            receiverId: currentUser.userID
        };

        try {
            const result = await authService.acceptFriendRequest(reqData)
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
    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                    <div
                        ref={profileRef}
                        onMouseEnter={handleProfileMouseEnter}
                        onMouseLeave={handleProfileMouseLeave}
                        onClick={() => navigate(`/profile/${userPost.userID}`)}
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
                            onClick={() => navigate(`/profile/${userPost.userID}`)}
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

            {/* Post Text */}
            <div className="px-3 pb-3 text-sm">
                {item.content}
            </div>

            {/* Post Media */}
            {item.mediaList && item.mediaList.length > 0 && (
                <div className={`grid gap-1 ${item.mediaList.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {item.mediaList.map((media, index) => {
                        const maxVisibleItems = 4;
                        const showOverlay = item.mediaList.length > maxVisibleItems && index === maxVisibleItems - 1;

                        if (index >= maxVisibleItems) return null;

                        return (
                            <div
                                key={media.postMediaID}
                                className="relative overflow-hidden cursor-pointer"
                                onClick={() => openMediaModal(index)}
                            >
                                {media.type === "image" ? (
                                    <img
                                        src={`http://localhost:8080${media.mediaURL}?timestamp=${new Date().getTime()}`}
                                        alt={`Post media ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        style={{ aspectRatio: index === 0 && item.mediaList.length === 1 ? 'auto' : '1/1' }}
                                        onLoad={() => console.log('Image loaded successfully')}
                                        onError={(e) => {
                                            e.target.src = `http://localhost:8080${media.mediaURL}?timestamp=${new Date().getTime()}`;
                                        }}
                                    />

                                ) : media.type === "video" ? (
                                    <VideoThumbnail
                                        videoUrl={media.mediaURL}
                                        index={index}
                                        totalMedia={item.mediaList.length}
                                    />
                                ) : null}

                                {/* Overlay cho "+X" indicator */}
                                {showOverlay && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <span className="text-white text-2xl font-bold">
                                            +{item.mediaList.length - maxVisibleItems + 1}
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
                mediaList={item.mediaList || []}
                currentIndex={currentMediaIndex}
                setCurrentIndex={setCurrentMediaIndex}
            />
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
            <PostModal
                isOpen={showPostModal}
                handleClose={handleClosePostModal}
                post={item}
                userPost={userPost}
                updatePosts={updatePosts}
                allUsers={allUsers} // Truyền allUsers vào đây nếu cần thiết

                handleOpenCreatePostModal={openSharePost}
            />

            {/* Edit Post Modal */}
            <div>
                <EditPostModal handleClose={handleCloseEditPostModal} open={openEditPostModal} updatePosts={updatePosts} item={item} />
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
export default PostCard