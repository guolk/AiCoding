import { useState } from 'react';
import { Pill, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils';
import MedicationList from './MedicationList';
import AdherenceTracker from './AdherenceTracker';
import SideEffectRecords from './SideEffectRecords';

type TabKey = 'list' | 'adherence' | 'side-effects';

const tabs = [
  { key: 'list' as TabKey, label: '用药列表', icon: Pill },
  { key: 'adherence' as TabKey, label: '依从性追踪', icon: ClipboardCheck },
  { key: 'side-effects' as TabKey, label: '副作用记录', icon: AlertTriangle },
];

export default function MedicationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('list');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">用药管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理您的用药记录、依从性追踪和副作用记录</p>
        </div>

        <div className="mb-6">
          <div className="inline-flex rounded-xl bg-gray-100 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {activeTab === 'list' && <MedicationList />}
          {activeTab === 'adherence' && <AdherenceTracker />}
          {activeTab === 'side-effects' && <SideEffectRecords />}
        </div>
      </div>
    </div>
  );
}
