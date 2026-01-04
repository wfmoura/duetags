import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar, Box, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  // Cores personalizadas conforme pedido
  const aquaColor = '#b2dfdb'; // Verde água (Teal 100)
  const darkTeal = '#00695c'; // Teal escuro para links (contraste alto)
  const darkPurple = '#4a148c'; // Roxo escuro para admin

  const navLinkStyle = {
    my: 2,
    color: darkTeal,
    display: 'block',
    fontWeight: 'bold',
    textTransform: 'none',
    fontSize: '1rem',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.08)'
    }
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/acompanhamento-pedidos'); }}>Meus Pedidos</MenuItem>
      {user?.role === 'admin' && [
        <MenuItem key="manage-orders" onClick={() => { handleMenuClose(); navigate('/pedidos'); }}>Gerenciar Pedidos</MenuItem>,
        <MenuItem key="admin-panel" onClick={() => { handleMenuClose(); navigate('/admin'); }}>Painel Admin</MenuItem>
      ]}
      <MenuItem onClick={handleLogout}>Sair</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={() => { navigate('/'); handleMobileMenuClose(); }}>Página Inicial</MenuItem>
      <MenuItem onClick={() => { navigate('/kits'); handleMobileMenuClose(); }}>Catálogo de Kits</MenuItem>
      <MenuItem onClick={() => { navigate('/Customize'); handleMobileMenuClose(); }}>Personalizar</MenuItem>

      {user ? (
        <Box>
          <MenuItem onClick={() => { navigate('/acompanhamento-pedidos'); handleMobileMenuClose(); }}>Meus Pedidos</MenuItem>
          {user?.role === 'admin' && [
            <MenuItem key="mobile-manage-orders" onClick={() => { navigate('/pedidos'); handleMobileMenuClose(); }}>
              <Typography sx={{ fontWeight: 'bold', color: darkTeal }}>Gerenciar Pedidos</Typography>
            </MenuItem>,
            <MenuItem key="mobile-admin-panel" onClick={() => { navigate('/admin'); handleMobileMenuClose(); }}>
              <Typography sx={{ fontWeight: 'bold', color: darkPurple }}>Painel Admin</Typography>
            </MenuItem>
          ]}
          <MenuItem onClick={handleLogout}>Sair</MenuItem>
        </Box>
      ) : (
        <MenuItem onClick={() => { navigate('/login'); handleMobileMenuClose(); }}>Login</MenuItem>
      )}
    </Menu>
  );

  return (
    <AppBar position="static" elevation={2} sx={{ bgcolor: aquaColor }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo Desktop */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 4,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 900,
              color: darkTeal,
              textDecoration: 'none',
              fontSize: '1.6rem',
              letterSpacing: '-0.5px'
            }}
          >
            DueTags
          </Typography>

          {/* Menu Mobile Icon */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              sx={{ color: darkTeal }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo Mobile */}
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 900,
              color: darkTeal,
              textDecoration: 'none'
            }}
          >
            DueTags
          </Typography>

          {/* Menu Desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Button component={Link} to="/" sx={navLinkStyle}>Página Inicial</Button>
            <Button component={Link} to="/kits" sx={navLinkStyle}>Catálogo de Kits</Button>
            <Button component={Link} to="/Customize" sx={navLinkStyle}>Personalizar</Button>
            {user && (
              <Button component={Link} to="/acompanhamento-pedidos" sx={navLinkStyle}>Meus Pedidos</Button>
            )}
            {user?.role === 'admin' && (
              <>
                <Button
                  component={Link}
                  to="/pedidos"
                  sx={{ ...navLinkStyle, color: darkTeal, fontWeight: '900' }}
                >
                  Gestão de Pedidos
                </Button>
                <Button
                  component={Link}
                  to="/admin"
                  sx={{ ...navLinkStyle, color: darkPurple, fontWeight: '900' }}
                >
                  Painel Admin
                </Button>
              </>
            )}
          </Box>

          {/* User Section */}
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" sx={{ display: { xs: 'none', lg: 'block' }, color: darkTeal, fontWeight: 700 }}>
                  Olá, {user.name || user.email}
                </Typography>
                <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 1 }}>
                  <Avatar sx={{ width: 38, height: 38, bgcolor: darkTeal, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    {(user.name || user.email)[0].toUpperCase()}
                  </Avatar>
                </IconButton>
              </Box>
            ) : (
              <Button variant="outlined" component={Link} to="/login" sx={{ color: darkTeal, borderColor: darkTeal, borderRadius: 50, fontWeight: 'bold' }}>
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
      {renderMobileMenu}
      {renderMenu}
    </AppBar>
  );
};

export default Header;
