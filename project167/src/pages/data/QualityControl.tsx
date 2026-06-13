import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { getQualityFlagColor, getQualityFlagLabel, DEFAULT_QUALITY_RANGES } from '@/utils/quality';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle, Filter, Play } from 'lucide-react';

export default function QualityControl() {
  const observations = useWeatherStore((state) => state.observations);
  const instruments = useWeatherStore((state) => state.instruments);
  const approveObservation = useWeatherStore((state) => state.approveObservation);
  const rejectObservation = useWeatherStore((state) => state.rejectObservation);
  const batchApprove = useWeatherStore((state) => state.batchApprove);
  const batchReject = useWeatherStore((state) => state.batchReject);
  const runQualityCheck = useWeatherStore((state) => state.runQualityCheck);
  const updateQualityRanges = useWeatherStore((state) => state.updateQualityRanges);
  const qualityRanges = useWeatherStore((state) => state.qualityRanges);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [showRangeSettings, setShowRangeSettings] = useState(false);
  const [tempRanges, setTempRanges] = useState(qualityRanges);

  const pendingData = useMemo(() => {
    let data = observations.filter((o) => o.reviewStatus === 'pending');
    if (qualityFilter !== 'all') {
      data = data.filter((o) => o.qualityFlag === qualityFilter);
    }
    return data.sort((a, b) => b.datetime.localeCompare(a.datetime));
  }, [observations, qualityFilter]);

  const stats = useMemo(() => {
    const pending = observations.filter((o) => o.reviewStatus === 'pending');
    return {
      total: pending.length,
      outOfRange: pending.filter((o) => o.qualityFlag === 'out_of_range').length,
      suspect: pending.filter((o) => o.qualityFlag === 'suspect').length,
      missing: pending.filter((o) => o.qualityFlag === 'missing').length,
    };
  }, [observations]);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === pendingData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingData.map((o) => o.id)));
    }
  };

  const handleApprove = (id: string) => {
    approveObservation(id);
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  };

  const handleReject = (id: string) => {
    setRejectingId(id);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (rejectingId && rejectReason) {
      rejectObservation(rejectingId, rejectReason);
      setSelectedIds((prev) => {
        const s = new Set(prev);
        s.delete(rejectingId);
        return s;
      });
    }
    setShowRejectModal(false);
    setRejectReason('');
    setRejectingId(null);
  };

  const handleBatchApprove = () => {
    if (selectedIds.size > 0) {
      batchApprove(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleBatchReject = () => {
    if (selectedIds.size > 0) {
      batchReject(Array.from(selectedIds), rejectReason || '批量拒绝');
      setSelectedIds(new Set());
    }
  };

  const handleRunCheck = () => {
    runQualityCheck();
  };

  const saveRanges = () => {
    updateQualityRanges(tempRanges);
    setShowRangeSettings(false);
  };

  const instrumentName = (id: string) => instruments.find((i) => i.id === id)?.name || id;

  const rangeFields = [
    { key: 'temperature', label: '气温', unit: '°C' },
    { key: 'humidity', label: '湿度', unit: '%' },
    { key: 'pressure', label: '气压', unit: 'hPa' },
    { key: 'windSpeed', label: '风速', unit: 'm/s' },
    { key: 'precipitation', label: '降水量', unit: 'mm' },
    { key: 'visibility', label: '能见度', unit: 'km' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">质量审核</h1>
          <p className="text-slate-500 mt-1">待审核 {stats.total} 条记录</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setTempRanges(qualityRanges); setShowRangeSettings(true); }}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            质控范围
          </button>
          <button onClick={handleRunCheck} className="btn btn-accent flex items-center gap-2">
            <Play className="w-4 h-4" />
            运行质控
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.total}</p>
              <p className="text-sm text-slate-500">待审核总数</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-danger-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-danger-600">{stats.outOfRange}</p>
              <p className="text-sm text-slate-500">超范围数据</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-warning-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning-600">{stats.suspect}</p>
              <p className="text-sm text-slate-500">可疑数据</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-600">{stats.missing}</p>
              <p className="text-sm text-slate-500">缺失数据</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <select
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">全部类型</option>
            <option value="out_of_range">超范围</option>
            <option value="suspect">可疑</option>
            <option value="missing">缺失</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBatchApprove}
            disabled={selectedIds.size === 0}
            className="btn btn-accent flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            批量通过 ({selectedIds.size})
          </button>
          <button
            onClick={handleBatchReject}
            disabled={selectedIds.size === 0}
            className="btn btn-danger flex items-center gap-2 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            批量拒绝
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === pendingData.length && pendingData.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="table-header">观测时间</th>
                <th className="table-header">气温</th>
                <th className="table-header">湿度</th>
                <th className="table-header">气压</th>
                <th className="table-header">风速</th>
                <th className="table-header">降水</th>
                <th className="table-header">仪器</th>
                <th className="table-header">质量标记</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody>
              {pendingData.map((obs) => (
                <tr key={obs.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="table-cell">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(obs.id)}
                      onChange={() => toggleSelect(obs.id)}
                      className="w-4 h-4 rounded"
                    />
                  </td>
                  <td className="table-cell">
                    {new Date(obs.datetime).toLocaleString('zh-CN', { hour12: false })}
                  </td>
                  <td className={`table-cell ${obs.temperature === null ? 'text-slate-400' : ''}`}>
                    {obs.temperature?.toFixed(1) || '--'}
                  </td>
                  <td className={`table-cell ${obs.humidity === null ? 'text-slate-400' : ''}`}>
                    {obs.humidity?.toFixed(0) || '--'}
                  </td>
                  <td className={`table-cell ${obs.pressure === null ? 'text-slate-400' : ''}`}>
                    {obs.pressure?.toFixed(1) || '--'}
                  </td>
                  <td className={`table-cell ${obs.windSpeed === null ? 'text-slate-400' : ''}`}>
                    {obs.windSpeed?.toFixed(1) || '--'}
                  </td>
                  <td className={`table-cell ${obs.precipitation === null ? 'text-slate-400' : ''}`}>
                    {obs.precipitation?.toFixed(1) || '--'}
                  </td>
                  <td className="table-cell text-xs">{instrumentName(obs.instrumentId)}</td>
                  <td className="table-cell">
                    <span className={`badge ${getQualityFlagColor(obs.qualityFlag)}`}>
                      {getQualityFlagLabel(obs.qualityFlag)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(obs.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="通过"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(obs.id)}
                        className="p-1.5 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        title="拒绝"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingData.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    暂无待审核数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">拒绝数据</h2>
            <div>
              <label className="input-label">拒绝原因</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input"
                rows={3}
                placeholder="请输入拒绝原因..."
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason}
                className="btn btn-primary"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}

      {showRangeSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">质量控制范围设置</h2>
              <p className="text-sm text-slate-500 mt-1">设置各气象要素的正常范围，超出范围的数据将被自动标记</p>
            </div>
            <div className="p-6 space-y-4">
              {rangeFields.map((field) => (
                <div key={field.key} className="flex items-center gap-4">
                  <label className="w-20 text-sm font-medium text-slate-700">{field.label}</label>
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="number"
                      step="any"
                      value={tempRanges[field.key as keyof typeof tempRanges].min}
                      onChange={(e) => setTempRanges({
                        ...tempRanges,
                        [field.key]: {
                          ...tempRanges[field.key as keyof typeof tempRanges],
                          min: parseFloat(e.target.value)
                        }
                      })}
                      className="input w-24"
                    />
                    <span className="text-slate-400">~</span>
                    <input
                      type="number"
                      step="any"
                      value={tempRanges[field.key as keyof typeof tempRanges].max}
                      onChange={(e) => setTempRanges({
                        ...tempRanges,
                        [field.key]: {
                          ...tempRanges[field.key as keyof typeof tempRanges],
                          max: parseFloat(e.target.value)
                        }
                      })}
                      className="input w-24"
                    />
                    <span className="text-sm text-slate-500">{field.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowRangeSettings(false)} className="btn btn-secondary">
                取消
              </button>
              <button onClick={saveRanges} className="btn btn-primary">
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
