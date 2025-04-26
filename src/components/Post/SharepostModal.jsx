import React, { useState } from 'react'
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { Avatar, Box, IconButton, InputAdornment, Modal, TextField, Typography } from "@mui/material";
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShareIcon from '@mui/icons-material/Share';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import MediaModal from './MediaModal';
import VideoThumbnail from './VideoThumbnail';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import { data, useNavigate } from 'react-router-dom';
// SharepostModal component

const SharepostModal = ({ isOpen, handleClose, post, userPost, originalPost, userOriginalPost, updatePosts, allUsers, handleOpenCreatePostModal }) => {
    const currentUser = authService.getCurrentUser();
    const [newComment, setNewComment] = React.useState('');
    const navigate = useNavigate();
    // Format date/time
    dayjs.extend(relativeTime);
    dayjs.locale('vi');
    const formattedTime = dayjs(post?.creationDate).format("DD [tháng] M [lúc] HH:mm");

    // Handle liking post
    const handleLikePost = async () => {
        try {
            const result = await authService.likePost(post.postID, currentUser.user.userID);
            if (result.success) {
                await updatePosts();
            } else {
                console.error("Error liking post:", result.error);
            }
        } catch (error) {
            console.error("Error in form submission:", error);
        }
    };

    // Handle creating comment
    const handleCreateComment = async () => {
        if (!newComment.trim()) return;

        const reqData = {
            postId: post.postID,
            userId: currentUser.user.userID,
            data: {
                content: newComment
            }
        };

        try {
            const result = await authService.commentPost(reqData);
            if (result.success) {
                await updatePosts();
            } else {
                console.error("Error comment post:", result.error);
            }
        } catch (error) {
            console.error("Error in form submission:", error);
        }

        setNewComment('');
    };

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showMediaModal, setShowMediaModal] = useState(false);

    // Hàm để mở modal với ảnh/video được chọn
    const openMediaModal = (index) => {
        setCurrentMediaIndex(index);
        setShowMediaModal(true);
    };

    const isLikedByCurrentUser = post?.likes?.some(
        (like) => like.userId === currentUser.user.userID
    );


    if (!isOpen || !post) return null;

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="post-modal-title"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    outline: 'none',
                }}
            >
                {/* Header with close button */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                }}>
                    <Typography
                        id="post-modal-title"
                        variant="h6"
                        component="h2"
                        sx={{ fontWeight: 'medium', fontSize: '1rem' }}
                    >
                        Bài viết của {userPost?.fullName}
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(0, 0, 0, 0.05)',
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)' }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Post content - scrollable area */}
                <Box
                    sx={{
                        overflowY: 'auto',
                        maxHeight: 'calc(90vh - 130px)',
                        flex: 1,
                    }}
                >
                    {/* User info and timestamp */}
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                        <Box
                            sx={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            onClick={() => navigate(`/profile/${post.userID}`)}
                        >
                            <Avatar
                                sx={{ width: 40, height: 40, mr: 1.5 }}
                                alt={userPost?.fullName}
                            />
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    {userPost?.fullName}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.75rem' }}
                                >
                                    {formattedTime}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Post content */}
                    {post.content && (
                        <Typography
                            variant="body1"
                            sx={{
                                px: 2,
                                pb: 2,
                                fontSize: '0.95rem'
                            }}
                        >
                            {post.content}
                        </Typography>
                    )}

                    {/* Shared Content Card */}
                    {originalPost ? (
                        <Box
                            sx={{
                                mx: 2,
                                mb: 2,
                                border: '1px solid',
                                borderColor: 'grey.300',
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}
                        >
                            {/* Original post user info */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 2,
                                    bgcolor: 'grey.50'
                                }}
                            >
                                <Box
                                    sx={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    onClick={() => navigate(`/profile/${originalPost?.userID}`)}
                                >
                                    <Avatar
                                        sx={{ width: 32, height: 32, mr: 1.5 }}
                                        alt={userOriginalPost?.fullName}
                                    />
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: '0.85rem',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                        >
                                            {userOriginalPost?.fullName}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.7rem' }}
                                        >
                                            {originalPost ? dayjs(originalPost.creationDate).format("DD [tháng] M [lúc] HH:mm") : ""}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Original post content */}
                            {originalPost.content && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        px: 2,
                                        pb: originalPost.mediaList?.length > 0 ? 1 : 2,
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {originalPost.content}
                                </Typography>
                            )}

                            {/* Original post media */}
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
                        </Box>
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

                    {/* Media Modal for viewing images/videos */}
                    <MediaModal
                        isOpen={showMediaModal}
                        handleClose={() => setShowMediaModal(false)}
                        mediaList={originalPost?.mediaList || []}
                        currentIndex={currentMediaIndex}
                        setCurrentIndex={setCurrentMediaIndex}
                    />

                    {/* Interaction counts */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            p: 2,
                            borderTop: '1px solid',
                            borderBottom: '1px solid',
                            borderColor: 'grey.300'
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {post.likeCount} thích
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                {post.commentCount} bình luận
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                {post.shareCount} chia sẻ
                            </Typography>

                        </Box>
                    </Box>

                    {/* Action buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid',
                            borderColor: 'grey.300'
                        }}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                py: 1,
                                '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
                                cursor: 'pointer'
                            }}
                            onClick={handleLikePost}
                        >
                            {isLikedByCurrentUser ? (
                                <>
                                    <ThumbUpIcon fontSize="small" color="primary" />
                                    <Typography
                                        variant="body2"
                                        color="primary"
                                        sx={{ ml: 0.5, fontWeight: 500 }}
                                    >
                                        Thích
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <ThumbUpOutlinedIcon fontSize="small" />
                                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                                        Thích
                                    </Typography>
                                </>
                            )}
                        </Box>

                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                py: 1,
                                '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
                                cursor: 'pointer'
                            }}
                        >
                            <ChatBubbleIcon fontSize="small" />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                                Bình luận
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                py: 1,
                                '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
                                cursor: 'pointer'
                            }}

                            onClick={handleOpenCreatePostModal}
                        >
                            <ShareIcon fontSize="small" />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                                Chia sẻ
                            </Typography>
                        </Box>
                    </Box>

                    {/* Comments section */}
                    <Box
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        {post.comments && post.comments.map((comment) => {
                            // Tìm thông tin người dùng từ allUsers
                            const commentUser = allUsers.find((user) => user.userID === comment.userID);
                            return (
                                <Box key={comment.id || comment.commentID} sx={{ display: 'flex', gap: 1.5 }}>
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => navigate(`/profile/${comment.userID}`)}
                                    >
                                        {commentUser?.fullName?.[0]}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box
                                            sx={{
                                                bgcolor: 'grey.100',
                                                borderRadius: 3,
                                                p: 1.5,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: 500,
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                                onClick={() => navigate(`/profile/${comment.userID}`)}
                                            >
                                                {commentUser?.fullName}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    wordBreak: 'break-word',
                                                    overflowWrap: 'break-word',
                                                    hyphens: 'auto',
                                                    fontSize: '0.85rem',
                                                    mt: 0.5
                                                }}
                                            >
                                                {comment.content}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                mt: 0.5,
                                                px: 1
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                                            >
                                                {dayjs(comment.creationDate).fromNow()}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                            >
                                                Thích
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                            >
                                                Phản hồi
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* Comment input area */}
                <Box
                    sx={{
                        p: 2,
                        borderTop: '1px solid',
                        borderColor: 'grey.300',
                        bgcolor: 'background.paper',
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 1,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                fontSize: '0.9rem'
                            }}
                        >
                            {currentUser.user.fullName?.[0]}
                        </Avatar>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Viết bình luận..."
                            variant="outlined"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleCreateComment();
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 10,
                                    bgcolor: 'grey.100',
                                }
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={handleCreateComment}
                                            disabled={!newComment.trim()}
                                            sx={{ mr: 0.5 }}
                                        >
                                            <SendIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Share Modal */}
            {/* <div>
                <CreateSharePostModal open={showShareModal} handleClose={closeSharePost} shareModalRef={shareModalRef} item={post} userPost={userPost} updatePosts={updatePosts} />
            </div> */}
        </Modal>
    );
};


export default SharepostModal