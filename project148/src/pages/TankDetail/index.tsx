import { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink, Outlet } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Droplets,
  Leaf,
  Wrench,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatusBadge } from '@/components/StatusBadge';
import { getDaysSince } from '@/utils/helpers';

export default function TankDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const { aquariums, anomalies } = useStore();
  const tank = aquariums.find((a) => a.id === id);

  useEffect(() => {
    if (tank === undefined && id) {
      const timer = setTimeout(() => {
        const currentTank = aquariums.find((a) => a.id === id);
        if (!currentTank) {
          navigate('/tanks');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [tank, id, aquariums, navigate]);

  if (!tank) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    );
  }

  const activeAnomalies = anomalies.filter(
    (a) => a.tankId === id && a.status !== 'resolved'
  ).length;

  const tabs = [
    { id: 'profile', label: '水族箱档案', icon: FileText, path: '' },
    { id: 'water', label: '水质监测', icon: Droplets, path: 'water' },
    { id: 'life', label: '生物管理', icon: Leaf, path: 'life' },
    { id: 'maintenance', label: '日常维护', icon: Wrench, path: 'maintenance' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
          <img
            src={tank.coverImage}
            alt={tank.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white font-serif mb-2">
                  {tank.name}
                </h1>
                <div className="flex items-center gap-3">
                  <StatusBadge status={tank.status} />
                  <span className="text-white/70 text-sm">
                    运行 {getDaysSince(tank.setupDate)} 天
                  </span>
                  {activeAnomalies > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-coral-500/90 text-white text-sm font-medium animate-pulse-soft">
                      <AlertTriangle className="w-4 h-4" />
                      {activeAnomalies} 项待处理
                    </span>
                  )}
                </div>
              </div>
              <button className="p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <NavLink
                key={tab.id}
                to={tab.path}
                end={tab.path === ''}
                onClick={() => setActiveTab(tab.id)}
                className={({ isActive }) =>
                  `flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-aqua-500 to-reef-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
