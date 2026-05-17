import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatDuration, getRunTypeLabel, getRunTypeColor } from '../../utils/helpers';
import { generateTaperPlan } from '../../utils/trainingPlanGenerator';

const TaperPlan: React.FC = () => {
  const { state } = useApp();
  const { raceGoal, trainingPlan } = state;
  
  if (!raceGoal) {
    return (
      <div className="card">
        <div className="card-title">赛前减量计划</div>
        <div className="empty-state">
          <div className="empty-icon">🏃</div>
          <div className="empty-title">请先设置比赛目标</div>
          <div className="empty-description">在训练计划模块中设置您的比赛信息</div>
        </div>
      </div>
    );
  }
  
  const currentWeeklyMileage = trainingPlan?.currentWeeklyMileage || 30;
  const taperDays = generateTaperPlan(raceGoal, currentWeeklyMileage);
  
  const week1Days = taperDays.filter(d => d.weekNumber === 1);
  const week2Days = taperDays.filter(d => d.weekNumber === 2);
  
  return (
    <div className="card">
      <div className="card-title">赛前减量计划（赛前2周）</div>
      
      <div className="alert alert-info mb-md">
        <strong>💡 减量原则：</strong>
        赛前减少跑量，保持强度，让身体充分恢复，以最佳状态迎接比赛。
        跑量减少40-60%，保持一些速度训练维持状态。
      </div>
      
      <div className="grid grid-2 gap-md">
        <div>
          <h3 className="text-lg font-bold mb-md">赛前第2周</h3>
          <div className="space-y-sm">
            {week1Days.map(day => (
              <div
                key={day.id}
                className="card"
                style={{ padding: '12px', marginBottom: '8px' }}
              >
                <div className="flex-between">
                  <div>
                    <span className="text-sm text-secondary">
                      {formatDate(day.date, 'MM月dd日')}
                    </span>
                    <span
                      className="badge ml-sm"
                      style={{
                        background: getRunTypeColor(day.type) + '20',
                        color: getRunTypeColor(day.type)
                      }}
                    >
                      {getRunTypeLabel(day.type)}
                    </span>
                  </div>
                  {day.distance > 0 && (
                    <span className="font-bold">{day.distance} km</span>
                  )}
                </div>
                <div className="text-sm mt-sm">{day.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold mb-md">赛前第1周（比赛周）</h3>
          <div className="space-y-sm">
            {week2Days.map(day => (
              <div
                key={day.id}
                className="card"
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: day.type === 'race' ? '#E8F5E9' : undefined
                }}
              >
                <div className="flex-between">
                  <div>
                    <span className="text-sm text-secondary">
                      {formatDate(day.date, 'MM月dd日')}
                    </span>
                    <span
                      className="badge ml-sm"
                      style={{
                        background: getRunTypeColor(day.type) + '20',
                        color: getRunTypeColor(day.type)
                      }}
                    >
                      {getRunTypeLabel(day.type)}
                    </span>
                  </div>
                  {day.distance > 0 && (
                    <span className="font-bold">{day.distance} km</span>
                  )}
                </div>
                <div className="text-sm mt-sm">{day.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaperPlan;
