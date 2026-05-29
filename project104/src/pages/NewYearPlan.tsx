import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import { GoalCard } from '@/components/Plan/GoalCard';
import { Card } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import {
  ChevronLeft,
  Target,
  Compass,
  ArrowRight,
  Save,
} from 'lucide-react';

export default function NewYearPlan() {
  const { year } = useParams();
  const navigate = useNavigate();
  const { setCurrentYear, currentYear, updateTenYearVision, data } = useYearlyReviewStore();
  
  const displayYear = year ? parseInt(year) : currentYear;
  const yearData = data[displayYear];
  
  const [vision, setVision] = useState(yearData?.plan.tenYearVision || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (year) {
      setCurrentYear(parseInt(year));
    }
  }, [year, setCurrentYear]);

  useEffect(() => {
    if (yearData?.plan.tenYearVision) {
      setVision(yearData.plan.tenYearVision);
    }
  }, [yearData?.plan.tenYearVision]);

  const handleSaveVision = () => {
    setIsSaving(true);
    updateTenYearVision(vision);
    setTimeout(() => setIsSaving(false), 500);
  };

  const planYear = displayYear + 1;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-secondary-500">
            新年计划
          </h1>
          <p className="text-gray-500 mt-1">
            {planYear} 年 - 设定目标，规划未来
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
            <Target className="w-6 h-6 text-secondary-600" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-secondary-500">
              {planYear} 年目标
            </h2>
            <p className="text-gray-500 text-sm">
              分领域设定具体的目标，附以行动计划和衡量标准
            </p>
          </div>
        </div>
        <GoalCard targetYear={planYear} />
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Compass className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-semibold text-secondary-500">
              十年愿景
            </h2>
            <p className="text-gray-500 text-sm">
              在年度计划之外，设定更长远的人生方向
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-primary-50/50 to-warm-50 rounded-xl border border-primary-100/50">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-secondary-500">💭 思考：</span>
              想象一下十年后的自己。那时的你在做什么？拥有什么样的生活？成为了什么样的人？
            </p>
          </div>
          
          <textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            onBlur={handleSaveVision}
            placeholder="在这里写下你对十年后的愿景..."
            className="w-full px-4 py-3 rounded-xl border-2 border-warm-200
                       focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50
                       transition-all duration-200 resize-none min-h-[200px]
                       placeholder:text-gray-400 text-gray-700
                       bg-white hover:border-warm-300"
          />
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {vision.length > 0 ? `${vision.length} 字` : '开始描述你的愿景...'}
            </p>
            <Button
              onClick={handleSaveVision}
              loading={isSaving}
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
            >
              保存
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(`/gratitude/${displayYear}`)}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          返回感恩与反思
        </Button>
        <Button
          onClick={() => navigate(`/visualize/${displayYear}`)}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          查看可视化总结
        </Button>
      </div>
    </div>
  );
}
