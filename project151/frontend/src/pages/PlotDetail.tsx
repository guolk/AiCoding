import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { plotsAPI } from '../api';
import Modal from '../components/Modal';

const PlotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plot, setPlot] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('planting');
  const [loading, setLoading] = useState(true);
  
  const [plantingModalOpen, setPlantingModalOpen] = useState(false);
  const [soilTestModalOpen, setSoilTestModalOpen] = useState(false);
  const [editingPlanting, setEditingPlanting] = useState<any>(null);
  const [editingSoilTest, setEditingSoilTest] = useState<any>(null);
  
  const [plantingForm, setPlantingForm] = useState({
    crop_variety: '',
    sowing_date: '',
    harvest_date: '',
    yield: '',
    year: new Date().getFullYear().toString(),
    notes: '',
  });
  
  const [soilTestForm, setSoilTestForm] = useState({
    test_date: '',
    ph: '',
    organic_matter: '',
    total_nitrogen: '',
    available_phosphorus: '',
    available_potassium: '',
    testing_agency: '',
    notes: '',
  });

  useEffect(() => {
    if (id) loadPlotDetail();
  }, [id]);

  const loadPlotDetail = async () => {
    try {
      const res = await plotsAPI.get(id!);
      setPlot(res.data);
    } catch (error) {
      console.error('加载地块详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlantingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...plantingForm,
        year: parseInt(plantingForm.year),
        yield: plantingForm.yield ? parseFloat(plantingForm.yield) : undefined,
      };
      if (editingPlanting) {
        await plotsAPI.updatePlantingRecord(editingPlanting.id, data);
      } else {
        await plotsAPI.createPlantingRecord(id!, data);
      }
      setPlantingModalOpen(false);
      resetPlantingForm();
      loadPlotDetail();
    } catch (error: any) {
      alert(error.response?.data?.error || '保存失败');
    }
  };

  const handleSoilTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...soilTestForm,
        ph: soilTestForm.ph ? parseFloat(soilTestForm.ph) : undefined,
        organic_matter: soilTestForm.organic_matter ? parseFloat(soilTestForm.organic_matter) : undefined,
        total_nitrogen: soilTestForm.total_nitrogen ? parseFloat(soilTestForm.total_nitrogen) : undefined,
        available_phosphorus: soilTestForm.available_phosphorus ? parseFloat(soilTestForm.available_phosphorus) : undefined,
        available_potassium: soilTestForm.available_potassium ? parseFloat(soilTestForm.available_potassium) : undefined,
      };
      if (editingSoilTest) {
        await plotsAPI.updateSoilTest(editingSoilTest.id, data);
      } else {
        await plotsAPI.createSoilTest(id!, data);
      }
      setSoilTestModalOpen(false);
      resetSoilTestForm();
      loadPlotDetail();
    } catch (error: any) {
      alert(error.response?.data?.error || '保存失败');
    }
  };

  const handleDeletePlanting = async (recordId: string) => {
    if (!confirm('确定要删除这条种植记录吗？')) return;
    try {
      await plotsAPI.deletePlantingRecord(recordId);
      loadPlotDetail();
    } catch (error: any) {
      alert(error.response?.data?.error || '删除失败');
    }
  };

  const handleDeleteSoilTest = async (testId: string) => {
    if (!confirm('确定要删除这条土壤检测记录吗？')) return;
    try {
      await plotsAPI.deleteSoilTest(testId);
      loadPlotDetail();
    } catch (error: any) {
      alert(error.response?.data?.error || '删除失败');
    }
  };

  const resetPlantingForm = () => {
    setEditingPlanting(null);
    setPlantingForm({
      crop_variety: '',
      sowing_date: '',
      harvest_date: '',
      yield: '',
      year: new Date().getFullYear().toString(),
      notes: '',
    });
  };

  const resetSoilTestForm = () => {
    setEditingSoilTest(null);
    setSoilTestForm({
      test_date: '',
      ph: '',
      organic_matter: '',
      total_nitrogen: '',
      available_phosphorus: '',
      available_potassium: '',
      testing_agency: '',
      notes: '',
    });
  };

  const editPlanting = (record: any) => {
    setEditingPlanting(record);
    setPlantingForm({
      crop_variety: record.crop_variety,
      sowing_date: record.sowing_date,
      harvest_date: record.harvest_date || '',
      yield: record.yield?.toString() || '',
      year: record.year.toString(),
      notes: record.notes || '',
    });
    setPlantingModalOpen(true);
  };

  const editSoilTest = (test: any) => {
    setEditingSoilTest(test);
    setSoilTestForm({
      test_date: test.test_date,
      ph: test.ph?.toString() || '',
      organic_matter: test.organic_matter?.toString() || '',
      total_nitrogen: test.total_nitrogen?.toString() || '',
      available_phosphorus: test.available_phosphorus?.toString() || '',
      available_potassium: test.available_potassium?.toString() || '',
      testing_agency: test.testing_agency || '',
      notes: test.notes || '',
    });
    setSoilTestModalOpen(true);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>;
  }

  if (!plot) {
    return <div className="empty-state"><div className="icon">❌</div><div>地块不存在</div></div>;
  }

  return (
    <div>
      <button
        className="btn btn-secondary"
        style={{ marginBottom: '20px' }}
        onClick={() => navigate('/plots')}
      >
        ← 返回列表
      </button>

      <div className="card">
        <div className="card-header">
          <h2>地块档案 - {plot.plot_number}</h2>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <label>地块编号</label>
            <span>{plot.plot_number}</span>
          </div>
          <div className="detail-item">
            <label>面积</label>
            <span>{plot.area} 亩</span>
          </div>
          <div className="detail-item">
            <label>土壤类型</label>
            <span>{plot.soil_type || '-'}</span>
          </div>
          <div className="detail-item">
            <label>前茬作物</label>
            <span>{plot.previous_crop || '-'}</span>
          </div>
          <div className="detail-item">
            <label>灌溉方式</label>
            <span>{plot.irrigation_method || '-'}</span>
          </div>
          <div className="detail-item">
            <label>位置</label>
            <span>{plot.location || '-'}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'planting' ? 'active' : ''}`}
            onClick={() => setActiveTab('planting')}
          >
            历年种植记录
          </button>
          <button
            className={`tab ${activeTab === 'soil' ? 'active' : ''}`}
            onClick={() => setActiveTab('soil')}
          >
            土壤检测记录
          </button>
        </div>

        {activeTab === 'planting' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                className="btn btn-primary"
                onClick={() => { resetPlantingForm(); setPlantingModalOpen(true); }}
              >
                + 新增种植记录
              </button>
            </div>
            {plot.planting_records?.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📝</div>
                <div>暂无种植记录</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>年份</th>
                    <th>作物品种</th>
                    <th>播种时间</th>
                    <th>收获时间</th>
                    <th>产量(公斤)</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {plot.planting_records?.map((r: any) => (
                    <tr key={r.id}>
                      <td>{r.year}</td>
                      <td><span className="badge badge-success">{r.crop_variety}</span></td>
                      <td>{r.sowing_date}</td>
                      <td>{r.harvest_date || '-'}</td>
                      <td>{r.yield?.toLocaleString() || '-'}</td>
                      <td>{r.notes || '-'}</td>
                      <td className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => editPlanting(r)}>编辑</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeletePlanting(r.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'soil' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                className="btn btn-primary"
                onClick={() => { resetSoilTestForm(); setSoilTestModalOpen(true); }}
              >
                + 新增土壤检测
              </button>
            </div>
            {plot.soil_tests?.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🧪</div>
                <div>暂无土壤检测记录</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>检测日期</th>
                    <th>pH值</th>
                    <th>有机质(g/kg)</th>
                    <th>全氮(g/kg)</th>
                    <th>有效磷(mg/kg)</th>
                    <th>速效钾(mg/kg)</th>
                    <th>检测机构</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {plot.soil_tests?.map((t: any) => (
                    <tr key={t.id}>
                      <td>{t.test_date}</td>
                      <td>{t.ph || '-'}</td>
                      <td>{t.organic_matter || '-'}</td>
                      <td>{t.total_nitrogen || '-'}</td>
                      <td>{t.available_phosphorus || '-'}</td>
                      <td>{t.available_potassium || '-'}</td>
                      <td>{t.testing_agency || '-'}</td>
                      <td>{t.notes || '-'}</td>
                      <td className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => editSoilTest(t)}>编辑</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSoilTest(t.id)}>删除</button>
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
        isOpen={plantingModalOpen}
        onClose={() => setPlantingModalOpen(false)}
        title={editingPlanting ? '编辑种植记录' : '新增种植记录'}
      >
        <form onSubmit={handlePlantingSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>作物品种 *</label>
              <input
                type="text"
                value={plantingForm.crop_variety}
                onChange={e => setPlantingForm({ ...plantingForm, crop_variety: e.target.value })}
                required
                placeholder="如: 西红柿-粉丽人"
              />
            </div>
            <div className="form-group">
              <label>年份 *</label>
              <input
                type="number"
                value={plantingForm.year}
                onChange={e => setPlantingForm({ ...plantingForm, year: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>播种时间 *</label>
              <input
                type="date"
                value={plantingForm.sowing_date}
                onChange={e => setPlantingForm({ ...plantingForm, sowing_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>收获时间</label>
              <input
                type="date"
                value={plantingForm.harvest_date}
                onChange={e => setPlantingForm({ ...plantingForm, harvest_date: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>产量(公斤)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={plantingForm.yield}
                onChange={e => setPlantingForm({ ...plantingForm, yield: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>备注</label>
            <textarea
              rows={3}
              value={plantingForm.notes}
              onChange={e => setPlantingForm({ ...plantingForm, notes: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setPlantingModalOpen(false)}>取消</button>
            <button type="submit" className="btn btn-primary">{editingPlanting ? '保存修改' : '创建'}</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={soilTestModalOpen}
        onClose={() => setSoilTestModalOpen(false)}
        title={editingSoilTest ? '编辑土壤检测' : '新增土壤检测'}
      >
        <form onSubmit={handleSoilTestSubmit}>
          <div className="form-group">
            <label>检测日期 *</label>
            <input
              type="date"
              value={soilTestForm.test_date}
              onChange={e => setSoilTestForm({ ...soilTestForm, test_date: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>pH值</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                value={soilTestForm.ph}
                onChange={e => setSoilTestForm({ ...soilTestForm, ph: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>有机质(g/kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={soilTestForm.organic_matter}
                onChange={e => setSoilTestForm({ ...soilTestForm, organic_matter: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>全氮(g/kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={soilTestForm.total_nitrogen}
                onChange={e => setSoilTestForm({ ...soilTestForm, total_nitrogen: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>有效磷(mg/kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={soilTestForm.available_phosphorus}
                onChange={e => setSoilTestForm({ ...soilTestForm, available_phosphorus: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>速效钾(mg/kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={soilTestForm.available_potassium}
                onChange={e => setSoilTestForm({ ...soilTestForm, available_potassium: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>检测机构</label>
              <input
                type="text"
                value={soilTestForm.testing_agency}
                onChange={e => setSoilTestForm({ ...soilTestForm, testing_agency: e.target.value })}
                placeholder="如：县农业检测中心"
              />
            </div>
          </div>
          <div className="form-group">
            <label>备注</label>
            <textarea
              rows={3}
              value={soilTestForm.notes}
              onChange={e => setSoilTestForm({ ...soilTestForm, notes: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setSoilTestModalOpen(false)}>取消</button>
            <button type="submit" className="btn btn-primary">{editingSoilTest ? '保存修改' : '创建'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlotDetail;
