import React from 'react';
import { Modal, Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const LikesModal = ({ isOpen, handleClose, likes }) => {
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="likes-modal-title"
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
          maxWidth: '400px',
          width: '100%',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
        }}
      >
        {/* Modal header */}
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
          <Typography id="likes-modal-title" variant="h6" component="h2">
            Những người đã thích
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Modal content - danh sách người thích */}
        <Box
          sx={{
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <List sx={{ py: 0 }}>
            {likes && likes.length > 0 ? (
              likes.map((like) => (
                <ListItem key={like.id} sx={{ 
                  py: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}>
                  <ListItemAvatar>
                    <Avatar src={like.avatarURL ? 'http://localhost:8080/uploads' + like.avatarURL : "http://localhost:8080/uploads/avatars/default.jpg"}>
                      {!like.avatarURL && like.fullName ? like.fullName.charAt(0) : 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={like.fullName || 'Unknown User'} 
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Chưa có lượt thích nào." />
              </ListItem>
            )}
          </List>
        </Box>
      </Box>
    </Modal>
  );
};

export default LikesModal;