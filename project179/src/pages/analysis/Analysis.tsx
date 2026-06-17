import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ZAxis,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Trees,
  Trees as TreesIcon,
  Users,
  Leaf,
  Calculator,
  Link2,
  Thermometer,
  Droplets,
  Eye,
  FlaskConical,
  ChevronDown,
  Check,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { calculateShannonIndex, calculateSimpsonIndex, calculatePearsonCorrelation } from '@/utils/calculations';
import { StatCard } from '@/components/ui/StatCard';
import { Header } from '@/components/Layout/Header';
import { AnalysisTabType, DiversityIndex, EnvironmentalParam } from '@/types';
import { cn } from '@/lib/utils';

const CHART_COLORS = [
  '#2D6A4F',
  '#40916C',
  '#D4A373',
  '#8B7355',
  '#6B9080',
  '#52796F',
  '#A4C3B2',
  '#CCD5AE',
];

const tabConfig = [
  { key: 'diversity' as AnalysisTabType, label: '物种多样性指数', icon: Trees },
  { key: 'population' as AnalysisTabType, label: '种群时间序列', icon: TrendingUp },
  { key: 'correlation' as AnalysisTabType, label: '相关性探索', icon: Link2 },
];

const envFactorOptions = [
  { key: 'soilTemperature', label: '土壤温度(°C)', icon: Thermometer },
  { key: 'soilMoisture', label: '土壤湿度(%)', icon: Droplets },
  { key: 'waterPH', label: '水体pH', icon: FlaskConical },
  { key: 'waterTemperature', label: '水温(°C)', icon: Thermometer },
  { key: 'waterTransparency', label: '水体透明度(%)', icon: Eye },
];

const diversityMetricOptions = [
  { key: 'shannonIndex', label: '香农指数' },
  { key: 'simpsonIndex', label: '辛普森指数' },
  { key: 'speciesCount', label: '物种数' },
  { key: 'totalIndividuals', label: '总个体数' },
];

const birdSpecies = ['白头鹎', '白鹭', '东方白鹳', '红嘴相思鸟'];

