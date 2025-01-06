import React from 'react';
import { Link } from 'react-router-dom'; // Se você usar roteamento

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link> {/* Links de navegação, se usar roteamento */}
          </li>
          <li>
            <Link to="/about">Sobre</Link>
          </li>
          <li>
            <Link to="/contact">Contato</Link>
          </li>
        </ul>
      </nav>
      {/* Outros elementos do cabeçalho, como logo, etc. */}
      <h1>Meu Site</h1>
    </header>
  );
}

export default Header;