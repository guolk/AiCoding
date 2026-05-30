import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Star,
  BarChart3,
  PieChart,
  Target,
  Award,
  Tag,
  Users,
  Smile,
  Frown,
  AlertCircle,
} from 'lucide-react';
import { useRecords } from '../../context/RecordContext';
import { useJokes } from '../../context/JokeContext';
import { calculateHitRate, getTrendData, getTopJokesPerformance, extractTagCloud } from '../../utils/analysis';
import { MATERIAL_CATEGORIES, MaterialCategory, AUDIENCE_TYPES } from '../../types';
import { formatDate } from '../../utils/duration';

const categoryLabels: Record<MaterialCategory, string> = {
  family: '家庭',
  workplace: '职场',
  society: '社会现象',
  personal: '个人经历',
  other: '其他',
};

export default function AnalyticsPage() {
  const { records } = useRecords();
  const { jokes } = useJokes();
  const [activeTab, setActiveTab] = useState<'overview' | 'trend' | 'jokes' | 'tags'>('overview');

  const hitRateAnalysis = calculateHitRate(records, jokes);
  const trendData = getTrendData(records);
  const topJokes = getTopJokesPerformance(records, jokes);
  const tagCloud = extractTagCloud(records, jokes);

  const recordsWithEval = records.filter(r => r.selfEvaluation);
  const avgRhythm = recordsWithEval.length > 0
    ? recordsWithEval.reduce((sum, r) => sum + (r.selfEvaluation?.rhythmRating || 0), 0) / recordsWithEval.length
    : 0;
  const avgBody = recordsWithEval.length > 0
    ? recordsWithEval.reduce((sum, r) => sum + (r.selfEvaluation?.bodyLanguageRating || 0), 0) / recordsWithEval.length
    : 0;
  const avgInteraction = recordsWithEval.length > 0
    ? recordsWithEval.reduce((sum, r) => sum + (r.selfEvaluation?.interactionRating || 0), 0) / recordsWithEval.length
    : 0;

  const maxTagValue = tagCloud.length > 0 ? Math.max(...tagCloud.map(t => t.value)) : 1;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-ivory mb-2">
              进步分析
            </h1>
            <p className="text-ivory/60">
              用数据说话，追踪你的成长轨迹
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-thin">
          {[
            { key: 'overview', label: '总览', icon: <BarChart3 className="w-4 h-4" /> },
            { key: 'trend', label: '趋势分析', icon: <TrendingUp className="w-4 h-4" /> },
            { key: 'jokes', label: '段子表现', icon: <Award className="w-4 h-4" /> },
            { key: 'tags', label: '特征分析', icon: <Tag className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-stage-red text-white'
                  : 'bg-white/5 text-ivory/60 hover:bg-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-stage-red/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-stage-red" />
                  </div>
                  <span className="text-ivory/60 text-sm">总命中率</span>
                </div>
                <p className="font-display text-3xl font-bold">
                  {hitRateAnalysis.totalJokes > 0 ? Math.round(hitRateAnalysis.hitRate) : 0}%
                </p>
                <p className="text-xs text-ivory/40 mt-1">
                  {hitRateAnalysis.landedJokes}/{hitRateAnalysis.totalJokes} 个段子响了
                </p>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-spotlight-gold/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-spotlight-gold" />
                  </div>
                  <span className="text-ivory/60 text-sm">平均评分</span>
                </div>
                <p className="font-display text-3xl font-bold">
                  {records.length > 0
                    ? (records.reduce((sum, r) => sum + r.overallRating, 0) / records.length).toFixed(1)
                    : '0.0'}
                  <span className="text-lg text-ivory/50">/10</span>
                </p>
                <p className="text-xs text-ivory/40 mt-1">
                  基于 {records.length} 场演出
                </p>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-ivory/60 text-sm">最佳分类</span>
                </div>
                <p className="font-display text-2xl font-bold text-emerald-400">
                  {(() => {
                    const best = Object.entries(hitRateAnalysis.byCategory)
                      .filter(([, data]) => data.total > 0)
                      .sort(([, a], [, b]) => b.rate - a.rate)[0];
                    return best ? categoryLabels[best[0] as MaterialCategory] : '-';
                  })()}
                </p>
                <p className="text-xs text-ivory/40 mt-1">
                  最高命中率分类
                </p>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-ivory/60 text-sm">累计观众</span>
                </div>
                <p className="font-display text-3xl font-bold">
                  {records.reduce((sum, r) => sum + r.audienceSize, 0)}
                </p>
                <p className="text-xs text-ivory/40 mt-1">
                  人次
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-spotlight-gold" />
                  各分类命中率
                </h3>
                <div className="space-y-4">
                  {MATERIAL_CATEGORIES.map(cat => {
                    const data = hitRateAnalysis.byCategory[cat.value];
                    if (data.total === 0) {
                      return (
                        <div key={cat.value} className="flex items-center gap-4 opacity-40">
                          <div className="w-24 text-sm">{cat.label}</div>
                          <div className="flex-1 h-6 bg-white/5 rounded-full flex items-center justify-center text-xs text-ivory/40">
                            暂无数据
                          </div>
                        </div>
                      );
                    }
                    const rate = Math.round(data.rate);
                    return (
                      <div key={cat.value} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-ivory/70">{cat.label}</div>
                        <div className="flex-1">
                          <div className="h-6 bg-white/5 rounded-full overflow-hidden relative">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                rate >= 70 ? 'bg-emerald-500' : rate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${rate}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                              {data.landed}/{data.total} ({rate}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-spotlight-gold" />
                  表演能力雷达
                </h3>
                {recordsWithEval.length > 0 ? (
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-ivory/70">节奏把控</span>
                        <span className="text-spotlight-gold font-bold">
                          {avgRhythm.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stage-red rounded-full transition-all duration-500"
                          style={{ width: `${(avgRhythm / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-ivory/70">肢体语言</span>
                        <span className="text-spotlight-gold font-bold">
                          {avgBody.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${(avgBody / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-ivory/70">观众互动</span>
                        <span className="text-spotlight-gold font-bold">
                          {avgInteraction.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${(avgInteraction / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-ivory/60">综合表现</span>
                        <span className="font-display text-2xl font-bold text-spotlight-gold">
                          {((avgRhythm + avgBody + avgInteraction) / 3).toFixed(1)}
                          <span className="text-sm text-ivory/50">/10</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-ivory/20" />
                    <p className="text-ivory/40">还没有自我评估数据</p>
                    <p className="text-ivory/30 text-sm mt-1">在表演记录中添加自我评估后查看</p>
                  </div>
                )}
              </div>
            </div>

            {trendData.length >= 2 && (
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-spotlight-gold" />
                  近期趋势
                </h3>
                <div className="flex items-end gap-3 h-40">
                  {trendData.slice(-6).map((item, idx) => {
                    const height = Math.max(item.hitRate, 5);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <span className={`text-xs font-bold ${
                          item.hitRate >= 70 ? 'text-emerald-400' : item.hitRate >= 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {Math.round(item.hitRate)}%
                        </span>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            item.hitRate >= 70 ? 'bg-emerald-500/80' : item.hitRate >= 40 ? 'bg-yellow-500/80' : 'bg-red-500/80'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-ivory/40 text-center">
                          {formatDate(item.date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trend' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-spotlight-gold" />
                演出历史趋势
              </h3>

              {trendData.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-ivory/20" />
                  <p className="text-ivory/40">还没有足够的演出数据</p>
                  <p className="text-ivory/30 text-sm mt-1">至少需要2场演出记录才能查看趋势</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {trendData.length >= 2 && (
                      <div className="p-4 rounded-xl bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          {trendData[trendData.length - 1].hitRate >= trendData[trendData.length - 2].hitRate ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-sm text-ivory/60">相比上一场</span>
                        </div>
                        <p className={`font-display text-2xl font-bold ${
                          trendData[trendData.length - 1].hitRate >= trendData[trendData.length - 2].hitRate
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}>
                          {Math.abs(trendData[trendData.length - 1].hitRate - trendData[trendData.length - 2].hitRate).toFixed(0)}%
                        </p>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-spotlight-gold" />
                        <span className="text-sm text-ivory/60">最佳表现</span>
                      </div>
                      <p className="font-display text-2xl font-bold text-spotlight-gold">
                        {Math.round(Math.max(...trendData.map(d => d.hitRate)))}%
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-ivory/60">平均表现</span>
                      </div>
                      <p className="font-display text-2xl font-bold text-blue-400">
                        {Math.round(trendData.reduce((sum, d) => sum + d.hitRate, 0) / trendData.length)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[...trendData].reverse().map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex-shrink-0 w-24">
                          <p className="text-sm font-medium">{formatDate(item.date)}</p>
                          <p className="text-xs text-ivory/40">{item.venue}</p>
                        </div>

                        <div className="flex-1">
                          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                item.hitRate >= 70 ? 'bg-emerald-500' : item.hitRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.max(item.hitRate, 5)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <p className={`font-bold ${
                            item.hitRate >= 70 ? 'text-emerald-400' : item.hitRate >= 40 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {Math.round(item.hitRate)}%
                          </p>
                          <p className="text-xs text-ivory/40">
                            {item.landed}/{item.total} 响
                          </p>
                        </div>

                        <div className="flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-spotlight-gold" />
                            <span className="font-medium">{item.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'jokes' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-spotlight-gold" />
                段子表现排行榜
              </h3>

              {topJokes.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 mx-auto mb-4 text-ivory/20" />
                  <p className="text-ivory/40">还没有段子演出数据</p>
                  <p className="text-ivory/30 text-sm mt-1">在表演记录中记录段子反馈后查看</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topJokes.map((joke, idx) => (
                    <div
                      key={joke.id}
                      className={`p-5 rounded-xl border ${
                        idx === 0
                          ? 'bg-spotlight-gold/10 border-spotlight-gold/30 spotlight'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            idx === 0
                              ? 'bg-spotlight-gold text-theater-navy'
                              : idx === 1
                              ? 'bg-gray-400 text-theater-navy'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-white/10 text-ivory/60'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-ivory">
                              {joke.title}
                            </h4>
                            <p className="text-xs text-ivory/40">
                              演出 {joke.total} 次
                            </p>
                          </div>
                        </div>

                        <div className={`px-4 py-1.5 rounded-full font-bold ${
                          joke.rate >= 70
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : joke.rate >= 40
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {Math.round(joke.rate)}%
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-400">{joke.landed}</p>
                          <p className="text-xs text-ivory/40">响的次数</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-400">{joke.total - joke.landed}</p>
                          <p className="text-xs text-ivory/40">没响次数</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">{joke.avgLaughter.toFixed(1)}秒</p>
                          <p className="text-xs text-ivory/40">平均笑声</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {topJokes.length > 0 && (
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  需要关注的段子
                </h3>
                <div className="space-y-3">
                  {topJokes.filter(j => j.rate < 50).map(joke => (
                    <div key={joke.id} className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <Frown className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">{joke.title}</p>
                        <p className="text-sm text-ivory/40">
                          命中率 {Math.round(joke.rate)}%，建议修改或暂时移除
                        </p>
                      </div>
                      <div className="text-red-400 font-bold">
                        {joke.landed}/{joke.total}
                      </div>
                    </div>
                  ))}
                  {topJokes.filter(j => j.rate < 50).length === 0 && (
                    <div className="text-center py-8">
                      <Smile className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                      <p className="text-ivory/60">太棒了！所有段子命中率都在50%以上</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-spotlight-gold" />
                成功段子标签云
              </h3>

              {tagCloud.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-ivory/20" />
                  <p className="text-ivory/40">还没有标签数据</p>
                  <p className="text-ivory/30 text-sm mt-1">给段子添加标签并记录演出反馈</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 justify-center py-8">
                  {tagCloud.map((tag, idx) => {
                    const size = 0.8 + (tag.value / maxTagValue) * 1.5;
                    const opacity = 0.5 + (tag.value / maxTagValue) * 0.5;
                    return (
                      <div
                        key={idx}
                        className="px-4 py-2 rounded-full bg-white/5 hover:bg-spotlight-gold/20 transition-colors cursor-default"
                        style={{
                          fontSize: `${size}rem`,
                          opacity: opacity,
                        }}
                      >
                        <span className="text-ivory/80">#{tag.text}</span>
                        <span className="ml-2 text-xs text-spotlight-gold">×{tag.value}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {tagCloud.length > 0 && (
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold mb-4">
                  最受欢迎的段子特征
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <h4 className="font-medium text-emerald-300 mb-2 flex items-center gap-2">
                      <Smile className="w-4 h-4" />
                      最成功的主题
                    </h4>
                    <p className="text-ivory/70">
                      带有 <span className="text-spotlight-gold font-bold">#{tagCloud[0]?.text}</span> 标签的段子最受欢迎
                      （成功 {tagCloud[0]?.value} 次）
                    </p>
                  </div>

                  {tagCloud.length >= 2 && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <h4 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        值得关注的方向
                    </h4>
                      <p className="text-ivory/70">
                        尝试在新段子中融入更多 <span className="text-spotlight-gold font-bold">#{tagCloud[1]?.text}</span> 元素
                      </p>
                    </div>
                  )}

                  {(() => {
                    const bestCat = Object.entries(hitRateAnalysis.byCategory)
                      .filter(([, data]) => data.total > 0)
                      .sort(([, a], [, b]) => b.rate - a.rate)[0];
                    if (!bestCat) return null;
                    return (
                      <div className="p-4 rounded-xl bg-spotlight-gold/10 border border-spotlight-gold/20">
                        <h4 className="font-medium text-spotlight-gold mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          最佳分类
                    </h4>
                        <p className="text-ivory/70">
                          <span className="text-spotlight-gold font-bold">{categoryLabels[bestCat[0] as MaterialCategory]}</span> 类
                          段子命中率最高 ({Math.round(bestCat[1].rate)}%)
                      </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
