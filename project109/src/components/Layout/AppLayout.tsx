import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className='h-screen w-screen flex overflow-hidden bg-gray-50'>
      <Sidebar />
      <div className='flex flex-col flex-1 overflow-hidden'>
        <Header />
        <main
          className={cn(
            'flex-1 overflow-y-auto bg-gradient-bg',
            className
          )}
        >
          <div className='p-6'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
