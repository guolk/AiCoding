import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import type { Archive, Schedule } from '../../shared/types.js';
import {
  GraduationCap,
  History,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  FileEdit,
  Plus
} from 'lucide-react';

const TABS = [
  { key: 'archives', label: '历史档案', icon: History },
  { key: 'updates', label: '更新记录', icon: FileEdit },
  { key: 'schedule', label: '排班管理', icon: CalendarIcon }
];

export const Archives: React.FC = () => {
  const { archives, schedules, fetchArchives, fetchSchedules, loading } = useStore();
  const [activeTab, setActiveTab] = useState<string>('archives');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchSchedules();
    }
  }, [fetchSchedules, activeTab]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getSchedulesForDate = (date: Date | null): Schedule[] => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(s => s.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthDays = getDaysInMonth(currentMonth);

  const allUpdateRecords = archives.flatMap(archive => 
    archive.updateRecords.map(record => ({
      ...record,
      courseName: archive.courseName,
      semester: archive.semester,
      year: archive.year
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">课程档案</h1>
          <p className="text-sm text-slate-500 mt-1">多学期历史档案、更新记录与实验室排班管理</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'archives' ? '新建档案' : activeTab === 'schedule' ? '添加排班' : '记录更新'}
        </Button>
      </div>

      <div className="flex bg-slate-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          {activeTab === 'archives' && (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-6">
                {archives.map((archive, index) => (
                  <div
                    key={archive.id}
                    className="relative pl-16 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute left-4 w-5 h-5 rounded-full bg-primary-500 border-4 border-white shadow" />
                    <Card hover>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                              <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-slate-900">{archive.courseName}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline">{archive.year} 学年</Badge>
                                <Badge variant="secondary">{archive.semester}</Badge>
                              </div>
                            </div>
                          </div>
                          <Badge variant="success">已归档</Badge>
                        </div>
                        <p className="text-slate-600 mb-4">{archive.summary}</p>
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-3">更新记录 ({archive.updateRecords.length})</h4>
                          <div className="space-y-2">
                            {archive.updateRecords.slice(0, 3).map((record, idx) => (
                              <div key={idx} className="flex items-start space-x-3 text-sm">
                                <span className="text-slate-400 whitespace-nowrap">{record.date}</span>
                                <span className="text-slate-600">{record.content}</span>
                                <span className="text-slate-400 ml-auto">{record.operator}</span>
                              </div>
                            ))}
                            {archive.updateRecords.length > 3 && (
                              <p className="text-xs text-primary-600 cursor-pointer hover:underline">
                                还有 {archive.updateRecords.length - 3} 条记录...
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <Card>
              <CardHeader>
                <CardTitle>实验内容更新记录</CardTitle>
                <p className="text-sm text-slate-500 mt-1">所有实验内容的年度更新历史</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">日期</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">课程名称</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">学期</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">更新内容</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">操作人</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUpdateRecords.map((record, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-slate-600">{record.date}</td>
                          <td className="py-3 px-4 text-sm font-medium text-slate-900">{record.courseName}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{record.year} {record.semester}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{record.content}</td>
                          <td className="py-3 px-4 text-sm text-slate-500">{record.operator}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {allUpdateRecords.length === 0 && (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">暂无更新记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'schedule' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>实验室排班管理</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">实验室使用安排与预约管理</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="text-lg font-medium text-slate-900 min-w-36 text-center">
                      {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                    </span>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map(day => (
                    <div key={day} className="text-center py-2 text-sm font-medium text-slate-500">
                      {day}
                    </div>
                  ))}
                  {monthDays.map((date, index) => {
                    const daySchedules = getSchedulesForDate(date);
                    const hasSchedule = daySchedules.length > 0;
                    return (
                      <div
                        key={index}
                        className={`min-h-24 p-2 rounded-lg border transition-colors ${
                          isToday(date)
                            ? 'border-primary-500 bg-primary-50'
                            : hasSchedule
                            ? 'border-slate-200 bg-slate-50'
                            : 'border-slate-100 hover:border-slate-200'
                        } ${!date ? 'invisible' : ''}`}
                      >
                        {date && (
                          <>
                            <div className={`text-sm font-medium mb-1 ${
                              isToday(date) ? 'text-primary-600' : 'text-slate-700'
                            }`}>
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {daySchedules.slice(0, 2).map((schedule, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs p-1.5 rounded bg-primary-100 text-primary-700 truncate"
                                  title={`${schedule.timeSlot} ${schedule.courseName} ${schedule.labName} ${schedule.className}`}
                                >
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{schedule.timeSlot}</span>
                                  </div>
                                  <div className="truncate">{schedule.courseName}</div>
                                </div>
                              ))}
                              {daySchedules.length > 2 && (
                                <div className="text-xs text-slate-500 text-center">
                                  +{daySchedules.length - 2} 更多
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-4">今日实验安排</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getSchedulesForDate(new Date()).map((schedule, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-primary-600" />
                          <span className="font-medium text-slate-900">{schedule.timeSlot}</span>
                        </div>
                        <h5 className="font-semibold text-slate-900 mb-1">{schedule.courseName}</h5>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{schedule.labName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-3.5 h-3.5" />
                            <span>{schedule.className}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {getSchedulesForDate(new Date()).length === 0 && (
                      <div className="col-span-full text-center py-8 text-slate-500">
                        今日暂无实验安排
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
