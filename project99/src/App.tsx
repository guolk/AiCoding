import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { FamilyTree } from './pages/FamilyTree';
import { History } from './pages/History';
import { Stories } from './pages/Stories';
import { Research } from './pages/Research';
import { Share } from './pages/Share';
import { AppProvider } from './context/AppContext';
import './index.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-warm-beige">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/family-tree" element={<FamilyTree />} />
              <Route path="/history" element={<History />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/research" element={<Research />} />
              <Route path="/share" element={<Share />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
