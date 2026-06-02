import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, FileText, PlusCircle } from 'lucide-react';
import Card from '@/components/Card';
import LineChart from '@/components/LineChart';
import ConstitutionBadge from '@/components/ConstitutionBadge';
import { useAppStore } from '@/store';
import { getConstitutionName } from '@/utils/constitution';
import Empty from '@/components/Empty';

export default function HistoryPage() {
  const navigate = useNavigate();
  const constitutionResults = useAppStore((state) => state.constitutionResults);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const sortedResults = [...constitutionResults].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const selectedRecord = sortedResults.find((r) => r.id === selectedResult);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回首页
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
              体质历史追踪
            </h1>
            <p className="text-gray-600">
              记录并追踪您的体质变化趋势
            </p>
          </div>
          <button
            onClick={() => navigate('/assessment')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
          >
            <PlusCircle className="w-5 h-5" />
            新建测评
          </button>
        </div>

        <Card title="体质变化趋势">
          <div className="p-4">
            {sortedResults.length > 0 ? (
              <LineChart results={sortedResults} />
            ) : (
              <Empty message="暂无测评数据，开始您的第一次体质测评吧" />
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="历史记录列表">
            {sortedResults.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {sortedResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => setSelectedResult(result.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedResult === result.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {result.date}
                        </span>
                      </div>
                      {selectedResult === result.id && (
                        <span className="text-xs text-primary font-medium">
                          已选中
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">主要体质:</span>
                      <ConstitutionBadge type={result.mainType} size="sm" />
                    </div>
                    {result.subTypes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-xs text-gray-400">兼夹:</span>
                        {result.subTypes.slice(0, 3).map((type, idx) => (
                          <ConstitutionBadge key={idx} type={type} size="sm" />
                        ))}
                        {result.subTypes.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{result.subTypes.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    {result.notes && (
                      <p className="mt-2 text-xs text-gray-500 italic">
                        "{result.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty message="暂无历史记录" />
            )}
          </Card>

          <Card title="记录详情">
            {selectedRecord ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold text-gray-800">
                      {selectedRecord.date} 测评结果
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      navigate('/result', {
                        state: { resultId: selectedRecord.id },
                      })
                    }
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    查看完整报告
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-xl">
                    <p className="text-sm text-gray-500 mb-2">主要体质</p>
                    <ConstitutionBadge type={selectedRecord.mainType} size="lg" />
                    <p className="mt-2 text-sm text-gray-600">
                      {getConstitutionDescription(selectedRecord.mainType)}
                    </p>
                  </div>

                  {selectedRecord.subTypes.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">兼夹体质</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecord.subTypes.map((type, idx) => (
                          <ConstitutionBadge key={idx} type={type} size="md" />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500 mb-3">各项得分</p>
                    <div className="space-y-2">
                      {Object.entries(selectedRecord.scores).map(
                        ([key, score]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <ConstitutionBadge type={key} size="sm" />
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min(score, 100)}%`,
                                    backgroundColor: getConstitutionColor(key),
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700 w-12 text-right">
                                {score.toFixed(1)}分
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {selectedRecord.notes && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">备注</p>
                      <p className="text-gray-700">{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>请从左侧列表选择一条记录查看详情</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="text-center text-sm text-gray-500 py-4">
          <p>建议每月进行一次体质测评，持续追踪体质变化</p>
          <p className="mt-1">体质调养是一个长期过程，贵在坚持</p>
        </div>
      </div>
    </div>
  );
}

function getConstitutionDescription(type: string): string {
  const descriptions: Record<string, string> = {
    pinghe: '阴阳气血调和，体态适中，面色红润，精力充沛',
    qixu: '元气不足，疲乏气短，易出汗，易感冒',
    yangxu: '阳气不足，畏寒怕冷，手脚冰凉，喜热饮',
    yinxu: '阴液亏少，口干舌燥，手足心热，易烦躁',
    tanshi: '痰湿凝聚，形体肥胖，身体沉重，口黏苔腻',
    shire: '湿热内蕴，面垢油光，口苦口臭，大便黏滞',
    xueyu: '血行不畅，肤色晦暗，易出现瘀斑，疼痛固定',
    qiyu: '气机郁滞，情绪低落，忧郁脆弱，胸胁胀满',
    tebing: '过敏体质，易对药物、食物、气味等过敏',
  };

  const baseType = type.replace('_tendency', '');
  if (type.endsWith('_tendency')) {
    return `有${descriptions[baseType]?.replace(/，.*$/, '') || ''}的倾向，需要注意调养`;
  }
  return descriptions[baseType] || '';
}

function getConstitutionColor(type: string): string {
  const baseType = type.replace('_tendency', '');
  const colors: Record<string, string> = {
    pinghe: '#22c55e',
    qixu: '#f59e0b',
    yangxu: '#ef4444',
    yinxu: '#ec4899',
    tanshi: '#8b5cf6',
    shire: '#f97316',
    xueyu: '#dc2626',
    qiyu: '#6366f1',
    tebing: '#14b8a6',
  };
  return colors[baseType] || '#6b7280';
}
