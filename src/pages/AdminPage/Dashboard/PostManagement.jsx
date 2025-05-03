import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaTrashAlt, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import CardPostDetail from "../../../components/CardPostDetail/CardPostDetail";

const PostManagement = () => {
  // ... states (originalPosts, posts, loading, error, navigate, selectedPost, isDetailModalOpen, filters) ...
  const [originalPosts, setOriginalPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ... fetchAllPosts, useEffect, applyFilters, handleFilterSubmit, handleResetFilters ...
  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get("http://localhost:8080/posts-management/get-all");
      const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt || b.creationDate) - new Date(a.createdAt || a.creationDate));
      setOriginalPosts(sortedPosts);
      setPosts(sortedPosts);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài viết:", error);
      setError(error.response?.data?.message || error.message || "Không thể tải danh sách bài viết.");
      setOriginalPosts([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  const applyFilters = useCallback(() => {
    let filtered = [...originalPosts];
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        (post.content && post.content.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (post.user?.fullName && post.user.fullName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (post.user?.userName && post.user.userName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (post.userID && String(post.userID).includes(lowerCaseSearchTerm))
      );
    }
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(post => {
        const postDate = new Date(post.creationDate || post.createdAt);
        return postDate >= start;
      });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(post => {
        const postDate = new Date(post.creationDate || post.createdAt);
        return postDate <= end;
      });
    }
    if (statusFilter !== '') {
      const statusValue = parseInt(statusFilter, 10);
      filtered = filtered.filter(post => post.hide === statusValue);
    }
    setPosts(filtered);
  }, [originalPosts, searchTerm, startDate, endDate, statusFilter]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    applyFilters();
    console.log("Bộ lọc đã được áp dụng trên frontend");
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setPosts([...originalPosts]);
  };

  // ... handleViewPost, handleCloseDetailModal ...
  const handleViewPost = (postId) => {
    const postToView = originalPosts.find(post => post.postID === postId);
    if (postToView) {
      setSelectedPost(postToView);
      setIsDetailModalOpen(true);
    } else {
      alert("Không tìm thấy thông tin bài viết.");
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPost(null);
  };

  // --- Helper function to update posts in both states ---
  const updatePostInStates = (postId, updateFn) => {
    const updateList = (list) => list
      .map(p => (p.postID === postId ? updateFn(p) : p))
      .filter(p => p !== null);

    setOriginalPosts(prev => updateList(prev));
    setPosts(prev => updateList(prev));

    if (selectedPost && selectedPost.postID === postId) {
        const updatedSelected = updateFn(selectedPost);
        if (updatedSelected === null) {
            handleCloseDetailModal();
        } else {
            setSelectedPost(updatedSelected);
        }
    }
  };

  // ... handleDeletePost, handleTogglePostVisibility ...
   const handleDeletePost = async (postId) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết ID: ${postId}?`)) {
      try {
        await axios.delete(`http://localhost:8080/posts-management/delete/${postId}`);
        updatePostInStates(postId, () => null);
        alert('Xóa bài viết thành công!');
      } catch (err) {
        console.error("Lỗi xóa bài viết:", err);
        alert(err.response?.data?.message || 'Đã xảy ra lỗi hệ thống khi xóa bài viết.');
      }
    }
  };

  const handleTogglePostVisibility = async (postId, currentHideStatus) => {
    const newHideStatus = currentHideStatus === 1 ? 0 : 1;
    const actionText = newHideStatus === 1 ? "hiển thị" : "ẩn";
       try {
           await axios.get(`http://localhost:8080/posts-management/visibility/${postId}/${newHideStatus}`);
           updatePostInStates(postId, (post) => ({ ...post, hide: newHideStatus }));
           alert(`Đã ${actionText} bài viết thành công!`);
       } catch (err) {
           console.error(`Lỗi khi ${actionText} bài viết:`, err);
           alert(err.response?.data || err.message || `Đã xảy ra lỗi khi ${actionText} bài viết.`);
       }
 };

  // --- Hàm xử lý xóa bình luận ---
  const handleDeleteComment = async (postId, commentId) => {
    try {
      await axios.delete(`http://localhost:8080/posts-management/delete-comment/${commentId}`); 

      // Cập nhật state sau khi xóa thành công
      const updateCommentList = (post) => {
        if (!post || !post.comments) return post; // Trả về post nếu không có comment
        return {
          ...post,
          comments: post.comments.filter(comment => (comment.commentID || comment.id) !== commentId)
        };
      };

      // Sử dụng helper để cập nhật post trong cả hai state
      updatePostInStates(postId, updateCommentList);

      alert('Xóa bình luận thành công!');
    } catch (err) {
      console.error("Lỗi xóa bình luận:", err);
      alert(err.response?.data?.message || 'Đã xảy ra lỗi khi xóa bình luận.');
    }
  };

  return (
    <div className="p-6 bg-white h-auto rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-4 text-black text-center">Quản lý bài viết</h1>
      {/* ... Bộ lọc ... */}
       <form onSubmit={handleFilterSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nội dung, người đăng, ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pl-10 text-gray-900"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
            >
              <option value="">Tất cả</option>
              <option value="1">Hiển thị</option>
              <option value="0">Đã ẩn</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-3">
           <button
             type="button"
             onClick={handleResetFilters}
             className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
           >
             <FaTimes className="mr-2 -ml-1 h-4 w-4" />
             Reset
           </button>
           <button
             type="submit"
             className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
           >
             <FaFilter className="mr-2 -ml-1 h-4 w-4" />
             Lọc
           </button>
         </div>
      </form>
      {/* ... Bảng hiển thị ... */}
       <table className="min-w-full bg-white border border-gray-200 text-sm">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 border-b text-left font-semibold text-gray-600">ID</th>
                    <th className="px-4 py-2 border-b text-left font-semibold text-gray-600">Nội dung</th>
                    <th className="px-4 py-2 border-b text-left font-semibold text-gray-600">Người đăng</th>
                    <th className="px-4 py-2 border-b text-left font-semibold text-gray-600">Ngày tạo</th>
                    <th className="px-4 py-2 border-b text-left font-semibold text-gray-600">Trạng thái</th>
                    <th className="px-4 py-2 border-b text-center font-semibold text-gray-600">Hành động</th>
                </tr>
            </thead>
           <tbody>
               {posts.length > 0 ? (
                   posts.map((post) => (
                       <tr key={post.postID} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border-b text-gray-700">{post.postID}</td>
                            <td className="px-4 py-2 border-b text-gray-700 max-w-xs truncate" title={post.content}>
                                {post.content || '(Không có nội dung)'}
                                {post.originalPostID && <span className="text-xs text-gray-500 block">(Chia sẻ từ ID: {post.originalPostID})</span>}
                            </td>
                            <td className="px-4 py-2 border-b text-gray-700">
                                {post.user?.fullName || post.user?.userName || `User ID: ${post.userID}`}
                            </td>
                            <td className="px-4 py-2 border-b text-gray-700">
                                {new Date(post.creationDate || post.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 border-b">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    post.hide === 1 ? 'bg-green-100 text-green-800' :
                                    post.hide === 0 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {post.hide === 1 ? 'Hiển thị' : post.hide === 0 ? 'Đã ẩn' : 'N/A'}
                                </span>
                            </td>
                           <td className="px-4 py-2 border-b text-center space-x-2">
                               <button
                                   title="Xem chi tiết"
                                   className="text-blue-500 hover:text-blue-700 transition-colors"
                                   onClick={() => handleViewPost(post.postID)}
                               >
                                   <FaEye />
                               </button>
                               <button
                                   title={post.hide === 1 ? "Ẩn bài viết" : "Hiện bài viết"}
                                   className={`${post.hide === 1 ? 'text-yellow-500 hover:text-yellow-700' : 'text-green-500 hover:text-green-700'} transition-colors`}
                                   onClick={() => handleTogglePostVisibility(post.postID, post.hide)}
                               >
                                   {post.hide === 1 ? <FaTimesCircle /> : <FaCheckCircle />}
                               </button>
                               <button
                                   title="Xóa bài viết"
                                   className="text-red-500 hover:text-red-700 transition-colors"
                                   onClick={() => handleDeletePost(post.postID)}
                               >
                                   <FaTrashAlt />
                               </button>
                           </td>
                       </tr>
                   ))
               ) : (
                   <tr>
                       <td colSpan="6" className="px-4 py-4 border-b text-center text-gray-500">
                           {originalPosts.length === 0 && !loading ? 'Không có bài viết nào.' : 'Không tìm thấy bài viết nào khớp với bộ lọc.'}
                       </td>
                   </tr>
               )}
           </tbody>
       </table>

      {/* --- Render Modal --- */}
      {isDetailModalOpen && selectedPost && (
          <CardPostDetail
              post={selectedPost}
              onClose={handleCloseDetailModal}
              onDelete={handleDeletePost}
              onToggleVisibility={handleTogglePostVisibility}
              onDeleteComment={handleDeleteComment} // Truyền hàm xóa comment
          />
      )}
    </div>
  );
};

export default PostManagement;