export default function Analysis() {
  const { sites, diversityData, populationTimeSeries, envParams } = useAppStore();
  const [activeTab, setActiveTab] = useState<AnalysisTabType>('diversity');
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>(['site-001', 'site-002']);
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);

  const toggleSite = (siteId: string) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50/50 via-white to-lake-50/30">
      <Header title="生态数据分析" subtitle="多维度数据可视化与深度分析" />
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* 内容区域 */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-forest-800 tracking-tight">
                生态数据分析中心
              </h1>
              <p className="mt-2 text-gray-600">
                多维度生态监测数据可视化与深度分析工具
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setSiteDropdownOpen((v) => !v)}
                className="flex items-center gap-3 rounded-xl border border-forest-200 bg-white px-4 py-2.5 shadow-card transition-all hover:border-forest-400 hover:shadow-card-hover"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-forest-600" />
                  <span className="font-medium text-forest-700">
                    监测点对比（{selectedSiteIds.length}个）
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-forest-500 transition-transform',
                    siteDropdownOpen && 'rotate-180'
                  )}
                />
              </button>
              {siteDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-forest-100 bg-white p-3 shadow-card-hover animate-fade-in">
                  <div className="mb-2 px-2 pb-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500">选择监测点进行对比</p>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {sites.map((site) => {
                      const checked = selectedSiteIds.includes(site.id);
                      return (
                        <button
                          key={site.id}
                          onClick={() => toggleSite(site.id)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                            checked
                              ? 'bg-forest-50 text-forest-700'
                              : 'hover:bg-gray-50 text-gray-700'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
                              checked
                                ? 'bg-forest-500 border-forest-500'
                                : 'border-gray-300'
                            )}
                          >
                            {checked && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{site.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {site.ecosystemType}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {tabConfig.map((tab) => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-all duration-300',
                    active
                      ? 'bg-forest-500 text-white shadow-card'
                      : 'bg-white text-forest-600 border border-forest-200 hover:border-forest-400 hover:bg-forest-50'
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-slide-up">
          {activeTab === 'diversity' && (
            <DiversityTab selectedSiteIds={selectedSiteIds} diversityData={diversityData} />
          )}
          {activeTab === 'population' && (
            <PopulationTab populationTimeSeries={populationTimeSeries} />
          )}
          {activeTab === 'correlation' && (
            <CorrelationTab envParams={envParams} diversityData={diversityData} />
          )}
        </div>
      </div>
    </div>
  );
}

function DiversityTab({
  selectedSiteIds,
  diversityData,
}: {
  selectedSiteIds: string[];
  diversityData: DiversityIndex[];
}) {
  const { sites } = useAppStore();
  const [speciesInput, setSpeciesInput] = useState('12, 45, 8, 23, 30, 15');

  const filteredDiversity = useMemo(
    () => diversityData.filter((d) => selectedSiteIds.includes(d.siteId)),
    [diversityData, selectedSiteIds]
  );

  const latestBySite = useMemo(() => {
    const map: Record<string, DiversityIndex> = {};
    filteredDiversity
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((d) => {
        if (!map[d.siteId]) map[d.siteId] = d;
      });
    return map;
  }, [filteredDiversity]);

  const overviewStats = useMemo(() => {
    const values = Object.values(latestBySite);
    if (values.length === 0) {
      return { shannon: 0, simpson: 0, species: 0, individuals: 0 };
    }
    const avgShannon = values.reduce((s, v) => s + v.shannonIndex, 0) / values.length;
    const avgSimpson = values.reduce((s, v) => s + v.simpsonIndex, 0) / values.length;
    const totalSpecies = values.reduce((s, v) => s + v.speciesCount, 0);
    const totalIndividuals = values.reduce((s, v) => s + v.totalIndividuals, 0);
    return {
      shannon: parseFloat(avgShannon.toFixed(4)),
      simpson: parseFloat(avgSimpson.toFixed(4)),
      species: totalSpecies,
      individuals: totalIndividuals,
    };
  }, [latestBySite]);

  const trendData = useMemo(() => {
    const allDates = Array.from(new Set(filteredDiversity.map((d) => d.date))).sort();
    return allDates.map((date) => {
      const row: Record<string, string | number> = { date };
      selectedSiteIds.forEach((siteId) => {
        const rec = filteredDiversity.find((d) => d.date === date && d.siteId === siteId);
        const siteName = sites.find((s) => s.id === siteId)?.name || siteId;
        if (rec) {
          row[`${siteName}-香农`] = rec.shannonIndex;
          row[`${siteName}-辛普森`] = rec.simpsonIndex;
        }
      });
      return row;
    });
  }, [filteredDiversity, selectedSiteIds, sites]);

  const customCounts = useMemo(() => {
    return speciesInput
      .split(/[,，\s]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n) && n >= 0);
  }, [speciesInput]);

  const customShannon = calculateShannonIndex(customCounts);
  const customSimpson = calculateSimpsonIndex(customCounts);
  const customTotal = customCounts.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="香农指数 (Shannon)"
          value={overviewStats.shannon.toFixed(4)}
          icon={<Trees className="h-6 w-6" strokeWidth={2} />}
          trend="越高越好"
          color="forest"
        />
        <StatCard
          title="辛普森指数 (Simpson)"
          value={overviewStats.simpson.toFixed(4)}
          icon={<Leaf className="h-6 w-6" strokeWidth={2} />}
          trend="越接近1越好"
          color="lake"
        />
        <StatCard
          title="物种总数"
          value={`${overviewStats.species}种`}
          icon={<Users className="h-6 w-6" strokeWidth={2} />}
          color="sun"
        />
        <StatCard
          title="总个体数"
          value={overviewStats.individuals.toLocaleString()}
          icon={<BarChart3 className="h-6 w-6" strokeWidth={2} />}
          color="earth"
        />
      </div>

      {/* Trend Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">多样性指数历史趋势</h2>
            <p className="mt-1 text-sm text-gray-500">
              多监测点香农指数与辛普森指数对比，时间单位：年-月
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1.5">
            <Info className="h-4 w-4 text-forest-600" />
            <span className="text-xs font-medium text-forest-700">
              共 {selectedSiteIds.length} 个监测点 · {trendData.length} 期数据
            </span>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                {selectedSiteIds.map((_, i) => (
                  <linearGradient
                    key={`grad-${i}`}
                    id={`colorGrad-${i}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 3]}
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                label={{ value: '香农指数', angle: -90, position: 'insideLeft', fill: '#2D6A4F', fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0.7, 1]}
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                label={{ value: '辛普森指数', angle: 90, position: 'insideRight', fill: '#40916C', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #2D6A4F',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(45, 106, 79, 0.2)',
                }}
                labelStyle={{ fontWeight: 700, color: '#2D6A4F', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px' }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '16px' }}
                iconType="line"
              />
              {selectedSiteIds.flatMap((siteId, i) => {
                const siteName = sites.find((s) => s.id === siteId)?.name || siteId;
                const color = CHART_COLORS[i % CHART_COLORS.length];
                return [
                  <Line
                    key={`${siteId}-shannon`}
                    yAxisId="left"
                    type="monotone"
                    dataKey={`${siteName}-香农`}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={{ fill: '#fff', stroke: color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
                  />,
                  <Line
                    key={`${siteId}-simpson`}
                    yAxisId="right"
                    type="monotone"
                    dataKey={`${siteName}-辛普森`}
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: color, r: 3 }}
                    activeDot={{ r: 5 }}
                  />,
                ];
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-6 rounded bg-forest-500" />
            <span>实线 = 香农指数（左轴）</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-6 rounded bg-forest-500" style={{ borderStyle: 'dashed' }} />
            <span>虚线 = 辛普森指数（右轴）</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[0] }} />
            <span>不同颜色代表不同监测点</span>
          </div>
        </div>
      </div>

      {/* Calculator + Data Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Calculator */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-forest-600" />
              <h2 className="text-xl font-bold text-gray-900">多样性指数计算器</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              输入各物种数量，实时计算香农和辛普森指数
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                物种数量列表（用逗号或空格分隔）
              </label>
              <textarea
                value={speciesInput}
                onChange={(e) => setSpeciesInput(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-forest-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-200 transition-all"
                placeholder="例如: 12, 45, 8, 23, 30, 15"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                已识别 {customCounts.length} 个物种 · 共 {customTotal} 个个体
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-forest-50 to-forest-100 p-4 border border-forest-200">
                <p className="text-xs font-medium text-forest-700">香农指数 (H')</p>
                <p className="mt-1 text-2xl font-bold text-forest-800">{customShannon}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-lake-50 to-lake-100 p-4 border border-lake-200">
                <p className="text-xs font-medium text-lake-700">辛普森指数 (D)</p>
                <p className="mt-1 text-2xl font-bold text-lake-800">{customSimpson}</p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-forest-500" />
                计算公式说明
              </h4>
              <div className="space-y-3 text-xs text-gray-600">
                <div>
                  <p className="font-medium text-forest-700">香农-威纳指数：</p>
                  <p className="mt-1 font-mono bg-white rounded px-2 py-1.5 border border-gray-200">
                    H' = -Σ(pi × ln(pi))
                  </p>
                  <p className="mt-1 text-gray-500">
                    其中 pi = 第i个物种个体数 / 总个体数。数值越大表示多样性越高，通常在0~4之间。
                  </p>
                </div>
                <div>
                  <p className="font-medium text-lake-700">辛普森指数：</p>
                  <p className="mt-1 font-mono bg-white rounded px-2 py-1.5 border border-gray-200">
                    D = 1 - Σ(ni(ni-1) / N(N-1))
                  </p>
                  <p className="mt-1 text-gray-500">
                    其中 ni = 第i个物种个体数，N = 总个体数。数值越接近1表示多样性越高。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">历史数据明细表</h2>
            <p className="mt-1 text-sm text-gray-500">
              各监测点各期多样性指数详细数值
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-forest-50 text-forest-800">
                  <th className="px-4 py-3 text-left font-semibold">监测点</th>
                  <th className="px-4 py-3 text-left font-semibold">日期</th>
                  <th className="px-4 py-3 text-right font-semibold">香农</th>
                  <th className="px-4 py-3 text-right font-semibold">辛普森</th>
                  <th className="px-4 py-3 text-right font-semibold">物种数</th>
                  <th className="px-4 py-3 text-right font-semibold">个体数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDiversity
                  .slice()
                  .sort((a, b) => {
                    const dateCmp = new Date(b.date).getTime() - new Date(a.date).getTime();
                    if (dateCmp !== 0) return dateCmp;
                    return a.siteId.localeCompare(b.siteId);
                  })
                  .map((d, i) => {
                    const site = sites.find((s) => s.id === d.siteId);
                    return (
                      <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {site?.name || d.siteId}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{d.date}</td>
                        <td className="px-4 py-3 text-right font-mono text-forest-700">
                          {d.shannonIndex.toFixed(4)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-lake-700">
                          {d.simpsonIndex.toFixed(4)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{d.speciesCount}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {d.totalIndividuals.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                {filteredDiversity.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      请选择至少一个监测点查看数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function PopulationTab({
  populationTimeSeries,
}: {
  populationTimeSeries: { date: string; [key: string]: string | number }[];
}) {
  const [selectedBirds, setSelectedBirds] = useState<string[]>(['白头鹎', '白鹭', '东方白鹳']);

  const toggleBird = (bird: string) => {
    setSelectedBirds((prev) =>
      prev.includes(bird) ? prev.filter((b) => b !== bird) : [...prev, bird]
    );
  };

  const growthData = useMemo(() => {
    const years = new Set<string>();
    populationTimeSeries.forEach((p) => {
      const year = p.date.split('-')[0];
      years.add(year);
    });
    const yearList = Array.from(years).sort();
    return yearList.slice(1).map((year) => {
      const prevYear = yearList[yearList.indexOf(year) - 1];
      const row: Record<string, string | number> = { year };
      selectedBirds.forEach((bird) => {
        const current = populationTimeSeries
          .filter((p) => p.date.startsWith(year))
          .reduce((s, p) => s + (p[bird] as number), 0);
        const prev = populationTimeSeries
          .filter((p) => p.date.startsWith(prevYear))
          .reduce((s, p) => s + (p[bird] as number), 0);
        row[bird] = prev > 0 ? parseFloat(((current - prev) / prev * 100).toFixed(1)) : 0;
      });
      return row;
    });
  }, [populationTimeSeries, selectedBirds]);

  return (
    <div className="space-y-6">
      {/* Species Selector */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">选择对比物种</h2>
            <p className="mt-1 text-sm text-gray-500">从常见鸟类中选择要对比的种群</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {birdSpecies.map((bird, i) => {
            const checked = selectedBirds.includes(bird);
            const color = CHART_COLORS[i % CHART_COLORS.length];
            return (
              <button
                key={bird}
                onClick={() => toggleBird(bird)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all duration-200 border-2',
                  checked
                    ? 'border-transparent text-white shadow-card'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                )}
                style={checked ? { backgroundColor: color } : {}}
              >
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border-2',
                    checked ? 'border-white/60' : 'border-gray-300'
                  )}
                >
                  {checked && <Check className="h-2.5 w-2.5 text-white" />}
                </div>
                <span>{bird}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-line Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">种群数量时间序列</h2>
            <p className="mt-1 text-sm text-gray-500">
              季度监测数据对比，2020-Q1 ~ 2024-Q3
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-lake-50 px-3 py-1.5">
            <TrendingUp className="h-4 w-4 text-lake-600" />
            <span className="text-xs font-medium text-lake-700">
              {populationTimeSeries.length} 个季度 · {selectedBirds.length} 个物种
            </span>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={populationTimeSeries} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                label={{ value: '种群数量（只）', angle: -90, position: 'insideLeft', fill: '#2D6A4F', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #40916C',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(64, 145, 108, 0.2)',
                }}
                labelStyle={{ fontWeight: 700, color: '#2D6A4F', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '16px' }} />
              {selectedBirds.map((bird, i) => (
                <Line
                  key={bird}
                  type="monotone"
                  dataKey={bird}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={3}
                  dot={{
                    fill: '#fff',
                    stroke: CHART_COLORS[i % CHART_COLORS.length],
                    strokeWidth: 2,
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                    fill: CHART_COLORS[i % CHART_COLORS.length],
                    stroke: '#fff',
                    strokeWidth: 3,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Rate Bar Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">年度同比增长率</h2>
          <p className="mt-1 text-sm text-gray-500">
            各物种种群数量较上年同期变化百分比（%）
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="year"
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                label={{ value: '增长率(%)', angle: -90, position: 'insideLeft', fill: '#D4A373', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #D4A373',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(212, 163, 115, 0.2)',
                }}
                labelStyle={{ fontWeight: 700, color: '#8B7355', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px' }}
                formatter={(value: number) => [`${value}%`, '同比增长']}
              />
              <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
              <Legend wrapperStyle={{ paddingTop: '16px' }} />
              {selectedBirds.map((bird, i) => (
                <Bar key={bird} dataKey={bird} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Raw Data Table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">原始时间序列数据表</h2>
          <p className="mt-1 text-sm text-gray-500">各季度各物种种群数量原始记录</p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-lake-50 text-lake-800">
                <th className="px-4 py-3 text-left font-semibold">季度</th>
                {selectedBirds.map((bird) => (
                  <th key={bird} className="px-4 py-3 text-right font-semibold">
                    {bird}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {populationTimeSeries.map((row, i) => (
                <tr key={row.date} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 font-medium text-gray-800">{row.date}</td>
                  {selectedBirds.map((bird) => (
                    <td key={bird} className="px-4 py-3 text-right font-mono text-gray-700">
                      {row[bird] as number}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface MergedRow {
  [key: string]: number | string | undefined;
  _siteId: string;
  _month: string;
  soilTemperature?: number;
  soilMoisture?: number;
  waterPH?: number;
  waterTemperature?: number;
  waterTransparency?: number;
  shannonIndex?: number;
  simpsonIndex?: number;
  speciesCount?: number;
  totalIndividuals?: number;
}

function CorrelationTab({
  envParams,
  diversityData,
}: {
  envParams: EnvironmentalParam[];
  diversityData: DiversityIndex[];
}) {
  const { sites } = useAppStore();
  const [xFactor, setXFactor] = useState('soilTemperature');
  const [yMetric, setYMetric] = useState('shannonIndex');

  const mergedData = useMemo(() => {
    const monthMap: Record<string, MergedRow> = {};
    envParams.forEach((ep) => {
      const month = ep.date.slice(0, 7);
      const key = `${ep.siteId}-${month}`;
      if (!monthMap[key]) {
        monthMap[key] = {
          _siteId: ep.siteId,
          _month: month,
        };
        envFactorOptions.forEach((f) => {
          monthMap[key][f.key] = ep[f.key as keyof EnvironmentalParam] as number;
        });
      }
    });
    diversityData.forEach((d) => {
      const key = `${d.siteId}-${d.date}`;
      if (monthMap[key]) {
        monthMap[key].shannonIndex = d.shannonIndex;
        monthMap[key].simpsonIndex = d.simpsonIndex;
        monthMap[key].speciesCount = d.speciesCount;
        monthMap[key].totalIndividuals = d.totalIndividuals;
      }
    });
    return Object.values(monthMap).filter(
      (row): row is MergedRow & Record<string, number> =>
        row[xFactor] !== undefined &&
        row[yMetric] !== undefined &&
        typeof row[xFactor] === 'number' &&
        typeof row[yMetric] === 'number'
    );
  }, [envParams, diversityData, xFactor, yMetric]);

  const scatterData = useMemo(
    () =>
      mergedData.map((row) => ({
        x: row[xFactor] as number,
        y: row[yMetric] as number,
        site: sites.find((s) => s.id === String(row._siteId))?.name || String(row._siteId),
        date: String(row._month),
      })),
    [mergedData, xFactor, yMetric, sites]
  );

  const pearsonR = useMemo(() => {
    const xs = scatterData.map((d) => d.x);
    const ys = scatterData.map((d) => d.y);
    return calculatePearsonCorrelation(xs, ys);
  }, [scatterData]);

  const trendLine = useMemo(() => {
    if (scatterData.length < 2) return null;
    const n = scatterData.length;
    const sumX = scatterData.reduce((s, d) => s + d.x, 0);
    const sumY = scatterData.reduce((s, d) => s + d.y, 0);
    const sumXY = scatterData.reduce((s, d) => s + d.x * d.y, 0);
    const sumX2 = scatterData.reduce((s, d) => s + d.x * d.x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const xs = scatterData.map((d) => d.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    return {
      start: { x: minX, y: slope * minX + intercept },
      end: { x: maxX, y: slope * maxX + intercept },
      slope,
      intercept,
    };
  }, [scatterData]);

  const correlationMatrix = useMemo(() => {
    const envKeys = envFactorOptions.map((f) => f.key);
    const divKeys = diversityMetricOptions.map((m) => m.key);
    const validRows = Object.values(
      mergedData.reduce<Record<string, MergedRow & Record<string, number>>>((acc, row) => {
        const allDefined = [...envKeys, ...divKeys].every(
          (k) => row[k] !== undefined && typeof row[k] === 'number'
        );
        if (allDefined) {
          acc[`${String(row._siteId)}-${String(row._month)}`] = row as MergedRow & Record<string, number>;
        }
        return acc;
      }, {})
    );
    const matrix: { envFactor: string; [key: string]: string | number }[] = [];
    envFactorOptions.forEach((f) => {
      const row: { envFactor: string; [key: string]: string | number } = {
        envFactor: f.label,
      };
      diversityMetricOptions.forEach((m) => {
        const xs = validRows.map((r) => r[f.key] as number);
        const ys = validRows.map((r) => r[m.key] as number);
        row[m.label] = calculatePearsonCorrelation(xs, ys);
      });
      matrix.push(row);
    });
    return matrix;
  }, [mergedData]);

  const getCorrelationColor = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 0.8) return value >= 0 ? 'rgba(45, 106, 79, 0.9)' : 'rgba(185, 83, 83, 0.9)';
    if (abs >= 0.6) return value >= 0 ? 'rgba(64, 145, 108, 0.75)' : 'rgba(217, 119, 119, 0.75)';
    if (abs >= 0.4) return value >= 0 ? 'rgba(107, 144, 128, 0.6)' : 'rgba(232, 162, 130, 0.6)';
    if (abs >= 0.2) return value >= 0 ? 'rgba(164, 195, 178, 0.45)' : 'rgba(242, 213, 158, 0.45)';
    return 'rgba(243, 244, 246, 0.8)';
  };

  const correlationStrength = useMemo(() => {
    const abs = Math.abs(pearsonR);
    if (abs >= 0.8) return { label: '极强相关', color: 'text-forest-600 bg-forest-50' };
    if (abs >= 0.6) return { label: '强相关', color: 'text-lake-600 bg-lake-50' };
    if (abs >= 0.4) return { label: '中等相关', color: 'text-sun-700 bg-sun-50' };
    if (abs >= 0.2) return { label: '弱相关', color: 'text-earth-600 bg-earth-50' };
    return { label: '几乎无关', color: 'text-gray-500 bg-gray-50' };
  }, [pearsonR]);

  return (
    <div className="space-y-6">
      {/* Factor Selectors */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-sun-600" />
            X轴：环境因子
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {envFactorOptions.map((f) => {
              const Icon = f.icon;
              const active = xFactor === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setXFactor(f.key)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border',
                    active
                      ? 'bg-sun-500 text-white border-sun-500 shadow-card'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-sun-300 hover:bg-sun-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Trees className="h-4 w-4 text-forest-600" />
            Y轴：多样性指标
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {diversityMetricOptions.map((m) => {
              const active = yMetric === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setYMetric(m.key)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border',
                    active
                      ? 'bg-forest-500 text-white border-forest-500 shadow-card'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-forest-300 hover:bg-forest-50'
                  )}
                >
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scatter Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {envFactorOptions.find((f) => f.key === xFactor)?.label}
              {' × '}
              {diversityMetricOptions.find((m) => m.key === yMetric)?.label}
              {' 相关性散点图'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              每个点代表一个监测点在某月份的一次测量
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={cn(
                'rounded-full px-4 py-2 font-medium',
                correlationStrength.color
              )}
            >
              Pearson r = {pearsonR.toFixed(4)} · {correlationStrength.label}
            </div>
            <div className="rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
              {scatterData.length} 个样本点
            </div>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                dataKey="x"
                name={envFactorOptions.find((f) => f.key === xFactor)?.label}
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                label={{
                  value: envFactorOptions.find((f) => f.key === xFactor)?.label,
                  position: 'insideBottom',
                  offset: -10,
                  fill: '#D4A373',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={diversityMetricOptions.find((m) => m.key === yMetric)?.label}
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                label={{
                  value: diversityMetricOptions.find((m) => m.key === yMetric)?.label,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  fill: '#2D6A4F',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <ZAxis type="number" range={[60, 60]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null;
                  const data = payload[0].payload as {
                    x: number;
                    y: number;
                    site: string;
                    date: string;
                  };
                  return (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #2D6A4F',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(45, 106, 79, 0.25)',
                        padding: '12px 16px',
                        minWidth: '180px',
                      }}
                    >
                      <p style={{ fontWeight: 700, color: '#2D6A4F', marginBottom: '8px', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px' }}>
                        {data.site}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        监测时间：{data.date}
                      </p>
                      <p style={{ fontSize: '13px', color: '#374151' }}>
                        <span style={{ color: '#D4A373', fontWeight: 600 }}>
                          {envFactorOptions.find((f) => f.key === xFactor)?.label}：
                        </span>
                        {data.x.toFixed(2)}
                      </p>
                      <p style={{ fontSize: '13px', color: '#374151' }}>
                        <span style={{ color: '#2D6A4F', fontWeight: 600 }}>
                          {diversityMetricOptions.find((m) => m.key === yMetric)?.label}：
                        </span>
                        {typeof data.y === 'number' ? data.y.toFixed(4) : data.y}
                      </p>
                    </div>
                  );
                }}
              />
              {trendLine && (
                <ReferenceLine
                  segment={[trendLine.start, trendLine.end]}
                  stroke="#D4A373"
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                />
              )}
              <Scatter name="监测数据" data={scatterData}>
                {scatterData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.75} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {trendLine && (
          <div className="mt-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-forest-500" />
              线性回归趋势线
            </h4>
            <p className="text-xs text-gray-600 font-mono bg-white rounded px-3 py-2 border border-gray-200">
              ŷ = {trendLine.slope.toFixed(4)}x + {trendLine.intercept.toFixed(4)}
              <span className="ml-3 text-gray-500 font-sans">
                （斜率 = {trendLine.slope.toFixed(4)}，截距 = {trendLine.intercept.toFixed(4)}）
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Correlation Heatmap Matrix */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">相关性系数矩阵热力图</h2>
          <p className="mt-1 text-sm text-gray-500">
            所有环境因子 × 多样性指标的 Pearson 相关系数矩阵
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gradient-to-r from-forest-50 to-lake-50 text-forest-800">
                <th className="px-4 py-3 text-left font-semibold border-r border-gray-200">
                  环境因子 \ 多样性指标
                </th>
                {diversityMetricOptions.map((m) => (
                  <th key={m.label} className="px-4 py-3 text-center font-semibold">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {correlationMatrix.map((row) => (
                <tr key={row.envFactor as string}>
                  <td className="px-4 py-3 font-semibold text-gray-800 border-r border-gray-200 bg-gray-50/30">
                    {row.envFactor}
                  </td>
                  {diversityMetricOptions.map((m) => {
                    const value = row[m.label] as number;
                    return (
                      <td
                        key={m.label}
                        className="px-4 py-3 text-center"
                        style={{ backgroundColor: getCorrelationColor(value) }}
                      >
                        <span
                          className={cn(
                            'font-mono font-semibold',
                            Math.abs(value) >= 0.4
                              ? 'text-white drop-shadow-sm'
                              : 'text-gray-700'
                          )}
                        >
                          {value.toFixed(3)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <p className="text-xs font-medium text-gray-600">图例：</p>
          {[
            { label: '强正相关 (≥0.8)', color: 'rgba(45, 106, 79, 0.9)' },
            { label: '正相关 (0.6~0.8)', color: 'rgba(64, 145, 108, 0.75)' },
            { label: '弱相关 (0.4~0.6)', color: 'rgba(107, 144, 128, 0.6)' },
            { label: '几乎无关 (<0.2)', color: 'rgba(243, 244, 246, 0.8)' },
            { label: '弱负相关 (-0.6~-0.4)', color: 'rgba(232, 162, 130, 0.6)' },
            { label: '强负相关 (≤-0.8)', color: 'rgba(185, 83, 83, 0.9)' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="h-3 w-5 rounded border border-gray-200"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
