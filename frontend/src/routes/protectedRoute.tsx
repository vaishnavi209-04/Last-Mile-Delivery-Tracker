// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/models';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role.toUpperCase() as Role)) {
    // Redirect to their respective dashboard if they try to access another role's page
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }

  return <Outlet />;
};