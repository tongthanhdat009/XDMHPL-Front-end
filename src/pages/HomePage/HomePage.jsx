import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import SideBar from '../../components/SideBar/SideBarHomePage/SideBar'
import MiddlePart from '../../components/MiddlePart/MiddlePart'
import HomeRight from '../../components/HomeRight/HomeRight'
import Header from '../../components/Header/Header'
import authService from '../../components/LoginPage/LoginProcess/ValidateLogin'

const HomePage = () => {
  const location = useLocation()

  const user = authService.getCurrentUser()

  console.log(user)
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      <Header />
      <main className="flex">
        <SideBar />
        <MiddlePart />
        <HomeRight />
      </main>
    </div>
  )
}

export default HomePage