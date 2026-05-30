import { useState } from 'react';
import {
  User,
  Mail,
  Building2,
  RefreshCw,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  ChevronRight,
  Globe,
  GraduationCap,
  Key,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState({
    name: 'Dr. Zhang',
    email: 'zhang@university.edu',
    affiliation: '清华大学',
    department: '计算机科学与技术系',
    orcid: '0000-0001-2345-6789',
    scholarId: 'xxx_xxx_xxx'
  });
  const [syncSettings, setSyncSettings] = useState({
    googleScholar: true,
    semanticScholar: true,
    altmetric: true,
    autoSync: true,
    syncInterval: 7
  });
  const [notificationSettings, setNotificationSettings] = useState({
    newCitation: true,
    newMention: true,
    weeklyReport: true,
    emailNotifications: true
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'api', label: 'API 设置', icon: Key },
    { id: 'sync', label: '同步设置', icon: RefreshCw },
    { id: 'notifications', label: '通知偏好', icon: Bell },
    { id: 'data', label: '数据管理', icon: Database },
    { id: 'privacy', label: '隐私设置', icon: Shield }
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 font-display">设置</h2>
        <p className="text-gray-500 mt-1">管理您的账户和应用偏好</p>
      </div>

      <div className="flex gap-8">
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1">
          {activeSection === 'profile' && (
            <div className="card">
              <h3 className="card-header">个人资料</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{profile.name}</h4>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <button className="mt-2 text-sm text-accent-600 hover:text-accent-700">
                      更换头像
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">所属机构</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={profile.affiliation}
                        onChange={e => setProfile({ ...profile, affiliation: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">院系</label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={profile.department}
                        onChange={e => setProfile({ ...profile, department: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ORCID</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={profile.orcid}
                        onChange={e => setProfile({ ...profile, orcid: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Scholar ID</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={profile.scholarId}
                        onChange={e => setProfile({ ...profile, scholarId: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="btn-primary flex items-center gap-2"
                  >
                    {saved ? (
                      <><CheckCircle2 className="w-4 h-4" /> 已保存</>
                    ) : (
                      <><Save className="w-4 h-4" /> 保存更改</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="card">
              <h3 className="card-header">API 设置</h3>
              <p className="text-sm text-gray-500 mb-6">
                配置外部API密钥以自动获取引用和社交媒体数据
              </p>
              
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">关于 API 密钥</h4>
                      <p className="text-sm text-blue-600 mt-1">
                        Pro 版本支持配置自定义 API 密钥。当前演示版本使用示例数据展示功能。
                      </p>
                    </div>
                  </div>
                </div>

                {[
                  { name: 'Google Scholar', desc: '自动同步引用数据', status: 'connected' },
                  { name: 'Semantic Scholar', desc: '获取论文元数据', status: 'connected' },
                  { name: 'Altmetric', desc: '社交媒体关注度', status: 'connected' },
                  { name: 'Crossref', desc: 'DOI 解析和元数据', status: 'demo' }
                ].map((api, idx) => (
                  <div key={api.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div>
                      <h4 className="font-medium text-gray-800">{api.name}</h4>
                      <p className="text-sm text-gray-500">{api.desc}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      api.status === 'connected'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {api.status === 'connected' ? '已连接' : '演示模式'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'sync' && (
            <div className="card">
              <h3 className="card-header">同步设置</h3>
              <div className="space-y-6">
                {[
                  { key: 'googleScholar', label: 'Google Scholar', desc: '自动同步引用计数' },
                  { key: 'semanticScholar', label: 'Semantic Scholar', desc: '同步论文元数据' },
                  { key: 'altmetric', label: 'Altmetric', desc: '同步社交媒体数据' },
                  { key: 'autoSync', label: '自动同步', desc: '定期自动更新数据' }
                ].map((item, idx) => (
                  <div key={item.key} className="flex items-center justify-between animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div>
                      <h4 className="font-medium text-gray-800">{item.label}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setSyncSettings({ ...syncSettings, [item.key]: !syncSettings[item.key as keyof typeof syncSettings] })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        syncSettings[item.key as keyof typeof syncSettings]
                          ? 'bg-accent-500'
                          : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        syncSettings[item.key as keyof typeof syncSettings]
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">同步间隔</label>
                  <select
                    value={syncSettings.syncInterval}
                    onChange={e => setSyncSettings({ ...syncSettings, syncInterval: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value={1}>每天</option>
                    <option value={3}>每3天</option>
                    <option value={7}>每周</option>
                    <option value={14}>每两周</option>
                    <option value={30}>每月</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" /> 保存设置
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="card">
              <h3 className="card-header">通知偏好</h3>
              <div className="space-y-6">
                {[
                  { key: 'newCitation', label: '新引用通知', desc: '当您的论文获得新引用时' },
                  { key: 'newMention', label: '社交媒体提及', desc: '当您的研究在社交媒体上被讨论时' },
                  { key: 'weeklyReport', label: '每周报告', desc: '每周接收影响力汇总报告' },
                  { key: 'emailNotifications', label: '邮件通知', desc: '通过邮件接收通知' }
                ].map((item, idx) => (
                  <div key={item.key} className="flex items-center justify-between animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div>
                      <h4 className="font-medium text-gray-800">{item.label}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({ ...notificationSettings, [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings] })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notificationSettings[item.key as keyof typeof notificationSettings]
                          ? 'bg-accent-500'
                          : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notificationSettings[item.key as keyof typeof notificationSettings]
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" /> 保存设置
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="card-header">导出数据</h3>
                <p className="text-sm text-gray-500 mb-4">导出您的所有学术数据</p>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    导出为 CSV
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    导出为 JSON
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    导出为 BibTeX
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="card-header">导入数据</h3>
                <p className="text-sm text-gray-500 mb-4">从其他系统导入您的论文数据</p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">拖拽文件到此处或</p>
                  <button className="text-accent-600 hover:text-accent-700 font-medium">
                    点击上传
                  </button>
                  <p className="text-xs text-gray-400 mt-2">支持 CSV、JSON、BibTeX 格式</p>
                </div>
              </div>

              <div className="card border-red-100">
                <h3 className="text-red-600 font-semibold mb-2">危险区域</h3>
                <p className="text-sm text-gray-500 mb-4">
                  清除所有数据将永久删除您的所有论文、引用记录和设置。此操作不可撤销。
                </p>
                <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  清除所有数据
                </button>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="card">
              <h3 className="card-header">隐私设置</h3>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-800 mb-2">数据隐私</h4>
                  <p className="text-sm text-gray-500">
                    您的数据存储在安全的服务器上，仅用于提供学术影响力追踪服务。我们不会与第三方共享您的个人信息。
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">公开个人主页</h4>
                    <p className="text-sm text-gray-500">允许他人查看您的学术影响力数据</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-gray-200">
                    <div className="w-5 h-5 bg-white rounded-full shadow translate-x-0.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">匿名对比</h4>
                    <p className="text-sm text-gray-500">参与同领域学者的匿名对比分析</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-accent-500">
                    <div className="w-5 h-5 bg-white rounded-full shadow translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">数据收集</h4>
                    <p className="text-sm text-gray-500">允许收集匿名使用数据以改进服务</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-accent-500">
                    <div className="w-5 h-5 bg-white rounded-full shadow translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
