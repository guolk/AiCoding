import { Outlet, useLocation, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { useStore } from '../store/useStore';

export default function MainLayout() {
  const { currentUser, setCurrentUser } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar currentPath={location.pathname} onNavigate={handleNavigate} />
      <main className="ml-64">
        <Header onLogout={handleLogout} />
        <div className="p-6">
          <Outlet context={{ params, navigate }} />
        </div>
      </main>
      <Toast />
    </div>
  );
}
