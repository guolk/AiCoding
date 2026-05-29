import { useNavigate } from 'react-router-dom';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import {
  Calendar,
  Heart,
  Target,
  BarChart3,
  FileDown,
  ChevronRight,
  Plus,
  Sparkles,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import { ProgressBar } from '@/components/Common/ProgressBar';
import { cn } from '@/lib/utils';

interface ModuleCard {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  path: string;
  color: string;
  bgColor: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, currentYear, setCurrentYear } = useYearlyReviewStore();
  const yearData = data[currentYear];

  const modules: ModuleCard[] = [
    {
      icon: Calendar,
      title: '年度回顾',
      description: '回顾这一年的经历与成长',
      path: `/review/${currentYear}`,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      icon: Heart,
      title: '感恩与反思',
      description: '记录感恩之事与教训',
      path: `/gratitude/${currentYear}`,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      icon: Target,
      title: '新年计划',
      description: '设定来年的目标与方向',
      path: `/plan/${currentYear}`,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      icon: BarChart3,
      title: '可视化总结',
      description: '生成精美的年度总结',
      path: `/visualize/${currentYear}`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: FileDown,
      title: '分享与存档',
      description: '导出报告与对比往年对比',
      path: `/export/${currentYear}`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const getOverallProgress = () => {
    if (!yearData) return 0;
    
    let completed = 0;
    const total = 5;

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

    const hasData = yearData.plan.tenYearVision?.trim().length > 0 || 
      yearData.review.domains.some(d => 
        d.questions.some(q => q.answer.trim().length > 0)
    );
    if (hasData) completed++;

    return (completed / total) * 100;
  };

  const overallProgress = getOverallProgress();

  const availableYears = Object.keys(data).map(Number).sort((a, b) => b - a);

  const highlights = yearData?.gratitude.achievements.filter(a => a.isHighlight) || [];
  const recentEvents = yearData?.review.timeline.slice(-3) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary-500" />
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-secondary-500">
            {currentYear} 年度回顾
          </h1>
        </div>
        <p className="text-gray-500 text-lg mt-2">
          回顾过去，规划未来，记录成长的每一步
        </p>
      </div>

      <Card className="bg-gradient-to-br from-primary-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
          <h3 className="font-display text-2xl font-semibold text-secondary-500 mb-4">
            整体进度
          </h3>
          <ProgressBar
            value={overallProgress}
            size="lg"
            label={`${currentYear} 年度回顾完成度`}
            showLabel={true}
          />
          <p className="text-sm text-gray-500 mt-2">
            {overallProgress >= 100 
              ? '太棒了！你已经完成了所有模块的填写。' 
              : '继续填写，完成你的年度回顾之旅！'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/review/${currentYear}`)}
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            开始/继续
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const newYear = currentYear + 1;
              setCurrentYear(newYear);
              navigate(`/plan/${newYear}`);
            }}
          >
            新的一年
          </Button>
        </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <Card
              key={index}
              hoverable
              onClick={() => navigate(module.path)}
              className="animate-slide-up"
              padding="lg"
            >
              <div className="flex items-start gap-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', module.bgColor)}>
                  <Icon className={cn('w-6 h-6', module.color)} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold text-secondary-500 mb-1">
                    {module.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">
                    {module.description}
                  </p>
                  <button className="flex items-center gap-1 text-primary-500 text-sm font-medium">
                    进入
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {highlights.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary-500" />
              <h3 className="font-display text-xl font-semibold text-secondary-500">
                年度亮点
              </h3>
            </div>
            <div className="space-y-3">
              {highlights.map((highlight) => (
                <div key={highlight.id} className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                  <Plus className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-secondary-500">{highlight.title}</p>
                    {highlight.description && (
                      <p className="text-sm text-gray-500 mt-1">{highlight.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {recentEvents.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-secondary-500" />
              <h3 className="font-display text-xl font-semibold text-secondary-500">
                近期事件
              </h3>
            </div>
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-secondary-500">{event.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {availableYears.length > 0 && (
        <Card>
          <h3 className="font-display text-xl font-semibold text-secondary-500 mb-4">
            历史年度
          </h3>
          <div className="flex flex-wrap gap-3">
            {availableYears.map((year) => (
              <button
              key={year}
              onClick={() => {
                setCurrentYear(year);
                navigate(`/review/${year}`);
              }}
              className={cn(
                "px-6 py-3 rounded-xl font-medium transition-all duration-200",
                year === currentYear
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                  : "bg-warm-100 text-secondary-500 hover:bg-warm-200"
              )}
            >
              {year} 年
            </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
