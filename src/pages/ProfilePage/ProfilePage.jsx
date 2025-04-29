import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProfileContent from '../../components/MiddlePart/ProfileContent';
import ProfileHeader from '../../components/Header/ProfileHeader';
import Header from '../../components/Header/Header';

const ProfilePage = () => {
    const location = useLocation();
    const [selectedTab, setSelectedTab] = useState('posts');

    return (
        <div className='flex flex-col h-screen overflow-y-auto scrollbar' style={{ scrollbarWidth: "none" }}>
            <Header />
            <ProfileHeader selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
            <main className="flex">
                <ProfileContent selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            </main>
        </div>
    );
}

export default ProfilePage;
