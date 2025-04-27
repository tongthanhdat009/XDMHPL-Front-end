import * as React from 'react';
import {  Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { SideBarRow } from './SideBarRow';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import authService from '../../LoginPage/LoginProcess/ValidateLogin';
const SideBar = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const handleNavigate = (item) => {
    if (item.title == "Profile") {
      navigate(`/profile/3`)
    }
    else {
      navigate(item.path)
    }
  }
  return (
    <div className='p-2 mt-5 max-w-[600px] xl:min-w-[300px]'>
      <SideBarRow src='https://centraliamomuseum.org/wp-content/uploads/2022/02/blank_profile.png' title={currentUser.fullName} onClick={() => handleNavigate({ title: "Profile" })}/>

      <SideBarRow Icon={PeopleIcon} title="Friends" onClick={() => handleNavigate({title:"Friends"})}/>
      <SideBarRow Icon={GroupIcon} title="Groups" onClick={() => handleNavigate({title:"Groups"})}/>
      <SideBarRow Icon={StorefrontIcon} title="Marketplace" onClick={() => handleNavigate({title:"Marketplace"})}/>
      <SideBarRow Icon={OndemandVideoIcon} title="Watch" onClick={() => handleNavigate({title:"Watch"})}/>
      <SideBarRow Icon={CalendarMonthIcon} title="Events" onClick={() => handleNavigate({title:"Events"})}/>
      <SideBarRow Icon={WatchLaterIcon} title="Memories" onClick={() => handleNavigate({title:"Memories"})}/>
      <SideBarRow Icon={ExpandMoreIcon} title="More"/>


      <div>
        <Divider />
      </div>
    </div>
  )
}

export default SideBar