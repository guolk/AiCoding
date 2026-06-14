import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb';
import { cn } from '@/lib/utils';

export interface AppLayoutProps {
  children: ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  className?: string;
}

export default function AppLayout({
  children,
  breadcrumbItems,
  className,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 左侧固定导航栏 */}
      <Sidebar />

      {/* 右侧主内容区 */}
      <div className="ml-[240px] min-h-screen flex flex-col">
        {/* 顶部栏：面包屑 + 其他信息 */}
        <header className="sticky top-0 z-10 h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
          {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}
        </header>

        {/* 内容区 */}
        <main
          className={cn(
            'flex-1 p-6',
            className,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
