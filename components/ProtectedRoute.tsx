import React from 'react';
import { Navigate } from 'react-router-dom';
import { AdminUser } from '../types';

interface ProtectedRouteProps {
  admin: AdminUser | null;
  loading: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ admin, loading, children }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm font-medium">
        Checking admin access...
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
