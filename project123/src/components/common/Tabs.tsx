import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  children: (activeTab: string) => ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onTabChange, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className={className}>
      <div className="flex gap-1 p-1 bg-dark-surface rounded-lg mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200',
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'text-dark-muted hover:text-dark-text hover:bg-dark-card'
            )}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-card text-dark-muted'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {children(activeTab)}
    </div>
  );
}

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter((item) => item.defaultOpen).map((item) => item.id))
  );

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div key={item.id} className="card">
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="font-medium text-dark-text">{item.title}</span>
              <span className={cn(
                'transform transition-transform duration-200',
                isOpen && 'rotate-180'
              )}>
                ▼
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-dark-border pt-2">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'gold' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'primary', className }: BadgeProps) {
  const variantClasses = {
    primary: 'tag-primary',
    gold: 'tag-gold',
    success: 'tag-success',
    warning: 'tag-warning',
    danger: 'tag-danger'
  };

  return (
    <span className={cn('tag', variantClasses[variant], className)}>
      {children}
    </span>
  );
}
