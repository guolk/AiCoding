import React from 'react';
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
import { startOfWeek, parseISO, format, eachWeekOfInterval, addDays } from 'date-fns';
import { RunRecord, TrainingPlan } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeeklyMileageChartProps {
  runRecords: RunRecord[];
  trainingPlan?: TrainingPlan | null;
}

const WeeklyMileageChart: React.FC<WeeklyMileageChartProps> = ({ runRecords, trainingPlan }) => {
  if (runRecords.length === 0 && !trainingPlan) {
    return (
      <div className="card">
        <div className="card-title">周跑量趋势</div>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">暂无数据</div>
          <div className="empty-description">添加跑步记录后即可查看周跑量趋势</div>
        </div>
      </div>
    );
  }
  
  const allDates = [
    ...runRecords.map(r => r.date),
    ...(trainingPlan ? trainingPlan.days.map(d => d.date) : [])
  ];
  
  if (allDates.length === 0) {
    return null;
  }
  
  const minDate = allDates.reduce((a, b) => a < b ? a : b);
  const maxDate = allDates.reduce((a, b) => a > b ? a : b);
  
  const weeks = eachWeekOfInterval({
    start: startOfWeek(parseISO(minDate), { weekStartsOn: 1 }),
    end: startOfWeek(parseISO(maxDate), { weekStartsOn: 1 })
  });
  
  const labels = weeks.map(week => format(week, 'MM/dd'));
  
  const actualData = weeks.map(week => {
    const weekEnd = addDays(week, 6);
    return runRecords
      .filter(r => {
        const d = parseISO(r.date);
        return d >= week && d <= weekEnd;
      })
      .reduce((sum, r) => sum + r.distance, 0);
  });
  
  const plannedData = weeks.map(week => {
    if (!trainingPlan) return 0;
    const weekEnd = addDays(week, 6);
    return trainingPlan.days
      .filter(day => {
        const date = parseISO(day.date);
        return date >= week && date <= weekEnd;
      })
      .reduce((sum, day) => sum + day.distance, 0);
  });
  
  const data = {
    labels,
    datasets: [
      {
        label: '计划跑量',
        data: plannedData,
        backgroundColor: 'rgba(33, 150, 243, 0.5)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1
      },
      {
        label: '实际跑量',
        data: actualData,
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)} 公里`
        }
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
  
  const totalPlanned = plannedData.reduce((a, b) => a + b, 0);
  const totalActual = actualData.reduce((a, b) => a + b, 0);
  
  return (
    <div className="card">
      <div className="flex-between mb-md">
        <div className="card-title" style={{ marginBottom: 0 }}>周跑量趋势</div>
        <div className="flex gap-md">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{totalPlanned.toFixed(0)}</div>
            <div className="text-sm text-secondary">计划总公里</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-success">{totalActual.toFixed(0)}</div>
            <div className="text-sm text-secondary">实际总公里</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${totalActual >= totalPlanned ? 'text-success' : 'text-warning'}`}>
              {totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0}%
            </div>
            <div className="text-sm text-secondary">完成率</div>
          </div>
        </div>
      </div>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default WeeklyMileageChart;
