import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { 
  FileText, Download, Share2, Plus, X, TrendingUp, 
  Award, MessageSquare, Star, Calendar, Users, Target,
  CheckCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { cn } from '@/lib/utils';
import type { Report, Portfolio } from 'shared/types';

const intelligenceLabels: Record<string, string> = {
  linguistic: '语言智能',
  logicalMathematical: '逻辑数学',
  spatial: '空间智能',
  musical: '音乐智能',
  bodilyKinesthetic: '运动智能',
  interpersonal: '人际智能',
  intrapersonal: '内省智能',
};

const skillLabels: Record<string, string> = {
  criticalThinking: '批判思维',
  creativity: '创造力',
  collaboration: '合作能力',
  learningHabits: '学习习惯',
};

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);

  const {
    reports, currentReport, growthComparison, currentStudent,
    portfolios, featuredPortfolios, latestAssessment,
    fetchReports, fetchReport, fetchGrowthComparison,
    createReport, fetchPortfolios, fetchFeaturedPortfolios,
    fetchLatestAssessment, fetchStudent
  } = useStudentStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [parentVersion, setParentVersion] = useState<{
    report: Report;
    summary: {
      strengths: string[];
      improvements: string[];
      recommendations: string[];
    };
  } | null>(null);

  const [newReport, setNewReport] = useState({
    semester: '2024-2',
    teacherComment: '',
    highlights: [''] as string[],
  });

  useEffect(() => {
    if (studentId) {
      fetchReports(studentId);
      fetchGrowthComparison(studentId);
      fetchStudent(studentId);
      fetchPortfolios(studentId);
      fetchFeaturedPortfolios(studentId);
      fetchLatestAssessment(studentId);
    }
  }, [studentId, fetchReports, fetchGrowthComparison, fetchStudent, 
      fetchPortfolios, fetchFeaturedPortfolios, fetchLatestAssessment]);

  useEffect(() => {
    if (reports.length > 0 && !selectedReport) {
      setSelectedReport(reports[0]);
      fetchReport(reports[0].id);
    }
  }, [reports, selectedReport, fetchReport]);

  const getGrowthLineData = () => {
    return growthComparison.map(item => ({
      semester: item.semester,
      综合评分: item.overallScore,
      语言智能: item.intelligence.linguistic,
      逻辑数学: item.intelligence.logicalMathematical,
      创造力: item.keySkills.creativity,
    }));
  };

  const getGrowthAreaData = () => {
    return growthComparison.map(item => ({
      semester: item.semester,
      多元智能: Math.round(Object.values(item.intelligence).reduce((a, b) => a + b, 0) / 7),
      关键能力: Math.round(Object.values(item.keySkills).reduce((a, b) => a + b, 0) / 4),
    }));
  };

  const handleCreateReport = () => {
    const highlights = newReport.highlights.filter(h => h.trim());
    if (newReport.teacherComment.trim() && highlights.length > 0) {
      createReport(studentId, {
        semester: newReport.semester,
        teacherComment: newReport.teacherComment,
        highlights
      });
      setShowCreateModal(false);
      setNewReport({
        semester: '2024-2',
        teacherComment: '',
        highlights: [''],
      });
    }
  };

  const handleAddHighlight = () => {
    setNewReport({
      ...newReport,
      highlights: [...newReport.highlights, '']
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setNewReport({
      ...newReport,
      highlights: newReport.highlights.filter((_, i) => i !== index)
    });
  };

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...newReport.highlights];
    newHighlights[index] = value;
    setNewReport({ ...newReport, highlights: newHighlights });
  };

  const handleViewParentVersion = async (report: Report) => {
    try {
      const response = await fetch(`/api/reports/${report.id}/parent-version`);
      const data = await response.json();
      setParentVersion(data);
      setShowParentModal(true);
    } catch (error) {
      console.error('获取家长版本失败', error);
    }
  };

  const displayReport = selectedReport || currentReport;

  const getReportPortfolios = () => {
    if (!displayReport) return [];
    return portfolios.filter(p => displayReport.featuredWorks.includes(p.id));
  };

  const calculateGrowthTrend = () => {
    if (growthComparison.length < 2) return null;
    const latest = growthComparison[growthComparison.length - 1].overallScore;
    const previous = growthComparison[growthComparison.length - 2].overallScore;
    return latest - previous;
  };

  const growthTrend = calculateGrowthTrend();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">学习档案报告</h2>
          <p className="text-slate-500">学期综合报告与成长轨迹分析</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          生成新报告
        </button>
      </div>

      {growthComparison.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 gradient-blue text-white animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">最新综合评分</p>
                <p className="font-display text-3xl font-bold mt-1">
                  {growthComparison[growthComparison.length - 1]?.overallScore || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="card p-5 gradient-green text-white animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">成长趋势</p>
                <p className="font-display text-3xl font-bold mt-1 flex items-center gap-1">
                  {growthTrend !== null ? (
                    <>
                      {growthTrend >= 0 ? '+' : ''}{growthTrend}
                      <TrendingUp className={cn("w-5 h-5", growthTrend < 0 && "rotate-180")} />
                    </>
                  ) : '-'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="card p-5 gradient-amber text-white animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">优秀作品</p>
                <p className="font-display text-3xl font-bold mt-1">
                  {featuredPortfolios.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="card p-5 gradient-purple text-white animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">报告数量</p>
                <p className="font-display text-3xl font-bold mt-1">
                  {reports.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {reports.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500 mr-2">选择报告：</span>
            {reports.map((report, index) => (
              <button
                key={report.id}
                onClick={() => {
                  setSelectedReport(report);
                  fetchReport(report.id);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
                  selectedReport?.id === report.id
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {report.semester}
              </button>
            ))}
          </div>
        </div>
      )}

      {displayReport ? (
        <>
          <div className="card p-6 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-800">
                  {displayReport.semester} 学期学习档案报告
                </h3>
                <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4" />
                  生成于 {new Date(displayReport.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewParentVersion(displayReport)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  家长版
                </button>
                <button className="btn-outline flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  导出
                </button>
              </div>
            </div>

            {currentStudent && (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div>
                  <h4 className="font-semibold text-slate-800">{currentStudent.name}</h4>
                  <p className="text-sm text-slate-500">
                    {currentStudent.grade}年级 {currentStudent.className}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  成长亮点
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayReport.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-slate-700 text-sm">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {getReportPortfolios().length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary-600" />
                    代表性作品
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getReportPortfolios().map((work: Portfolio) => (
                      <div key={work.id} className="rounded-xl overflow-hidden card-hover">
                        <div className="relative aspect-video">
                          <img
                            src={work.thumbnail}
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-white text-sm font-medium truncate">{work.title}</p>
                            <p className="text-white/70 text-xs">{work.grade}年级</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {latestAssessment && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-secondary-600" />
                    能力评估概览
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(latestAssessment.keySkills).map(([key, value]) => (
                      <div key={key} className="p-4 bg-slate-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-primary-600">{value}</p>
                        <p className="text-xs text-slate-500 mt-1">{skillLabels[key]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-rose-500" />
                  教师评语
                </h4>
                <div className="p-4 bg-gradient-to-r from-rose-50 to-primary-50 rounded-2xl">
                  <p className="text-slate-700 leading-relaxed">
                    {displayReport.teacherComment}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-display text-lg font-medium text-slate-700 mb-2">暂无报告</h3>
          <p className="text-slate-500 mb-4">点击右上角按钮生成第一份学习档案报告</p>
        </div>
      )}

      {growthComparison.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 animate-slide-up">
            <h3 className="font-display text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              综合成长趋势
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getGrowthLineData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="semester" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="综合评分"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#3b82f6' }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="语言智能"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#14b8a6' }}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="逻辑数学"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <h3 className="font-display text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary-600" />
              多元智能 vs 关键能力
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getGrowthAreaData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="semester" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="多元智能"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="关键能力"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {growthComparison.length > 0 && (
        <div className="card p-6 animate-slide-up">
          <h3 className="font-display text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            各学期纵向对比
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 text-sm font-medium text-slate-500">学期</th>
                  <th className="text-center p-3 text-sm font-medium text-slate-500">综合评分</th>
                  {Object.keys(intelligenceLabels).slice(0, 4).map(key => (
                    <th key={key} className="text-center p-3 text-sm font-medium text-slate-500">
                      {intelligenceLabels[key]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {growthComparison.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-medium text-slate-800">{item.semester}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold",
                        item.overallScore >= 85 ? "bg-green-100 text-green-700" :
                        item.overallScore >= 70 ? "bg-primary-100 text-primary-700" :
                        item.overallScore >= 60 ? "bg-amber-100 text-amber-700" :
                        "bg-rose-100 text-rose-700"
                      )}>
                        {item.overallScore}
                        {index > 0 && (
                          <ChevronRight className={cn(
                            "w-3 h-3",
                            item.overallScore > growthComparison[index - 1].overallScore 
                              ? "text-green-500 rotate-[-90deg]" 
                              : "text-rose-500 rotate-90"
                          )} />
                        )}
                      </span>
                    </td>
                    {Object.entries(item.intelligence).slice(0, 4).map(([key, value]) => (
                      <td key={key} className="p-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600 w-8">{value}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-slate-800">生成学期报告</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">学期</label>
                <select
                  value={newReport.semester}
                  onChange={(e) => setNewReport({ ...newReport, semester: e.target.value })}
                  className="input-field"
                >
                  <option value="2024-2">2024-2025学年第二学期</option>
                  <option value="2024-1">2024-2025学年第一学期</option>
                  <option value="2023-2">2023-2024学年第二学期</option>
                  <option value="2023-1">2023-2024学年第一学期</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  成长亮点
                </label>
                <div className="space-y-2">
                  {newReport.highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="w-8 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => handleHighlightChange(index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="输入一个成长亮点..."
                      />
                      {newReport.highlights.length > 1 && (
                        <button
                          onClick={() => handleRemoveHighlight(index)}
                          className="p-2 text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddHighlight}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  添加亮点
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">教师评语</label>
                <textarea
                  value={newReport.teacherComment}
                  onChange={(e) => setNewReport({ ...newReport, teacherComment: e.target.value })}
                  className="input-field h-32 resize-none"
                  placeholder="请输入对学生本学期的综合评价..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={handleCreateReport}
                className="btn-primary"
                disabled={!newReport.teacherComment.trim() || newReport.highlights.filter(h => h.trim()).length === 0}
              >
                生成报告
              </button>
            </div>
          </div>
        </div>
      )}

      {showParentModal && parentVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowParentModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold">家长版成长报告</h3>
                  <p className="text-white/70 text-sm mt-1">{parentVersion.report.semester} 学期</p>
                </div>
                <button onClick={() => setShowParentModal(false)} className="p-2 hover:bg-white/20 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                {currentStudent && (
                  <>
                    <img
                      src={currentStudent.avatar}
                      alt={currentStudent.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-800">{currentStudent.name}</h4>
                      <p className="text-sm text-slate-500">{currentStudent.grade}年级 {currentStudent.className}</p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  优势领域
                </h4>
                <div className="space-y-2">
                  {parentVersion.summary.strengths.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <p className="text-slate-700 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  待提升方向
                </h4>
                <div className="space-y-2">
                  {parentVersion.summary.improvements.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                      <span className="text-amber-500 mt-0.5">!</span>
                      <p className="text-slate-700 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary-500" />
                  家校共育建议
                </h4>
                <div className="space-y-2">
                  {parentVersion.summary.recommendations.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-primary-50 rounded-xl">
                      <span className="text-primary-500 font-semibold mt-0.5">{index + 1}</span>
                      <p className="text-slate-700 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl">
                <p className="text-sm text-slate-600 italic">
                  "{parentVersion.report.teacherComment}"
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button className="btn-outline flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                分享给家长
              </button>
              <button className="btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" />
                下载报告
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
