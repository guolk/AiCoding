import { useState } from 'react';
import { PlusCircle, BarChart3, History } from 'lucide-react';
import { cn } from '@/utils';
import BloodPressureForm from './BloodPressureForm';
import BloodPressureStats from './BloodPressureStats';
import BloodPressureHistory from './BloodPressureHistory';

type TabKey = 'form' | 'stats' | 'history';

const tabs: { key: TabKey; label: string; icon: typeof PlusCircle }[] = [
  { key: 'form', label: '数据录入', icon: PlusCircle },
  { key: 'stats', label: '统计分析', icon: BarChart3 },
  { key: 'history', label: '历史记录', icon: History },
];

export default function BloodPressurePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('form');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">血压监测</h1>
          <p className="text-red-100 mt-1">记录和追踪您的血压变化</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-b-xl shadow-sm">
          <div className="flex border-b">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-4 px-2 text-sm font-medium transition-colors relative',
                  activeTab === key
                    ? 'text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {activeTab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'form' && <BloodPressureForm />}
            {activeTab === 'stats' && <BloodPressureStats />}
            {activeTab === 'history' && <BloodPressureHistory />}
          </div>
        </div>
      </div>
    </div>
  );
}
