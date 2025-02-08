// Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
      <nav>
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0 }}>
          <li style={{ marginRight: '10px' }}>
            <Link to="/">Home</Link>
          </li>
          <li style={{ marginRight: '10px' }}>
            <Link to="/about">Sobre</Link>
          </li>
          <li>
            <Link to="/contact">Contato</Link>
          </li>
        </ul>
      </nav>
      <h1>Meu Site</h1>
    </header>
  );
}

export default Header;

