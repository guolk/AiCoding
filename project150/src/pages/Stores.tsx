import { useState } from 'react';
import { Header } from '@/components/Header';
import { DataEntry } from './Stores/DataEntry';
import { Analysis } from './Stores/Analysis';

type TabType = 'dataEntry' | 'analysis';

const tabs: { id: TabType; label: string }[] = [
  { id: 'dataEntry', label: '数据录入' },
  { id: 'analysis', label: '平台分析' },
];

export default function Stores() {
  const [activeTab, setActiveTab] = useState<TabType>('dataEntry');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header title="店铺管理" subtitle="多平台店铺数据录入与分析" />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-700 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-fadeIn">
          {activeTab === 'dataEntry' && <DataEntry />}
          {activeTab === 'analysis' && <Analysis />}
        </div>
      </div>
    </div>
  );
}
