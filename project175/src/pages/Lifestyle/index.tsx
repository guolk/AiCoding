import { useState } from 'react';
import { Droplets, Dumbbell, Scale, Heart } from 'lucide-react';
import { cn } from '@/utils';
import SaltIntakeTracker from './SaltIntakeTracker';
import ExerciseTracker from './ExerciseTracker';
import BodyMeasurementTracker from './BodyMeasurementTracker';

type TabKey = 'salt' | 'exercise' | 'body';

const tabs = [
  { key: 'salt' as TabKey, label: '盐摄入', icon: Droplets, color: 'from-blue-500 to-cyan-600' },
  { key: 'exercise' as TabKey, label: '运动追踪', icon: Dumbbell, color: 'from-orange-500 to-red-500' },
  { key: 'body' as TabKey, label: '体重围度', icon: Scale, color: 'from-purple-500 to-indigo-600' },
];

export default function LifestylePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('exercise');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">生活方式管理</h1>
            <p className="text-emerald-100 mt-1">记录饮食、运动和身体变化，养成健康习惯</p>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-1.5 border border-white/50 shadow-lg shadow-slate-200/50 inline-flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === 'salt' && <SaltIntakeTracker />}
        {activeTab === 'exercise' && <ExerciseTracker />}
        {activeTab === 'body' && <BodyMeasurementTracker />}
      </div>
    </div>
  );
}
