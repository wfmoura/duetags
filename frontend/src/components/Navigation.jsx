import React from 'react';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Navigation({ nextRoute, prevRoute, disabled, message }) {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const handleNext = () => {
    if (disabled) {
      setOpenSnackbar(true);
    } else {
      navigate(nextRoute);
    }
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      <Button variant="contained" onClick={() => navigate(prevRoute)}>
        Voltar
      </Button>
      <Button variant="contained" color="primary" onClick={handleNext}>
        Próximo
      </Button>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Navigation;