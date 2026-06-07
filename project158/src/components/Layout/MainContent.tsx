import { cn } from '@/lib/utils';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export default function MainContent({ children, className }: MainContentProps) {
  return (
    <main className={cn(
      'flex-1 overflow-y-auto',
      'pt-16 pb-16 md:pb-0',
      'px-4 md:px-6 py-4 md:py-6',
      'bg-neutral-50 dark:bg-neutral-800',
      'min-h-screen',
      className
    )}>
      <div className="max-w-7xl mx-auto animate-fade-in">
        {children}
      </div>
    </main>
  );
}
