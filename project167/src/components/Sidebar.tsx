import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  FileSpreadsheet,
  ListChecks,
  Settings,
  ShieldCheck,
  LineChart,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Thermometer,
  CalendarDays,
  Wind,
  CloudRain,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: '数据总览',
    items: [
      { path: '/', label: '数据总览', icon: LayoutDashboard },
    ],
  },
  {
    title: '观测数据管理',
    items: [
      { path: '/data/entry', label: '手动录入', icon: Database },
      { path: '/data/import', label: 'CSV导入', icon: FileSpreadsheet },
      { path: '/data/list', label: '数据列表', icon: ListChecks },
      { path: '/data/instruments', label: '仪器管理', icon: Settings },
      { path: '/data/quality', label: '质量审核', icon: ShieldCheck },
    ],
  },
  {
    title: '时序分析',
    items: [
      { path: '/analysis/timeseries', label: '时间序列', icon: LineChart },
      { path: '/analysis/extremes', label: '极端天气', icon: AlertTriangle },
      { path: '/analysis/trend', label: '气候倾向率', icon: TrendingUp },
    ],
  },
  {
    title: '气候统计',
    items: [
      { path: '/statistics/summary', label: '统计摘要', icon: BarChart3 },
      { path: '/statistics/anomaly', label: '气候距平', icon: Thermometer },
      { path: '/statistics/seasons', label: '季节划分', icon: CalendarDays },
    ],
  },
  {
    title: '图表中心',
    items: [
      { path: '/charts/windrose', label: '风向玫瑰图', icon: Wind },
      { path: '/charts/precipitation', label: '降水量图', icon: CloudRain },
      { path: '/charts/temperature', label: '气温折线图', icon: Thermometer },
      { path: '/charts/dualaxis', label: '温降双轴图', icon: LineChart },
      { path: '/charts/report', label: '报告生成', icon: FileText },
    ],
  },
];

function NavGroup({ title, items, isOpen, onToggle }: { title: string; items: NavItem[]; isOpen: boolean; onToggle: () => void }) {
  const location = useLocation();
  const hasActiveChild = items.some(
    (item) => location.pathname === item.path || item.children?.some((c) => location.pathname === c.path)
  );

  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors ${hasActiveChild ? 'text-primary-600' : ''}`}
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
      </button>
      <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-item ml-2 ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    '数据总览': true,
    '观测数据管理': true,
    '时序分析': false,
    '气候统计': false,
    '图表中心': false,
  });

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <CloudRain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">气象观测站</h1>
            <p className="text-xs text-slate-500">数据分析系统 v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group) => (
          <NavGroup
            key={group.title}
            title={group.title}
            items={group.items}
            isOpen={openGroups[group.title] ?? true}
            onToggle={() => toggleGroup(group.title)}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
            气
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">气象观测员</p>
            <p className="text-xs text-slate-500">在线</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
