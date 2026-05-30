import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { useBillStore } from '../store/billStore';
import { useSavingStore } from '../store/savingStore';
import { useSettingsStore } from '../store/settingsStore';
import { predictNextMonthBill, calculateROI } from '../utils/calculator';
import { formatCurrency, getLast12Months, getMonthLabel } from '../utils/formatter';
import { ENERGY_INFO, EnergyType } from '../types';
import { Calculator, TrendingUp, PiggyBank, Coins } from 'lucide-react';

export default function Forecast() {
  const { bills, initData } = useBillStore();
  const { budget, updateBudget, initData: initSavingData } = useSavingStore();
  const { settings } = useSettingsStore();
  
  const [roiForm, setRoiForm] = useState({
    initialCost: '2000',
    monthlySavings: '100',
  });
  
  const [roiResult, setRoiResult] = useState<{
    paybackMonths: number;
    yearlyROI: number;
    fiveYearSavings: number;
  } | null>(null);
  
  useEffect(() => {
    initData();
    initSavingData();
  }, [initData, initSavingData]);
  
  useEffect(() => {
    calculateROIResult();
  }, [roiForm]);
  
  const calculateROIResult = () => {
    const cost = parseFloat(roiForm.initialCost) || 0;
    const savings = parseFloat(roiForm.monthlySavings) || 0;
    if (cost > 0 && savings > 0) {
      setRoiResult(calculateROI(cost, savings));
    } else {
      setRoiResult(null);
    }
  };
  
  const nextMonthElectricity = predictNextMonthBill(bills, 'electricity');
  const nextMonthGas = predictNextMonthBill(bills, 'gas');
  const nextMonthWater = predictNextMonthBill(bills, 'water');
  const nextMonthTotal = nextMonthElectricity + nextMonthGas + nextMonthWater;
  
  const months = getLast12Months();
  const forecastData = months.map(period => {
    const periodBills = bills.filter(b => b.billingPeriod === period);
    return {
      month: getMonthLabel(period),
      实际: periodBills.reduce((sum, b) => sum + b.amount, 0),
    };
  });
  forecastData.push({
    month: '下月',
    实际: 0,
  });
  
  const budgetData = [
    { name: '电力', 预算: budget?.electricityBudget || 2400, 实际: bills.filter(b => b.energyType === 'electricity').reduce((sum, b) => sum + b.amount, 0) },
    { name: '燃气', 预算: budget?.gasBudget || 600, 实际: bills.filter(b => b.energyType === 'gas').reduce((sum, b) => sum + b.amount, 0) },
    { name: '水', 预算: budget?.waterBudget || 400, 实际: bills.filter(b => b.energyType === 'water').reduce((sum, b) => sum + b.amount, 0) },
  ];
  
  const totalBudget = (budget?.electricityBudget || 2400) + (budget?.gasBudget || 600) + (budget?.waterBudget || 400);
  const totalActual = bills.reduce((sum, b) => sum + b.amount, 0);
  const budgetProgress = Math.min((totalActual / totalBudget) * 100, 100);
  
  const BUDGET_COLORS = ['#22c55e', '#ef4444'];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">下月电力预估</p>
          <p className="text-2xl font-display text-gray-800">{formatCurrency(nextMonthElectricity)}</p>
        </div>
        
        <div className="stat-card relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">下月燃气预估</p>
          <p className="text-2xl font-display text-gray-800">{formatCurrency(nextMonthGas)}</p>
        </div>
        
        <div className="stat-card relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">下月水费预估</p>
          <p className="text-2xl font-display text-gray-800">{formatCurrency(nextMonthWater)}</p>
        </div>
        
        <div className="stat-card relative overflow-hidden bg-gradient-to-br from-primary-50 to-emerald-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">下月总计预估</p>
          <p className="text-2xl font-display text-primary-600">{formatCurrency(nextMonthTotal)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">费用趋势与预测</h3>
          <p className="text-sm text-gray-500 mb-6">历史数据与下月预估</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  formatter={(value: number) => value > 0 ? formatCurrency(value) : '-'}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Line type="monotone" dataKey="实际" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">历史实际支出</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className="text-sm text-gray-600">下月预测</span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">年度预算规划</h3>
          <p className="text-sm text-gray-500 mb-6">{new Date().getFullYear()}年能源支出预算</p>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">年度总进度</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency(totalActual)} / {formatCurrency(totalBudget)}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetProgress > 90 
                    ? 'bg-gradient-to-r from-red-400 to-red-500' 
                    : budgetProgress > 70 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-primary-400 to-primary-600'
                }`}
                style={{ width: `${budgetProgress}%` }}
              ></div>
            </div>
            <p className={`text-xs mt-1 ${
              budgetProgress > 90 ? 'text-red-500' : budgetProgress > 70 ? 'text-orange-500' : 'text-gray-400'
            }`}>
              已使用 {budgetProgress.toFixed(1)}% 的年度预算
            </p>
          </div>
          
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="预算" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="实际" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">节能措施ROI计算</h3>
            <p className="text-sm text-gray-500">计算节能设备的投资回报</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">设备投入成本 (元)</label>
              <input
                type="number"
                value={roiForm.initialCost}
                onChange={e => setRoiForm({ ...roiForm, initialCost: e.target.value })}
                className="input-field"
                placeholder="如：2000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">预计每月节省 (元)</label>
              <input
                type="number"
                value={roiForm.monthlySavings}
                onChange={e => setRoiForm({ ...roiForm, monthlySavings: e.target.value })}
                className="input-field"
                placeholder="如：100"
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">常见节能设备参考：</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <p>• LED灯泡: ¥200 → ¥50/月</p>
                <p>• 节能空调: ¥5000 → ¥200/月</p>
                <p>• 智能温控: ¥500 → ¥80/月</p>
                <p>• 太阳能: ¥20000 → ¥500/月</p>
              </div>
            </div>
          </div>
          
          {roiResult && (
            <div className="bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">计算结果</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">投资回收期</p>
                  <p className="text-3xl font-display text-primary-600">
                    {roiResult.paybackMonths === Infinity ? '∞' : roiResult.paybackMonths} 
                    <span className="text-lg font-normal text-gray-500">个月</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {roiResult.paybackMonths <= 12 ? '🎉 一年内即可回本' : 
                     roiResult.paybackMonths <= 24 ? '👍 两年内回本' : '⏳ 需要长期投资'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/80 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">年投资回报率</p>
                    <p className="text-2xl font-display text-green-600">
                      {roiResult.yearlyROI.toFixed(1)}<span className="text-sm font-normal">%</span>
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">5年净收益</p>
                    <p className="text-2xl font-display text-blue-600">
                      {formatCurrency(roiResult.fiveYearSavings)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
