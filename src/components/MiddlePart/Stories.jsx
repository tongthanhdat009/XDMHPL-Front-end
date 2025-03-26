import { Avatar } from '@mui/material'
import React from 'react'
import AddIcon from '@mui/icons-material/Add';
import StoryCard from './StoryCard';

const stories=[
    {
        id:1,
        name:"Himanshu",
        src:"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
        profile:"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
    },
    {
        id:2,
        name:"Himanshu",
        src:"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
        profile:"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
    },
    {
        id:3,
        name:"Himanshu",
        src:"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
        profile:"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
    },
    {
        id:4,
        name:"Himanshu",
        src:"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
        profile:"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
    },
    {
        id:5,
        name:"Himanshu",
        src:"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
        profile:"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
    },
]
const Stories = () => {
    return (
        <div className='flex justify-center space-x-3 mx-auto'>
            {
                stories.map((story)=>(
                    <StoryCard key={story.id} name={story.name} src={story.src} profile={story.profile} />
                ))
            }
        </div>
    )
}

export default Stories