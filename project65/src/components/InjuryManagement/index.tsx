import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InjuryRecord } from '../../types';
import { formatDate } from '../../utils/helpers';
import InjuryForm from './InjuryForm';
import OverloadWarning from './OverloadWarning';

const InjuryManagementModule: React.FC = () => {
  const { state, dispatch } = useApp();
  const { injuries } = state;
  const [showForm, setShowForm] = useState(false);
  const [editingInjury, setEditingInjury] = useState<InjuryRecord | undefined>();
  const [selectedInjury, setSelectedInjury] = useState<InjuryRecord | null>(null);
  
  const activeInjuries = injuries.filter(i => i.active);
  const historyInjuries = injuries.filter(i => !i.active);
  
  const handleEdit = (injury: InjuryRecord) => {
    setEditingInjury(injury);
    setShowForm(true);
    setSelectedInjury(null);
  };
  
  const handleMarkRecovered = (injury: InjuryRecord) => {
    const updated: InjuryRecord = {
      ...injury,
      active: false,
      endDate: new Date().toISOString().split('T')[0]
    };
    dispatch({ type: 'UPDATE_INJURY', payload: updated });
    setSelectedInjury(null);
  };
  
  const severityColors = {
    mild: { bg: '#FFF8E1', text: '#FF8F00', label: '轻度' },
    moderate: { bg: '#FFE0B2', text: '#E65100', label: '中度' },
    severe: { bg: '#FFEBEE', text: '#C62828', label: '严重' }
  };
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">伤病管理</h1>
        <p className="page-subtitle">记录伤病、监测训练负荷，科学训练避免受伤</p>
      </div>
      
      {activeInjuries.length > 0 && (
        <div className="alert alert-danger mb-md">
          <strong>⚠️ 当前有 {activeInjuries.length} 个活跃伤病</strong>
          <div className="text-sm mt-sm">
            建议减少或暂停跑步训练，专注于康复和交叉训练
          </div>
        </div>
      )}
      
      <div className="grid grid-2 gap-md mb-lg">
        <div className="stat-card">
          <div className="stat-value text-danger">{activeInjuries.length}</div>
          <div className="stat-label">活跃伤病</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{historyInjuries.length}</div>
          <div className="stat-label">历史伤病</div>
        </div>
      </div>
      
      <OverloadWarning />
      
      <div className="card">
        <div className="flex-between mb-md">
          <div className="card-title" style={{ marginBottom: 0 }}>伤病记录</div>
          <div className="flex gap-sm">
            {showForm && <span className="text-sm text-success">📝 表单已打开</span>}
            <button className="btn btn-primary" onClick={() => {
              console.log('点击记录伤病按钮，当前状态:', showForm);
              setShowForm(true);
            }}>
              + 记录伤病
            </button>
          </div>
        </div>
        
        {injuries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🩹</div>
            <div className="empty-title">暂无伤病记录</div>
            <div className="empty-description">希望您永远健康跑步！如遇伤病，请在此记录</div>
          </div>
        ) : (
          <div className="grid grid-2 gap-md">
            <div>
              <h4 className="font-bold mb-md">当前伤病</h4>
              {activeInjuries.length === 0 ? (
                <div className="text-center py-lg text-secondary">
                  ✅ 没有活跃伤病，继续保持！
                </div>
              ) : (
                activeInjuries.map(injury => (
                  <div
                    key={injury.id}
                    className="card mb-md"
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      borderLeft: `4px solid ${severityColors[injury.severity].text}`
                    }}
                    onClick={() => setSelectedInjury(injury)}
                  >
                    <div className="flex-between">
                      <div>
                        <div className="font-bold">{injury.type}</div>
                        <div className="text-sm text-secondary">
                          开始于 {formatDate(injury.startDate, 'MM月dd日')}
                        </div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: severityColors[injury.severity].bg,
                          color: severityColors[injury.severity].text
                        }}
                      >
                        {severityColors[injury.severity].label}
                      </span>
                    </div>
                    <div className="text-sm mt-sm line-clamp-2">{injury.description}</div>
                  </div>
                ))
              )}
            </div>
            
            <div>
              <h4 className="font-bold mb-md">伤病历史</h4>
              {historyInjuries.length === 0 ? (
                <div className="text-center py-lg text-secondary">
                  暂无历史记录
                </div>
              ) : (
                historyInjuries.map(injury => (
                  <div
                    key={injury.id}
                    className="card mb-md"
                    style={{
                      padding: '12px',
                      cursor: 'pointer',
                      opacity: 0.7
                    }}
                    onClick={() => setSelectedInjury(injury)}
                  >
                    <div className="flex-between">
                      <div className="font-medium">{injury.type}</div>
                      <span className="text-sm text-success">✓ 已康复</span>
                    </div>
                    <div className="text-xs text-secondary">
                      {formatDate(injury.startDate, 'MM/dd')} - {injury.endDate ? formatDate(injury.endDate, 'MM/dd') : '至今'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {showForm && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => { setShowForm(false); setEditingInjury(undefined); }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative',
            zIndex: 100000
          }} onClick={e => e.stopPropagation()}>
            <InjuryForm
              onClose={() => { setShowForm(false); setEditingInjury(undefined); }}
              editInjury={editingInjury}
            />
          </div>
        </div>
      )}
      
      {selectedInjury && (
        <div className="modal-overlay" onClick={() => setSelectedInjury(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">伤病详情</div>
              <button className="modal-close" onClick={() => setSelectedInjury(null)}>×</button>
            </div>
            
            <div className="mb-md">
              <div className="flex-between mb-sm">
                <span className="font-bold text-lg">{selectedInjury.type}</span>
                <span
                  className="badge"
                  style={{
                    background: severityColors[selectedInjury.severity].bg,
                    color: severityColors[selectedInjury.severity].text
                  }}
                >
                  {severityColors[selectedInjury.severity].label}
                </span>
              </div>
              <div className="text-sm text-secondary">
                开始时间：{formatDate(selectedInjury.startDate, 'yyyy年MM月dd日')}
                {selectedInjury.endDate && ` · 康复时间：${formatDate(selectedInjury.endDate, 'yyyy年MM月dd日')}`}
                {selectedInjury.active && ' · 恢复中'}
              </div>
            </div>
            
            {selectedInjury.description && (
              <div className="mb-md">
                <div className="text-sm text-secondary mb-sm">症状描述</div>
                <div>{selectedInjury.description}</div>
              </div>
            )}
            
            <div className="card" style={{ background: '#FFF8E1', padding: '16px' }}>
              <div className="font-bold mb-sm">💡 康复建议</div>
              <div className="text-sm" style={{ whiteSpace: 'pre-line' }}>
                {selectedInjury.recommendations}
              </div>
            </div>
            
            <div className="flex justify-end gap-sm mt-lg">
              {selectedInjury.active && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleMarkRecovered(selectedInjury)}
                >
                  标记为已康复
                </button>
              )}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleEdit(selectedInjury)}
              >
                编辑
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setSelectedInjury(null)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InjuryManagementModule;
