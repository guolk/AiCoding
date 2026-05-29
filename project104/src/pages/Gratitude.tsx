import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import { GratitudeList } from '@/components/Gratitude/GratitudeList';
import { AchievementCard } from '@/components/Gratitude/AchievementCard';
import { RegretCard } from '@/components/Gratitude/RegretCard';
import { Card } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import {
  ChevronLeft,
  Heart,
  Award,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

export default function Gratitude() {
  const { year } = useParams();
  const navigate = useNavigate();
  const { setCurrentYear, currentYear } = useYearlyReviewStore();

  useEffect(() => {
    if (year) {
      setCurrentYear(parseInt(year));
    }
  }, [year, setCurrentYear]);

  const displayYear = year ? parseInt(year) : currentYear;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-secondary-500">
            感恩与反思
          </h1>
          <p className="text-gray-500 mt-1">
            {displayYear} 年 - 回顾收获，从经历中学习
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
            <Heart className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-secondary-500">
              感恩之心
            </h2>
            <p className="text-gray-500 text-sm">
              思考今年最值得感激的事情，培养感恩的心态
            </p>
          </div>
        </div>
        <GratitudeList />
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Award className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-secondary-500">
              年度成就
            </h2>
            <p className="text-gray-500 text-sm">
              记录这一年你引以为傲的成就和突破
            </p>
          </div>
        </div>
        <AchievementCard />
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-secondary-600" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-secondary-500">
              遗憾与教训
            </h2>
            <p className="text-gray-500 text-sm">
              正视遗憾，从中吸取教训，让每一次经历都有价值
            </p>
          </div>
        </div>
        <RegretCard />
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(`/review/${displayYear}`)}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          返回年度回顾
        </Button>
        <Button
          onClick={() => navigate(`/plan/${displayYear}`)}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          前往新年计划
        </Button>
      </div>
    </div>
  );
}
