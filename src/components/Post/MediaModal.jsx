
// Đầu tiên tạo component MediaModal
const MediaModal = ({ isOpen, handleClose, mediaList, currentIndex, setCurrentIndex }) => {
    if (!isOpen) return null;
  
    const handlePrevious = () => {
      setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : mediaList.length - 1));
    };
  
    const handleNext = () => {
      setCurrentIndex((prevIndex) => (prevIndex < mediaList.length - 1 ? prevIndex + 1 : 0));
    };
  
    const currentMedia = mediaList[currentIndex];
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
        {/* Nút đóng */}
        <button 
          className="absolute top-4 left-4 z-50 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700"
          onClick={handleClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Media content */}
        <div className="relative w-full h-full flex items-center justify-center">
          {currentMedia.type === "image" ? (
            <img
              src={'http://localhost:8080' + currentMedia.mediaURL}
              alt={`Media ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          ) : currentMedia.type === "video" ? (
            <video
              src={'http://localhost:8080' + currentMedia.mediaURL}
              controls
              autoPlay
              className="max-h-full max-w-full object-contain"
            />
          ) : null}
        </div>
        
        {/* Navigation buttons */}
        {mediaList.length > 1 && (
          <>
            <button
              className="absolute left-4 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700"
              onClick={handlePrevious}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-4 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700"
              onClick={handleNext}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Media counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 px-3 py-1 rounded-full text-white text-sm">
          {currentIndex + 1} / {mediaList.length}
        </div>
      </div>
    );
  };

  export default MediaModal;