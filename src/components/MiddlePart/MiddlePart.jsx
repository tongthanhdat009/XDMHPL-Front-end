import { Avatar } from '@mui/material'
import React, { useEffect } from 'react'
import Stories from './Stories';
import MoodIcon from '@mui/icons-material/Mood';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PostCard from '../Post/PostCard';
import CreatePostModal from '../CreatePost/CreatePostModal';
const MiddlePart = () => {
  const [openCreatePostModal, setOpenCreatePostModal] = React.useState(false);
  const handleCloseCreatePostModal = () => setOpenCreatePostModal(false);
  const handleOpenCreatePostModal = () => {
    setOpenCreatePostModal(true);
  }
  const post  =
  {
    newComment: null,
    posts: [
      {
        id: 1,
        caption: "Nothing",
        image: "https://www.breakflip.com/uploads2/Sting/Vignettes/Zeri-LoL-Nouveau-Champion.jpg",
        video: "",
        user: {
          id: 3,
          firstName: "Huỳnh",
          lastName: "Tuấn",
          email: "huynhsmash2468@gmail.com",
          password: "$2a$10$g14Mk8oDER389dSd17c6quz2vF4aroCFagAMsIzvkyKyFtEtnvnT.",
          gender: "male",
          followers: [],
          following: [],
          savedPosts: []
        },
        likedBy: [
          {
            id: 3,
            firstName: "Huỳnh",
            lastName: "Tuấn",
            email: "huynhsmash2468@gmail.com",
            password: "$2a$10$g14Mk8oDER389dSd17c6quz2vF4aroCFagAMsIzvkyKyFtEtnvnT.",
            gender: "male",
            followers: [],
            following: [],
            savedPosts: []
          }
        ],
        createdAt: "2025-03-18T09:53:58.889681",
        comments: [
          {
            id: 5,
            content: "wtf?",
            user: {
              id: 3,
              firstName: "Huỳnh",
              lastName: "Tuấn",
              email: "huynhsmash2468@gmail.com",
              password: "$2a$10$g14Mk8oDER389dSd17c6quz2vF4aroCFagAMsIzvkyKyFtEtnvnT.",
              gender: "male",
              followers: [],
              following: [],
              savedPosts: []
            },
            likedBy: [],
            createdAt: "2025-03-18T18:10:17.320092"
          },
          {
            id: 6,
            content: "bủh??",
            user: {
              id: 3,
              firstName: "Huỳnh",
              lastName: "Tuấn",
              email: "huynhsmash2468@gmail.com",
              password: "$2a$10$g14Mk8oDER389dSd17c6quz2vF4aroCFagAMsIzvkyKyFtEtnvnT.",
              gender: "male",
              followers: [],
              following: [],
              savedPosts: []
            },
            likedBy: [],
            createdAt: "2025-03-18T18:47:13.86635"
          },
          {
            id: 7,
            content: "lmao",
            user: {
              id: 3,
              firstName: "Huỳnh",
              lastName: "Tuấn",
              email: "huynhsmash2468@gmail.com",
              password: "$2a$10$g14Mk8oDER389dSd17c6quz2vF4aroCFagAMsIzvkyKyFtEtnvnT.",
              gender: "male",
              followers: [],
              following: [],
              savedPosts: []
            },
            likedBy: [],
            createdAt: "2025-03-26T20:43:44.334882"
          }
        ]
      },
      {
        id: 2,
        caption: "Hello",
        image: "https://www.breakflip.com/uploads2/Sting/Vignettes/Zeri-LoL-Nouveau-Champion.jpg",
        video: "",
        user: {
          id: 3,
          firstName: "Huỳnh",
          lastName: "Tuấn",
          email: "huynhsmash2468@gmail.com",
          password: "$2a$10$g14Mk8oDER389dSd17c6quz2vF4aroCFagAMsIzvkyKyFtEtnvnT.",
          gender: "male",
          followers: [],
          following: [],
          savedPosts: []
        },
        likedBy: [

        ],
        createdAt: "2025-03-18T09:53:58.889681",
        comments: [

        ]
      }
    ]
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
          {post.posts.map((item) => <PostCard key={item.id} item={item} />)}
        </div>
        <div>
          <CreatePostModal handleClose={handleCloseCreatePostModal} open={openCreatePostModal} />
        </div>
      </div>
    </div>
  )
}

export default MiddlePart