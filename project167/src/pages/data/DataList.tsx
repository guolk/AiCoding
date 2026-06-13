import { useState, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { getQualityFlagColor, getQualityFlagLabel, getReviewStatusColor, getReviewStatusLabel } from '@/utils/quality';
import { exportToCSV, downloadCSV } from '@/utils/csv';
import { Search, Filter, Download, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataList() {
  const observations = useWeatherStore((state) => state.observations);
  const instruments = useWeatherStore((state) => state.instruments);
  const updateObservation = useWeatherStore((state) => state.updateObservation);
  const deleteObservation = useWeatherStore((state) => state.deleteObservation);

  const [search, setSearch] = useState('');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [instrumentFilter, setInstrumentFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const pageSize = 20;

  const filteredData = useMemo(() => {
    let data = [...observations];

    if (search) {
      const lower = search.toLowerCase();
      data = data.filter(
        (o) =>
          o.datetime.toLowerCase().includes(lower) ||
          o.instrumentId.toLowerCase().includes(lower) ||
          o.remark?.toLowerCase().includes(lower)
      );
    }

    if (qualityFilter !== 'all') {
      data = data.filter((o) => o.qualityFlag === qualityFilter);
    }

    if (reviewFilter !== 'all') {
      data = data.filter((o) => o.reviewStatus === reviewFilter);
    }

    if (instrumentFilter !== 'all') {
      data = data.filter((o) => o.instrumentId === instrumentFilter);
    }

    if (dateFrom) {
      data = data.filter((o) => o.datetime >= dateFrom);
    }

    if (dateTo) {
      data = data.filter((o) => o.datetime <= dateTo + 'T23:59:59');
    }

    return data;
  }, [observations, search, qualityFilter, reviewFilter, instrumentFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const pageData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const content = exportToCSV(filteredData);
    const filename = `气象观测数据_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(content, filename);
  };

  const startEdit = (obs: any) => {
    setEditingId(obs.id);
    setEditForm({ ...obs });
  };

  const saveEdit = () => {
    if (editingId) {
      updateObservation(editingId, editForm);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定删除这条记录吗？')) {
      deleteObservation(id);
    }
  };

  const instrumentName = (id: string) => instruments.find((i) => i.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">观测数据列表</h1>
          <p className="text-slate-500 mt-1">共 {filteredData.length.toLocaleString()} 条记录</p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          导出CSV
        </button>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="input-label">
              <Search className="w-4 h-4 inline mr-1" />
              搜索
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="搜索时间、仪器、备注..."
              className="input"
            />
          </div>
          <div>
            <label className="input-label">
              <Filter className="w-4 h-4 inline mr-1" />
              质量标记
            </label>
            <select
              value={qualityFilter}
              onChange={(e) => { setQualityFilter(e.target.value); setCurrentPage(1); }}
              className="input"
            >
              <option value="all">全部</option>
              <option value="normal">正常</option>
              <option value="out_of_range">超范围</option>
              <option value="suspect">可疑</option>
              <option value="missing">缺失</option>
            </select>
          </div>
          <div>
            <label className="input-label">审核状态</label>
            <select
              value={reviewFilter}
              onChange={(e) => { setReviewFilter(e.target.value); setCurrentPage(1); }}
              className="input"
            >
              <option value="all">全部</option>
              <option value="pending">待审核</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          <div>
            <label className="input-label">开始日期</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="input"
            />
          </div>
          <div>
            <label className="input-label">结束日期</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">观测时间</th>
                <th className="table-header">气温(°C)</th>
                <th className="table-header">湿度(%)</th>
                <th className="table-header">气压(hPa)</th>
                <th className="table-header">风速(m/s)</th>
                <th className="table-header">降水(mm)</th>
                <th className="table-header">仪器</th>
                <th className="table-header">质量</th>
                <th className="table-header">状态</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((obs) => (
                <tr key={obs.id} className={`border-t border-slate-100 hover:bg-slate-50 ${obs.qualityFlag !== 'normal' ? 'bg-amber-50/30' : ''}`}>
                  {editingId === obs.id ? (
                    <>
                      <td className="table-cell">
                        <input
                          type="datetime-local"
                          value={editForm.datetime?.slice(0, 16) || ''}
                          onChange={(e) => setEditForm({ ...editForm, datetime: new Date(e.target.value).toISOString() })}
                          className="input text-sm"
                        />
                      </td>
                      {['temperature', 'humidity', 'pressure', 'windSpeed', 'windDirection', 'precipitation', 'visibility'].map((f) => (
                        <td key={f} className="table-cell">
                          <input
                            type="number"
                            step="any"
                            value={editForm[f] ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, [f]: e.target.value ? parseFloat(e.target.value) : null })}
                            className="input text-sm w-20"
                          />
                        </td>
                      ))}
                      <td className="table-cell">
                        <select
                          value={editForm.instrumentId}
                          onChange={(e) => setEditForm({ ...editForm, instrumentId: e.target.value })}
                          className="input text-sm"
                        >
                          {instruments.map((i) => (
                            <option key={i.id} value={i.id}>{i.name}</option>
                          ))}
                        </select>
                      </td>
                      <td colSpan={3} className="table-cell">
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="btn btn-primary text-xs py-1 px-3">保存</button>
                          <button onClick={() => setEditingId(null)} className="btn btn-secondary text-xs py-1 px-3">取消</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="table-cell">
                        {new Date(obs.datetime).toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="table-cell">{obs.temperature?.toFixed(1) || '--'}</td>
                      <td className="table-cell">{obs.humidity?.toFixed(0) || '--'}</td>
                      <td className="table-cell">{obs.pressure?.toFixed(1) || '--'}</td>
                      <td className="table-cell">{obs.windSpeed?.toFixed(1) || '--'}</td>
                      <td className="table-cell">{obs.precipitation?.toFixed(1) || '--'}</td>
                      <td className="table-cell text-xs">{instrumentName(obs.instrumentId)}</td>
                      <td className="table-cell">
                        <span className={`badge ${getQualityFlagColor(obs.qualityFlag)}`}>
                          {getQualityFlagLabel(obs.qualityFlag)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getReviewStatusColor(obs.reviewStatus)}`}>
                          {getReviewStatusLabel(obs.reviewStatus)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(obs)} className="p-1 text-slate-400 hover:text-primary-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(obs.id)} className="p-1 text-slate-400 hover:text-danger-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              第 {currentPage} / {totalPages} 页
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary py-1 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page = i + 1;
                if (totalPages > 5) {
                  if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn py-1 px-3 ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary py-1 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
