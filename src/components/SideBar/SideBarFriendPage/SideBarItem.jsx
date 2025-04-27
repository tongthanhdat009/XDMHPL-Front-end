import AllInboxIcon from '@mui/icons-material/AllInbox';
import PeopleIcon from '@mui/icons-material/People';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useLocation, useNavigate } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
const SideBarItem = ({ icon, title, count, active, hasMore, onClick }) => {
  return (
    <div 
      className={`flex items-center p-2 rounded-md cursor-pointer ${active ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
      onClick={onClick}
    >
      <div className={`mr-2 ${active ? 'text-blue-500' : 'text-gray-500'}`}>
        {icon}
      </div>
      <div className="flex-grow">
        <div className={`text-sm font-medium ${active ? 'text-blue-500' : ''}`}>{title}</div>
      </div>
      {count && (
        <div className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
          {count}
        </div>
      )}
      {hasMore && !count && (
        <div className="text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

  export default SideBarItem