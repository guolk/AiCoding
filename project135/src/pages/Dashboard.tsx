import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, BookOpen, Utensils, Moon, Pill } from 'lucide-react';
import Card from '@/components/Card';
import RadarChart from '@/components/RadarChart';
import ConstitutionBadge from '@/components/ConstitutionBadge';
import { useAppStore } from '@/store';
import { HEALTH_ADVICE } from '@/data/healthAdvice';
import { getConstitutionName } from '@/utils/constitution';
import type { ConstitutionScores } from '@/types';

function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getSeasonName(season: string): string {
  const names: Record<string, string> = {
    spring: '春季',
    summer: '夏季',
    autumn: '秋季',
    winter: '冬季',
  };
  return names[season] || season;
}

const emptyScores: ConstitutionScores = {
  pinghe: 0,
  qixu: 0,
  yangxu: 0,
  yinxu: 0,
  tanshi: 0,
  shire: 0,
  xueyu: 0,
  qiyu: 0,
  tebing: 0,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const latestResult = useAppStore((state) => state.getLatestConstitutionResult());
  const dailyRecords = useAppStore((state) => state.dailyRecords);
  const medicines = useAppStore((state) => state.medicines);

  const latestRecord = dailyRecords.length > 0 ? dailyRecords[dailyRecords.length - 1] : null;
  const activeMedicines = medicines.filter((m) => m.isActive);

  const season = getCurrentSeason();
  const constitutionType = latestResult ? latestResult.mainType : 'pinghe';
  const healthAdvice = HEALTH_ADVICE.find((h) => h.type === getConstitutionName(constitutionType));
  const seasonalAdvice = healthAdvice?.seasons[season] || [];

  const constitutionName = latestResult ? getConstitutionName(latestResult.mainType) : '平和质';

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            体质管理中心
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="当前体质状态">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <RadarChart scores={latestResult?.scores || emptyScores} />
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">主要体质</p>
                    <ConstitutionBadge type={latestResult?.mainType || 'pinghe'} size="lg" />
                  </div>
                  {latestResult && latestResult.subTypes.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">兼夹体质</p>
                      <div className="flex flex-wrap gap-2">
                        {latestResult.subTypes.map((type, idx) => (
                          <ConstitutionBadge key={idx} type={type} size="sm" />
                        ))}
                      </div>
                    </div>
                  )}
                  {latestResult && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">测评日期</p>
                      <p className="text-gray-700">{latestResult.date}</p>
                    </div>
                  )}
                  {!latestResult && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">尚未完成体质测评</p>
                      <button
                        onClick={() => navigate('/assessment')}
                        className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                      >
                        立即测评
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title={`${getSeasonName(season)}养生提醒`}>
              <div className="space-y-3">
                {seasonalAdvice.length > 0 ? (
                  seasonalAdvice.map((advice, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl">
                      <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary text-xs font-bold rounded-full">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">{advice}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">完成体质测评后获取个性化养生建议</p>
                )}
              </div>
            </Card>

            <Card title="快捷操作">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => navigate('/assessment')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">开始测评</span>
                </button>
                <button
                  onClick={() => navigate('/history')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-colors group"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-secondary/10 rounded-full group-hover:bg-secondary/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-secondary" />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">历史记录</span>
                </button>
                <button
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors group"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors">
                    <PlusCircle className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">添加记录</span>
                </button>
              </div>
            </Card>
          </div>
        </div>

        <Card title="最近记录">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                <span className="font-medium text-gray-800">饮食记录</span>
              </div>
              {latestRecord ? (
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">早餐</p>
                    <p className="text-sm text-gray-700">{latestRecord.diet.breakfast}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">午餐</p>
                    <p className="text-sm text-gray-700">{latestRecord.diet.lunch}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">晚餐</p>
                    <p className="text-sm text-gray-700">{latestRecord.diet.dinner}</p>
                  </div>
                  <p className="text-xs text-gray-400">记录日期: {latestRecord.date}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">暂无饮食记录</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-secondary" />
                <span className="font-medium text-gray-800">睡眠记录</span>
              </div>
              {latestRecord ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">睡眠时长</p>
                      <p className="text-2xl font-bold text-secondary">
                        {latestRecord.sleep.duration}
                        <span className="text-sm font-normal text-gray-500"> 小时</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">质量评分</p>
                      <p className="text-2xl font-bold text-secondary">
                        {latestRecord.sleep.quality}
                        <span className="text-sm font-normal text-gray-500"> / 5</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>入睡: {latestRecord.sleep.bedtime}</span>
                    <span>起床: {latestRecord.sleep.wakeTime}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">暂无睡眠记录</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-accent" />
                <span className="font-medium text-gray-800">用药记录</span>
              </div>
              {activeMedicines.length > 0 ? (
                <div className="space-y-3">
                  {activeMedicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="p-3 bg-gray-50 rounded-lg border-l-4 border-accent"
                    >
                      <p className="font-medium text-gray-800 mb-1">{medicine.name}</p>
                      <p className="text-sm text-gray-600 mb-1">{medicine.dosage}</p>
                      <p className="text-xs text-gray-500">{medicine.effect}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">暂无用药记录</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
