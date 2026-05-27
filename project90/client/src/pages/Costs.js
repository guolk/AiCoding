import React, { useState, useEffect } from 'react';
import { DollarSign, Zap, Clock, Settings, Calculator, TrendingUp, Package } from 'lucide-react';
import { costsAPI, projectsAPI, filamentsAPI } from '../services/api';

export default function Costs() {
  const [settings, setSettings] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    electricity_rate: '0.6',
    printer_power: '300',
    printer_lifespan_hours: '5000',
    printer_cost: '2000',
    labor_cost_per_hour: '50',
    markup_percentage: '50',
  });
  const [calculatorInput, setCalculatorInput] = useState({
    filament_used: '',
    filament_price: '',
    filament_initial_weight: '1000',
    print_duration: '',
  });
  const [calculatorResult, setCalculatorResult] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectCostResult, setProjectCostResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, projectsRes, filamentsRes, summaryRes] = await Promise.all([
        costsAPI.getSettings(),
        projectsAPI.getAll(),
        filamentsAPI.getAll(),
        costsAPI.getSummary('all'),
      ]);
      setSettings(settingsRes.data);
      setProjects(projectsRes.data);
      setFilaments(filamentsRes.data);
      setSummary(summaryRes.data);
      setSettingsForm({
        electricity_rate: settingsRes.data.electricity_rate.toString(),
        printer_power: settingsRes.data.printer_power.toString(),
        printer_lifespan_hours: settingsRes.data.printer_lifespan_hours.toString(),
        printer_cost: settingsRes.data.printer_cost.toString(),
        labor_cost_per_hour: settingsRes.data.labor_cost_per_hour.toString(),
        markup_percentage: settingsRes.data.markup_percentage.toString(),
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const data = {
        electricity_rate: parseFloat(settingsForm.electricity_rate),
        printer_power: parseFloat(settingsForm.printer_power),
        printer_lifespan_hours: parseFloat(settingsForm.printer_lifespan_hours),
        printer_cost: parseFloat(settingsForm.printer_cost),
        labor_cost_per_hour: parseFloat(settingsForm.labor_cost_per_hour),
        markup_percentage: parseFloat(settingsForm.markup_percentage),
      };
      await costsAPI.updateSettings(data);
      loadData();
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    try {
      const data = {
        filament_used: parseFloat(calculatorInput.filament_used),
        filament_price: parseFloat(calculatorInput.filament_price),
        filament_initial_weight: parseFloat(calculatorInput.filament_initial_weight),
        print_duration: parseFloat(calculatorInput.print_duration),
      };
      const res = await costsAPI.calculate(data);
      setCalculatorResult(res.data);
    } catch (error) {
      console.error('Error calculating:', error);
    }
  };

  const handleCalculateProject = async (projectId) => {
    try {
      const res = await costsAPI.calculateProject(projectId);
      setSelectedProject(projectId);
      setProjectCostResult(res.data);
    } catch (error) {
      console.error('Error calculating project cost:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">成本核算</h1>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>成本设置</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign className="w-6 h-6 text-green-500" />} label="预计总电费" value={`¥${summary?.estimated_costs?.electricity || 0}`} color="green" />
        <StatCard icon={<Clock className="w-6 h-6 text-blue-500" />} label="总打印时长" value={`${summary?.printing?.total_hours || 0}h`} color="blue" />
        <StatCard icon={<Package className="w-6 h-6 text-orange-500" />} label="耗材使用" value={`${summary?.filament?.total_used || 0}g`} color="orange" />
        <StatCard icon={<TrendingUp className="w-6 h-6 text-purple-500" />} label="平均成功率" value={`${summary?.projects?.avg_success_rate || 0}%`} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">成本计算器</h2>
          </div>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">耗材使用量 (g) *</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={calculatorInput.filament_used}
                  onChange={(e) => setCalculatorInput({ ...calculatorInput, filament_used: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">耗材单价 (¥) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={calculatorInput.filament_price}
                  onChange={(e) => setCalculatorInput({ ...calculatorInput, filament_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">耗材总重量 (g)</label>
                <input
                  type="number"
                  value={calculatorInput.filament_initial_weight}
                  onChange={(e) => setCalculatorInput({ ...calculatorInput, filament_initial_weight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">打印时长 (分钟) *</label>
                <input
                  type="number"
                  required
                  value={calculatorInput.print_duration}
                  onChange={(e) => setCalculatorInput({ ...calculatorInput, print_duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              计算成本
            </button>
          </form>

          {calculatorResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">计算结果</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">耗材费用</span>
                  <span className="font-medium">¥{calculatorResult.breakdown.filament_cost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">电费</span>
                  <span className="font-medium">¥{calculatorResult.breakdown.electricity_cost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">设备磨损分摊</span>
                  <span className="font-medium">¥{calculatorResult.breakdown.wear_cost}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">总成本</span>
                    <span className="font-bold text-lg text-gray-800">¥{calculatorResult.total_cost}</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">建议定价</span>
                    <span className="font-bold text-xl text-blue-600">¥{calculatorResult.suggested_price}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">当前成本设置</h2>
          {settings && (
            <div className="space-y-3">
              <SettingItem icon={<Zap className="w-4 h-4" />} label="电费单价" value={`¥${settings.electricity_rate}/度`} />
              <SettingItem icon={<Zap className="w-4 h-4" />} label="打印机功率" value={`${settings.printer_power}W`} />
              <SettingItem icon={<Clock className="w-4 h-4" />} label="设备寿命" value={`${settings.printer_lifespan_hours}小时`} />
              <SettingItem icon={<DollarSign className="w-4 h-4" />} label="设备成本" value={`¥${settings.printer_cost}`} />
              <SettingItem icon={<TrendingUp className="w-4 h-4" />} label="利润加成" value={`${settings.markup_percentage}%`} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">项目成本明细</h2>
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无打印项目</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">项目名称</th>
                  <th className="pb-3 font-medium">耗材使用</th>
                  <th className="pb-3 font-medium">打印时长</th>
                  <th className="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 10).map(project => (
                  <tr key={project.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-800">{project.name}</td>
                    <td className="py-3 text-gray-600">{project.filament_used || 0}g</td>
                    <td className="py-3 text-gray-600">{project.print_duration || 0}分钟</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleCalculateProject(project.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        查看成本
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {projectCostResult && selectedProject && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">
              {projects.find(p => p.id === selectedProject)?.name} - 成本明细
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">耗材费用</p>
                <p className="font-bold text-lg text-gray-800">¥{projectCostResult.breakdown.filament_cost}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">电费</p>
                <p className="font-bold text-lg text-gray-800">¥{projectCostResult.breakdown.electricity_cost}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">设备磨损</p>
                <p className="font-bold text-lg text-gray-800">¥{projectCostResult.breakdown.wear_cost}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">建议定价</p>
                <p className="font-bold text-lg text-blue-600">¥{projectCostResult.suggested_price}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">成本设置</h2>
            </div>
            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">电费单价 (元/度)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settingsForm.electricity_rate}
                    onChange={(e) => setSettingsForm({ ...settingsForm, electricity_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">打印机功率 (W)</label>
                  <input
                    type="number"
                    value={settingsForm.printer_power}
                    onChange={(e) => setSettingsForm({ ...settingsForm, printer_power: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">设备寿命 (小时)</label>
                  <input
                    type="number"
                    value={settingsForm.printer_lifespan_hours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, printer_lifespan_hours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">设备成本 (元)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settingsForm.printer_cost}
                    onChange={(e) => setSettingsForm({ ...settingsForm, printer_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">利润加成 (%)</label>
                <input
                  type="number"
                  value={settingsForm.markup_percentage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, markup_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存设置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    green: 'bg-green-50 border-green-100',
    blue: 'bg-blue-50 border-blue-100',
    orange: 'bg-orange-50 border-orange-100',
    purple: 'bg-purple-50 border-purple-100',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SettingItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2 text-gray-600">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}