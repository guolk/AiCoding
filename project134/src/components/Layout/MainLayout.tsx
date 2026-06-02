import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useResourceStore } from '../../store/useResourceStore';
import { useActivityStore } from '../../store/useActivityStore';
import { useDataRoomStore } from '../../store/useDataRoomStore';

export default function MainLayout() {
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const loadResources = useResourceStore((s) => s.loadResources);
  const loadActivities = useActivityStore((s) => s.loadActivities);
  const loadDataRoomItems = useDataRoomStore((s) => s.loadDataRoomItems);

  useEffect(() => {
    loadProjects();
    loadResources();
    loadActivities();
    loadDataRoomItems();
  }, [loadProjects, loadResources, loadActivities, loadDataRoomItems]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 animate-fadeIn">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
