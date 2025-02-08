import axios from 'axios';

const api = axios.create({
  console.log(`[DEBUG] -api.js- User authenticated: ${req.user.email}`);
  baseURL: 'http://localhost:3001/api', // URL do backend
  withCredentials: true, // Permite o envio de cookies

});

export default api;