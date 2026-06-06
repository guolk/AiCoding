import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Ship, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store';
import { formatDate, getPlanStatus } from '../../utils';

import type { VoyagePlan } from '../../types';

type TabType = 'all' | 'in-progress' | 'planned' | 'completed' | 'draft';

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: '所有计划' },
  { key: 'in-progress', label: '进行中' },
  { key: 'planned', label: '已计划' },
  { key: 'completed', label: '已完成' },
  { key: 'draft', label: '草稿' },
];

function calculateProgress(plan: VoyagePlan): number {
  if (plan.status !== 'in-progress') return 0;
  const total = plan.waypoints.length;
  if (total <= 1) return 50;
  const elapsed = Date.now() - new Date(plan.startDate).getTime();
  const totalDuration = new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime();
  if (totalDuration <= 0) return 100;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  return Math.round(progress);
}

function PlanCard({ plan, onClick }: { plan: VoyagePlan; onClick: () => void }) {
  const getBoatById = useAppStore((state) => state.getBoatById);
  const boat = getBoatById(plan.boatId);
  const status = getPlanStatus(plan.status);
  const progress = calculateProgress(plan);

  return (
    <div
      className="card p-6 cursor-pointer hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-display text-xl font-bold text-ocean-800 mb-2">
            {plan.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
            </span>
            {boat && (
              <span className="flex items-center gap-1">
                <Ship className="w-4 h-4" />
                {boat.name}
              </span>
            )}
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-ocean-500" />
          <span>{plan.waypoints.length} 个途经点</span>
        </div>
        {plan.status === 'in-progress' && (
          <div className="flex items-center gap-1 text-sm text-nautical-600">
            <Clock className="w-4 h-4" />
            <span>{progress}% 完成</span>
          </div>
        )}
      </div>

      {plan.status === 'in-progress' && (
        <div className="mb-4">
          <div className="h-2 bg-ocean-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0B3D91 0%, #FF6B35 100%)',
              }}
            />
          </div>
        </div>
      )}

      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
        {plan.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-ocean-100">
        <div className="flex -space-x-2">
          {plan.waypoints.slice(0, 3).map((wp) => (
            <div
              key={wp.id}
              className="w-8 h-8 rounded-full bg-ocean-100 border-2 border-white flex items-center justify-center text-xs text-ocean-600 font-medium"
              title={wp.name}
            >
              {wp.name.charAt(0)}
            </div>
          ))}
          {plan.waypoints.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
              +{plan.waypoints.length - 3}
            </div>
          )}
        </div>
        <span className="flex items-center gap-1 text-ocean-600 text-sm font-medium">
          查看详情
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}

export default function PlanList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const voyagePlans = useAppStore((state) => state.voyagePlans);

  const filteredPlans = voyagePlans.filter((plan) => {
    if (activeTab === 'all') return true;
    return plan.status === activeTab;
  });

  const tabCounts = tabs.reduce((acc, tab) => {
    acc[tab.key] =
      tab.key === 'all'
        ? voyagePlans.length
        : voyagePlans.filter((p) => p.status === tab.key).length;
    return acc;
  }, {} as Record<TabType, number>);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ocean-800 mb-2">
            航行计划
          </h1>
          <p className="text-gray-600">管理您的航行计划，规划完美的航海之旅</p>
        </div>
        <button
          className="btn-accent flex items-center gap-2"
          onClick={() => navigate('/plans/new')}
        >
          <Plus className="w-5 h-5" />
          新增计划
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-ocean-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-ocean-50 border border-ocean-200'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-ocean-100 text-ocean-600'
              }`}
            >
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {filteredPlans.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 text-ocean-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="font-display text-xl font-bold text-ocean-800 mb-2">
            暂无航行计划
          </h3>
          <p className="text-gray-600 mb-6">
            开始规划您的第一次航行吧
          </p>
          <button
            className="btn-primary inline-flex items-center gap-2"
            onClick={() => navigate('/plans/new')}
          >
            <Plus className="w-5 h-5" />
            创建第一个计划
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onClick={() => navigate(`/plans/${plan.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
