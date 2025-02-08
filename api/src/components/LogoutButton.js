import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout'); // Chama a rota de logout no backend
      localStorage.removeItem('user'); // Remove o usuário do localStorage
      navigate('/login'); // Redireciona para a página de login
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Button variant="contained" onClick={handleLogout}>
      Sair
    </Button>
  );
}

export default LogoutButton;