import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RaceGoal, UserProfile } from '../../types';
import { generateId, getWeeksUntilRace } from '../../utils/helpers';
import { generateTrainingPlan } from '../../utils/trainingPlanGenerator';

interface GoalSetupProps {
  onComplete: () => void;
}

const GoalSetup: React.FC<GoalSetupProps> = ({ onComplete }) => {
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    currentWeeklyMileage: 20,
    experienceLevel: 'intermediate'
  });
  
  const [goal, setGoal] = useState<Partial<RaceGoal>>({
    name: '',
    raceDate: '',
    targetTime: 240,
    distance: 42.195
  });
  
  const [planWeeks, setPlanWeeks] = useState(16);
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };
  
  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };
  
  const generatePlan = () => {
    const userProfile: UserProfile = {
      name: profile.name || '跑者',
      currentWeeklyMileage: profile.currentWeeklyMileage || 20,
      experienceLevel: profile.experienceLevel || 'intermediate',
      birthDate: profile.birthDate,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      maxHeartRate: profile.maxHeartRate,
      restingHeartRate: profile.restingHeartRate
    };
    
    const raceGoal: RaceGoal = {
      id: generateId(),
      name: goal.name || '马拉松比赛',
      raceDate: goal.raceDate || new Date().toISOString().split('T')[0],
      targetTime: goal.targetTime || 240,
      distance: goal.distance || 42.195,
      createdAt: new Date().toISOString()
    };
    
    const plan = generateTrainingPlan({
      raceGoal,
      userProfile,
      totalWeeks: planWeeks
    });
    
    dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
    dispatch({ type: 'SET_RACE_GOAL', payload: raceGoal });
    dispatch({ type: 'SET_TRAINING_PLAN', payload: plan });
    
    onComplete();
  };
  
  const weeksUntilRace = goal.raceDate ? getWeeksUntilRace(goal.raceDate) : 0;
  
  return (
    <div className="card">
      <div className="card-title">设置训练目标</div>
      
      <div className="tabs mb-md">
        <div className={`tab ${step >= 1 ? 'active' : ''}`}>个人资料</div>
        <div className={`tab ${step >= 2 ? 'active' : ''}`}>比赛目标</div>
        <div className={`tab ${step >= 3 ? 'active' : ''}`}>生成计划</div>
      </div>
      
      {step === 1 && (
        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-2 gap-md">
            <div className="form-group">
              <label className="form-label">姓名</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                placeholder="请输入您的姓名"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">当前周跑量（公里）</label>
              <input
                type="number"
                className="form-input"
                value={profile.currentWeeklyMileage}
                onChange={e => setProfile({ ...profile, currentWeeklyMileage: parseFloat(e.target.value) || 0 })}
                min="0"
                step="1"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">经验水平</label>
              <select
                className="form-select"
                value={profile.experienceLevel}
                onChange={e => setProfile({ ...profile, experienceLevel: e.target.value as UserProfile['experienceLevel'] })}
              >
                <option value="beginner">初学者（跑步少于6个月）</option>
                <option value="intermediate">中级（跑步6个月-2年）</option>
                <option value="advanced">高级（跑步2年以上）</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">出生日期</label>
              <input
                type="date"
                className="form-input"
                value={profile.birthDate || ''}
                onChange={e => setProfile({ ...profile, birthDate: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">性别</label>
              <select
                className="form-select"
                value={profile.gender || ''}
                onChange={e => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' | undefined })}
              >
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">静息心率（次/分钟）</label>
              <input
                type="number"
                className="form-input"
                value={profile.restingHeartRate || ''}
                onChange={e => setProfile({ ...profile, restingHeartRate: parseInt(e.target.value) || undefined })}
                min="30"
                max="100"
                placeholder="约60-80"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-sm mt-lg">
            <button type="submit" className="btn btn-primary">下一步</button>
          </div>
        </form>
      )}
      
      {step === 2 && (
        <form onSubmit={handleGoalSubmit}>
          <div className="grid grid-2 gap-md">
            <div className="form-group">
              <label className="form-label">比赛名称</label>
              <input
                type="text"
                className="form-input"
                value={goal.name}
                onChange={e => setGoal({ ...goal, name: e.target.value })}
                placeholder="例如：北京马拉松"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">比赛日期</label>
              <input
                type="date"
                className="form-input"
                value={goal.raceDate || ''}
                onChange={e => setGoal({ ...goal, raceDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">比赛距离</label>
              <select
                className="form-select"
                value={goal.distance}
                onChange={e => setGoal({ ...goal, distance: parseFloat(e.target.value) })}
              >
                <option value={21.0975}>半程马拉松（21.0975公里）</option>
                <option value={42.195}>全程马拉松（42.195公里）</option>
                <option value={10}>10公里</option>
                <option value={5}>5公里</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">目标完赛时间（分钟）</label>
              <input
                type="number"
                className="form-input"
                value={goal.targetTime}
                onChange={e => setGoal({ ...goal, targetTime: parseInt(e.target.value) || 0 })}
                min="30"
                step="1"
                placeholder="例如：240分钟 = 4小时"
              />
              <div className="text-sm text-secondary mt-sm">
                目标配速: {goal.targetTime ? `${Math.floor(goal.targetTime / (goal.distance || 42.195))}'${Math.round(((goal.targetTime / (goal.distance || 42.195)) % 1) * 60)}"` : '--'}/公里
              </div>
            </div>
          </div>
          
          {goal.raceDate && (
            <div className="alert alert-info mt-md">
              <span>距离比赛还有 <strong>{weeksUntilRace}</strong> 周</span>
            </div>
          )}
          
          <div className="flex justify-between gap-sm mt-lg">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>上一步</button>
            <button type="submit" className="btn btn-primary">下一步</button>
          </div>
        </form>
      )}
      
      {step === 3 && (
        <div>
          <div className="form-group">
            <label className="form-label">训练周期</label>
            <select
              className="form-select"
              value={planWeeks}
              onChange={e => setPlanWeeks(parseInt(e.target.value))}
            >
              <option value={12}>12周</option>
              <option value={16}>16周（推荐）</option>
              <option value={20}>20周</option>
              <option value={24}>24周</option>
            </select>
            {weeksUntilRace > 0 && weeksUntilRace < planWeeks && (
              <div className="text-sm text-warning mt-sm">
                ⚠️ 距离比赛只有 {weeksUntilRace} 周，建议选择更短的训练周期
              </div>
            )}
          </div>
          
          <div className="card bg-primary mt-md">
            <div className="card-title text-light">计划概览</div>
            <div className="grid grid-3 gap-md">
              <div>
                <div className="text-sm opacity-80">训练周期</div>
                <div className="text-xl font-bold">{planWeeks} 周</div>
              </div>
              <div>
                <div className="text-sm opacity-80">初始周跑量</div>
                <div className="text-xl font-bold">{profile.currentWeeklyMileage} 公里</div>
              </div>
              <div>
                <div className="text-sm opacity-80">目标完赛</div>
                <div className="text-xl font-bold">
                  {Math.floor((goal.targetTime || 0) / 60)}:{String((goal.targetTime || 0) % 60).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between gap-sm mt-lg">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>上一步</button>
            <button type="button" className="btn btn-success" onClick={generatePlan}>生成训练计划</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalSetup;
