import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MessageSquare, Send, Palette, Target, Heart } from 'lucide-react';
import { useAppStore } from '../store';
import Tabs from '../components/ui/Tabs';
import RatingBar from '../components/ui/RatingBar';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import type { TabType } from '../types';

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStudentById, getCommunicationsByStudentId, addCommunication } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [newMessage, setNewMessage] = useState('');
  const [student, setStudent] = useState(getStudentById(id || ''));
  const [communications, setCommunications] = useState(getCommunicationsByStudentId(id || ''));

  useEffect(() => {
    if (id) {
      setStudent(getStudentById(id));
      setCommunications(getCommunicationsByStudentId(id));
    }
  }, [id, getStudentById, getCommunicationsByStudentId]);

  if (!student) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-gray-500 mb-4">未找到该学员</p>
        <button onClick={() => navigate('/students')} className="btn-primary">
          返回学员列表
        </button>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !id) return;
    addCommunication({
      studentId: id,
      type: 'teacher',
      content: newMessage.trim(),
    });
    setNewMessage('');
    setCommunications(getCommunicationsByStudentId(id));
  };

  const styleData = [
    { subject: '抽象倾向', A: student.styleAssessment.abstractTendency, fullMark: 10 },
    { subject: '具象倾向', A: student.styleAssessment.concreteTendency, fullMark: 10 },
    { subject: '色彩感', A: student.styleAssessment.colorSense, fullMark: 10 },
    { subject: '构图意识', A: student.styleAssessment.compositionAwareness, fullMark: 10 },
  ];

  const tabs = [
    { id: 'profile', label: '学员档案', icon: <User size={18} /> },
    { id: 'style', label: '风格评估', icon: <Palette size={18} /> },
    { id: 'communication', label: '家校沟通', icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/students')}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        返回学员列表
      </button>

      <div className="card mb-6 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-warm shadow-soft">
            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-display text-gray-800 mb-2">
              {student.name} <span className="text-2xl">🎨</span>
            </h1>
            <div className="flex flex-wrap gap-3">
              <span className="tag bg-white text-secondary-700">
                <Calendar size={14} className="mr-1" />
                {student.age}岁
              </span>
              <span className="tag bg-white text-purple-700">
                {student.className}
              </span>
              <span className="tag bg-white text-primary-700">
                入学 {student.enrollmentDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabType)} />

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center">
                <Heart size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-display text-gray-800">艺术发展特点</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {student.artCharacteristics}
            </p>
          </div>

          <div className="card animate-slide-up delay-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-cool flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-display text-gray-800">家长期望</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {student.parentExpectation}
            </p>
          </div>

          <div className="card lg:col-span-2 animate-slide-up delay-200">
            <h2 className="text-xl font-display text-gray-800 mb-4">📊 综合概览</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-warm text-white text-center">
                <p className="text-3xl font-display font-bold">{student.age}</p>
                <p className="text-sm opacity-80">年龄</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-cool text-white text-center">
                <p className="text-3xl font-display font-bold">
                  {Math.round(
                    (new Date().getTime() - new Date(student.enrollmentDate).getTime()) / 
                    (1000 * 60 * 60 * 24 * 30)
                  )}
                </p>
                <p className="text-sm opacity-80">学习月数</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-pink text-white text-center">
                <p className="text-3xl font-display font-bold">
                  {Math.round((student.styleAssessment.colorSense + student.styleAssessment.compositionAwareness) / 2)}
                </p>
                <p className="text-sm opacity-80">综合评分</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-green text-white text-center">
                <p className="text-3xl font-display font-bold">
                  {student.styleAssessment.abstractTendency > student.styleAssessment.concreteTendency ? '抽象' : '具象'}
                </p>
                <p className="text-sm opacity-80">绘画风格</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'style' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card animate-slide-up">
            <h2 className="text-xl font-display text-gray-800 mb-6">🎨 风格评估雷达图</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={styleData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Radar
                    name="评分"
                    dataKey="A"
                    stroke="#FFB347"
                    fill="#FFB347"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card animate-slide-up delay-100">
            <h2 className="text-xl font-display text-gray-800 mb-6">📈 详细评分</h2>
            <RatingBar label="抽象倾向" value={student.styleAssessment.abstractTendency} color="purple" />
            <RatingBar label="具象倾向" value={student.styleAssessment.concreteTendency} color="secondary" />
            <RatingBar label="色彩感" value={student.styleAssessment.colorSense} color="pink" />
            <RatingBar label="构图意识" value={student.styleAssessment.compositionAwareness} color="green" />
            
            <div className="mt-6 p-4 rounded-2xl bg-primary-50">
              <h3 className="font-medium text-primary-700 mb-2">💡 评估分析</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {student.styleAssessment.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communication' && (
        <div className="card animate-slide-up">
          <h2 className="text-xl font-display text-gray-800 mb-6">💬 家校沟通记录</h2>
          
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
            {communications.map((comm, index) => (
              <div
                key={comm.id}
                className={`flex gap-4 ${comm.type === 'parent' ? 'flex-row-reverse' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  comm.type === 'teacher' ? 'bg-gradient-warm' : 'bg-gradient-cool'
                }`}>
                  <span className="text-white font-bold text-sm">
                    {comm.type === 'teacher' ? '师' : '家'}
                  </span>
                </div>
                <div className={`flex-1 ${comm.type === 'parent' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-2xl max-w-lg ${
                    comm.type === 'teacher' 
                      ? 'bg-primary-50 text-left' 
                      : 'bg-secondary-50 text-right'
                  }`}>
                    <p className="text-gray-700 leading-relaxed">{comm.content}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{comm.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <input
              type="text"
              placeholder="输入消息内容..."
              className="input-field flex-1"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="btn-primary flex items-center gap-2"
              onClick={handleSendMessage}
            >
              <Send size={18} />
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
