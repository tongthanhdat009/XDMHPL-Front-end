import { Avatar, Backdrop, Box, Button, CircularProgress, IconButton, Modal } from '@mui/material'
import { useFormik } from 'formik';
import React from 'react'
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

const CreatePostModal = ({ open, handleClose, updatePosts }) => {
  const [mediaFiles, setMediaFiles] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const user = authService.getCurrentUser()
  const formik = useFormik({
    initialValues: {
      userId: user.userID,
      caption: "",
      media: []
    },
    onSubmit: async (values) => {
      // Bắt đầu loading
      setIsLoading(true);
      try {
        // Gọi API tạo bài viết với media files
        const result = await  authService.createPost(values.caption, "post", values.media, values.userId);
        console.log(result)
        if (result.success) {
           // Gọi callback để cập nhật danh sách bài viết
           await updatePosts();

          // Đóng modal và reset form nếu thành công
          handleClose();
          formik.resetForm();
          setMediaFiles([]);
        } else {
          // Xử lý lỗi
          console.error("Error creating post:", result.error);
        }
      } catch (error) {
        console.error("Error in form submission:", error);
      } finally {
        // Kết thúc loading dù thành công hay thất bại
        setIsLoading(false);
      }
    }
  });

  // Hàm xử lý khi người dùng chọn file
  const handleMediaChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    // Tạo các đối tượng media mới
    const newMediaFiles = files.map(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) return null;
      
      return {
        file,
        type: isImage ? 'image' : 'video',
        url: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    }).filter(Boolean); // Lọc bỏ các giá trị null
    
    // Cập nhật state
    const updatedMediaFiles = [...mediaFiles, ...newMediaFiles];
    setMediaFiles(updatedMediaFiles);
    
    // Cập nhật formik
    formik.setFieldValue("media", updatedMediaFiles);
  };

  // Hàm xóa một media file
  const removeMediaFile = (id) => {
    const updatedMediaFiles = mediaFiles.filter(media => media.id !== id);
    setMediaFiles(updatedMediaFiles);
    formik.setFieldValue("media", updatedMediaFiles);
  };
  
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
              <Avatar src={user?.avatarURL ? 'http://localhost:8080/uploads' + user?.avatarURL :"http://localhost:8080/uploads/avatars/default.jpg"} />
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
            
            <div className='flex space-x-5 items-center mt-5'>
              <div>
                <input 
                  type="file" 
                  accept='image/*,video/*' 
                  style={{ display: "none" }} 
                  id='media-input'
                  onChange={handleMediaChange}
                  multiple
                />
                <label htmlFor="media-input">
                  <IconButton color='primary' component="span">
                    <ImageIcon />
                  </IconButton>
                </label>
                <span>Thêm ảnh/video</span>
              </div>
            </div>
            
            {mediaFiles.length > 0 && (
              <div className="mt-3">
                <p className="text-sm mb-1">Xem trước media:</p>
                <div className="grid grid-cols-2 gap-2">
                  {mediaFiles.map(media => (
                    <div key={media.id} className="relative border rounded p-1">
                      {media.type === 'image' ? (
                        <img 
                          className='h-32 w-full object-cover' 
                          src={media.url} 
                          alt="Preview" 
                        />
                      ) : (
                        <video 
                          className='h-32 w-full object-cover' 
                          src={media.url} 
                          controls 
                        />
                      )}
                      <IconButton 
                        size="small" 
                        color="error" 
                        className="absolute top-0 right-0 bg-white opacity-80 hover:opacity-100"
                        onClick={() => removeMediaFile(media.id)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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

export default CreatePostModal;