import React from 'react';
import { createRoot } from 'react-dom/client'; // Importe createRoot
import App from './App';
import { CssBaseline } from '@mui/material';

// Seleciona o elemento raiz do DOM
const container = document.getElementById('root');

// Cria uma raiz React
const root = createRoot(container);

// Renderiza o aplicativo
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);