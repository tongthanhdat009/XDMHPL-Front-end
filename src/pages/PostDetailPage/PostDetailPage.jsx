import React, { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom';
import authService from '../../components/LoginPage/LoginProcess/ValidateLogin';
import Header from '../../components/Header/Header';
import SideBar from '../../components/SideBar/SideBarHomePage/SideBar';
import MiddlePart from '../../components/MiddlePart/MiddlePart';
import HomeRight from '../../components/HomeRight/HomeRight';
import MiddePartPostDetail from '../../components/MiddlePart/MiddePartPostDetail';

const PostDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const commentId = searchParams.get("commentId");

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
      <main className="flex">
        <SideBar />
        <MiddePartPostDetail postID={id} commentID={commentId} />
        <HomeRight />
      </main>
    </div>
  )
}

export default PostDetailPage