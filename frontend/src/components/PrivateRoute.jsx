import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const PrivateRoute = () => {
  const { user, token } = useAuthStore();

  return token ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default PrivateRoute;
