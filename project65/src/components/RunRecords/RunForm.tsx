import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RunRecord, RunType } from '../../types';
import { generateId, calculatePace, parseDuration, formatDuration } from '../../utils/helpers';
import { parseGpx, GpxData } from '../../utils/gpxParser';
import MapView from './MapView';

interface RunFormProps {
  onClose: () => void;
  editRecord?: RunRecord;
}

const RunForm: React.FC<RunFormProps> = ({ onClose, editRecord }) => {
  const { dispatch } = useApp();
  const [gpxData, setGpxData] = useState<GpxData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState<Partial<RunRecord>>({
    date: new Date().toISOString().split('T')[0],
    distance: 0,
    duration: 0,
    pace: 0,
    type: 'easy',
    feelings: '',
    notes: '',
    ...editRecord
  });
  
  const [durationInput, setDurationInput] = useState(
    editRecord ? formatDuration(editRecord.duration) : ''
  );
  
  const handleDurationChange = (value: string) => {
    setDurationInput(value);
    const duration = parseDuration(value);
    setFormData(prev => ({
      ...prev,
      duration,
      pace: prev.distance ? calculatePace(prev.distance, duration) : 0
    }));
  };
  
  const handleDistanceChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      distance: value,
      pace: prev.duration ? calculatePace(value, prev.duration) : 0
    }));
  };
  
  const handleGpxUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xml = e.target?.result as string;
        const data = parseGpx(xml);
        setGpxData(data);
        
        setFormData(prev => ({
          ...prev,
          distance: data.distance,
          duration: data.duration,
          pace: data.avgPace,
          gpxData: xml,
          gpxPoints: data.points,
          date: data.time ? new Date(data.time).toISOString().split('T')[0] : prev.date
        }));
        
        setDurationInput(formatDuration(data.duration));
      } catch (err) {
        alert('GPX文件解析失败：' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.gpx')) {
      handleGpxUpload(file);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleGpxUpload(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.distance || !formData.duration) {
      alert('请填写距离和时间');
      return;
    }
    
    const record: RunRecord = {
      id: editRecord?.id || generateId(),
      date: formData.date!,
      distance: formData.distance!,
      duration: formData.duration!,
      pace: formData.pace || calculatePace(formData.distance!, formData.duration!),
      type: formData.type as RunType,
      avgHeartRate: formData.avgHeartRate,
      maxHeartRate: formData.maxHeartRate,
      route: formData.route,
      gpxData: formData.gpxData,
      gpxPoints: formData.gpxPoints,
      feelings: formData.feelings,
      notes: formData.notes,
      temperature: formData.temperature,
      weather: formData.weather,
      createdAt: editRecord?.createdAt || new Date().toISOString()
    };
    
    if (editRecord) {
      dispatch({ type: 'UPDATE_RUN_RECORD', payload: record });
    } else {
      dispatch({ type: 'ADD_RUN_RECORD', payload: record });
    }
    
    onClose();
  };
  
  return (
    <>
      <div className="modal-header">
        <div className="modal-title">{editRecord ? '编辑跑步记录' : '添加跑步记录'}</div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      
      <form onSubmit={handleSubmit}>
          <div
            className={`upload-zone mb-md ${isDragging ? 'dragover' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('gpx-input')?.click()}
          >
            <div className="upload-icon">📍</div>
            <div className="font-medium">点击或拖拽上传GPX文件</div>
            <div className="text-sm text-secondary">支持Garmin、苹果手表等导出的GPX格式</div>
            <input
              id="gpx-input"
              type="file"
              accept=".gpx"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>
          
          {gpxData && (
            <div className="alert alert-success mb-md">
              ✓ GPX解析成功：{gpxData.distance.toFixed(2)}公里 · {formatDuration(gpxData.duration)} · 
              爬升{gpxData.totalAscent}m / 下降{gpxData.totalDescent}m
            </div>
          )}
          
          {gpxData && gpxData.points.length > 0 && (
            <div className="mb-md">
              <MapView points={gpxData.points} height={250} />
            </div>
          )}
          
          <div className="grid grid-2 gap-md">
            <div className="form-group">
              <label className="form-label">日期</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">跑步类型</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as RunType })}
              >
                <option value="easy">轻松跑</option>
                <option value="tempo">节奏跑</option>
                <option value="interval">间歇训练</option>
                <option value="long">长距离慢跑</option>
                <option value="race">比赛</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">距离（公里）</label>
              <input
                type="number"
                className="form-input"
                value={formData.distance}
                onChange={e => handleDistanceChange(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">时间（时:分:秒 或 分:秒）</label>
              <input
                type="text"
                className="form-input"
                value={durationInput}
                onChange={e => handleDurationChange(e.target.value)}
                placeholder="例如：1:30:00 或 45:00"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">配速（自动计算）</label>
              <div className="form-input" style={{ background: '#f5f5f5' }}>
                {formData.pace ? `${Math.floor(formData.pace)}'${Math.round((formData.pace % 1) * 60).toString().padStart(2, '0')}"/公里` : '--'}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">平均心率</label>
              <input
                type="number"
                className="form-input"
                value={formData.avgHeartRate || ''}
                onChange={e => setFormData({ ...formData, avgHeartRate: parseInt(e.target.value) || undefined })}
                placeholder="次/分钟"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">最高心率</label>
              <input
                type="number"
                className="form-input"
                value={formData.maxHeartRate || ''}
                onChange={e => setFormData({ ...formData, maxHeartRate: parseInt(e.target.value) || undefined })}
                placeholder="次/分钟"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">天气</label>
              <select
                className="form-select"
                value={formData.weather || ''}
                onChange={e => setFormData({ ...formData, weather: e.target.value || undefined })}
              >
                <option value="">请选择</option>
                <option value="sunny">晴天</option>
                <option value="cloudy">多云</option>
                <option value="rainy">雨天</option>
                <option value="windy">大风</option>
                <option value="hot">炎热</option>
                <option value="cold">寒冷</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">温度（℃）</label>
              <input
                type="number"
                className="form-input"
                value={formData.temperature || ''}
                onChange={e => setFormData({ ...formData, temperature: parseFloat(e.target.value) || undefined })}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">身体感受</label>
            <select
              className="form-select"
              value={formData.feelings || ''}
              onChange={e => setFormData({ ...formData, feelings: e.target.value || undefined })}
            >
              <option value="">请选择</option>
              <option value="excellent">💪 非常好</option>
              <option value="good">😊 良好</option>
              <option value="normal">😐 一般</option>
              <option value="tired">😫 疲劳</option>
              <option value="pain">😣 有疼痛</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">备注</label>
            <textarea
              className="form-textarea"
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="记录跑步感受、装备、补给等信息..."
            />
          </div>
          
          <div className="flex justify-end gap-sm mt-lg">
            <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary">{editRecord ? '保存修改' : '添加记录'}</button>
          </div>
        </form>
    </>
  );
};

export default RunForm;
