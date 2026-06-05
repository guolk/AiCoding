import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ThumbsUp, ThumbsDown, Shuffle, X, MessageCircle, AlertTriangle, Award, Trash2 } from 'lucide-react';
import { useStudentStore } from '../../store/useStudentStore';
import { useClassroomStore } from '../../store/useClassroomStore';
import { BehaviorType } from '../../types';
import { shuffleArray, formatDateCN } from '../../utils/helpers';

const behaviorTemplates = [
  { type: 'positive' as BehaviorType, label: '积极回答问题', points: 1, icon: <MessageCircle size={16} /> },
  { type: 'positive' as BehaviorType, label: '主动参与讨论', points: 1, icon: <Award size={16} /> },
  { type: 'positive' as BehaviorType, label: '帮助同学', points: 2, icon: <ThumbsUp size={16} /> },
  { type: 'positive' as BehaviorType, label: '作业优秀', points: 2, icon: <Award size={16} /> },
  { type: 'negative' as BehaviorType, label: '上课走神', points: -1, icon: <AlertTriangle size={16} /> },
  { type: 'negative' as BehaviorType, label: '讲话扰乱纪律', points: -2, icon: <AlertTriangle size={16} /> },
  { type: 'negative' as BehaviorType, label: '未完成作业', points: -1, icon: <AlertTriangle size={16} /> },
  { type: 'negative' as BehaviorType, label: '迟到', points: -1, icon: <AlertTriangle size={16} /> },
];

