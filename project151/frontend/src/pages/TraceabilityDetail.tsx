import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { traceabilityAPI } from '../api';
import QRCode from 'qrcode.react';

const TraceabilityDetail: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [traceData, setTraceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadTraceData();
  }, [code]);

  const loadTraceData = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await traceabilityAPI.get(code);
      setTraceData(res.data);
    } catch (error) {
      console.error('加载追溯数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQualityLabel = (grade: string) => {
    const grades: Record<string, string> = {
      premium: '特级',
      grade1: '一级',
      grade2: '二级',
      grade3: '三级',
    };
    return grades[grade] || grade;
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

  const getOperationTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      '整地': '🔧',
      '播种': '🌱',
      '施肥': '💧',
      '灌溉': '💦',
      '病虫害防治': '🐛',
      '中耕': '🔨',
      '收获': '🌾',
      '其他': '📝',
    };
    return icons[type] || '📝';
  };

  const getPestTypeLabel = (type: string) => {
    return type === 'pest' ? '虫害' : '病害';
  };

  const getPestTypeBadgeClass = (type: string) => {
    return type === 'pest' ? 'badge-red' : 'badge-yellow';
  };

  const getMeasureEffectLabel = (effect: string) => {
    const effects: Record<string, string> = {
      excellent: '优秀',
      good: '良好',
      average: '一般',
      poor: '较差',
    };
    return effects[effect] || effect;
  };

  const getMeasureEffectBadgeClass = (effect: string) => {
    const classes: Record<string, string> = {
      excellent: 'badge-green',
      good: 'badge-blue',
      average: 'badge-yellow',
      poor: 'badge-red',
    };
    return classes[effect] || 'badge-gray';
  };

  const getTraceUrl = () => {
    return `${window.location.origin}/traceability/${code}`;
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!traceData) {
    return (
      <div className="error-page">
        <h2>❌ 追溯码不存在</h2>
        <p>请检查追溯码是否正确</p>
        <button className="btn btn-primary" onClick={() => navigate('/traceability')}>
          返回追溯列表
        </button>
      </div>
    );
  }

  const { traceability_code, harvest_record, soil_tests, farming_operations, pest_records } = traceData;

  return (
    <div className="traceability-detail">
      <div className="detail-header">
        <button className="btn btn-secondary" onClick={() => navigate('/traceability')}>
          ← 返回列表
        </button>
        <h2>农产品全程追溯</h2>
      </div>

      <div className="traceability-overview">
        <div className="overview-main">
          <div className="product-title">
            <span className="product-emoji">🌾</span>
            <h1>{traceability_code.product_info?.product_name || harvest_record.planting_record?.crop_variety}</h1>
          </div>
          <div className="product-meta">
            <div className="meta-item">
              <span className="meta-label">追溯码</span>
              <span className="meta-value code">{traceability_code.code}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">批次号</span>
              <span className="meta-value">{traceability_code.batch_number}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">生成时间</span>
              <span className="meta-value">{traceability_code.generated_at}</span>
            </div>
          </div>
        </div>
        <div className="overview-qr">
          <QRCode
            value={getTraceUrl()}
            size={120}
            level="H"
            includeMargin={true}
          />
          <p className="qr-tip">扫描二维码查看追溯信息</p>
        </div>
      </div>

      <div className="timeline-nav">
        <button
          className={activeSection === 'overview' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('overview')}
        >
          📋 基本信息
        </button>
        <button
          className={activeSection === 'soil' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('soil')}
        >
          🌍 土壤检测
        </button>
        <button
          className={activeSection === 'farming' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('farming')}
        >
          🚜 农事操作
        </button>
        <button
          className={activeSection === 'pest' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('pest')}
        >
          🐛 病虫害防治
        </button>
        <button
          className={activeSection === 'harvest' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('harvest')}
        >
          🌾 收获信息
        </button>
      </div>

      <div className="detail-content">
        {activeSection === 'overview' && (
          <div className="section-card">
            <h3>🌱 地块信息</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">地块编号</span>
                <span className="info-value">{harvest_record.plot?.plot_number}</span>
              </div>
              <div className="info-item">
                <span className="info-label">面积</span>
                <span className="info-value">{harvest_record.plot?.area} 亩</span>
              </div>
              <div className="info-item">
                <span className="info-label">土壤类型</span>
                <span className="info-value">{harvest_record.plot?.soil_type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">前茬作物</span>
                <span className="info-value">{harvest_record.plot?.previous_crop}</span>
              </div>
              <div className="info-item">
                <span className="info-label">灌溉方式</span>
                <span className="info-value">{harvest_record.plot?.irrigation_method}</span>
              </div>
              <div className="info-item">
                <span className="info-label">位置</span>
                <span className="info-value">{harvest_record.plot?.location || '-'}</span>
              </div>
            </div>

            <h3 style={{ marginTop: '24px' }}>🌾 种植信息</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">作物品种</span>
                <span className="info-value">{harvest_record.planting_record?.crop_variety}</span>
              </div>
              <div className="info-item">
                <span className="info-label">播种时间</span>
                <span className="info-value">{harvest_record.planting_record?.sowing_date}</span>
              </div>
              <div className="info-item">
                <span className="info-label">预计收获</span>
                <span className="info-value">{harvest_record.planting_record?.harvest_date}</span>
              </div>
              <div className="info-item">
                <span className="info-label">种植年份</span>
                <span className="info-value">{harvest_record.planting_record?.year}</span>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'soil' && (
          <div className="section-card">
            <h3>🌍 土壤检测记录</h3>
            {soil_tests.length === 0 ? (
              <div className="no-data">暂无土壤检测记录</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>检测日期</th>
                    <th>pH值</th>
                    <th>有机质(g/kg)</th>
                    <th>全氮(g/kg)</th>
                    <th>有效磷(mg/kg)</th>
                    <th>速效钾(mg/kg)</th>
                    <th>检测机构</th>
                  </tr>
                </thead>
                <tbody>
                  {soil_tests.map((test: any) => (
                    <tr key={test.id}>
                      <td>{test.test_date}</td>
                      <td>{test.ph}</td>
                      <td>{test.organic_matter}</td>
                      <td>{test.total_nitrogen}</td>
                      <td>{test.available_phosphorus}</td>
                      <td>{test.available_potassium}</td>
                      <td>{test.testing_agency || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeSection === 'farming' && (
          <div className="section-card">
            <h3>🚜 农事操作记录</h3>
            {farming_operations.length === 0 ? (
              <div className="no-data">暂无农事操作记录</div>
            ) : (
              <div className="timeline">
                {farming_operations.map((op: any, index: number) => (
                  <div className="timeline-item" key={op.id}>
                    <div className="timeline-marker">
                      <span className="timeline-icon">{getOperationTypeIcon(op.operation_type)}</span>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{op.operation_type}</h4>
                        <span className="timeline-date">{op.operation_date}</span>
                      </div>
                      <div className="timeline-details">
                        <p><strong>作业面积：</strong>{op.operation_area} 亩</p>
                        <p><strong>操作人：</strong>{op.operator}</p>
                        {op.cost > 0 && <p><strong>费用：</strong>{op.cost} 元</p>}
                        {op.pesticide_name && (
                          <p>
                            <strong>使用农药：</strong>
                            {op.pesticide_name} ({op.pesticide_brand}) - {op.pesticide_ingredient}
                            {op.pesticide_quantity > 0 && `，用量：${op.pesticide_quantity} kg`}
                          </p>
                        )}
                        {op.fertilizer_name && (
                          <p>
                            <strong>使用化肥：</strong>
                            {op.fertilizer_name} ({op.fertilizer_brand}) - {op.fertilizer_ingredient}
                            {op.fertilizer_quantity > 0 && `，用量：${op.fertilizer_quantity} kg`}
                          </p>
                        )}
                        {op.machinery_name && (
                          <p>
                            <strong>使用机械：</strong>
                            {op.machinery_name} ({op.machinery_model})
                            {op.operation_hours > 0 && `，作业时长：${op.operation_hours} 小时`}
                            {op.fuel_consumption > 0 && `，油耗：${op.fuel_consumption} L`}
                          </p>
                        )}
                        {op.notes && <p><strong>备注：</strong>{op.notes}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'pest' && (
          <div className="section-card">
            <h3>🐛 病虫害防治记录</h3>
            {pest_records.length === 0 ? (
              <div className="no-data">暂无病虫害记录</div>
            ) : (
              <div className="pest-records">
                {pest_records.map((record: any) => (
                  <div className="pest-record-card" key={record.id}>
                    <div className="pest-record-header">
                      <div>
                        <span className={`badge ${getPestTypeBadgeClass(record.pest_type)}`}>
                          {getPestTypeLabel(record.pest_type)}
                        </span>
                        <h4>{record.pest_name}</h4>
                      </div>
                      <div className="pest-record-date">
                        发现时间：{record.discovery_date}
                      </div>
                    </div>
                    <div className="pest-record-body">
                      <p><strong>症状描述：</strong>{record.symptoms}</p>
                      <p><strong>发生面积：</strong>{record.affected_area} 亩</p>
                      <p><strong>严重程度：</strong>{record.severity}</p>
                      {record.notes && <p><strong>备注：</strong>{record.notes}</p>}
                    </div>
                    {record.control_measures && record.control_measures.length > 0 && (
                      <div className="control-measures">
                        <h5>防治措施</h5>
                        {record.control_measures.map((measure: any) => (
                          <div className="measure-item" key={measure.id}>
                            <div className="measure-header">
                              <span className="measure-date">{measure.measure_date}</span>
                              <span className={`badge ${getMeasureEffectBadgeClass(measure.effect)}`}>
                                效果：{getMeasureEffectLabel(measure.effect)}
                              </span>
                            </div>
                            <p><strong>措施类型：</strong>{measure.measure_type}</p>
                            <p><strong>具体方法：</strong>{measure.description}</p>
                            {measure.pesticide_name && (
                              <p><strong>使用农药：</strong>{measure.pesticide_name}，用量：{measure.quantity} kg</p>
                            )}
                            {measure.notes && <p><strong>备注：</strong>{measure.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'harvest' && (
          <div className="section-card">
            <h3>🌾 收获信息</h3>
            <div className="harvest-summary">
              <div className="summary-card">
                <div className="summary-label">收获日期</div>
                <div className="summary-value">{harvest_record.harvest_date}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">总产量</div>
                <div className="summary-value highlight">{harvest_record.yield?.toLocaleString()} kg</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">品质等级</div>
                <div className="summary-value">
                  <span className={`badge ${getQualityBadgeClass(harvest_record.quality_grade)}`}>
                    {getQualityLabel(harvest_record.quality_grade)}
                  </span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-label">单价</div>
                <div className="summary-value">¥ {harvest_record.unit_price?.toFixed(2)} / kg</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">总收入</div>
                <div className="summary-value highlight">¥ {harvest_record.total_revenue?.toLocaleString()}</div>
              </div>
            </div>
            {harvest_record.notes && (
              <div className="harvest-notes">
                <h4>备注</h4>
                <p>{harvest_record.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="traceability-footer">
        <p>📋 本产品所有数据均来自真实农事记录，确保农产品安全可追溯</p>
      </div>
    </div>
  );
};

export default TraceabilityDetail;
