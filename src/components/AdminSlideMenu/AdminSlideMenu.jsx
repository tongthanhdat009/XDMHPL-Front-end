import { motion } from "framer-motion";
import { FaFacebook, FaUser, FaFileAlt } from "react-icons/fa";

const AdminSlideMenu = ({ isOpen, setIsOpen, navigate }) => {
    return (
        <motion.div
            animate={{ width: isOpen ? "250px" : "60px" }} 
            className="bg-gray-200 h-screen p-4 overflow-hidden relative transition-all duration-300
                      sm:w-[200px] md:w-[250px]" 
        >
            {/* Header Sidebar */}
            <div className="flex justify-between items-center mb-4 relative">
                {isOpen && (
                    <p className="text-lg md:text-2xl font-bold flex items-center gap-2">
                        <FaFacebook className="text-blue-600"
                                    onClick={()=>navigate("/")} /> Admin Page
                    </p>
                )}

                {/* Nút đóng/mở menu */}
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className={`p-2 bg-blue-500 text-white rounded absolute z-10 transition-all duration-300 
                                ${isOpen ? "right-[-10px]" : "top-2"}`} 
                >
                    {isOpen ? "←" : "→"}
                </button>
            </div>

            {/* Sidebar Menu */}
            {isOpen && (
                <ul className="space-y-2">
                    <li 
                        className="p-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400 flex items-center gap-2"
                        onClick={() => navigate("/admin/user")}
                    >
                        <FaUser /> Quản lý người dùng
                    </li>
                    <li 
                        className="p-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400 flex items-center gap-2"
                        onClick={() => navigate("/admin/posts")}
                    >
                        <FaFileAlt /> Quản lý bài viết
                    </li>
                </ul>
            )}
        </motion.div>
    );
};

export default AdminSlideMenu;
