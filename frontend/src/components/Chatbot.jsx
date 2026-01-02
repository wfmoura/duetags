import React from 'react';
import { Box, IconButton } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

function Chatbot() {
  const handleClick = () => {
    window.open('https://wa.me/61984', '_blank');
  };

  return (
    <Box position="fixed" bottom={16} right={16}>
      <IconButton
        color="primary"
        aria-label="chat via WhatsApp"
        onClick={handleClick}
        sx={{
          backgroundColor: '#25D366',
          '&:hover': {
            backgroundColor: '#128C7E',
          },
        }}
      >
        <WhatsAppIcon sx={{ color: 'white' }} />
      </IconButton>
    </Box>
  );
}

export default Chatbot;