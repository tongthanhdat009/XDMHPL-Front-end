import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import authService from '../../../components/LoginPage/LoginProcess/ValidateLogin';
import FormLogin from '../../../components/LoginPage/FormLogin';
const UserLogin = () => {
    const location = useLocation()
    // Lấy ngay user từ storage, không cần useState/useEffect
    const user = authService.getCurrentUser()

    // Nếu chưa login => chuyển hướng
    if (user) {
      return (
        <Navigate
          to="/"
          replace
          state={{ from: location }}
        />
      )
    }
    return(
      <FormLogin />
  );
};

export default UserLogin;