import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plotsAPI } from '../api';
import Modal from '../components/Modal';

const Plots: React.FC = () => {
  const [plots, setPlots] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<any>(null);
  const [formData, setFormData] = useState({
    plot_number: '',
    area: '',
    soil_type: '',
    previous_crop: '',
    irrigation_method: '',
    location: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadPlots();
  }, [search]);

  const loadPlots = async () => {
    try {
      const res = await plotsAPI.getAll(search);
      setPlots(res.data);
    } catch (error) {
      console.error('加载地块失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, area: parseFloat(formData.area as string) };
      if (editingPlot) {
        await plotsAPI.update(editingPlot.id, data);
      } else {
        await plotsAPI.create(data);
      }
      setModalOpen(false);
      resetForm();
      loadPlots();
    } catch (error: any) {
      alert(error.response?.data?.error || '保存失败');
    }
  };

  const handleEdit = (plot: any) => {
    setEditingPlot(plot);
    setFormData({
      plot_number: plot.plot_number,
      area: plot.area.toString(),
      soil_type: plot.soil_type || '',
      previous_crop: plot.previous_crop || '',
      irrigation_method: plot.irrigation_method || '',
      location: plot.location || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个地块吗？相关的种植记录和检测记录也会被删除。')) return;
    try {
      await plotsAPI.delete(id);
      loadPlots();
    } catch (error: any) {
      alert(error.response?.data?.error || '删除失败');
    }
  };

  const resetForm = () => {
    setEditingPlot(null);
    setFormData({
      plot_number: '',
      area: '',
      soil_type: '',
      previous_crop: '',
      irrigation_method: '',
      location: '',
    });
  };

  const soilTypes = ['壤土', '沙壤土', '粘壤土', '砂土', '粘土', '砾石土'];
  const irrigationMethods = ['滴灌', '喷灌', '漫灌', '沟灌', '畦灌', '无'];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>地块列表</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="搜索地块编号或位置..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <button
              className="btn btn-primary"
              onClick={() => { resetForm(); setModalOpen(true); }}
            >
              + 新增地块
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        ) : plots.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🌱</div>
            <div>暂无地块数据</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>地块编号</th>
                <th>面积(亩)</th>
                <th>土壤类型</th>
                <th>前茬作物</th>
                <th>灌溉方式</th>
                <th>位置</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {plots.map(plot => (
                <tr key={plot.id}>
                  <td>
                    <a
                      href="#"
                      onClick={e => { e.preventDefault(); navigate(`/plots/${plot.id}`); }}
                      style={{ color: '#4caf50', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {plot.plot_number}
                    </a>
                  </td>
                  <td>{plot.area}</td>
                  <td>{plot.soil_type || '-'}</td>
                  <td>{plot.previous_crop || '-'}</td>
                  <td>
                    {plot.irrigation_method && (
                      <span className="badge badge-info">{plot.irrigation_method}</span>
                    )}
                  </td>
                  <td>{plot.location || '-'}</td>
                  <td className="actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(plot)}>编辑</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(plot.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlot ? '编辑地块' : '新增地块'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>地块编号 *</label>
              <input
                type="text"
                value={formData.plot_number}
                onChange={e => setFormData({ ...formData, plot_number: e.target.value })}
                required
                placeholder="如: A-001"
              />
            </div>
            <div className="form-group">
              <label>面积(亩) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.area}
                onChange={e => setFormData({ ...formData, area: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>土壤类型</label>
              <select
                value={formData.soil_type}
                onChange={e => setFormData({ ...formData, soil_type: e.target.value })}
              >
                <option value="">请选择</option>
                {soilTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>灌溉方式</label>
              <select
                value={formData.irrigation_method}
                onChange={e => setFormData({ ...formData, irrigation_method: e.target.value })}
              >
                <option value="">请选择</option>
                {irrigationMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>前茬作物</label>
              <input
                type="text"
                value={formData.previous_crop}
                onChange={e => setFormData({ ...formData, previous_crop: e.target.value })}
                placeholder="如: 小麦"
              />
            </div>
            <div className="form-group">
              <label>位置</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="如: 东区1号地块"
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button type="submit" className="btn btn-primary">{editingPlot ? '保存修改' : '创建'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Plots;
