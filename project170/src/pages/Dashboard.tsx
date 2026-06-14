import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Gem,
  Sparkles,
  Crown,
  BookOpen,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Image as ImageIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  SPECIMEN_TYPE_LABELS,
  SPECIMEN_TYPE_COLORS,
  SOURCE_TYPE_LABELS,
  RARITY_LABELS,
  RARITY_COLORS,
  LOAN_STATUS_LABELS,
  LOAN_STATUS_COLORS,
} from '@/types';
import { formatDate } from '@/utils/dateUtils';

const PIE_COLORS = ['#10b981', '#f59e0b'];

const RARITY_BG: Record<string, string> = {
  common: 'from-gray-50 to-gray-100 border-gray-200',
  uncommon: 'from-blue-50 to-blue-100 border-blue-200',
  rare: 'from-purple-50 to-purple-100 border-purple-200',
  'extremely-rare': 'from-red-50 to-red-100 border-red-200',
};

const RARITY_ICON_BG: Record<string, string> = {
  common: 'bg-gray-500',
  uncommon: 'bg-blue-500',
  rare: 'bg-purple-500',
  'extremely-rare': 'bg-red-500',
};

export default function Dashboard() {
  const specimens = useAppStore((s) => s.specimens);
  const acquisitionRecords = useAppStore((s) => s.acquisitionRecords);
  const scientificData = useAppStore((s) => s.scientificData);
  const loanRecords = useAppStore((s) => s.loanRecords);

  const totalSpecimens = specimens.length;

  const totalValueCNY = useMemo(() => {
    return acquisitionRecords.reduce((sum, rec) => {
      if (!rec.currentValuation) return sum;
      const currency = rec.currency || 'CNY';
      const rate = currency === 'USD' ? 7 : 1;
      return sum + rec.currentValuation * rate;
    }, 0);
  }, [acquisitionRecords]);

  const rareCount = useMemo(() => {
    return scientificData.filter(
      (d) => d.rarity === 'rare' || d.rarity === 'extremely-rare'
    ).length;
  }, [scientificData]);

  const onLoanCount = loanRecords.filter((l) => l.status === 'on-loan').length;

  const typeDistribution = useMemo(() => {
    const mineralCount = specimens.filter((s) => s.type === 'mineral').length;
    const meteoriteCount = specimens.filter((s) => s.type === 'meteorite').length;
    return [
      { name: SPECIMEN_TYPE_LABELS.mineral, value: mineralCount, key: 'mineral' },
      { name: SPECIMEN_TYPE_LABELS.meteorite, value: meteoriteCount, key: 'meteorite' },
    ];
  }, [specimens]);

  const sourceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    acquisitionRecords.forEach((rec) => {
      const label = SOURCE_TYPE_LABELS[rec.sourceType];
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      数量: count,
    }));
  }, [acquisitionRecords]);

  const rarityDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      'extremely-rare': 0,
    };
    scientificData.forEach((d) => {
      counts[d.rarity] = (counts[d.rarity] || 0) + 1;
    });
    return Object.entries(counts).map(([key, count]) => ({
      key,
      label: RARITY_LABELS[key as keyof typeof RARITY_LABELS],
      count,
    }));
  }, [scientificData]);

  const recentSpecimens = useMemo(() => {
    return [...specimens]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [specimens]);

  const recentLoans = useMemo(() => {
    return [...loanRecords]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [loanRecords]);

  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `¥ ${(value / 10000).toFixed(2)} 万`;
    }
    return `¥ ${value.toLocaleString('zh-CN')}`;
  };

  const getSpecimenById = (id: string) => specimens.find((s) => s.id === id);

  const statCards = [
    {
      title: '标本总数',
      value: totalSpecimens,
      suffix: '件',
      icon: Gem,
      bgGradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-400/30',
      description: '矿物与陨石标本',
      trend: '+2 本月',
    },
    {
      title: '估值总额',
      value: formatCurrency(totalValueCNY),
      suffix: '',
      icon: TrendingUp,
      bgGradient: 'from-emerald-500 to-green-600',
      iconBg: 'bg-emerald-400/30',
      description: '人民币估算',
      trend: 'USD 按 1:7 换算',
    },
    {
      title: '稀有标本',
      value: rareCount,
      suffix: '件',
      icon: Crown,
      bgGradient: 'from-purple-500 to-fuchsia-600',
      iconBg: 'bg-purple-400/30',
      description: '稀有 / 极稀有',
      trend: '占馆藏重要地位',
    },
    {
      title: '出借中',
      value: onLoanCount,
      suffix: '批',
      icon: BookOpen,
      bgGradient: 'from-sky-500 to-blue-600',
      iconBg: 'bg-sky-400/30',
      description: '外借展览 / 研究',
      trend: loanRecords.find((l) => l.status === 'on-loan')?.expectedReturnDate
        ? `预计归还: ${formatDate(loanRecords.find((l) => l.status === 'on-loan')!.expectedReturnDate!)}`
        : '暂无出借',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">收藏概览</h1>
          <p className="text-sm text-gray-500 mt-1">
            欢迎回来，今天是 {formatDate(new Date().toISOString().split('T')[0])}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>馆藏数据实时更新</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-animation">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="card card-hover p-5 relative overflow-hidden"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.bgGradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`}
            />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.bgGradient} flex items-center justify-center shadow-lg`}
                >
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-4">{card.title}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-semibold text-primary-900 font-serif">
                  {card.value}
                </span>
                {card.suffix && (
                  <span className="text-sm text-gray-500">{card.suffix}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">{card.description}</p>
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {card.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">标本类型分布</h3>
            <span className="text-xs text-gray-400">矿物 vs 陨石</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [`${value} 件`, '数量']}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">来源方式分布</h3>
            <span className="text-xs text-gray-400">各获取途径统计</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sourceDistribution}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '13px',
                  }}
                  cursor={{ fill: 'rgba(245, 158, 11, 0.06)' }}
                />
                <Bar
                  dataKey="数量"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title mb-0">稀有度分布</h3>
          <span className="text-xs text-gray-400">科学分级统计</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {rarityDistribution.map((item) => (
            <div
              key={item.key}
              className={`rounded-xl p-4 border bg-gradient-to-br ${RARITY_BG[item.key]} transition-all duration-300 hover:shadow-md`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${RARITY_ICON_BG[item.key]} flex items-center justify-center`}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-2xl font-serif font-semibold text-gray-800">
                    {item.count}
                    <span className="text-sm font-normal text-gray-500 ml-1">件</span>
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${RARITY_ICON_BG[item.key]}`}
                  style={{
                    width: `${totalSpecimens > 0 ? (item.count / totalSpecimens) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                占比 {totalSpecimens > 0 ? ((item.count / totalSpecimens) * 100).toFixed(1) : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title mb-0">最近新增标本</h3>
            <span className="text-xs text-gray-400">最新 5 件</span>
          </div>
          <div className="space-y-3">
            {recentSpecimens.map((specimen) => {
              const primaryPhoto = specimen.photos.find((p) => p.isPrimary) || specimen.photos[0];
              return (
                <div
                  key={specimen.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-amber-50/50 transition-colors group cursor-pointer"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100">
                    {primaryPhoto ? (
                      <img
                        src={primaryPhoto.url}
                        alt={specimen.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-amber-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-primary-900 truncate group-hover:text-amber-700 transition-colors">
                        {specimen.name}
                      </p>
                      <span className={`badge ${SPECIMEN_TYPE_COLORS[specimen.type]} flex-shrink-0`}>
                        {SPECIMEN_TYPE_LABELS[specimen.type]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      {specimen.specimenNo}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{formatDate(specimen.createdAt)}</p>
                    {specimen.weightG && (
                      <p className="text-xs text-amber-600 mt-0.5">{specimen.weightG} g</p>
                    )}
                  </div>
                </div>
              );
            })}
            {recentSpecimens.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Gem className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无标本数据</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title mb-0">最近出借记录</h3>
            <span className="text-xs text-gray-400">最新动态</span>
          </div>
          <div className="space-y-3">
            {recentLoans.map((loan) => {
              const loanSpecimens = loan.specimenIds
                .map((id) => getSpecimenById(id))
                .filter(Boolean);
              return (
                <div
                  key={loan.id}
                  className="p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <p className="font-medium text-primary-900 truncate">
                          {loan.borrowerName}
                        </p>
                      </div>
                      {loan.institution && (
                        <p className="text-xs text-gray-500 mt-1 ml-6">
                          {loan.institution}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2 ml-6">
                        出借标本:
                        <span className="text-amber-600 ml-1">
                          {loanSpecimens.length > 0
                            ? loanSpecimens.slice(0, 2).map((s) => s!.name).join('、')
                            : '-'
                            }
                          {loanSpecimens.length > 2 && ` 等${loanSpecimens.length}件`}
                        </span>
                      </p>
                    </div>
                    <span className={`badge ${LOAN_STATUS_COLORS[loan.status]} flex-shrink-0`}>
                      {LOAN_STATUS_LABELS[loan.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 ml-6">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>出借: {formatDate(loan.loanDate)}</span>
                    </div>
                    {loan.expectedReturnDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>预计归还: {formatDate(loan.expectedReturnDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {recentLoans.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无出借记录</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
