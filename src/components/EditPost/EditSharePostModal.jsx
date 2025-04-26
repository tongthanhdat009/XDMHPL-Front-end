import { Avatar, Backdrop, Box, Button, CircularProgress, IconButton, Modal } from '@mui/material'
import { useFormik } from 'formik';
import React, { useEffect } from 'react'
import ImageIcon from '@mui/icons-material/Image';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import CloseIcon from '@mui/icons-material/Close';
// import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: ".6rem",
  outline: "none"
};

const EditSharePostModal = ({ open, handleClose, updatePosts, item }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const user = authService.getCurrentUser()
  const formik = useFormik({
    initialValues: {
      postID: item.postID,
      userId: user.user.userID,
      caption: item.content,
      media: []
    },
    onSubmit: async (values) => {
      // Bắt đầu loading
      setIsLoading(true);
      try {
        // Gọi API tạo bài viết với media files
        const result = await  authService.updatePost(values.caption, "share", values.media, values.userId, values.postID);
        console.log(result)
        if (result.success) {
           // Gọi callback để cập nhật danh sách bài viết
           await updatePosts();

          // Đóng modal và reset form nếu thành công
          handleClose();
          formik.resetForm();
        } else {
          // Xử lý lỗi
          console.error("Error creating post:", result.error);
        }
      } catch (error) {
        console.error("Error in form submission:", error);
      } finally {
        setIsLoading(false);
      }
    }
  });
  
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <form onSubmit={formik.handleSubmit}>
          <div>
            <div className='flex space-x-4 items-center'>
              <Avatar />
              <div>
                <p className='font-bold text-lg'>{"Huỳnh Tuấn"}</p>
              </div>
            </div>
            <textarea
              className='outline-none w-full mt-5 p-2 bg-transparent border border-[#3b4054] rounded-sm'
              placeholder="Write Caption..."
              id="caption"
              name="caption"
              onChange={formik.handleChange}
              value={formik.values.caption}
              rows={4}
            ></textarea>
            
            <div className='flex w-full justify-end mt-4'>
              <Button 
                variant='contained' 
                sx={{ borderRadius: "1.5rem" }} 
                type='submit'
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng...' : 'Đăng bài'}
              </Button>
            </div>
          </div>
        </form>
        <Backdrop
          sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
          open={isLoading}
          onClick={handleClose}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Modal>
  );
};

export default EditSharePostModal;