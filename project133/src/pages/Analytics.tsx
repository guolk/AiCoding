import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Select } from '@/components/ui/Input.js';
import { Badge } from '@/components/ui/Badge.js';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  Target,
  RefreshCw
} from 'lucide-react';

const COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Analytics: React.FC = () => {
  const { templates, analyticsData, fetchTemplates, fetchAnalytics, loading } = useStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    fetchAnalytics(selectedTemplateId);
  }, [fetchAnalytics, selectedTemplateId]);

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const handleRefresh = () => {
    fetchAnalytics(selectedTemplateId);
  };

  const getBestGroup = () => {
    if (!analyticsData?.resultComparison.length) return null;
    return [...analyticsData.resultComparison].sort((a, b) => a.deviation - b.deviation)[0];
  };

  const getMostErrorStep = () => {
    if (!analyticsData?.stepErrors.length) return null;
    return [...analyticsData.stepErrors].sort((a, b) => b.errorCount - a.errorCount)[0];
  };

  const bestGroup = getBestGroup();
  const mostErrorStep = getMostErrorStep();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">数据分析</h1>
          <p className="text-sm text-slate-500 mt-1">班级实验数据汇总与分析</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            value={selectedTemplateId || ''}
            onChange={(e) => setSelectedTemplateId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-64"
          >
            <option value="">全部实验</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="刷新数据"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="animate-fade-in-up">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">平均成绩</p>
                <p className="font-display text-3xl font-bold text-slate-900">
                  {analyticsData?.averageGrade?.toFixed(1) || '--'}
                  <span className="text-lg font-normal text-slate-500 ml-1">分</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">及格率</p>
                <p className="font-display text-3xl font-bold text-slate-900">
                  {analyticsData?.passRate?.toFixed(1) || '--'}
                  <span className="text-lg font-normal text-slate-500 ml-1">%</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">最优小组</p>
                <p className="font-display text-xl font-bold text-slate-900 truncate max-w-32">
                  {bestGroup?.groupName || '--'}
                </p>
                <p className="text-xs text-teal-600 mt-1">
                  偏差 {bestGroup?.deviation?.toFixed(2) || '--'}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">易错步骤</p>
                <p className="font-display text-xl font-bold text-slate-900 truncate max-w-32">
                  {mostErrorStep?.step || '--'}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {mostErrorStep?.errorCount || 0} 人出错
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle>实验结果对比分析</CardTitle>
            <p className="text-sm text-slate-500 mt-1">各组实验结果与理论值的偏差对比（偏差越小越好）</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analyticsData?.resultComparison || []}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="groupName" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar
                    name="偏差值(%)"
                    dataKey="deviation"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <CardTitle>常见错误统计</CardTitle>
            <p className="text-sm text-slate-500 mt-1">各实验步骤的错误人数统计</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.stepErrors || []} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis
                    dataKey="step"
                    type="category"
                    width={80}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="errorCount" fill="#f59e0b" radius={[0, 4, 4, 0]} name="错误人数" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle>成绩分布分析</CardTitle>
          <p className="text-sm text-slate-500 mt-1">各分数段的学生人数分布</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="h-80 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData?.gradeDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="range"
                  >
                    {analyticsData?.gradeDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number) => [`${value} 人`, '人数']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2">
              <div className="space-y-3">
                {analyticsData?.gradeDistribution?.map((item, index) => (
                  <div key={item.range} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-slate-700">{item.range}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.count / (analyticsData?.gradeDistribution?.reduce((sum, i) => sum + i.count, 0) || 1)) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                      <Badge variant="outline" className="min-w-12 text-center">
                        {item.count} 人
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
