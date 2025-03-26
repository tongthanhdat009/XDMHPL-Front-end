import React from 'react'
import SideBar from '../../components/SideBar/SideBarHomePage/SideBar'
import {useLocation } from 'react-router-dom'
import MiddlePart from '../../components/MiddlePart/MiddlePart'
import HomeRight from '../../components/HomeRight/HomeRight'
import Header from '../../components/Header/Header'

const HomePage = () => {
    const location = useLocation();
    return (
        <div className='h-screen bg-gray-100 overflow-hidden'>
            <Header />           

            <main className='flex'>
                <SideBar/>
                <MiddlePart/>
                <HomeRight/>

            </main>
        </div>
    )
}

export default HomePage