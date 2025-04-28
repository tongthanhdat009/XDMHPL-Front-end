import React, { useEffect, useState } from 'react'
import FriendCard from "../ResultFriend/FriendCard";
import authService from '../LoginPage/LoginProcess/ValidateLogin';

const MainContent = ({ activeSection, setActiveSection }) => {

    // State for loading more items
    const [requestsVisible, setRequestsVisible] = useState(14);
    const [suggestionsVisible, setSuggestionsVisible] = useState(14);
    const [allFriendsVisible, setAllFriendsVisible] = useState(14);

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
    
    // Mock data for the different lists
    const requestsData = Array(30).fill().map((_, i) => ({
      id: `request-${i}`,
      name: `User ${i+1}`,
      mutualFriends: i % 3 === 0 ? `${i+5} bạn chung` : null,
      followers: i % 5 === 0 ? `Có ${i*10 + 100} người theo dõi` : null,
      image: `/path/to/profile${(i % 7) + 1}.jpg`,
      isAvatar: i % 11 === 0,
      type: "pending"
    }));
    
    const suggestionsData = Array(30).fill().map((_, i) => ({
      id: `suggestion-${i}`,
      name: `Suggested User ${i+1}`,
      mutualFriends: i % 4 === 0 ? `${i+3} bạn chung` : null,
      followers: i % 6 === 0 ? `Có ${i*15 + 200} người theo dõi` : null,
      image: `/path/to/profile${(i % 7) + 1}.jpg`,
      isAvatar: i % 13 === 0,
      type: "suggesting"
    }));
    
    const allFriendsData = Array(30).fill().map((_, i) => ({
      id: `friend-${i}`,
      name: `Friend ${i+1}`,
      mutualFriends: i % 2 === 0 ? `${i+10} bạn chung` : null,
      followers: i % 7 === 0 ? `Có ${i*20 + 300} người theo dõi` : null,
      image: `/path/to/profile${(i % 7) + 1}.jpg`,
      isAvatar: i % 9 === 0,
      type: "friend"
    }));
    
    // Handler functions
    const handleApplyFriend = () => {
      console.log("Apply friend");
    };
  
    const handleCancelRequest = () => {
      console.log("Cancel request");
    };
    
    const handleViewMoreRequests = () => {
      setRequestsVisible(prev => prev + 14);
    };
    
    const handleViewMoreSuggestions = () => {
      setSuggestionsVisible(prev => prev + 14);
    };
    
    const handleViewMoreFriends = () => {
      setAllFriendsVisible(prev => prev + 14);
    };
  
    // Render the friend lists based on the active section
    return (
      <div className="flex flex-col w-full h-screen overflow-y-auto">
        {/* Friend Requests Section */}
        {(activeSection === 'home' || activeSection === 'requests') && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Lời mời kết bạn</h2>
              {activeSection === 'home' && (
                <button 
                  className="text-blue-500 text-sm font-medium"
                  onClick={() => setActiveSection('requests')}
                >
                  Xem tất cả
                </button>
              )}
            </div>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
              {requestsData.slice(0, requestsVisible).map((friend) => {
                console.log(friend)
                return(
                  <FriendCard
                  key={friend.id}
                  name={friend.name}
                  mutualFriends={friend.mutualFriends}
                  followers={friend.followers}
                  image={friend.image}
                  isAvatar={friend.isAvatar}
                  type={friend.type}
                  onClick1={handleApplyFriend}
                  onClick2={handleCancelRequest}
                />
                )
            })}
            </div>
            
            {/* Load more button */}
            {requestsVisible < requestsData.length && (
              <div className="flex justify-center mt-4">
                <button 
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  onClick={handleViewMoreRequests}
                >
                  Xem thêm
                </button>
              </div>
            )}
          </div>
        )}
  
        {/* Suggestions Section */}
        {(activeSection === 'home' || activeSection === 'suggestions') && (
          <div className="p-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Những người bạn có thể biết</h2>
              {activeSection === 'home' && (
                <button 
                  className="text-blue-500 text-sm font-medium"
                  onClick={() => setActiveSection('suggestions')}
                >
                  Xem tất cả
                </button>
              )}
            </div>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
              {suggestionsData.slice(0, suggestionsVisible).map((friend) => (
                <FriendCard
                  key={friend.id}
                  name={friend.name}
                  mutualFriends={friend.mutualFriends}
                  followers={friend.followers}
                  image={friend.image}
                  isAvatar={friend.isAvatar}
                  type={friend.type}
                  onClick1={handleApplyFriend}
                  onClick2={handleCancelRequest}
                />
              ))}
            </div>
            
            {/* Load more button */}
            {suggestionsVisible < suggestionsData.length && (
              <div className="flex justify-center mt-4">
                <button 
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  onClick={handleViewMoreSuggestions}
                >
                  Xem thêm
                </button>
              </div>
            )}
          </div>
        )}
  
        {/* All Friends Section */}
        {activeSection === 'all-friends' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Tất cả bạn bè</h2>
            </div>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
              {allFriendsData.slice(0, allFriendsVisible).map((friend) => (
                <FriendCard
                  key={friend.id}
                  name={friend.name}
                  mutualFriends={friend.mutualFriends}
                  followers={friend.followers}
                  image={friend.image}
                  isAvatar={friend.isAvatar}
                  type="friend"
                  onClick1={() => console.log("Message friend")}
                  onClick2={() => console.log("Remove friend")}
                />
              ))}
            </div>
            
            {/* Load more button */}
            {allFriendsVisible < allFriendsData.length && (
              <div className="flex justify-center mt-4">
                <button 
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  onClick={handleViewMoreFriends}
                >
                  Xem thêm
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  export default MainContent;