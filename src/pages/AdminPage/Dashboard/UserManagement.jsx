import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const avatarBasePath = "http://localhost:8080/posts-management/media"; // Đường dẫn cơ sở cho avatar

  // Lấy danh sách người dùng
  const fetchUsers = () => {
    axios
      .get("http://localhost:8080/users")
      .then((response) => {
        // Xử lý URL avatar trước khi set state
        const processedUsers = response.data.map(user => {
          let finalAvatarUrl = null;
          if (user.avatarURL && typeof user.avatarURL === 'string') {
            if (user.avatarURL.startsWith('http')) {
              finalAvatarUrl = user.avatarURL; // Đã là URL đầy đủ
            } else if (user.avatarURL !== 'default.jpg') {
              finalAvatarUrl = `${avatarBasePath}${user.avatarURL}`; // Nối với base path
            }
          }
          console.log(`User ID: ${user.userID}, Avatar URL: ${finalAvatarUrl}`); // Kiểm tra URL avatar
          // Đảm bảo trường 'hide' tồn tại và là boolean
          const hideStatus = typeof user.hide === 'boolean' ? user.hide : true; // Mặc định là hiển thị (true) nếu không có hoặc sai kiểu
          return { ...user, avatarURL: finalAvatarUrl, hide: hideStatus }; // Lưu URL và trạng thái hide
        });
        setUsers(processedUsers);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      });
  };

  console.log(users); // Kiểm tra dữ liệu người dùng
  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Xử lý xem profile
  const handleView = (userID) => {
    navigate(`/profile/${userID}`);
  };

  // Xử lý ẩn/hiện người dùng
  const handleHide = (userID, currentHideStatus) => {
    console.log({userID, currentHideStatus}); // Kiểm tra trạng thái hiện tại
    const newHideStatus = currentHideStatus === true ? false :  true;
    // Sửa logic actionText để khớp với boolean (true = hiển thị, false = ẩn)
    const actionText = newHideStatus === false ? "ẩn" : "hiện";

    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} người dùng ID: ${userID}?`)) {
      axios
        // Gửi trạng thái MỚI lên API (true/false)
        .put(`http://localhost:8080/users/${userID}/hide/${newHideStatus}`)
        .then(() => {
          console.log(`Người dùng ${userID} đã được ${actionText}.`);
          fetchUsers(); // Tải lại danh sách
        })
        .catch((error) => {
          console.error(`Lỗi khi ${actionText} người dùng ${userID}:`, error);
          alert(`Có lỗi xảy ra khi ${actionText} người dùng.`); // Thông báo lỗi cho người dùng
        });
    }
  };

  // Xử lý cập nhật role
  const handleUpdateRole = (userID, currentRole) => {
    const newRole = currentRole === "user" ? "admin" : "user";
     if (window.confirm(`Bạn có chắc chắn muốn đổi vai trò của người dùng ID: ${userID} thành ${newRole}?`)) {
        axios
        .put(`http://localhost:8080/users/${userID}/role`, { role: newRole })
        .then(() => {
            console.log(`Đã cập nhật vai trò cho người dùng ${userID} thành ${newRole}.`);
            fetchUsers(); // Tải lại danh sách
        })
        .catch((error) => {
            console.error(`Lỗi khi cập nhật role cho người dùng ${userID}:`, error);
            alert("Có lỗi xảy ra khi cập nhật vai trò."); // Thông báo lỗi
        });
     }
  };

  // Component nhỏ để hiển thị Avatar hoặc Icon fallback
  const AvatarDisplay = ({ src, alt, className }) => {
      const [imgError, setImgError] = useState(false);

      useEffect(() => {
          setImgError(false); // Reset lỗi khi src thay đổi
      }, [src]);

      if (src && !imgError) {
          return (
              <img
                  src={src}
                  alt={alt}
                  className={className}
                  onError={() => setImgError(true)} // Set lỗi nếu ảnh không tải được
              />
          );
      }
      // Fallback nếu không có src hoặc ảnh lỗi
      return <FaUserCircle className={`text-gray-400 ${className}`} />;
  };

  return (
    // Giữ nguyên container chính
    <div className="p-4 md:p-8 min-h-screen rounded-lg bg-gray-50">
      <h1 className="text-2xl font-semibold mb-4 text-black text-center">Quản lý người dùng</h1>

      {/* Container cho bảng với shadow và bo góc */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 shadow-md">
            <thead className="bg-gray-100">
              {/* Header của bảng */}
              <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th scope="col" className="px-4 py-3 text-center">#</th>
                <th scope="col" className="px-4 py-3 text-left">Người dùng</th> {/* Gộp Avatar và Tên */}
                <th scope="col" className="px-4 py-3 text-left">Username</th>
                <th scope="col" className="px-4 py-3 text-left">Email</th>
                <th scope="col" className="px-4 py-3 text-center">Role</th>
                <th scope="col" className="px-4 py-3 text-center">Trạng thái</th>
                <th scope="col" className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
              {/* Nội dung bảng */}
              {users.map((user, index) => {
                // console.log(`Rendering User ID: ${user.userID}, Hide Status: ${user.hide}, Type: ${typeof user.hide}`);
                return (
                <tr key={user.userID} className={`hover:bg-gray-50 ${user.hide === false ? 'opacity-60 bg-red-50' : ''}`}> {/* Làm mờ nhẹ nếu bị ẩn */}
                  {/* STT */}
                  <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>

                  {/* Người dùng (Avatar + Tên) */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <AvatarDisplay
                          src={user.avatarURL}
                          alt="avatar"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{user.fullName || 'N/A'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Username */}
                  <td className="px-4 py-3 whitespace-nowrap">{user.username}</td>

                  {/* Email */}
                  <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>

                  {/* Role */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                     <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                         user.hide === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                     }`}>
                         {user.hide === true ? 'Hiển thị' : 'Đã ẩn'}
                     </span>
                  </td>

                  {/* Hành động */}
                  <td className="px-4 py-3 whitespace-nowrap text-center space-x-2">
                    {/* Nút Xem */}
                    <button
                      title="Xem chi tiết"
                      className="text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out"
                      onClick={() => handleView(user.userID)}
                    >
                      Xem
                    </button>
                    {/* Nút Ẩn/Hiện */}
                    <button
                      title={user.hide === true ? "Ẩn người dùng" : "Hiện người dùng"}
                      className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded ${
                          user.hide === true
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' // Màu đỏ nhạt khi hành động là "Ẩn"
                          : 'bg-green-100 text-green-700 hover:bg-green-200' // Màu xanh nhạt khi hành động là "Hiện"
                      }`}
                      onClick={() => handleHide(user.userID, user.hide)}
                    >
                      {user.hide === true ? <FaEyeSlash className="mr-1 h-3 w-3"/> : <FaEye className="mr-1 h-3 w-3"/>}
                      {user.hide === true ? "Ẩn" : "Hiện"}
                    </button>
                    {/* Nút Sửa Role */}
                    <button
                      title="Thay đổi vai trò"
                      className="text-yellow-600 hover:text-yellow-900 transition duration-150 ease-in-out"
                      onClick={() => handleUpdateRole(user.userID, user.role)}
                    >
                      Sửa Role
                    </button>
                  </td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;