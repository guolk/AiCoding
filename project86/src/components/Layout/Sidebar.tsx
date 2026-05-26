import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BookOpen, 
  FolderGit2, 
  Code2, 
  Users, 
  Briefcase,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  BarChart3,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['learning']);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(m => m !== menu) 
        : [...prev, menu]
    );
  };

  const menuItems = [
    {
      id: 'learning',
      icon: BookOpen,
      label: '学习路径管理',
      children: [
        { path: '/learning/roadmap', label: '技术路线图', icon: GraduationCap },
        { path: '/learning/resources', label: '资源评级推荐', icon: BookOpen },
        { path: '/learning/notes', label: '学习笔记', icon: Code2 },
      ]
    },
    {
      id: 'projects',
      icon: FolderGit2,
      label: '项目作品集',
      children: [
        { path: '/projects/list', label: '项目档案', icon: FolderGit2 },
        { path: '/projects/media', label: '素材管理', icon: FolderGit2 },
      ]
    },
    {
      id: 'coding',
      icon: Code2,
      label: '代码练习记录',
      children: [
        { path: '/coding/problems', label: '刷题记录', icon: Code2 },
        { path: '/coding/statistics', label: '进度统计', icon: BarChart3 },
        { path: '/coding/wrong', label: '错题本', icon: AlertCircle },
      ]
    },
    {
      id: 'interview',
      icon: Users,
      label: '面试准备',
      children: [
        { path: '/interview/knowledge', label: '知识点清单', icon: BookOpen },
        { path: '/interview/mock', label: '模拟面试', icon: Users },
        { path: '/interview/questions', label: '问题答案库', icon: MessageSquare },
      ]
    },
    {
      id: 'jobs',
      icon: Briefcase,
      label: '求职进度',
      children: [
        { path: '/jobs/list', label: '投递管理', icon: Briefcase },
      ]
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary-400" />
          <span>代码学习助手</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">一站式学习与求职管理工具</p>
      </div>
      
      <nav className="flex-1 py-4">
        {menuItems.map(menu => (
          <div key={menu.id} className="mb-1">
            <button
              onClick={() => toggleMenu(menu.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <menu.icon className="w-5 h-5 text-primary-400" />
                <span className="font-medium text-sm">{menu.label}</span>
              </div>
              {expandedMenus.includes(menu.id) ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            
            {expandedMenus.includes(menu.id) && (
              <div className="ml-4 border-l border-slate-700">
                {menu.children.map(child => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <child.icon className="w-4 h-4" />
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-xs text-slate-400">数据自动保存到本地</p>
          <p className="text-xs text-primary-400 mt-1">✓ 所有变更实时持久化</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
