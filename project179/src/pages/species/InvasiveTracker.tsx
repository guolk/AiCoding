import { useMemo } from 'react';
import {
  AlertTriangle,
  MapPin,
  Calendar,
  TrendingUp,
  Bug,
  Scissors,
  Leaf,
  Sprout,
  Shield,
  AreaChart,
  Users,
} from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  color?: string;
}

function Sparkline({ data, color = '#ef4444' }: SparklineProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const step = width / (data.length - 1 || 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;
  const areaPath = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#sparkGrad-${color.replace('#', '')})`}
      />
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(data.length - 1) * step}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r={3}
        fill={color}
      />
    </svg>
  );
}

export default function InvasiveTracker() {
  const { species, sites } = useAppStore();

  const invasiveSpecies = useMemo(
    () => species.filter((sp) => sp.isInvasive),
    [species]
  );

  const siteNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    sites.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [sites]);

  const stats = useMemo(() => {
    const affectedSiteIds = new Set(invasiveSpecies.map((sp) => sp.siteId));
    const totalSpreadArea = invasiveSpecies.reduce((acc, sp) => {
      const match = sp.spreadRange.match(/(\d+(?:\.\d+)?)/);
      return acc + (match ? parseFloat(match[1]) : 0);
    }, 0);
    return {
      count: invasiveSpecies.length,
      affectedSites: affectedSiteIds.size,
      spreadArea: totalSpreadArea.toFixed(1),
    };
  }, [invasiveSpecies]);

  const generateTrendData = (count: number): number[] => {
    const base = Math.max(1, Math.floor(count / 3));
    return [
      base + Math.floor(Math.random() * 5),
      base * 2 + Math.floor(Math.random() * 5),
      base * 2 + Math.floor(Math.random() * 8),
      base * 2 + 5 + Math.floor(Math.random() * 8),
      count - Math.floor(Math.random() * 5),
      count,
    ];
  };

  const sortedByImpact = useMemo(() => {
    return [...invasiveSpecies].sort((a, b) => b.count - a.count);
  }, [invasiveSpecies]);

  const getImpactLevel = (count: number): { level: string; color: string; textColor: string } => {
    if (count >= 500) return { level: '极危', color: 'bg-red-100', textColor: 'text-red-700' };
    if (count >= 200) return { level: '高危', color: 'bg-orange-100', textColor: 'text-orange-700' };
    return { level: '中危', color: 'bg-yellow-100', textColor: 'text-yellow-700' };
  };

  const eradicationSuggestions = [
    {
      icon: Scissors,
      title: '机械清除',
      description: '适用于小面积、新发现的入侵物种种群，通过人工拔除、割除等物理方式清除。',
      suitable: '加拿大一枝黄花、喜旱莲子草',
    },
    {
      icon: Sprout,
      title: '生物防治',
      description: '利用入侵物种的天敌进行控制，具有长效性和环保优势，需经过严格评估。',
      suitable: '水葫芦、互花米草',
    },
    {
      icon: Shield,
      title: '化学防治',
      description: '使用除草剂等化学药剂进行防治，见效快但需注意对环境的影响，建议由专业人员操作。',
      suitable: '大面积严重入侵区域',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50/50 via-white to-lake-50/30">
      <Header title="入侵物种追踪" subtitle="外来入侵物种监测与防控管理" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 grid grid-cols-1 gap-6 animate-slide-up sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="入侵物种总数"
            value={`${stats.count} 种`}
            icon={<Bug className="h-6 w-6" strokeWidth={2} />}
            color="earth"
            trend={`较上月 +${Math.floor(invasiveSpecies.length * 0.2)}`}
            trendUp={false}
          />
          <StatCard
            title="总扩散面积"
            value={`${stats.spreadArea} m²`}
            icon={<AreaChart className="h-6 w-6" strokeWidth={2} />}
            color="forest"
            trend="持续扩展"
            trendUp={false}
          />
          <StatCard
            title="受影响监测点"
            value={`${stats.affectedSites} 个`}
            icon={<MapPin className="h-6 w-6" strokeWidth={2} />}
            color="lake"
            trend={`共 ${sites.length} 个监测点`}
          />
        </div>

        {invasiveSpecies.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="w-8 h-8" strokeWidth={1.5} />}
            title="暂无入侵物种记录"
            description="当前未记录到任何入侵物种，生态系统状况良好。请继续保持监测。"
          />
        ) : (
          <>
            <div
              className="mb-8 overflow-hidden rounded-2xl bg-white shadow-card border border-forest-100/50 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <div className="px-6 py-5 border-b border-forest-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-forest-800 flex items-center gap-2">
                    <Bug className="w-5 h-5 text-red-500" />
                    入侵物种列表
                  </h2>
                  <p className="text-sm text-forest-600 mt-1">
                    按发现时间排序的入侵物种监测数据
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-forest-50/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">
                        物种信息
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">
                        分类
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">
                        扩散范围
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">
                        首次发现
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">
                        监测点
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">
                        数量趋势
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100">
                    {invasiveSpecies.map((sp, index) => {
                      const impact = getImpactLevel(sp.count);
                      const trendData = generateTrendData(sp.count);
                      return (
                        <tr
                          key={sp.id}
                          className={cn(
                            'transition-colors hover:bg-forest-50/30',
                            'animate-slide-up'
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-red-100 to-orange-100 flex-shrink-0">
                                {sp.photos[0] ? (
                                  <img
                                    src={sp.photos[0]}
                                    alt={sp.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-red-400">
                                    <Bug className="w-6 h-6" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-forest-800">
                                    {sp.name}
                                  </span>
                                  <span
                                    className={cn(
                                      'px-2 py-0.5 rounded-full text-xs font-medium',
                                      impact.color,
                                      impact.textColor
                                    )}
                                  >
                                    {impact.level}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-forest-600">
                                  <Users className="w-3.5 h-3.5 text-lake-500" />
                                  <span>{sp.count} 个/只</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge text={sp.taxonomy} variant="info" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-forest-700 line-clamp-2">
                                {sp.spreadRange || '-'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-forest-600">
                              <Calendar className="w-3.5 h-3.5 text-sun-500" />
                              {sp.date}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-forest-700">
                              <MapPin className="w-3.5 h-3.5 text-forest-500" />
                              <span className="max-w-[120px] truncate">
                                {siteNameMap[sp.siteId] || '未知'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Sparkline data={trendData} />
                              <div className="flex items-center gap-1 text-xs text-red-600">
                                <TrendingUp className="w-3.5 h-3.5" />
                                ↑
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-8 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-forest-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  扩散范围可视化
                </h2>
                <p className="text-sm text-forest-600 mt-1">
                  按受影响程度排序的入侵物种扩散情况
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {sortedByImpact.map((sp, index) => {
                  const impact = getImpactLevel(sp.count);
                  const percentage = Math.min(100, (sp.count / 1000) * 100);
                  return (
                    <div
                      key={sp.id}
                      className={cn(
                        'group relative overflow-hidden rounded-2xl bg-white shadow-card',
                        'border-2 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
                        'animate-slide-up',
                        impact.level === '极危'
                          ? 'border-red-300'
                          : impact.level === '高危'
                          ? 'border-orange-300'
                          : 'border-yellow-300'
                      )}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div
                        className={cn(
                          'absolute top-0 left-0 right-0 h-1',
                          impact.level === '极危'
                            ? 'bg-red-400'
                            : impact.level === '高危'
                            ? 'bg-orange-400'
                            : 'bg-yellow-400'
                        )}
                      />
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                                impact.level === '极危'
                                  ? 'bg-red-100 text-red-600'
                                  : impact.level === '高危'
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-yellow-100 text-yellow-600'
                              )}
                            >
                              <Bug className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-forest-800">
                                {sp.name}
                              </h3>
                              <Badge text={sp.taxonomy.split(' ')[0]} variant="info" />
                            </div>
                          </div>
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-bold',
                              impact.color,
                              impact.textColor
                            )}
                          >
                            {impact.level}
                          </span>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-forest-500">
                                种群规模
                              </span>
                              <span className="text-xs font-semibold text-forest-700">
                                {sp.count} 个/只
                              </span>
                            </div>
                            <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-500',
                                  impact.level === '极危'
                                    ? 'bg-red-400'
                                    : impact.level === '高危'
                                    ? 'bg-orange-400'
                                    : 'bg-yellow-400'
                                )}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-sm text-forest-600">
                            <MapPin className="w-4 h-4 text-forest-400" />
                            <span className="truncate">
                              {siteNameMap[sp.siteId] || '未知监测点'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-forest-50/50 border border-forest-100">
                          <p className="text-xs font-semibold text-forest-700 mb-1.5 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                            扩散描述
                          </p>
                          <p className="text-xs text-forest-600 leading-relaxed line-clamp-3">
                            {sp.spreadRange || '暂无详细扩散数据'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-forest-800 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-forest-500" />
                  清除建议
                </h2>
                <p className="text-sm text-forest-600 mt-1">
                  根据入侵物种特性，推荐以下防控措施
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {eradicationSuggestions.map((suggestion, index) => {
                  const IconComp = suggestion.icon;
                  const colors = [
                    { bg: 'bg-lake-50', border: 'border-lake-200', iconBg: 'bg-lake-100', iconColor: 'text-lake-600' },
                    { bg: 'bg-forest-50', border: 'border-forest-200', iconBg: 'bg-forest-100', iconColor: 'text-forest-600' },
                    { bg: 'bg-sun-50', border: 'border-sun-200', iconBg: 'bg-sun-100', iconColor: 'text-sun-600' },
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <div
                      key={suggestion.title}
                      className={cn(
                        'rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover animate-slide-up',
                        'border-2',
                        color.bg,
                        color.border
                      )}
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                          color.iconBg,
                          color.iconColor
                        )}
                      >
                        <IconComp className="w-6 h-6" strokeWidth={2} />
                      </div>
                      <h3 className="font-bold text-forest-800 text-lg mb-2">
                        {suggestion.title}
                      </h3>
                      <p className="text-sm text-forest-600 leading-relaxed mb-4">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Leaf className="w-3.5 h-3.5 text-forest-500" />
                        <span className="text-forest-700 font-medium">适用：</span>
                        <span className="text-forest-600">{suggestion.suitable}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
