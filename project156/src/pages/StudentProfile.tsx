import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, Heart, Target, Home, MessageCircle, Edit2, Save, X,
  BookOpen, Users, Calendar, Clock, GraduationCap, Briefcase
} from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { cn } from '@/lib/utils';

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);
  
  const { 
    currentStudent, communications, 
    fetchStudent, fetchCommunications, updateStudent, addCommunication,
    loading
  } = useStudentStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    interests: '',
    learningStyle: '',
    familyBackground: '',
    shortTermGoals: '',
    longTermGoals: '',
  });

  const [showAddCommunication, setShowAddCommunication] = useState(false);
  const [newCommunication, setNewCommunication] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'parent_meeting' as 'home_visit' | 'parent_meeting',
    content: '',
    teacher: '',
  });

  useEffect(() => {
    if (studentId) {
      fetchStudent(studentId);
      fetchCommunications(studentId);
    }
  }, [studentId, fetchStudent, fetchCommunications]);

  useEffect(() => {
    if (currentStudent) {
      setEditData({
        interests: currentStudent.interests,
        learningStyle: currentStudent.learningStyle,
        familyBackground: currentStudent.familyBackground,
        shortTermGoals: currentStudent.shortTermGoals,
        longTermGoals: currentStudent.longTermGoals,
      });
    }
  }, [currentStudent]);

  const handleSave = () => {
    if (studentId) {
      updateStudent(studentId, editData);
      setIsEditing(false);
    }
  };

  const handleAddCommunication = () => {
    if (studentId && newCommunication.content && newCommunication.teacher) {
      addCommunication(studentId, newCommunication);
      setNewCommunication({
        date: new Date().toISOString().split('T')[0],
        type: 'parent_meeting',
        content: '',
        teacher: '',
      });
      setShowAddCommunication(false);
    }
  };

  if (!currentStudent) {
    return (
      <div className="card p-12 text-center">
        <div className="animate-pulse">加载中...</div>
      </div>
    );
  }

  const infoCards = [
    { 
      icon: Heart, 
      label: '兴趣特长', 
      field: 'interests',
      value: currentStudent.interests,
      color: 'text-rose-500 bg-rose-50'
    },
    { 
      icon: GraduationCap, 
      label: '学习风格', 
      field: 'learningStyle',
      value: currentStudent.learningStyle,
      color: 'text-blue-500 bg-blue-50'
    },
    { 
      icon: Home, 
      label: '家庭背景', 
      field: 'familyBackground',
      value: currentStudent.familyBackground,
      color: 'text-amber-500 bg-amber-50'
    },
  ];

  const goalCards = [
    { 
      icon: Target, 
      label: '短期学期目标', 
      field: 'shortTermGoals',
      value: currentStudent.shortTermGoals,
      gradient: 'from-blue-500 to-indigo-600'
    },
    { 
      icon: Briefcase, 
      label: '长期培养方向', 
      field: 'longTermGoals',
      value: currentStudent.longTermGoals,
      gradient: 'from-teal-500 to-emerald-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Student Header Card */}
      <div className="card p-6 gradient-blue text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={currentStudent.avatar}
            alt={currentStudent.name}
            className="w-20 h-20 rounded-2xl border-4 border-white/30"
          />
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold mb-1">{currentStudent.name}</h1>
            <p className="text-blue-100">{currentStudent.grade}年级{currentStudent.className}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm text-blue-100">
                <Calendar className="w-4 h-4" />
                <span>入学：{new Date(currentStudent.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            <span>{isEditing ? '取消' : '编辑'}</span>
          </button>
        </div>
      </div>

      {/* Basic Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {infoCards.map((card, index) => (
          <div key={card.field} className="card p-5 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-start gap-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", card.color)}>
                <card.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-500 mb-1">{card.label}</p>
                {isEditing ? (
                  <textarea
                    value={editData[card.field as keyof typeof editData]}
                    onChange={(e) => setEditData({ ...editData, [card.field]: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{card.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            保存修改
          </button>
        </div>
      )}

      {/* Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {goalCards.map((card, index) => (
          <div key={card.field} className="card overflow-hidden animate-slide-up" style={{ animationDelay: `${(index + 3) * 100}ms` }}>
            <div className={cn("p-4 text-white bg-gradient-to-r", card.gradient)}>
              <div className="flex items-center gap-3">
                <card.icon className="w-5 h-5" />
                <h3 className="font-display font-semibold">{card.label}</h3>
              </div>
            </div>
            <div className="p-5">
              {isEditing ? (
                <textarea
                  value={editData[card.field as keyof typeof editData]}
                  onChange={(e) => setEditData({ ...editData, [card.field]: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-32"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed">{card.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Parent Communications */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-slate-800">家长沟通记录</h3>
          </div>
          <button
            onClick={() => setShowAddCommunication(!showAddCommunication)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              showAddCommunication
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-primary-600 text-white hover:bg-primary-700"
            )}
          >
            {showAddCommunication ? '取消' : '+ 添加记录'}
          </button>
        </div>

        {/* Add Communication Form */}
        {showAddCommunication && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
                <input
                  type="date"
                  value={newCommunication.date}
                  onChange={(e) => setNewCommunication({ ...newCommunication, date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">类型</label>
                <select
                  value={newCommunication.type}
                  onChange={(e) => setNewCommunication({ ...newCommunication, type: e.target.value as 'home_visit' | 'parent_meeting' })}
                  className="input-field"
                >
                  <option value="parent_meeting">家长会</option>
                  <option value="home_visit">家访</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">记录人</label>
                <input
                  type="text"
                  value={newCommunication.teacher}
                  onChange={(e) => setNewCommunication({ ...newCommunication, teacher: e.target.value })}
                  placeholder="老师姓名"
                  className="input-field"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">沟通内容</label>
              <textarea
                value={newCommunication.content}
                onChange={(e) => setNewCommunication({ ...newCommunication, content: e.target.value })}
                placeholder="请输入沟通要点..."
                className="input-field h-32 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddCommunication(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                取消
              </button>
              <button onClick={handleAddCommunication} className="btn-primary">
                保存记录
              </button>
            </div>
          </div>
        )}

        {/* Communication List */}
        <div className="space-y-4">
          {communications.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无沟通记录</p>
            </div>
          ) : (
            communications.map((comm, index) => (
              <div
                key={comm.id}
                className="relative pl-8 pb-6 border-l-2 border-slate-200 last:border-l-0 last:pb-0 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "absolute -left-2.5 top-0 w-5 h-5 rounded-full border-2 border-white",
                  comm.type === 'home_visit' ? 'bg-teal-500' : 'bg-amber-500'
                )} />
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      comm.type === 'home_visit' 
                        ? 'bg-teal-100 text-teal-700' 
                        : 'bg-amber-100 text-amber-700'
                    )}>
                      {comm.type === 'home_visit' ? '家访' : '家长会'}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {comm.date}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <User className="w-3.5 h-3.5" />
                      {comm.teacher}
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{comm.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">15</p>
          <p className="text-sm text-slate-500">作品数量</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">2</p>
          <p className="text-sm text-slate-500">评估次数</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">4</p>
          <p className="text-sm text-slate-500">里程碑</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
            <MessageCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{communications.length}</p>
          <p className="text-sm text-slate-500">沟通记录</p>
        </div>
      </div>
    </div>
  );
}
