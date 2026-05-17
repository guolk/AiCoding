import React from 'react';
import { useApp } from '../../context/AppContext';
import GoalSetup from './GoalSetup';
import PlanViewer from './PlanViewer';

const TrainingPlanModule: React.FC = () => {
  const { state } = useApp();
  const { trainingPlan } = state;
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">训练计划</h1>
        <p className="page-subtitle">
          {trainingPlan
            ? '查看和调整您的个性化训练计划'
            : '设置您的比赛目标，生成个性化训练计划'}
        </p>
      </div>
      
      {trainingPlan ? (
        <PlanViewer />
      ) : (
        <GoalSetup onComplete={() => {}} />
      )}
    </div>
  );
};

export default TrainingPlanModule;
