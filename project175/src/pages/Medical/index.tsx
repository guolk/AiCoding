import { useState } from 'react';
import { Calendar, Stethoscope, FileText, Heart } from 'lucide-react';
import { cn } from '@/utils';
import AppointmentReminder from './AppointmentReminder';
import VisitRecords from './VisitRecords';
import ExamReports from './ExamReports';

type TabKey = 'appointments' | 'visits' | 'exams';

const tabs = [
  { key: 'appointments' as TabKey, label: '复诊提醒', icon: Calendar, color: 'from-amber-500 to-orange-500' },
  { key: 'visits' as TabKey, label: '就诊记录', icon: Stethoscope, color: 'from-blue-500 to-indigo-600' },
  { key: 'exams' as TabKey, label: '检查报告', icon: FileText, color: 'from-violet-500 to-purple-600' },
];

export default function MedicalPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('appointments');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">就医管理</h1>
            <p className="text-rose-100 mt-1">记录复诊、就诊和检查报告，全面管理您的健康档案</p>
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
        {activeTab === 'appointments' && <AppointmentReminder />}
        {activeTab === 'visits' && <VisitRecords />}
        {activeTab === 'exams' && <ExamReports />}
      </div>
    </div>
  );
}
