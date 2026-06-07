import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { traceabilityAPI, plotsAPI, harvestAPI } from '../api';
import Modal from '../components/Modal';
import QRCode from 'qrcode.react';

const Traceability: React.FC = () => {
  const navigate = useNavigate();
  const [codes, setCodes] = useState<any[]>([]);
  const [plots, setPlots] = useState<any[]>([]);
  const [harvests, setHarvests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    plot_id: '',
    start_date: '',
    end_date: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadPlotsAndHarvests();
  }, []);

  useEffect(() => {
    loadCodes();
  }, [filters]);

  const loadPlotsAndHarvests = async () => {
    try {
      const [plotsRes, harvestsRes] = await Promise.all([
        plotsAPI.getAll(),
        harvestAPI.getAll(),
      ]);
      setPlots(plotsRes.data);
      setHarvests(harvestsRes.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const loadCodes = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const res = await traceabilityAPI.getAll(params);
      setCodes(res.data);
    } catch (error) {
      console.error('加载追溯码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setFormData({
      harvest_id: '',
      product_name: '',
      product_description: '',
      batch_number: '',
      production_date: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await traceabilityAPI.create(formData);
      setModalOpen(false);
      loadCodes();
    } catch (error) {
      console.error('生成追溯码失败:', error);
      alert('生成失败');
    }
  };

  const handleDelete = async (code: string) => {
    if (confirm('确定要删除这个追溯码吗？')) {
      try {
        await traceabilityAPI.delete(code);
        loadCodes();
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败');
      }
    }
  };

  const showQRCode = (item: any) => {
    setSelectedCode(item);
    setQrModalOpen(true);
  };

  const viewDetail = (code: string) => {
    navigate(`/traceability/${code}`);
  };

  const getTraceUrl = (code: string) => {
    return `${window.location.origin}/traceability/${code}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    });
  };

  return (
    <div className="page-container">
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
        <button className="btn btn-primary" onClick={openModal}>
          + 生成追溯码
        </button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="traceability-grid">
          {codes.length === 0 ? (
            <div className="no-data">暂无追溯码，请点击上方按钮生成</div>
          ) : (
            codes.map((item: any) => (
              <div className="traceability-card" key={item.code}>
                <div className="traceability-header">
                  <div className="traceability-title">{item.product_name}</div>
                  <div className="traceability-batch">批次: {item.batch_number}</div>
                </div>
                <div className="traceability-body">
                  <div className="traceability-info">
                    <div className="info-row">
                      <span className="info-label">追溯码</span>
                      <span className="info-value code">{item.code}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">地块</span>
                      <span className="info-value">{item.plot_number}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">作物品种</span>
                      <span className="info-value">{item.crop_variety}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">生产日期</span>
                      <span className="info-value">{item.production_date}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">产量</span>
                      <span className="info-value">{item.yield_kg?.toLocaleString()} kg</span>
                    </div>
                  </div>
                  <div className="traceability-qr">
                    <QRCode
                      value={getTraceUrl(item.code)}
                      size={100}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                </div>
                <div className="traceability-actions">
                  <button className="btn btn-sm btn-primary" onClick={() => viewDetail(item.code)}>
                    查看详情
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => showQRCode(item)}>
                    二维码
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => copyToClipboard(getTraceUrl(item.code))}>
                    复制链接
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.code)}>
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="生成农产品追溯码">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>关联收获记录 *</label>
            <select
              value={formData.harvest_id}
              onChange={(e) => {
                const harvest = harvests.find((h: any) => h.id === e.target.value);
                setFormData({
                  ...formData,
                  harvest_id: e.target.value,
                  product_name: harvest?.crop_variety || '',
                  production_date: harvest?.harvest_date || '',
                });
              }}
              required
            >
              <option value="">请选择收获记录</option>
              {harvests.map((h: any) => (
                <option key={h.id} value={h.id}>
                  {h.plot_number} - {h.crop_variety} - {h.harvest_date} - {h.yield_kg}kg
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>产品名称 *</label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="如：有机小麦"
                required
              />
            </div>
            <div className="form-group">
              <label>批次号 *</label>
              <input
                type="text"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                placeholder="如：20240601-001"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>生产日期 *</label>
            <input
              type="date"
              value={formData.production_date}
              onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>产品描述</label>
            <textarea
              value={formData.product_description}
              onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
              placeholder="产品特点、种植方式等描述"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button type="submit" className="btn btn-primary">生成追溯码</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="农产品追溯二维码">
        {selectedCode && (
          <div className="qr-modal">
            <div className="qr-display">
              <QRCode
                value={getTraceUrl(selectedCode.code)}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="qr-info">
              <h3>{selectedCode.product_name}</h3>
              <p><strong>追溯码：</strong>{selectedCode.code}</p>
              <p><strong>批次号：</strong>{selectedCode.batch_number}</p>
              <p><strong>生产日期：</strong>{selectedCode.production_date}</p>
              <p><strong>追溯链接：</strong></p>
              <div className="link-row">
                <input type="text" value={getTraceUrl(selectedCode.code)} readOnly />
                <button className="btn btn-sm btn-primary" onClick={() => copyToClipboard(getTraceUrl(selectedCode.code))}>
                  复制
                </button>
              </div>
            </div>
            <div className="qr-tip">
              <p>💡 提示：消费者扫描二维码即可查看该农产品从种植到收获的全程追溯信息</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Traceability;
