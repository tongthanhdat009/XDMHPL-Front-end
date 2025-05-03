import React, { useState, useEffect, useCallback } from "react";
import { FaUserCircle, FaTimes, FaTrashAlt, FaCheckCircle, FaTimesCircle, FaCommentAlt } from 'react-icons/fa';
import axios from "axios";

// Thêm prop onDeleteComment
const CardPostDetail = ({ post, onClose, onDelete, onToggleVisibility, onDeleteComment }) => {
    const [postAuthor, setPostAuthor] = useState(null);
    const [commentUsersData, setCommentUsersData] = useState({});
    const [loadingUsers, setLoadingUsers] = useState(false);
    console.log("post", post.mediaList);
    // --- fetchUserByID ---
    const fetchUserByID = useCallback(async (userID) => {
        // ... (giữ nguyên)
        if (!userID) return null;
        try {
            const response = await axios.get(`http://localhost:8080/users/find/${userID}`);
            if (Array.isArray(response.data) && response.data.length > 0 && Array.isArray(response.data[0]) && response.data[0].length >= 2) {
                return {
                    id: response.data[0][0],
                    name: response.data[0][1]
                };
            }
            console.warn(`Dữ liệu user không hợp lệ từ API cho ID ${userID}:`, response.data);
            return null;
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin người dùng ID ${userID}:`, error);
            return null;
        }
    }, []);

    // --- useEffect fetch người đăng bài ---
    useEffect(() => {
        // ... (giữ nguyên)
        if (post?.userID) {
            setLoadingUsers(true);
            fetchUserByID(post.userID)
                .then(userData => {
                    setPostAuthor(userData);
                })
                .finally(() => {
                    // setLoadingUsers(false) sẽ được gọi trong useEffect của comments
                });
        } else {
            setPostAuthor(null);
        }
    }, [post?.userID, fetchUserByID]);


    const commentsToDisplay = post?.comments || [];

    // --- useEffect fetch người bình luận ---
    useEffect(() => {
        // ... (giữ nguyên)
        const fetchCommentUsers = async () => {
            if (commentsToDisplay.length === 0) {
                 setLoadingUsers(false);
                 return;
            }
            const userIDsToFetch = commentsToDisplay
                .map(comment => comment.userID)
                .filter((userID, index, self) => userID && self.indexOf(userID) === index)
                .filter(userID => !commentUsersData[userID]);

            if (userIDsToFetch.length === 0) {
                 setLoadingUsers(false);
                 return;
            }
            setLoadingUsers(true);
            const fetchedUsers = {};
            await Promise.all(
                userIDsToFetch.map(async (userID) => {
                    const userData = await fetchUserByID(userID);
                    if (userData) {
                        fetchedUsers[userID] = userData;
                    }
                })
            );
            setCommentUsersData(prevData => ({ ...prevData, ...fetchedUsers }));
            setLoadingUsers(false);
        };
        fetchCommentUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commentsToDisplay, fetchUserByID]);


    if (!post) {
        // ... (phần xử lý khi không có post giữ nguyên)
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                 <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                    <p>Không có thông tin bài viết để hiển thị.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    // --- formatTime, handleToggleClick, handleDeleteClick, handleDeleteCommentClick giữ nguyên ---
    const formatTime = (isoString) => {
        if (!isoString) return '';
        try {
            return new Date(isoString).toLocaleString();
        } catch (e) {
            console.error("Lỗi định dạng thời gian:", e);
            return isoString;
        }
    };
    const handleToggleClick = () => {
        if (onToggleVisibility) {
            onToggleVisibility(post.postID, post.hide);
        }
    };
    const handleDeleteClick = () => {
        if (onDelete) {
            onDelete(post.postID);
            onClose();
        }
    };
    const handleDeleteCommentClick = (commentId) => {
        if (onDeleteComment) {
            if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
                onDeleteComment(post.postID, commentId);
            }
        } else {
            console.warn("Hàm onDeleteComment chưa được cung cấp.");
        }
    };

    const displayUser = postAuthor;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
                {/* ... Close button ... */}
                 <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 z-10 bg-gray-200 rounded-full p-1"
                    aria-label="Đóng"
                >
                    <FaTimes size={20} />
                </button>

                <div className="flex-grow overflow-y-auto">
                    {/* ... Card Header ... */}
                     <div className="p-4 border-b border-gray-200 flex items-center space-x-3 sticky top-0 bg-white z-10">
                        <FaUserCircle className="w-10 h-10 text-gray-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-gray-800">{displayUser?.name || `User ID: ${post.userID}`}</p>
                            <p className="text-xs text-gray-500">{formatTime(post.creationDate || post.createdAt)}</p>
                        </div>
                    </div>

                    {/* --- Card Body --- */}
                     <div className="p-4">
                         {post.content && (
                            <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>
                        )}

                        {/* Hiển thị ảnh nếu có */}
                        {post.mediaUrl && (
                            <div className="mb-4 rounded-lg overflow-hidden">
                                <img src={post.mediaUrl} alt="Nội dung bài viết" className="w-full h-auto object-contain max-h-[50vh]" />
                            </div>
                        )}

                        {/* --- Hiển thị video nếu có mediaList --- */}
                        {post.mediaList && Array.isArray(post.mediaList) && post.mediaList.length > 0 && (
                            <div className="space-y-4">
                                {/* Rename variable to mediaItem for clarity */}
                                {post.mediaList.map((mediaItem, index) => {
                                    // --- Check if mediaItem is an object and has a string mediaURL ---
                                    if (typeof mediaItem !== 'object' || mediaItem === null || typeof mediaItem.mediaURL !== 'string') {
                                        console.warn(`Phần tử trong mediaList không hợp lệ hoặc thiếu mediaURL tại index ${index}:`, mediaItem);
                                        return null; // Bỏ qua phần tử không hợp lệ
                                    }
                                    // --- Kết thúc kiểm tra ---

                                    // Get the URL string
                                    const urlString = mediaItem.mediaURL;
                                    const type = mediaItem.type || 'video/mp4'; // Default to video/mp4 if type is not provided
                                    // Extract the filename from the URL string
                                    const filenameOnly = urlString.split('/').pop();
                                    console.log("filenameOnly", filenameOnly);
                                    // Check if filename extraction was successful
                                    if (!filenameOnly) {
                                        console.warn("Could not extract filename from URL:", urlString);
                                        return null; // Skip rendering if filename is invalid
                                    }

                                    // Use postMediaID or index as key for better stability if available
                                    const key = mediaItem.postMediaID || index;

                                    // Determine the base path for media
                                    const basePath = `http://localhost:8080/posts-management/media`;

                                    // Render based on type
                                    if (type.startsWith('video')) {
                                        return (
                                            <div key={key} className="rounded-lg overflow-hidden border border-gray-200">
                                                <video
                                                    controls
                                                    className="w-full h-auto max-h-[60vh] bg-black"
                                                >
                                                    {/* Use the extracted filenameOnly in the URL */}
                                                    <source src={`${basePath}/${type}/${filenameOnly}`} type= "video/mp4" />
                                                    Trình duyệt của bạn không hỗ trợ thẻ video.
                                                </video>
                                            </div>
                                        );
                                    } else if (type.startsWith('image')) {
                                        return (
                                            <div key={key} className="rounded-lg overflow-hidden border border-gray-200">
                                                <img
                                                    src={`${basePath}/${type}/${filenameOnly}`}
                                                    alt={`Nội dung media ${index + 1}`}
                                                    className="w-full h-auto object-contain max-h-[60vh]"
                                                />
                                            </div>
                                        );
                                    } else {
                                        // Handle other types or provide a fallback if necessary
                                        console.warn(`Loại media không được hỗ trợ: ${type}`);
                                        return (
                                            <div key={key} className="p-4 text-center text-red-500 border border-gray-200 rounded-lg">
                                                Không thể hiển thị media loại: {type}
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        )}
                        {/* --- Kết thúc hiển thị video --- */}

                         {post.originalPostID && (
                            <p className="text-xs text-gray-500 mt-4"> {/* Thêm margin top nếu có video */}
                                (Bài viết chia sẻ từ Post ID: {post.originalPostID})
                            </p>
                        )}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                                post.hide === 1 ? 'bg-green-100 text-green-800' :
                                post.hide === 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                Trạng thái: {post.hide === 1 ? 'Hiển thị' : post.hide === 0 ? 'Đã ẩn' : 'N/A'}
                            </span>
                        </div>
                    </div>
                    {/* --- Kết thúc Card Body --- */}

                    {/* --- Phần hiển thị bình luận --- */}
                    <div className="border-t border-gray-200 p-4">
                        {/* ... (giữ nguyên) ... */}
                         <h4 className="font-semibold text-sm mb-3 flex items-center text-gray-800">
                            <FaCommentAlt className="mr-2 text-gray-600"/> Bình luận ({commentsToDisplay.length})
                        </h4>
                        {loadingUsers && <p className="text-sm text-gray-500">Đang tải thông tin người dùng...</p>}
                        {commentsToDisplay.length > 0 ? (
                            <div className="space-y-3">
                                {commentsToDisplay.map((comment) => {
                                    const commentUser = commentUsersData[comment.userID];
                                    const currentCommentId = comment.commentID || comment.id;
                                    return (
                                        <div key={currentCommentId} className="flex items-start space-x-2 text-sm group">
                                            <FaUserCircle className="w-7 h-7 text-gray-400 flex-shrink-0 mt-1" />
                                            <div className="flex-grow bg-gray-100 rounded-xl px-3 py-2 relative">
                                                <p className="font-semibold text-gray-800">{commentUser?.name || `User ID: ${comment.userID}`}</p>
                                                <p className="text-gray-700 whitespace-pre-wrap">{comment.content || comment.text}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatTime(comment.creationDate)}</p>

                                                {onDeleteComment && currentCommentId && (
                                                    <button
                                                        onClick={() => handleDeleteCommentClick(currentCommentId)}
                                                        title="Xóa bình luận"
                                                        className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full"
                                                        aria-label="Xóa bình luận"
                                                    >
                                                        <FaTrashAlt size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            !loadingUsers && <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>
                        )}
                    </div>
                    {/* --- Kết thúc phần bình luận --- */}
                </div>

                {/* ... Footer ... */}
                 <div className="border-t border-gray-200 p-3 flex justify-end space-x-3 bg-gray-50 sticky bottom-0 z-10">
                     <button
                        title={post.hide === 1 ? "Ẩn bài viết" : "Hiện bài viết"}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            post.hide === 1 ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400' : 'bg-green-500 hover:bg-green-600 focus:ring-green-400'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        onClick={handleToggleClick}
                    >
                        {post.hide === 1 ? <FaTimesCircle className="mr-1.5 -ml-0.5 h-4 w-4" /> : <FaCheckCircle className="mr-1.5 -ml-0.5 h-4 w-4" />}
                        {post.hide === 1 ? "Ẩn" : "Hiện"}
                    </button>
                    <button
                        title="Xóa bài viết"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={handleDeleteClick}
                    >
                        <FaTrashAlt className="mr-1.5 -ml-0.5 h-4 w-4" />
                        Xóa
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardPostDetail;