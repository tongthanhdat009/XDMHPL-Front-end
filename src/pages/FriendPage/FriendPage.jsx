import React, { useEffect, useState } from 'react'

import SideBar from '../../components/SideBar/SideBarFriendPage/SideBar'
import Header from '../../components/Header/Header'
import MainContent from '../../components/MainContent/MainContent'
import { useParams } from 'react-router-dom'
import authService from '../../components/LoginPage/LoginProcess/ValidateLogin'

const FriendPage = () => {
    const currentUser = authService.getCurrentUser();
    useEffect(() => {
        const fetchDatas = async () => {
          try {
            await authService.getAllPostsFormDB();
            await authService.getAllUsersFormDB();
            await authService.getCurrentUserFormDB(currentUser.userID);
          } catch (error) {
            console.error("Error fetching:", error);
          }
        };
    
        fetchDatas();
    }, []);

    const { type } = useParams();
    const [activeSection, setActiveSection] = useState(type || 'home');
    
    return (
        <div className='h-screen bg-gray-100 overflow-hidden'>
            <Header />
            <main className='flex h-full'>
                <SideBar activeSection={activeSection} setActiveSection={setActiveSection} />
                <MainContent activeSection={activeSection}  setActiveSection={setActiveSection} />
            </main>
        </div>
    );
}

export default FriendPage