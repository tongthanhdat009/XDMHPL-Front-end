import { Avatar,  Divider, IconButton } from '@mui/material'
import React from 'react'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShareIcon from '@mui/icons-material/Share';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
// import { createCommentAction, likePostAction } from '../../redux/Post/post.action';
import { isLikedByReqUser } from '../../utils/isLikedByReqUser';
import dayjs from 'dayjs';
const PostCard = ({ item }) => {
    const createdAt = item.createdAt;
    const totalComments = item.comments.length
    const totalLikes = item.likedBy.length
    const formattedTime = dayjs(createdAt).format("DD [tháng] M [lúc] HH:mm");
    const [showComments, setShowComments] = React.useState(false)
    const handleShowComments = () => {
        setShowComments(!showComments)
    }

    const handleCreateComment = (content) => {
        const reqData = {
            postId: item.id,
            data: {
                content
            }
        }

    }

    const handleLikePost = () => {

    }
    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                    <Avatar
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <div className="font-semibold text-sm">{item.user.firstName + " " + item.user.lastName}</div>
                        <div className="text-xs text-gray-500">{formattedTime}</div>
                    </div>
                </div>
                <div className="text-gray-500">...</div>
            </div>

            {/* Post Text */}
            <div className="px-3 pb-3 text-sm">
                {item.caption}
            </div>

            {/* Post Image */}
            {
                item.image && <img
                    src={item.image}
                    alt="Post"
                    className="w-full max-h-[30rem] object-cover"
                />
            }

            {/* Interactions */}
            <div className="flex justify-between p-3 text-sm text-gray-600 border-t">
                <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                    <IconButton onClick={handleLikePost}>
                        {isLikedByReqUser(3, item) ? <ThumbUpIcon className='text-blue-500' /> : <ThumbUpOutlinedIcon />}
                    </IconButton>
                    <span>{totalLikes} thích</span>
                </div>
                <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                    <IconButton onClick={handleShowComments}>
                        <ChatBubbleIcon />
                    </IconButton>
                    <span>{totalComments} bình luận</span>
                </div>
                <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                    <IconButton>
                        <ShareIcon />
                    </IconButton>
                    <span>Chia sẻ</span>
                </div>
            </div>



            {showComments && <section>
                <div className='flex items-center space-x-5 mx-3 my-5'>
                    <Avatar />

                    <input onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleCreateComment(e.target.value);
                            console.log(e.target.value);
                        }
                    }} type="text" className='w-full outline-none bg-transparent border border-[#3b4054] rounded-full px-5 py-2'
                        placeholder='Write your comment....' />
                </div>
                <Divider />
                <div className='mx-3 space-y-2 my-5 text-xs pb-3'>
                    {item.comments.map((comment) => <div key={comment.id} className='flex items-center space-x-5'>
                        <Avatar sx={{ height: "2rem", width: "2rem", fontSize: "8rem" }}>
                            {comment.user.firstName[0]}
                        </Avatar>
                        <p>{comment.content}</p>
                    </div>)}
                </div>
            </section>}
        </div>
    )
}

export default PostCard