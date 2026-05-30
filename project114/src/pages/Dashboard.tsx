import { useEffect } from 'react';
import { 
  Zap, 
  Flame, 
  Droplets, 
  DollarSign,
  Plus,
  CheckSquare,
  Target,
  Leaf
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useBillStore } from '../store/billStore';
import { useSavingStore } from '../store/savingStore';
import StatCard from '../components/ui/StatCard';
import { getLast12Months, getMonthLabel, formatCurrency } from '../utils/formatter';
import { ENERGY_INFO } from '../types';

const PIE_COLORS = ['#3B82F6', '#F59E0B', '#06B6D4'];

export default function Dashboard() {
  const { bills, initData } = useBillStore();
  const { goals, initData: initSavingData } = useSavingStore();
  
  useEffect(() => {
    initData();
    initSavingData();
  }, [initData, initSavingData]);
  
  const months = getLast12Months();
  
  const trendData = months.map(period => {
    const periodBills = bills.filter(b => b.billingPeriod === period);
    return {
      month: getMonthLabel(period),
      electricity: periodBills.find(b => b.energyType === 'electricity')?.usage || 0,
      gas: periodBills.find(b => b.energyType === 'gas')?.usage || 0,
      water: periodBills.find(b => b.energyType === 'water')?.usage || 0,
    };
  });
  
  const currentMonth = months[months.length - 1];
  const lastMonth = months[months.length - 2];
  
  const currentElectricity = bills.find(b => b.billingPeriod === currentMonth && b.energyType === 'electricity');
  const currentGas = bills.find(b => b.billingPeriod === currentMonth && b.energyType === 'gas');
  const currentWater = bills.find(b => b.billingPeriod === currentMonth && b.energyType === 'water');
  
  const lastElectricity = bills.find(b => b.billingPeriod === lastMonth && b.energyType === 'electricity');
  const lastGas = bills.find(b => b.billingPeriod === lastMonth && b.energyType === 'gas');
  const lastWater = bills.find(b => b.billingPeriod === lastMonth && b.energyType === 'water');
  
  const totalAmount = (currentElectricity?.amount || 0) + (currentGas?.amount || 0) + (currentWater?.amount || 0);
  const lastTotalAmount = (lastElectricity?.amount || 0) + (lastGas?.amount || 0) + (lastWater?.amount || 0);
  const trend = lastTotalAmount > 0 ? ((totalAmount - lastTotalAmount) / lastTotalAmount) * 100 : 0;
  
  const pieData = [
    { name: '电力', value: currentElectricity?.amount || 0 },
    { name: '燃气', value: currentGas?.amount || 0 },
    { name: '水', value: currentWater?.amount || 0 },
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="本月总支出"
          value={formatCurrency(totalAmount)}
          icon={DollarSign}
          trend={trend}
          trendLabel="较上月"
          color="green"
        />
        <StatCard
          title="电力消耗"
          value={currentElectricity?.usage?.toFixed(0) || 0}
          unit="kWh"
          icon={Zap}
          trend={lastElectricity?.usage ? ((currentElectricity?.usage || 0) - lastElectricity.usage) / lastElectricity.usage * 100 : 0}
          color="blue"
        />
        <StatCard
          title="燃气消耗"
          value={currentGas?.usage?.toFixed(1) || 0}
          unit="m³"
          icon={Flame}
          trend={lastGas?.usage ? ((currentGas?.usage || 0) - lastGas.usage) / lastGas.usage * 100 : 0}
          color="orange"
        />
        <StatCard
          title="用水量"
          value={currentWater?.usage?.toFixed(1) || 0}
          unit="m³"
          icon={Droplets}
          trend={lastWater?.usage ? ((currentWater?.usage || 0) - lastWater.usage) / lastWater.usage * 100 : 0}
          color="cyan"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">近12个月消耗趋势</h3>
              <p className="text-sm text-gray-500">各类能源月度使用量</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">电力</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-600">燃气</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span className="text-gray-600">水</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                <Line type="monotone" dataKey="electricity" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="gas" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="water" stroke="#06B6D4" strokeWidth={2.5} dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">能源结构</h3>
          <p className="text-sm text-gray-500 mb-4">本月费用占比</p>
          <div className="h-64">
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
          <div className="grid grid-cols-3 gap-2 mt-2">
            {pieData.map((item, index) => (
              <div key={item.name} className="text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: PIE_COLORS[index] }}></div>
                <p className="text-xs text-gray-500">{item.name}</p>
                <p className="text-sm font-medium text-gray-700">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">节能目标</h3>
            <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
              查看全部
            </button>
          </div>
          <div className="space-y-4">
            {goals.slice(0, 3).map(goal => {
              const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{goal.description}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {goal.currentValue}/{goal.targetValue}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">录入账单</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">添加措施</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-cyan-50 hover:bg-cyan-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">习惯打卡</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">设置目标</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
