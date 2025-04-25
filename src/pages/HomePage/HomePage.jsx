import React, { useEffect } from 'react'
import SideBar from '../../components/SideBar/SideBarHomePage/SideBar'
import MiddlePart from '../../components/MiddlePart/MiddlePart'
import HomeRight from '../../components/HomeRight/HomeRight'
import Header from '../../components/Header/Header'
import authService from '../../components/LoginPage/LoginProcess/ValidateLogin'

const HomePage = () => {
  

//   let totalSize = 0;
// for (let key in localStorage) {
//     if (localStorage.hasOwnProperty(key)) {
//         totalSize += localStorage.getItem(key).length;
//     }
// }
// console.log(`Dung lượng đã sử dụng: ${totalSize} bytes`);

  // console.log(user)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await authService.getAllPosts();
        console.log(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
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