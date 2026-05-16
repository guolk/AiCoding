import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './App.css';

const CATEGORIES = ['娱乐', '工具', '学习', '云服务', '音乐', '视频', '其他'];
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384'];

function App() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState({ monthly_total: 0, yearly_total: 0, active_count: 0 });
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [roiScores, setRoiScores] = useState([]);
  const [recommendations, setRecommendations] = useState({ unused_subscriptions: [], merge_suggestions: [], savings_suggestions: [] });
  const [usageRecords, setUsageRecords] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [cancelledSubscriptions, setCancelledSubscriptions] = useState([]);
  const [reminders, setReminders] = useState({ billing_reminders: [], trial_reminders: [] });
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterStatus, setFilterStatus] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    monthly_fee: '',
    yearly_fee: '',
    next_billing_date: '',
    payment_method: '',
    account_info: '',
    category: '其他',
    status: 'active',
    is_trial: false,
    trial_end_date: '',
    reminder_days: 3
  });

  useEffect(() => {
    fetchData();
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [subsRes, analyticsRes, categoryRes, roiRes, recsRes, usageRes, trendRes, cancelledRes, remindersRes] = await Promise.all([
        axios.get('/api/subscriptions'),
        axios.get('/api/analytics/summary'),
        axios.get('/api/analytics/category-breakdown'),
        axios.get('/api/analytics/roi-scores'),
        axios.get('/api/recommendations'),
        axios.get('/api/usage'),
        axios.get('/api/history/monthly-trend'),
        axios.get('/api/history/cancelled'),
        axios.get('/api/upcoming-reminders')
      ]);

      setSubscriptions(subsRes.data);
      setAnalytics(analyticsRes.data);
      setCategoryBreakdown(categoryRes.data);
      setRoiScores(roiRes.data);
      setRecommendations(recsRes.data);
      setUsageRecords(usageRes.data);
      setMonthlyTrend(trendRes.data);
      setCancelledSubscriptions(cancelledRes.data);
      setReminders(remindersRes.data);
    } catch (err) {
      console.error('获取数据失败:', err);
    }
  };

  const showNotificationMsg = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        monthly_fee: parseFloat(formData.monthly_fee) || 0,
        yearly_fee: parseFloat(formData.yearly_fee) || 0,
        reminder_days: parseInt(formData.reminder_days) || 0,
        is_trial: formData.is_trial ? 1 : 0
      };

      if (editingSubscription) {
        await axios.put(`/api/subscriptions/${editingSubscription.id}`, submitData);
        showNotificationMsg('success', '订阅更新成功！');
      } else {
        await axios.post('/api/subscriptions', submitData);
        showNotificationMsg('success', '订阅添加成功！');
      }
      setShowModal(false);
      setEditingSubscription(null);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('保存失败:', err);
      showNotificationMsg('error', '操作失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      monthly_fee: '',
      yearly_fee: '',
      next_billing_date: '',
      payment_method: '',
      account_info: '',
      category: '其他',
      status: 'active',
      is_trial: false,
      trial_end_date: '',
      reminder_days: 3
    });
  };

  const handleEdit = (sub) => {
    setEditingSubscription(sub);
    setFormData({
      name: sub.name,
      monthly_fee: sub.monthly_fee,
      yearly_fee: sub.yearly_fee,
      next_billing_date: sub.next_billing_date,
      payment_method: sub.payment_method,
      account_info: sub.account_info || '',
      category: sub.category,
      status: sub.status,
      is_trial: sub.is_trial === 1,
      trial_end_date: sub.trial_end_date,
      reminder_days: sub.reminder_days
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个订阅吗？')) {
      try {
        await axios.delete(`/api/subscriptions/${id}`);
        showNotificationMsg('success', '订阅删除成功！');
        fetchData();
      } catch (err) {
        console.error('删除失败:', err);
        showNotificationMsg('error', '删除失败: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const recordUsage = async (subscriptionId) => {
    try {
      await axios.post('/api/usage', {
        subscription_id: subscriptionId,
        usage_date: dayjs().format('YYYY-MM-DD'),
        usage_time: dayjs().format('HH:mm:ss'),
        duration: 0,
        notes: ''
      });
      showNotificationMsg('success', '打卡成功！');
      fetchData();
    } catch (err) {
      console.error('记录使用失败:', err);
      showNotificationMsg('error', '打卡失败: ' + (err.response?.data?.error || err.message));
    }
  };

  const pieChartData = Object.keys(categoryBreakdown).map((key, index) => ({
    name: key,
    value: categoryBreakdown[key].monthly_cost
  }));

  const filteredSubscriptions = filterStatus
    ? subscriptions.filter(s => s.status === filterStatus)
    : subscriptions;

  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <div className="logo">
            <h1>📊 订阅管理器</h1>
          </div>
          <div className="nav-links">
            <Link to="/" className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              📈 仪表盘
            </Link>
            <Link to="/subscriptions" className={`nav-link ${activeTab === 'subscriptions' ? 'active' : ''}`} onClick={() => setActiveTab('subscriptions')}>
              📋 订阅管理
            </Link>
            <Link to="/analytics" className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
              📊 消费分析
            </Link>
            <Link to="/recommendations" className={`nav-link ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>
              💡 优化建议
            </Link>
            <Link to="/usage" className={`nav-link ${activeTab === 'usage' ? 'active' : ''}`} onClick={() => setActiveTab('usage')}>
              ⏱️ 使用追踪
            </Link>
            <Link to="/history" className={`nav-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              📜 历史记录
            </Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <Dashboard
                analytics={analytics}
                reminders={reminders}
                subscriptions={subscriptions}
                pieChartData={pieChartData}
                monthlyTrend={monthlyTrend}
                roiScores={roiScores}
                recordUsage={recordUsage}
                setShowModal={setShowModal}
              />
            } />
            <Route path="/subscriptions" element={
              <SubscriptionManagement
                subscriptions={filteredSubscriptions}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                setShowModal={setShowModal}
                recordUsage={recordUsage}
              />
            } />
            <Route path="/analytics" element={
              <Analytics
                analytics={analytics}
                categoryBreakdown={categoryBreakdown}
                pieChartData={pieChartData}
                roiScores={roiScores}
                monthlyTrend={monthlyTrend}
              />
            } />
            <Route path="/recommendations" element={
              <Recommendations recommendations={recommendations} />
            } />
            <Route path="/usage" element={
              <UsageTracking
                subscriptions={subscriptions}
                usageRecords={usageRecords}
                recordUsage={recordUsage}
              />
            } />
            <Route path="/history" element={
              <History
                monthlyTrend={monthlyTrend}
                cancelledSubscriptions={cancelledSubscriptions}
                analytics={analytics}
              />
            } />
          </Routes>
        </main>

        {showModal && (
          <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingSubscription(null); resetForm(); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingSubscription ? '编辑订阅' : '添加新订阅'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>服务名称 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>月费 (¥)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthly_fee}
                      onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>年费 (¥)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.yearly_fee}
                      onChange={(e) => setFormData({ ...formData, yearly_fee: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>下次扣款日期</label>
                    <input
                      type="date"
                      value={formData.next_billing_date}
                      onChange={(e) => setFormData({ ...formData, next_billing_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>付款方式</label>
                    <input
                      type="text"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      placeholder="如：支付宝、微信、信用卡"
                    />
                  </div>
                  <div className="form-group">
                    <label>分类</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>状态</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">活跃</option>
                      <option value="paused">暂停</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>提前提醒天数</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={formData.reminder_days}
                      onChange={(e) => setFormData({ ...formData, reminder_days: e.target.value })}
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.is_trial}
                        onChange={(e) => setFormData({ ...formData, is_trial: e.target.checked })}
                      />
                      免费试用
                    </label>
                  </div>
                  {formData.is_trial && (
                    <div className="form-group">
                      <label>试用结束日期</label>
                      <input
                        type="date"
                        value={formData.trial_end_date}
                        onChange={(e) => setFormData({ ...formData, trial_end_date: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="form-group full-width">
                    <label>账号信息（加密存储）</label>
                    <textarea
                      value={formData.account_info}
                      onChange={(e) => setFormData({ ...formData, account_info: e.target.value })}
                      placeholder="如：登录邮箱、账号等"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); setEditingSubscription(null); resetForm(); }} disabled={loading}>
                    取消
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '保存中...' : (editingSubscription ? '保存更改' : '添加订阅')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.type === 'success' ? '✓' : '✕'} {notification.message}
          </div>
        )}
      </div>
    </Router>
  );
}

function Dashboard({ analytics, reminders, subscriptions, pieChartData, monthlyTrend, roiScores, recordUsage, setShowModal }) {
  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>仪表盘</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + 添加订阅
        </button>
      </div>

      {reminders.billing_reminders.length > 0 && (
        <div className="alert alert-warning">
          <h3>⚠️ 即将扣款提醒</h3>
          <div className="reminder-list">
            {reminders.billing_reminders.map(sub => (
              <div key={sub.id} className="reminder-item">
                <span className="reminder-name">{sub.name}</span>
                <span className="reminder-date">扣款日期: {sub.next_billing_date}</span>
                <span className="reminder-amount">¥{sub.monthly_fee || sub.yearly_fee}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders.trial_reminders.length > 0 && (
        <div className="alert alert-info">
          <h3>🎁 免费试用即将到期</h3>
          <div className="reminder-list">
            {reminders.trial_reminders.map(sub => (
              <div key={sub.id} className="reminder-item">
                <span className="reminder-name">{sub.name}</span>
                <span className="reminder-date">到期日期: {sub.trial_end_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>月度总支出</h3>
            <p className="stat-value">¥{analytics.monthly_total.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>年度总支出</h3>
            <p className="stat-value">¥{analytics.yearly_total.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>活跃订阅</h3>
            <p className="stat-value">{analytics.active_count} 个</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>订阅分类占比</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>月度支出趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={(val) => val.split('-')[1] + '月'} />
              <YAxis />
              <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="total" name="月支出" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-card">
        <h3>快速打卡</h3>
        <div className="quick-usage-grid">
          {subscriptions.filter(s => s.status === 'active').slice(0, 6).map(sub => (
            <div key={sub.id} className="quick-usage-card" onClick={() => recordUsage(sub.id)}>
              <span className="quick-usage-name">{sub.name}</span>
              <span className="quick-usage-btn">✓ 打卡</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <h3>ROI 评分</h3>
        <div className="roi-list">
          {roiScores.slice(0, 5).map(roi => (
            <div key={roi.subscription_id} className="roi-item">
              <span className="roi-name">{roi.name}</span>
              <div className="roi-bar">
                <div className="roi-progress" style={{ width: `${roi.roi_score}%`, background: roi.roi_score >= 75 ? '#4ade80' : roi.roi_score >= 50 ? '#fbbf24' : '#f87171' }}></div>
              </div>
              <span className={`roi-status ${roi.status}`}>{roi.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubscriptionManagement({ subscriptions, filterStatus, setFilterStatus, handleEdit, handleDelete, setShowModal, recordUsage }) {
  const getStatusBadge = (status) => {
    const badges = {
      active: { text: '活跃', class: 'status-active' },
      paused: { text: '暂停', class: 'status-paused' },
      cancelled: { text: '已取消', class: 'status-cancelled' }
    };
    return badges[status] || badges.active;
  };

  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <h1>订阅管理</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + 添加订阅
        </button>
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${!filterStatus ? 'active' : ''}`} onClick={() => setFilterStatus('')}>全部</button>
        <button className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`} onClick={() => setFilterStatus('active')}>活跃</button>
        <button className={`filter-btn ${filterStatus === 'paused' ? 'active' : ''}`} onClick={() => setFilterStatus('paused')}>暂停</button>
        <button className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`} onClick={() => setFilterStatus('cancelled')}>已取消</button>
      </div>

      <div className="subscriptions-grid">
        {subscriptions.map(sub => {
          const badge = getStatusBadge(sub.status);
          return (
            <div key={sub.id} className="subscription-card">
              <div className="subscription-header">
                <h3>{sub.name}</h3>
                <span className={`status-badge ${badge.class}`}>{badge.text}</span>
              </div>
              <div className="subscription-details">
                <p><span className="detail-label">分类:</span> {sub.category}</p>
                <p><span className="detail-label">月费:</span> ¥{sub.monthly_fee || sub.yearly_fee / 12}</p>
                <p><span className="detail-label">下次扣款:</span> {sub.next_billing_date || '未设置'}</p>
                {sub.is_trial === 1 && (
                  <p><span className="detail-label">试用到期:</span> {sub.trial_end_date}</p>
                )}
              </div>
              <div className="subscription-actions">
                <button className="btn-icon" onClick={() => recordUsage(sub.id)} title="打卡">⏱️</button>
                <button className="btn-icon" onClick={() => handleEdit(sub)} title="编辑">✏️</button>
                <button className="btn-icon btn-delete" onClick={() => handleDelete(sub.id)} title="删除">🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Analytics({ analytics, categoryBreakdown, pieChartData, roiScores, monthlyTrend }) {
  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>消费分析</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card large">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>月度总支出</h3>
            <p className="stat-value large">¥{analytics.monthly_total.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card large">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>年度总支出</h3>
            <p className="stat-value large">¥{analytics.yearly_total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>分类支出占比</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>分类支出详情</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={Object.keys(categoryBreakdown).map(key => ({ name: key, value: categoryBreakdown[key].monthly_cost }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
              <Bar dataKey="value" name="月支出" fill="#8884d8">
                {Object.keys(categoryBreakdown).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-card">
        <h3>订阅 ROI 评分</h3>
        <div className="roi-full-list">
          {roiScores.map(roi => (
            <div key={roi.subscription_id} className="roi-full-item">
              <div className="roi-info">
                <span className="roi-name">{roi.name}</span>
                <span className="roi-cost">¥{roi.monthly_cost.toFixed(2)}/月</span>
                <span className="roi-usage">{roi.usage_count} 次/月</span>
                <span className="roi-cpu">¥{roi.cost_per_use.toFixed(2)}/次</span>
              </div>
              <div className="roi-bar-container">
                <div className="roi-bar">
                  <div className="roi-progress" style={{ width: `${roi.roi_score}%`, background: roi.roi_score >= 75 ? '#4ade80' : roi.roi_score >= 50 ? '#fbbf24' : '#f87171' }}></div>
                </div>
                <span className={`roi-status-large ${roi.status}`}>{roi.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Recommendations({ recommendations }) {
  return (
    <div className="recommendations-page">
      <div className="page-header">
        <h1>优化建议</h1>
      </div>

      {recommendations.unused_subscriptions.length > 0 && (
        <div className="recommendation-section">
          <div className="recommendation-header warning">
            <h2>⚠️ 长期未使用的订阅</h2>
            <span className="recommendation-count">{recommendations.unused_subscriptions.length} 个</span>
          </div>
          <div className="recommendation-list">
            {recommendations.unused_subscriptions.map(sub => (
              <div key={sub.id} className="recommendation-item">
                <div className="item-info">
                  <span className="item-name">{sub.name}</span>
                  <span className="item-cost">¥{sub.monthly_fee || sub.yearly_fee / 12}/月</span>
                </div>
                <span className="item-tag">超过30天未使用</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.merge_suggestions.length > 0 && (
        <div className="recommendation-section">
          <div className="recommendation-header info">
            <h2>🔄 相似功能订阅合并建议</h2>
            <span className="recommendation-count">{recommendations.merge_suggestions.length} 组</span>
          </div>
          {recommendations.merge_suggestions.map((group, index) => (
            <div key={index} className="merge-group">
              <h4>{group.category}</h4>
              <div className="merge-items">
                {group.subscriptions.map(sub => (
                  <span key={sub.id} className="merge-item-tag">{sub.name}</span>
                ))}
              </div>
              <p className="merge-suggestion-text">建议评估是否需要保留多个同类订阅</p>
            </div>
          ))}
        </div>
      )}

      {recommendations.savings_suggestions.length > 0 && (
        <div className="recommendation-section">
          <div className="recommendation-header success">
            <h2>💰 年付优惠方案</h2>
            <span className="recommendation-count">{recommendations.savings_suggestions.length} 个</span>
          </div>
          <div className="savings-list">
            {recommendations.savings_suggestions.map(saving => (
              <div key={saving.subscription_id} className="savings-item">
                <div className="savings-info">
                  <span className="savings-name">{saving.name}</span>
                  <div className="savings-compare">
                    <span className="compare-old">月付: ¥{saving.monthly_fee} × 12 = ¥{(saving.monthly_fee * 12).toFixed(2)}</span>
                    <span className="compare-arrow">→</span>
                    <span className="compare-new">年付: ¥{saving.yearly_fee}</span>
                  </div>
                </div>
                <div className="savings-amount">
                  <span className="save-label">节省</span>
                  <span className="save-value">¥{saving.annual_savings}</span>
                  <span className="save-percent">({saving.savings_percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.unused_subscriptions.length === 0 &&
       recommendations.merge_suggestions.length === 0 &&
       recommendations.savings_suggestions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>太棒了！您的订阅管理非常健康</h3>
          <p>没有发现需要优化的订阅</p>
        </div>
      )}
    </div>
  );
}

function UsageTracking({ subscriptions, usageRecords, recordUsage }) {
  const todayRecords = usageRecords.filter(r => r.usage_date === dayjs().format('YYYY-MM-DD'));
  
  const heatmapData = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 7; day++) {
      const count = usageRecords.filter(r => {
        const h = parseInt(r.usage_time.split(':')[0]);
        return h === hour;
      }).length;
      heatmapData.push({ hour: `${hour}:00`, day: ['日', '一', '二', '三', '四', '五', '六'][day], count });
    }
  }

  return (
    <div className="usage-page">
      <div className="page-header">
        <h1>使用追踪</h1>
      </div>

      <div className="section-card">
        <h3>快速打卡</h3>
        <div className="quick-usage-grid full">
          {subscriptions.filter(s => s.status === 'active').map(sub => (
            <div key={sub.id} className="quick-usage-card" onClick={() => recordUsage(sub.id)}>
              <span className="quick-usage-name">{sub.name}</span>
              <span className="quick-usage-btn">✓ 打卡</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <h3>今日打卡记录 ({todayRecords.length})</h3>
        <div className="today-records">
          {todayRecords.length === 0 ? (
            <p className="empty-text">今日暂无打卡记录</p>
          ) : (
            todayRecords.slice(0, 10).map(record => (
              <div key={record.id} className="today-record-item">
                <span className="record-name">{record.subscription_name}</span>
                <span className="record-time">{record.usage_time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section-card">
        <h3>使用时段热力图</h3>
        <div className="heatmap-container">
          <div className="heatmap-labels">
            {[0, 4, 8, 12, 16, 20].map(hour => (
              <span key={hour} className="heatmap-hour-label">{hour}:00</span>
            ))}
          </div>
          <div className="heatmap-grid">
            {['日', '一', '二', '三', '四', '五', '六'].map((day, dayIndex) => (
              <div key={day} className="heatmap-column">
                {Array.from({ length: 24 }, (_, i) => i).map(hour => {
                  const count = usageRecords.filter(r => {
                    const h = parseInt(r.usage_time.split(':')[0]);
                    return h === hour;
                  }).length;
                  const intensity = Math.min(count / 5, 1);
                  return (
                    <div
                      key={hour}
                      className="heatmap-cell"
                      style={{
                        background: `rgba(102, 126, 234, ${intensity * 0.8 + 0.1})`
                      }}
                      title={`${day} ${hour}:00 - ${count}次使用`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>试用期倒计时</h3>
        <div className="trial-countdown-list">
          {subscriptions.filter(s => s.is_trial === 1 && s.status === 'active').map(sub => {
            const daysLeft = dayjs(sub.trial_end_date).diff(dayjs(), 'day');
            return (
              <div key={sub.id} className={`trial-countdown-item ${daysLeft <= 3 ? 'urgent' : ''}`}>
                <span className="trial-name">{sub.name}</span>
                <span className="trial-days">
                  {daysLeft > 0 ? `还剩 ${daysLeft} 天` : '已到期'}
                </span>
              </div>
            );
          })}
          {subscriptions.filter(s => s.is_trial === 1 && s.status === 'active').length === 0 && (
            <p className="empty-text">暂无试用中的订阅</p>
          )}
        </div>
      </div>
    </div>
  );
}

function History({ monthlyTrend, cancelledSubscriptions, analytics }) {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="history-page">
      <div className="page-header">
        <h1>历史记录</h1>
      </div>

      <div className="annual-summary">
        <h2>{currentYear} 年度订阅支出总结</h2>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-label">年度总支出</span>
            <span className="summary-value">¥{analytics.yearly_total.toFixed(2)}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">月均支出</span>
            <span className="summary-value">¥{(analytics.yearly_total / 12).toFixed(2)}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">已取消订阅</span>
            <span className="summary-value">{cancelledSubscriptions.length} 个</span>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>月度支出趋势</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickFormatter={(val) => val.split('-')[1] + '月'} />
            <YAxis />
            <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="total" name="月支出" fill="#667eea" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="section-card">
        <h3>已取消的订阅 ({cancelledSubscriptions.length})</h3>
        {cancelledSubscriptions.length === 0 ? (
          <p className="empty-text">暂无已取消的订阅</p>
        ) : (
          <div className="cancelled-list">
            {cancelledSubscriptions.map(sub => (
              <div key={sub.id} className="cancelled-item">
                <span className="cancelled-name">{sub.name}</span>
                <span className="cancelled-category">{sub.category}</span>
                <span className="cancelled-date">取消于: {sub.updated_at.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
