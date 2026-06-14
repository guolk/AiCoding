import { NavLink, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SubNavItem {
  key: string;
  label: string;
  path: string;
}

export default function ProjectSubNav() {
  const { projectId } = useParams<{ projectId: string }>();

  const subNavItems: SubNavItem[] = [
    { key: 'info', label: '基本信息', path: `/projects/${projectId}` },
    { key: 'targets', label: '项目目标', path: `/projects/${projectId}/targets` },
    { key: 'budget', label: '资金分配', path: `/projects/${projectId}/budget` },
    { key: 'progress', label: '实施进度', path: `/projects/${projectId}/progress` },
    { key: 'effects', label: '成效数据', path: `/projects/${projectId}/effects` },
    { key: 'issues', label: '问题风险', path: `/projects/${projectId}/issues` },
  ];

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="overflow-x-auto">
        <nav className="flex min-w-max gap-1 px-6">
          {subNavItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.key === 'info'}
              className={({ isActive }) =>
                cn(
                  'relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ease',
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    className={cn(
                      'absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 transition-all duration-300 ease',
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
