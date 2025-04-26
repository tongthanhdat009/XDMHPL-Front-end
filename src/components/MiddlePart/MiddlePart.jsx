import { Avatar } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Stories from './Stories';
import MoodIcon from '@mui/icons-material/Mood';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PostCard from '../Post/PostCard';
import CreatePostModal from '../CreatePost/CreatePostModal';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import SharepostCard from '../Post/SharepostCard';
const MiddlePart = () => {
  const [openCreatePostModal, setOpenCreatePostModal] = React.useState(false);
  const handleCloseCreatePostModal = () => setOpenCreatePostModal(false);
  const handleOpenCreatePostModal = () => {
    setOpenCreatePostModal(true);
  }
  const [posts, setPosts] = useState([]); // Khai báo state cho posts
  const [allUsers, setAllUsers] = useState([]);
  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const fetchedPosts = await authService.getAllPosts();
        const users = await authService.getAllUsers();
        setAllUsers(users);
        setPosts(fetchedPosts); // Cập nhật state với dữ liệu bài viết
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchDatas();
  }, []);


  const updatePosts = async () => {
    try {
      const result = await authService.getAllPostsFormDB();
      if (result.success) {
        setPosts(result.data); // Cập nhật danh sách bài viết
      }
    } catch (error) {
      console.error("Error updating posts:", error);
    }
  };
  // console.log('post', post);
  // useEffect(() => {

  // }, [post.newComment]);
  return (

    <div className='flex-grow h-screen pb-44 pt-6 mr-4 xl:mr-40 overflow-y-auto scrollbar' style={{ scrollbarWidth: "none" }}>
      <div className='mx-auto max-w-md md:max-w-lg lg:max-w-2xl'>
        {/* <Stories /> */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200  m-2">
          <div className="flex items-center p-3 space-x-3">
            <Avatar
              className='w-10 h-10 rounded-full'
            />
            <input
              onClick={handleOpenCreatePostModal}
              type="text"
              placeholder="Tuan ơi, bạn đang nghĩ gì thế?"
              className="flex-grow outline-none text-gray-600 text-sm cursor-pointer"
              readOnly
            />
          </div>
          <div className="border-t border-gray-200 flex justify-between p-2">
            <div className="flex items-center space-x-2 text-gray-500 text-sm cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
              <VideocamIcon className="text-red-500" />
              <span>Video trực tiếp</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 text-sm cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
              <PhotoLibraryIcon className="text-green-500" />
              <span>Ảnh/Video</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 text-sm cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
              <MoodIcon className="text-yellow-500" />
              <span>Cảm xúc/hoạt động</span>
            </div>
          </div>
        </div>


        <div className='mt-5 space-y-5'>
          {posts.map((item) => {
            // Tìm userPost trong allUsers dựa trên item.userID
            const userPost = allUsers.find((user) => user.userID === item.userID);

            if (item.originalPostID != null) {
              // Tìm originalPost trong posts dựa trên originalPostID
              const originalPost = posts.find((post) => post.postID === item.originalPostID);

              const userOriginalPost = allUsers.find((user) => user.userID === originalPost.userID);
              // Truyền cả item, userPost và originalPost vào SharepostCard
              return (
                <SharepostCard
                  key={item.postID}
                  item={item}
                  userPost={userPost}
                  originalPost={originalPost}
                  userOriginalPost={userOriginalPost}
                  allUsers={allUsers}
                  updatePosts={updatePosts}
                />
              );
            } else {
              // Truyền item và userPost vào PostCard
              return <PostCard key={item.postID} item={item} userPost={userPost} updatePosts={updatePosts} allUsers={allUsers} />;
            }
          })}
        </div>
        <div>
          <CreatePostModal handleClose={handleCloseCreatePostModal} open={openCreatePostModal} updatePosts={updatePosts} allUsers={allUsers} />
        </div>
      </div>
    </div>
  )
}

export default MiddlePart