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
  login: async (userIdentifier, password, remember, role = "user") => {
    try {
      const deviceInfo = navigator.userAgent;
      // nếu muốn thêm platform, screen size:
      // const deviceInfo = `${navigator.userAgent} | ${navigator.platform} | ${window.screen.width}x${window.screen.height}`;

      // 2. Gửi request kèm deviceInfo
      const response = await api.post("/auth/login", {
        userIdentifier,
        password,
        role,
        deviceInfo
      });

      // 3. Xử lý lưu sessionID & user
      const { sessionId, user } = response.data;
      localStorage.setItem("rememberMe", remember);

      await authService.getAllPostsFormDB();
      await authService.getAllUsersFormDB();
      if (remember) {
        localStorage.setItem("sessionID", sessionId);
        localStorage.setItem("currentUser", JSON.stringify({ user }));
        sessionStorage.removeItem("sessionID");
        sessionStorage.removeItem("currentUser");
      } else {
        sessionStorage.setItem("sessionID", sessionId);
        sessionStorage.setItem("currentUser", JSON.stringify({ user }));
        localStorage.removeItem("sessionID");
        localStorage.removeItem("currentUser");
      }

      // Luôn sử dụng localStorage (người dùng không bị đăng xuất khi đóng tab)
      localStorage.setItem("sessionID", sessionId);
      localStorage.setItem("currentUser", JSON.stringify({ user }));
      sessionStorage.removeItem("sessionID");
      sessionStorage.removeItem("currentUser");

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Login error:", error);

      // Xử lý lỗi để trả về toàn bộ ErrorResponse
      return {
        success: false,
        error: error.response?.data || {
          message: error.message || "Đăng nhập thất bại",
          status: error.response?.status || 500
        }
      };
    }
  },

  getCurrentUser: () => {
    const str = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
    return str ? JSON.parse(str) : null;
  },

  getSessionId: () => {
    return localStorage.getItem("sessionID") || sessionStorage.getItem("sessionID");
  },

  isLoggedIn: () => !!authService.getSessionId(),

  isAdmin: () => {
    const u = authService.getCurrentUser();
    return u?.userRole === "admin";
  },

  logout: async () => {
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

    localStorage.removeItem("sessionID");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("sessionID");
    sessionStorage.removeItem("currentUser");
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

  createShareAction: async (values) => {
    try {
      console.log("Create share action called", values);
      const response = await api.post('/postshare/create', values);
      return {
        success: true,
        data: response.data
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

  getAllPosts: () => {
    const posts = localStorage.getItem("posts");
    return posts ? JSON.parse(posts) : null;
  },

  getAllUsers: () => {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : null;
  },

  getRememberMe: () => localStorage.getItem("rememberMe") === "true"
};

export default authService;