import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';

/** Sends signed-in users away from login / sign-up screens. */
export function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
