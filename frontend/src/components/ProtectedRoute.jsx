import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { homeFor } from "../lib/status";

/** Signed-in users only; honours the return path stored on the location. */
export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    allowedRoles &&
    user?.role &&
    !allowedRoles.includes(user.role) &&
    user.role !== "admin"
  ) {
    return <Navigate to={homeFor(user)} replace />;
  }

  return <Outlet />;
}

/** Login/register only — bounce signed-in users to their workspace. */
export function GuestRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={homeFor(user)} replace />;
  }

  return <Outlet />;
}
