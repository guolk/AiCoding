import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import { DomainTabs } from '@/components/Review/DomainTabs';
import { Timeline } from '@/components/Review/Timeline';
import { StatisticsForm } from '@/components/Review/StatisticsForm';
import { Card } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import {
  Calendar,
  BarChart2,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

type Tab = 'questions' | 'timeline' | 'statistics';

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'questions', label: '年度复盘问卷', icon: ListChecks },
  { id: 'timeline', label: '年度时间线', icon: Calendar },
  { id: 'statistics', label: '年度数据统计', icon: BarChart2 },
];

export default function YearReview() {
  const { year } = useParams();
  const navigate = useNavigate();
  const { setCurrentYear, currentYear } = useYearlyReviewStore();
  const [activeTab, setActiveTab] = useState<Tab>('questions');

  useEffect(() => {
    if (year) {
      setCurrentYear(parseInt(year));
    }
  }, [year, setCurrentYear]);

  const displayYear = year ? parseInt(year) : currentYear;

  const handleNext = () => {
    if (activeTab === 'questions') setActiveTab('timeline');
    else if (activeTab === 'timeline') setActiveTab('statistics');
    else navigate(`/gratitude/${displayYear}`);
  };

  const handlePrev = () => {
    if (activeTab === 'statistics') setActiveTab('timeline');
    else if (activeTab === 'timeline') setActiveTab('questions');
    else navigate('/');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-secondary-500">
            {displayYear} 年度回顾
          </h1>
          <p className="text-gray-500 mt-1">系统地回顾这一年的经历与成长</p>
        </div>
      </div>

      <Card padding="sm">
        <div className="flex flex-wrap gap-2 p-1">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                    : "text-gray-600 hover:bg-warm-50"
                )}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold bg-white/20">
                  {index + 1}
                </span>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="min-h-[500px]">
        {activeTab === 'questions' && <DomainTabs />}
        {activeTab === 'timeline' && <Timeline />}
        {activeTab === 'statistics' && <StatisticsForm />}
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrev}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          {activeTab === 'questions' ? '返回首页' : '上一步'}
        </Button>
        <Button
          onClick={handleNext}
          rightIcon={activeTab === 'statistics' ? <ArrowRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        >
          {activeTab === 'statistics' ? '前往感恩与反思' : '下一步'}
        </Button>
      </div>
    </div>
  );
}

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
