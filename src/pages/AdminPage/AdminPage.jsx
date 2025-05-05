import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect} from "react";
import AdminSlideMenu from "../../components/AdminSlideMenu/AdminSlideMenu";
import UserManagement from "./Dashboard/UserManagement";
import PostManagement from "./Dashboard/PostManagement";
import authService from "../../components/LoginPage/LoginProcess/ValidateLogin";
import ChatBot from "./Dashboard/ChatBot";

const AdminPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate(); // Hook điều hướng

    useEffect(() => {
        const admin = authService.getAdminCurrentUser(); 
        console.log("Kiểm tra admin trong useEffect:", admin); 
        if (admin == null) {
            console.log("Admin null, điều hướng về /admin/login");
            navigate("/admin/login", { replace: true });
        }
    }, [navigate]); // Dependency là navigate (thường không thay đổi, nhưng nên có)
    const admin = authService.getAdminCurrentUser();

    if (admin == null) {
        // return null; // Hoặc <LoadingSpinner />;
        // Hoặc để useEffect xử lý điều hướng
    }


    console.log("Thông tin admin (render):", admin); // Kiểm tra thông tin admin trong console
    return (
        <div className="flex size-auto" style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <AdminSlideMenu isOpen={isOpen} setIsOpen={setIsOpen} navigate={navigate} />

            {/* Main Content */}
            <div className="flex-1 bg-gray-500 p-4 text-white">
                <Routes>
                    <Route path="/" element={<h2 className="text-2xl">Admin Dashboard</h2>} />
                    <Route path="user" element={<UserManagement />} />
                    <Route path="posts" element={<PostManagement />} />
                    <Route path="chat-bot" element={<ChatBot/>} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminPage;
