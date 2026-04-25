import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MathFormulas from './pages/MathFormulas'
import PhysicsFormulas from './pages/PhysicsFormulas'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/math" element={<MathFormulas />} />
          <Route path="/physics" element={<PhysicsFormulas />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
