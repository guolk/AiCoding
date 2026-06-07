import React, { useState, useEffect } from 'react';
import { harvestAPI, plotsAPI } from '../api';
import Modal from '../components/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Harvest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [harvestRecords, setHarvestRecords] = useState<any[]>([]);
  const [plots, setPlots] = useState<any[]>([]);
  const [yieldAnalysis, setYieldAnalysis] = useState<any[]>([]);
  const [varietyCompare, setVarietyCompare] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    plot_id: '',
    start_date: '',
    end_date: '',
    year: new Date().getFullYear().toString(),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const qualityGrades = [
    { value: 'premium', label: '特级' },
    { value: 'grade1', label: '一级' },
    { value: 'grade2', label: '二级' },
    { value: 'grade3', label: '三级' },
  ];

  const COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0'];

  useEffect(() => {
    loadPlots();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, filters.year]);

  useEffect(() => {
    if (activeTab === 'records') {
      loadRecords();
    }
  }, [filters.plot_id, filters.start_date, filters.end_date]);

  const loadPlots = async () => {
    try {
      const res = await plotsAPI.getAll();
      setPlots(res.data);
    } catch (error) {
      console.error('加载地块数据失败:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analysis') {
        const [analysisRes, compareRes] = await Promise.all([
          harvestAPI.getYieldInputAnalysis(filters.year ? parseInt(filters.year) : undefined),
          harvestAPI.getVarietyCompare(filters.year ? parseInt(filters.year) : undefined),
        ]);
        setYieldAnalysis(analysisRes.data);
        setVarietyCompare(compareRes.data);
      }
    } catch (error) {
      console.error('加载分析数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries({
          plot_id: filters.plot_id,
          start_date: filters.start_date,
          end_date: filters.end_date,
        }).filter(([_, v]) => v !== '')
      );
      const res = await harvestAPI.getAll(params);
      setHarvestRecords(res.data);
    } catch (error) {
      console.error('加载收获记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item?: any) => {
    setEditingItem(item || null);
    if (item) {
      setFormData({
        plot_id: item.plot_id,
        harvest_date: item.harvest_date,
        crop_variety: item.crop_variety,
        yield_kg: item.yield_kg?.toString() || '',
        quality_grade: item.quality_grade,
        unit_price: item.unit_price?.toString() || '',
        total_revenue: item.total_revenue?.toString() || '',
        notes: item.notes || '',
      });
    } else {
      setFormData({
        plot_id: '',
        harvest_date: '',
        crop_variety: '',
        yield_kg: '',
        quality_grade: 'grade1',
        unit_price: '',
        total_revenue: '',
        notes: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        yield_kg: formData.yield_kg ? parseFloat(formData.yield_kg) : undefined,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : undefined,
        total_revenue: formData.total_revenue ? parseFloat(formData.total_revenue) : undefined,
      };

      if (editingItem) {
        await harvestAPI.update(editingItem.id, data);
      } else {
        await harvestAPI.create(data);
      }
      setModalOpen(false);
      loadRecords();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这条收获记录吗？')) {
      try {
        await harvestAPI.delete(id);
        loadRecords();
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败');
      }
    }
  };

  const getQualityLabel = (grade: string) => {
    const q = qualityGrades.find(g => g.value === grade);
    return q ? q.label : grade;
  };

  const getQualityBadgeClass = (grade: string) => {
    const classes: Record<string, string> = {
      premium: 'badge-gold',
      grade1: 'badge-green',
      grade2: 'badge-blue',
      grade3: 'badge-gray',
    };
    return classes[grade] || 'badge-gray';
  };

  const renderRecords = () => (
    <div>
      <div className="filter-bar">
        <div className="filter-item">
          <label>地块</label>
          <select
            value={filters.plot_id}
            onChange={(e) => setFilters({ ...filters, plot_id: e.target.value })}
          >
            <option value="">全部地块</option>
            {plots.map((p: any) => (
              <option key={p.id} value={p.id}>{p.plot_number} - {p.area}亩</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label>开始日期</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          />
        </div>
        <div className="filter-item">
          <label>结束日期</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          />
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + 添加收获记录
        </button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>地块编号</th>
              <th>收获日期</th>
              <th>作物品种</th>
              <th>产量(kg)</th>
              <th>品质等级</th>
              <th>单价(元/kg)</th>
              <th>总收入(元)</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {harvestRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">暂无数据</td>
              </tr>
            ) : (
              harvestRecords.map((record: any) => (
                <tr key={record.id}>
                  <td>{record.plot_number}</td>
                  <td>{record.harvest_date}</td>
                  <td>{record.crop_variety}</td>
                  <td>{record.yield_kg?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${getQualityBadgeClass(record.quality_grade)}`}>
                      {getQualityLabel(record.quality_grade)}
                    </span>
                  </td>
                  <td>{record.unit_price?.toFixed(2)}</td>
                  <td>{record.total_revenue?.toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => openModal(record)}>编辑</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(record.id)}>删除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderAnalysis = () => (
    <div>
      <div className="filter-bar">
        <div className="filter-item">
          <label>统计年份</label>
          <input
            type="number"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            min="2000"
            max="2100"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="analysis-grid">
          <div className="chart-card">
            <h3>亩均投入成本 vs 亩均产量</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={yieldAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plot_number" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="input_cost_per_mu" name="亩均投入(元)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="yield_per_mu" name="亩均产量(kg)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>亩均利润分析</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={yieldAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plot_number" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit_per_mu" name="亩均利润(元)" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>不同品种产量对比</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={varietyCompare}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="crop_variety" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg_yield_per_mu" name="平均亩产(kg)" fill="#FF9800" />
                <Bar dataKey="total_yield" name="总产量(kg)" fill="#2196F3" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>品种收入占比</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={varietyCompare}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ crop_variety, percentage }) => `${crop_variety}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total_revenue"
                  nameKey="crop_variety"
                >
                  {varietyCompare.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card full-width">
            <h3>投入产出趋势</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={yieldAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plot_number" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="input_cost_per_mu" name="亩均投入(元)" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="revenue_per_mu" name="亩均收入(元)" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="profit_per_mu" name="亩均利润(元)" stroke="#FF9800" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container">
      <div className="tabs">
        <button
          className={activeTab === 'records' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('records')}
        >
          收获记录
        </button>
        <button
          className={activeTab === 'analysis' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('analysis')}
        >
          产量分析
        </button>
      </div>

      {activeTab === 'records' && renderRecords()}
      {activeTab === 'analysis' && renderAnalysis()}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? '编辑收获记录' : '添加收获记录'}>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label>地块 *</label>
              <select
                value={formData.plot_id}
                onChange={(e) => setFormData({ ...formData, plot_id: e.target.value })}
                required
              >
                <option value="">请选择地块</option>
                {plots.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.plot_number} - {p.area}亩</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>收获日期 *</label>
              <input
                type="date"
                value={formData.harvest_date}
                onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>作物品种 *</label>
              <input
                type="text"
                value={formData.crop_variety}
                onChange={(e) => setFormData({ ...formData, crop_variety: e.target.value })}
                placeholder="如：小麦-济麦22"
                required
              />
            </div>
            <div className="form-group">
              <label>品质等级</label>
              <select
                value={formData.quality_grade}
                onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value })}
              >
                {qualityGrades.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>产量(kg) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.yield_kg}
                onChange={(e) => setFormData({ ...formData, yield_kg: e.target.value })}
                placeholder="请输入产量"
                required
              />
            </div>
            <div className="form-group">
              <label>单价(元/kg)</label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                placeholder="请输入单价"
              />
            </div>
          </div>

          <div className="form-group">
            <label>总收入(元)</label>
            <input
              type="number"
              step="0.01"
              value={formData.total_revenue}
              onChange={(e) => setFormData({ ...formData, total_revenue: e.target.value })}
              placeholder="请输入总收入"
            />
          </div>

          <div className="form-group">
            <label>备注</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="收获情况、天气等备注信息"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button type="submit" className="btn btn-primary">{editingItem ? '更新' : '添加'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Harvest;
