import React, { useEffect } from 'react'
import Header from '../../components/Header/Header'
import SideBar from '../../components/SideBar/SideBarSearchPage/SideBar'
import { useSearchParams } from 'react-router-dom';
import AllResult from '../../components/ResultSearch/AllResult';
import authService from '../../components/LoginPage/LoginProcess/ValidateLogin';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q"); // Lấy giá trị q từ URL

    useEffect(() => {
        const fetchDatas = async () => {
          try {
            await authService.getAllPostsFormDB();
            await authService.getAllUsersFormDB();
          } catch (error) {
            console.error("Error fetching:", error);
          }
        };
    
        fetchDatas();
    }, []);
    
    return (
        <div className='h-screen bg-gray-100 overflow-hidden'>
            <Header />
            <main className='flex h-full'>
                <SideBar />
                <AllResult />
            </main>
        </div>
    )
}

export default SearchPage