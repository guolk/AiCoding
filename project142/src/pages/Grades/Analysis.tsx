import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Users, TrendingUp, Award, Target, BookOpen } from 'lucide-react';
import { useStudentStore } from '../../store/useStudentStore';
import { useGradeStore } from '../../store/useGradeStore';
import { Student } from '../../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const SUBJECTS = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];

const GradeAnalysisPage: React.FC = () => {
  const { students } = useStudentStore();
  const { exams, grades, getGradesByStudent, getExamStats, getClassGradeTrend } = useGradeStore();
  
  const [selectedSubject, setSelectedSubject] = useState('语文');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const classTrend = useMemo(() => getClassGradeTrend(selectedSubject), [exams, grades, selectedSubject, getClassGradeTrend]);
  
  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);
  const studentGrades = useMemo(() => selectedStudentId ? getGradesByStudent(selectedStudentId).filter(g => g.subject === selectedSubject) : [], [grades, selectedStudentId, selectedSubject, getGradesByStudent]);

  const latestExam = useMemo(() => exams[0], [exams]);
  const latestStats = useMemo(() => latestExam ? getExamStats(latestExam.id, selectedSubject) : { average: 0, passRate: 0, excellentRate: 0, maxScore: 0, minScore: 0, distribution: [0, 0, 0, 0, 0] }, [exams, latestExam, selectedSubject, getExamStats]);

  const studentRankings = useMemo(() => {
    if (!latestExam) return [];
    
    return students.map(student => {
      const studentExamGrades = grades.filter(g => g.studentId === student.id && g.examId === latestExam.id && g.subject === selectedSubject);
      const totalScore = studentExamGrades.reduce((sum, g) => sum + g.score, 0);
      const avgScore = studentExamGrades.length > 0 ? totalScore / studentExamGrades.length : 0;
      return { student, score: avgScore };
    }).sort((a, b) => b.score - a.score);
  }, [students, grades, latestExam, selectedSubject]);

  const trendChartData = {
    labels: classTrend.map(t => t.exam.name),
    datasets: [
      {
        label: '班级平均分',
        data: classTrend.map(t => t.average),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  const studentTrendData = {
    labels: studentGrades.map(g => {
      const exam = exams.find(e => e.id === g.examId);
      return exam?.name || '';
    }),
    datasets: [
      {
        label: selectedStudent?.name || '学生成绩',
        data: studentGrades.map(g => g.score),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      },
      {
        label: '班级平均分',
        data: studentGrades.map(g => {
          const stats = getExamStats(g.examId, selectedSubject);
          return stats.average;
        }),
        borderColor: '#94a3b8',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const distributionData = {
    labels: ['0-59分', '60-69分', '70-79分', '80-89分', '90-100分'],
    datasets: [{
      data: latestStats.distribution,
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'],
      borderRadius: 8,
      borderWidth: 0
    }]
  };

  const doughnutData = {
    labels: ['优秀(≥90)', '良好(80-89)', '中等(70-79)', '及格(60-69)', '不及格(<60)'],
    datasets: [{
      data: latestStats.distribution.slice().reverse(),
      backgroundColor: ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: false, min: 40, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-500 text-white';
    if (rank === 2) return 'bg-slate-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">成绩分析</h1>
          <p className="text-slate-500 mt-1 text-sm">可视化分析班级成绩分布和学生学习趋势</p>
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        >
          {SUBJECTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-5"
      >
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">平均分</p>
              <p className="text-2xl font-bold text-slate-800">{latestStats.average.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Target size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">及格率</p>
              <p className="text-2xl font-bold text-slate-800">{latestStats.passRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Award size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">优秀率</p>
              <p className="text-2xl font-bold text-slate-800">{latestStats.excellentRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">参考人数</p>
              <p className="text-2xl font-bold text-slate-800">{students.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">班级成绩趋势</h3>
          <div className="h-72">
            <Line data={trendChartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">成绩分布</h3>
          <div className="h-72">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 12, padding: 12 } } } }} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">分数段分布</h3>
          <div className="h-64">
            <Bar data={distributionData} options={barOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">个人成绩趋势</h3>
            <select
              value={selectedStudentId || ''}
              onChange={(e) => setSelectedStudentId(e.target.value || null)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="">选择学生</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="h-64">
            {selectedStudentId && studentGrades.length > 0 ? (
              <Line data={studentTrendData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <TrendingUp size={48} className="mx-auto mb-3 opacity-50" />
                  <p>请选择学生查看成绩趋势</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">成绩排名 - {latestExam?.name}</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-10 gap-3">
            {studentRankings.slice(0, 10).map((item, index) => (
              <motion.div
                key={item.student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedStudentId(item.student.id)}
                className={`bg-slate-50 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all border-2 ${
                  selectedStudentId === item.student.id ? 'border-amber-500 bg-amber-50' : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor(index + 1)}`}>
                    {index + 1}
                  </span>
                  <span className="text-lg font-bold text-slate-800">{item.score.toFixed(0)}</span>
                </div>
                <img
                  src={item.student.photoUrl}
                  alt={item.student.name}
                  className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
                />
                <p className="text-sm font-medium text-center text-slate-800 truncate">{item.student.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GradeAnalysisPage;
