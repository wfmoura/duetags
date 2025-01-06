import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Se usar roteamento
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Header from './components/Header'; // Importa o Header
import Footer from './components/Footer'; // Importa o Footer

function App() {
  return (
    <Router> {/* Envolve com Router se usar roteamento */}
      <div className="App">
        <Header /> {/* Renderiza o Header no topo */}
        <main> {/* Elemento main para o conteúdo principal */}
          <Routes> {/* Define as rotas se usar roteamento */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer /> {/* Renderiza o Footer no rodapé */}
      </div>
    </Router>
  );
}

export default App;