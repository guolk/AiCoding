import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ActivityList from './pages/activities/ActivityList';
import ActivityDetail from './pages/activities/ActivityDetail';
import ActivityForm from './pages/activities/ActivityForm';
import VolunteerList from './pages/volunteers/VolunteerList';
import VolunteerDetail from './pages/volunteers/VolunteerDetail';
import VolunteerForm from './pages/volunteers/VolunteerForm';
import ReviewList from './pages/reviews/ReviewList';
import ReviewDetail from './pages/reviews/ReviewDetail';
import OrganizationPage from './pages/organization/OrganizationPage';
import ServiceDemandList from './pages/demands/ServiceDemandList';
import ServiceDemandDetail from './pages/demands/ServiceDemandDetail';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/activities" element={<ActivityList />} />
        <Route path="/activities/new" element={<ActivityForm />} />
        <Route path="/activities/:id" element={<ActivityDetail />} />
        <Route path="/activities/:id/edit" element={<ActivityForm />} />
        <Route path="/volunteers" element={<VolunteerList />} />
        <Route path="/volunteers/new" element={<VolunteerForm />} />
        <Route path="/volunteers/:id" element={<VolunteerDetail />} />
        <Route path="/volunteers/:id/edit" element={<VolunteerForm />} />
        <Route path="/reviews" element={<ReviewList />} />
        <Route path="/reviews/:id" element={<ReviewDetail />} />
        <Route path="/organization" element={<OrganizationPage />} />
        <Route path="/demands" element={<ServiceDemandList />} />
        <Route path="/demands/:id" element={<ServiceDemandDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;
