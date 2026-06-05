import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Settings, Download, Upload, User, FileText, Calendar, Award, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateCN } from '../../utils/helpers';
import { exportToJson } from '../../utils/helpers';
import { useStudentStore } from '../../store/useStudentStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { useGradeStore } from '../../store/useGradeStore';


interface SearchResult {
  id: string;
  type: 'student' | 'attendance' | 'grade' | 'announcement';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  path: string;
}

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { students } = useStudentStore();
  const { attendanceList } = useAttendanceStore();
  const { exams } = useGradeStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo((): SearchResult[] => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    students.forEach(student => {
      if (
        student.name.toLowerCase().includes(term) ||
        student.studentNo.toLowerCase().includes(term) ||
        student.parentName.toLowerCase().includes(term) ||
        student.parentPhone.includes(term)
      ) {
        results.push({
          id: `student-${student.id}`,
          type: 'student',
          title: student.name,
          subtitle: `${student.studentNo} · ${student.parentName} · ${student.parentPhone}`,
          icon: <User size={16} />,
          path: '/students'
        });
      }
    });

    exams.forEach(exam => {
      if (
        exam.name.toLowerCase().includes(term) ||
        exam.term.toLowerCase().includes(term)
      ) {
        results.push({
          id: `exam-${exam.id}`,
          type: 'grade',
          title: exam.name,
          subtitle: `${exam.term} · ${formatDateCN(exam.date)}`,
          icon: <Award size={16} />,
          path: '/grades'
        });
      }
    });

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceList.filter(a => a.date === today);
    todayAttendance.forEach(record => {
      const student = students.find(s => s.id === record.studentId);
      if (student && (
        record.status.toLowerCase().includes(term) ||
        record.remarks?.toLowerCase().includes(term)
      )) {
        results.push({
          id: `attendance-${record.id}`,
          type: 'attendance',
          title: `${student.name} - ${getAttendanceStatusText(record.status)}`,
          subtitle: `${formatDateCN(record.date)}${record.remarks ? ' · ' + record.remarks : ''}`,
          icon: <Calendar size={16} />,
          path: '/attendance'
        });
      }
    });

    return results.slice(0, 10);
  }, [searchTerm, students, attendanceList, exams]);

  const getAttendanceStatusText = (status: string) => {
    const map: Record<string, string> = {
      present: '出勤',
      late: '迟到',
      leave: '请假',
      absent: '旷课'
    };
    return map[status] || status;
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      student: 'bg-blue-100 text-blue-600',
      attendance: 'bg-emerald-100 text-emerald-600',
      grade: 'bg-amber-100 text-amber-600',
      announcement: 'bg-purple-100 text-purple-600'
    };
    return map[type] || 'bg-slate-100 text-slate-600';
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleExport = () => {
    const data = {
      students,
      exportedAt: new Date().toISOString()
    };
    exportToJson(data, 'class_data');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40"
    >
      <div className="flex items-center gap-4">
        <div ref={searchRef} className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索学生姓名、学号、考试名称..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="pl-10 pr-10 py-2 bg-slate-100/50 rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={14} className="text-slate-400" />
            </button>
          )}

          <AnimatePresence>
            {showResults && searchTerm.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
              >
                {searchResults.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(result.type)}`}>
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{result.title}</p>
                          <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {result.type === 'student' ? '学生' : result.type === 'grade' ? '成绩' : '考勤'}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-500">未找到相关结果</p>
                    <p className="text-xs text-slate-400 mt-1">尝试输入学生姓名、学号或考试名称</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-4 text-right">
          <p className="text-sm font-medium text-slate-700">{formatDateCN(new Date())}</p>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long' })}
          </p>
        </div>

        <button 
          onClick={handleExport}
          className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
          title="导出数据"
        >
          <Download size={19} />
        </button>

        <button 
          className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
          title="导入数据"
        >
          <Upload size={19} />
        </button>

        <button 
          className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all relative"
          title="通知"
        >
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button 
          className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
          title="设置"
        >
          <Settings size={19} />
        </button>
      </div>
    </motion.header>
  );
};

export default Topbar;
