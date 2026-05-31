import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mountain,
  Footprints,
  TrendingUp,
  Shield,
  Users,
  ChevronDown,
  Activity,
  Flame,
  MapPin,
  Target,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: { label: string; path: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  {
    label: '训练记录',
    icon: <Activity size={20} />,
    children: [
      {
        label: '攀岩',
        path: '/app/training/climbing',
        icon: <Mountain size={16} />,
      },
      {
        label: '滑板',
        path: '/app/training/skateboarding',
        icon: <Footprints size={16} />,
      },
      {
        label: '冲浪',
        path: '/app/training/surfing',
        icon: <MapPin size={16} />,
      },
      {
        label: '伤病管理',
        path: '/app/training/injury',
        icon: <Shield size={16} />,
      },
    ],
  },
  {
    label: '进阶追踪',
    icon: <TrendingUp size={20} />,
    children: [
      {
        label: '技能等级',
        path: '/app/progress/skills',
        icon: <Target size={16} />,
      },
      {
        label: '里程碑',
        path: '/app/progress/milestones',
        icon: <Flame size={16} />,
      },
      {
        label: '进度分析',
        path: '/app/progress/analytics',
        icon: <TrendingUp size={16} />,
      },
    ],
  },
  {
    label: '风险管理',
    icon: <Shield size={20} />,
    children: [
      {
        label: '装备检查',
        path: '/app/safety/equipment',
        icon: <Activity size={16} />,
      },
      {
        label: '场地评估',
        path: '/app/safety/locations',
        icon: <MapPin size={16} />,
      },
      {
        label: '紧急联系人',
        path: '/app/safety/emergency',
        icon: <Users size={16} />,
      },
    ],
  },
  {
    label: '社群挑战',
    icon: <Users size={20} />,
    children: [
      {
        label: '个人目标',
        path: '/app/community/goals',
        icon: <Target size={16} />,
      },
      {
        label: '训练伙伴',
        path: '/app/community/partners',
        icon: <Users size={16} />,
      },
      {
        label: '运动旅行',
        path: '/app/community/trips',
        icon: <Calendar size={16} />,
      },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['训练记录']);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((i) => i !== label)
        : [...prev, label]
    );
  };

  const isActivePath = (path: string) => location.pathname === path;
  const isParentActive = (children?: { path: string }[]) =>
    children?.some((c) => location.pathname === c.path);

  return (
    <aside className="w-64 bg-dark-900 border-r border-dark-700 h-screen flex flex-col sticky top-0">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/app/dashboard')}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <Flame className="text-white" size={22} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white">
              Extreme<span className="text-primary-500">Track</span>
            </h1>
            <p className="text-xs text-dark-400">极限运动追踪</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          <li>
            <button
              onClick={() => navigate('/app/dashboard')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                location.pathname === '/app/dashboard'
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-dark-300 hover:bg-dark-800 hover:text-white'
              )}
            >
              <Mountain size={20} />
              仪表盘
            </button>
          </li>

          {navItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => toggleExpand(item.label)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isParentActive(item.children)
                    ? 'bg-dark-800 text-white'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </div>
                <ChevronDown
                  className={cn(
                    'transition-transform duration-200',
                    expandedItems.includes(item.label) && 'rotate-180'
                  )}
                  size={16}
                />
              </button>

              {expandedItems.includes(item.label) && item.children && (
                <ul className="mt-1 ml-4 space-y-1">
                  {item.children.map((child) => (
                    <li key={child.path}>
                      <button
                        onClick={() => navigate(child.path)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200',
                          isActivePath(child.path)
                            ? 'bg-primary-600/10 text-primary-400 border-l-2 border-primary-500'
                            : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'
                        )}
                      >
                        {child.icon}
                        {child.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-dark-700">
        <div className="bg-dark-800 rounded-xl p-4">
          <p className="text-xs text-dark-400 mb-2">需要帮助？</p>
          <p className="text-sm text-dark-200">查看使用指南</p>
        </div>
      </div>
    </aside>
  );
}
