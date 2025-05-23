import axios from "axios";
const API_URL = "http://localhost:8080";

// Tạo instance cho axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL
});

// Thêm interceptor để tự động đính kèm SessionID vào mỗi request
api.interceptors.request.use(
  (config) => {
    const sessionId = authService.getSessionId();
    if (sessionId) {
      config.headers['SessionID'] = sessionId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const authService = {
  login: async (userIdentifier, password, role) => {
    try {
      const deviceInfo = navigator.userAgent; // Lấy thông tin thiết bị
      // 1. Kiểm tra session hiện tại
      if (role === "admin") {
        let sessionIdAdmin = authService.getSessionId("admin"); // Lấy sessionID từ localStorage hoặc sessionStorage
        if (sessionIdAdmin) {
          const currentAdmin = authService.getAdminCurrentUser();
          if (currentAdmin) {
            // Gọi API để kiểm tra xem session có hợp lệ không
            const checkSessionResponse = await api.get(`/auth/check-session/${currentAdmin.userID}`);
            if (checkSessionResponse.status === 200) {
              console.log("Session hiện tại hợp lệ:", checkSessionResponse.data);
              return { success: true, data: { sessionId: sessionIdAdmin, user: currentAdmin } };
            } else {
              console.log("Session không còn hợp lệ. Tiến hành đăng nhập lại.");
            }
          }
        }
      }
      else{
        let sessionId = authService.getSessionId("user");
        if (sessionId) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            // Gọi API để kiểm tra xem session có hợp lệ không
            const checkSessionResponse = await api.get(`/auth/check-session/${currentUser.userID}`);
            if (checkSessionResponse.status === 200) {
              console.log("Session hiện tại hợp lệ:", checkSessionResponse.data);
              return { success: true, data: { sessionId, user: currentUser } };
            } else {
              console.log("Session không còn hợp lệ. Tiến hành đăng nhập lại.");
            }
          }
        }
      }
  
      // 2. Tiến hành đăng nhập
      const loginResponse = await api.post("/auth/login", {
        userIdentifier,
        password,
        role,
        deviceInfo,
      });
      // Xử lý dữ liệu trả về
      const { sessionId: newSessionId, user } = loginResponse.data;
      
      await authService.getAllPostsFormDB();
      await authService.getAllUsersFormDB();
      
      // Luôn lưu session vào localStorage để hỗ trợ đăng nhập tự động
      if(role === "admin") {
        localStorage.setItem("adminSessionID", newSessionId); 
        localStorage.setItem("adminCurrentUser", JSON.stringify(user));
        sessionStorage.removeItem("adminSessionID");
        sessionStorage.removeItem("adminCurrentUser");
      }
      else{
        localStorage.setItem("sessionID", newSessionId);
        localStorage.setItem("currentUser", JSON.stringify(user));
        sessionStorage.removeItem("sessionID");
        sessionStorage.removeItem("currentUser");
      }
      
  
      return { success: true, data: loginResponse.data };
    } catch (error) {
      console.error("Login error:", error);
  
      // Xử lý lỗi để trả về toàn bộ ErrorResponse
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Đăng nhập thất bại",
          status: error.response?.status || 500,
        },
      };
    }
  },

  getCurrentUserFormDB: async (userID) => {
    try {
      const response = await api.get(`/auth/current-user/${userID}`);
      console.log("Current user data:", response.data);
      localStorage.setItem("currentUser", JSON.stringify( response.data ));
      return { success: true};
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.response?.data };
    }
  },

  getCurrentUser: () => {
    const str = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
    return str ? JSON.parse(str) : null;
  },

  getAdminCurrentUser: () => {
    const str = localStorage.getItem("adminCurrentUser") || sessionStorage.getItem("adminCurrentUser");
    return str ? JSON.parse(str) : null;
  },

  getSessionId: (role = "user") => {
    if (role === "admin") {
      return localStorage.getItem("adminSessionID") || sessionStorage.getItem("adminSessionID");
    }
    return localStorage.getItem("sessionID") || sessionStorage.getItem("sessionID");
  },

  isLoggedIn: () => !!authService.getSessionId(),

  isAdmin: () => {
    const u = authService.getCurrentUser();
    return u?.userRole === "admin";
  },

  logout: async (role="user") => {
    console.log("Logout called");
    const sid = authService.getSessionId();

    if (sid) {
      try {
        // Gửi request kèm header SessionID
        await api.post(
          "/auth/logout",
          null,
          {
            headers: {
              "SessionID": sid
            }
          }
        );
        console.log("Logout successful on server");
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    if (role === "admin") {
      localStorage.removeItem("adminSessionID");
      localStorage.removeItem("adminCurrentUser");
      sessionStorage.removeItem("adminSessionID");
      sessionStorage.removeItem("adminCurrentUser");
    }
    else{
      localStorage.removeItem("sessionID");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("posts");
      localStorage.removeItem("users");
  
      sessionStorage.removeItem("sessionID");
      sessionStorage.removeItem("currentUser");
    }
  },


  // Create a new post
  createPost: async (content, type, mediaFiles = [], userId) => {
    try {
      const media = mediaFiles.map(file => ({
        type: file.type, // Lấy trực tiếp từ object mediaFiles đã được phân loại
        fileMedia: file.file // URL xem trước
      }));

      const postData = {
        userId,
        content,
        type,
        media
      };

      console.log('Post data:', postData);
      const formData = new FormData();
      formData.append('userId', postData.userId);
      formData.append('content', postData.content);
      formData.append('type', postData.type);

      postData.media.forEach((item) => {
        formData.append('mediaTypes', item.type);
        formData.append('mediaFiles', item.fileMedia);
      });

      console.log('FormData content:');
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });

      const response = await api.post('/posts/create', formData);
      return {
        success: true
      };

    } catch (error) {
      console.error("Error creating post:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể tạo bài viết",
          status: error.response?.status || 500
        }
      };
    }
  },

  updatePost: async (content, type, mediaFiles = [], userId, postID) => {
    try {
      console.log("Update post called", content, type, mediaFiles, userId, postID);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('postId', postID);
    formData.append('content', content);
    formData.append('type', type);

    // Xử lý media files nếu type không phải là "share"
    if (type !== "share") {
      const existingMedia = mediaFiles.filter(item => item.file === null);
      const newMedia = mediaFiles.filter(item => item.file !== null);

      // Thêm ID của các media cần giữ lại
      if (existingMedia.length > 0) {
        existingMedia.forEach(item => {
          formData.append('keepMediaIds', item.id);
        });
      }

      // Thêm các file mới
      if (newMedia.length > 0) {
        newMedia.forEach(item => {
          formData.append('mediaTypes', item.type);
          formData.append('mediaFiles', item.file);
        });
      }
    }

    console.log('FormData content:');
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });

    const response = await api.put('/posts/update', formData);
      return {
        success: true,
        // data: response.data
      };
  
    } catch (error) {
      console.error("Error updating post:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể cập nhật bài viết",
          status: error.response?.status || 500
        }
      };
    }
  },

  deletePost: async (postId) => {
    try {
      console.log("Delete post called", postId);
      const response = await api.delete(`/posts/delete/${postId}`);
      return {
        success: true
      };
    } catch (error) {
      console.error("Error deleting post:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể xóa bài viết",
          status: error.response?.status || 500
        }
      };
        }
  },

  createShareAction: async (values) => {
    try {
      console.log("Create share action called", values);
      const response = await api.post('/postshare/create', values);
      return {
        success: true
      };
    } catch (error) {
      console.error("Error creating share action:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể tạo bài viết",
          status: error.response?.status || 500
        }
      };
    }
  },

  getAllPostsFormDB: async () => {
    try {
      const response = await api.get(`/posts`);
      localStorage.setItem("posts", JSON.stringify(response.data));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching posts:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể lấy danh sách bài viết",
          status: error.response?.status || 500
        }
      };
    }
  },

  likePost: async (reqData) => {
    try {
      const response = await api.put(`/posts/like/${reqData.Like.postId}/${reqData.Like.userId}`);
      console.log(response.data);
      if((response.data.senderID === response.data.userID) || response.data===null || response.data.isOnline===false){
        return {
          success: true
        };
      }else {
          reqData.sendNotifyLikeToServer(response.data);
          return {
            success: true
          };
      }
    } catch (error) {
      console.error("Error liking post:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể lIKE bài viết",
          status: error.response?.status || 500
        }
      };
    }
  },

  commentPost: async (reqData) => {
    try {
      const response = await api.post(`/comments/post/${reqData.comment.postId}/${reqData.comment.userId}`, reqData.comment.data);
      console.log(response.data);
      if(response.data.senderID === response.data.userID || response.data.isOnline===false){
        return {
          success: true
        };
      } else {
          reqData.sendNotifyCommentToServer(response.data);
          return {
            success: true
          };
      }
    } catch (error) {
      console.error("Error comment post:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể lIKE bài viết",
          status: error.response?.status || 500
        }
      };
    }
  },

  updateComment: async (reqData) => {
    try {
      const response = await api.put(`/comments/update/${reqData.commentId}`, reqData.data);
      return {
        success: true
      };
    } catch (error) {
      console.error("Error updating comment:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể lIKE bài viết",
          status: error.response?.status || 500
        }
      };
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/delete/${commentId}`);
      return {
        success: true
      };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể lIKE bài viết",
          status: error.response?.status || 500
        }
      };
    }
  },

  getAllUsersFormDB: async () => {
    try {
      const response = await api.get(`/users`);
      localStorage.setItem("users", JSON.stringify(response.data));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể lấy danh sách bài viết",
          status: error.response?.status || 500
        }
      };
    }
  },

  sentFriendRequest: async (reqData) => {
    try {
      const response = await api.post(`/friendrequests/${reqData.data.senderId}/${reqData.data.receiverId}`);
      reqData.sendNotifyFriendRequestToServer(response.data);
          return {
            success: true
      };
    } catch (error) {
      console.error("Error sending friend request:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể kb",
          status: error.response?.status || 500
        }
      };
    }
  },

  deleteFriendRequest: async (reqData) => {
    try {
      const response = await api.delete(`/friendrequests/${reqData.senderId}/${reqData.receiverId}`);
      return {
        success: true
      };
    } catch (error) {
      console.error("Error sending friend request:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể kb",
          status: error.response?.status || 500
        }
      };
    }
  },

  acceptFriendRequest: async (reqData) => {
    try {
      const response = await api.put(`/friendrequests/${reqData.senderId}/${reqData.receiverId}`);
      return {
        success: true
      };
    } catch (error) {
      console.error("Error sending friend request:", error);
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Không thể kb",
          status: error.response?.status || 500
        }
      };
    }
  },

  getAllPosts: () => {
    const posts = localStorage.getItem("posts");
    return posts ? JSON.parse(posts) : null;
  },

  getAllUsers: () => {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : null;
  },

  getUserByIdFromDB: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return { 
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.response?.data };
    }
  },

  getRememberMe: () => localStorage.getItem("rememberMe") === "true"
};

export default authService;