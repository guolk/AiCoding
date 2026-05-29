import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar, Header } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Materials } from './pages/Materials';
import { MaterialDetail } from './pages/MaterialDetail';
import { Dictation } from './pages/Dictation';
import { Analysis } from './pages/Analysis';
import { Speaking } from './pages/Speaking';
import { Progress } from './pages/Progress';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC] flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/materials/:id" element={<MaterialDetail />} />
              <Route path="/dictation/:id" element={<Dictation />} />
              <Route path="/analysis/:id" element={<Analysis />} />
              <Route path="/speaking/:id" element={<Speaking />} />
              <Route path="/progress" element={<Progress />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
