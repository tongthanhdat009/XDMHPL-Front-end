import { Avatar, Backdrop, Box, Button, CircularProgress, IconButton, Modal } from '@mui/material'
import { useFormik } from 'formik';
import React from 'react'
import ImageIcon from '@mui/icons-material/Image';
import VideoCallIcon from '@mui/icons-material/VideoCall';
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
const CreatePostModal = ({ open, handleClose }) => {
  const [selectedImage, setSelectedImage] = React.useState();
  const [selectedVideo, setSelectedVideo] = React.useState();
  const [isLoading, setIsLoading] = React.useState(false);


  const formik = useFormik({
    initialValues: {
      caption: "",
      image: "",
      video: ""
    },
    onSubmit: (values) => {
      console.log("values", values);
    }
  })


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

            <div className='flex space-x-5 items-center mt-5'>
              <div>
                <input type="file" accept='image/*' style={{ display: "none" }} id='image-input' />
                <label htmlFor="image-input">
                  <IconButton color='primary' component="span">
                    <ImageIcon />
                  </IconButton>
                </label>
                <span>Image</span>
              </div>

              <div>
                <input type="file" accept='video/*' style={{ display: "none" }} id='image-input' />
                <label htmlFor="video-input">
                  <IconButton color='primary'>
                    <VideoCallIcon />
                  </IconButton>
                </label>
                <span>Video</span>
              </div>
            </div>

            {selectedImage && (
              <img className='h-[10rem]' src={selectedImage} alt="Selected" />
            )}
            {selectedVideo && (
              <video src={selectedVideo} controls />
            )}
            <div className='flex w-full justify-end'>
              <Button variant='contained' sx={{ borderRadius: "1.5rem" }} type='submit'>Post</Button>
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
  )
}

export default CreatePostModal