import { useMemo } from "react";
import { useEventStore } from "@/store";
import { formatDate } from "@/utils";
import {
  Users, Package, Play, Trophy, Percent, HeartHandshake,
  Calendar, MapPin, Flag, UsersRound, Award, ClipboardList,
  ChevronRight
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

const CATEGORY_COLORS = ["#00d26a", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function Dashboard() {
  const {
    currentEvent, participants, pickupRecords, timeRecords,
    results, volunteers, categories, bibNumbers,
  } = useEventStore();

  const stats = useMemo(() => {
    const totalParticipants = participants.length;
    const pickedUp = pickupRecords.filter(p => p.picked).length;
    const started = timeRecords.filter(t => t.start_time && !t.dns).length;
    const finished = results.filter(r => r.status === "finished").length;
    const finishRate = totalParticipants > 0 ? Math.round((finished / totalParticipants) * 1000) / 10 : 0;
    const volunteerCount = volunteers.length;
    return { totalParticipants, pickedUp, started, finished, finishRate, volunteerCount };
  }, [participants, pickupRecords, timeRecords, results, volunteers]);

  const trendData = useMemo(() => {
    const dateMap = new Map<string, number>();
    participants.forEach(p => {
      const date = p.registered_at.split(" ")[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });
    const sorted = [...dateMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    let cumulative = 0;
    return sorted.map(([date, count]) => {
      cumulative += count;
      return { date: date.slice(5), 新增: count, 累计: cumulative };
    });
  }, [participants]);

  const categoryData = useMemo(() => {
    return categories.map(cat => ({
      name: cat.name,
      value: participants.filter(p => p.category_id === cat.id).length,
    }));
  }, [categories, participants]);

  const progressData = useMemo(() => {
    const finished = results.filter(r => r.status === "finished").length;
    const dnf = results.filter(r => r.status === "dnf").length;
    const dns = results.filter(r => r.status === "dns").length;
    const started = timeRecords.filter(t => t.start_time && !t.dns).length;
    const onCourse = Math.max(0, started - finished - dnf);
    const notStarted = Math.max(0, participants.length - started - dns);
    return [{
      name: "状态分布", 已完赛: finished, 已出发: onCourse, 未完赛: notStarted, DNF: dnf, DNS: dns
    }];
  }, [results, timeRecords, participants]);

  const recentParticipants = useMemo(() => {
    return [...participants]
      .sort((a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime())
      .slice(0, 5)
      .map(p => {
        const cat = categories.find(c => c.id === p.category_id);
        const bib = bibNumbers.find(b => b.participant_id === p.id);
        const result = results.find(r => r.participant_id === p.id);
        let status = "待出发";
        let statusClass = "badge-gray";
        if (result?.status === "finished") { status = "已完赛"; statusClass = "badge-green"; }
        else if (result?.status === "dnf") { status = "DNF"; statusClass = "badge-orange"; }
        else if (result?.status === "dns") { status = "DNS"; statusClass = "badge-gray"; }
        else if (timeRecords.find(t => t.participant_id === p.id)?.start_time) {
          status = "比赛中"; statusClass = "badge-green";
        }
        return { ...p, catName: cat?.name || "-", bib: bib ? `${bib.prefix}${bib.number}` : "-", status, statusClass };
      });
  }, [participants, categories, bibNumbers, results, timeRecords]);

  const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
    <div className="card-glow flex items-center gap-4">
      <div className={`p-3 rounded-sm ${color}`}>
        <Icon className="w-6 h-6 text-dark-950" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  const QuickAction = ({ icon: Icon, label, color, bg }: { icon: any; label: string; color: string; bg: string }) => (
    <button className={`group relative overflow-hidden p-5 rounded-sm ${bg} border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02]`}>
      <div className={`${color} mb-2`}>
        <Icon className="w-8 h-8" />
      </div>
      <p className={`text-sm font-medium ${color}`}>{label}</p>
      <ChevronRight className={`absolute top-3 right-3 w-4 h-4 ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            {currentEvent?.name || "赛事仪表盘"}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />{formatDate(currentEvent?.date || "")}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />{currentEvent?.location || "-"}
            </span>
            <span className="badge-green">
              {currentEvent?.status === "draft" ? "草稿" :
                currentEvent?.status === "registration" ? "报名中" :
                currentEvent?.status === "ongoing" ? "进行中" : "已结束"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Users} label="总报名人数" value={stats.totalParticipants} color="bg-racing-green" />
        <StatCard icon={Package} label="已领取参赛包" value={stats.pickedUp} color="bg-blue-500" />
        <StatCard icon={Play} label="已出发" value={stats.started} color="bg-amber-500" />
        <StatCard icon={Trophy} label="已完赛" value={stats.finished} color="bg-yellow-500" />
        <StatCard icon={Percent} label="完赛率" value={`${stats.finishRate}%`} color="bg-pink-500" />
        <StatCard icon={HeartHandshake} label="志愿者人数" value={stats.volunteerCount} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glow">
          <h2 className="section-title">
            <Flag className="w-5 h-5 text-racing-green" />报名趋势
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 4 }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="新增" stroke="#00d26a" strokeWidth={2} dot={{ fill: "#00d26a", r: 3 }} />
                <Line type="monotone" dataKey="累计" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glow">
          <h2 className="section-title">
            <UsersRound className="w-5 h-5 text-racing-green" />组别分布
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: "#555" }}
                >
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 4 }}
                  labelStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-glow">
        <h2 className="section-title">
          <Trophy className="w-5 h-5 text-racing-green" />实时进度
        </h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
              <XAxis type="number" stroke="#888" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#888" fontSize={11} width={80} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 4 }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="已完赛" stackId="a" fill="#00d26a" />
              <Bar dataKey="已出发" stackId="a" fill="#3b82f6" />
              <Bar dataKey="未完赛" stackId="a" fill="#6b7280" />
              <Bar dataKey="DNF" stackId="a" fill="#ff6b35" />
              <Bar dataKey="DNS" stackId="a" fill="#374151" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="section-title">
          <Award className="w-5 h-5 text-racing-green" />快捷操作
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <QuickAction icon={Users} label="参赛者管理" color="text-racing-green" bg="bg-racing-green/10" />
          <QuickAction icon={Package} label="参赛包领取" color="text-blue-400" bg="bg-blue-500/10" />
          <QuickAction icon={Play} label="计时管理" color="text-amber-400" bg="bg-amber-500/10" />
          <QuickAction icon={Trophy} label="成绩排行" color="text-yellow-400" bg="bg-yellow-500/10" />
          <QuickAction icon={Award} label="奖项管理" color="text-pink-400" bg="bg-pink-500/10" />
          <QuickAction icon={ClipboardList} label="赛事问卷" color="text-purple-400" bg="bg-purple-500/10" />
        </div>
      </div>

      <div className="card-glow">
        <h2 className="section-title">
          <Users className="w-5 h-5 text-racing-green" />最近报名
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">姓名</th>
                <th className="table-header">组别</th>
                <th className="table-header">号码布</th>
                <th className="table-header">状态</th>
              </tr>
            </thead>
            <tbody>
              {recentParticipants.map(p => (
                <tr key={p.id} className="hover:bg-dark-750/50 transition-colors">
                  <td className="table-cell font-medium text-white">{p.name}</td>
                  <td className="table-cell">{p.catName}</td>
                  <td className="table-cell font-mono text-racing-green">{p.bib}</td>
                  <td className="table-cell">
                    <span className={p.statusClass}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
