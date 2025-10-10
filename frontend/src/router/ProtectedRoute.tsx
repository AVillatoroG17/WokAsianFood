import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

type Role = 'ADMIN' | 'MESERO' | 'COCINERO' | 'ENCARGADO';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // LA SOLUCIÓN DEFINITIVA: Usar .trim() para eliminar espacios en blanco invisibles.
  if (allowedRoles && user && !allowedRoles.includes(user.rol.trim() as Role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;