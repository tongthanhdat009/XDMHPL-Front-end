import React from 'react'
import FriendCard from './FriendCard'

const AlllResult = () => {
  const handleAddFriend = () => {

  }
  const handleApplyFriend = () => {

  }

  const handleCancelRequest = () => {

  }

  const handleCancelSuggestion = () => {

  }
  return (
    <>
      <div className="flex flex-col w-full  h-screen overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Lời mời kết bạn</h2>
            <button className="text-blue-500 text-sm font-medium">Xem tất cả</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
            {/* Friend cards will go here */}
            <FriendCard
              name="Nę Rj"
              followers="Có 697 người theo dõi"
              image="/path/to/profile1.jpg"
              type={"pending"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Tôn Thất Bảo Toàn"
              image="/path/to/profile2.jpg"
              type={"pending"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Nick"
              image="/path/to/profile3.jpg"
              isAvatar={true}
              type={"pending"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Lý Nguyễn Minh Trường"
              mutualFriends="77 bạn chung"
              image="/path/to/profile4.jpg"
              type={"pending"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Long Vũ"
              image="/path/to/profile5.jpg"
              type={"pending"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Phương Đào Trần"
              mutualFriends="3 bạn chung"
              image="/path/to/profile6.jpg"
              type={"pending"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Huy Phạm"
              image="/path/to/profile7.jpg"
              type={"pending"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Nę Rj"
              followers="Có 697 người theo dõi"
              image="/path/to/profile1.jpg"
              type={"pending"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Tôn Thất Bảo Toàn"
              image="/path/to/profile2.jpg"
              type={"pending"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            {/* Additional friend cards as needed */}
          </div>
        </div>

        <div className="p-10 mt-4 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Những người bạn có thể biết</h2>
            <button className="text-blue-500 text-sm font-medium">Xem tất cả</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
            {/* Friend cards will go here */}
            <FriendCard
              name="Nę Rj"
              followers="Có 697 người theo dõi"
              image="/path/to/profile1.jpg"
              isAnime={true}
              type={"suggesting"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Tôn Thất Bảo Toàn"
              image="/path/to/profile2.jpg"
              type={"suggesting"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Nick"
              image="/path/to/profile3.jpg"
              isAvatar={true}
              type={"suggesting"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Lý Nguyễn Minh Trường"
              mutualFriends="77 bạn chung"
              image="/path/to/profile4.jpg"
              type={"suggesting"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Long Vũ"
              image="/path/to/profile5.jpg"
              type={"suggesting"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Phương Đào Trần"
              mutualFriends="3 bạn chung"
              image="/path/to/profile6.jpg"
              type={"suggesting"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            <FriendCard
              name="Huy Phạm"
              image="/path/to/profile7.jpg"
              type={"suggesting"}
              onClick1={handleApplyFriend}
              onClick2={handleCancelRequest}
            />
            {/* Additional friend cards as needed */}
          </div>
        </div>
      </div>
    </>


  )
}

export default AlllResult