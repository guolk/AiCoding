import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Layers, Printer, Settings, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { costsAPI, projectsAPI, filamentsAPI, printersAPI } from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [lowFilaments, setLowFilaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryRes, projectsRes, filamentsRes, printersRes] = await Promise.all([
        costsAPI.getSummary('all'),
        projectsAPI.getAll(),
        filamentsAPI.getAll(),
        printersAPI.getAll()
      ]);
      setSummary(summaryRes.data);
      setRecentProjects(projectsRes.data.slice(0, 5));
      setLowFilaments(filamentsRes.data.filter(f => (f.current_weight / f.initial_weight) < 0.2).slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-8 h-8 text-blue-500" />}
          title="总项目数"
          value={summary?.projects?.total || 0}
          color="blue"
          link="/projects"
        />
        <StatCard
          icon={<Clock className="w-8 h-8 text-green-500" />}
          title="打印时长"
          value={`${summary?.printing?.total_hours || 0} 小时`}
          color="green"
        />
        <StatCard
          icon={<CheckCircle className="w-8 h-8 text-purple-500" />}
          title="平均成功率"
          value={`${summary?.projects?.avg_success_rate || 0}%`}
          color="purple"
        />
        <StatCard
          icon={<Layers className="w-8 h-8 text-orange-500" />}
          title="耗材使用"
          value={`${summary?.filament?.total_used || 0}g`}
          color="orange"
          link="/filaments"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">最近项目</h2>
            <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-700">查看全部</Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无打印项目</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map(project => (
                <Link key={project.id} to={`/projects/${project.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.printer_name || '未指定打印机'}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={project.status} />
                    <p className="text-xs text-gray-500 mt-1">{project.print_date || project.created_at?.split('T')[0]}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">耗材预警</h2>
            <Link to="/filaments" className="text-sm text-blue-600 hover:text-blue-700">查看全部</Link>
          </div>
          {lowFilaments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">所有耗材库存充足</p>
          ) : (
            <div className="space-y-3">
              {lowFilaments.map(filament => (
                <div key={filament.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-200" style={{ backgroundColor: filament.color_hex || '#ccc' }} />
                    <div>
                      <p className="font-medium text-gray-800">{filament.brand} {filament.model}</p>
                      <p className="text-sm text-gray-500">{filament.color} - {filament.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600">
                      {Math.round((filament.current_weight / filament.initial_weight) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction icon={<Package />} title="新建项目" to="/projects" color="blue" />
          <QuickAction icon={<Layers />} title="添加耗材" to="/filaments" color="green" />
          <QuickAction icon={<Printer />} title="添加打印机" to="/printers" color="purple" />
          <QuickAction icon={<Settings />} title="切片参数" to="/profiles" color="orange" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, link }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100',
    orange: 'bg-orange-50 border-orange-100',
  };

  const content = (
    <div className={`p-6 rounded-xl border ${colors[color]} transition-transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-sm text-gray-600 mt-2">{title}</p>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
}

function QuickAction({ icon, title, to, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
    green: 'bg-green-100 text-green-600 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
  };

  return (
    <Link to={to} className={`flex flex-col items-center justify-center p-6 rounded-xl ${colors[color]} transition-colors`}>
      {React.cloneElement(icon, { className: 'w-8 h-8 mb-2' })}
      <span className="font-medium">{title}</span>
    </Link>
  );
}

function StatusBadge({ status }) {
  const styles = {
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    printing: 'bg-blue-100 text-blue-700',
    pending: 'bg-gray-100 text-gray-700',
  };

  const labels = {
    completed: '已完成',
    failed: '失败',
    printing: '打印中',
    pending: '待打印',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}