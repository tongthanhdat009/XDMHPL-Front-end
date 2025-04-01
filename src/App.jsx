import { useEffect, useState } from "react";
import testAPI from "./testAPI";
import Messenger from "./components/Messenger.jsx";
import React from "react";
import { Route, Routes } from 'react-router-dom'
import HomePage from "./pages/HomePage/HomePage.jsx";
import SearchPage from "./pages/SearchPage/SearchPage.jsx";
import AdminPage from "./pages/AdminPage/AdminPage.jsx";
function App() {
  
  return (
    <Routes>
      <Route path='/*' element={<HomePage />} />
      <Route path='/messages' element={<Messenger />} />
      <Route path='/search/:type' element={<SearchPage /> } />
      <Route path='/admin/*' element={<AdminPage />} />
    </Routes>
  )
}

export default App;
