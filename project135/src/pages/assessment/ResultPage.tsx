import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '@/components/Card';
import RadarChart from '@/components/RadarChart';
import ConstitutionBadge from '@/components/ConstitutionBadge';
import { useAppStore } from '@/store';
import { HEALTH_ADVICE } from '@/data/healthAdvice';
import { getConstitutionName, getConstitutionColor } from '@/utils/constitution';
import type { ConstitutionResult, ConstitutionScores } from '@/types';

const CONSTITUTION_KEYS: (keyof ConstitutionScores)[] = [
  'pinghe',
  'qixu',
  'yangxu',
  'yinxu',
  'tanshi',
  'shire',
  'xueyu',
  'qiyu',
  'tebing',
];

function getConstitutionStatus(score: number, type: string): { status: string; color: string } {
  if (type === 'pinghe') {
    if (score >= 60) return { status: '平和', color: '#22c55e' };
    return { status: '偏颇', color: '#f59e0b' };
  }
  if (score >= 40) return { status: '是', color: '#ef4444' };
  if (score >= 30) return { status: '倾向', color: '#f59e0b' };
  return { status: '否', color: '#22c55e' };
}

function getConstitutionDescription(type: string): string {
  const name = getConstitutionName(type);
  const advice = HEALTH_ADVICE.find((h) => h.type === name);
  return advice?.description || '';
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const constitutionResults = useAppStore((state) => state.constitutionResults);

  const result = useMemo(() => {
    const state = location.state as { resultId?: string };
    if (state?.resultId) {
      return constitutionResults.find((r) => r.id === state.resultId);
    }
    return constitutionResults.length > 0
      ? [...constitutionResults].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]
      : undefined;
  }, [location.state, constitutionResults]);

  const healthAdvice = useMemo(() => {
    if (!result) return null;
    return HEALTH_ADVICE.find((h) => h.type === result.mainType);
  }, [result]);

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">暂无测评结果</p>
          <button
            onClick={() => navigate('/assessment')}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90"
          >
            开始测评
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回首页
      </button>

      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          体质测评结果
        </h1>
        <p className="text-gray-600">
          测评日期: {result.date}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="体质分析雷达图">
          <div className="p-4">
            <RadarChart scores={result.scores} />
          </div>
        </Card>

        <Card title="体质类型判定">
          <div className="space-y-6">
            <div className="p-6 bg-primary/5 rounded-2xl">
              <p className="text-sm text-gray-500 mb-3">主要体质类型</p>
              <div className="flex items-center gap-4">
                <ConstitutionBadge type={result.mainType} size="lg" />
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <p className="mt-3 text-gray-700 text-sm leading-relaxed">
                {getConstitutionDescription(result.mainType)}
              </p>
            </div>

            {result.subTypes.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-3">兼夹体质</p>
                <div className="flex flex-wrap gap-2">
                  {result.subTypes.map((type, idx) => (
                    <ConstitutionBadge key={idx} type={type} size="md" />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => navigate('/history')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                查看养生建议
              </button>
              <button
                onClick={() => navigate('/assessment')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                重新测评
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Card title="各体质详细得分">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CONSTITUTION_KEYS.map((key) => {
            const score = result.scores[key];
            const { status, color } = getConstitutionStatus(score, key);
            const name = getConstitutionName(key);
            const typeColor = getConstitutionColor(key);

            return (
              <div
                key={key}
                className="p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <ConstitutionBadge type={key} size="sm" />
                  <div className="flex items-center gap-1">
                  {status === '是' || status === '倾向' ? (
                    <AlertTriangle className="w-4 h-4" style={{ color }} />
                  ) : (
                      <CheckCircle className="w-4 h-4" style={{ color }} />
                    )}
                    <span className="text-xs font-medium" style={{ color }}>
                      {status}
                    </span>
                  </div>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl font-bold" style={{ color: typeColor }}>
                    {score.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">分</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(score, 100)}%`,
                      backgroundColor: typeColor,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {key === 'pinghe'
                    ? score >= 60
                      ? '阴阳气血调和，体态适中'
                      : '阴阳气血略有偏颇，需要注意调养'
                    : score >= 40
                    ? '该体质特征明显，建议重点调养'
                    : score >= 30
                    ? '有该体质倾向，注意预防'
                    : '体质特征不明显'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {healthAdvice && (
        <Card title="养生建议概览">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/5 rounded-xl">
            <p className="font-medium text-gray-800 mb-2">饮食调养</p>
            <ul className="space-y-1">
              {healthAdvice.diet.slice(0, 3).map((item, idx) => (
                <li key={idx} className="text-sm text-gray-600">• {item}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-secondary/5 rounded-xl">
            <p className="font-medium text-gray-800 mb-2">生活起居</p>
            <ul className="space-y-1">
              {healthAdvice.lifestyle.slice(0, 3).map((item, idx) => (
                <li key={idx} className="text-sm text-gray-600">• {item}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-accent/5 rounded-xl">
            <p className="font-medium text-gray-800 mb-2">运动保健</p>
            <ul className="space-y-1">
              {healthAdvice.exercise.slice(0, 3).map((item, idx) => (
                <li key={idx} className="text-sm text-gray-600">• {item}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl">
            <p className="font-medium text-gray-800 mb-2">情志调节</p>
            <ul className="space-y-1">
              {healthAdvice.emotion.slice(0, 3).map((item, idx) => (
                <li key={idx} className="text-sm text-gray-600">• {item}</li>
              ))}
            </ul>
          </div>
            </div>
        </Card>
      )}

      <div className="text-center text-sm text-gray-500 py-4">
        <p>以上建议仅供参考，如有不适请及时就医</p>
        <p className="mt-1">定期进行体质测评，动态了解体质变化</p>
      </div>
      </div>
    </div>
  );
}
