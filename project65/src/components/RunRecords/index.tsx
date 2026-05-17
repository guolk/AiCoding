import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RunRecord } from '../../types';
import { formatDate, formatDuration, formatPace, getRunTypeLabel, getRunTypeColor } from '../../utils/helpers';
import RunForm from './RunForm';
import RunDetail from './RunDetail';

const RunRecordsModule: React.FC = () => {
  const { state, dispatch } = useApp();
  const { runRecords } = state;
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RunRecord | undefined>();
  const [selectedRecord, setSelectedRecord] = useState<RunRecord | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  
  console.log('RunRecordsModule 渲染, showForm:', showForm);
  
  const filteredRecords = filterType === 'all'
    ? runRecords
    : runRecords.filter(r => r.type === filterType);
  
  const totalDistance = runRecords.reduce((sum, r) => sum + r.distance, 0);
  const totalDuration = runRecords.reduce((sum, r) => sum + r.duration, 0);
  const avgPace = totalDistance > 0 ? (totalDuration / 60) / totalDistance : 0;
  
  const handleEdit = (record: RunRecord) => {
    setEditingRecord(record);
    setShowForm(true);
    setSelectedRecord(null);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条跑步记录吗？')) {
      dispatch({ type: 'DELETE_RUN_RECORD', payload: id });
      setSelectedRecord(null);
    }
  };
  
  const closeForm = () => {
    setShowForm(false);
    setEditingRecord(undefined);
  };
  
  const runTypes = [
    { value: 'all', label: '全部' },
    { value: 'easy', label: '轻松跑' },
    { value: 'tempo', label: '节奏跑' },
    { value: 'interval', label: '间歇训练' },
    { value: 'long', label: '长距离慢跑' },
    { value: 'race', label: '比赛' }
  ];
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">跑步记录</h1>
        <p className="page-subtitle">记录和管理您的每一次跑步</p>
      </div>
      
      <div className="grid grid-4 gap-md mb-lg">
        <div className="stat-card">
          <div className="stat-value">{runRecords.length}</div>
          <div className="stat-label">总次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalDistance.toFixed(0)}</div>
          <div className="stat-label">总公里</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatDuration(totalDuration)}</div>
          <div className="stat-label">总时间</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgPace ? formatPace(avgPace) : '--'}</div>
          <div className="stat-label">平均配速</div>
        </div>
      </div>
      
      <div className="flex-between mb-md">
        <div className="flex gap-sm">
          {runTypes.map(type => (
            <button
              key={type.value}
              className={`btn btn-sm ${filterType === type.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>
        <div className="flex gap-sm">
          {showForm && <span className="text-sm text-success">📝 表单已打开</span>}
          <button className="btn btn-primary" onClick={() => {
            console.log('点击添加记录按钮，当前状态:', showForm);
            setShowForm(true);
          }}>
            + 添加记录
          </button>
        </div>
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
        }} onClick={closeForm}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative',
            zIndex: 100000
          }} onClick={e => e.stopPropagation()}>
            <RunForm
              onClose={closeForm}
              editRecord={editingRecord}
            />
          </div>
        </div>
      )}
      
      {filteredRecords.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏃</div>
          <div className="empty-title">还没有跑步记录</div>
          <div className="empty-description">点击上方按钮添加您的第一条跑步记录</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>日期</th>
                <th>类型</th>
                <th>距离</th>
                <th>时间</th>
                <th>配速</th>
                <th>心率</th>
                <th>感受</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id} onClick={() => setSelectedRecord(record)} style={{ cursor: 'pointer' }}>
                  <td>{formatDate(record.date, 'MM-dd')}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: getRunTypeColor(record.type) + '20',
                        color: getRunTypeColor(record.type)
                      }}
                    >
                      {getRunTypeLabel(record.type)}
                    </span>
                  </td>
                  <td className="font-bold">{record.distance.toFixed(1)} km</td>
                  <td>{formatDuration(record.duration)}</td>
                  <td>{formatPace(record.pace)}</td>
                  <td>{record.avgHeartRate || '--'}</td>
                  <td>
                    {record.feelings === 'excellent' && '💪'}
                    {record.feelings === 'good' && '😊'}
                    {record.feelings === 'normal' && '😐'}
                    {record.feelings === 'tired' && '😫'}
                    {record.feelings === 'pain' && '😣'}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={e => { e.stopPropagation(); handleEdit(record); }}
                    >
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      

      
      {selectedRecord && (
        <RunDetail
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onEdit={() => handleEdit(selectedRecord)}
          onDelete={() => handleDelete(selectedRecord.id)}
        />
      )}
    </div>
  );
};

export default RunRecordsModule;
