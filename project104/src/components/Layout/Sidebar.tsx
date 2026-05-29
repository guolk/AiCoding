import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import {
  Calendar,
  Heart,
  Target,
  BarChart3,
  FileDown,
  Home,
  ChevronRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { year } = useParams();
  const { currentYear, data } = useYearlyReviewStore();
  const activeYear = year ? parseInt(year) : currentYear;

  const navItems: NavItem[] = [
    { path: '/', label: '首页仪表盘', icon: Home },
    { path: `/review/${activeYear}`, label: '年度回顾', icon: Calendar },
    { path: `/gratitude/${activeYear}`, label: '感恩与反思', icon: Heart },
    { path: `/plan/${activeYear}`, label: '新年计划', icon: Target },
    { path: `/visualize/${activeYear}`, label: '可视化总结', icon: BarChart3 },
    { path: `/export/${activeYear}`, label: '分享与存档', icon: FileDown },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.split('/').slice(0, -1).join('/'));
  };

  const getModuleProgress = () => {
    const yearData = data[activeYear];
    if (!yearData) return { completed: 0, total: 5 };

    let completed = 0;
    
    const reviewCompleted = yearData.review.domains.some(d => 
      d.questions.some(q => q.answer.trim().length > 0)
    ) || yearData.review.timeline.length > 0;
    if (reviewCompleted) completed++;

    const gratitudeCompleted = yearData.gratitude.achievements.length > 0 ||
      yearData.gratitude.gratitudeItems.length > 0;
    if (gratitudeCompleted) completed++;

    const planCompleted = yearData.plan.goals.length > 0;
    if (planCompleted) completed++;

    const statsCompleted = Object.values(yearData.review.statistics).some(v => 
      typeof v === 'number' && v > 0
    );
    if (statsCompleted) completed++;

    return { completed, total: 4 };
  };

  const progress = getModuleProgress();
  const progressPercentage = (progress.completed / progress.total) * 100;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64",
        "bg-white border-r border-warm-200/50",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full py-6">
          <div className="px-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-primary-50 to-warm-100 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-secondary-500">
                  {activeYear} 年进度
                </span>
                <span className="text-sm font-bold text-primary-500">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                {Array.from({ length: progress.total }).map((_, i) => (
                  i < progress.completed ? (
                    <CheckCircle2 key={i} className="w-3 h-3 text-primary-500" />
                  ) : (
                    <Circle key={i} className="w-3 h-3 text-gray-300" />
                  )
                ))}
                <span className="ml-1">已完成 {progress.completed}/{progress.total} 模块</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                    "transition-all duration-200 group",
                    active
                      ? "bg-primary-50 text-primary-600 shadow-sm"
                      : "text-gray-600 hover:bg-warm-50 hover:text-secondary-500"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    active ? "text-primary-500" : "text-gray-400 group-hover:text-secondary-400"
                  )} />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <ChevronRight className="w-4 h-4 ml-auto text-primary-500" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-4 pt-4 border-t border-warm-200/50">
            <div className="text-xs text-gray-400 text-center">
              <p>数据存储在本地浏览器</p>
              <p className="mt-1">请定期导出备份</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
