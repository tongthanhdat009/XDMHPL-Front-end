import React from 'react'

const StoryCard = ({ name, src, profile }) => {
    return (
      <div className="relative h-[70px] w-[50px] md:h-[100px] md:w-[75px] lg:h-[180px] lg:w-[120px] cursor-pointer overflow-hidden rounded-lg transition duration-200 transform ease-in hover:scale-105 hover:animate-pulse">
        <img 
          src={src} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover brightness-75 rounded-lg"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="flex items-center">
            <img 
              src={profile} 
              alt={`${name}'s profile`} 
              className="w-8 h-8 rounded-full border-2 border-blue-500 mr-2 hidden lg:block"
            />
            <p className="text-white text-xs font-semibold truncate hidden lg:block">
              {name}
            </p>
          </div>
        </div>
      </div>
    );
  };

export default StoryCard