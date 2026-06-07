import React, { useState, useEffect } from 'react';
import { plotsAPI, farmingAPI, harvestAPI, pestsAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    plots: 0,
    operations: 0,
    harvest: 0,
    pestRecords: 0,
  });
  const [yieldAnalysis, setYieldAnalysis] = useState<any[]>([]);
  const [varietyCompare, setVarietyCompare] = useState<any[]>([]);
  const [seasonPatterns, setSeasonPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plotsRes, operationsRes, harvestRes, pestsRes, yieldRes, varietyRes, patternsRes] = await Promise.all([
        plotsAPI.getAll(),
        farmingAPI.getOperations(),
        harvestAPI.getAll(),
        pestsAPI.getRecords(),
        harvestAPI.getYieldInputAnalysis(),
        harvestAPI.getVarietyCompare(),
        pestsAPI.getSeasonPatterns(),
      ]);

      setStats({
        plots: plotsRes.data.length,
        operations: operationsRes.data.length,
        harvest: harvestRes.data.reduce((sum: number, h: any) => sum + h.yield, 0),
        pestRecords: pestsRes.data.length,
      });
      setYieldAnalysis(yieldRes.data);
      setVarietyCompare(varietyRes.data);
      setSeasonPatterns(patternsRes.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#4caf50', '#8bc34a', '#cddc39', '#ffc107', '#ff9800', '#ff5722'];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>;
  }

  return (
    <div>
      <div className="grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <h3>地块总数</h3>
          <div className="value">{stats.plots}</div>
          <div className="change" style={{ color: '#4caf50' }}>个地块</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#2196f3' }}>
          <h3>农事操作</h3>
          <div className="value" style={{ color: '#1565c0' }}>{stats.operations}</div>
          <div className="change" style={{ color: '#1976d2' }}>次操作记录</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ff9800' }}>
          <h3>总产量</h3>
          <div className="value" style={{ color: '#e65100' }}>{(stats.harvest / 1000).toFixed(1)}k</div>
          <div className="change" style={{ color: '#f57c00' }}>公斤</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f44336' }}>
          <h3>病虫害记录</h3>
          <div className="value" style={{ color: '#c62828' }}>{stats.pestRecords}</div>
          <div className="change" style={{ color: '#d32f2f' }}>条记录</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>投入产出分析</h2>
          </div>
          <div className="chart-container">
            <BarChart data={yieldAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="plot_number" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost_per_mu" name="亩均投入(元)" fill="#ff9800" />
              <Bar dataKey="revenue_per_mu" name="亩均收入(元)" fill="#4caf50" />
              <Bar dataKey="profit_per_mu" name="亩均利润(元)" fill="#2196f3" />
            </BarChart>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>品种产量对比</h2>
          </div>
          <div className="chart-container">
            <BarChart data={varietyCompare} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="crop_variety" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="yield_per_mu" name="亩产(公斤)" fill="#8bc34a" />
              <Bar dataKey="average_yield" name="平均产量(公斤)" fill="#4caf50" />
            </BarChart>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>病虫害季节规律</h2>
          </div>
          <div className="chart-container">
            <BarChart data={
              Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const monthData = seasonPatterns.filter(p => p.month === month);
                return {
                  month: `${month}月`,
                  count: monthData.reduce((sum, p) => sum + p.count, 0),
                  ...Object.fromEntries(monthData.map(p => [p.pest_name, p.count]))
                };
              })
            }>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {[...new Set(seasonPatterns.map(p => p.pest_name))].map((name, idx) => (
                <Bar key={name} dataKey={name} stackId="a" fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>产量分布</h2>
          </div>
          <div className="chart-container">
            <PieChart>
              <Pie
                data={varietyCompare.map(v => ({ name: v.crop_variety, value: v.total_yield }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {varietyCompare.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
