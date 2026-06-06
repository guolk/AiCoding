import { Link } from 'react-router-dom';
import {
  Anchor,
  Ship,
  MapPin,
  CloudSun,
  TrendingUp,
  Clock,
  Navigation,
  AlertTriangle,
  ChevronRight,
  Plus,
  Calendar,
  Waves,
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  formatDistance,
  formatDuration,
  formatSpeed,
  formatDate,
  getCertificateStatus,
  getPlanStatus,
} from '../utils';
import type { Certificate, Voyage, VoyagePlan } from '../types';

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  gradient,
}: {
  icon: any;
  title: string;
  value: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <div className={`stat-card ${gradient} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1 font-display">{value}</p>
          <p className="text-white/70 text-xs mt-1">{subtitle}</p>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function RecentVoyageCard({ voyage, boatName }: { voyage: Voyage; boatName?: string }) {
  return (
    <Link
      to={`/voyages/${voyage.id}`}
      className="block p-4 bg-white rounded-xl border border-ocean-100 hover:border-ocean-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-ocean-800 group-hover:text-ocean-600 transition-colors">
            {voyage.startPoint} → {voyage.destination}
          </p>
          <p className="text-sm text-gray-500">{formatDate(voyage.departureTime)}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-ocean-500 transition-colors" />
      </div>
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Navigation className="w-4 h-4 text-ocean-500" />
          {formatDistance(voyage.distance)}
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Clock className="w-4 h-4 text-ocean-500" />
          {formatDuration(voyage.duration)}
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Ship className="w-4 h-4 text-ocean-500" />
          {boatName}
        </div>
      </div>
    </Link>
  );
}

function UpcomingPlanCard({ plan, boatName }: { plan: VoyagePlan; boatName?: string }) {
  const status = getPlanStatus(plan.status);
  return (
    <Link
      to={`/plans/${plan.id}`}
      className="block p-4 bg-white rounded-xl border border-ocean-100 hover:border-nautical-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-ocean-800 group-hover:text-nautical-600 transition-colors">
              {plan.title}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-nautical-500 transition-colors" />
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4 text-nautical-500" />
        <span>{plan.waypoints.length} 个途经点</span>
        <span className="text-gray-300">|</span>
        <Ship className="w-4 h-4 text-nautical-500" />
        <span>{boatName}</span>
      </div>
    </Link>
  );
}

function CertificateAlert({ cert, boatName }: { cert: Certificate; boatName?: string }) {
  const status = getCertificateStatus(cert.expiryDate);
  return (
    <div className="flex items-center gap-3 p-3 bg-nautical-50 border border-nautical-200 rounded-lg">
      <div className={`w-10 h-10 rounded-lg ${status.color} flex items-center justify-center flex-shrink-0`}>
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ocean-800 truncate">{cert.name}</p>
        <p className="text-sm text-gray-500">
          {boatName} · {formatDate(cert.expiryDate)}到期
        </p>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${status.color} font-medium`}>
        {status.label}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const voyages = useAppStore((state) => state.voyages);
  const boats = useAppStore((state) => state.boats);
  const plans = useAppStore((state) => state.voyagePlans);
  const certificates = useAppStore((state) => state.certificates);

  const totalVoyages = voyages.length;
  const totalDistance = voyages.reduce((sum, v) => sum + v.distance, 0);
  const totalHours = voyages.reduce((sum, v) => sum + v.duration, 0);
  const avgSpeed = totalHours > 0 ? totalDistance / totalHours : 0;
  const boatsCount = boats.length;
  const activePlans = plans.filter((p) => p.status === 'planned' || p.status === 'in-progress').length;

  const statistics = {
    totalVoyages,
    totalDistance,
    totalHours,
    avgSpeed,
    boatsCount,
    activePlans,
  };

  const getBoatName = (boatId: string) => boats.find((b) => b.id === boatId)?.name;

  const now = new Date();
  const cutoff = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const expiringCerts = certificates
    .filter((c) => {
      const expiry = new Date(c.expiryDate);
      return expiry >= now && expiry <= cutoff;
    })
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const recentVoyages = voyages.slice(0, 3);
  const upcomingPlans = plans.filter(
    (p) => p.status === 'planned' || p.status === 'in-progress'
  ).slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ocean-900">欢迎回来，船长！</h1>
          <p className="text-gray-600 mt-1">今天是{formatDate(new Date(), 'yyyy年MM月dd日 EEEE')}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/voyages/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            记录航行
          </Link>
          <Link to="/plans/new" className="btn-accent flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            创建计划
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Anchor}
          title="总航行次数"
          value={statistics.totalVoyages.toString()}
          subtitle="次出海航行"
          gradient="from-ocean-500 to-ocean-700"
        />
        <StatCard
          icon={Navigation}
          title="总航程"
          value={formatDistance(statistics.totalDistance)}
          subtitle={`平均航速 ${formatSpeed(statistics.avgSpeed)}`}
          gradient="from-ocean-400 to-ocean-600"
        />
        <StatCard
          icon={Clock}
          title="总航行时间"
          value={formatDuration(statistics.totalHours)}
          subtitle="小时在海上"
          gradient="from-nautical-400 to-nautical-600"
        />
        <StatCard
          icon={Ship}
          title="管理船艇"
          value={statistics.boatsCount.toString()}
          subtitle={`${statistics.activePlans} 个进行中计划`}
          gradient="from-ocean-600 to-ocean-800"
        />
      </div>

      {expiringCerts.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-nautical-500" />
            <h2 className="section-title !mb-0">即将到期的证书</h2>
          </div>
          <div className="space-y-3">
            {expiringCerts.map((cert) => (
              <CertificateAlert key={cert.id} cert={cert} boatName={getBoatName(cert.boatId)} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Anchor className="w-5 h-5 text-ocean-500" />
              <h2 className="section-title !mb-0">最近航行</h2>
            </div>
            <Link to="/voyages" className="text-ocean-600 hover:text-ocean-700 text-sm font-medium flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentVoyages.length > 0 ? (
              recentVoyages.map((voyage) => (
                <RecentVoyageCard key={voyage.id} voyage={voyage} boatName={getBoatName(voyage.boatId)} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Anchor className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>还没有航行记录</p>
                <Link to="/voyages/new" className="text-ocean-600 hover:underline mt-2 inline-block">
                  记录第一次航行
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-nautical-500" />
              <h2 className="section-title !mb-0">即将出发</h2>
            </div>
            <Link to="/plans" className="text-ocean-600 hover:text-ocean-700 text-sm font-medium flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingPlans.length > 0 ? (
              upcomingPlans.map((plan) => (
                <UpcomingPlanCard key={plan.id} plan={plan} boatName={getBoatName(plan.boatId)} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>还没有航行计划</p>
                <Link to="/plans/new" className="text-ocean-600 hover:underline mt-2 inline-block">
                  创建第一个计划
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/voyages"
          className="group p-6 bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-2xl text-white hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Anchor className="w-7 h-7" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">航行日志</h3>
          <p className="text-white/80 text-sm">记录每次出海的完整经历，包括GPS轨迹和特殊事件</p>
        </Link>

        <Link
          to="/weather"
          className="group p-6 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-2xl text-white hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CloudSun className="w-7 h-7" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">气象分析</h3>
          <p className="text-white/80 text-sm">查阅天气预报，对比实际天气，掌握季节性规律</p>
        </Link>

        <Link
          to="/boats"
          className="group p-6 bg-gradient-to-br from-nautical-400 to-nautical-600 rounded-2xl text-white hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Ship className="w-7 h-7" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">船艇管理</h3>
          <p className="text-white/80 text-sm">管理船艇档案、设备维护记录，追踪证书到期</p>
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-ocean-500" />
          <h2 className="section-title !mb-0">航行数据概览</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-ocean-50 rounded-xl">
            <Waves className="w-8 h-8 text-ocean-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-ocean-800 font-display">
              {voyages.length > 0 ? Math.max(...voyages.map((v) => v.windSpeed)) : 0}
            </p>
            <p className="text-sm text-gray-600">最大风速(节)</p>
          </div>
          <div className="text-center p-4 bg-ocean-50 rounded-xl">
            <Navigation className="w-8 h-8 text-ocean-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-ocean-800 font-display">
              {voyages.length > 0 ? Math.max(...voyages.map((v) => v.distance)) : 0}
            </p>
            <p className="text-sm text-gray-600">单次最远(海里)</p>
          </div>
          <div className="text-center p-4 bg-ocean-50 rounded-xl">
            <Clock className="w-8 h-8 text-ocean-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-ocean-800 font-display">
              {voyages.length > 0 ? Math.max(...voyages.map((v) => v.duration)).toFixed(0) : 0}
            </p>
            <p className="text-sm text-gray-600">单次最长(小时)</p>
          </div>
          <div className="text-center p-4 bg-ocean-50 rounded-xl">
            <Calendar className="w-8 h-8 text-ocean-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-ocean-800 font-display">
              {voyages.length > 0 ? Math.ceil(statistics.totalHours / 24) : 0}
            </p>
            <p className="text-sm text-gray-600">总航行天数</p>
          </div>
        </div>
      </div>
    </div>
  );
}
