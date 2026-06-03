import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Footprints, Globe, BookOpen, GraduationCap, Wallet, Receipt } from 'lucide-react';
import { MUSEUM_TYPE_LABELS, MUSEUM_TYPE_COLORS, type MuseumType } from '@/types';
import { useMuseumStore } from '@/store/useMuseumStore';

const CHART_TEXT = '#f5f0e8';
const GRID_STROKE = '#ffffff10';
const GOLD = '#c9a96e';

const MUSEUM_TYPES: MuseumType[] = ['art', 'history', 'science', 'nature', 'other'];

export default function Statistics() {
  const { visits, exhibitions, learningNotes } = useMuseumStore();

  const totalVisits = visits.length;
  const totalCountries = new Set(visits.map((v) => v.country)).size;
  const totalExhibitions = exhibitions.length;
  const totalNotes = learningNotes.length;

  const yearTrendData = useMemo(() => {
    const yearMap: Record<string, number> = {};
    visits.forEach((v) => {
      const year = new Date(v.date).getFullYear();
      if (!isNaN(year)) {
        yearMap[year] = (yearMap[year] || 0) + 1;
      }
    });
    return Object.entries(yearMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, count]) => ({ year, count }));
  }, [visits]);

  const countryData = useMemo(() => {
    const countryMap: Record<string, number> = {};
    visits.forEach((v) => {
      countryMap[v.country] = (countryMap[v.country] || 0) + 1;
    });
    return Object.entries(countryMap)
      .sort(([, a], [, b]) => b - a)
      .map(([country, count]) => ({ country, count }));
  }, [visits]);

  const typeData = useMemo(() => {
    const typeMap: Record<MuseumType, number> = { art: 0, history: 0, science: 0, nature: 0, other: 0 };
    visits.forEach((v) => {
      typeMap[v.type] += 1;
    });
    return MUSEUM_TYPES.map((t) => ({
      type: t,
      label: MUSEUM_TYPE_LABELS[t],
      count: typeMap[t],
      color: MUSEUM_TYPE_COLORS[t],
    })).filter((d) => d.count > 0);
  }, [visits]);

  const mostVisitedType = useMemo(() => {
    if (typeData.length === 0) return null;
    return typeData.reduce((max, cur) => (cur.count > max.count ? cur : max), typeData[0]);
  }, [typeData]);

  const totalSpending = useMemo(() => visits.reduce((sum, v) => sum + v.ticketPrice, 0), [visits]);
  const avgTicketPrice = totalVisits > 0 ? totalSpending / totalVisits : 0;

  const spendingByTypeData = useMemo(() => {
    const typeMap: Record<MuseumType, number> = { art: 0, history: 0, science: 0, nature: 0, other: 0 };
    visits.forEach((v) => {
      typeMap[v.type] += v.ticketPrice;
    });
    return MUSEUM_TYPES.map((t) => ({
      type: MUSEUM_TYPE_LABELS[t],
      spending: typeMap[t],
      fill: MUSEUM_TYPE_COLORS[t],
    })).filter((d) => d.spending > 0);
  }, [visits]);

  const statCards = [
    { icon: Footprints, value: totalVisits, label: '参观次数' },
    { icon: Globe, value: totalCountries, label: '到访国家' },
    { icon: BookOpen, value: totalExhibitions, label: '展览记录' },
    { icon: GraduationCap, value: totalNotes, label: '学习笔记' },
  ];

  return (
    <div className="min-h-screen bg-ink-900 p-4 md:p-8 space-y-8">
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-gold-gradient bg-clip-text">
        数据统计
      </h1>

      {/* 参观总览 */}
      <section>
        <h2 className="font-serif text-xl text-gold-500 mb-4">参观总览</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="card-shine rounded-xl p-4 md:p-6 border border-white/5 flex flex-col items-center text-center"
            >
              <card.icon className="w-6 h-6 text-gold-500 mb-2" />
              <span className="text-3xl md:text-4xl font-bold text-ink-50">{card.value}</span>
              <span className="text-sm text-ink-300 mt-1">{card.label}</span>
            </div>
          ))}
        </div>
        <div className="card-shine rounded-xl p-4 md:p-6 border border-white/5">
          <h3 className="text-sm text-ink-300 mb-4">年度参观趋势</h3>
          {yearTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={yearTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="year" stroke={CHART_TEXT} fontSize={12} />
                <YAxis stroke={CHART_TEXT} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2a2a40',
                    border: '1px solid #c9a96e40',
                    borderRadius: 8,
                    color: CHART_TEXT,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="参观次数"
                  stroke={GOLD}
                  strokeWidth={2}
                  dot={{ fill: GOLD, r: 4 }}
                  activeDot={{ r: 6, fill: GOLD }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-ink-300 text-sm">
              暂无参观数据
            </div>
          )}
        </div>
      </section>

      {/* 地理覆盖 */}
      <section>
        <h2 className="font-serif text-xl text-gold-500 mb-4">地理覆盖</h2>
        <div className="card-shine rounded-xl p-4 md:p-6 border border-white/5">
          {countryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={Math.max(200, countryData.length * 40)}>
                <BarChart data={countryData} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                  <XAxis type="number" stroke={CHART_TEXT} fontSize={12} />
                  <YAxis type="category" dataKey="country" stroke={CHART_TEXT} fontSize={12} width={50} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#2a2a40',
                      border: '1px solid #c9a96e40',
                      borderRadius: 8,
                      color: CHART_TEXT,
                    }}
                  />
                  <Bar dataKey="count" name="参观次数" radius={[0, 6, 6, 0]} fill={GOLD}>
                    {countryData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={`url(#goldBarGradient)`}
                      />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="goldBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#c9a96e" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#c9a96e" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {countryData.map((d) => (
                  <div key={d.country} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                    <span className="text-sm text-ink-50">{d.country}</span>
                    <span className="text-sm font-semibold text-gold-500">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-ink-300 text-sm">
              暂无地理数据
            </div>
          )}
        </div>
      </section>

      {/* 类型偏好 */}
      <section>
        <h2 className="font-serif text-xl text-gold-500 mb-4">类型偏好</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card-shine rounded-xl p-4 md:p-6 border border-white/5">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeData.map((d) => (
                      <Cell key={d.type} fill={d.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#2a2a40',
                      border: '1px solid #c9a96e40',
                      borderRadius: 8,
                      color: CHART_TEXT,
                    }}
                  />
                  <Legend
                    formatter={(value: string) => <span style={{ color: CHART_TEXT, fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-ink-300 text-sm">
                暂无类型数据
              </div>
            )}
          </div>
          <div className="space-y-3">
            {typeData.map((d) => (
              <div
                key={d.type}
                className={`card-shine rounded-xl p-4 border flex items-center justify-between ${
                  mostVisitedType?.type === d.type ? 'border-gold-500' : 'border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-ink-50">{d.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-ink-50">{d.count}</span>
                  <span className="text-xs text-ink-300">
                    ({totalVisits > 0 ? ((d.count / totalVisits) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
            {mostVisitedType && (
              <div className="card-shine rounded-xl p-4 border border-gold-500 mt-2">
                <span className="text-sm text-ink-300">最常参观类型</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mostVisitedType.color }} />
                  <span className="text-lg font-bold text-gold-500">{mostVisitedType.label}</span>
                  <span className="text-sm text-ink-300">
                    — {totalVisits > 0 ? ((mostVisitedType.count / totalVisits) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 花费统计 */}
      <section>
        <h2 className="font-serif text-xl text-gold-500 mb-4">花费统计</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="card-shine rounded-xl p-4 md:p-6 border border-white/5 flex flex-col items-center text-center">
            <Wallet className="w-6 h-6 text-gold-500 mb-2" />
            <span className="text-2xl md:text-3xl font-bold text-ink-50">
              ¥{totalSpending.toFixed(2)}
            </span>
            <span className="text-sm text-ink-300 mt-1">总花费</span>
          </div>
          <div className="card-shine rounded-xl p-4 md:p-6 border border-white/5 flex flex-col items-center text-center">
            <Receipt className="w-6 h-6 text-gold-500 mb-2" />
            <span className="text-2xl md:text-3xl font-bold text-ink-50">
              ¥{avgTicketPrice.toFixed(2)}
            </span>
            <span className="text-sm text-ink-300 mt-1">平均票价</span>
          </div>
        </div>
        <div className="card-shine rounded-xl p-4 md:p-6 border border-white/5">
          <h3 className="text-sm text-ink-300 mb-4">各类型花费</h3>
          {spendingByTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={spendingByTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="type" stroke={CHART_TEXT} fontSize={12} />
                <YAxis stroke={CHART_TEXT} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2a2a40',
                    border: '1px solid #c9a96e40',
                    borderRadius: 8,
                    color: CHART_TEXT,
                  }}
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, '花费']}
                />
                <Bar dataKey="spending" name="花费" radius={[6, 6, 0, 0]}>
                  {spendingByTypeData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-ink-300 text-sm">
              暂无花费数据
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
