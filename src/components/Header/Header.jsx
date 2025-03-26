import { Avatar, Menu, MenuItem } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import fblogo from "../../assets/facebook-logo.jpg"
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HomeIcon from '@mui/icons-material/Home';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import NotificationsSharpIcon from '@mui/icons-material/NotificationsSharp';
import KeyboardArrowDownSharpIcon from '@mui/icons-material/KeyboardArrowDownSharp';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";
const Header = () => {
  const navigate=useNavigate();
  const [search, setSearch] = React.useState("")

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const searchRef = useRef(null); // Tham chiếu đến vùng chứa ô tìm kiếm và dropdown

  const handleEnterInput = (value) => {
    navigate(`/search/top?q=${value}`);
  }
  // Xử lý khi click bên ngoài vùng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchActive(false); // Ẩn dropdown nếu click ra ngoài
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {

  }

  const handleSearchUser = (e) => {
    setSearch(e.target.value)

  }

  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState(['zeus']);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleRemoveSearch = (searchToRemove) => {
    console.log(searchToRemove);
    setRecentSearches(recentSearches.filter(search => search !== searchToRemove));
  };

  return (
    <div className="sticky top-0 z-50 bg-white flex items-center p-2 lg:px-5 shadow-md justify-between">
  {/* Left */}
  <div className="relative flex-grow max-w-xs" ref={searchRef}>
    <div className="flex items-center space-x-2">
      <div onClick={() => navigate("/")} className="cursor-pointer">
        <Avatar src={fblogo} sx={{ width: 40, height: 40 }} className="mr-2" />
      </div>
      <div className="flex-grow flex items-center space-x-2 bg-gray-100 rounded-full p-2">
        <button className="text-gray-600">
          <SearchIcon />
        </button>
        <input
          type="text"
          placeholder="Tìm kiếm trên Facebook"
          className="w-full bg-transparent outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchActive(true)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target.value.trim() !== '') {
              handleEnterInput(e.target.value);
              setIsSearchActive(false);
            }
          }}
        />
      </div>
    </div>

    {isSearchActive && (
      <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 border">
        <div className="p-4">
          {/* <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Mới đây</h3>
            <button className="text-blue-500">Chỉnh sửa</button>
          </div> */}
          {recentSearches.map((search) => (
            <div
              key={search}
              className="flex items-center justify-between hover:bg-gray-100 p-2 rounded-md cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <AccessTimeIcon className="text-gray-500 w-5 h-5" />
                <span>{search}</span>
              </div>
              <button onClick={() => handleRemoveSearch(search)}>
                <CloseIcon className="text-gray-500 w-5 h-5 cursor-pointer" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>

  {/* Right */}
  <div className="flex items-center space-x-4">
    <HomeIcon sx={{ width: 40, height: 40 }} className="icon" />
    <ChatBubbleIcon sx={{ width: 40, height: 40 }} className="icon" />
    <NotificationsSharpIcon sx={{ width: 40, height: 40 }} className="icon" />
    <div className="flex items-center space-x-1 cursor-pointer bg-gray-200 rounded-full p-1" onClick={handleClick}>
      <Avatar sx={{ width: 40, height: 40 }} />
      <KeyboardArrowDownSharpIcon sx={{ width: 20, height: 20, color: "gray" }} />
    </div>
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      <MenuItem onClick={handleClose}>Profile</MenuItem>
      <MenuItem onClick={handleClose}>My account</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  </div>
</div>
  )
}
export default Header;
