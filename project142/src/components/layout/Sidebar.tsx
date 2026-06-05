import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  FileSpreadsheet, 
  Presentation, 
  MessageSquare,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { cn } from '../../utils/helpers';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  children?: { path: string; label: string }[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: '工作台', icon: <LayoutDashboard size={20} /> },
  { 
    path: '/students', 
    label: '学生档案', 
    icon: <Users size={20} />,
    children: [
      { path: '/students', label: '学生列表' },
      { path: '/students/seating', label: '座位表' }
    ]
  },
  { 
    path: '/attendance', 
    label: '考勤管理', 
    icon: <CalendarCheck size={20} />,
    children: [
      { path: '/attendance', label: '考勤录入' },
      { path: '/attendance/leaves', label: '请假条' }
    ]
  },
  { 
    path: '/grades', 
    label: '成绩管理', 
    icon: <FileSpreadsheet size={20} />,
    children: [
      { path: '/grades', label: '成绩录入' },
      { path: '/grades/analysis', label: '成绩分析' }
    ]
  },
  { 
    path: '/classroom', 
    label: '课堂管理', 
    icon: <Presentation size={20} />,
    children: [
      { path: '/classroom', label: '课堂表现' },
      { path: '/classroom/groups', label: '小组管理' }
    ]
  },
  { path: '/communication', label: '家校沟通', icon: <MessageSquare size={20} /> }
];

const Sidebar: React.FC = () => {
  const [expandedMenus, setExpandedMenus] = React.useState<Set<string>>(new Set(['/students', '/attendance', '/grades', '/classroom']));

  const toggleMenu = (path: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedMenus(newExpanded);
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50"
    >
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide">班级管家</h1>
            <p className="text-xs text-slate-400">教师工作台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium px-3">功能模块</p>
        </div>
        {navItems.map((item, index) => (
          <div key={item.path} className="mb-1">
            <NavLink
              to={item.path}
              end={!item.children}
              onClick={() => item.children && toggleMenu(item.path)}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-6 py-3 mx-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
                  isActive && !item.children
                    ? 'bg-amber-500/20 text-amber-400 shadow-inner'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                )
              }
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  'transition-colors',
                  !item.children && navItems.some(nav => 
                    nav.path === item.path || (nav.children?.some(c => location.pathname.startsWith(nav.path)))
                  ) && location.pathname.startsWith(item.path) 
                    ? 'text-amber-400' 
                    : ''
                )}>
                  {item.icon}
                </span>
                {item.label}
              </div>
              {item.children && (
                <motion.span
                  animate={{ rotate: expandedMenus.has(item.path) ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={16} className="text-slate-500" />
                </motion.span>
              )}
            </NavLink>
            
            {item.children && (
              <motion.div
                initial={false}
                animate={{ 
                  height: expandedMenus.has(item.path) ? 'auto' : 0,
                  opacity: expandedMenus.has(item.path) ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-6 mt-1 border-l border-slate-700/50 pl-2">
                  {item.children.map(child => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        cn(
                          'block px-4 py-2 mx-2 rounded-md text-xs transition-all duration-200',
                          isActive
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                        )
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
              李
            </div>
            <div>
              <p className="text-sm font-medium">李老师</p>
              <p className="text-xs text-slate-400">高一(3)班 · 班主任</p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
