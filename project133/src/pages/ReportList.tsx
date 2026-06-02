import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/store/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Button } from '@/components/ui/Button.js';
import { Input, Select } from '@/components/ui/Input.js';
import { StatusBadge, Badge } from '@/components/ui/Badge.js';
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  GraduationCap
} from 'lucide-react';
import type { ReportStatus } from '../../shared/types.js';

export const ReportList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { reports, templates, fetchReports, fetchTemplates, loading } = useStore();
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | ''>(
    (searchParams.get('status') as ReportStatus) || ''
  );

  useEffect(() => {
    fetchReports();
    fetchTemplates();
  }, [fetchReports, fetchTemplates]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (searchKeyword && !report.studentName.includes(searchKeyword) && !report.templateName.includes(searchKeyword)) {
        return false;
      }
      if (filterClass && report.className !== filterClass) {
        return false;
      }
      if (filterTemplate && report.templateId !== parseInt(filterTemplate)) {
        return false;
      }
      if (filterStatus && report.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [reports, searchKeyword, filterClass, filterTemplate, filterStatus]);

  const classes = useMemo(() => {
    return [...new Set(reports.map(r => r.className))];
  }, [reports]);

  const stats = useMemo(() => {
    return {
      total: reports.length,
      ungraded: reports.filter(r => r.status === 'ungraded').length,
      graded: reports.filter(r => r.status === 'graded').length,
      needsRevision: reports.filter(r => r.status === 'needs-revision').length
    };
  }, [reports]);

  const classOptions = [
    { value: '', label: '全部班级' },
    ...classes.map(c => ({ value: c, label: c }))
  ];

  const templateOptions = [
    { value: '', label: '全部实验' },
    ...templates.map(t => ({ value: String(t.id), label: t.name }))
  ];

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'ungraded', label: '待批改' },
    { value: 'graded', label: '已批改' },
    { value: 'needs-revision', label: '需修改' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">学生报告管理</h1>
          <p className="text-sm text-slate-500 mt-1">查看、批改和管理学生实验报告</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="报告总数" value={stats.total} icon={GraduationCap} variant="default" />
        <StatCard label="待批改" value={stats.ungraded} icon={Clock} variant="warning" />
        <StatCard label="已批改" value={stats.graded} icon={CheckCircle2} variant="success" />
        <StatCard label="需修改" value={stats.needsRevision} icon={AlertCircle} variant="danger" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索学生姓名、实验名称..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              label=""
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              options={classOptions}
              className="w-40"
            />
            <Select
              label=""
              value={filterTemplate}
              onChange={(e) => setFilterTemplate(e.target.value)}
              options={templateOptions}
              className="w-52"
            />
            <Select
              label=""
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ReportStatus | '')}
              options={statusOptions}
              className="w-32"
            />
            <Button variant="ghost" onClick={() => {
              setSearchKeyword('');
              setFilterClass('');
              setFilterTemplate('');
              setFilterStatus('');
            }}>
              <Filter className="w-4 h-4 mr-2" />
              重置筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    学生信息
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    实验名称
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    班级
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    提交时间
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    成绩
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report, index) => (
                  <tr 
                    key={report.id} 
                    className="hover:bg-slate-50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{report.studentName}</p>
                          <p className="text-xs text-slate-500">{report.studentNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{report.templateName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">{report.className}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">
                        {new Date(report.submittedAt).toLocaleString('zh-CN')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {report.grade !== undefined ? (
                        <span className={`text-sm font-semibold ${
                          report.grade >= 90 ? 'text-teal-600' :
                          report.grade >= 60 ? 'text-slate-900' : 'text-red-600'
                        }`}>
                          {report.grade} 分
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/reports/${report.id}`)}
                      >
                        {report.status === 'ungraded' ? '批改' : '查看'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredReports.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>暂无符合条件的报告</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  variant: 'default' | 'success' | 'warning' | 'danger';
}> = ({ label, value, icon: Icon, variant }) => {
  const variants = {
    default: 'bg-slate-50 text-slate-600 border-slate-200',
    success: 'bg-teal-50 text-teal-600 border-teal-200',
    warning: 'bg-orange-50 text-orange-600 border-orange-200',
    danger: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <Card className={`border-l-4 ${variants[variant].replace('bg-', 'border-l-')}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="font-display text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg ${variants[variant]} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
