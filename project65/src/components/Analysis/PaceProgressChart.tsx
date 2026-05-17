import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { RunRecord } from '../../types';
import { formatPace } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PaceProgressChartProps {
  runRecords: RunRecord[];
}

const PaceProgressChart: React.FC<PaceProgressChartProps> = ({ runRecords }) => {
  const [selectedDistance, setSelectedDistance] = useState<string>('5');
  
  const distanceOptions = [
    { value: '5', label: '5公里', min: 4.5, max: 5.5 },
    { value: '10', label: '10公里', min: 9.5, max: 10.5 },
    { value: '21', label: '半程马拉松', min: 20, max: 22 },
    { value: '42', label: '全程马拉松', min: 40, max: 44 }
  ];
  
  const filteredRecords = useMemo(() => {
    const option = distanceOptions.find(o => o.value === selectedDistance);
    if (!option) return [];
    
    return runRecords
      .filter(r => r.distance >= option.min && r.distance <= option.max && r.type !== 'interval')
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [runRecords, selectedDistance]);
  
  if (filteredRecords.length === 0) {
    return (
      <div className="card">
        <div className="flex-between mb-md">
          <div className="card-title" style={{ marginBottom: 0 }}>配速进步曲线</div>
          <div className="flex gap-sm">
            {distanceOptions.map(opt => (
              <button
                key={opt.value}
                className={`btn btn-sm ${selectedDistance === opt.value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedDistance(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <div className="empty-title">暂无数据</div>
          <div className="empty-description">添加相应距离的跑步记录后即可查看配速进步趋势</div>
        </div>
      </div>
    );
  }
  
  const labels = filteredRecords.map(r => format(parseISO(r.date), 'MM/dd'));
  const paceData = filteredRecords.map(r => r.pace);
  
  const minPace = Math.min(...paceData);
  const maxPace = Math.max(...paceData);
  
  const data = {
    labels,
    datasets: [
      {
        label: '配速 (分/公里)',
        data: paceData,
        borderColor: 'rgb(244, 67, 54)',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointBackgroundColor: 'rgb(244, 67, 54)'
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `配速: ${formatPace(context.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        reverse: true,
        title: {
          display: true,
          text: '配速 (分/公里)'
        },
        ticks: {
          callback: (value: any) => {
            const min = Math.floor(value);
            const sec = Math.round((value - min) * 60);
            return `${min}'${sec.toString().padStart(2, '0')}"`;
          }
        }
      }
    }
  };
  
  const firstPace = paceData[0];
  const lastPace = paceData[paceData.length - 1];
  const improvement = firstPace - lastPace;
  
  return (
    <div className="card">
      <div className="flex-between mb-md">
        <div className="card-title" style={{ marginBottom: 0 }}>配速进步曲线</div>
        <div className="flex gap-sm">
          {distanceOptions.map(opt => (
            <button
              key={opt.value}
              className={`btn btn-sm ${selectedDistance === opt.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedDistance(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-3 gap-md mb-md">
        <div className="stat-card">
          <div className="stat-value">{formatPace(firstPace)}</div>
          <div className="stat-label">初始配速</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatPace(lastPace)}</div>
          <div className="stat-label">最新配速</div>
        </div>
        <div className="stat-card">
          <div className={`stat-value ${improvement > 0 ? 'text-success' : 'text-danger'}`}>
            {improvement > 0 ? '+' : ''}{improvement.toFixed(2)}
          </div>
          <div className="stat-label">进步（分钟/公里）</div>
        </div>
      </div>
      
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default PaceProgressChart;
