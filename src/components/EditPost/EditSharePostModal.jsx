import { Avatar, Box, Button, IconButton, Modal, Typography } from '@mui/material'
import { useFormik } from 'formik';
import React from 'react'
import authService from '../LoginPage/LoginProcess/ValidateLogin';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
};

const CreateSharePostModal = ({ open, handleClose, shareModalRef, item, userPost, updatePosts }) => {
    const currentUser = authService.getCurrentUser();
    const formik = useFormik({
        initialValues: {
            userID: currentUser.user.userID,
            parentShareID: item.originalPostID==null ? null : item.postID,
            originalPostID : item.originalPostID!=null ? item.originalPostID : item.postID,
            caption: ""
        },
        onSubmit: async (values) => {
            const response = await authService.createShareAction(values); 
            if (response.success) {
                // Gọi callback để cập nhật danh sách bài viết
                await updatePosts();
     
               // Đóng modal và reset form nếu thành công
               handleClose();
               formik.resetForm();
             } else {
               // Xử lý lỗi
               console.error("Error creating post:", result.error);
             }
        }
    })
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style} ref={shareModalRef}>
                <form onSubmit={formik.handleSubmit}>
                    <div className="flex justify-between items-center mb-4">
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Chia sẻ
                        </Typography>
                        <Button onClick={handleClose}>✖</Button>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                        <Avatar />
                        <div>
                            <Typography className="font-semibold">{userPost.fullName}</Typography>
                        </div>
                    </div>

                    <textarea
                        className="w-full p-2 mb-4 border-none outline-none resize-none bg-transparent placeholder-gray-500"
                        placeholder="Hãy nói gì đó về nội dung này (Không bắt buộc)"
                        rows={3}
                        id="caption"
                        name="caption"
                        onChange={formik.handleChange}
                        value={formik.values.caption}
                    ></textarea>

                    <div className="flex justify-end">
                        <Button
                            variant="contained"
                            sx={{ borderRadius: '1.5rem', backgroundColor: '#1a73e8' }}
                            type='submit'
                        >
                            Chia sẻ ngay
                        </Button>
                    </div>
                </form>
            </Box>
        </Modal>
    );
};


export default CreateSharePostModal