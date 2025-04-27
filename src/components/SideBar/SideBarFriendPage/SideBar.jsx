import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import SideBarItem from './SideBarItem';
import CakeIcon from '@mui/icons-material/Cake';
const SideBar = () => {
  const { type } = useParams();
  const [activeFilter, setActiveFilter] = React.useState(type);
  return (
    <div className="w-64 min-h-screen bg-white p-2 shadow-sm">
      <div className="flex items-center p-2">
        <h1 className="text-lg font-semibold">Bạn bè</h1>
        <div className="ml-auto">
          <button className="p-2 rounded-full bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-1">
        <SideBarItem 
          icon={<PeopleIcon />}
          title="Trang chủ"
          active={true}
        />
        <SideBarItem 
          icon={<PersonAddIcon />}
          title="Lời mời kết bạn"
          count="25"
          active={false}
          hasMore={true}
        />
        <SideBarItem 
          icon={<PersonAddIcon />}
          title="Gợi ý"
          active={false}
          hasMore={true}
        />
        <SideBarItem 
          icon={<GroupsIcon />}
          title="Tất cả bạn bè"
          active={false}
          hasMore={true}
        />
        <SideBarItem 
          icon={<CakeIcon />}
          title="Sinh nhật"
          active={false}
        />
      </div>
    </div>
  )
}

export default SideBar