import { useState } from 'react';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import { Category, CATEGORY_INFO } from '@/types';
import {
  Briefcase,
  Heart,
  BookOpen,
  Users,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<Category, React.ComponentType<{ className?: string }>> = {
  work: Briefcase,
  health: Heart,
  learning: BookOpen,
  relationship: Users,
  finance: Wallet,
  growth: TrendingUp,
};

const categories: Category[] = ['work', 'health', 'learning', 'relationship', 'finance', 'growth'];

export function DomainTabs() {
  const [activeTab, setActiveTab] = useState<Category>('work');
  const { data, currentYear, updateReviewDomain } = useYearlyReviewStore();
  const yearData = data[currentYear];

  const domain = yearData?.review.domains.find(d => d.category === activeTab);
  const questions = domain?.questions || [];

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    updateReviewDomain(activeTab, questionIndex, answer);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = iconMap[category];
          const info = CATEGORY_INFO[category];
          const isActive = activeTab === category;
          const domainData = yearData?.review.domains.find(d => d.category === category);
          const hasContent = domainData?.questions.some(q => q.answer.trim().length > 0);

          return (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : hasContent
                  ? 'bg-warm-100 text-secondary-500 hover:bg-warm-200'
                  : 'bg-warm-50 text-gray-500 hover:bg-warm-100'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{info.name}</span>
              {hasContent && (
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  isActive ? 'bg-white' : 'bg-primary-500'
                )} />
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 animate-fade-in">
        <div className="p-4 bg-warm-50 rounded-xl border border-warm-200/50">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-secondary-500">💡 提示：</span>
            诚实面对自己，深入思考每一个问题。这里的记录是为了帮助你更好地认识自己。
          </p>
        </div>

        {questions.map((qa, index) => (
          <div key={index} className="space-y-3">
            <label className="block">
              <span className="flex items-start gap-2 text-base font-medium text-secondary-500">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="pt-0.5">{qa.question}</span>
              </span>
            </label>
            <textarea
              value={qa.answer}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="在此写下你的思考..."
              className={cn(
                'w-full px-4 py-3 rounded-xl border-2 border-warm-200',
                'focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50',
                'transition-all duration-200 resize-none min-h-[120px]',
                'placeholder:text-gray-400 text-gray-700',
                'bg-white hover:border-warm-300'
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
