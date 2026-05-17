import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { RunRecord } from '../../types';
import { getHeartRateZones } from '../../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

interface HeartRateZoneChartProps {
  runRecords: RunRecord[];
  maxHeartRate?: number;
  restingHeartRate?: number;
}

const HeartRateZoneChart: React.FC<HeartRateZoneChartProps> = ({
  runRecords,
  maxHeartRate = 185,
  restingHeartRate = 65
}) => {
  const zoneData = useMemo(() => {
    const zones = getHeartRateZones(maxHeartRate, restingHeartRate);
    const zoneCounts = new Array(5).fill(0);
    let totalRecords = 0;
    
    runRecords.forEach(record => {
      if (!record.avgHeartRate) return;
      
      totalRecords++;
      for (let i = 0; i < zones.length; i++) {
        if (record.avgHeartRate >= zones[i].minBpm && record.avgHeartRate <= zones[i].maxBpm) {
          zoneCounts[i]++;
          break;
        }
      }
    });
    
    return zones.map((zone, index) => ({
      ...zone,
      count: zoneCounts[index],
      percentage: totalRecords > 0 ? Math.round((zoneCounts[index] / totalRecords) * 100) : 0
    }));
  }, [runRecords, maxHeartRate, restingHeartRate]);
  
  const colors = [
    'rgba(76, 175, 80, 0.8)',
    'rgba(139, 195, 74, 0.8)',
    'rgba(255, 193, 7, 0.8)',
    'rgba(255, 152, 0, 0.8)',
    'rgba(244, 67, 54, 0.8)'
  ];
  
  const data = {
    labels: zoneData.map(z => z.name),
    datasets: [
      {
        data: zoneData.map(z => z.count),
        backgroundColor: colors,
        borderColor: 'white',
        borderWidth: 2
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed}次 (${zoneData[context.dataIndex].percentage}%)`
        }
      }
    }
  };
  
  const recordsWithHr = runRecords.filter(r => r.avgHeartRate).length;
  
  return (
    <div className="card">
      <div className="card-title">心率区间分布</div>
      
      {recordsWithHr === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <div className="empty-title">暂无心率数据</div>
          <div className="empty-description">添加跑步记录时填写心率信息即可查看分布</div>
        </div>
      ) : (
        <>
          <div className="grid grid-2 gap-md">
            <div className="chart-container" style={{ height: '250px' }}>
              <Doughnut data={data} options={options} />
            </div>
            <div>
              {zoneData.map((zone, index) => (
                <div key={zone.zone} className="mb-md">
                  <div className="flex-between mb-sm">
                    <span className="font-medium">
                      <span
                        className="inline-block"
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: colors[index],
                          marginRight: '8px'
                        }}
                      />
                      {zone.name}
                    </span>
                    <span className="text-secondary">
                      {zone.minBpm}-{zone.maxBpm} bpm
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${zone.percentage}%`,
                        background: colors[index]
                      }}
                    />
                  </div>
                  <div className="text-sm text-secondary mt-sm">
                    {zone.count}次训练 · {zone.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-4 gap-md mt-md">
            <div className="stat-card">
              <div className="stat-value">{maxHeartRate}</div>
              <div className="stat-label">最大心率</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{restingHeartRate}</div>
              <div className="stat-label">静息心率</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {runRecords.length > 0
                  ? Math.round(
                      runRecords
                        .filter(r => r.avgHeartRate)
                        .reduce((sum, r) => sum + (r.avgHeartRate || 0), 0) / recordsWithHr || 0
                    )
                  : '--'}
              </div>
              <div className="stat-label">平均心率</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{recordsWithHr}</div>
              <div className="stat-label">有心率记录</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HeartRateZoneChart;
