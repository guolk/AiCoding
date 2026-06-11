import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, TrendingUp } from 'lucide-react';
import { useFireStore } from '@/store/useFireStore';
import { hazardStatusMap } from '@/utils/constants';

const COLORS = { A: '#C41E3A', B: '#FF6B35', pending: '#FF6B35', in_progress: '#3498DB', completed: '#2ECC71', overdue: '#E74C3C' };

export default function HazardStatistics() {
  const { hazards } = useFireStore();

  const totalA = hazards.filter((h) => h.level === 'A').length;
  const totalB = hazards.filter((h) => h.level === 'B').length;
  const completedCount = hazards.filter((h) => h.status === 'completed').length;
  const completionRate = hazards.length > 0 ? Math.round((completedCount / hazards.length) * 100) : 0;

  const locationData = useMemo(() => {
    const map: Record<string, number> = {};
    hazards.forEach((h) => { map[h.location] = (map[h.location] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [hazards]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = { pending: 0, in_progress: 0, completed: 0, overdue: 0 };
    hazards.forEach((h) => { map[h.status]++; });
    return Object.entries(map).map(([key, value]) => ({ name: hazardStatusMap[key].label, value, color: COLORS[key as keyof typeof COLORS] }));
  }, [hazards]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.getMonth() + 1}月`;
      months.push({ key, label });
    }
    const countMap: Record<string, { A: number; B: number }> = {};
    months.forEach((m) => { countMap[m.key] = { A: 0, B: 0 }; });
    hazards.forEach((h) => {
      const ym = h.discoveryDate.slice(0, 7);
      if (countMap[ym]) { countMap[ym][h.level]++; }
    });
    return months.map((m) => ({ name: m.label, A类: countMap[m.key].A, B类: countMap[m.key].B }));
  }, [hazards]);

  const stats = [
    { label: '隐患总数', value: hazards.length, icon: <ShieldAlert size={20} />, color: 'text-[#C41E3A]', bg: 'bg-red-50' },
    { label: 'A类隐患', value: totalA, icon: <AlertTriangle size={20} />, color: 'text-[#C41E3A]', bg: 'bg-red-50' },
    { label: 'B类隐患', value: totalB, icon: <Info size={20} />, color: 'text-[#FF6B35]', bg: 'bg-orange-50' },
    { label: '已整改', value: completedCount, icon: <CheckCircle2 size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '整改率', value: `${completionRate}%`, icon: <TrendingUp size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div>
      <h1 className="font-serif-title text-2xl font-bold text-gray-900 mb-6">隐患统计分析</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl shadow-sm bg-white p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-xl shadow-sm bg-white p-5">
          <h3 className="font-serif-title text-base font-bold text-gray-800 mb-4">各区域隐患数量</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="隐患数量" fill="#C41E3A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl shadow-sm bg-white p-5">
          <h3 className="font-serif-title text-base font-bold text-gray-800 mb-4">隐患状态分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl shadow-sm bg-white p-5">
        <h3 className="font-serif-title text-base font-bold text-gray-800 mb-4">近6个月隐患趋势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="A类" stroke={COLORS.A} strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="B类" stroke={COLORS.B} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
