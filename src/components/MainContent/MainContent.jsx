import React, { useEffect, useState } from 'react'
import FriendCard from "../ResultFriend/FriendCard";
import authService from '../LoginPage/LoginProcess/ValidateLogin';
import { useAuth } from '../LoginPage/LoginProcess/AuthProvider';
import { useNavigate } from 'react-router-dom';

const MainContent = ({ activeSection, setActiveSection }) => {
  const {stompClient } = useAuth();
  const navigate = useNavigate();
  // State for loading more items
  const [requestsVisible, setRequestsVisible] = useState(14);
  const [suggestionsVisible, setSuggestionsVisible] = useState(14);
  const [allFriendsVisible, setAllFriendsVisible] = useState(14);

  const currentUser = authService.getCurrentUser();
  const [allUsers, setAllUsers] = useState([]);

  const updateUsers = async () => {
    try {
      const result = await authService.getAllUsersFormDB();
      if (result.success) {
        setAllUsers(result.data); // Cập nhật danh sách bài viết
      }
    } catch (error) {
      console.error("Error updating posts:", error);
    }
  };

  const updateCurentUser = async () => {
    try {
      const currentUser=authService.getCurrentUser();
      const result = await authService.getCurrentUserFormDB(currentUser.userID);
    } catch (error) {
      console.error("Error updating posts:", error);
    }
  }
  const sendFriendRequest = async (senderId, receiverId) => {
    const data = {
      senderId: senderId,
      receiverId: receiverId
  };

  try {
      const result = await authService.sentFriendRequest({data, sendNotifyFriendRequestToServer})
      console.log(result)
      if (result.success) {
          // Gọi callback để cập nhật danh sách bài viết
          await updateCurentUser();
          await updateUsers();
      } else {
          // Xử lý lỗi
          console.error("Error liking post:", result.error);
      }
  } catch (error) {
      console.error("Error in form submission:", error);
  }
  };

  const sendNotifyFriendRequestToServer = (newMessage) => {
    if (stompClient && newMessage) {
    console.log("📤 Sending message:", newMessage);
    stompClient.send(`/app/friendRequest/notification`, {}, JSON.stringify(newMessage));
    }
};

  const deleteFriend = async (friendId) => {
    const inFriendOf = currentUser.friendOf.find(
      (friend) => friend.userID === friendId
    );

    const reqData = {
      senderId: inFriendOf ? friendId : currentUser.userID,
      receiverId: inFriendOf ? currentUser.userID : friendId
    };

    try {
      const result = await authService.deleteFriendRequest(reqData)
      console.log(result)
      if (result.success) {
        // Gọi callback để cập nhật danh sách bài viết
        await updateCurentUser();
        await updateUsers();
      } else {
        // Xử lý lỗi
        console.error("Error liking post:", result.error);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }

  };

  const acceptFriend = async (senderId, receiverId) => {
    const reqData = {
      senderId: senderId,
      receiverId: receiverId
    };

    try {
      const result = await authService.acceptFriendRequest(reqData)
      console.log(result)
      if (result.success) {
        // Gọi callback để cập nhật danh sách bài viết
        await updateCurentUser();
        await updateUsers();
      } else {
        // Xử lý lỗi
        console.error("Error liking post:", result.error);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }


  };


  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const users = await authService.getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchDatas();
  }, []);

  // Mock data for the different lists
  const requestsData = currentUser.friendOf
    .filter((user) => user.status === "PENDING") // Lọc chỉ những user có status là "PENDING"
    .map((user, i) => {
      const totalFriends = user.friends.filter(
        (friend) => friend.status === "ACCEPTED"
    ).length + user.friendOf.filter(
        (friend) => friend.status === "ACCEPTED"
    ).length;
      return {
      id: user.userID,
      name: user.fullName,
      mutualFriends: totalFriends + ' người bạn',
      isAvatar: user.avatarURL ? 'http://localhost:8080/uploads' + user.avatarURL : "http://localhost:8080/uploads/avatars/default.jpg",
      type: "pending"
    }});

  const suggestionsData = allUsers
    .filter((user) => {
      const isInFriends = currentUser.friends.some((friend) => friend.userID === user.userID);
      const isInFriendOf = currentUser.friendOf.some((friend) => friend.userID === user.userID);
      return !isInFriends && !isInFriendOf && user.userID !== currentUser.userID; // Loại bỏ chính user hiện tại
    })
    .map((user, i) => {
      const totalFriends = user.friends.filter(
        (friend) => friend.status === "ACCEPTED"
    ).length + user.friendOf.filter(
        (friend) => friend.status === "ACCEPTED"
    ).length;
      return {
        id: user.userID,
        name: user.fullName,
        mutualFriends: totalFriends + ' người bạn',
        isAvatar: user.avatarURL ? 'http://localhost:8080/uploads' + user.avatarURL : "http://localhost:8080/uploads/avatars/default.jpg",
        type: "suggesting"
      }
});

  const allFriendsData = allUsers
    .filter((user) => {
      const isInFriends = currentUser.friends.some((friend) => friend.userID === user.userID && friend.status === "ACCEPTED") // Lọc chỉ những user có status là "ACCEPTED");
      const isInFriendOf = currentUser.friendOf.some((friend) => friend.userID === user.userID && friend.status === "ACCEPTED");
      return (isInFriends || isInFriendOf)
    })
    .map((user, i) => {
      const totalFriends = user.friends.filter(
        (friend) => friend.status === "ACCEPTED"
    ).length + user.friendOf.filter(
        (friend) => friend.status === "ACCEPTED"
    ).length;
      return {
      id: user.userID,
      name: user.fullName,
      mutualFriends: totalFriends + ' người bạn',
      image: user.avatarURL ? 'http://localhost:8080/uploads' + user.avatarURL : "http://localhost:8080/uploads/avatars/default.jpg",
      isAvatar: user.avatarURL ? 'http://localhost:8080/uploads' + user.avatarURL : "http://localhost:8080/uploads/avatars/default.jpg",
      type: "suggesting"
    }
  });

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
              return (
                <FriendCard
                  key={friend.id}
                  id={friend.id}
                  name={friend.name}
                  mutualFriends={friend.mutualFriends}
                  isAvatar={friend.isAvatar}
                  type={friend.type}
                  onClick1={() => acceptFriend(friend.id, currentUser.userID)}
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
                id={friend.id}
                name={friend.name}
                mutualFriends={friend.mutualFriends}
                isAvatar={friend.isAvatar}
                type={friend.type}
                onClick1={() => sendFriendRequest(currentUser.userID, friend.id)}
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
                id={friend.id}
                name={friend.name}
                mutualFriends={friend.mutualFriends}
                isAvatar={friend.isAvatar}
                type="friend"
                onClick1={() => navigate(`/messages`)}
                onClick2={() => deleteFriend(friend.id)}
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