import React from 'react'; // Thêm import React nếu chưa có
import { motion } from "framer-motion";
import { FaFacebook, FaUser, FaFileAlt, FaSignOutAlt } from "react-icons/fa"; // Thêm FaSignOutAlt
import authService from '../LoginPage/LoginProcess/ValidateLogin'; // Import authService để gọi logout

const AdminSlideMenu = ({ isOpen, setIsOpen, navigate }) => {

    // Hàm xử lý đăng xuất
    const handleLogout = async () => {
        try {
            await authService.logout(); // Gọi hàm logout từ authService
            navigate("/admin/login"); // Điều hướng về trang đăng nhập admin sau khi logout
            // Có thể thêm thông báo đăng xuất thành công nếu muốn
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
            // Xử lý lỗi nếu cần, ví dụ hiển thị thông báo lỗi
        }
    };

    return (
        <motion.div
            animate={{ width: isOpen ? "250px" : "60px" }}
            // Thêm sticky top-0 và đảm bảo z-index đủ cao (ví dụ z-20)
            className="bg-gray-200 h-screen p-4 overflow-hidden relative transition-all duration-300 flex flex-col justify-between
                      sm:w-[200px] md:w-[250px] sticky top-0 z-20" // Thêm sticky top-0 z-20
        >
            <div className='h-screen'> {/* Bao bọc phần trên */}
                {/* Header Sidebar */}
                <div className="flex justify-between items-center mb-4 relative">
                    {isOpen && (
                        <p className="text-lg md:text-2xl font-bold flex items-center gap-2 cursor-pointer" onClick={()=>navigate("/admin")}> {/* Thêm cursor-pointer và onClick */}
                            <FaFacebook className="text-blue-600" /> Admin Page
                        </p>
                    )}

                    {/* Nút đóng/mở menu */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`p-1.5 text-sm bg-blue-500 text-white rounded absolute z-10 transition-all duration-300 focus:outline-none
                                    ${isOpen ? "right-[-15px] top-1/2 -translate-y-1/2" : "right-2 top-2"}`} // Điều chỉnh vị trí nút
                    >
                        {isOpen ? "←" : "→"}
                    </button>
                </div>

                {/* Sidebar Menu */}
                {isOpen && (
                    <ul className="space-y-2 mt-8"> {/* Thêm mt-8 */}
                        <li
                            className="p-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400 flex items-center gap-2 transition-colors"
                            onClick={() => navigate("/admin/user")}
                        >
                            <FaUser /> Quản lý người dùng
                        </li>
                        <li
                            className="p-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400 flex items-center gap-2 transition-colors"
                            onClick={() => navigate("/admin/posts")}
                        >
                            <FaFileAlt /> Quản lý bài viết
                        </li>
                        {/* Thêm các mục menu khác nếu cần */}
                    </ul>
                )}
            </div>

            {/* Nút Đăng xuất (luôn hiển thị hoặc chỉ khi isOpen) */}
            {isOpen && ( // Chỉ hiển thị nút Đăng xuất khi menu mở
                <div className="mt-auto"> {/* Đẩy nút xuống dưới cùng */}
                    <button
                        className="w-full p-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600 flex items-center justify-center gap-2 transition-colors" // Thêm justify-center
                        onClick={handleLogout} // Gọi hàm handleLogout khi click
                    >
                        <FaSignOutAlt /> Đăng xuất
                    </button>
                </div>
            )}
             {/* Hoặc nếu muốn icon đăng xuất hiển thị cả khi đóng */}
             {!isOpen && (
                 <div className="mt-auto flex justify-center">
                     <button
                         className="p-2 text-red-500 hover:text-red-700"
                         onClick={handleLogout}
                         title="Đăng xuất" // Tooltip khi hover
                     >
                         <FaSignOutAlt size={24} />
                     </button>
                 </div>
             )}
        </motion.div>
    );
};

export default AdminSlideMenu;