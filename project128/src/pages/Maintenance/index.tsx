
import { useState } from 'react';
import { Wrench, Droplets, AlertTriangle, BookOpen, Clock, Calendar, Sparkles } from 'lucide-react';
import useJewelryStore from '../../store/jewelryStore';
import { materialCareData } from '../../data/mockData';
import { formatDate, getMaintenanceTypeLabel, getDaysUntil } from '../../utils/format';

const MaintenancePage = () => {
  const { jewelries, maintenances, repairs, getJewelryById } = useJewelryStore();
  const [activeTab, setActiveTab] = useState('history');

  const tabs = [
    { id: 'history', label: '保养记录', icon: Clock },
    { id: 'repair', label: '维修记录', icon: Wrench },
    { id: 'care', label: '保养知识', icon: BookOpen },
  ];

  const upcomingReminders = maintenances
    .filter((m) => m.nextReminderDate)
    .map((m) => {
      const jewelry = getJewelryById(m.jewelryId);
      return { ...m, jewelryName: jewelry?.name || '未知珠宝' };
    })
    .sort((a, b) => new Date(a.nextReminderDate!).getTime() - new Date(b.nextReminderDate!).getTime());

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-600">维护保养</h1>
        <p className="text-ink-400 mt-1">记录保养维修，获取专业保养建议</p>
      </div>

      <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold">保养提醒</h3>
            <p className="text-white/80">您有 {upcomingReminders.length} 件珠宝需要保养</p>
          </div>
        </div>
        {upcomingReminders.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {upcomingReminders.slice(0, 3).map((reminder) => (
              <div key={reminder.id} className="bg-white/10 rounded-xl p-4">
                <p className="font-medium">{reminder.jewelryName}</p>
                <p className="text-sm text-white/70">
                  {getDaysUntil(reminder.nextReminderDate!) > 0
                    ? `${getDaysUntil(reminder.nextReminderDate!)} 天后`
                    : '已到期'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gold-100 overflow-hidden">
        <div className="flex border-b border-gold-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gold-500 text-gold-600'
                  : 'border-transparent text-ink-400 hover:text-ink-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'history' && (
            <div className="space-y-4">
              {maintenances.length === 0 ? (
                <div className="text-center py-12 text-ink-400">
                  <Droplets className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>暂无保养记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenances
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((maintenance) => {
                      const jewelry = getJewelryById(maintenance.jewelryId);
                      return (
                        <div
                          key={maintenance.id}
                          className="flex items-center justify-between p-5 bg-cream-50 rounded-xl"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-gold-600" />
                            </div>
                            <div>
                              <p className="font-medium text-ink-600">{jewelry?.name}</p>
                              <p className="text-sm text-ink-400">
                                {getMaintenanceTypeLabel(maintenance.type)} · {maintenance.method}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-ink-600">{formatDate(maintenance.date)}</p>
                            {maintenance.nextReminderDate && (
                              <p className="text-sm text-gold-600">
                                下次保养: {formatDate(maintenance.nextReminderDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'repair' && (
            <div className="space-y-4">
              {repairs.length === 0 ? (
                <div className="text-center py-12 text-ink-400">
                  <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>暂无维修记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {repairs
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((repair) => {
                      const jewelry = getJewelryById(repair.jewelryId);
                      return (
                        <div
                          key={repair.id}
                          className="flex items-center justify-between p-5 bg-cream-50 rounded-xl"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-ruby-100 flex items-center justify-center">
                              <Wrench className="w-6 h-6 text-ruby-500" />
                            </div>
                            <div>
                              <p className="font-medium text-ink-600">{jewelry?.name}</p>
                              <p className="text-sm text-ink-400">{repair.description}</p>
                              <p className="text-xs text-ink-400 mt-1">{repair.notes}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gold-600">¥{repair.cost}</p>
                            <p className="text-sm text-ink-400">{formatDate(repair.date)}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'care' && (
            <div className="grid grid-cols-2 gap-6">
              {materialCareData.map((care) => (
                <div
                  key={care.material}
                  className="p-6 bg-gradient-to-br from-cream-50 to-white rounded-xl border border-gold-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink-600">{care.material}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-ink-400 mb-2">清洁频率</p>
                    <p className="font-medium text-ink-600">{care.cleaningFrequency}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-ink-400 mb-2">保养要点</p>
                    <ul className="space-y-1">
                      {care.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-ink-600 flex items-start gap-2">
                          <span className="text-gold-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-ruby-50 rounded-lg border border-ruby-200">
                    <p className="text-sm text-ruby-600 font-medium">⚠️ 注意事项</p>
                    <p className="text-sm text-ruby-500 mt-1">{care.warning}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
