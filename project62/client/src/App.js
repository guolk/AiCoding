import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Papers from './pages/Papers';
import PDFReader from './pages/PDFReader';
import Annotations from './pages/Annotations';
import Stats from './pages/Stats';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Papers />} />
          <Route path="/reader/:id" element={<PDFReader />} />
          <Route path="/annotations" element={<Annotations />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
