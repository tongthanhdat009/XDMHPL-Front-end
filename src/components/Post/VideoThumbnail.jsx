import React from "react";

const VideoThumbnail = ({ videoUrl, index, totalMedia }) => {
    const videoRef = React.useRef(null);
    const [thumbnailReady, setThumbnailReady] = React.useState(false);
  
    React.useEffect(() => {
      const video = videoRef.current;
      if (video) {
        // Đảm bảo video sẽ load metadata
        video.addEventListener('loadeddata', () => {
          // Tìm kiếm frame đầu tiên
          video.currentTime = 0.1;
        });
  
        video.addEventListener('seeked', () => {
          setThumbnailReady(true);
        });
      }
    }, []);
  
    return (
      <div className="relative w-full h-full">
        <video 
          ref={videoRef}
          src={`http://localhost:8080${videoUrl}}`}
          className={`w-full h-full object-cover ${!thumbnailReady ? 'invisible' : ''}`}
          preload="metadata"
          style={{ aspectRatio: index === 0 && totalMedia === 1 ? 'auto' : '1/1' }}
          onError={(e) => {
            e.target.src = `http://localhost:8080${videoUrl}?timestamp=${new Date().getTime()}`;
          }}
        />
        
        {!thumbnailReady && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="animate-pulse">Đang tải...</div>
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  export default VideoThumbnail;