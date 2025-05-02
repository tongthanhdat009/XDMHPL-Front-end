import React, { useState } from 'react';
import {
    Box, Typography, IconButton, Avatar, TextField, Menu, MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import authService from '../LoginPage/LoginProcess/ValidateLogin';

dayjs.extend(relativeTime);

const CommentItem = ({ comment, user, currentUser, updatePosts }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const isCurrentUserComment = comment.userID === currentUser.userID;

    // Mở menu (3 chấm)
    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Đóng menu
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    // Chuyển sang chế độ chỉnh sửa
    const handleEdit = () => {
        setIsEditing(true);
        setEditContent(comment.content);
        handleCloseMenu();
    };

    // Hiển thị dialog xác nhận trước khi xóa
    const handleConfirmDelete = () => {
        setOpenConfirmDialog(true);
        handleCloseMenu();
    };

    // Đóng dialog xác nhận
    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
    };

    // Xử lý khi đã xác nhận xóa comment
    const handleDelete = async () => {
        try {
            // Gọi API xóa comment
            const result = await authService.deleteComment(comment.commentID);
            if (result.success) {
                // Cập nhật lại danh sách bình luận
                await updatePosts();
            } else {
                console.error("Error deleting comment:", result.error);
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
        setOpenConfirmDialog(false);
    };

    // Lưu comment đã chỉnh sửa
    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;

        try {
            const commentData = {
                commentId: comment.commentID,
                data: {
                    content: editContent
                }
            };
            // Gọi API cập nhật comment
            const result = await authService.updateComment(commentData);

            if (result.success) {
                // Cập nhật lại danh sách bình luận
                await updatePosts();
            } else {
                console.error("Error updating comment:", result.error);
            }
        } catch (error) {
            console.error("Error updating comment:", error);
        }

        // Thoát khỏi chế độ chỉnh sửa
        setIsEditing(false);
    };

    // Hủy chỉnh sửa
    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    return (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                {user.avatarURL || user.fullName?.[0]}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                {isEditing ? (
                    // Hiển thị input chỉnh sửa
                    <Box sx={{
                        bgcolor: 'action.hover',
                        borderRadius: 3,
                        p: 1,
                        overflow: 'hidden'
                    }}>
                        <Typography variant="subtitle2" fontWeight={"bold"}>
                            {user.fullName}
                        </Typography>
                        <TextField
                            fullWidth
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            variant="standard"
                            autoFocus
                            multiline
                            maxRows={10}
                            sx={{ mt: 1 }}
                            InputProps={{
                                disableUnderline: true,
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                            <Typography
                                variant="caption"
                                fontWeight="medium"
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                                onClick={handleCancelEdit}
                            >
                                Hủy
                            </Typography>
                            <Typography
                                variant="caption"
                                fontWeight="medium"
                                color="primary"
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                                onClick={handleSaveEdit}
                            >
                                Lưu
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    // Hiển thị comment bình thường
                    <Box sx={{
                        bgcolor: 'action.hover',
                        borderRadius: 3,
                        p: 1,
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <Typography variant="subtitle2" fontWeight={"bold"}>
                            {user.fullName}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                hyphens: 'auto',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {comment.content}
                        </Typography>

                        {/* Nút 3 chấm cho menu (chỉ hiển thị với comment của user hiện tại) */}
                        {isCurrentUserComment && (
                            <IconButton
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    opacity: 0.7,
                                    '&:hover': { opacity: 1 }
                                }}
                                onClick={handleOpenMenu}
                            >
                                <MoreHorizIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                )}

                {!isEditing && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 0.5
                    }}>
                        <Typography variant="caption" color="text.secondary">
                            {dayjs(comment.creationDate).fromNow()}
                        </Typography>
                    </Box>
                )}

                {/* Menu cho chỉnh sửa/xóa comment */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleEdit}>Chỉnh sửa</MenuItem>
                    <MenuItem onClick={handleConfirmDelete}>Xóa</MenuItem>
                </Menu>

                {/* Dialog xác nhận xóa bình luận */}
                <Dialog
                    open={openConfirmDialog}
                    onClose={handleCloseConfirmDialog}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle>Xóa bình luận?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Bạn có chắc chắn muốn xóa bình luận này không?
                        </DialogContentText>
                        {/* <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                    maxHeight: '100px',
                                    overflow: 'auto'
                                }}
                            >
                                {comment.content}
                            </Typography>
                        </Box> */}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmDialog} color="primary">
                            Không
                        </Button>
                        <Button onClick={handleDelete} color="error" variant="contained">
                            Xóa
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};
export default CommentItem;