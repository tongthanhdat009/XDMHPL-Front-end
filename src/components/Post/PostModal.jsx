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
import { useAuth } from '../LoginPage/LoginProcess/AuthProvider';
import CommentItem from './CommentItem';

// PostModal component
const PostModal = ({ isOpen, handleClose, post, userPost, updatePosts, allUsers, handleOpenCreatePostModal }) => {
  const currentUser = authService.getCurrentUser();
  const [newComment, setNewComment] = React.useState('');
  const {stompClient } = useAuth();

  // Format date/time
  dayjs.extend(relativeTime);
  dayjs.locale('vi');
  const formattedTime = dayjs(post?.creationDate).format("DD [tháng] M [lúc] HH:mm");

  // Handle liking post
  const handleLikePost = () => {

  };

  // Handle creating comment
  const handleCreateComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      postId: post.postID,
      userId: currentUser.userID,
      data: {
        content: newComment
      }

    };

    try {
      const result = await authService.commentPost({comment, sendNotifyToServer});
      console.log(result)
      if (result.success) {
        // Gọi callback để cập nhật danh sách bài viết
        await updatePosts();
      } else {
        // Xử lý lỗi
        console.error("Error comment post:", result.error);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }

    setNewComment('');
  };


  const sendNotifyToServer = (newMessage) => {
    if (stompClient && newMessage) {
      console.log("📤 Sending message:", newMessage);
      stompClient.send(`/app/comment/notification`, {}, JSON.stringify(newMessage));
    }
};

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showMediaModal, setShowMediaModal] = useState(false);
  // Hàm để mở modal với ảnh/video được chọn
  const openMediaModal = (index) => {
    setCurrentMediaIndex(index);
    setShowMediaModal(true);
  };
  const isLikedByCurrentUser = post.likes.some(
    (like) => like.userId === currentUser.userID
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
        {/* Modal header - luôn cố định */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
        }}>
          <Typography id="post-modal-title" variant="h6" component="h2">
            Bài viết của {userPost.fullName}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Modal content - có thể scroll */}
        <Box
          sx={{
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 140px)', // Trừ đi chiều cao của header và input
            flex: 1,
          }}
        >
          {/* Post header */}
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
            <Avatar sx={{ mr: 1 }}>
              {userPost.avatarURL}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">
                {userPost.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formattedTime}
              </Typography>
            </Box>
          </Box>

          {/* Post caption */}
          <Typography variant="body2" sx={{ px: 2, pb: 2 }}>
            {post.content}
          </Typography>

          {/* Post Media */}
          {post.mediaList && post.mediaList.length > 0 && (
            <div className={`grid gap-1 ${post.mediaList.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {post.mediaList.map((media, index) => {
                const maxVisibleItems = 4;
                const showOverlay = post.mediaList.length > maxVisibleItems && index === maxVisibleItems - 1;

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
                        style={{ aspectRatio: index === 0 && post.mediaList.length === 1 ? 'auto' : '1/1' }}
                      />
                    ) : media.type === "video" ? (
                      <VideoThumbnail
                        videoUrl={media.mediaURL}
                        index={index}
                        totalMedia={post.mediaList.length}
                      />
                    ) : null}

                    {/* Overlay cho "+X" indicator */}
                    {showOverlay && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          +{post.mediaList.length - maxVisibleItems + 1}
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
            mediaList={post.mediaList || []}
            currentIndex={currentMediaIndex}
            setCurrentIndex={setCurrentMediaIndex}
          />

          {/* Interaction counts */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 2,
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary">
              {post.likeCount} thích
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {post.commentCount} bình luận
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {post.shareCount} lượt chia sẻ
              </Typography>
            </Box>
          </Box>

          {/* Interaction buttons */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 1,
              '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
              cursor: 'pointer'
            }} onClick={handleLikePost}>
              <IconButton size="small" color={isLikedByCurrentUser ? "primary" : "default"}>
                {isLikedByCurrentUser ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
              </IconButton>
              <Typography variant="body2" sx={{ ml: 0.5 }}>Thích</Typography>
            </Box>

            <Box sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 1,
              '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
              cursor: 'pointer'
            }}>
              <IconButton size="small">
                <ChatBubbleIcon />
              </IconButton>
              <Typography variant="body2" sx={{ ml: 0.5 }}>Bình luận</Typography>
            </Box>

            <Box sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 1,
              '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
              cursor: 'pointer'
            }}  onClick={handleOpenCreatePostModal}>
              <IconButton size="small">
                <ShareIcon />
              </IconButton>
              <Typography variant="body2" sx={{ ml: 0.5 }}>Chia sẻ</Typography>
            </Box>

          </Box>

          {/* Comments section */}
          <Box sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
            {post.comments.map((comment) => {
              // Tìm thông tin người dùng từ allUsers
              const user = allUsers.find((user) => user.userID === comment.userID);
              return (
                <CommentItem
                  key={comment.commentID}
                  comment={comment}
                  user={user}
                  currentUser={currentUser}
                  updatePosts={updatePosts}
                />
              )
            })}
          </Box>
        </Box>

        {/* Comment input area - luôn cố định dưới cùng */}
        <Box sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
              {/* {auth.user.firstName?.[0]} */}
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
                  bgcolor: 'action.hover',
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
    </Modal>
  );
};

export default PostModal