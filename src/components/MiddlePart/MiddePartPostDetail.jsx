import React, { useEffect, useState } from 'react'
import PostCard from '../Post/PostCard';
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import SharepostCard from '../Post/SharepostCard';
const MiddePartPostDetail = ({ postID, commentID }) => {
    const [post, setPost] = useState(null); // State cho bài viết đơn lẻ
    const [allUsers, setAllUsers] = useState([]);
    const [originalPost, setOriginalPost] = useState(null); // Cho bài viết được chia sẻ
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Lấy tất cả người dùng
                const users = await authService.getAllUsers();
                setAllUsers(users);

                // Lấy tất cả bài viết
                const fetchedPosts = await authService.getAllPosts();
                // Tìm bài viết cụ thể dựa trên postID
                const targetPost = fetchedPosts.find(post => post.postID == postID);
                if (targetPost) {
                    setPost(targetPost);

                    // Nếu đây là bài viết được chia sẻ, tìm bài viết gốc
                    if (targetPost.originalPostID) {
                        const original = fetchedPosts.find(p => p.postID == targetPost.originalPostID);
                        setOriginalPost(original);
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [postID]); // Tải lại khi postID thay đổi

    // Tìm thông tin người dùng cho bài viết
    const getPostAuthor = (userID) => {
        return allUsers.find(user => user.userID == userID) || null;
    };

    const updatePosts = async () => {
        try {
            const result = await authService.getAllPostsFormDB();
        } catch (error) {
            console.error("Error updating posts:", error);
        }
    };

    const updateUsers = async () => {
        try {
            const result = await authService.getAllUsersFormDB();
            if (result.success) {
                setAllUsers(result.data); // Cập nhật danh sách người dùng
            }
        } catch (error) {
            console.error("Error updating users:", error);
        }
    };

    const updateCurentUser = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            const result = await authService.getCurrentUserFormDB(currentUser.userID);
        } catch (error) {
            console.error("Error updating current user:", error);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!post) {
        return <div>Post not found</div>;
    }

    // Tìm thông tin người dùng của bài viết gốc (nếu có)
    const userOriginalPost = originalPost ? getPostAuthor(originalPost.userID) : null;

    console.log(post);
    return (
        <div className='flex-grow h-screen pb-44 pt-6 mr-4 xl:mr-40 overflow-y-auto scrollbar' style={{ scrollbarWidth: "none" }}>


            <div className='mx-auto max-w-md md:max-w-lg lg:max-w-2xl'>
                <div className='mt-5 space-y-5'>
                    <div className="post-detail-container">
                        {post.originalPostID ? (
                            // Đây là bài viết được chia sẻ
                            <div className="shared-post">
                                <SharepostCard
                                    key={post.postID}
                                    item={post}
                                    userPost={getPostAuthor(post.userID)}
                                    originalPost={originalPost}
                                    userOriginalPost={userOriginalPost}
                                    allUsers={allUsers}
                                    updatePosts={updatePosts}
                                    updateUsers={updateUsers}
                                    updateCurentUser={updateCurentUser}
                                    commentID={commentID}
                                />
                            </div>
                        ) : (
                            // Đây là bài viết gốc
                            <div className="original-post">
                                <PostCard
                                    item={post}
                                    userPost={getPostAuthor(post.userID)}
                                    updatePosts={updatePosts}
                                    allUsers={allUsers}
                                    updateUsers={updateUsers}
                                    updateCurentUser={updateCurentUser}
                                    commentID={commentID}
                                />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MiddePartPostDetail;