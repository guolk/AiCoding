import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Plot } from '../types';
import { User, Calendar, MapPin, History, Plus, Check, X, Info, ArrowRight, Leaf } from 'lucide-react';
import { plotAPI } from '../api/client';

export default function Plots() {
  const { plots, fetchAllData, currentUser, setPlots, updatePlotLocal } = useStore();
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [hoveredPlot, setHoveredPlot] = useState<string | null>(null);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [adoptForm, setAdoptForm] = useState({ startDate: '', endDate: '' });
  const [rotationForm, setRotationForm] = useState({ season: '春季', year: new Date().getFullYear(), crop: '', notes: '' });

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getPlotColor = (plot: Plot, isSelected: boolean, isHovered: boolean) => {
    const baseColors = {
      adopted: '#22c55e',
      available: '#86efac',
      pending: '#facc15'
    };
    const hoverOpacity = isHovered ? 0.9 : 0.85;
    return baseColors[plot.status];
  };

  const getPlotStroke = (plot: Plot, isSelected: boolean) => {
    if (isSelected) return '#166534';
    return plot.status === 'adopted' ? '#16a34a' : plot.status === 'pending' ? '#ca8a04' : '#16a34a';
  };

  const handleAdopt = async () => {
    if (!selectedPlot || !adoptForm.startDate || !adoptForm.endDate) return;
    const res = await plotAPI.adopt(selectedPlot.id, {
      name: currentUser.name,
      userId: currentUser.id,
      startDate: adoptForm.startDate,
      endDate: adoptForm.endDate
    });
    if (res.success && res.data) {
      updatePlotLocal(res.data);
      setShowAdoptModal(false);
      setSelectedPlot(res.data);
      setAdoptForm({ startDate: '', endDate: '' });
    }
  };

  const handleRelease = async () => {
    if (!selectedPlot) return;
    const res = await plotAPI.release(selectedPlot.id);
    if (res.success && res.data) {
      updatePlotLocal(res.data);
      setSelectedPlot(res.data);
    }
  };

  const handleApprove = async () => {
    if (!selectedPlot) return;
    const res = await plotAPI.approve(selectedPlot.id);
    if (res.success && res.data) {
      updatePlotLocal(res.data);
      setSelectedPlot(res.data);
    }
  };

  const handleAddRotation = async () => {
    if (!selectedPlot || !rotationForm.crop) return;
    const res = await plotAPI.addRotation(selectedPlot.id, rotationForm);
    if (res.success) {
      const plotRes = await plotAPI.getById(selectedPlot.id);
      if (plotRes.success && plotRes.data) {
        updatePlotLocal(plotRes.data);
        setSelectedPlot(plotRes.data);
      }
      setShowRotationModal(false);
      setRotationForm({ season: '春季', year: new Date().getFullYear(), crop: '', notes: '' });
    }
  };

  const getStatusBadge = (status: Plot['status']) => {
    const styles = {
      available: 'bg-green-100 text-green-700',
      adopted: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700'
    };
    const labels = { available: '空闲', adopted: '已认养', pending: '待审批' };
    return <span className={`status-badge ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="h-[calc(100vh-180px)] flex gap-6 animate-fade-in">
      <div className="flex-1 card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-gray-800">花园地块分布图</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-400" />
              <span>空闲</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>已认养</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-400" />
              <span>待审批</span>
            </div>
          </div>
        </div>

        <div className="h-full overflow-auto rounded-xl bg-gradient-to-br from-green-50 to-amber-50 p-8">
          <svg viewBox="0 0 350 400" className="w-full h-full" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <defs>
              <pattern id="grass" patternUnits="userSpaceOnUse" width="20" height="20">
                <rect width="20" height="20" fill="#dcfce7" />
                <circle cx="5" cy="5" r="1" fill="#86efac" opacity="0.5" />
                <circle cx="15" cy="15" r="1" fill="#86efac" opacity="0.3" />
              </pattern>
              <filter id="shadow">
                <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.2" />
              </filter>
            </defs>

            <rect x="0" y="0" width="350" height="400" fill="url(#grass)" rx="10" />

            <text x="175" y="15" textAnchor="middle" className="fill-green-800 font-display" fontSize="14" fontWeight="bold">
              🌳 社区花园 🌳
            </text>

            {plots.map((plot) => {
              const isSelected = selectedPlot?.id === plot.id;
              const isHovered = hoveredPlot === plot.id;
              return (
                <g
                  key={plot.id}
                  className="plot-rect group"
                  onClick={() => setSelectedPlot(plot)}
                  onMouseEnter={() => setHoveredPlot(plot.id)}
                  onMouseLeave={() => setHoveredPlot(null)}
                >
                  <rect
                    x={plot.coordinates.x}
                    y={plot.coordinates.y}
                    width={plot.coordinates.width}
                    height={plot.coordinates.height}
                    fill={getPlotColor(plot, isSelected, isHovered)}
                    stroke={getPlotStroke(plot, isSelected)}
                    strokeWidth={isSelected ? 3 : 2}
                    rx="6"
                    filter="url(#shadow)"
                    opacity={isHovered ? 1 : 0.9}
                  />
                  <text
                    x={plot.coordinates.x + plot.coordinates.width / 2}
                    y={plot.coordinates.y + plot.coordinates.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {plot.name}
                  </text>
                  {plot.currentCrop && (
                    <text
                      x={plot.coordinates.x + plot.coordinates.width / 2}
                      y={plot.coordinates.y + plot.coordinates.height / 2 + 14}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      {plot.currentCrop}
                    </text>
                  )}
                </g>
              );
            })}

            <text x="10" y="390" fill="#166534" fontSize="10" opacity="0.7">入口 →</text>
          </svg>
        </div>
      </div>

      <div className="w-96 card p-6 overflow-y-auto scrollbar-thin">
        {selectedPlot ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-gray-800">{selectedPlot.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  面积: {selectedPlot.area} ㎡
                </p>
              </div>
              {getStatusBadge(selectedPlot.status)}
            </div>

            {selectedPlot.adopter && (
              <div className="p-4 bg-garden-50 rounded-xl border border-garden-100">
                <h4 className="font-medium text-gray-800 flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-garden-600" />
                  认养信息
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">认养人</span>
                    <span className="font-medium text-gray-800">{selectedPlot.adopter.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">开始日期</span>
                    <span className="font-medium text-gray-800">{selectedPlot.adopter.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">结束日期</span>
                    <span className="font-medium text-gray-800">{selectedPlot.adopter.endDate}</span>
                  </div>
                </div>
                {selectedPlot.currentCrop && (
                  <div className="mt-3 pt-3 border-t border-garden-200">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-500">当前种植:</span>
                      <span className="font-medium text-green-700">{selectedPlot.currentCrop}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {selectedPlot.status === 'available' && (
                <button
                  onClick={() => setShowAdoptModal(true)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  申请认养
                </button>
              )}
              {selectedPlot.status === 'pending' && (
                <>
                  <button
                    onClick={handleApprove}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    批准
                  </button>
                  <button
                    onClick={handleRelease}
                    className="btn-danger flex-1 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    拒绝
                  </button>
                </>
              )}
              {selectedPlot.status === 'adopted' && selectedPlot.adopter?.userId === currentUser.id && (
                <button
                  onClick={handleRelease}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  退出认养
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <History className="w-4 h-4 text-garden-600" />
                  轮作历史
                </h4>
                <button
                  onClick={() => setShowRotationModal(true)}
                  className="text-sm text-garden-600 hover:text-garden-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  添加
                </button>
              </div>

              {selectedPlot.rotationHistory.length > 0 ? (
                <div className="space-y-3">
                  {selectedPlot.rotationHistory
                    .slice()
                    .sort((a, b) => b.year - a.year || ['春季', '夏季', '秋季', '冬季'].indexOf(a.season) - ['春季', '夏季', '秋季', '冬季'].indexOf(b.season))
                    .map((record) => (
                      <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">
                            {record.year}年 {record.season}
                          </span>
                          <span className="text-sm text-green-700 font-medium">{record.crop}</span>
                        </div>
                        {record.notes && (
                          <p className="text-xs text-gray-500 mt-1">{record.notes}</p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  暂无轮作记录
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <MapPin className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-center">
              点击地图上的地块<br />查看详细信息
            </p>
          </div>
        )}
      </div>

      {showAdoptModal && (
        <div className="modal-backdrop" onClick={() => setShowAdoptModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-gray-800">申请认养 {selectedPlot?.name}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">认养开始日期</label>
                <input
                  type="date"
                  value={adoptForm.startDate}
                  onChange={(e) => setAdoptForm({ ...adoptForm, startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">认养结束日期</label>
                <input
                  type="date"
                  value={adoptForm.endDate}
                  onChange={(e) => setAdoptForm({ ...adoptForm, endDate: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowAdoptModal(false)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleAdopt} className="btn-primary" disabled={!adoptForm.startDate || !adoptForm.endDate}>
                提交申请
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showRotationModal && (
        <div className="modal-backdrop" onClick={() => setShowRotationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-gray-800">添加轮作记录</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">季节</label>
                  <select
                    value={rotationForm.season}
                    onChange={(e) => setRotationForm({ ...rotationForm, season: e.target.value })}
                    className="input-field"
                  >
                    <option>春季</option>
                    <option>夏季</option>
                    <option>秋季</option>
                    <option>冬季</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
                  <input
                    type="number"
                    value={rotationForm.year}
                    onChange={(e) => setRotationForm({ ...rotationForm, year: parseInt(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">种植作物</label>
                <input
                  type="text"
                  value={rotationForm.crop}
                  onChange={(e) => setRotationForm({ ...rotationForm, crop: e.target.value })}
                  placeholder="例如：番茄、黄瓜、白菜"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={rotationForm.notes}
                  onChange={(e) => setRotationForm({ ...rotationForm, notes: e.target.value })}
                  placeholder="生长情况、产量等"
                  className="input-field h-24 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowRotationModal(false)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleAddRotation} className="btn-primary" disabled={!rotationForm.crop}>
                添加记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
