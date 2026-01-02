// src/hooks/useSnackbar.js
import { useState } from 'react';

const useSnackbar = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showSnackbar = (message) => {
    setMessage(message);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return { open, message, showSnackbar, handleClose };
};

export default useSnackbar;