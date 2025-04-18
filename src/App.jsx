import Messenger from "./components/Messenger.jsx";
import React from "react";
import { Route, Routes } from 'react-router-dom'
import HomePage from "./pages/HomePage/HomePage.jsx";
import SearchPage from "./pages/SearchPage/SearchPage.jsx";
import AdminPage from "./pages/AdminPage/AdminPage.jsx";
import UserLogin from "./pages/LoginPage/User/UserLogin.jsx";
import UserSignin from "./pages/LoginPage/User/UserSignin.jsx";
function App() {
  
  return (
    <Routes>
      <Route path='/*' element={<HomePage />} />
      <Route path='/messages' element={<Messenger />} />
      <Route path='/search/:type' element={<SearchPage /> } />
      <Route path='/admin/*' element={<AdminPage />} />
      <Route path='/login/*' element={<UserLogin />} />
      <Route path='/signin/*' element={<UserSignin />} />
      <Route path='/user/*' element={<user />} />
    </Routes>

  )
}

export default App;
