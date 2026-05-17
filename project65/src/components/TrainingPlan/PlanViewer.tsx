import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate, getRunTypeLabel, getRunTypeColor, formatDuration } from '../../utils/helpers';
import { TrainingDay, RunType } from '../../types';
import { adjustTrainingPlan } from '../../utils/trainingPlanGenerator';

const PlanViewer: React.FC = () => {
  const { state, dispatch } = useApp();
  const { trainingPlan, raceGoal } = state;
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [editingDay, setEditingDay] = useState<TrainingDay | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  if (!trainingPlan || !raceGoal) return null;
  
  const weekDays = trainingPlan.days.filter(d => d.weekNumber === selectedWeek);
  const today = new Date().toISOString().split('T')[0];
  
  const handleDayClick = (day: TrainingDay) => {
    setEditingDay({ ...day });
    setShowEditModal(true);
  };
  
  const handleSaveEdit = () => {
    if (!editingDay || !trainingPlan) return;
    
    const updatedPlan = adjustTrainingPlan(
      trainingPlan,
      editingDay.id,
      editingDay.type,
      editingDay.distance
    );
    
    dispatch({ type: 'SET_TRAINING_PLAN', payload: updatedPlan });
    setShowEditModal(false);
    setEditingDay(null);
  };
  
  const toggleComplete = (dayId: string, completed: boolean) => {
    dispatch({
      type: 'UPDATE_TRAINING_DAY',
      payload: { dayId, updates: { completed } }
    });
  };
  
  const weekStartDate = weekDays.length > 0 ? weekDays[0].date : '';
  const weekEndDate = weekDays.length > 0 ? weekDays[weekDays.length - 1].date : '';
  
  const weekMileage = weekDays.reduce((sum, d) => sum + d.distance, 0);
  const completedDays = weekDays.filter(d => d.completed).length;
  
  return (
    <div>
      <div className="card mb-md">
        <div className="flex-between mb-md">
          <div>
            <div className="text-lg font-bold">{raceGoal.name}</div>
            <div className="text-sm text-secondary">
              {raceGoal.distance}公里 · 目标时间 {Math.floor(raceGoal.targetTime / 60)}:{String(raceGoal.targetTime % 60).padStart(2, '0')}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-secondary">比赛日期</div>
            <div className="font-bold">{formatDate(raceGoal.raceDate, 'yyyy年MM月dd日')}</div>
          </div>
        </div>
        
        <div className="grid grid-4 gap-md">
          <div className="stat-card">
            <div className="stat-value">{trainingPlan.totalWeeks}</div>
            <div className="stat-label">总周数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{selectedWeek}/{trainingPlan.totalWeeks}</div>
            <div className="stat-label">当前进度</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{weekMileage.toFixed(1)}</div>
            <div className="stat-label">本周计划跑量(km)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completedDays}/{weekDays.length}</div>
            <div className="stat-label">已完成天数</div>
          </div>
        </div>
      </div>
      
      <div className="week-navigation">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
          disabled={selectedWeek === 1}
        >
          ← 上一周
        </button>
        <div className="week-display">
          第 {selectedWeek} 周
          <div className="text-sm text-secondary font-normal">
            {formatDate(weekStartDate, 'MM月dd日')} - {formatDate(weekEndDate, 'MM月dd日')}
          </div>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setSelectedWeek(Math.min(trainingPlan.totalWeeks, selectedWeek + 1))}
          disabled={selectedWeek === trainingPlan.totalWeeks}
        >
          下一周 →
        </button>
      </div>
      
      <div className="week-grid">
        {weekDays.map(day => (
          <div
            key={day.id}
            className={`day-card ${day.completed ? 'completed' : ''} ${day.date === today ? 'today' : ''}`}
            onClick={() => handleDayClick(day)}
          >
            <div className="day-header">
              <span className="day-name">{['周一', '周二', '周三', '周四', '周五', '周六', '周日'][day.dayOfWeek - 1]}</span>
              <span className="day-date">{formatDate(day.date, 'MM/dd')}</span>
            </div>
            <div
              className="day-type"
              style={{ color: getRunTypeColor(day.type) }}
            >
              {getRunTypeLabel(day.type)}
            </div>
            {day.distance > 0 && (
              <div className="day-distance">
                {day.distance} <span className="text-sm text-secondary">km</span>
              </div>
            )}
            {day.duration && (
              <div className="text-sm text-secondary">
                约 {formatDuration(day.duration)}
              </div>
            )}
            <div className="day-description">{day.description}</div>
            {day.notes && (
              <div className="text-sm text-warning mt-sm">📝 {day.notes}</div>
            )}
          </div>
        ))}
      </div>
      
      {showEditModal && editingDay && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">调整训练计划</div>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <div className="form-group">
              <label className="form-label">日期</label>
              <div className="form-input" style={{ background: '#f5f5f5' }}>
                {formatDate(editingDay.date, 'yyyy年MM月dd日')}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">训练类型</label>
              <select
                className="form-select"
                value={editingDay.type}
                onChange={e => setEditingDay({ ...editingDay, type: e.target.value as RunType })}
              >
                <option value="easy">轻松跑</option>
                <option value="tempo">节奏跑</option>
                <option value="interval">间歇训练</option>
                <option value="long">长距离慢跑</option>
                <option value="rest">休息</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">距离（公里）</label>
              <input
                type="number"
                className="form-input"
                value={editingDay.distance}
                onChange={e => setEditingDay({ ...editingDay, distance: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.5"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">备注</label>
              <textarea
                className="form-textarea"
                value={editingDay.notes || ''}
                onChange={e => setEditingDay({ ...editingDay, notes: e.target.value })}
                placeholder="记录调整原因..."
              />
            </div>
            
            <div className="flex-between mt-lg">
              <button
                className="btn btn-success btn-sm"
                onClick={() => toggleComplete(editingDay.id, !editingDay.completed)}
              >
                {editingDay.completed ? '标记为未完成' : '标记为已完成'}
              </button>
              <div className="flex gap-sm">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>取消</button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>保存调整</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanViewer;
