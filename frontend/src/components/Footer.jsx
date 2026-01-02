// Footer.jsx
import React from 'react';

function Footer() {
  return (
    <footer style={{ padding: '10px', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
      <p>&copy; {new Date().getFullYear()} Meu Site. Todos os direitos reservados.</p>
    </footer>
  );
}

export default Footer;