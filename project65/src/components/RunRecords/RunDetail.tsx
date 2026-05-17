import React from 'react';
import { RunRecord } from '../../types';
import { formatDate, formatDuration, formatPace, getRunTypeLabel, getRunTypeColor } from '../../utils/helpers';
import MapView from './MapView';

interface RunDetailProps {
  record: RunRecord;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const RunDetail: React.FC<RunDetailProps> = ({ record, onClose, onEdit, onDelete }) => {
  const feelingsMap: Record<string, { label: string; emoji: string }> = {
    excellent: { label: '非常好', emoji: '💪' },
    good: { label: '良好', emoji: '😊' },
    normal: { label: '一般', emoji: '😐' },
    tired: { label: '疲劳', emoji: '😫' },
    pain: { label: '有疼痛', emoji: '😣' }
  };
  
  const weatherMap: Record<string, string> = {
    sunny: '☀️ 晴天',
    cloudy: '⛅ 多云',
    rainy: '🌧️ 雨天',
    windy: '💨 大风',
    hot: '🔥 炎热',
    cold: '❄️ 寒冷'
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <div className="modal-title">跑步详情</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="grid grid-4 gap-md mb-md">
          <div className="stat-card">
            <div className="stat-value">{record.distance.toFixed(1)}</div>
            <div className="stat-label">公里</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatDuration(record.duration)}</div>
            <div className="stat-label">总时间</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatPace(record.pace)}</div>
            <div className="stat-label">平均配速</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: getRunTypeColor(record.type) }}>
              {getRunTypeLabel(record.type)}
            </div>
            <div className="stat-label">训练类型</div>
          </div>
        </div>
        
        {record.gpxPoints && record.gpxPoints.length > 0 && (
          <div className="mb-md">
            <MapView points={record.gpxPoints} height={300} />
          </div>
        )}
        
        <div className="grid grid-2 gap-md mb-md">
          <div>
            <div className="text-sm text-secondary mb-sm">日期</div>
            <div className="font-medium">{formatDate(record.date, 'yyyy年MM月dd日')}</div>
          </div>
          
          {record.avgHeartRate && (
            <div>
              <div className="text-sm text-secondary mb-sm">平均心率</div>
              <div className="font-medium">{record.avgHeartRate} 次/分钟</div>
            </div>
          )}
          
          {record.maxHeartRate && (
            <div>
              <div className="text-sm text-secondary mb-sm">最高心率</div>
              <div className="font-medium">{record.maxHeartRate} 次/分钟</div>
            </div>
          )}
          
          {record.weather && (
            <div>
              <div className="text-sm text-secondary mb-sm">天气</div>
              <div className="font-medium">{weatherMap[record.weather] || record.weather}</div>
            </div>
          )}
          
          {record.temperature !== undefined && (
            <div>
              <div className="text-sm text-secondary mb-sm">温度</div>
              <div className="font-medium">{record.temperature}℃</div>
            </div>
          )}
          
          {record.feelings && (
            <div>
              <div className="text-sm text-secondary mb-sm">身体感受</div>
              <div className="font-medium">
                {feelingsMap[record.feelings]?.emoji} {feelingsMap[record.feelings]?.label || record.feelings}
              </div>
            </div>
          )}
        </div>
        
        {record.notes && (
          <div className="card" style={{ background: '#f5f5f5', padding: '16px' }}>
            <div className="text-sm text-secondary mb-sm">备注</div>
            <div>{record.notes}</div>
          </div>
        )}
        
        <div className="flex justify-end gap-sm mt-lg">
          <button className="btn btn-danger btn-sm" onClick={onDelete}>删除</button>
          <button className="btn btn-secondary" onClick={onEdit}>编辑</button>
          <button className="btn btn-primary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
};

export default RunDetail;