const ClassroomPage: React.FC = () => {
  const { students } = useStudentStore();
  const { behaviors, addBehavior, deleteBehavior, getBehaviorsByDate, getStudentBehaviorPoints } = useClassroomStore();
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showBehaviorModal, setShowBehaviorModal] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [randomStudent, setRandomStudent] = useState<string | null>(null);
  const [rollingName, setRollingName] = useState('');
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const todayBehaviors = useMemo(() => getBehaviorsByDate(selectedDate), [behaviors, selectedDate, getBehaviorsByDate]);

  const studentPoints = useMemo(() => {
    return students.map(s => ({
      student: s,
      points: getStudentBehaviorPoints(s.id)
    })).sort((a, b) => b.points - a.points);
  }, [students, behaviors, getStudentBehaviorPoints]);

  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  const handleAddBehavior = (type: BehaviorType, description: string, points: number) => {
    if (!selectedStudentId) return;
    addBehavior(selectedStudentId, type, description, points);
    setShowBehaviorModal(false);
    setSelectedStudentId(null);
  };

  const startRandomRoll = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    const shuffled = shuffleArray([...students]);
    let index = 0;
    
    rollIntervalRef.current = setInterval(() => {
      setRollingName(shuffled[index % shuffled.length].name);
      index++;
    }, 50);

    setTimeout(() => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
      }
      const winner = shuffled[Math.floor(Math.random() * shuffled.length)];
      setRandomStudent(winner.id);
      setRollingName(winner.name);
      setIsRolling(false);
    }, 2000);
  };

  const stopRolling = () => {
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
    }
    setIsRolling(false);
  };

  const getBehaviorIcon = (type: BehaviorType) => {
    return type === 'positive' ? <ThumbsUp size={14} className="text-emerald-500" /> : <ThumbsDown size={14} className="text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">课堂管理</h1>
          <p className="text-slate-500 mt-1 text-sm">记录课堂表现，随机点名，提高课堂互动效率</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">课堂表现记录 - {formatDateCN(selectedDate)}</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-8 gap-3">
              {students.map((student, index) => {
                const points = getStudentBehaviorPoints(student.id);
                const todayStudentBehaviors = todayBehaviors.filter(b => b.studentId === student.id);
                const isSelected = selectedStudentId === student.id;
                const isRandomPick = randomStudent === student.id;
                
                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => { setSelectedStudentId(student.id); setShowBehaviorModal(true); }}
                    className={`relative p-3 rounded-xl cursor-pointer transition-all border-2 ${
                      isRandomPick
                        ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/20'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-transparent bg-slate-50 hover:border-slate-200 hover:shadow-md'
                    }`}
                  >
                    {isRandomPick && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                      >
                        👍
                      </motion.div>
                    )}
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
                    />
                    <p className="text-sm font-medium text-center text-slate-800 truncate">{student.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        points > 0 ? 'bg-emerald-100 text-emerald-700' : points < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {points > 0 ? '+' : ''}{points}
                      </span>
                    </div>
                    {todayStudentBehaviors.length > 0 && (
                      <div className="flex justify-center gap-0.5 mt-2">
                        {todayStudentBehaviors.slice(0, 3).map(b => (
                          <span key={b.id} className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                            {getBehaviorIcon(b.type)}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shuffle size={20} />
              随机点名
            </h3>
            <div className="bg-white/20 backdrop-blur rounded-xl p-6 mb-4 text-center">
              <motion.div
                key={rollingName}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold"
              >
                {rollingName || '点击开始'}
              </motion.div>
              {randomStudent && !isRolling && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 text-sm text-white/80"
                >
                  恭喜被选中！
                </motion.div>
              )}
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={isRolling ? stopRolling : startRandomRoll}
                disabled={isRolling}
                className="flex-1 py-3 bg-white text-amber-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Shuffle size={18} />
                {isRolling ? '停止' : '开始点名'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setRandomStudent(null); setRollingName(''); }}
                className="px-4 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
              >
                <X size={18} />
              </motion.button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4">今日表现排行</h3>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {studentPoints.slice(0, 10).map((item, index) => (
                <motion.div
                  key={item.student.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-amber-500 text-white' :
                    index === 1 ? 'bg-slate-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {index + 1}
                  </span>
                  <img
                    src={item.student.photoUrl}
                    alt={item.student.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <span className="flex-1 text-sm font-medium text-slate-800">{item.student.name}</span>
                  <span className={`text-sm font-semibold ${
                    item.points > 0 ? 'text-emerald-600' : item.points < 0 ? 'text-red-600' : 'text-slate-400'
                  }`}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">今日记录</h3>
        </div>
        <div className="p-5">
          {todayBehaviors.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
              <p>今日暂无表现记录，点击学生卡片开始记录</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {todayBehaviors.map((behavior, index) => {
                const student = students.find(s => s.id === behavior.studentId);
                return (
                  <motion.div
                    key={behavior.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 rounded-xl border ${
                      behavior.type === 'positive'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={student?.photoUrl}
                          alt={student?.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{student?.name}</p>
                          <p className="text-xs text-slate-500">{behavior.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteBehavior(behavior.id)}
                        className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} className="text-slate-400" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-xs font-semibold ${
                        behavior.type === 'positive' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {behavior.points > 0 ? '+' : ''}{behavior.points} 分
                      </span>
                      {getBehaviorIcon(behavior.type)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showBehaviorModal && selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => { setShowBehaviorModal(false); setSelectedStudentId(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={selectedStudent.photoUrl}
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-800">记录 {selectedStudent.name} 的表现</h3>
                  <p className="text-slate-500 text-sm">选择行为类型进行记录</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                  <ThumbsUp size={16} /> 正面表现
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {behaviorTemplates.filter(b => b.type === 'positive').map(template => (
                    <motion.button
                      key={template.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddBehavior(template.type, template.label, template.points)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                        {template.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{template.label}</p>
                        <p className="text-xs text-emerald-600">+{template.points} 分</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <ThumbsDown size={16} /> 负面表现
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {behaviorTemplates.filter(b => b.type === 'negative').map(template => (
                    <motion.button
                      key={template.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddBehavior(template.type, template.label, template.points)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white">
                        {template.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{template.label}</p>
                        <p className="text-xs text-red-600">{template.points} 分</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => { setShowBehaviorModal(false); setSelectedStudentId(null); }}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassroomPage;
