import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Ship,
  MapPin,
  Clock,
  Check,
  AlertTriangle,
  Package,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppStore } from '../../store';
import {
  formatDate,
  formatDateTime,
  getPlanStatus,
  getSupplyCategory,
  getSeverityLevel,
  generateId,
} from '../../utils';

import VoyageMap from '../../components/Map/VoyageMap';
import type { GpsPoint, Waypoint, SupplyItem, RiskAssessment } from '../../types';

function generateGpsTrackFromWaypoints(waypoints: Waypoint[], planId: string): GpsPoint[] {
  if (waypoints.length < 2) return [];

  const track: GpsPoint[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    const points = 20;

    for (let j = 0; j <= points; j++) {
      const ratio = j / points;
      const lat = start.latitude + (end.latitude - start.latitude) * ratio;
      const lng = start.longitude + (end.longitude - start.longitude) * ratio;

      track.push({
        id: `gps-${planId}-${track.length}`,
        voyageId: planId,
        latitude: lat,
        longitude: lng,
        speed: 5 + Math.random() * 3,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return track;
}

function RiskMatrix({ risks }: { risks: RiskAssessment[] }) {
  const severityLevels = ['critical', 'high', 'medium', 'low'];
  const probabilityLevels = ['high', 'medium', 'low'];

  const severityColors: Record<string, { bg: string; text: string; label: string }> = {
    low: { bg: 'bg-green-500', text: 'text-green-700', label: '低' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-700', label: '中' },
    high: { bg: 'bg-orange-500', text: 'text-orange-700', label: '高' },
    critical: { bg: 'bg-red-500', text: 'text-red-700', label: '严重' },
  };

  const getRiskCellColor = (severity: string, probability: string) => {
    const sevIndex = severityLevels.indexOf(severity);
    const probIndex = probabilityLevels.indexOf(probability);

    if (sevIndex <= 1 && probIndex <= 1) return 'bg-red-100 border-red-300';
    if ((sevIndex <= 2 && probIndex <= 1) || (sevIndex <= 1 && probIndex <= 2))
      return 'bg-orange-100 border-orange-300';
    if (sevIndex === 3 && probIndex === 2) return 'bg-green-100 border-green-300';
    return 'bg-yellow-100 border-yellow-300';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-sm text-gray-600 w-20"></th>
            {probabilityLevels.map((prob) => (
              <th
                key={prob}
                className="p-2 text-center text-sm font-medium text-gray-700 border border-ocean-200 bg-ocean-50"
              >
                {prob === 'high' ? '高概率' : prob === 'medium' ? '中概率' : '低概率'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {severityLevels.map((sev) => (
            <tr key={sev}>
              <td className="p-2 text-sm font-medium text-gray-700 bg-ocean-50 border border-ocean-200">
                <div className="flex items-center gap-1">
                  <span
                    className={`w-3 h-3 rounded-full ${severityColors[sev].bg}`}
                  ></span>
                  {sev === 'critical' ? '严重' : sev === 'high' ? '高' : sev === 'medium' ? '中' : '低'}
                </div>
              </td>
              {probabilityLevels.map((prob) => {
                const cellRisks = risks.filter(
                  (r) => r.severity === sev && r.probability === prob
                );
                return (
                  <td
                    key={prob}
                    className={`p-2 border min-h-20 ${getRiskCellColor(sev, prob)}`}
                  >
                    <div className="space-y-1">
                      {cellRisks.map((risk) => (
                        <div
                          key={risk.id}
                          className="bg-white rounded-lg p-2 text-xs shadow-sm"
                        >
                          <p className="font-medium text-gray-800">{risk.description}</p>
                          {risk.mitigation && (
                            <p className="text-gray-500 mt-1 text-xs">
                              缓解: {risk.mitigation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getPlanById = useAppStore((state) => state.getPlanById);
  const getBoatById = useAppStore((state) => state.getBoatById);
  const updatePlan = useAppStore((state) => state.updatePlan);
  const plan = id ? getPlanById(id) : undefined;

  const boat = plan ? getBoatById(plan.boatId) : undefined;
  const status = plan ? getPlanStatus(plan.status) : null;

  const gpsPoints = useMemo(() => {
    if (!plan) return [];
    return generateGpsTrackFromWaypoints(plan.waypoints, plan.id);
  }, [plan]);

  const supplyProgress = useMemo(() => {
    if (!plan) return 0;
    const total = plan.supplyItems.length;
    if (total === 0) return 0;
    const purchased = plan.supplyItems.filter((s) => s.purchased).length;
    return Math.round((purchased / total) * 100);
  }, [plan]);

  const groupedSupplies = useMemo(() => {
    if (!plan) return {} as Record<string, SupplyItem[]>;
    return plan.supplyItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, SupplyItem[]>);
  }, [plan]);

  const toggleSupplyPurchased = (itemId: string) => {
    if (!plan) return;
    const updatedItems = plan.supplyItems.map((item) =>
      item.id === itemId ? { ...item, purchased: !item.purchased } : item
    );
    updatePlan(plan.id, { supplyItems: updatedItems });
  };

  const moveWaypoint = (index: number, direction: 'up' | 'down') => {
    if (!plan) return;
    const newWaypoints = [...plan.waypoints];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newWaypoints.length) return;

    [newWaypoints[index], newWaypoints[targetIndex]] = [
      newWaypoints[targetIndex],
      newWaypoints[index],
    ];

    newWaypoints.forEach((wp, i) => {
      wp.order = i;
    });

    updatePlan(plan.id, { waypoints: newWaypoints });
  };

  if (!plan || !status) {
    return (
      <div className="card p-12 text-center">
        <h3 className="font-display text-xl font-bold text-ocean-800 mb-2">
          计划不存在
        </h3>
        <p className="text-gray-600 mb-6">请检查链接是否正确</p>
        <button
          className="btn-primary inline-flex items-center gap-2"
          onClick={() => navigate('/plans')}
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center gap-2 text-ocean-600 hover:text-ocean-700 font-medium"
          onClick={() => navigate('/plans')}
        >
          <ArrowLeft className="w-5 h-5" />
          返回计划列表
        </button>
        <button
          className="btn-secondary flex items-center gap-2"
          onClick={() => navigate(`/plans/${plan.id}/edit`)}
        >
          <Edit className="w-4 h-4" />
          编辑计划
        </button>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl font-bold text-ocean-800">
                {plan.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
              >
                {status.label}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ocean-500" />
                {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
              </span>
              {boat && (
                <span className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-ocean-500" />
                  {boat.name} ({boat.type})
                </span>
              )}
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-ocean-500" />
                {plan.waypoints.length} 个途经点
              </span>
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-ocean-500" />
                {plan.supplyItems.length} 项补给
              </span>
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-ocean-500" />
                {plan.riskAssessments.length} 项风险
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="section-title flex items-center gap-2">
          <MapPin className="w-6 h-6 text-ocean-600" />
          路线规划
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-4">
              <VoyageMap
                gpsPoints={gpsPoints}
                height="400px"
                showMarkers={true}
              />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="card p-4">
              <h3 className="font-display text-lg font-bold text-ocean-800 mb-4">
                途经点时间线
              </h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-ocean-200"></div>
                <div className="space-y-4">
                  {plan.waypoints
                    .sort((a, b) => a.order - b.order)
                    .map((wp, index) => (
                      <div key={wp.id} className="relative pl-12">
                        <div
                          className={`absolute left-1 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0
                              ? 'bg-green-500'
                              : index === plan.waypoints.length - 1
                              ? 'bg-nautical-500'
                              : 'bg-ocean-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="bg-ocean-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-ocean-800">
                              {wp.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <button
                                className="p-1 hover:bg-ocean-200 rounded transition-colors disabled:opacity-30"
                                onClick={() => moveWaypoint(index, 'up')}
                                disabled={index === 0}
                              >
                                <ChevronUp className="w-4 h-4 text-ocean-600" />
                              </button>
                              <button
                                className="p-1 hover:bg-ocean-200 rounded transition-colors disabled:opacity-30"
                                onClick={() => moveWaypoint(index, 'down')}
                                disabled={index === plan.waypoints.length - 1}
                              >
                                <ChevronDown className="w-4 h-4 text-ocean-600" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {wp.latitude.toFixed(4)}, {wp.longitude.toFixed(4)}
                          </p>
                          {wp.eta && (
                            <p className="text-xs text-ocean-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              预计到达: {formatDateTime(wp.eta)}
                            </p>
                          )}
                          {wp.notes && (
                            <p className="text-xs text-gray-600 mt-2">{wp.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2 mb-0">
            <Package className="w-6 h-6 text-ocean-600" />
            补给清单
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-48 h-3 bg-ocean-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${supplyProgress}%`,
                  background:
                    'linear-gradient(90deg, #0B3D91 0%, #FF6B35 100%)',
                }}
              />
            </div>
            <span className="text-sm font-medium text-ocean-700">
              {supplyProgress}% 已采购
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groupedSupplies).map(([category, items]) => {
            const catInfo = getSupplyCategory(category);
            const categoryPurchased = items.filter((i) => i.purchased).length;
            const categoryProgress =
              items.length > 0
                ? Math.round((categoryPurchased / items.length) * 100)
                : 0;

            return (
              <div key={category} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${catInfo.color}`}
                  >
                    {catInfo.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {categoryPurchased}/{items.length}
                  </span>
                </div>
                <div className="h-1.5 bg-ocean-100 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${categoryProgress}%`,
                      backgroundColor: categoryProgress === 100 ? '#22c55e' : '#0B3D91',
                    }}
                  />
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        item.purchased ? 'bg-green-50' : 'hover:bg-ocean-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.purchased || false}
                        onChange={() => toggleSupplyPurchased(item.id)}
                        className="w-5 h-5 rounded border-ocean-300 text-ocean-600 focus:ring-ocean-500"
                      />
                      <span
                        className={`flex-1 ${
                          item.purchased
                            ? 'line-through text-gray-400'
                            : 'text-gray-700'
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="section-title flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-ocean-600" />
          风险评估
        </h2>
        <div className="card p-6">
          <RiskMatrix risks={plan.riskAssessments} />

          <div className="mt-6">
            <h3 className="font-display text-lg font-bold text-ocean-800 mb-4">
              风险详情
            </h3>
            <div className="space-y-3">
              {plan.riskAssessments.map((risk) => {
                const severity = getSeverityLevel(risk.severity);
                return (
                  <div
                    key={risk.id}
                    className="flex items-start gap-4 p-4 bg-ocean-50 rounded-lg"
                  >
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${severity.color}`}
                    >
                      {severity.label}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-ocean-800 mb-1">
                        {risk.description}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        概率:{' '}
                        {risk.probability === 'high'
                          ? '高'
                          : risk.probability === 'medium'
                          ? '中'
                          : '低'}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">缓解措施:</span>{' '}
                        {risk.mitigation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
