import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { MemberList } from '@/pages/Members/MemberList';
import { MemberForm } from '@/pages/Members/MemberForm';
import { CardList } from '@/pages/Cards/CardList';
import { CardConfig } from '@/pages/Cards/CardConfig';
import { CheckinList } from '@/pages/Checkin/CheckinList';
import { CheckinAnalysis } from '@/pages/Checkin/CheckinAnalysis';
import { CheckinWarning } from '@/pages/Checkin/CheckinWarning';
import { Marketing } from '@/pages/Marketing/Marketing';
import { Reports } from '@/pages/Reports/Reports';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<MemberList />} />
          <Route path="/members/new" element={<MemberForm key="new" />} />
          <Route path="/members/:id" element={<MemberForm key="edit" />} />
          <Route path="/cards" element={<CardList />} />
          <Route path="/cards/config" element={<CardConfig />} />
          <Route path="/checkin" element={<CheckinList />} />
          <Route path="/checkin/analysis" element={<CheckinAnalysis />} />
          <Route path="/checkin/warning" element={<CheckinWarning />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}
