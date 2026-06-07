import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Brain, Lightbulb, Users, BookOpen, Award, Plus, X, Trash2,
  MessageSquare, TrendingUp, Target, Star, Calendar
} from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { cn } from '@/lib/utils';
import type { Assessment, Milestone } from 'shared/types';

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

const skillIcons: Record<string, typeof Brain> = {
  criticalThinking: Brain,
  creativity: Lightbulb,
  collaboration: Users,
  learningHabits: BookOpen,
};

const badgeColors = [
  'gradient-blue',
  'gradient-green',
  'gradient-amber',
  'gradient-rose',
  'gradient-purple',
];

export default function AssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);

  const {
    assessments, latestAssessment, milestones,
    fetchAssessments, fetchLatestAssessment, fetchMilestones,
    createAssessment, addMilestone, deleteMilestone
  } = useStudentStore();

  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  const [newAssessment, setNewAssessment] = useState({
    semester: '2024-2',
    intelligence: {
      linguistic: 70,
      logicalMathematical: 70,
      spatial: 70,
      musical: 70,
      bodilyKinesthetic: 70,
      interpersonal: 70,
      intrapersonal: 70,
    },
    keySkills: {
      criticalThinking: 70,
      creativity: 70,
      collaboration: 70,
      learningHabits: 70,
    },
    teacherComment: '',
  });

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    badge: '⭐',
  });

  useEffect(() => {
    if (studentId) {
      fetchAssessments(studentId);
      fetchLatestAssessment(studentId);
      fetchMilestones(studentId);
    }
  }, [studentId, fetchAssessments, fetchLatestAssessment, fetchMilestones]);

  const getRadarData = (assessment: Assessment | null) => {
    if (!assessment) return [];
    return Object.entries(assessment.intelligence).map(([key, value]) => ({
      subject: intelligenceLabels[key] || key,
      value: value as number,
      fullMark: 100,
    }));
  };

  const getBarData = (assessment: Assessment | null) => {
    if (!assessment) return [];
    return Object.entries(assessment.keySkills).map(([key, value]) => ({
      skill: skillLabels[key] || key,
      value: value as number,
      fullMark: 100,
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-primary-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-primary-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const calculateOverallScore = (assessment: Assessment) => {
    const intelValues = Object.values(assessment.intelligence) as number[];
    const skillValues = Object.values(assessment.keySkills) as number[];
    const allValues = [...intelValues, ...skillValues];
    return Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length);
  };

  const handleCreateAssessment = () => {
    if (newAssessment.teacherComment.trim()) {
      createAssessment(studentId, newAssessment);
      setShowAssessmentModal(false);
      setNewAssessment({
        semester: '2024-2',
        intelligence: {
          linguistic: 70,
          logicalMathematical: 70,
          spatial: 70,
          musical: 70,
          bodilyKinesthetic: 70,
          interpersonal: 70,
          intrapersonal: 70,
        },
        keySkills: {
          criticalThinking: 70,
          creativity: 70,
          collaboration: 70,
          learningHabits: 70,
        },
        teacherComment: '',
      });
    }
  };

  const handleAddMilestone = () => {
    if (newMilestone.title.trim() && newMilestone.description.trim()) {
      addMilestone(studentId, newMilestone);
      setShowMilestoneModal(false);
      setNewMilestone({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        badge: '⭐',
      });
    }
  };

  const handleDeleteMilestone = (milestoneId: number) => {
    if (confirm('确定要删除这个里程碑吗？')) {
      deleteMilestone(milestoneId);
    }
  };

  const displayAssessment = selectedAssessment || latestAssessment;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">能力评估</h2>
          <p className="text-slate-500">多元智能评估与关键能力发展追踪</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMilestoneModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            添加里程碑
          </button>
          <button
            onClick={() => setShowAssessmentModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建评估
          </button>
        </div>
      </div>

      {assessments.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500 mr-2">历史评估：</span>
            {assessments.map((assessment, index) => (
              <button
                key={assessment.id}
                onClick={() => setSelectedAssessment(
                  selectedAssessment?.id === assessment.id ? null : assessment
                )}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
                  (selectedAssessment?.id === assessment.id || 
                   (!selectedAssessment && latestAssessment?.id === assessment.id))
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {assessment.semester}
              </button>
            ))}
          </div>
        </div>
      )}

      {displayAssessment ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 gradient-blue text-white animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">综合评分</p>
                  <p className="font-display text-3xl font-bold">
                    {calculateOverallScore(displayAssessment)}
                    <span className="text-lg font-normal text-white/70">/100</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-white/70" />
                <span className="text-white/80">{displayAssessment.semester} 学期</span>
              </div>
            </div>

            <div className="card p-6 gradient-green text-white animate-slide-up" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">多元智能</p>
                  <p className="font-display text-3xl font-bold">
                    {Math.round((Object.values(displayAssessment.intelligence) as number[]).reduce((a, b) => a + b, 0) / 7)}
                    <span className="text-lg font-normal text-white/70"> 平均分</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(displayAssessment.intelligence)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 2)
                  .map(([key]) => (
                    <span key={key} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      强项：{intelligenceLabels[key]}
                    </span>
                  ))}
              </div>
            </div>

            <div className="card p-6 gradient-amber text-white animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">关键能力</p>
                  <p className="font-display text-3xl font-bold">
                    {Math.round((Object.values(displayAssessment.keySkills) as number[]).reduce((a, b) => a + b, 0) / 4)}
                    <span className="text-lg font-normal text-white/70"> 平均分</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(displayAssessment.keySkills)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 2)
                  .map(([key]) => (
                    <span key={key} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      优势：{skillLabels[key]}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 animate-slide-up">
              <h3 className="font-display text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary-600" />
                多元智能雷达图
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData(displayAssessment)}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Radar
                      name="能力值"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {Object.entries(displayAssessment.intelligence).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-600">{intelligenceLabels[key]}</span>
                    <span className={cn("font-semibold text-sm", getScoreColor(value as number))}>
                      {value as number}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <h3 className="font-display text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                关键能力评估
              </h3>
              <div className="space-y-5">
                {Object.entries(displayAssessment.keySkills).map(([key, value]) => {
                  const Icon = skillIcons[key] || Brain;
                  const score = value as number;
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-700">{skillLabels[key]}</span>
                        </div>
                        <span className={cn("font-semibold", getScoreColor(score))}>
                          {score}分
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-1000", getProgressColor(score))}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-40 mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getBarData(displayAssessment)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="skill" 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      axisLine={false}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: '#94a3b8', fontSize: 10 }} 
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#14b8a6" 
                      radius={[6, 6, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card p-6 animate-slide-up">
            <h3 className="font-display text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-secondary-600" />
              教师评语
            </h3>
            <div className="p-4 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-2xl">
              <p className="text-slate-700 leading-relaxed">
                {displayAssessment.teacherComment}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-display text-lg font-medium text-slate-700 mb-2">暂无评估记录</h3>
          <p className="text-slate-500 mb-4">点击右上角按钮创建第一次能力评估</p>
        </div>
      )}

      <div className="card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            进步里程碑
            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-normal">
              {milestones.length} 个
            </span>
          </h3>
        </div>

        {milestones.length > 0 ? (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div 
                  key={milestone.id} 
                  className="relative pl-16 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn(
                    "absolute left-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl",
                    badgeColors[index % badgeColors.length]
                  )}>
                    {milestone.badge}
                  </div>
                  <div className="card p-4 group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">{milestone.title}</h4>
                        <p className="text-sm text-slate-600">{milestone.description}</p>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(milestone.date).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">还没有记录里程碑</p>
            <p className="text-sm text-slate-400">记录每一个值得纪念的进步时刻</p>
          </div>
        )}
      </div>

      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAssessmentModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-slate-800">新建能力评估</h3>
                <button onClick={() => setShowAssessmentModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">学期</label>
                <select
                  value={newAssessment.semester}
                  onChange={(e) => setNewAssessment({ ...newAssessment, semester: e.target.value })}
                  className="input-field"
                >
                  <option value="2024-2">2024-2025学年第二学期</option>
                  <option value="2024-1">2024-2025学年第一学期</option>
                  <option value="2023-2">2023-2024学年第二学期</option>
                  <option value="2023-1">2023-2024学年第一学期</option>
                </select>
              </div>

              <div>
                <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary-600" />
                  多元智能评估（0-100分）
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(newAssessment.intelligence).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-sm text-slate-600">{intelligenceLabels[key]}</label>
                        <span className="text-sm font-medium text-primary-600">{value}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setNewAssessment({
                          ...newAssessment,
                          intelligence: {
                            ...newAssessment.intelligence,
                            [key]: Number(e.target.value)
                          }
                        })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  关键能力评估（0-100分）
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(newAssessment.keySkills).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-sm text-slate-600">{skillLabels[key]}</label>
                        <span className="text-sm font-medium text-secondary-600">{value}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setNewAssessment({
                          ...newAssessment,
                          keySkills: {
                            ...newAssessment.keySkills,
                            [key]: Number(e.target.value)
                          }
                        })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-secondary-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">教师评语</label>
                <textarea
                  value={newAssessment.teacherComment}
                  onChange={(e) => setNewAssessment({ ...newAssessment, teacherComment: e.target.value })}
                  className="input-field h-32 resize-none"
                  placeholder="请输入对学生的综合评价..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAssessmentModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={handleCreateAssessment}
                className="btn-primary"
                disabled={!newAssessment.teacherComment.trim()}
              >
                保存评估
              </button>
            </div>
          </div>
        </div>
      )}

      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowMilestoneModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-slate-800">添加里程碑</h3>
              <button onClick={() => setShowMilestoneModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">徽章</label>
                <div className="flex gap-2 flex-wrap">
                  {['⭐', '🏆', '🎯', '📚', '🎨', '🔬', '🎵', '🏃', '💡', '🤝'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewMilestone({ ...newMilestone, badge: emoji })}
                      className={cn(
                        "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all",
                        newMilestone.badge === emoji
                          ? "bg-primary-100 ring-2 ring-primary-500"
                          : "bg-slate-100 hover:bg-slate-200"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">标题</label>
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="input-field"
                  placeholder="例如：数学竞赛一等奖"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
                <input
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                <textarea
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="描述这个值得纪念的时刻..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={handleAddMilestone}
                className="btn-primary"
                disabled={!newMilestone.title.trim() || !newMilestone.description.trim()}
              >
                保存里程碑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
