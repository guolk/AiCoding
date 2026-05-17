import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { startOfWeek, parseISO, eachWeekOfInterval, addDays, format } from 'date-fns';
import { checkOverload } from '../../utils/helpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OverloadWarning: React.FC = () => {
  const { state } = useApp();
  const { runRecords } = state;
  
  const overloadAnalysis = useMemo(() => {
    if (runRecords.length < 2) {
      return { warnings: [], recentWeeks: [] };
    }
    
    const sortedRecords = [...runRecords].sort((a, b) => 
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
    
    const firstDate = parseISO(sortedRecords[0].date);
    const lastDate = parseISO(sortedRecords[sortedRecords.length - 1].date);
    
    const weeks = eachWeekOfInterval({
      start: startOfWeek(firstDate, { weekStartsOn: 1 }),
      end: startOfWeek(lastDate, { weekStartsOn: 1 })
    });
    
    const weeklyMileage = weeks.map(week => {
      const weekEnd = addDays(week, 6);
      const mileage = runRecords
        .filter(r => {
          const d = parseISO(r.date);
          return d >= week && d <= weekEnd;
        })
        .reduce((sum, r) => sum + r.distance, 0);
      
      return {
        week,
        label: format(week, 'MM/dd'),
        mileage: Math.round(mileage * 10) / 10
      };
    });
    
    const warnings: Array<{
      week: string;
      mileage: number;
      prevMileage: number;
      increasePercent: number;
      recommendation: string;
    }> = [];
    
    for (let i = 1; i < weeklyMileage.length; i++) {
      const current = weeklyMileage[i];
      const previous = weeklyMileage[i - 1];
      
      if (previous.mileage > 0) {
        const { overload, increasePercent } = checkOverload(current.mileage, previous.mileage);
        
        if (overload) {
          warnings.push({
            week: current.label,
            mileage: current.mileage,
            prevMileage: previous.mileage,
            increasePercent,
            recommendation: getRecommendation(increasePercent)
          });
        }
      }
    }
    
    return { warnings, recentWeeks: weeklyMileage.slice(-8) };
  }, [runRecords]);
  
  const getRecommendation = (increasePercent: number): string => {
    if (increasePercent > 30) {
      return '⚠️ 跑量增幅过大！建议下周减少跑量，增加恢复性训练，注意身体信号。';
    } else if (increasePercent > 20) {
      return '⚠️ 跑量增幅较高，建议下周适当减量，增加交叉训练和恢复时间。';
    } else {
      return '💡 跑量略超10%原则，建议关注身体感受，确保充足恢复。';
    }
  };
  
  const chartData = {
    labels: overloadAnalysis.recentWeeks.map(w => w.label),
    datasets: [
      {
        label: '周跑量（公里）',
        data: overloadAnalysis.recentWeeks.map(w => w.mileage),
        backgroundColor: overloadAnalysis.recentWeeks.map((w, i, arr) => {
          if (i === 0) return 'rgba(33, 150, 243, 0.8)';
          const prev = arr[i - 1].mileage;
          const increase = prev > 0 ? ((w.mileage - prev) / prev) * 100 : 0;
          if (increase > 20) return 'rgba(244, 67, 54, 0.8)';
          if (increase > 10) return 'rgba(255, 152, 0, 0.8)';
          return 'rgba(76, 175, 80, 0.8)';
        }),
        borderWidth: 1
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '公里数'
        }
      }
    }
  };
  
  return (
    <div className="card">
      <div className="card-title">训练负荷监测</div>
      
      <div className="alert alert-info mb-md">
        <strong>💡 训练原则：</strong>
        周跑量增幅建议不超过10%，避免过度训练导致受伤。
        增加跑量时优先增加频率，其次是距离，最后是强度。
      </div>
      
      {overloadAnalysis.recentWeeks.length > 0 && (
        <div className="mb-md">
          <h4 className="font-bold mb-sm">最近8周跑量</h4>
          <div className="chart-container" style={{ height: '200px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="flex justify-center gap-md mt-sm">
            <div className="flex items-center gap-sm">
              <span style={{ width: '12px', height: '12px', background: 'rgba(76, 175, 80, 0.8)', borderRadius: '2px' }}></span>
              <span className="text-sm">正常（≤10%）</span>
            </div>
            <div className="flex items-center gap-sm">
              <span style={{ width: '12px', height: '12px', background: 'rgba(255, 152, 0, 0.8)', borderRadius: '2px' }}></span>
              <span className="text-sm">偏高（10-20%）</span>
            </div>
            <div className="flex items-center gap-sm">
              <span style={{ width: '12px', height: '12px', background: 'rgba(244, 67, 54, 0.8)', borderRadius: '2px' }}></span>
              <span className="text-sm">过高（{'>'}20%）</span>
            </div>
          </div>
        </div>
      )}
      
      {overloadAnalysis.warnings.length > 0 ? (
        <div>
          <h4 className="font-bold mb-sm text-warning">⚠️ 过载预警</h4>
          {overloadAnalysis.warnings.map((warning, index) => (
            <div
              key={index}
              className="alert alert-warning"
              style={{ marginBottom: '8px' }}
            >
              <div className="font-medium">
                {warning.week} 周跑量 {warning.mileage.toFixed(1)}km，
                较上周 {warning.prevMileage.toFixed(1)}km 增加了 {warning.increasePercent.toFixed(0)}%
              </div>
              <div className="text-sm mt-sm">{warning.recommendation}</div>
            </div>
          ))}
        </div>
      ) : runRecords.length >= 2 ? (
        <div className="alert alert-success">
          ✅ 训练负荷良好，继续保持循序渐进的原则！
        </div>
      ) : (
        <div className="empty-state" style={{ padding: '24px' }}>
          <div className="empty-icon">📊</div>
          <div className="empty-title">数据不足</div>
          <div className="empty-description">添加更多跑步记录后即可监测训练负荷</div>
        </div>
      )}
    </div>
  );
};

export default OverloadWarning;
