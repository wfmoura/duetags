import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Theme from './pages/Theme';
import Customize from './pages/Customize';
import Checkout from './pages/Checkout';
import Pedidos from './pages/Pedidos';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Componente para proteger rotas privadas
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user'); // Verifica se o usuário está logado

  // Se o usuário estiver autenticado, permite o acesso à rota protegida
  // Caso contrário, redireciona para a página de login
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <Router>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} /> {/* Página de login */}
            <Route path="/register" element={<Register />} /> {/* Página de registro */}
            <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Página de recuperação de senha */}

            {/* Redirecionamento da rota raiz para /customize ou /login */}
            <Route
              path="/"
              element={
                localStorage.getItem('user') ? (
                  <Navigate to="/customize" /> // Redireciona para /customize se autenticado
                ) : (
                  <Navigate to="/login" /> // Redireciona para /login se não autenticado
                )
              }
            />

            {/* Rotas protegidas (acessíveis apenas com autenticação) */}
            <Route
              path="/theme"
              element={
                <ProtectedRoute>
                  <Theme />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customize"
              element={
                <ProtectedRoute>
                  <Customize />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pedidos"
              element={
                <ProtectedRoute>
                  <Pedidos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />            

            {/* Redirecionamento para login caso a rota não seja encontrada */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;