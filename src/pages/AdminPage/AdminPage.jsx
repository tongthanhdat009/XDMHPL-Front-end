import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect} from "react";
import AdminSlideMenu from "../../components/AdminSlideMenu/AdminSlideMenu";
import UserManagement from "./Dashboard/UserManagement";
import PostManagement from "./Dashboard/PostManagement";
import authService from "../../components/LoginPage/LoginProcess/ValidateLogin";

const AdminPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate(); // Hook điều hướng

    // --- SỬA Ở ĐÂY: Chuyển logic kiểm tra vào useEffect ---
    useEffect(() => {
        const admin = authService.getAdminCurrentUser(); // Lấy thông tin admin
        console.log("Kiểm tra admin trong useEffect:", admin); // Kiểm tra lại giá trị
        if (admin == null) {
            console.log("Admin null, điều hướng về /admin/login");
            navigate("/admin/login", { replace: true }); // Thêm replace: true để không lưu trang này vào history
        }
    }, [navigate]); // Dependency là navigate (thường không thay đổi, nhưng nên có)
    // Bạn cũng có thể thêm dependency là một state nào đó nếu việc kiểm tra admin phụ thuộc vào state

    // Lấy lại admin để sử dụng trong phần còn lại của component (nếu cần)
    // Hoặc có thể dùng state nếu admin có thể thay đổi động
    const admin = authService.getAdminCurrentUser();

    // Nếu admin là null, có thể return null hoặc một loading indicator để tránh render phần còn lại
    if (admin == null) {
        // return null; // Hoặc <LoadingSpinner />;
        // Hoặc để useEffect xử lý điều hướng
    }


    console.log("Thông tin admin (render):", admin); // Kiểm tra thông tin admin trong console
    return (
        <div className="flex">
            {/* Sidebar */}
            <AdminSlideMenu isOpen={isOpen} setIsOpen={setIsOpen} navigate={navigate} />

            {/* Main Content */}
            <div className="flex-1 bg-gray-500 h-screen p-4 text-white">
                <Routes>
                    <Route path="/" element={<h2 className="text-2xl">Admin Dashboard</h2>} />
                    <Route path="user" element={<UserManagement />} />
                    <Route path="posts" element={<PostManagement />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminPage;
