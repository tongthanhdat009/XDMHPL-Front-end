import AllInboxIcon from '@mui/icons-material/AllInbox';
import PeopleIcon from '@mui/icons-material/People';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useLocation, useNavigate } from 'react-router-dom';
const filters = [
    { title: "Tất cả", icon: <AllInboxIcon />, value: "top" },
    { title: "Bài viết", icon: <ChatBubbleIcon />, value: "posts" },
    { title: "Mọi người", icon: <PeopleIcon />, value: "people" },
];
export function SideBarRow({ activeFilter, setActiveFilter }) {
    const { search } = useLocation(); // Lấy query hiện tại từ URL
    const navigate = useNavigate();
    const handleNavigate = (filter) => {
        setActiveFilter(filter.value);

        // Lấy giá trị truy vấn `q` từ URL hiện tại
        const params = new URLSearchParams(search);
        const queryValue = params.get("q") || "";

        // Chuyển hướng sang trang phù hợp
        navigate(`/search/${filter.value}?q=${queryValue}`);
    };
    return (
        <div className="w-full bg-white rounded-lg min-h-screen">
            <h2 className="text-lg font-semibold p-4 pb-0">Kết quả tìm kiếm</h2>
            <div className="p-2">
                <div className="text-sm text-gray-500 px-2 py-2">Bộ lọc</div>
                {filters.map((filter) => (
                    <div
                        key={filter.value}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${activeFilter === filter.value
                                ? "bg-blue-100 text-blue-600"
                                : "hover:bg-gray-100"
                            }`}
                        onClick={() => {
                            setActiveFilter(filter.value);
                            handleNavigate(filter);
                        }}
                    >
                        <span className="text-gray-600">{filter.icon}</span>
                        <p className="text-sm">{filter.title}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}