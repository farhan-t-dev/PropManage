import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const dashboard = user?.role === 'landlord' ? '/landlord-dashboard' : '/my-bookings';
    return <Navigate to={dashboard} replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    const dashboard = user?.role === 'landlord' ? '/landlord-dashboard' : '/my-bookings';
    return <Navigate to={dashboard} replace />;
  }

  return <Outlet />;
};