import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, BarChart3, BookOpen, TrendingUp } from 'lucide-react';
import { useStudentStore } from '../../store/useStudentStore';
import { useGradeStore } from '../../store/useGradeStore';
import { Exam } from '../../types';
import { formatDateCN } from '../../utils/helpers';

const SUBJECTS = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];

const GradesPage: React.FC = () => {
  const { students } = useStudentStore();
  const { exams, grades, addExam, updateExam, deleteExam, addGrade, getGradesByExam, getExamStats } = useGradeStore();
  
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState('语文');
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examForm, setExamForm] = useState({ name: '', date: new Date().toISOString().split('T')[0], term: '2024-2025学年第一学期' });
  const [editingScores, setEditingScores] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);

  const selectedExam = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);
  const examGrades = useMemo(() => getGradesByExam(selectedExamId), [grades, selectedExamId, getGradesByExam]);
  
  const gradeMap = useMemo(() => {
    const map = new Map<string, number>();
    examGrades.filter(g => g.subject === selectedSubject).forEach(g => map.set(g.studentId, g.score));
    return map;
  }, [examGrades, selectedSubject]);

  const stats = useMemo(() => getExamStats(selectedExamId, selectedSubject), [grades, selectedExamId, selectedSubject, getExamStats]);

  const handleSaveExam = () => {
    if (!examForm.name.trim()) return;
    
    if (editingExam) {
      updateExam(editingExam.id, examForm);
    } else {
      addExam(examForm);
    }
    
    setShowExamModal(false);
    setEditingExam(null);
    setExamForm({ name: '', date: new Date().toISOString().split('T')[0], term: '2024-2025学年第一学期' });
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setExamForm({ name: exam.name, date: exam.date, term: exam.term });
    setShowExamModal(true);
  };

  const handleDeleteExam = (id: string) => {
    if (window.confirm('确定要删除这次考试吗？相关的成绩数据也会被删除。')) {
      deleteExam(id);
      if (selectedExamId === id && exams.length > 1) {
        setSelectedExamId(exams.find(e => e.id !== id)?.id || '');
      }
    }
  };

  const handleStartEdit = () => {
    const scores: Record<string, number> = {};
    students.forEach(s => {
      const score = gradeMap.get(s.id);
      if (score !== undefined) scores[s.id] = score;
    });
    setEditingScores(scores);
    setIsEditing(true);
  };

  const handleSaveScores = () => {
    Object.entries(editingScores).forEach(([studentId, score]) => {
      const numScore = Number(score);
      if (!isNaN(numScore) && numScore >= 0 && numScore <= 150) {
        addGrade(studentId, selectedExamId, numScore, selectedSubject);
      }
    });
    setIsEditing(false);
    setEditingScores({});
  };

  const handleScoreChange = (studentId: string, value: string) => {
    const num = parseInt(value) || 0;
    setEditingScores(prev => ({ ...prev, [studentId]: Math.min(150, Math.max(0, num)) }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">成绩管理</h1>
          <p className="text-slate-500 mt-1 text-sm">录入和追踪学生考试成绩，分析学习趋势</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setEditingExam(null); setExamForm({ name: '', date: new Date().toISOString().split('T')[0], term: '2024-2025学年第一学期' }); setShowExamModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
          >
            <Plus size={16} />
            新建考试
          </motion.button>
        </div>
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
              <p className="text-2xl font-bold text-slate-800">{stats.average.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">及格率</p>
              <p className="text-2xl font-bold text-slate-800">{stats.passRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">优秀率</p>
              <p className="text-2xl font-bold text-slate-800">{stats.excellentRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-purple-600 font-bold">分</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">最高分/最低分</p>
              <p className="text-2xl font-bold text-slate-800">{stats.maxScore}/{stats.minScore}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">考试列表</h3>
          </div>
          <div className="p-3 max-h-[500px] overflow-y-auto">
            {exams.map((exam) => (
              <motion.div
                key={exam.id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedExamId(exam.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all mb-2 ${
                  selectedExamId === exam.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${selectedExamId === exam.id ? 'text-white' : 'text-slate-800'}`}>{exam.name}</p>
                    <p className={`text-xs mt-1 ${selectedExamId === exam.id ? 'text-white/80' : 'text-slate-500'}`}>{formatDateCN(exam.date)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditExam(exam); }}
                      className={`p-1.5 rounded-lg ${selectedExamId === exam.id ? 'hover:bg-white/20' : 'hover:bg-slate-100'}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam.id); }}
                      className={`p-1.5 rounded-lg ${selectedExamId === exam.id ? 'hover:bg-white/20' : 'hover:bg-slate-100'}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-slate-800">{selectedExam?.name || '请选择考试'}</h3>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-500/20"
                  >
                    <Edit2 size={14} />
                    编辑成绩
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveScores}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-emerald-500/20"
                    >
                      <Save size={14} />
                      保存
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setIsEditing(false); setEditingScores({}); }}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50"
                    >
                      <X size={14} />
                      取消
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 max-h-[450px] overflow-y-auto">
            <div className="grid grid-cols-5 gap-4">
              {students.map((student, index) => {
                const score = gradeMap.get(student.id);
                const editingScore = editingScores[student.id];
                
                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="bg-slate-50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.studentNo}</p>
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="150"
                        value={editingScore ?? ''}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        placeholder="分数"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    ) : (
                      <div className={`w-full py-2 rounded-lg text-center font-semibold text-lg ${
                        score !== undefined ? getScoreColor(score) : 'bg-slate-100 text-slate-400'
                      }`}>
                        {score !== undefined ? score : '-'}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showExamModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowExamModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-6">{editingExam ? '编辑考试' : '新建考试'}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">考试名称</label>
                  <input
                    type="text"
                    value={examForm.name}
                    onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                    placeholder="如：期中考试、第一次月考"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">考试日期</label>
                  <input
                    type="date"
                    value={examForm.date}
                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">学期</label>
                  <select
                    value={examForm.term}
                    onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="2024-2025学年第一学期">2024-2025学年第一学期</option>
                    <option value="2024-2025学年第二学期">2024-2025学年第二学期</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowExamModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveExam}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
                >
                  {editingExam ? '保存修改' : '创建考试'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GradesPage;
