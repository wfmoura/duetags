import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';
import theme from './theme';
import Theme from './pages/Theme';
import Customize from './pages/Customize';
import Pedidos from './pages/Pedidos';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Chatbot from './components/Chatbot';
import PrintPage from './pages/admin/PrintPage';
import Cart from './pages/Cart';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CatalogoKits from './pages/CatalogoKits';
import AcompanhamentoPedidos from './pages/AcompanhamentoPedidos';
import OrderPage from './pages/OrderPage';
import { AppContext } from './contexts/AppContext';

import { SnackbarProvider } from 'notistack';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <AppProvider>
                <Router>
                  <Header />
                  <AppRoutes />
                  <Chatbot />
                </Router>
              </AppProvider>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}


import { useAuth } from './contexts/AuthContext';


const AppRoutes = () => {
  const { user } = useAuth();
  const isAdmin = user && user.role === "admin";

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/theme" element={<Theme />} />
      <Route path="/Customize" element={<Customize />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/kits" element={<CatalogoKits />} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/pedidos" element={isAdmin ? <Pedidos /> : <Box p={4} textAlign="center"><Typography variant="h5">Acesso Restrito</Typography><Button href="/" sx={{ mt: 2 }}>Voltar para Home</Button></Box>} />
      <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Box p={4} textAlign="center"><Typography variant="h5">Acesso Restrito</Typography><Button href="/" sx={{ mt: 2 }}>Voltar para Home</Button></Box>} />
      <Route path="/order/:orderId" element={<OrderPage />} />
      <Route path="/print/:orderId" element={<ProtectedRoute><PrintPage /></ProtectedRoute>} />
      <Route path="/acompanhamento-pedidos" element={<AcompanhamentoPedidos />} />
      <Route path="*" element={<div>Página não encontrada (404)</div>} />
    </Routes>
  );
};

export default App;