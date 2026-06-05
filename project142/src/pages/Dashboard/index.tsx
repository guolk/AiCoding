import React from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, FileSpreadsheet, Presentation, MessageSquare, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import StatCard from '../../components/common/StatCard';
import { useStudentStore } from '../../store/useStudentStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { useGradeStore } from '../../store/useGradeStore';
import { useCommunicationStore } from '../../store/useCommunicationStore';
import { formatDateCN, calculateGradeStats } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const { students } = useStudentStore();
  const { attendanceList, getAttendanceStats, getStudentAttendanceRate } = useAttendanceStore();
  const { exams, grades, getClassGradeTrend } = useGradeStore();
  const { announcements, leaves } = useCommunicationStore();

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceList.filter(a => a.date === today);
  const attendanceStats = getAttendanceStats(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    today
  );

  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const leaveCount = todayAttendance.filter(a => a.status === 'leave').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
  const attendanceRate = students.length > 0 ? Math.round(((presentCount + lateCount) / students.length) * 100) : 0;

  const latestExam = exams[0];
  const latestGrades = latestExam ? grades.filter(g => g.examId === latestExam.id) : [];
  const gradeStats = calculateGradeStats(latestGrades);

  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

  const gradeTrend = getClassGradeTrend();

  const attendanceChartData = {
    labels: attendanceStats.slice(-7).map(s => s.date.slice(5)),
    datasets: [
      {
        label: '出勤率',
        data: attendanceStats.slice(-7).map(s => 
          students.length > 0 ? Math.round(((s.present + s.late) / students.length) * 100) : 0
        ),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  const gradeChartData = {
    labels: gradeTrend.map(t => t.exam.name),
    datasets: [
      {
        label: '班级平均分',
        data: gradeTrend.map(t => t.average),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  const distributionChartData = {
    labels: ['90+', '80-89', '70-79', '60-69', '40-59', '<40'],
    datasets: [
      {
        label: '人数',
        data: gradeStats.distribution,
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#6366f1',
          '#f59e0b',
          '#ef4444',
          '#991b1b'
        ],
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const attendanceDoughnutData = {
    labels: ['出勤', '迟到', '请假', '旷课'],
    datasets: [
      {
        data: [presentCount, lateCount, leaveCount, absentCount],
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 15, usePointStyle: true } }
    },
    cutout: '65%'
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">工作台</h1>
          <p className="text-slate-500 mt-1 text-sm">欢迎回来，今天是 {formatDateCN(new Date())}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-5">
        <StatCard
          title="班级学生"
          value={students.length}
          icon={Users}
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="今日出勤率"
          value={`${attendanceRate}%`}
          icon={CalendarCheck}
          color="green"
          trend={{ value: 2.3, isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="考试平均分"
          value={gradeStats.average}
          icon={FileSpreadsheet}
          color="amber"
          delay={0.3}
        />
        <StatCard
          title="待处理请假"
          value={pendingLeaves}
          icon={AlertTriangle}
          color="red"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">考勤趋势</h3>
            <span className="text-xs text-slate-500">最近7天</span>
          </div>
          <div className="h-60">
            <Line data={attendanceChartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">今日考勤分布</h3>
          <div className="h-52">
            <Doughnut data={attendanceDoughnutData} options={doughnutOptions} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">成绩趋势</h3>
            <span className="text-xs text-slate-500">历次考试</span>
          </div>
          <div className="h-60">
            <Line data={gradeChartData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, max: 100, min: 50 } } }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">成绩分布</h3>
          <div className="h-52">
            <Bar data={distributionChartData} options={barOptions} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 col-span-2"
        >
          <h3 className="font-semibold text-slate-800 mb-4">最新公告</h3>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-800 group-hover:text-amber-600 transition-colors">{announcement.title}</h4>
                    <span className="text-xs text-slate-400">{announcement.date}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{announcement.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: CalendarCheck, label: '录入考勤', color: 'bg-emerald-100 text-emerald-600' },
              { icon: FileSpreadsheet, label: '录入成绩', color: 'bg-blue-100 text-blue-600' },
              { icon: Presentation, label: '随机点名', color: 'bg-violet-100 text-violet-600' },
              { icon: MessageSquare, label: '发布公告', color: 'bg-amber-100 text-amber-600' }
            ].map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon size={22} />
                </div>
                <span className="text-xs font-medium text-slate-700">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
