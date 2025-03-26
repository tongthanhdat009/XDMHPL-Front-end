import { Avatar } from '@mui/material';
import React from 'react'
import PostCard from '../Post/PostCard';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const AllResult = () => {
    const location = useLocation();
    const { type } = useParams();
    const navigate=useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const queryValue = queryParams.get("q");
  
    const people = [
        {
            name: "Ronaldo Trần (Trân Duy Dũng)",
            subtitle: "THPT Hồng Quang · Sống tại Hải Dương · 169 người theo dõi",
            action: "Thêm bạn bè",
            verified: false
        },
        {
            name: "Ronaldo Ronaldo Ronaldo",
            subtitle: "682 người theo dõi · Sống tại Purwokarta",
            action: "Theo dõi",
            verified: true
        },
        {
            name: "Ronaldo Ricardo",
            subtitle: "Thêm bạn bè",
            action: "Thêm bạn bè",
            verified: false
        },
        {
            name: "Ronaldo De Lima",
            subtitle: "362 người theo dõi · Sống tại Thành phố Hồ Chí Minh",
            action: "Thêm bạn bè",
            verified: false
        },
        {
            name: "Kong Ngô Santos Aveiro (Cristiano Ronaldo)",
            subtitle: "2 người theo dõi",
            action: "Thêm bạn bè",
            verified: false
        }
    ];


    const posts = [
        {
            id: 1,
            caption: "Hello",
            image: "https://cdn.pixabay.com/photo/2013/07/18/15/06/couple-164526_1280.jpg",
            createdAt: "2023-01-01T00:00:00.000Z",
            comments: [

            ],
            likedBy: [

            ],
            user: {
                id: 1,
                firstName: "Anh",
                lastName: "Trần",
                avatar: "https://cdn.pixabay.com/photo/2013/07/18/15/06/couple-164526_1280.jpg",
            }
        },
        {
            id: 2,
            caption: "Hello",
            image: "https://cdn.pixabay.com/photo/2013/07/18/15/06/couple-164526_1280.jpg",
            createdAt: "2023-01-01T00:00:00.000Z",
            comments: [

            ],
            likedBy: [

            ],
            user: {
                id: 1,
                firstName: "Anh",
                lastName: "Trần",
                avatar: "https://cdn.pixabay.com/photo/2013/07/18/15/06/couple-164526_1280.jpg",
            }
        },
        {
            id: 3,
            caption: "Hello",
            image: "https://cdn.pixabay.com/photo/2013/07/18/15/06/couple-164526_1280.jpg",
            createdAt: "2023-01-01T00:00:00.000Z",
            comments: [

            ],
            likedBy: [

            ],
            user: {
                id: 1,
                firstName: "Anh",
                lastName: "Trần",
                avatar: "https://cdn.pixabay.com/photo/2013/07/18/15/06/couple-164526_1280.jpg",
            }
        }
    ]

    return (
        <div className="flex-grow bg-gray-100 p-4 overflow-y-auto scrollbar ">
            <div className='w-2/5 mx-auto'>
                {type === 'top' ? (
                    <>
                        <div className="bg-white rounded-lg p-2">
                            <h2 className="text-xl font-bold mb-4">Mọi người</h2>
                            {people.map((person, index) => (
                                <div key={index} className="flex items-center mb-4 justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar
                                            src={`/api/placeholder/50/50?text=${person.name.charAt(0)}`}
                                            alt={person.name}
                                            className="w-16 h-16"
                                        />
                                        <div>
                                            <div className="flex items-center space-x-1">
                                                <p className="font-semibold">{person.name}</p>
                                                {person.verified && (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        className="w-4 h-4 text-blue-500"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.491 4.491 0 0 1-3.498-1.307 4.491 4.491 0 0 1-1.307-3.497A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.491 4.491 0 0 1 1.307-3.498 4.491 4.491 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">{person.subtitle}</p>
                                        </div>
                                    </div>
                                    <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded-md px-3 py-1.5">
                                        {person.action}
                                    </button>
                                </div>
                            ))}
                            <div className="text-center mt-4">
                                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md w-full cursor-pointer" onClick={()=>navigate(`/search/people/?q=${queryParams}`)}>
                                    Xem tất cả
                                </button>
                            </div>
                        </div>

                        <div className='mt-5 space-y-5'>
                            {posts.map((post) => (
                                <PostCard key={post.id} item={post} />
                            ))}
                        </div>
                    </>
                ) : type === 'posts' ? (
                    <div className='mt-5 space-y-5'>
                        {posts.map((post) => (
                            <PostCard key={post.id} item={post} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg p-2">
                        <h2 className="text-xl font-bold mb-4">Mọi người</h2>
                        {people.map((person, index) => (
                            <div key={index} className="flex items-center mb-4 justify-between">
                                <div className="flex items-center space-x-3">
                                    <Avatar
                                        src={`/api/placeholder/50/50?text=${person.name.charAt(0)}`}
                                        alt={person.name}
                                        className="w-16 h-16"
                                    />
                                    <div>
                                        <div className="flex items-center space-x-1">
                                            <p className="font-semibold">{person.name}</p>
                                            {person.verified && (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="w-4 h-4 text-blue-500"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.491 4.491 0 0 1-3.498-1.307 4.491 4.491 0 0 1-1.307-3.497A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.491 4.491 0 0 1 1.307-3.498 4.491 4.491 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{person.subtitle}</p>
                                    </div>
                                </div>
                                <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded-md px-3 py-1.5">
                                    {person.action}
                                </button>
                            </div>
                        ))}
                    </div>
                )}


                <div className='pt-4 mb-20 text-center'>
                    Kết quả tìm kiếm chỉ bao gồm những nội dung hiển thị với bạn.
                </div>
            </div>
        </div>
    );
}

export default AllResult