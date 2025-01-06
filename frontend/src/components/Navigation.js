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

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box mt={4} display="flex" justifyContent="center" gap={2}>
      {prevRoute && (
        <Button variant="contained" onClick={() => navigate(prevRoute)}>
          Voltar
        </Button>
      )}
      {nextRoute && (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={disabled}
            sx={{ backgroundColor: disabled ? '#ccc' : '#4CAF50' }}
          >
            Próximo
          </Button>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
          >
            <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: '100%' }}>
              {message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
}

export default Navigation;