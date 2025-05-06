import React, { useEffect } from 'react';
import Header from '../../components/Header/Header';
import NotificationOverlay from '../../components/Notification/NotificationOverlay';
import authService from '../../components/LoginPage/LoginProcess/ValidateLogin';

const NotificationPage = () => {
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
  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      <Header />
      <main className="flex h-full">
        <div className="flex-1  overflow-y-scroll">
          <NotificationOverlay />
        </div>
      </main>
    </div>
  );
};

export default NotificationPage;