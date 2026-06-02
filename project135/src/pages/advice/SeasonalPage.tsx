import { useState } from 'react';
import { Sun, Leaf, Snowflake, CloudSun, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';
import { HEALTH_ADVICE } from '@/data/healthAdvice';
import { getCurrentSeason } from '@/utils/date';
import Card from '@/components/Card';
import ConstitutionBadge from '@/components/ConstitutionBadge';
import { cn } from '@/lib/utils';

type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonConfig {
  key: SeasonType;
  label: string;
  icon: typeof Sun;
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
}

const seasons: SeasonConfig[] = [
  {
    key: 'spring',
    label: '春季',
    icon: Leaf,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    emoji: '🌱',
  },
  {
    key: 'summer',
    label: '夏季',
    icon: Sun,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    emoji: '☀️',
  },
  {
    key: 'autumn',
    label: '秋季',
    icon: CloudSun,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    emoji: '🍂',
  },
  {
    key: 'winter',
    label: '冬季',
    icon: Snowflake,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    emoji: '❄️',
  },
];

const seasonTips: Record<SeasonType, string> = {
  spring: '春季阳气升发，宜养肝疏肝，多做户外活动，舒展筋骨。注意"春捂"，不要过早减衣。',
  summer: '夏季阳气最盛，宜养心护心，注意防暑降温，适当午睡补充精力。饮食清淡，多吃清热消暑食物。',
  autumn: '秋季阳气收敛，宜养肺润肺，早睡早起，收敛神气。多吃滋阴润肺食物，防止秋燥伤阴。',
  winter: '冬季阳气闭藏，宜养肾固本，早睡晚起，收藏阳气。注意保暖，适当进补，但不宜过度温热。',
};

const seasonMap: Record<string, SeasonType> = {
  春: 'spring',
  夏: 'summer',
  秋: 'autumn',
  冬: 'winter',
};

export default function SeasonalPage() {
  const currentSeasonChar = getCurrentSeason();
  const currentSeason = seasonMap[currentSeasonChar] || 'spring';
  const [activeSeason, setActiveSeason] = useState<SeasonType>(currentSeason);

  const getLatestConstitutionResult = useAppStore((state) => state.getLatestConstitutionResult);
  const latestResult = getLatestConstitutionResult();

  const constitutionAdvice = latestResult
    ? HEALTH_ADVICE.find((a) => a.type === latestResult.mainType)
    : null;

  const currentSeasonConfig = seasons.find((s) => s.key === activeSeason)!;

  const getSeasonalAdvice = () => {
    if (!constitutionAdvice) return [];
    return constitutionAdvice.seasons[activeSeason] || [];
  };

  const seasonalAdvice = getSeasonalAdvice();

  return (
    <div className="space-y-6">
      <Card className={cn('border-l-4', currentSeasonConfig.borderColor)}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-4xl', currentSeasonConfig.bgColor)}>
              {currentSeasonConfig.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-800">季节养生</h2>
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium', currentSeasonConfig.bgColor, currentSeasonConfig.color)}>
                  当前{currentSeasonConfig.label}
                </span>
              </div>
              <p className="text-gray-500">顺应四时变化，调整养生方式</p>
            </div>
          </div>
          {latestResult && (
            <div className="flex flex-wrap gap-2">
              <ConstitutionBadge type={latestResult.mainType} size="lg" />
              {latestResult.subTypes.map((type) => (
                <ConstitutionBadge key={type} type={type} size="md" />
              ))}
            </div>
          )}
        </div>
        <div className={cn('mt-6 p-5 rounded-xl', currentSeasonConfig.bgColor, 'border', currentSeasonConfig.borderColor)}>
          <div className="flex items-start gap-3">
            <Sparkles className={cn('w-6 h-6 flex-shrink-0 mt-0.5', currentSeasonConfig.color)} />
            <p className={cn('leading-relaxed', currentSeasonConfig.color)}>
              {seasonTips[activeSeason]}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {seasons.map((season) => (
          <button
            key={season.key}
            onClick={() => setActiveSeason(season.key)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300',
              activeSeason === season.key
                ? cn(season.bgColor, 'border-2', season.borderColor, 'shadow-lg')
                : 'bg-white border-2 border-transparent hover:bg-gray-50'
            )}
          >
            <span className="text-3xl">{season.emoji}</span>
            <span className={cn(
              'font-semibold',
              activeSeason === season.key ? season.color : 'text-gray-700'
            )}>
              {season.label}
            </span>
            {season.key === currentSeason && (
              <span className="text-xs text-gray-400">当前季节</span>
            )}
          </button>
        ))}
      </div>

      {constitutionAdvice ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentSeasonConfig.emoji}</span>
            <h3 className="text-xl font-bold text-gray-800">
              {currentSeasonConfig.label}养生要点
              <span className="text-base font-normal text-gray-500 ml-2">
                - {constitutionAdvice.type}专属建议
              </span>
            </h3>
          </div>

          <div className="grid gap-4">
            {seasonalAdvice.map((advice, index) => (
              <Card key={index} hoverable className="flex items-start gap-4">
                <div className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl',
                  currentSeasonConfig.bgColor
                )}>
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-700 leading-relaxed">{advice}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">📅</span>
              四季养生原则
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <h5 className="font-semibold text-green-700">春夏养阳</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    春夏季阳气生发旺盛，应顺势保养阳气，多做户外活动，适当"春捂""夏养"，避免过度贪凉损伤阳气。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🍂</span>
                <div>
                  <h5 className="font-semibold text-amber-700">秋冬养阴</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    秋冬季阳气收敛闭藏，应顺势保养阴精，早睡晚起，适当进补滋养，防止燥邪伤阴，为来年阳气生发打下基础。
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">请先完成体质测评</h4>
          <p className="text-gray-500 max-w-md mx-auto">
            完成中医体质测评后，我们将为您提供针对您体质类型的四季养生建议。
          </p>
        </Card>
      )}
    </div>
  );
}
