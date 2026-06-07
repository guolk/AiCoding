import React, { useState, useEffect } from 'react';
import { farmingAPI, plotsAPI } from '../api';
import Modal from '../components/Modal';

const Farming: React.FC = () => {
  const [activeTab, setActiveTab] = useState('operations');
  const [operations, setOperations] = useState<any[]>([]);
  const [pesticides, setPesticides] = useState<any[]>([]);
  const [machinery, setMachinery] = useState<any[]>([]);
  const [plots, setPlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    plot_id: '',
    start_date: '',
    end_date: '',
    operation_type: '',
  });

  const [modalType, setModalType] = useState<'operation' | 'pesticide' | 'machinery' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const operationTypes = ['整地', '播种', '施肥', '灌溉', '病虫害防治', '中耕', '收获', '其他'];

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'operations') {
      loadOperations();
    }
  }, [filters]);

  const loadAllData = async () => {
    try {
      const [plotsRes] = await Promise.all([plotsAPI.getAll()]);
      setPlots(plotsRes.data);
      if (activeTab === 'pesticides') {
        const res = await farmingAPI.getPesticides();
        setPesticides(res.data);
      } else if (activeTab === 'machinery') {
        const res = await farmingAPI.getMachinery();
        setMachinery(res.data);
      } else if (activeTab === 'operations') {
        await loadOperations();
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOperations = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const res = await farmingAPI.getOperations(params);
      setOperations(res.data);
    } catch (error) {
      console.error('加载操作记录失败:', error);
    }
  };

  const openModal = (type: 'operation' | 'pesticide' | 'machinery', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    if (type === 'operation') {
      setFormData(item ? {
        plot_id: item.plot_id,
        operation_type: item.operation_type,
        operation_date: item.operation_date,
        operation_area: item.operation_area?.toString() || '',
        pesticide_id: item.pesticide_id || '',
        pesticide_quantity: item.pesticide_quantity?.toString() || '',
        fertilizer_id: item.fertilizer_id || '',
        fertilizer_quantity: item.fertilizer_quantity?.toString() || '',
        machinery_id: item.machinery_id || '',
        operation_hours: item.operation_hours?.toString() || '',
        fuel_consumption: item.fuel_consumption?.toString() || '',
        operator: item.operator || '',
        cost: item.cost?.toString() || '',
        notes: item.notes || '',
      } : {
        plot_id: '',
        operation_type: '',
        operation_date: '',
        operation_area: '',
        pesticide_id: '',
        pesticide_quantity: '',
        fertilizer_id: '',
        fertilizer_quantity: '',
        machinery_id: '',
        operation_hours: '',
        fuel_consumption: '',
        operator: '',
        cost: '',
        notes: '',
      });
    } else if (type === 'pesticide') {
      setFormData(item ? {
        name: item.name,
        brand: item.brand || '',
        active_ingredient: item.active_ingredient || '',
        purchase_date: item.purchase_date || '',
        batch_number: item.batch_number || '',
        type: item.type,
        quantity: item.quantity?.toString() || '',
        unit: item.unit || '',
        notes: item.notes || '',
      } : {
        name: '',
        brand: '',
        active_ingredient: '',
        purchase_date: '',
        batch_number: '',
        type: 'pesticide',
        quantity: '',
        unit: '',
        notes: '',
      });
    } else if (type === 'machinery') {
      setFormData(item ? {
        name: item.name,
        model: item.model || '',
        serial_number: item.serial_number || '',
        purchase_date: item.purchase_date || '',
        status: item.status,
        notes: item.notes || '',
      } : {
        name: '',
        model: '',
        serial_number: '',
        purchase_date: '',
        status: 'available',
        notes: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let data = { ...formData };
      if (modalType === 'operation') {
        data = {
          ...data,
          operation_area: data.operation_area ? parseFloat(data.operation_area) : undefined,
          pesticide_quantity: data.pesticide_quantity ? parseFloat(data.pesticide_quantity) : undefined,
          fertilizer_quantity: data.fertilizer_quantity ? parseFloat(data.fertilizer_quantity) : undefined,
          operation_hours: data.operation_hours ? parseFloat(data.operation_hours) : undefined,
          fuel_consumption: data.fuel_consumption ? parseFloat(data.fuel_consumption) : undefined,
          cost: data.cost ? parseFloat(data.cost) : undefined,
          pesticide_id: data.pesticide_id || undefined,
          fertilizer_id: data.fertilizer_id || undefined,
          machinery_id: data.machinery_id || undefined,
        };
        if (editingItem) {
          await farmingAPI.updateOperation(editingItem.id, data);
        } else {
          await farmingAPI.createOperation(data);
        }
        loadOperations();
      } else if (modalType === 'pesticide') {
        data = {
          ...data,
          quantity: data.quantity ? parseFloat(data.quantity) : undefined,
        };
        if (editingItem) {
          await farmingAPI.updatePesticide(editingItem.id, data);
        } else {
          await farmingAPI.createPesticide(data);
        }
        const res = await farmingAPI.getPesticides();
        setPesticides(res.data);
      } else if (modalType === 'machinery') {
        if (editingItem) {
          await farmingAPI.updateMachinery(editingItem.id, data);
        } else {
          await farmingAPI.createMachinery(data);
        }
        const res = await farmingAPI.getMachinery();
        setMachinery(res.data);
      }
      setModalType(null);
    } catch (error: any) {
      alert(error.response?.data?.error || '保存失败');
    }
  };

  const handleDelete = async (type: 'operation' | 'pesticide' | 'machinery', id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      if (type === 'operation') {
        await farmingAPI.deleteOperation(id);
        loadOperations();
      } else if (type === 'pesticide') {
        await farmingAPI.deletePesticide(id);
        const res = await farmingAPI.getPesticides();
        setPesticides(res.data);
      } else if (type === 'machinery') {
        await farmingAPI.deleteMachinery(id);
        const res = await farmingAPI.getMachinery();
        setMachinery(res.data);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || '删除失败');
    }
  };

  const getOperationTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      '整地': 'badge-info',
      '播种': 'badge-success',
      '施肥': 'badge-warning',
      '灌溉': 'badge-info',
      '病虫害防治': 'badge-danger',
      '中耕': 'badge-success',
      '收获': 'badge-warning',
      '其他': 'badge-info',
    };
    return <span className={`badge ${colors[type] || 'badge-info'}`}>{type}</span>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'available' 
      ? <span className="badge badge-success">可用</span>
      : <span className="badge badge-warning">使用中</span>;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'operations' ? 'active' : ''}`}
            onClick={() => setActiveTab('operations')}
          >
            农事操作记录
          </button>
          <button
            className={`tab ${activeTab === 'pesticides' ? 'active' : ''}`}
            onClick={() => setActiveTab('pesticides')}
          >
            农药化肥管理
          </button>
          <button
            className={`tab ${activeTab === 'machinery' ? 'active' : ''}`}
            onClick={() => setActiveTab('machinery')}
          >
            农机管理
          </button>
        </div>

        {activeTab === 'operations' && (
          <div>
            <div className="filter-bar">
              <select
                value={filters.plot_id}
                onChange={e => setFilters({ ...filters, plot_id: e.target.value })}
              >
                <option value="">全部地块</option>
                {plots.map(p => <option key={p.id} value={p.id}>{p.plot_number}</option>)}
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
              <select
                value={filters.operation_type}
                onChange={e => setFilters({ ...filters, operation_type: e.target.value })}
              >
                <option value="">全部类型</option>
                {operationTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button
                className="btn btn-primary"
                onClick={() => openModal('operation')}
              >
                + 新增操作
              </button>
            </div>

            {operations.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📋</div>
                <div>暂无操作记录</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>地块</th>
                    <th>操作类型</th>
                    <th>作业面积(亩)</th>
                    <th>农药/化肥</th>
                    <th>农机</th>
                    <th>作业时长(h)</th>
                    <th>成本(元)</th>
                    <th>操作人</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map(op => (
                    <tr key={op.id}>
                      <td>{op.operation_date}</td>
                      <td>{op.plot_number || '-'}</td>
                      <td>{getOperationTypeBadge(op.operation_type)}</td>
                      <td>{op.operation_area || '-'}</td>
                      <td>
                        {op.pesticide_name && <div><span className="badge badge-danger">农: {op.pesticide_name}</span></div>}
                        {op.fertilizer_name && <div><span className="badge badge-warning">肥: {op.fertilizer_name}</span></div>}
                        {!op.pesticide_name && !op.fertilizer_name && '-'}
                      </td>
                      <td>{op.machinery_name || '-'}</td>
                      <td>{op.operation_hours || '-'}</td>
                      <td>{op.cost?.toLocaleString() || '-'}</td>
                      <td>{op.operator || '-'}</td>
                      <td className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openModal('operation', op)}>编辑</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete('operation', op.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'pesticides' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="filter-bar" style={{ marginBottom: 0 }}>
                <select
                  onChange={async e => {
                    const res = await farmingAPI.getPesticides(e.target.value || undefined);
                    setPesticides(res.data);
                  }}
                >
                  <option value="">全部类型</option>
                  <option value="pesticide">农药</option>
                  <option value="fertilizer">化肥</option>
                </select>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => openModal('pesticide')}
              >
                + 新增农药/化肥
              </button>
            </div>

            {pesticides.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🧪</div>
                <div>暂无农药化肥记录</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>类型</th>
                    <th>品牌</th>
                    <th>有效成分</th>
                    <th>购入时间</th>
                    <th>批次号</th>
                    <th>数量</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pesticides.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>
                        {p.type === 'pesticide' 
                          ? <span className="badge badge-danger">农药</span>
                          : <span className="badge badge-warning">化肥</span>
                        }
                      </td>
                      <td>{p.brand || '-'}</td>
                      <td>{p.active_ingredient || '-'}</td>
                      <td>{p.purchase_date || '-'}</td>
                      <td>{p.batch_number || '-'}</td>
                      <td>{p.quantity ? `${p.quantity} ${p.unit || ''}` : '-'}</td>
                      <td className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openModal('pesticide', p)}>编辑</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete('pesticide', p.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'machinery' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                className="btn btn-primary"
                onClick={() => openModal('machinery')}
              >
                + 新增农机
              </button>
            </div>

            {machinery.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🚜</div>
                <div>暂无农机记录</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>型号</th>
                    <th>序列号</th>
                    <th>购入时间</th>
                    <th>状态</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {machinery.map(m => (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td>{m.model || '-'}</td>
                      <td>{m.serial_number || '-'}</td>
                      <td>{m.purchase_date || '-'}</td>
                      <td>{getStatusBadge(m.status)}</td>
                      <td>{m.notes || '-'}</td>
                      <td className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openModal('machinery', m)}>编辑</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete('machinery', m.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={
          modalType === 'operation' ? (editingItem ? '编辑农事操作' : '新增农事操作') :
          modalType === 'pesticide' ? (editingItem ? '编辑农药化肥' : '新增农药化肥') :
          modalType === 'machinery' ? (editingItem ? '编辑农机' : '新增农机') : ''
        }
      >
        <form onSubmit={handleSubmit}>
          {modalType === 'operation' && (
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
                  <label>操作类型 *</label>
                  <select
                    value={formData.operation_type}
                    onChange={e => setFormData({ ...formData, operation_type: e.target.value })}
                    required
                  >
                    <option value="">请选择</option>
                    {operationTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>作业日期 *</label>
                  <input
                    type="date"
                    value={formData.operation_date}
                    onChange={e => setFormData({ ...formData, operation_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>作业面积(亩)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.operation_area}
                    onChange={e => setFormData({ ...formData, operation_area: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>农药</label>
                  <select
                    value={formData.pesticide_id}
                    onChange={e => setFormData({ ...formData, pesticide_id: e.target.value })}
                  >
                    <option value="">无</option>
                    {pesticides.filter(p => p.type === 'pesticide').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>农药用量</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.pesticide_quantity}
                    onChange={e => setFormData({ ...formData, pesticide_quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>化肥</label>
                  <select
                    value={formData.fertilizer_id}
                    onChange={e => setFormData({ ...formData, fertilizer_id: e.target.value })}
                  >
                    <option value="">无</option>
                    {pesticides.filter(p => p.type === 'fertilizer').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>化肥用量</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fertilizer_quantity}
                    onChange={e => setFormData({ ...formData, fertilizer_quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>农机</label>
                  <select
                    value={formData.machinery_id}
                    onChange={e => setFormData({ ...formData, machinery_id: e.target.value })}
                  >
                    <option value="">无</option>
                    {machinery.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>作业时长(小时)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.operation_hours}
                    onChange={e => setFormData({ ...formData, operation_hours: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>油耗(升)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fuel_consumption}
                    onChange={e => setFormData({ ...formData, fuel_consumption: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>成本(元)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                  />
                </div>
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

          {modalType === 'pesticide' && (
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
                    <option value="pesticide">农药</option>
                    <option value="fertilizer">化肥</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>品牌</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>有效成分</label>
                  <input
                    type="text"
                    value={formData.active_ingredient}
                    onChange={e => setFormData({ ...formData, active_ingredient: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>购入时间</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>批次号</label>
                  <input
                    type="text"
                    value={formData.batch_number}
                    onChange={e => setFormData({ ...formData, batch_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>数量</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>单位</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="如: kg, 升"
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

          {modalType === 'machinery' && (
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
                  <label>型号</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>序列号</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>购入时间</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>状态</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="available">可用</option>
                  <option value="in_use">使用中</option>
                  <option value="maintenance">维护中</option>
                </select>
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

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>取消</button>
            <button type="submit" className="btn btn-primary">{editingItem ? '保存修改' : '创建'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Farming;
