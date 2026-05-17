import React from 'react';
import TaperPlan from './TaperPlan';
import PacePlanner from './PacePlanner';
import CheckList from './CheckList';

const RacePrepModule: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">比赛准备</h1>
        <p className="page-subtitle">赛前减量、配速策略和检查清单，助您备战无忧</p>
      </div>
      
      <TaperPlan />
      <PacePlanner />
      <CheckList />
    </div>
  );
};

export default RacePrepModule;
