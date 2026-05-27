import { useState } from 'react';
import { useStore } from '../store/useStore';
import { mockUsers } from '../data/mockData';
import { LayoutDashboard, FolderKanban, FlaskConical, BookOpen, Award, Calendar, MessageSquare, ArrowRight } from 'lucide-react';

export default function Home() {
  const { setCurrentUser } = useStore();
  const [selectedUser, setSelectedUser] = useState(1);

  const features = [
    { icon: FolderKanban, title: '项目管理', desc: '研究项目全生命周期管理' },
    { icon: FlaskConical, title: '实验记录', desc: '数字化实验记录本' },
    { icon: BookOpen, title: '文献共享', desc: '课题组文献库共建' },
    { icon: Award, title: '成果管理', desc: '论文专利进度追踪' },
    { icon: Calendar, title: '组会管理', desc: '会议纪要与行动追踪' },
    { icon: MessageSquare, title: '技术讨论', desc: '保留技术讨论历史' },
  ];

  const handleLogin = () => {
    const user = mockUsers.find((u) => u.id === selectedUser);
    if (user) {
      setCurrentUser(user);
    }
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-neutral-900">LabCollab</span>
            </div>
            <button onClick={handleLogin} className="btn-primary flex items-center gap-2">
              登录
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            课题组协作平台
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            为研究小组打造的一站式协作工具，涵盖项目管理、实验记录、文献共享、成果追踪和组内沟通
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-medium text-neutral-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-neutral-500">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="card p-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">选择用户登录</h2>
          <div className="space-y-3">
            {[
              { id: 1, name: '张明', role: '课题组组长' },
              { id: 2, name: '李华', role: '博士生' },
              { id: 3, name: '王芳', role: '硕士生' },
              { id: 4, name: '陈强', role: '博士后' },
            ].map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedUser === user.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-100 hover:border-neutral-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                  selectedUser === user.id ? 'bg-primary-600' : 'bg-neutral-400'
                }`}>
                  {user.name[0]}
                </div>
                <div className="text-left">
                  <p className="font-medium text-neutral-900">{user.name}</p>
                  <p className="text-sm text-neutral-500">{user.role}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={handleLogin} className="btn-primary w-full mt-6">
            登录系统
          </button>
        </div>
      </div>
    </div>
  );
}
