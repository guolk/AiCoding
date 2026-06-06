import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CustomerList, CustomerDetail } from './pages/Customers';
import { MenuBuilder } from './pages/MenuBuilder';
import { PreparationList, PreparationDetail } from './pages/Preparation';
import { ReviewList, ReviewDetail } from './pages/Review';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="animate-fade-in" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/menus" element={<MenuBuilder />} />
        <Route path="/preparation" element={<PreparationList />} />
        <Route path="/preparation/:id" element={<PreparationDetail />} />
        <Route path="/review" element={<ReviewList />} />
        <Route path="/review/:id" element={<ReviewDetail />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
