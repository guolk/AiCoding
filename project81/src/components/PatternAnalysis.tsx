import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { TriggerFactor, SleepQuality } from '../types';

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#AA96DA'];

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const timeSlots = ['凌晨', '上午', '下午', '晚上'];

const sleepScore: Record<SleepQuality, number> = {
  '很差': 1,
  '较差': 2,
  '一般': 3,
  '较好': 4,
  '很好': 5
};

const PatternAnalysis: React.FC = () => {
  const { state } = useApp();
  const { moodRecords } = state;

  const getTimeSlot = (hour: number): string => {
    if (hour >= 0 && hour < 6) return '凌晨';
    if (hour >= 6 && hour < 12) return '上午';
    if (hour >= 12 && hour < 18) return '下午';
    return '晚上';
  };

  const weeklyData = weekDays.map(day => {
    const dayRecords = moodRecords.filter(r => {
      const d = new Date(r.timestamp);
      return weekDays[d.getDay()] === day;
    });
    return {
      day,
      愉悦度: dayRecords.length ? dayRecords.reduce((s, r) => s + r.dimensions.pleasure, 0) / dayRecords.length : 0,
      精力: dayRecords.length ? dayRecords.reduce((s, r) => s + r.dimensions.energy, 0) / dayRecords.length : 0,
      焦虑度: dayRecords.length ? dayRecords.reduce((s, r) => s + r.dimensions.anxiety, 0) / dayRecords.length : 0,
      压力: dayRecords.length ? dayRecords.reduce((s, r) => s + r.dimensions.stress, 0) / dayRecords.length : 0,
    };
  });

  const timeSlotData = timeSlots.map(slot => {
    const slotRecords = moodRecords.filter(r => {
      const hour = new Date(r.timestamp).getHours();
      return getTimeSlot(hour) === slot;
    });
    return {
      时间段: slot,
      平均愉悦度: slotRecords.length ? slotRecords.reduce((s, r) => s + r.dimensions.pleasure, 0) / slotRecords.length : 0,
      平均精力: slotRecords.length ? slotRecords.reduce((s, r) => s + r.dimensions.energy, 0) / slotRecords.length : 0,
    };
  });

  const triggerCount = moodRecords.reduce((acc, record) => {
    record.triggers.forEach(t => {
      acc[t] = (acc[t] || 0) + 1;
    });
    return acc;
  }, {} as Record<TriggerFactor, number>);

  const triggerData = Object.entries(triggerCount).map(([name, value]) => ({ name, value }));

  const lowestDay = [...weeklyData].sort((a, b) => a.愉悦度 - b.愉悦度)[0];
  const highestEnergySlot = [...timeSlotData].sort((a, b) => b.平均精力 - a.平均精力)[0];

  const sleepCorrelationData = moodRecords
    .filter(r => r.sleepQuality)
    .slice(0, 20)
    .map((r, i) => ({
      index: i + 1,
      睡眠质量: sleepScore[r.sleepQuality!],
      次日情绪: r.dimensions.pleasure
    }));

  return (
    <div className="card">
      <h2>📊 模式识别</h2>

      {moodRecords.length === 0 ? (
        <p className="empty-state">还没有情绪记录，无法进行分析</p>
      ) : (
        <>
          <div className="section">
            <h3>📈 情绪洞察</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-icon">📉</div>
                <div className="insight-content">
                  <div className="insight-title">情绪最低落</div>
                  <div className="insight-value">{lowestDay?.day || '暂无数据'}</div>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">⚡</div>
                <div className="insight-content">
                  <div className="insight-title">精力最佳</div>
                  <div className="insight-value">{highestEnergySlot?.时间段 || '暂无数据'}</div>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">🔍</div>
                <div className="insight-content">
                  <div className="insight-title">记录总数</div>
                  <div className="insight-value">{moodRecords.length} 次</div>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>📅 一周情绪变化</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="愉悦度" stroke="#FF6B6B" strokeWidth={2} dot={{ fill: '#FF6B6B' }} />
                <Line type="monotone" dataKey="精力" stroke="#4ECDC4" strokeWidth={2} dot={{ fill: '#4ECDC4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="section">
            <h3>⏰ 时段精力分布</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeSlotData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="时间段" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="平均精力" fill="#4ECDC4" />
                <Bar dataKey="平均愉悦度" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="section">
            <h3>🎯 情绪触发因素统计</h3>
            {triggerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={triggerData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {triggerData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="empty-state">还没有触发因素数据</p>
            )}
          </div>

          {sleepCorrelationData.length >= 3 && (
            <div className="section">
              <h3>😴 睡眠与情绪关联</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sleepCorrelationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="睡眠质量" stroke="#AA96DA" strokeWidth={2} />
                  <Line type="monotone" dataKey="次日情绪" stroke="#FF6B6B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatternAnalysis;
