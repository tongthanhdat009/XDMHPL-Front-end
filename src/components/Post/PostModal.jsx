import React from 'react'
import { useDispatch, useSelector } from "react-redux";
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
import { createCommentAction, likePostAction } from '../../redux/Post/post.action';
// PostModal component
const PostModal = ({ isOpen, handleClose, post }) => {
    const dispatch = useDispatch();
    const { auth } = useSelector(store => store);
    const [newComment, setNewComment] = React.useState('');
    
    // Format date/time
    dayjs.extend(relativeTime);
    dayjs.locale('vi');
    const formattedTime = dayjs(post?.createdAt).format("DD [tháng] M [lúc] HH:mm");
  
    // Handle liking post
    const handleLikePost = () => {
      dispatch(likePostAction(post.id));
    };
  
    // Handle creating comment
    const handleCreateComment = () => {
      if (!newComment.trim()) return;
      
      const reqData = {
        postId: post.id,
        data: {
          content: newComment
        }
      };
      
      dispatch(createCommentAction(reqData));
      setNewComment('');
    };
  
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
              Bài viết của {post.user.firstName} {post.user.lastName}
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
                {post.user.firstName[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">
                  {post.user.firstName + " " + post.user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formattedTime}
                </Typography>
              </Box>
            </Box>
            
            {/* Post caption */}
            <Typography variant="body2" sx={{ px: 2, pb: 2 }}>
              {post.caption}
            </Typography>
            
            {/* Post image */}
            {post.image && (
              <Box sx={{ width: '100%' }}>
                <img
                  src={post.image}
                  alt="Post"
                  style={{ width: '100%', objectFit: 'cover' }}
                />
              </Box>
            )}
            
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
                  {post.comments.length} bình luận
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  10 lượt chia sẻ
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
                <IconButton size="small" color={post.likedByCurrentUser ? "primary" : "default"}>
                  {post.likedByCurrentUser ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
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
              
              {post.user.id !== auth.user.id && (
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
                    <ShareIcon />
                  </IconButton>
                  <Typography variant="body2" sx={{ ml: 0.5 }}>Chia sẻ</Typography>
                </Box>
              )}
            </Box>
            
            {/* Comments section */}
            <Box sx={{ 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              {post.comments.map((comment) => (
                <Box key={comment.id} sx={{ display: 'flex', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                    {comment.user.firstName[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ 
                      bgcolor: 'action.hover', 
                      borderRadius: 3,
                      p: 1,
                      overflow: 'hidden'
                    }}>
                      <Typography variant="subtitle2">
                        {comment.user.firstName} {comment.user.lastName}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          hyphens: 'auto'
                        }}
                      >
                        {comment.content}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mt: 0.5
                    }}>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(comment.createdAt).fromNow()}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        fontWeight="medium"
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        Thích
                      </Typography>
                      <Typography 
                        variant="caption" 
                        fontWeight="medium"
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        Phản hồi
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            bgcolor: 'primary.main',
                            color: 'white',
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6rem'
                          }}
                        >
                          
                        </Box>
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          {comment.likeCount}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
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
                {auth.user.firstName?.[0]}
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