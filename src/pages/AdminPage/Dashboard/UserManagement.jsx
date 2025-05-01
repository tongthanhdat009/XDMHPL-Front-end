import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Lấy danh sách người dùng
  const fetchUsers = () => {
    axios
      .get("http://localhost:8080/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý xem profile
  const handleView = (userID) => {
    navigate(`/profile/${userID}`);
  };

  // Xử lý ẩn người dùng
  const handleHide = (userID) => {
    axios
      .put(`http://localhost:8080/users/${userID}/hide`)
      .then(() => {
        fetchUsers();
      })
      .catch((error) => {
        console.error("Lỗi khi ẩn người dùng:", error);
      });
  };

  const handleUpdateRole = (userID, currentRole) => {
    const newRole = currentRole === "user" ? "admin" : "user";
    axios
      .put(`http://localhost:8080/users/${userID}/role`, { role: newRole })
      .then(() => {
        fetchUsers();
      })
      .catch((error) => {
        console.error("Lỗi khi cập nhật role:", error);
      });
  };
  
  return (
    <div className="p-8 min-h-screen bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Quản lý người dùng</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg shadow text-sm text-gray-800">
          <thead>
            <tr className="bg-gray-100 text-center font-semibold text-gray-700">
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Avatar</th>
              <th className="px-6 py-3">Họ tên</th>
              <th className="px-6 py-3">Username</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.userID} className="border-t hover:bg-gray-50 text-center">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 flex justify-center">
                  <img
                    src={user.avatar || "https://i.pravatar.cc/150?img=1"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td className="px-6 py-4">{user.fullName}</td>
                <td className="px-6 py-4">{user.userName}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "admin" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => handleView(user.userID)}
                  >
                    Xem
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleHide(user.userID)}
                  >
                    Xóa
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    onClick={() => handleUpdateRole(user.userID, user.role)}
                  >
                    Sửa Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
