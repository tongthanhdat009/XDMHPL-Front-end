import React, { useEffect } from 'react'
import SideBar from '../../components/SideBar/SideBarHomePage/SideBar'
import MiddlePart from '../../components/MiddlePart/MiddlePart'
import HomeRight from '../../components/HomeRight/HomeRight'
import Header from '../../components/Header/Header'
import authService from '../../components/LoginPage/LoginProcess/ValidateLogin'

const HomePage = () => {
  
const currentUser = authService.getCurrentUser();
//   let totalSize = 0;
// for (let key in localStorage) {
//     if (localStorage.hasOwnProperty(key)) {
//         totalSize += localStorage.getItem(key).length;
//     }
// }
// console.log(`Dung lượng đã sử dụng: ${totalSize} bytes`);
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
      <main className="flex">
        <SideBar />
        <MiddlePart />
        <HomeRight />
      </main>
    </div>
  )
}

export default HomePage