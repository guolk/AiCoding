import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Moon, Activity, Heart, ChevronRight, ClipboardList } from 'lucide-react';
import { useAppStore } from '@/store';
import { HEALTH_ADVICE } from '@/data/healthAdvice';
import Card from '@/components/Card';
import ConstitutionBadge from '@/components/ConstitutionBadge';
import { cn } from '@/lib/utils';

type TabType = 'diet' | 'lifestyle' | 'exercise' | 'emotion';

const tabs: Array<{ key: TabType; label: string; icon: typeof Utensils }> = [
  { key: 'diet', label: '饮食建议', icon: Utensils },
  { key: 'lifestyle', label: '起居建议', icon: Moon },
  { key: 'exercise', label: '运动建议', icon: Activity },
  { key: 'emotion', label: '情志建议', icon: Heart },
];

const adviceIcons: Record<TabType, string[]> = {
  diet: ['🍚', '🥗', '🍎', '🥜', '🫘', '🍵', '🥛', '🌾', '🍯', '🥕'],
  lifestyle: ['🛏️', '☀️', '🧘', '🚿', '🏠', '👕'],
  exercise: ['🏃', '🧘', '🏊', '🚶', '💪', '🤸'],
  emotion: ['😊', '🎵', '📚', '🌸', '💆', '🎨'],
};

export default function AdvicePage() {
  const [activeTab, setActiveTab] = useState<TabType>('diet');
  const navigate = useNavigate();
  const getLatestConstitutionResult = useAppStore((state) => state.getLatestConstitutionResult);
  const latestResult = getLatestConstitutionResult();

  if (!latestResult) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <ClipboardList className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无测评结果</h3>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          请先完成中医体质测评，我们将根据您的体质类型为您提供个性化的养生建议。
        </p>
        <button
          onClick={() => navigate('/assessment')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          <ClipboardList className="w-5 h-5" />
          开始体质测评
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const constitutionAdvice = HEALTH_ADVICE.find((a) => a.type === latestResult.mainType);

  if (!constitutionAdvice) {
    return (
      <div className="text-center py-16 text-gray-500">
        暂无对应体质的养生建议
      </div>
    );
  }

  const getAdviceList = () => {
    switch (activeTab) {
      case 'diet':
        return constitutionAdvice.diet;
      case 'lifestyle':
        return constitutionAdvice.lifestyle;
      case 'exercise':
        return constitutionAdvice.exercise;
      case 'emotion':
        return constitutionAdvice.emotion;
      default:
        return [];
    }
  };

  const adviceList = getAdviceList();
  const icons = adviceIcons[activeTab];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">个性化养生建议</h2>
            <p className="text-gray-500">根据您最新的体质测评结果定制</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ConstitutionBadge type={latestResult.mainType} size="lg" />
            {latestResult.subTypes.map((type) => (
              <ConstitutionBadge key={type} type={type} size="md" />
            ))}
          </div>
        </div>
        <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-gray-700">
            <span className="font-semibold text-primary">体质特征：</span>
            {constitutionAdvice.description}
          </p>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300',
              activeTab === tab.key
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white text-gray-600 hover:bg-primary/5 border border-gray-100'
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {adviceList.map((advice, index) => (
          <Card key={index} hoverable className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-2xl">
              {icons[index % icons.length]}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-gray-700 leading-relaxed">{advice}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl">💡</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">温馨提示</h3>
        </div>
        <p className="text-gray-600 leading-relaxed">
          养生建议仅供参考，每个人的身体状况不同，如有特殊健康问题请咨询专业中医师。建议每3个月重新进行一次体质测评，根据体质变化调整养生方案。
        </p>
      </Card>
    </div>
  );
}
