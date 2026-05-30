import { useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Trees, Leaf, Wind, Sun, Mountain, Globe } from 'lucide-react';
import { useBillStore } from '../store/billStore';
import { useSavingStore } from '../store/savingStore';
import { useSettingsStore } from '../store/settingsStore';
import { calculateTotalCarbon, calculateCarbonSaved } from '../utils/calculator';
import { CARBON_FACTORS } from '../types';
import { getLast12Months, getMonthLabel, formatNumber } from '../utils/formatter';
import { ENERGY_INFO, EnergyType } from '../types';

export default function Carbon() {
  const { bills, initData } = useBillStore();
  const { measures, goals, initData: initSavingData } = useSavingStore();
  const { settings } = useSettingsStore();
  
  useEffect(() => {
    initData();
    initSavingData();
  }, [initData, initSavingData]);
  
  const months = getLast12Months();
  
  const carbonData = months.map(period => {
    const periodBills = bills.filter(b => b.billingPeriod === period);
    const electricity = periodBills.find(b => b.energyType === 'electricity')?.usage || 0;
    const gas = periodBills.find(b => b.energyType === 'gas')?.usage || 0;
    const water = periodBills.find(b => b.energyType === 'water')?.usage || 0;
    
    return {
      month: getMonthLabel(period),
      电力: electricity * CARBON_FACTORS.electricity,
      燃气: gas * CARBON_FACTORS.gas,
      水: water * CARBON_FACTORS.water,
    };
  });
  
  const totalCarbon = calculateTotalCarbon(bills);
  const yearlyCarbon = totalCarbon;
  
  const avgMonthlyCarbon = totalCarbon / 12;
  
  const estimatedSaved = measures.reduce((sum, m) => {
    return sum + (m.actualSavings || m.estimatedSavings || 0);
  }, 0);
  const estimatedCarbonSaved = calculateCarbonSaved(
    estimatedSaved / settings.electricityPrice,
    0,
    0
  );
  
  const treesEquivalent = Math.floor(totalCarbon / 21.77);
  const carKmEquivalent = Math.floor(totalCarbon / 0.21);
  
  const carbonGoals = goals.filter(g => g.type === 'carbon_reduction');
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 opacity-10 -translate-y-8 translate-x-8"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">年度碳足迹</p>
            <p className="text-3xl font-display text-gray-800">
              {formatNumber(yearlyCarbon)}
              <span className="text-lg font-normal text-gray-400 ml-1">kg CO₂</span>
            </p>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
              <Trees className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">相当于种树</p>
          <p className="text-3xl font-display text-green-600">
            {treesEquivalent}
            <span className="text-lg font-normal text-gray-400 ml-1">棵</span>
          </p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">累计减排</p>
          <p className="text-3xl font-display text-blue-600">
            {formatNumber(estimatedCarbonSaved)}
            <span className="text-lg font-normal text-gray-400 ml-1">kg</span>
          </p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <Wind className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">月均排放</p>
          <p className="text-3xl font-display text-cyan-600">
            {formatNumber(avgMonthlyCarbon)}
            <span className="text-lg font-normal text-gray-400 ml-1">kg</span>
          </p>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">碳排放趋势</h3>
        <p className="text-sm text-gray-500 mb-6">近12个月各类能源碳排放</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={carbonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(1)} kg CO₂`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="电力" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="燃气" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
              <Bar dataKey="水" stackId="a" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">碳排放构成</h3>
          <p className="text-sm text-gray-500 mb-6">各类能源碳排放占比</p>
          
          <div className="space-y-4">
            {(['electricity', 'gas', 'water'] as EnergyType[]).map(type => {
              const info = ENERGY_INFO[type];
              const typeBills = bills.filter(b => b.energyType === type);
              const typeCarbon = typeBills.reduce((sum, b) => sum + b.usage * CARBON_FACTORS[type], 0);
              const percentage = totalCarbon > 0 ? (typeCarbon / totalCarbon * 100).toFixed(1) : 0;
              
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }}></div>
                      <span className="text-sm font-medium text-gray-700">{info.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-800">{typeCarbon.toFixed(1)} kg</span>
                      <span className="text-sm text-gray-400 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: info.color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-emerald-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">碳排放因子</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <p>电力: 0.785 kg CO₂/kWh</p>
              <p>燃气: 2.16 kg CO₂/m³</p>
              <p>水: 0.91 kg CO₂/m³</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">环保贡献</h3>
          <p className="text-sm text-gray-500 mb-6">您的节能行动带来的改变</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Trees className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">种树</span>
              </div>
              <p className="text-2xl font-display text-green-600">{treesEquivalent} <span className="text-sm">棵</span></p>
              <p className="text-xs text-gray-400 mt-1">一棵树每年吸收约21.77kg CO₂</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">汽车行驶</span>
              </div>
              <p className="text-2xl font-display text-blue-600">{carKmEquivalent} <span className="text-sm">km</span></p>
              <p className="text-xs text-gray-400 mt-1">普通轿车每公里约0.21kg CO₂</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Mountain className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">年度碳足迹</span>
              </div>
              <p className="text-2xl font-display text-orange-600">{(yearlyCarbon / 1000).toFixed(2)} <span className="text-sm">吨</span></p>
              <p className="text-xs text-gray-400 mt-1">中国人均约7.4吨/年</p>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-cyan-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">累计减排</span>
              </div>
              <p className="text-2xl font-display text-cyan-600">{estimatedCarbonSaved.toFixed(0)} <span className="text-sm">kg</span></p>
              <p className="text-xs text-gray-400 mt-1">基于节能措施估算</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">年度碳足迹报告</h3>
        <p className="text-sm text-gray-500 mb-6">{new Date().getFullYear()}年家庭能源碳排放总结</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-b from-primary-50 to-transparent rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              <Globe className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">年度总碳排放</p>
            <p className="text-4xl font-display text-primary-600">{yearlyCarbon.toFixed(0)}</p>
            <p className="text-sm text-gray-400">kg CO₂</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-b from-green-50 to-transparent rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">人均碳排放</p>
            <p className="text-4xl font-display text-green-600">{(yearlyCarbon / settings.familyMembers).toFixed(0)}</p>
            <p className="text-sm text-gray-400">kg CO₂/人</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-b from-blue-50 to-transparent rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <Trees className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">碳中和目标</p>
            <p className="text-4xl font-display text-blue-600">{Math.ceil(yearlyCarbon / 21.77)}</p>
            <p className="text-sm text-gray-400">需种植树木</p>
          </div>
        </div>
        
        {carbonGoals.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-4">碳减排目标进度</h4>
            <div className="space-y-4">
              {carbonGoals.map(goal => {
                const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{goal.description}</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {goal.currentValue}/{goal.targetValue} kg
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
