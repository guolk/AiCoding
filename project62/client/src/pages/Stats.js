import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { statsAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Stats = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [summaryRes, monthlyRes, statusRes, yearRes] = await Promise.all([
        statsAPI.getSummary(),
        statsAPI.getMonthlyReading(),
        statsAPI.getStatusDistribution(),
        statsAPI.getYearDistribution(),
      ]);

      setSummary(summaryRes.data);
      setMonthlyData(monthlyRes.data);
      setStatusData(statusRes.data);
      setYearData(yearRes.data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusLabels = {
    unread: '未读',
    reading: '阅读中',
    completed: '已完成',
    mastered: '精读完成',
  };

  const statusColors = {
    unread: '#94a3b8',
    reading: '#3b82f6',
    completed: '#10b981',
    mastered: '#8b5cf6',
  };

  const monthlyChartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: '阅读文献数',
        data: monthlyData.map((d) => d.papers_read),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const statusChartData = {
    labels: statusData.map((d) => statusLabels[d.status] || d.status),
    datasets: [
      {
        data: statusData.map((d) => d.count),
        backgroundColor: statusData.map((d) => statusColors[d.status] || '#94a3b8'),
        borderWidth: 0,
      },
    ],
  };

  const yearChartData = {
    labels: yearData.map((d) => d.year),
    datasets: [
      {
        label: '文献数量',
        data: yearData.map((d) => d.count),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="empty-state" style={{ height: '60vh' }}>
          <div className="empty-icon">⏳</div>
          <div className="empty-title">加载统计数据中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <h1 style={{ marginBottom: '24px' }}>阅读统计</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{summary?.total_papers || 0}</div>
          <div className="stat-label">总文献数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary?.total_annotations || 0}</div>
          <div className="stat-label">总批注数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary?.reading_papers || 0}</div>
          <div className="stat-label">正在阅读</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary?.completed_papers || 0}</div>
          <div className="stat-label">已完成</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '24px' }}>
        <div className="chart-container">
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>月度阅读量</h3>
          <div style={{ height: '300px' }}>
            {monthlyData.length > 0 ? (
              <Bar data={monthlyChartData} options={chartOptions} />
            ) : (
              <div className="empty-state" style={{ padding: '40px' }}>
                <div className="empty-description">暂无数据</div>
              </div>
            )}
          </div>
        </div>

        <div className="chart-container">
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>阅读状态分布</h3>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {statusData.length > 0 ? (
              <Pie data={statusChartData} options={pieOptions} />
            ) : (
              <div className="empty-state" style={{ padding: '40px' }}>
                <div className="empty-description">暂无数据</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="chart-container" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>文献发表年份分布</h3>
        <div style={{ height: '300px' }}>
          {yearData.length > 0 ? (
            <Bar data={yearChartData} options={chartOptions} />
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-description">暂无数据</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
