import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Visits from '@/pages/Visits';
import VisitDetail from '@/pages/VisitDetail';
import Exhibitions from '@/pages/Exhibitions';
import Notes from '@/pages/Notes';
import Wishlist from '@/pages/Wishlist';
import Statistics from '@/pages/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/visits" element={<Visits />} />
          <Route path="/visits/:id" element={<VisitDetail />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
