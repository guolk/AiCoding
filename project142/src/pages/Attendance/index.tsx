import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, Clock, UserX, FileText, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useStudentStore } from '../../store/useStudentStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { AttendanceStatus, AttendanceStats } from '../../types';
import { formatDateCN, getAttendanceStatusText, getAttendanceStatusColor, calculateAttendanceStats } from '../../utils/helpers';

const statusOptions: { status: AttendanceStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'present', label: '出勤', icon: <Check size={16} />, color: 'bg-emerald-500' },
  { status: 'late', label: '迟到', icon: <Clock size={16} />, color: 'bg-amber-500' },
  { status: 'leave', label: '请假', icon: <FileText size={16} />, color: 'bg-blue-500' },
  { status: 'absent', label: '旷课', icon: <UserX size={16} />, color: 'bg-red-500' }
];

const AttendancePage: React.FC = () => {
  const { students } = useStudentStore();
  const { attendanceList, addAttendance, batchUpdateAttendance, getAttendanceByDate, getAttendanceStats } = useAttendanceStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showStats, setShowStats] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const todayAttendance = useMemo(() => {
    return getAttendanceByDate(selectedDate);
  }, [attendanceList, selectedDate, getAttendanceByDate]);

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    todayAttendance.forEach(a => map.set(a.studentId, a.status));
    return map;
  }, [todayAttendance]);

  const stats = useMemo(() => {
    const monthStart = new Date(selectedDate);
    monthStart.setDate(1);
    const monthEnd = new Date(selectedDate);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    
    return getAttendanceStats(
      monthStart.toISOString().split('T')[0],
      monthEnd.toISOString().split('T')[0]
    );
  }, [attendanceList, selectedDate, getAttendanceStats]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    addAttendance(studentId, selectedDate, status);
    setEditingStudentId(null);
  };

  const handleMarkAllPresent = () => {
    const records = students.map(s => ({
      studentId: s.id,
      status: 'present' as AttendanceStatus
    }));
    batchUpdateAttendance(selectedDate, records);
  };

  const handleDateChange = (delta: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + delta);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const leaveCount = todayAttendance.filter(a => a.status === 'leave').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
  const attendanceRate = students.length > 0 ? Math.round(((presentCount + lateCount) / students.length) * 100) : 0;

  const attendanceChartData = {
    labels: stats.slice(-7).map(s => s.date.slice(5)),
    datasets: [
      {
        label: '出勤',
        data: stats.slice(-7).map(s => s.present),
        backgroundColor: '#10b981',
        borderRadius: 4
      },
      {
        label: '迟到',
        data: stats.slice(-7).map(s => s.late),
        backgroundColor: '#f59e0b',
        borderRadius: 4
      },
      {
        label: '请假',
        data: stats.slice(-7).map(s => s.leave),
        backgroundColor: '#3b82f6',
        borderRadius: 4
      },
      {
        label: '旷课',
        data: stats.slice(-7).map(s => s.absent),
        backgroundColor: '#ef4444',
        borderRadius: 4
      }
    ]
  };

  const doughnutData = {
    labels: ['出勤', '迟到', '请假', '旷课'],
    datasets: [{
      data: [presentCount, lateCount, leaveCount, absentCount],
      backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
      borderWidth: 0
    }]
  };

  const trendData = {
    labels: stats.map(s => s.date.slice(5)),
    datasets: [{
      label: '出勤率',
      data: stats.map(s => students.length > 0 ? Math.round(((s.present + s.late) / students.length) * 100) : 0),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">考勤管理</h1>
          <p className="text-slate-500 mt-1 text-sm">记录学生考勤情况，查看月度统计报告</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              showStats 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20' 
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart3 size={16} />
            {showStats ? '隐藏统计' : '查看统计'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMarkAllPresent}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
          >
            <Check size={16} />
            全部出勤
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-5 mb-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <h3 className="font-semibold text-slate-800 mb-4">本月考勤分布</h3>
                <div className="h-52">
                  <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }} />
                </div>
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 col-span-2"
              >
                <h3 className="font-semibold text-slate-800 mb-4">本月考勤趋势</h3>
                <div className="h-52">
                  <Line data={trendData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, max: 100, min: 60 } } }} />
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6"
            >
              <h3 className="font-semibold text-slate-800 mb-4">近7天考勤详情</h3>
              <div className="h-56">
                <Bar data={attendanceChartData} options={{ ...chartOptions, plugins: { legend: { display: true, position: 'top' as const } } }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleDateChange(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-amber-500" />
                <span className="text-lg font-semibold text-slate-800">{formatDateCN(selectedDate)}</span>
              </div>
              <button
                onClick={() => handleDateChange(1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-slate-600">出勤: {presentCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm text-slate-600">迟到: {lateCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-slate-600">请假: {leaveCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-slate-600">旷课: {absentCount}</span>
              </div>
              <div className="px-4 py-2 bg-emerald-50 rounded-xl">
                <span className="text-sm font-semibold text-emerald-700">出勤率: {attendanceRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-8 gap-4">
            {students.map((student, index) => {
              const status = attendanceMap.get(student.id);
              const isEditing = editingStudentId === student.id;
              
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="relative"
                >
                  <button
                    onClick={() => setEditingStudentId(isEditing ? null : student.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      status 
                        ? getAttendanceStatusColor(status) + ' border-transparent'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
                    />
                    <p className="text-sm font-medium text-center truncate">{student.name}</p>
                    {status && (
                      <p className="text-xs mt-1 font-medium">{getAttendanceStatusText(status)}</p>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 flex flex-col gap-1 min-w-[140px]"
                      >
                        {statusOptions.map(option => (
                          <button
                            key={option.status}
                            onClick={() => handleStatusChange(student.id, option.status)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm ${
                              status === option.status ? 'bg-slate-100' : ''
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full ${option.color} flex items-center justify-center text-white`}>
                              {option.icon}
                            </div>
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AttendancePage;
