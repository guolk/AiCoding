
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Globe,
  BookOpen,
  Users,
  Languages,
  Map,
  Library,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Shield,
  Clock,
  Gavel,
  ScrollText,
  PartyPopper,
  HeartHandshake,
  BarChart3
} from 'lucide-react';

interface NavGroup {
  title: string;
  icon: React.ReactNode;
  links: {
    to: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: '总览',
    icon: <Globe className="w-5 h-5" />,
    links: [
      { to: '/', label: '仪表盘', icon: <Sparkles className="w-4 h-4" /> }
    ]
  },
  {
    title: '世界观文档',
    icon: <BookOpen className="w-5 h-5" />,
    links: [
      { to: '/world', label: '世界基础设定', icon: <Globe className="w-4 h-4" /> },
      { to: '/geography', label: '地理与文明', icon: <Map className="w-4 h-4" /> },
      { to: '/timeline', label: '历史时间线', icon: <Clock className="w-4 h-4" /> },
      { to: '/rules-check', label: '规则一致性检查', icon: <Gavel className="w-4 h-4" /> }
    ]
  },
  {
    title: '人物与阵营',
    icon: <Users className="w-5 h-5" />,
    links: [
      { to: '/characters', label: '人物档案', icon: <Users className="w-4 h-4" /> },
      { to: '/factions', label: '阵营组织', icon: <Shield className="w-4 h-4" /> },
      { to: '/power-shifts', label: '权力格局变化', icon: <BarChart3 className="w-4 h-4" /> }
    ]
  },
  {
    title: '语言与文化',
    icon: <Languages className="w-5 h-5" />,
    links: [
      { to: '/languages', label: '语言设计', icon: <Languages className="w-4 h-4" /> },
      { to: '/culture', label: '文化习俗', icon: <PartyPopper className="w-4 h-4" /> },
      { to: '/religion', label: '宗教神话', icon: <ScrollText className="w-4 h-4" /> }
    ]
  },
  {
    title: '地图与可视化',
    icon: <Map className="w-5 h-5" />,
    links: [
      { to: '/map', label: '世界地图', icon: <Map className="w-4 h-4" /> }
    ]
  },
  {
    title: '参考与灵感',
    icon: <Library className="w-5 h-5" />,
    links: [
      { to: '/references', label: '参考素材', icon: <Library className="w-4 h-4" /> },
      { to: '/inspirations', label: '灵感笔记', icon: <Lightbulb className="w-4 h-4" /> }
    ]
  }
];

const Sidebar = () => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navGroups.map(g => g.title)
  );

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border h-screen flex-shrink-0 flex flex-col">
      <div className="p-6 border-b border-dark-border">
        <h1 className="font-display text-2xl font-bold text-gold flex items-center gap-2">
          <Sparkles className="w-8 h-8" />
          世界构建
        </h1>
        <p className="text-gray-400 text-sm mt-1">幻想世界百科全书</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-2">
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:text-gold hover:bg-dark-bg/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-gold">{group.icon}</span>
                <span className="font-medium text-sm">{group.title}</span>
              </div>
              {expandedGroups.includes(group.title) ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {expandedGroups.includes(group.title) && (
              <div className="ml-4 mt-1">
                {group.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2 rounded-l-lg text-sm transition-all ${
                        isActive
                          ? 'bg-gold/10 text-gold border-r-2 border-gold'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-dark-bg/30'
                      }`
                    }
                  >
                    {link.icon}
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-border">
        <div className="bg-dark-bg/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">数据自动保存</p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            本地存储已启用
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
