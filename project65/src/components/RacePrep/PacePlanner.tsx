import React, { useState, useMemo } from 'react';
import { generatePacePlan, formatPacePlan } from '../../utils/pacePlanner';
import { formatPace, formatDuration } from '../../utils/helpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PacePlanner: React.FC = () => {
  const [targetTime, setTargetTime] = useState(240);
  const [distance, setDistance] = useState(42.195);
  const [courseProfile, setCourseProfile] = useState<'flat' | 'hilly' | 'rolling'>('flat');
  
  const pacePlan = useMemo(() => {
    return generatePacePlan(targetTime * 60, distance, courseProfile);
  }, [targetTime, distance, courseProfile]);
  
  const avgPace = (targetTime * 60 / 60) / distance;
  
  const chartData = {
    labels: pacePlan.map(s => `${s.km}K`),
    datasets: [
      {
        label: '配速 (分/公里)',
        data: pacePlan.map(s => s.pace),
        borderColor: 'rgb(33, 150, 243)',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.3,
        pointRadius: 4
      }
    ]
  };
  
  const chartOptions = {
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
  
  return (
    <div className="card">
      <div className="card-title">配速计划器</div>
      
      <div className="grid grid-3 gap-md mb-md">
        <div className="form-group">
          <label className="form-label">比赛距离</label>
          <select
            className="form-select"
            value={distance}
            onChange={e => setDistance(parseFloat(e.target.value))}
          >
            <option value={42.195}>全程马拉松（42.195km）</option>
            <option value={21.0975}>半程马拉松（21.0975km）</option>
            <option value={10}>10公里</option>
            <option value={5}>5公里</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">目标完赛时间（分钟）</label>
          <input
            type="number"
            className="form-input"
            value={targetTime}
            onChange={e => setTargetTime(parseInt(e.target.value) || 0)}
            min="15"
          />
          <div className="text-sm text-secondary mt-sm">
            约 {Math.floor(targetTime / 60)}小时{targetTime % 60}分钟
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">赛道类型</label>
          <select
            className="form-select"
            value={courseProfile}
            onChange={e => setCourseProfile(e.target.value as any)}
          >
            <option value="flat">平坦赛道</option>
            <option value="rolling">起伏赛道</option>
            <option value="hilly">多坡赛道</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-4 gap-md mb-md">
        <div className="stat-card">
          <div className="stat-value">{formatDuration(targetTime * 60)}</div>
          <div className="stat-label">目标完赛时间</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatPace(avgPace)}</div>
          <div className="stat-label">平均配速</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{distance}</div>
          <div className="stat-label">公里</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {pacePlan.length > 0 ? formatPace(Math.min(...pacePlan.map(p => p.pace))) : '--'}
          </div>
          <div className="stat-label">最快配速</div>
        </div>
      </div>
      
      <div className="grid grid-2 gap-md">
        <div>
          <h4 className="font-bold mb-sm">配速策略图</h4>
          <div className="chart-container" style={{ height: '300px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-sm">分段配速表</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>公里</th>
                  <th>配速</th>
                  <th>累计时间</th>
                </tr>
              </thead>
              <tbody>
                {pacePlan.map((segment, index) => (
                  <tr key={index}>
                    <td>{segment.km}K</td>
                    <td className="font-medium">{formatPace(segment.pace)}</td>
                    <td>{formatDuration(segment.cumulativeTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="alert alert-info mt-md">
        <strong>💡 配速策略建议：</strong>
        {courseProfile === 'flat' && '平坦赛道：前5公里稍慢热身，途中保持稳定配速，最后5公里逐渐加速冲线。'}
        {courseProfile === 'rolling' && '起伏赛道：上坡时适当放慢配速保存体力，下坡时利用重力自然加速。'}
        {courseProfile === 'hilly' && '多坡赛道：前10公里保守配速，中间阶段保持节奏，后程根据体力调整。'}
      </div>
    </div>
  );
};

export default PacePlanner;
