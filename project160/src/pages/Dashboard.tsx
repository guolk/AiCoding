import { useMemo } from 'react';
import { useFireStore } from '@/store/useFireStore';
import {
  Flame, Building2, ShieldAlert, CheckCircle2, AlertTriangle,
  Clock, GraduationCap, TrendingUp, ArrowRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';

const PIE_COLORS: Record<string, string> = {
  normal: '#2ECC71',
  abnormal: '#E74C3C',
  expired: '#FF6B35',
  inspecting: '#3498DB',
};

const STATUS_LABELS: Record<string, string> = {
  normal: '正常',
  abnormal: '异常',
  expired: '过期',
  inspecting: '检测中',
};

export default function Dashboard() {
  const { facilities, hazards, trainingRecords } = useFireStore();

  const stats = useMemo(() => {
    const total = facilities.length;
    const normalCount = facilities.filter((f) => f.status === 'normal').length;
    const normalRate = total > 0 ? Math.round((normalCount / total) * 100) : 0;

    const activeHazards = hazards.filter((h) => h.status !== 'completed').length;
    const completedHazards = hazards.filter((h) => h.status === 'completed').length;
    const hazardRate = hazards.length > 0 ? Math.round((completedHazards / hazards.length) * 100) : 0;

    return { total, normalRate, activeHazards, hazardRate };
  }, [facilities, hazards]);

  const hazardTrend = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.getMonth() + 1}月`;
      months.push({ key, label });
    }
    return months.map(({ key, label }) => {
      const discovered = hazards.filter((h) => h.discoveryDate.startsWith(key)).length;
      const rectified = hazards.filter(
        (h) => h.status === 'completed' && h.completionDate.startsWith(key),
      ).length;
      return { name: label, 发现: discovered, 已整改: rectified };
    });
  }, [hazards]);

  const facilityPie = useMemo(() => {
    const counts: Record<string, number> = { normal: 0, abnormal: 0, expired: 0, inspecting: 0 };
    facilities.forEach((f) => { counts[f.status] = (counts[f.status] || 0) + 1; });
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_LABELS[status] || status, value, status,
    }));
  }, [facilities]);

  const alerts = useMemo(() => {
    const items: { id: string; type: string; text: string; to: string; borderColor: string; icon: React.ReactNode }[] = [];

    hazards
      .filter((h) => h.status === 'overdue')
      .forEach((h) => {
        items.push({
          id: h.id, type: 'overdue',
          text: `【超期】${h.description} - 责任人: ${h.responsiblePerson}`,
          to: `/hazards`, borderColor: 'border-l-red-500',
          icon: <AlertTriangle size={16} className="text-red-500 shrink-0" />,
        });
      });

    hazards
      .filter((h) => h.status === 'in_progress')
      .forEach((h) => {
        items.push({
          id: h.id, type: 'in_progress',
          text: `【整改中】${h.description} - 截止: ${h.deadline}`,
          to: `/hazards`, borderColor: 'border-l-orange-400',
          icon: <Clock size={16} className="text-orange-400 shrink-0" />,
        });
      });

    trainingRecords
      .filter((t) => t.status === 'scheduled')
      .forEach((t) => {
        items.push({
          id: t.id, type: 'training',
          text: `【待培训】${t.title} - ${t.date}`,
          to: `/training`, borderColor: 'border-l-blue-500',
          icon: <GraduationCap size={16} className="text-blue-500 shrink-0" />,
        });
      });

    facilities
      .filter((f) => f.status === 'expired')
      .forEach((f) => {
        items.push({
          id: f.id, type: 'expired',
          text: `【过期】${f.name} - 位置: ${f.location}`,
          to: `/facilities`, borderColor: 'border-l-orange-400',
          icon: <AlertTriangle size={16} className="text-orange-400 shrink-0" />,
        });
      });

    return items.slice(0, 8);
  }, [hazards, trainingRecords, facilities]);

  const statCards = [
    { value: stats.total, label: '设施总数', from: '#C41E3A', to: '#E8384F', icon: <Building2 size={28} /> },
    { value: `${stats.normalRate}%`, label: '设施正常率', from: '#059669', to: '#10B981', icon: <CheckCircle2 size={28} /> },
    { value: stats.activeHazards, label: '待处理隐患', from: '#FF6B35', to: '#F59E0B', icon: <ShieldAlert size={28} /> },
    { value: `${stats.hazardRate}%`, label: '隐患整改率', from: '#2563EB', to: '#3B82F6', icon: <TrendingUp size={28} /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-serif-title text-2xl font-bold flex items-center gap-2">
        <Flame className="text-[#C41E3A]" size={28} />
        消防安全态势总览
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl shadow-sm p-5 text-white"
            style={{ background: `linear-gradient(135deg, ${card.from}, ${card.to})` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-sm opacity-90 mt-1">{card.label}</p>
              </div>
              <div className="opacity-80">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">隐患趋势（近6个月）</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={hazardTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="发现" stroke="#C41E3A" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="已整改" stroke="#2ECC71" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">设施状态分布</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={facilityPie}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {facilityPie.map((entry) => (
                  <Cell key={entry.status} fill={PIE_COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-800">
                {facilities.length}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">待办提醒</h2>
          <Link to="/hazards" className="text-[#C41E3A] text-sm flex items-center gap-1 hover:underline">
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>
        {alerts.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">暂无待办事项</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <Link
                key={alert.id}
                to={alert.to}
                className={`flex items-center gap-3 border-l-4 ${alert.borderColor} bg-gray-50 rounded-r-lg px-4 py-3 hover:bg-gray-100 transition-colors`}
              >
                {alert.icon}
                <span className="text-sm text-gray-700 truncate">{alert.text}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
