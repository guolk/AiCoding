import { ReactNode } from 'react';
import { Tab } from '@headlessui/react';
import { clsx } from 'clsx';

interface TabsProps {
  tabs: {
    label: ReactNode;
    content: ReactNode;
    disabled?: boolean;
  }[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
}

export function Tabs({ tabs, defaultIndex = 0, onChange, className }: TabsProps) {
  return (
    <div className={clsx('w-full', className)}>
      <Tab.Group defaultIndex={defaultIndex} onChange={onChange}>
        <Tab.List className="flex space-x-1 rounded-xl bg-cream p-1 mb-6">
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              disabled={tab.disabled}
              className={({ selected }) =>
                clsx(
                  'w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2',
                  selected
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-white/50',
                  tab.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                )
              }
            >
              {tab.label}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {tabs.map((tab, index) => (
            <Tab.Panel
              key={index}
              className={clsx(
                'rounded-xl focus:outline-none animate-fade-in'
              )}
            >
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
