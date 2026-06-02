import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { StatusBadge } from '@/components/ui/Badge.js';
import { Button } from '@/components/ui/Button.js';
import {
  FileText,
  ClipboardList,
  Clock,
  Calendar,
  ChevronRight,
  Plus,
  Edit3,
  TrendingUp
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardStats, fetchDashboardStats, loading } = useStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const stats = dashboardStats;

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: '实验模板',
      value: stats?.totalTemplates || 0,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      action: () => navigate('/templates')
    },
    {
      title: '报告总数',
      value: stats?.totalReports || 0,
      icon: ClipboardList,
      gradient: 'from-teal-500 to-teal-600',
      action: () => navigate('/reports')
    },
    {
      title: '待批改',
      value: stats?.ungradedReports || 0,
      icon: Clock,
      gradient: 'from-orange-500 to-orange-600',
      action: () => navigate('/reports?status=ungraded')
    },
    {
      title: '今日实验',
      value: stats?.todaySchedules || 0,
      icon: Calendar,
      gradient: 'from-primary-500 to-primary-600',
      action: () => navigate('/archives')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">仪表盘</h1>
          <p className="text-sm text-slate-500 mt-1">欢迎回来，查看实验教学管理概览</p>
        </div>
        <Button onClick={() => navigate('/templates/new')}>
          <Plus className="w-4 h-4 mr-2" />
          新建实验模板
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card 
            key={card.title}
            hover
            onClick={card.action}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{card.title}</p>
                  <p className="font-display text-3xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>最近提交的报告</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              查看全部 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentReports.map((report, index) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/reports/${report.id}`)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-medium text-sm">
                        {report.studentName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{report.studentName}</p>
                      <p className="text-xs text-slate-500">{report.templateName} · {report.className}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusBadge status={report.status} />
                    <span className="text-xs text-slate-400">
                      {new Date(report.submittedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              ))}
              {(!stats?.recentReports || stats.recentReports.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  暂无报告提交
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>今日实验安排</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.todayScheduleList.map((schedule, index) => (
                  <div
                    key={schedule.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-100"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-4 h-4 text-primary-500" />
                      <span className="text-sm font-medium text-slate-900">{schedule.timeSlot}</span>
                    </div>
                    <p className="text-sm text-slate-700">{schedule.courseName}</p>
                    <p className="text-xs text-slate-500">{schedule.labName} · {schedule.className}</p>
                  </div>
                ))}
                {(!stats?.todayScheduleList || stats.todayScheduleList.length === 0) && (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    今日暂无实验安排
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/templates/new')}>
                <FileText className="w-4 h-4 mr-2" />
                创建实验模板
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/reports?status=ungraded')}>
                <Edit3 className="w-4 h-4 mr-2" />
                批改待阅报告
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/analytics')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                查看数据分析
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
