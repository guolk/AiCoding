import { useState, useRef, useMemo } from "react";
import { useEventStore } from "@/store";
import { formatTime } from "@/utils";
import type { RoutePoint } from "@/types";
import {
  MapPin, Flag, Droplets, Clock, Trophy, Plus,
  Edit2, Trash2, Save, X, Navigation
} from "lucide-react";

const POINT_CONFIG = {
  start: { label: "起点", color: "#00d26a", bg: "bg-racing-green/10", border: "border-racing-green/50", icon: Flag },
  aid: { label: "补给站", color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/50", icon: Droplets },
  cutoff: { label: "关门点", color: "#ff6b35", bg: "bg-racing-orange/10", border: "border-racing-orange/50", icon: Clock },
  finish: { label: "终点", color: "#fbbf24", bg: "bg-yellow-500/10", border: "border-yellow-500/50", icon: Trophy },
};

export default function EventRoute() {
  const { routePoints, addRoutePoint, updateRoutePoint, deleteRoutePoint } = useEventStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editingPoint, setEditingPoint] = useState<RoutePoint | null>(null);
  const [editForm, setEditForm] = useState({ name: "", cut_off_time: "", distance_km: 0 });
  const [selectedType, setSelectedType] = useState<RoutePoint["type"]>("aid");

  const pointsByType = useMemo(() => {
    const grouped: Record<string, RoutePoint[]> = {
      start: [], aid: [], cutoff: [], finish: [],
    };
    routePoints.forEach(p => {
      if (grouped[p.type]) grouped[p.type].push(p);
    });
    return grouped;
  }, [routePoints]);

  const sortedPoints = useMemo(() => {
    return [...routePoints].sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  }, [routePoints]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current || draggingId) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    addRoutePoint({
      type: selectedType,
      name: `${POINT_CONFIG[selectedType].label}${pointsByType[selectedType].length + 1}`,
      position_x: x,
      position_y: y,
      cut_off_time: selectedType === "cutoff" || selectedType === "finish" || selectedType === "aid"
        ? "2026-10-18 12:00:00" : undefined,
      distance_km: 0,
    });
  };

  const handlePointMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(600, Math.round(e.clientX - rect.left)));
    const y = Math.max(0, Math.min(500, Math.round(e.clientY - rect.top)));
    updateRoutePoint(draggingId, { position_x: x, position_y: y });
  };

  const handleMouseUp = () => setDraggingId(null);

  const openEditModal = (point: RoutePoint) => {
    setEditingPoint(point);
    setEditForm({
      name: point.name,
      cut_off_time: point.cut_off_time ? point.cut_off_time.split(" ")[1] || "" : "",
      distance_km: point.distance_km || 0,
    });
  };

  const handleSaveEdit = () => {
    if (!editingPoint) return;
    const data: Partial<RoutePoint> = {
      name: editForm.name,
      distance_km: editForm.distance_km,
    };
    if (editForm.cut_off_time && editingPoint.type !== "start") {
      data.cut_off_time = `2026-10-18 ${editForm.cut_off_time}:00`;
    }
    updateRoutePoint(editingPoint.id, data);
    setEditingPoint(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定删除该路线点吗？")) deleteRoutePoint(id);
  };

  const getLinePath = () => {
    if (sortedPoints.length < 2) return "";
    return sortedPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.position_x} ${p.position_y}`)
      .join(" ");
  };

  const PointListSection = ({
    type, points,
  }: { type: RoutePoint["type"]; points: RoutePoint[] }) => {
    const cfg = POINT_CONFIG[type];
    const Icon = cfg.icon;
    return (
      <div className="mb-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-sm ${cfg.bg} border ${cfg.border} mb-2`}>
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
          <span className="text-sm font-medium" style={{ color: cfg.color }}>
            {cfg.label} ({points.length})
          </span>
        </div>
        <div className="space-y-1.5">
          {points.length === 0 ? (
            <p className="text-xs text-gray-500 px-3">暂无{cfg.label}</p>
          ) : (
            points.map(p => (
              <div
                key={p.id}
                className="group flex items-start gap-2 p-2.5 rounded-sm bg-dark-750 hover:bg-dark-700 border border-transparent hover:border-dark-600 transition-all"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: cfg.color, boxShadow: `0 0 8px ${cfg.color}50` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{p.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />{p.distance_km || 0}km
                    </span>
                    {p.cut_off_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{formatTime(p.cut_off_time)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1 text-gray-400 hover:text-racing-green transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1 text-gray-400 hover:text-racing-orange transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">路线规划</h1>
          <p className="text-sm text-gray-400">拖拽点调整位置，点击地图添加新点</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 mr-1">点击添加类型：</span>
          {(Object.keys(POINT_CONFIG) as RoutePoint["type"][]).map(type => {
            const cfg = POINT_CONFIG[type];
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium border transition-all ${
                  selectedType === type
                    ? `${cfg.bg} ${cfg.border}`
                    : "bg-dark-750 border-dark-600 text-gray-400 hover:text-white"
                }`}
                style={selectedType === type ? { color: cfg.color } : {}}
              >
                <Icon className="w-3.5 h-3.5" />{cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card-glow max-h-[600px] overflow-y-auto">
            <h2 className="section-title">
              <MapPin className="w-5 h-5 text-racing-green" />路线点列表
            </h2>
            <PointListSection type="start" points={pointsByType.start} />
            <PointListSection type="aid" points={pointsByType.aid} />
            <PointListSection type="cutoff" points={pointsByType.cutoff} />
            <PointListSection type="finish" points={pointsByType.finish} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card-glow">
            <h2 className="section-title">
              <Navigation className="w-5 h-5 text-racing-green" />路线地图
              <span className="text-xs text-gray-500 ml-2">(点击空白处添加点，拖拽移动点)</span>
            </h2>
            <div
              ref={mapRef}
              className="grid-bg relative w-full rounded-sm border border-dark-600 cursor-crosshair overflow-hidden"
              style={{ height: 500, maxWidth: 600 }}
              onClick={handleMapClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d={getLinePath()}
                  fill="none"
                  stroke="#00d26a"
                  strokeWidth={2.5}
                  strokeDasharray="6,4"
                  opacity={0.7}
                  style={{ filter: "drop-shadow(0 0 6px rgba(0,210,106,0.5))" }}
                />
              </svg>

              {sortedPoints.map((p, idx) => {
                const cfg = POINT_CONFIG[p.type];
                return (
                  <div
                    key={p.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move group"
                    style={{ left: p.position_x, top: p.position_y, zIndex: 10 }}
                    onMouseDown={(e) => handlePointMouseDown(e, p.id)}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={() => openEditModal(p)}
                  >
                    <div
                      className="relative w-7 h-7 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-125"
                      style={{
                        backgroundColor: cfg.color,
                        borderColor: "#fff",
                        boxShadow: `0 0 12px ${cfg.color}80, 0 0 24px ${cfg.color}40`,
                      }}
                    >
                      <span className="text-[10px] font-bold text-dark-950">{idx + 1}</span>
                    </div>
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap px-2 py-1 text-[10px] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ backgroundColor: "#1a1a1a", color: cfg.color, border: `1px solid ${cfg.color}40` }}
                    >
                      {p.name}
                    </div>
                  </div>
                );
              })}

              {routePoints.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Plus className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">点击地图空白处添加路线点</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-6 flex-wrap">
              {(Object.keys(POINT_CONFIG) as RoutePoint["type"][]).map(type => {
                const cfg = POINT_CONFIG[type];
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cfg.color, boxShadow: `0 0 8px ${cfg.color}60` }}
                    />
                    <span className="text-xs text-gray-400">{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {editingPoint && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-sm w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
              <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-racing-green" />编辑路线点
              </h3>
              <button
                onClick={() => setEditingPoint(null)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">名称</label>
                <input
                  className="input"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">距离(km)</label>
                <input
                  type="number"
                  className="input"
                  value={editForm.distance_km}
                  onChange={e => setEditForm({ ...editForm, distance_km: Number(e.target.value) })}
                  min={0}
                  step={0.1}
                />
              </div>
              {(editingPoint.type === "cutoff" || editingPoint.type === "finish" || editingPoint.type === "aid") && (
                <div>
                  <label className="label">关门时间</label>
                  <input
                    type="time"
                    className="input"
                    value={editForm.cut_off_time}
                    onChange={e => setEditForm({ ...editForm, cut_off_time: e.target.value })}
                  />
                </div>
              )}
              <div className="p-3 bg-dark-850 rounded-sm text-xs text-gray-400">
                <p className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-gray-500" />
                  当前位置：X={editingPoint.position_x}, Y={editingPoint.position_y}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-600">
              <button onClick={() => setEditingPoint(null)} className="btn-secondary">取消</button>
              <button onClick={handleSaveEdit} className="btn-primary">
                <Save className="w-4 h-4" />保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
