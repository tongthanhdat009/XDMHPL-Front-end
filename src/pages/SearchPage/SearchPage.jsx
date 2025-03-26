import React from 'react'
import Header from '../../components/Header/Header'
import SideBar from '../../components/SideBar/SideBarSearchPage/SideBar'
import { useSearchParams } from 'react-router-dom';
import AllResult from '../../components/ResultSearch/AllResult';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q"); // Lấy giá trị q từ URL
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