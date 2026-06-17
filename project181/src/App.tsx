import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Accounts from '@/pages/Accounts'
import Devices from '@/pages/Devices'
import Habits from '@/pages/Habits'
import Incidents from '@/pages/Incidents'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/incidents" element={<Incidents />} />
        </Route>
      </Routes>
    </Router>
  )
}
