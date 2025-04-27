import AllInboxIcon from '@mui/icons-material/AllInbox';
import PeopleIcon from '@mui/icons-material/People';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useLocation, useNavigate } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
const SideBarItem = ({ icon, title, hasMore, active }) => {
    return (
      <div className={`flex items-center p-2 rounded-lg cursor-pointer ${active ? "bg-blue-100" : "hover:bg-gray-100"}`}>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${active ? "text-blue-600" : "text-gray-500"}`}>
          {icon}
        </div>
        <div className="ml-2 flex-grow">
          <p className={`text-sm ${active ? "text-blue-600 font-medium" : ""}`}>{title}</p>
        </div>
        {/* {count && (
          <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {count}
          </div>
        )} */}
        {hasMore && (
          <div className="text-gray-500">
            <ChevronRightIcon />
          </div>
        )}
      </div>
    );
  };

  export default SideBarItem