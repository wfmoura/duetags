import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AppContext'; // Certifique-se do caminho correto

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Obtém o estado do usuário do contexto
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
