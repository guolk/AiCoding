import React from 'react';
import { useApp } from '../../context/AppContext';
import WeeklyMileageChart from './WeeklyMileageChart';
import PaceProgressChart from './PaceProgressChart';
import HeartRateZoneChart from './HeartRateZoneChart';

const AnalysisModule: React.FC = () => {
  const { state } = useApp();
  const { runRecords, trainingPlan, userProfile } = state;
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">数据分析</h1>
        <p className="page-subtitle">深入了解您的训练数据和进步趋势</p>
      </div>
      
      <WeeklyMileageChart
        runRecords={runRecords}
        trainingPlan={trainingPlan}
      />
      
      <PaceProgressChart runRecords={runRecords} />
      
      <HeartRateZoneChart
        runRecords={runRecords}
        maxHeartRate={userProfile?.maxHeartRate}
        restingHeartRate={userProfile?.restingHeartRate}
      />
    </div>
  );
};

export default AnalysisModule;
