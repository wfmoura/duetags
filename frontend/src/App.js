import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Home from './pages/Home';
import Theme from './pages/Theme';
import Customize from './pages/Customize';
import Checkout from './pages/Checkout';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/theme" element={<Theme />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;