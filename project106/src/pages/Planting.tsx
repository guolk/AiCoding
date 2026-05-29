import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { PlantingLog, CareRecord, HarvestRecord, QualityLevel } from '../types';
import { Plus, Droplets, Leaf, Scissors, FileText, Image, Calendar, Star, ChevronLeft, Eye, Trash2, Sprout } from 'lucide-react';
import { plantingAPI } from '../api/client';

export default function Planting() {
  const { plantingLogs, fetchAllData, plots, currentUser, updatePlantingLogLocal } = useStore();
  const [selectedLog, setSelectedLog] = useState<PlantingLog | null>(null);
  const [showNewLogModal, setShowNewLogModal] = useState(false);
  const [showCareModal, setShowCareModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [newLogForm, setNewLogForm] = useState({ plotId: '', seedDate: '', variety: '', density: 10, cropType: '' });
  const [careForm, setCareForm] = useState({ date: '', type: 'water' as const, notes: '' });
  const [harvestForm, setHarvestForm] = useState({ date: '', quantity: 0, unit: 'kg', quality: 'good' as QualityLevel, notes: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleCreateLog = async () => {
    const plot = plots.find(p => p.id === newLogForm.plotId);
    if (!plot) {
      alert('请选择一个地块');
      return;
    }
    if (!newLogForm.seedDate) {
      alert('请选择播种日期');
      return;
    }
    if (!newLogForm.variety.trim()) {
      alert('请填写品种');
      return;
    }
    if (!newLogForm.cropType.trim()) {
      alert('请填写作物类型');
      return;
    }

    setIsCreating(true);
    try {
      const res = await plantingAPI.create({
        plotId: newLogForm.plotId,
        plotName: plot.name,
        seedDate: newLogForm.seedDate,
        variety: newLogForm.variety,
        density: newLogForm.density,
        cropType: newLogForm.cropType
      });

      if (res.success && res.data) {
        const logsRes = await plantingAPI.getAll();
        if (logsRes.data) {
          useStore.getState().setPlantingLogs(logsRes.data);
        }
        setShowNewLogModal(false);
        setNewLogForm({ plotId: '', seedDate: '', variety: '', density: 10, cropType: '' });
        alert('种植记录创建成功！');
      } else {
        alert('创建失败: ' + (res.error || '未知错误'));
      }
    } catch (err) {
      alert('创建失败: 网络错误');
      console.error('Create log error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddCare = async () => {
    if (!selectedLog || !careForm.date || !careForm.notes) return;

    const res = await plantingAPI.addCare(selectedLog.id, careForm);
    if (res.success) {
      const logRes = await plantingAPI.getById(selectedLog.id);
      if (logRes.data) {
        updatePlantingLogLocal(logRes.data);
        setSelectedLog(logRes.data);
      }
      setShowCareModal(false);
      setCareForm({ date: '', type: 'water', notes: '' });
    }
  };

  const handleAddHarvest = async () => {
    if (!selectedLog || !harvestForm.date || harvestForm.quantity <= 0) return;

    const res = await plantingAPI.addHarvest(selectedLog.id, harvestForm);
    if (res.success) {
      const logRes = await plantingAPI.getById(selectedLog.id);
      if (logRes.data) {
        updatePlantingLogLocal(logRes.data);
        setSelectedLog(logRes.data);
      }
      setShowHarvestModal(false);
      setHarvestForm({ date: '', quantity: 0, unit: 'kg', quality: 'good', notes: '' });
    }
  };

  const getCareTypeIcon = (type: CareRecord['type']) => {
    switch (type) {
      case 'water': return <Droplets className="w-4 h-4" />;
      case 'fertilize': return <Leaf className="w-4 h-4" />;
      case 'prune': return <Scissors className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCareTypeLabel = (type: CareRecord['type']) => {
    const labels = { water: '浇水', fertilize: '施肥', prune: '修剪', other: '其他' };
    return labels[type];
  };

  const getQualityStars = (quality: HarvestRecord['quality']) => {
    const counts = { excellent: 5, good: 4, fair: 3, poor: 2 };
    return Array.from({ length: counts[quality] }, (_, i) => (
      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
    ));
  };

  const adoptedPlots = plots.filter(p => p.status === 'adopted');

  if (selectedLog) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => setSelectedLog(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-garden-700 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          返回列表
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-800">{selectedLog.cropType}</h2>
                  <p className="text-gray-500">{selectedLog.plotName} · {selectedLog.variety}</p>
                </div>
                <span className="status-badge bg-green-100 text-green-700">种植中</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-garden-50 rounded-xl text-center">
                  <p className="text-sm text-gray-500">播种日期</p>
                  <p className="font-bold text-gray-800">{selectedLog.seedDate}</p>
                </div>
                <div className="p-4 bg-garden-50 rounded-xl text-center">
                  <p className="text-sm text-gray-500">种植密度</p>
                  <p className="font-bold text-gray-800">{selectedLog.density} 株/㎡</p>
                </div>
                <div className="p-4 bg-garden-50 rounded-xl text-center">
                  <p className="text-sm text-gray-500">护理次数</p>
                  <p className="font-bold text-gray-800">{selectedLog.careRecords.length} 次</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-gray-800">生长时间线</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowCareModal(true)} className="btn-secondary text-sm py-1.5">
                    <Plus className="w-4 h-4 inline mr-1" />
                    添加护理
                  </button>
                  <button onClick={() => setShowHarvestModal(true)} className="btn-primary text-sm py-1.5">
                    <Plus className="w-4 h-4 inline mr-1" />
                    记录收获
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {selectedLog.photos.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      生长照片
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {selectedLog.photos.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((photo, idx) => (
                        <div key={photo.id} className="flex-shrink-0">
                          <div className="relative">
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-32 h-32 object-cover rounded-lg shadow-md"
                            />
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                              第{idx + 1}阶段
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-center">{photo.date}</p>
                          <p className="text-xs text-gray-600 text-center">{photo.caption}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog.careRecords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">护理记录</h4>
                    <div className="space-y-2">
                      {selectedLog.careRecords
                        .slice()
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((record) => (
                          <div key={record.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              record.type === 'water' ? 'bg-blue-100 text-blue-600' :
                              record.type === 'fertilize' ? 'bg-green-100 text-green-600' :
                              record.type === 'prune' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {getCareTypeIcon(record.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{getCareTypeLabel(record.type)}</span>
                                <span className="text-xs text-gray-500">{record.date}</span>
                              </div>
                              <p className="text-sm text-gray-600">{record.notes}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {selectedLog.harvests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">收获记录</h4>
                    <div className="space-y-2">
                      {selectedLog.harvests
                        .slice()
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((record) => (
                          <div key={record.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                              <Leaf className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-800">
                                  {record.quantity} {record.unit}
                                </span>
                                <div className="flex">{getQualityStars(record.quality)}</div>
                                <span className="text-xs text-gray-500">{record.date}</span>
                              </div>
                              {record.notes && <p className="text-sm text-gray-600">{record.notes}</p>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-gray-800 mb-4">统计概览</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">总护理次数</span>
                  <span className="font-bold text-garden-700">{selectedLog.careRecords.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">照片记录</span>
                  <span className="font-bold text-garden-700">{selectedLog.photos.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">总收获量</span>
                  <span className="font-bold text-garden-700">
                    {selectedLog.harvests.reduce((sum, h) => sum + h.quantity, 0)} 
                    {selectedLog.harvests[0]?.unit || 'kg'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showCareModal && (
          <div className="modal-backdrop" onClick={() => setShowCareModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-display text-lg font-bold text-gray-800">添加护理记录</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                  <input type="date" value={careForm.date} onChange={(e) => setCareForm({ ...careForm, date: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <select value={careForm.type} onChange={(e) => setCareForm({ ...careForm, type: e.target.value as any })} className="input-field">
                    <option value="water">浇水</option>
                    <option value="fertilize">施肥</option>
                    <option value="prune">修剪</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea value={careForm.notes} onChange={(e) => setCareForm({ ...careForm, notes: e.target.value })} className="input-field h-24 resize-none" placeholder="详细说明..." />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => setShowCareModal(false)} className="btn-secondary">取消</button>
                <button onClick={handleAddCare} className="btn-primary">添加</button>
              </div>
            </div>
          </div>
        )}

        {showHarvestModal && (
          <div className="modal-backdrop" onClick={() => setShowHarvestModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-display text-lg font-bold text-gray-800">记录收获</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">收获日期</label>
                  <input type="date" value={harvestForm.date} onChange={(e) => setHarvestForm({ ...harvestForm, date: e.target.value })} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">收获量</label>
                    <input type="number" value={harvestForm.quantity} onChange={(e) => setHarvestForm({ ...harvestForm, quantity: parseFloat(e.target.value) })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                    <select value={harvestForm.unit} onChange={(e) => setHarvestForm({ ...harvestForm, unit: e.target.value })} className="input-field">
                      <option value="kg">千克</option>
                      <option value="g">克</option>
                      <option value="个">个</option>
                      <option value="束">束</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品质评价</label>
                  <select value={harvestForm.quality} onChange={(e) => setHarvestForm({ ...harvestForm, quality: e.target.value as QualityLevel })} className="input-field">
                    <option value="excellent">优秀</option>
                    <option value="good">良好</option>
                    <option value="fair">一般</option>
                    <option value="poor">较差</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea value={harvestForm.notes} onChange={(e) => setHarvestForm({ ...harvestForm, notes: e.target.value })} className="input-field h-24 resize-none" placeholder="收获情况说明..." />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => setShowHarvestModal(false)} className="btn-secondary">取消</button>
                <button onClick={handleAddHarvest} className="btn-primary">保存</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">种植追踪</h2>
          <p className="text-gray-500">记录种植过程，追踪作物生长</p>
        </div>
        {adoptedPlots.length > 0 && (
          <button onClick={() => setShowNewLogModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建种植记录
          </button>
        )}
      </div>

      {plantingLogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantingLogs.map((log) => (
            <div
              key={log.id}
              className="card p-6 cursor-pointer hover:border-garden-300"
              onClick={() => setSelectedLog(log)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-800">{log.cropType}</h3>
                  <p className="text-sm text-gray-500">{log.plotName}</p>
                </div>
                <span className="status-badge bg-green-100 text-green-700">种植中</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">品种</span>
                  <span className="text-gray-800">{log.variety}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">播种日期</span>
                  <span className="text-gray-800">{log.seedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">护理次数</span>
                  <span className="text-gray-800">{log.careRecords.length} 次</span>
                </div>
              </div>

              {log.photos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    {log.photos.slice(0, 3).map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={photo.caption}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full mt-4 btn-secondary text-sm flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                查看详情
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Sprout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="font-display text-lg font-bold text-gray-800 mb-2">暂无种植记录</h3>
          <p className="text-gray-500 mb-4">开始记录您的第一棵作物吧！</p>
          {adoptedPlots.length > 0 ? (
            <button onClick={() => setShowNewLogModal(true)} className="btn-primary">
              <Plus className="w-4 h-4 inline mr-2" />
              新建种植记录
            </button>
          ) : (
            <p className="text-amber-600 text-sm">请先认养一块地块</p>
          )}
        </div>
      )}

      {showNewLogModal && (
        <div className="modal-backdrop" onClick={() => setShowNewLogModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-gray-800">新建种植记录</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择地块</label>
                <select value={newLogForm.plotId} onChange={(e) => setNewLogForm({ ...newLogForm, plotId: e.target.value })} className="input-field">
                  <option value="">请选择地块</option>
                  {adoptedPlots.map((plot) => (
                    <option key={plot.id} value={plot.id}>{plot.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">作物类型</label>
                <input type="text" value={newLogForm.cropType} onChange={(e) => setNewLogForm({ ...newLogForm, cropType: e.target.value })} placeholder="例如：番茄、黄瓜" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品种</label>
                <input type="text" value={newLogForm.variety} onChange={(e) => setNewLogForm({ ...newLogForm, variety: e.target.value })} placeholder="例如：千禧番茄" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">播种日期</label>
                  <input type="date" value={newLogForm.seedDate} onChange={(e) => setNewLogForm({ ...newLogForm, seedDate: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">种植密度（株/㎡）</label>
                  <input type="number" value={newLogForm.density} onChange={(e) => setNewLogForm({ ...newLogForm, density: parseInt(e.target.value) })} className="input-field" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowNewLogModal(false)} className="btn-secondary" disabled={isCreating}>取消</button>
              <button onClick={handleCreateLog} className="btn-primary" disabled={isCreating || !newLogForm.plotId || !newLogForm.cropType || !newLogForm.variety || !newLogForm.seedDate}>
                {isCreating ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
