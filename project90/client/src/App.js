import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Printer, Package, Settings, Layers, DollarSign, Home } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Filaments from './pages/Filaments';
import Printers from './pages/Printers';
import PrinterDetail from './pages/PrinterDetail';
import Profiles from './pages/Profiles';
import Costs from './pages/Costs';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-2">
                <Printer className="w-8 h-8" />
                <span className="font-bold text-xl">3D Print Manager</span>
              </Link>
              <div className="flex space-x-1">
                <NavLink to="/" icon={<Home className="w-5 h-5" />} label="仪表盘" />
                <NavLink to="/projects" icon={<Package className="w-5 h-5" />} label="打印项目" />
                <NavLink to="/filaments" icon={<Layers className="w-5 h-5" />} label="耗材管理" />
                <NavLink to="/printers" icon={<Printer className="w-5 h-5" />} label="打印机" />
                <NavLink to="/profiles" icon={<Settings className="w-5 h-5" />} label="切片参数" />
                <NavLink to="/costs" icon={<DollarSign className="w-5 h-5" />} label="成本核算" />
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/filaments" element={<Filaments />} />
            <Route path="/printers" element={<Printers />} />
            <Route path="/printers/:id" element={<PrinterDetail />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/costs" element={<Costs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default App;