import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import AdminSlideMenu from "../../components/AdminSlideMenu/AdminSlideMenu";
import UserManagement from "./Dashboard/UserManagement";
import PostManagement from "./Dashboard/PostManagement";

const AdminPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate(); // Hook điều hướng

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
