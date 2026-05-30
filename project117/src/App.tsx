import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Collection from '@/pages/Collection';
import GameDetail from '@/pages/GameDetail';
import GameForm from '@/pages/GameForm';
import Plays from '@/pages/Plays';
import PlayForm from '@/pages/PlayForm';
import Rules from '@/pages/Rules';
import Recommend from '@/pages/Recommend';
import Expansions from '@/pages/Expansions';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path="collection" element={<Collection />} />
          <Route path="collection/add" element={<GameForm />} />
          <Route path="collection/:id" element={<GameDetail />} />
          <Route path="plays" element={<Plays />} />
          <Route path="plays/add" element={<PlayForm />} />
          <Route path="rules" element={<Rules />} />
          <Route path="recommend" element={<Recommend />} />
          <Route path="expansions" element={<Expansions />} />
        </Route>
      </Routes>
    </Router>
  );
}
