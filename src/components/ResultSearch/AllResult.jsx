import { Avatar } from '@mui/material';
import React, { useEffect, useState } from 'react'
import PostCard from '../Post/PostCard';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import SharepostCard from '../Post/SharepostCard';

const AllResult = () => {
    const location = useLocation();
    const { type } = useParams();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const queryValue = queryParams.get("q");
    const currentUser = authService.getCurrentUser();
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

    const PostSearch = posts.filter((post) => post.content.toLowerCase().includes(queryValue.toLowerCase()));
    const UsersSearch = allUsers.filter(
        (user) =>
            user.fullName.toLowerCase().includes(queryValue.toLowerCase()) &&
            user.userID !== currentUser.user.userID 
    );
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

    return (
        <div className="flex-grow bg-gray-100 p-4 overflow-y-auto scrollbar ">
            <div className='w-2/5 mx-auto'>
                {type === 'top' ? (
                    <>
                        <div className="bg-white rounded-lg p-2">
                            <h2 className="text-xl font-bold mb-4">Mọi người</h2>
                            {UsersSearch.map((person, index) => {
                                const isSent = currentUser.user.friends.some(
                                    (friend) => friend.userID === person.userID && friend.status === "PENDING"
                                );
                            
                                const isReceived = currentUser.user.friendOf.some(
                                    (friend) => friend.userID === person.userID && friend.status === "PENDING"
                                );
                            
                                const isFriend = currentUser.user.friends.some(
                                    (friend) => friend.userID === person.userID && friend.status === "ACCEPTED"
                                ) || currentUser.user.friendOf.some(
                                    (friend) => friend.userID === person.userID && friend.status === "ACCEPTED"
                                );

                                const totalFriends = person.friends.filter(
                                    (friend) => friend.status === "ACCEPTED"
                                ).length + person.friendOf.filter(
                                    (friend) => friend.status === "ACCEPTED"
                                ).length;
                                // console.log('isSent', isSent);
                                // console.log('isReceived', isReceived);
                                // console.log('isFriend', isFriend);
                                return (
                                    <div key={index} className="flex items-center mb-4 justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Avatar
                                                src={`/api/placeholder/50/50?text=${person.fullName.charAt(0)}`}
                                                alt={person.fullName}
                                                className="w-16 h-16"
                                            />
                                            <div>
                                                <div className="flex items-center space-x-1">
                                                    <p className="font-semibold">{person.fullName}</p>
                                                </div>
                                                <p className="text-sm text-gray-500">{totalFriends} người bạn</p>
                                            </div>
                                        </div>
                                        {
                                            isSent ? (
                                                <>
                                                    <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded-md px-3 py-1.5">
                                                        Hủy lời mời
                                                    </button>
                                                </>
                                            ) : isReceived ? (
                                                <>
                                                    <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded-md px-3 py-1.5">
                                                        Xác nhận lời mời
                                                    </button>
                                                </>
                                            ) : isFriend ? (
                                                <>
                                                    <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded-md px-3 py-1.5">
                                                        Nhắn tin
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                </>
                                            )
                                        }                                      
                                    </div>
                                )
                            })}
                            <div className="text-center mt-4">
                                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md w-full cursor-pointer" onClick={() => navigate(`/search/people/?q=${queryParams}`)}>
                                    Xem tất cả
                                </button>
                            </div>
                        </div>

                        <div className='mt-5 space-y-5'>
                            {PostSearch.map((item) => {
                                // Tìm userPost trong allUsers dựa trên item.userID
                                const userPost = allUsers.find((user) => user.userID === item.userID);

                                if (item.originalPostID != null) {
                                    // Tìm originalPost trong posts dựa trên originalPostID
                                    const originalPost = posts.find((post) => post.postID === item.originalPostID) || null;

                                    // Chỉ tìm userOriginalPost nếu originalPost tồn tại
                                    const userOriginalPost = originalPost
                                        ? allUsers.find((user) => user.userID === originalPost.userID) || null
                                        : null;

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
                    </>
                ) : type === 'posts' ? (
                    <div className='mt-5 space-y-5'>
                        {PostSearch.map((item) => {
                            // Tìm userPost trong allUsers dựa trên item.userID
                            const userPost = allUsers.find((user) => user.userID === item.userID);

                            if (item.originalPostID != null) {
                                // Tìm originalPost trong posts dựa trên originalPostID
                                const originalPost = posts.find((post) => post.postID === item.originalPostID) || null;

                                // Chỉ tìm userOriginalPost nếu originalPost tồn tại
                                const userOriginalPost = originalPost
                                    ? allUsers.find((user) => user.userID === originalPost.userID) || null
                                    : null;

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
                ) : (
                    <div className="bg-white rounded-lg p-2">
                        <h2 className="text-xl font-bold mb-4">Mọi người</h2>
                        {UsersSearch.map((person, index) => {
                                const isSent = currentUser.user.friends.some(
                                    (friend) => friend.userID === person.userID && friend.status === "PENDING"
                                );
                            
                                const isReceived = currentUser.user.friendOf.some(
                                    (friend) => friend.userID === person.userID && friend.status === "PENDING"
                                );
                            
                                const isFriend = currentUser.user.friends.some(
                                    (friend) => friend.userID === person.userID && friend.status === "ACCEPTED"
                                ) || currentUser.user.friendOf.some(
                                    (friend) => friend.userID === person.userID && friend.status === "ACCEPTED"
                                );

                                const totalFriends = person.friends.filter(
                                    (friend) => friend.status === "ACCEPTED"
                                ).length + person.friendOf.filter(
                                    (friend) => friend.status === "ACCEPTED"
                                ).length;
                                
                                // console.log('isSent', isSent);
                                // console.log('isReceived', isReceived);
                                // console.log('isFriend', isFriend);
                                return (
                                    <div key={index} className="flex items-center mb-4 justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Avatar
                                                src={`/api/placeholder/50/50?text=${person.fullName.charAt(0)}`}
                                                alt={person.fullName}
                                                className="w-16 h-16"
                                            />
                                            <div>
                                                <div className="flex items-center space-x-1">
                                                    <p className="font-semibold">{person.fullName}</p>
                                                </div>
                                                <p className="text-sm text-gray-500">{totalFriends} người bạn</p>
                                            </div>
                                        </div>
                                        {
                                            isSent ? (
                                                <>
                                                    <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded-md px-3 py-1.5">
                                                        Hủy lời mời
                                                    </button>
                                                </>
                                            ) : isReceived ? (
                                                <>
                                                    <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded-md px-3 py-1.5">
                                                        Xác nhận lời mời
                                                    </button>
                                                </>
                                            ) : isFriend ? (
                                                <>
                                                    <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded-md px-3 py-1.5">
                                                        Nhắn tin
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                </>
                                            )
                                        }                                      
                                    </div>
                                )
                            })}
                    </div>
                )}

                <div className='pt-4 mb-20 text-center'>
                    Kết quả tìm kiếm chỉ bao gồm những nội dung hiển thị với bạn.
                </div>
            </div>
        </div>
    );
}

export default AllResult