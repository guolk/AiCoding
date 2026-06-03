import { useMemo } from 'react';
import { AlertTriangle, RotateCcw, ShoppingCart, CheckSquare } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '@/store';
import { CATEGORY_LABELS } from '@/types';
import {
  getExpiringItems,
  getExpiringSupplies,
  getExpiringMedicines,
  needsRotation,
  getDaysUntilNextCheck,
  getExpiryStatusLabel,
  getExpiryStatusBgColor,
  calculateRecommendedSupplies,
} from '@/utils/helpers';

const PIE_COLORS = ['#0D7377', '#FF6B35', '#27AE60', '#F39C12', '#E74C3C', '#8B5CF6'];

export default function Dashboard() {
  const { firstAidItems, emergencySupplies, medicines, inventoryChecks, familyConfig } = useAppStore();

  const expiringCount = useMemo(
    () => getExpiringItems(firstAidItems).length + getExpiringSupplies(emergencySupplies).length + getExpiringMedicines(medicines).length,
    [firstAidItems, emergencySupplies, medicines],
  );

  const rotationCount = useMemo(
    () => emergencySupplies.filter(needsRotation).length,
    [emergencySupplies],
  );

  const lowStockCount = useMemo(
    () => firstAidItems.filter(i => i.quantity < i.safeQuantity).length + medicines.filter(m => m.quantity < m.safeQuantity).length,
    [firstAidItems, medicines],
  );

  const lastCheck = useMemo(() => {
    if (!inventoryChecks.length) return null;
    return [...inventoryChecks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [inventoryChecks]);

  const daysUntilNext = lastCheck ? getDaysUntilNextCheck(lastCheck.date) : -1;
  const daysSinceLast = lastCheck ? 90 - daysUntilNext : 90;
  const progressPercent = Math.min(100, Math.max(0, (daysSinceLast / 90) * 100));
  const isCheckDue = daysUntilNext <= 0;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    firstAidItems.forEach(item => {
      const label = CATEGORY_LABELS[item.category] || item.category;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [firstAidItems]);

  const supplyBarData = useMemo(() => {
    const recommended = calculateRecommendedSupplies(familyConfig);
    const supplyMap: Record<string, number> = {};
    emergencySupplies.forEach(s => {
      supplyMap[s.category] = (supplyMap[s.category] || 0) + s.quantity;
    });
    return Object.entries(recommended)
      .filter(([key]) => supplyMap[key] !== undefined)
      .map(([key, rec]) => ({
        name: rec.name,
        当前库存: supplyMap[key] || 0,
        建议数量: rec.quantity,
      }));
  }, [emergencySupplies, familyConfig]);

  const urgentItems = useMemo(() => {
    const fa = getExpiringItems(firstAidItems).map(i => ({ name: i.name, daysLeft: i.daysLeft, status: i.status }));
    const es = getExpiringSupplies(emergencySupplies).map(i => ({ name: i.name, daysLeft: i.daysLeft, status: i.status }));
    const md = getExpiringMedicines(medicines).map(i => ({ name: i.name, daysLeft: i.daysLeft, status: i.status }));
    return [...fa, ...es, ...md].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);
  }, [firstAidItems, emergencySupplies, medicines]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-[#E74C3C]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#E74C3C]" />
            <div>
              <p className="text-3xl font-bold text-gray-900">{expiringCount}</p>
              <p className="text-sm text-gray-500">即将过期物品</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-[#F39C12]">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-[#F39C12]" />
            <div>
              <p className="text-3xl font-bold text-gray-900">{rotationCount}</p>
              <p className="text-sm text-gray-500">需轮换物资</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-[#FF6B35]">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-[#FF6B35]" />
            <div>
              <p className="text-3xl font-bold text-gray-900">{lowStockCount}</p>
              <p className="text-sm text-gray-500">库存不足</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">盘点状态</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r={radius} fill="none"
                  stroke="#0D7377" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{Math.round(progressPercent)}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {lastCheck ? (
                <>
                  <p className="text-sm text-gray-500">距上次盘点 <span className="font-semibold text-gray-900">{daysSinceLast}</span> 天</p>
                  <p className="text-sm text-gray-500">距下次盘点 <span className="font-semibold text-gray-900">{Math.max(0, daysUntilNext)}</span> 天</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">尚未进行过盘点</p>
              )}
              {(isCheckDue || !lastCheck) && (
                <button className="mt-2 px-4 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-primary-dark transition-colors">
                  开始盘点
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">临期物品速览</h3>
          {urgentItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">暂无临期物品</p>
          ) : (
            <ul className="space-y-2">
              {urgentItems.map((item, idx) => (
                <li key={idx} className={`flex items-center justify-between p-2 rounded-md border ${getExpiryStatusBgColor(item.status)}`}>
                  <span className="text-sm font-medium text-gray-800">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${item.status === 'expired' || item.status === 'urgent' ? 'text-red-600' : 'text-amber-600'}`}>
                      {item.daysLeft < 0 ? `已过期${Math.abs(item.daysLeft)}天` : `剩余${item.daysLeft}天`}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.status === 'expired' || item.status === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {getExpiryStatusLabel(item.status)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">库存分类分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData} cx="50%" cy="50%" outerRadius={80}
                dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">物资库存与建议对比</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={supplyBarData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="当前库存" fill="#0D7377" radius={[4, 4, 0, 0]} />
              <Bar dataKey="建议数量" fill="#FF6B35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
