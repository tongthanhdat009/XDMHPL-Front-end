import React from 'react'
import SideBar from '../../components/SideBar/SideBarFriendPage/SideBar'
import AlllResult from '../../components/ResultFriend/AlllResult'
import Header from '../../components/Header/Header'

const FriendPage = () => {
    return (
        <div className='h-screen bg-gray-100 overflow-hidden'>
            <Header />
            <main className='flex h-full'>
                <SideBar />
                <AlllResult />
            </main>
        </div>
    )
}

export default FriendPage