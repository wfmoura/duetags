import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './contexts/AppContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Theme from './pages/Theme';
import Customize from './pages/Customize';
import CheckoutPayment from './pages/CheckoutPayment';
import Pedidos from './pages/Pedidos';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Chatbot from './components/Chatbot';
import Cart from './pages/Cart';
import ProtectedRoute from './components/ProtectedRoute';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import HomePage from './pages/HomePage';
import CatalogoKits from './pages/CatalogoKits';
import Confirmation from "./pages/Confirmation";


const App = () => {
  const { user } = useContext(AppContext);
  const isAdmin = user && user.role === 'admin';

  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <Router>
          <AppBar position="static">
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                DueTags
              </Typography>
              <Link to="/"><Button color="inherit">Página Inicial</Button></Link>
              <Link to="/kits"><Button color="inherit">Catálogo de Kits</Button></Link>
              <Link to="/Customize"><Button color="inherit">Personalizar</Button></Link>
              <Link to="/login"><Button color="inherit">Login</Button></Link>
              {isAdmin && <Link to="/pedidos"><Button color="inherit">Pedidos</Button></Link>} {/* Link para Pedidos */}
            </Toolbar>
          </AppBar>

          <Routes>
            {/*... outras rotas... */}
            <Route path="/pedidos" element={isAdmin? <Pedidos />: <Navigate to="/" />} />

          </Routes>

          <Chatbot />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;