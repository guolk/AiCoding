import { useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useBillStore } from '../store/billStore';
import { useSettingsStore } from '../store/settingsStore';
import { getLast12Months, getMonthLabel, formatCurrency, formatNumber } from '../utils/formatter';
import { getAverageUsagePerPerson, CITY_AVERAGE_USAGE } from '../utils/calculator';
import { ENERGY_INFO } from '../types';

const PIE_COLORS = ['#3B82F6', '#F59E0B', '#06B6D4'];

export default function Analysis() {
  const { bills, initData } = useBillStore();
  const { settings } = useSettingsStore();
  
  useEffect(() => {
    initData();
  }, [initData]);
  
  const months = getLast12Months();
  
  const usageTrendData = months.map(period => {
    const periodBills = bills.filter(b => b.billingPeriod === period);
    return {
      month: getMonthLabel(period),
      electricity: periodBills.find(b => b.energyType === 'electricity')?.usage || 0,
      gas: periodBills.find(b => b.energyType === 'gas')?.usage || 0,
      water: periodBills.find(b => b.energyType === 'water')?.usage || 0,
    };
  });
  
  const amountTrendData = months.map(period => {
    const periodBills = bills.filter(b => b.billingPeriod === period);
    return {
      month: getMonthLabel(period),
      电力: periodBills.find(b => b.energyType === 'electricity')?.amount || 0,
      燃气: periodBills.find(b => b.energyType === 'gas')?.amount || 0,
      水: periodBills.find(b => b.energyType === 'water')?.amount || 0,
    };
  });
  
  const currentMonth = months[months.length - 1];
  const currentBills = bills.filter(b => b.billingPeriod === currentMonth);
  
  const pieData = [
    { name: '电力', value: currentBills.find(b => b.energyType === 'electricity')?.amount || 0 },
    { name: '燃气', value: currentBills.find(b => b.energyType === 'gas')?.amount || 0 },
    { name: '水', value: currentBills.find(b => b.energyType === 'water')?.amount || 0 },
  ];
  
  const avgPerPerson = getAverageUsagePerPerson(bills, settings.familyMembers);
  
  const comparisonData = [
    {
      name: '电力 (kWh/人)',
      家庭: avgPerPerson.electricity,
      城市平均: CITY_AVERAGE_USAGE.electricity,
    },
    {
      name: '燃气 (m³/人)',
      家庭: avgPerPerson.gas,
      城市平均: CITY_AVERAGE_USAGE.gas,
    },
    {
      name: '水 (m³/人)',
      家庭: avgPerPerson.water,
      城市平均: CITY_AVERAGE_USAGE.water,
    },
  ];
  
  const totalUsage = currentBills.reduce((sum, b) => sum + b.amount, 0);
  const totalUsageLastYear = bills
    .filter(b => b.billingPeriod === `${parseInt(currentMonth.split('-')[0]) - 1}-${currentMonth.split('-')[1]}`)
    .reduce((sum, b) => sum + b.amount, 0);
  const yoyChange = totalUsageLastYear > 0 ? ((totalUsage - totalUsageLastYear) / totalUsageLastYear) * 100 : 0;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">本月总支出</p>
          <p className="text-3xl font-display text-gray-800">{formatCurrency(totalUsage)}</p>
          <p className={`text-sm mt-2 ${yoyChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            同比 {yoyChange >= 0 ? '+' : ''}{formatNumber(yoyChange)}%
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">家庭人数</p>
          <p className="text-3xl font-display text-gray-800">{settings.familyMembers} <span className="text-lg font-normal text-gray-400">人</span></p>
          <p className="text-sm text-gray-400 mt-2">{settings.city}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">人均月支出</p>
          <p className="text-3xl font-display text-gray-800">{formatCurrency(totalUsage / settings.familyMembers)}</p>
          <p className="text-sm text-gray-400 mt-2">按家庭人口平均</p>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">月度消耗趋势</h3>
        <p className="text-sm text-gray-500 mb-6">近12个月各类能源用量变化</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usageTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="electricity" name="电力 (kWh)" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
              <Line type="monotone" dataKey="gas" name="燃气 (m³)" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} />
              <Line type="monotone" dataKey="water" name="水 (m³)" stroke="#06B6D4" strokeWidth={2.5} dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">能源费用结构</h3>
          <p className="text-sm text-gray-500 mb-6">本月各能源费用占比</p>
          <div className="flex items-center">
            <div className="w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4">
              {pieData.map((item, index) => {
                const percent = totalUsage > 0 ? (item.value / totalUsage * 100).toFixed(1) : 0;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }}></div>
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{percent}%</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">{formatCurrency(item.value)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">人均消耗对比</h3>
          <p className="text-sm text-gray-500 mb-6">与城市平均水平对比</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="家庭" fill="#22c55e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="城市平均" fill="#d1d5db" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">费用趋势</h3>
        <p className="text-sm text-gray-500 mb-6">近12个月各类能源支出</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={amountTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
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
              <Bar dataKey="电力" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="燃气" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="水" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
