import React, { useState, useEffect } from 'react';
import { pestsAPI, plotsAPI, farmingAPI } from '../api';
import Modal from '../components/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Pests: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [records, setRecords] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [seasonPatterns, setSeasonPatterns] = useState<any[]>([]);
  const [plots, setPlots] = useState<any[]>([]);
  const [pesticides, setPesticides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [filters, setFilters] = useState({
    plot_id: '',
    status: '',
    start_date: '',
    end_date: '',
  });

  const [modalType, setModalType] = useState<'record' | 'catalog' | 'measure' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [recordIdForMeasure, setRecordIdForMeasure] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const statusMap: Record<string, { label: string; class: string }> = {
    reported: { label: '已上报', class: 'badge-warning' },
    investigating: { label: '调查中', class: 'badge-info' },
    treated: { label: '已防治', class: 'badge-success' },
    monitoring: { label: '观察中', class: 'badge-info' },
    resolved: { label: '已解决', class: 'badge-success' },
  };

  const severityMap: Record<string, { label: string; class: string }> = {
    轻微: { label: '轻微', class: 'badge-info' },
    中等: { label: '中等', class: 'badge-warning' },
    严重: { label: '严重', class: 'badge-danger' },
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'records') {
      loadRecords();
    }
  }, [filters]);

  const loadData = async () => {
    try {
      const [plotsRes, pesticidesRes] = await Promise.all([
        plotsAPI.getAll(),
        farmingAPI.getPesticides('pesticide'),
      ]);
      setPlots(plotsRes.data);
      setPesticides(pesticidesRes.data);

      if (activeTab === 'catalog') {
        const res = await pestsAPI.getCatalog();
        setCatalog(res.data);
      } else if (activeTab === 'records') {
        await loadRecords();
      } else if (activeTab === 'patterns') {
        const res = await pestsAPI.getSeasonPatterns();
        setSeasonPatterns(res.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const res = await pestsAPI.getRecords(params);
      setRecords(res.data);
    } catch (error) {
      console.error('加载记录失败:', error);
    }
  };

  const openModal = (type: 'record' | 'catalog' | 'measure', item?: any, recordId?: string) => {
    setModalType(type);
    setEditingItem(item || null);
    setRecordIdForMeasure(recordId || null);

    if (type === 'record') {
      setFormData(item ? {
        plot_id: item.plot_id,
        pest_disease_id: item.pest_disease_id || '',
        discovery_date: item.discovery_date,
        symptoms: item.symptoms,
        severity: item.severity || '',
        photos: item.photos || '',
        status: item.status,
        notes: item.notes || '',
      } : {
        plot_id: '',
        pest_disease_id: '',
        discovery_date: new Date().toISOString().split('T')[0],
        symptoms: '',
        severity: '',
        photos: '',
        status: 'reported',
        notes: '',
      });
    } else if (type === 'catalog') {
      setFormData(item ? {
        name: item.name,
        type: item.type,
        symptoms: item.symptoms || '',
        common_season: item.common_season || '',
        prevention_methods: item.prevention_methods || '',
      } : {
        name: '',
        type: '虫害',
        symptoms: '',
        common_season: '',
        prevention_methods: '',
      });
    } else if (type === 'measure') {
      setFormData(item ? {
        measure_type: item.measure_type,
        measure_date: item.measure_date,
        pesticide_id: item.pesticide_id || '',
        pesticide_quantity: item.pesticide_quantity?.toString() || '',
        description: item.description || '',
        operator: item.operator || '',
        effectiveness: item.effectiveness || '',
        follow_up_date: item.follow_up_date || '',
      } : {
        measure_type: '',
        measure_date: new Date().toISOString().split('T')[0],
        pesticide_id: '',
        pesticide_quantity: '',
        description: '',
        operator: '',
        effectiveness: '',
        follow_up_date: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let data = { ...formData };

      if (modalType === 'record') {
        data = {
          ...data,
          pest_disease_id: data.pest_disease_id || undefined,
          severity: data.severity || undefined,
          photos: data.photos || undefined,
          notes: data.notes || undefined,
        };
        if (editingItem) {
          await pestsAPI.updateRecord(editingItem.id, data);
        } else {
          await pestsAPI.createRecord(data);
        }
        loadRecords();
      } else if (modalType === 'catalog') {
        if (editingItem) {
          await pestsAPI.updateCatalogItem(editingItem.id, data);
        } else {
          await pestsAPI.createCatalogItem(data);
        }
        const res = await pestsAPI.getCatalog();
        setCatalog(res.data);
      } else if (modalType === 'measure' && recordIdForMeasure) {
        data = {
          ...data,
          pesticide_id: data.pesticide_id || undefined,
          pesticide_quantity: data.pesticide_quantity ? parseFloat(data.pesticide_quantity) : undefined,
        };
        if (editingItem) {
          await pestsAPI.updateControlMeasure(editingItem.id, data);
        } else {
          await pestsAPI.addControlMeasure(recordIdForMeasure, data);
        }
        if (selectedRecord) {
          const res = await pestsAPI.getRecord(selectedRecord.id);
          setSelectedRecord(res.data);
        }
      }

      setModalType(null);
    } catch (error: any) {
      alert(error.response?.data?.error || '保存失败');
    }
  };

  const handleDelete = async (type: 'record' | 'catalog' | 'measure', id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      if (type === 'record') {
        await pestsAPI.deleteRecord(id);
        loadRecords();
        if (selectedRecord?.id === id) {
          setSelectedRecord(null);
        }
      } else if (type === 'catalog') {
        await pestsAPI.deleteCatalogItem(id);
        const res = await pestsAPI.getCatalog();
        setCatalog(res.data);
      } else if (type === 'measure') {
        await pestsAPI.deleteControlMeasure(id);
        if (selectedRecord) {
          const res = await pestsAPI.getRecord(selectedRecord.id);
          setSelectedRecord(res.data);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.error || '删除失败');
    }
  };

  const viewRecordDetail = async (record: any) => {
    try {
      const res = await pestsAPI.getRecord(record.id);
      setSelectedRecord(res.data);
    } catch (error) {
      console.error('加载详情失败:', error);
    }
  };

  const chartData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthData = seasonPatterns.filter(p => p.month === month);
    return {
      month: `${month}月`,
      count: monthData.reduce((sum, p) => sum + p.count, 0),
      ...Object.fromEntries(monthData.map(p => [p.pest_name, p.count]))
    };
  });

  const COLORS = ['#f44336', '#ff9800', '#ffc107', '#8bc34a', '#4caf50', '#00bcd4'];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
          >
            病虫害记录
          </button>
          <button
            className={`tab ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            病虫害目录
          </button>
          <button
            className={`tab ${activeTab === 'patterns' ? 'active' : ''}`}
            onClick={() => setActiveTab('patterns')}
          >
            季节规律
          </button>
        </div>

        {activeTab === 'records' && !selectedRecord && (
          <div>
            <div className="filter-bar">
              <select
                value={filters.plot_id}
                onChange={e => setFilters({ ...filters, plot_id: e.target.value })}
              >
                <option value="">全部地块</option>
                {plots.map(p => <option key={p.id} value={p.id}>{p.plot_number}</option>)}
              </select>
              <select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">全部状态</option>
                {Object.entries(statusMap).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="开始日期"
                value={filters.start_date}
                onChange={e => setFilters({ ...filters, start_date: e.target.value })}
              />
              <input
                type="date"
                placeholder="结束日期"
                value={filters.end_date}
                onChange={e => setFilters({ ...filters, end_date: e.target.value })}
              />
              <button
                className="btn btn-primary"
                onClick={() => openModal('record')}
              >
                + 上报病虫害
              </button>
            </div>

            {records.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🐛</div>
                <div>暂无病虫害记录</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>发现时间</th>
                    <th>地块</th>
                    <th>病虫害</th>
                    <th>症状</th>
                    <th>严重程度</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td>{r.discovery_date}</td>
                      <td>{r.plot_number || '-'}</td>
                      <td>
                        {r.pest_name 
                          ? <span className={`badge ${r.pest_type === '虫害' ? 'badge-danger' : 'badge-warning'}`}>{r.pest_name}</span>
                          : <span className="badge badge-info">待识别</span>
                        }
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.symptoms}
                      </td>
                      <td>{r.severity && severityMap[r.severity] ? severityMap[r.severity].label : '-'}</td>
                      <td>
                        {statusMap[r.status] 
                          ? <span className={`badge ${statusMap[r.status].class}`}>{statusMap[r.status].label}</span>
                          : r.status
                        }
                      </td>
                      <td className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => viewRecordDetail(r)}>查看</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => openModal('record', r)}>编辑</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete('record', r.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'records' && selectedRecord && (
          <div>
            <button
              className="btn btn-secondary"
              style={{ marginBottom: '20px' }}
              onClick={() => setSelectedRecord(null)}
            >
              ← 返回列表
            </button>

            <div className="card">
              <div className="card-header">
                <h2>病虫害详情</h2>
                <div>
                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ marginRight: '8px' }}
                    onClick={() => openModal('record', selectedRecord)}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => openModal('measure', null, selectedRecord.id)}
                  >
                    + 添加防治措施
                  </button>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>发现时间</label>
                  <span>{selectedRecord.discovery_date}</span>
                </div>
                <div className="detail-item">
                  <label>地块</label>
                  <span>{selectedRecord.plot_number || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>病虫害</label>
                  <span>{selectedRecord.pest_name || '待识别'}</span>
                </div>
                <div className="detail-item">
                  <label>严重程度</label>
                  <span>{selectedRecord.severity || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>状态</label>
                  <span>
                    {statusMap[selectedRecord.status]?.label || selectedRecord.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>位置</label>
                  <span>{selectedRecord.location || '-'}</span>
                </div>
              </div>

              <div className="detail-section" style={{ marginTop: '24px' }}>
                <h3>症状描述</h3>
                <p style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px' }}>
                  {selectedRecord.symptoms}
                </p>
              </div>

              {selectedRecord.pest_symptoms && (
                <div className="detail-section">
                  <h3>病虫害特征</h3>
                  <p style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px' }}>
                    {selectedRecord.pest_symptoms}
                  </p>
                </div>
              )}

              {selectedRecord.prevention_methods && (
                <div className="detail-section">
                  <h3>预防方法</h3>
                  <p style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px' }}>
                    {selectedRecord.prevention_methods}
                  </p>
                </div>
              )}

              <div className="detail-section">
                <h3>防治措施 ({selectedRecord.control_measures?.length || 0})</h3>
                {selectedRecord.control_measures?.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px 20px' }}>
                    <div className="icon" style={{ fontSize: '32px' }}>💊</div>
                    <div>暂无防治措施</div>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>实施日期</th>
                        <th>措施类型</th>
                        <th>农药</th>
                        <th>用量</th>
                        <th>操作人</th>
                        <th>效果</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.control_measures?.map((m: any) => (
                        <tr key={m.id}>
                          <td>{m.measure_date}</td>
                          <td>{m.measure_type}</td>
                          <td>{m.pesticide_name || '-'}</td>
                          <td>{m.pesticide_quantity || '-'}</td>
                          <td>{m.operator || '-'}</td>
                          <td>{m.effectiveness || '-'}</td>
                          <td className="actions">
                            <button className="btn btn-sm btn-secondary" onClick={() => openModal('measure', m, selectedRecord.id)}>编辑</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete('measure', m.id)}>删除</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="filter-bar" style={{ marginBottom: 0 }}>
                <select
                  onChange={async e => {
                    const res = await pestsAPI.getCatalog(e.target.value || undefined);
                    setCatalog(res.data);
                  }}
                >
                  <option value="">全部类型</option>
                  <option value="虫害">虫害</option>
                  <option value="病害">病害</option>
                </select>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => openModal('catalog')}
              >
                + 新增病虫害
              </button>
            </div>

            {catalog.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📚</div>
                <div>暂无病虫害目录</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>类型</th>
                    <th>常见症状</th>
                    <th>高发时节</th>
                    <th>预防方法</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>
                        {c.type === '虫害'
                          ? <span className="badge badge-danger">虫害</span>
                          : <span className="badge badge-warning">病害</span>
                        }
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.symptoms || '-'}
                      </td>
                      <td>{c.common_season || '-'}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.prevention_methods || '-'}
                      </td>
                      <td className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openModal('catalog', c)}>编辑</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete('catalog', c.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'patterns' && (
          <div>
            <div className="card" style={{ marginBottom: '0' }}>
              <div className="card-header">
                <h2>病虫害季节规律分析</h2>
              </div>
              <div className="chart-container" style={{ height: '400px' }}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {[...new Set(seasonPatterns.map(p => p.pest_name))].map((name, idx) => (
                    <Bar key={name} dataKey={name} stackId="a" fill={COLORS[idx % COLORS.length]} />
                  ))}
                </BarChart>
              </div>
              <p style={{ marginTop: '16px', color: '#888', fontSize: '13px' }}>
                * 该图表展示了各月份不同病虫害的发生频次，帮助您提前做好预防工作。
              </p>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={
          modalType === 'record' ? (editingItem ? '编辑病虫害记录' : '上报病虫害') :
          modalType === 'catalog' ? (editingItem ? '编辑病虫害' : '新增病虫害') :
          modalType === 'measure' ? (editingItem ? '编辑防治措施' : '添加防治措施') : ''
        }
      >
        <form onSubmit={handleSubmit}>
          {modalType === 'record' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>地块 *</label>
                  <select
                    value={formData.plot_id}
                    onChange={e => setFormData({ ...formData, plot_id: e.target.value })}
                    required
                  >
                    <option value="">请选择</option>
                    {plots.map(p => <option key={p.id} value={p.id}>{p.plot_number}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>发现时间 *</label>
                  <input
                    type="date"
                    value={formData.discovery_date}
                    onChange={e => setFormData({ ...formData, discovery_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>病虫害种类</label>
                  <select
                    value={formData.pest_disease_id}
                    onChange={e => setFormData({ ...formData, pest_disease_id: e.target.value })}
                  >
                    <option value="">待识别</option>
                    {catalog.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>严重程度</label>
                  <select
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: e.target.value })}
                  >
                    <option value="">请选择</option>
                    {Object.keys(severityMap).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>症状描述 *</label>
                <textarea
                  rows={3}
                  value={formData.symptoms}
                  onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                  required
                  placeholder="请详细描述病虫害症状..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>状态</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    {Object.entries(statusMap).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>照片链接</label>
                  <input
                    type="text"
                    value={formData.photos}
                    onChange={e => setFormData({ ...formData, photos: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>备注</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </>
          )}

          {modalType === 'catalog' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>类型 *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="虫害">虫害</option>
                    <option value="病害">病害</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>常见症状</label>
                <textarea
                  rows={2}
                  value={formData.symptoms}
                  onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>高发时节</label>
                <input
                  type="text"
                  value={formData.common_season}
                  onChange={e => setFormData({ ...formData, common_season: e.target.value })}
                  placeholder="如: 春季-夏季"
                />
              </div>
              <div className="form-group">
                <label>预防方法</label>
                <textarea
                  rows={2}
                  value={formData.prevention_methods}
                  onChange={e => setFormData({ ...formData, prevention_methods: e.target.value })}
                />
              </div>
            </>
          )}

          {modalType === 'measure' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>措施类型 *</label>
                  <select
                    value={formData.measure_type}
                    onChange={e => setFormData({ ...formData, measure_type: e.target.value })}
                    required
                  >
                    <option value="">请选择</option>
                    <option value="化学防治">化学防治</option>
                    <option value="生物防治">生物防治</option>
                    <option value="物理防治">物理防治</option>
                    <option value="农业防治">农业防治</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>实施日期 *</label>
                  <input
                    type="date"
                    value={formData.measure_date}
                    onChange={e => setFormData({ ...formData, measure_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>使用农药</label>
                  <select
                    value={formData.pesticide_id}
                    onChange={e => setFormData({ ...formData, pesticide_id: e.target.value })}
                  >
                    <option value="">无</option>
                    {pesticides.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>用量</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.pesticide_quantity}
                    onChange={e => setFormData({ ...formData, pesticide_quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>措施描述</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>操作人</label>
                  <input
                    type="text"
                    value={formData.operator}
                    onChange={e => setFormData({ ...formData, operator: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>效果评价</label>
                  <select
                    value={formData.effectiveness}
                    onChange={e => setFormData({ ...formData, effectiveness: e.target.value })}
                  >
                    <option value="">待评价</option>
                    <option value="excellent">很好</option>
                    <option value="good">良好</option>
                    <option value="average">一般</option>
                    <option value="poor">较差</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>复查日期</label>
                <input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={e => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>取消</button>
            <button type="submit" className="btn btn-primary">{editingItem ? '保存修改' : '创建'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pests;
