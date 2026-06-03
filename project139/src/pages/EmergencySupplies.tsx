import { useState, useMemo } from 'react';
import { Droplets, UtensilsCrossed, Battery, Flashlight, Heart, Box, Plus, Search, Edit2, Trash2, RotateCw, Users, ShoppingCart } from 'lucide-react';
import type { EmergencySupply } from '@/types';
import { SUPPLY_CATEGORY_LABELS } from '@/types';
import { useAppStore } from '@/store';
import { getExpiryStatus, getDaysUntilExpiry, getExpiryStatusBgColor, getExpiryStatusLabel, needsRotation, getRotationDaysLeft, calculateRecommendedSupplies, generateId } from '@/utils/helpers';
import { differenceInDays } from 'date-fns';

const CATEGORY_ICONS: Record<EmergencySupply['category'], React.ReactNode> = {
  water: <Droplets className="w-5 h-5" />,
  food: <UtensilsCrossed className="w-5 h-5" />,
  battery: <Battery className="w-5 h-5" />,
  flashlight: <Flashlight className="w-5 h-5" />,
  firstaid: <Heart className="w-5 h-5" />,
  other: <Box className="w-5 h-5" />,
};

const CATEGORY_COLORS: Record<EmergencySupply['category'], string> = {
  water: 'bg-blue-100 text-blue-600',
  food: 'bg-orange-100 text-orange-600',
  battery: 'bg-yellow-100 text-yellow-700',
  flashlight: 'bg-purple-100 text-purple-600',
  firstaid: 'bg-red-100 text-red-600',
  other: 'bg-gray-100 text-gray-600',
};

type TabKey = 'list' | 'rotation' | 'recommend';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'list', label: '物资清单' },
  { key: 'rotation', label: '轮换提醒' },
  { key: 'recommend', label: '推荐配置' },
];

const emptySupplyForm = {
  name: '',
  category: 'water' as EmergencySupply['category'],
  quantity: 1,
  unit: '',
  expiryDate: '',
  rotationDays: 180,
  lastRotated: new Date().toISOString().split('T')[0],
};

export default function EmergencySupplies() {
  const [activeTab, setActiveTab] = useState<TabKey>('list');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<EmergencySupply | null>(null);
  const [form, setForm] = useState(emptySupplyForm);

  const { emergencySupplies, addEmergencySupply, updateEmergencySupply, deleteEmergencySupply, rotateSupply, familyConfig, updateFamilyConfig, addToShoppingList } = useAppStore();

  const [localConfig, setLocalConfig] = useState(familyConfig);
  const [recommended, setRecommended] = useState<ReturnType<typeof calculateRecommendedSupplies> | null>(null);

  const filteredSupplies = useMemo(() => {
    let list = emergencySupplies;
    if (categoryFilter !== 'all') {
      list = list.filter(s => s.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [emergencySupplies, categoryFilter, searchQuery]);

  const rotationSupplies = useMemo(() => {
    return emergencySupplies
      .map(s => ({ ...s, daysLeft: getRotationDaysLeft(s), needsRotation: needsRotation(s) }))
      .filter(s => s.needsRotation || s.daysLeft <= 30)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [emergencySupplies]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof rotationSupplies> = {};
    rotationSupplies.forEach(s => {
      const key = s.needsRotation ? '已逾期' : s.daysLeft <= 7 ? '7天内' : '30天内';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [rotationSupplies]);

  const currentStockByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    emergencySupplies.forEach(s => {
      if (!map[s.category]) map[s.category] = 0;
      map[s.category] += s.quantity;
    });
    return map;
  }, [emergencySupplies]);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptySupplyForm);
    setShowAddModal(true);
  };

  const openEdit = (item: EmergencySupply) => {
    setEditItem(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate,
      rotationDays: item.rotationDays,
      lastRotated: item.lastRotated,
    });
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.unit.trim() || !form.expiryDate) return;
    if (editItem) {
      updateEmergencySupply(editItem.id, form);
    } else {
      addEmergencySupply({ ...form });
    }
    setShowAddModal(false);
  };

  const handleCalculate = () => {
    updateFamilyConfig(localConfig);
    setRecommended(calculateRecommendedSupplies(localConfig));
  };

  const handleAddDeficient = () => {
    if (!recommended) return;
    Object.entries(recommended).forEach(([key, rec]) => {
      const current = currentStockByCategory[key] || 0;
      const deficit = rec.quantity - current;
      if (deficit > 0) {
        addToShoppingList({
          itemId: `emergency_${key}_${generateId()}`,
          itemName: rec.name,
          quantity: deficit,
          type: 'emergency',
        });
      }
    });
  };

  const getRotationColor = (daysLeft: number, isOverdue: boolean) => {
    if (isOverdue) return 'border-l-4 border-l-red-500 bg-red-50';
    if (daysLeft <= 7) return 'border-l-4 border-l-amber-500 bg-amber-50';
    return 'border-l-4 border-l-emerald-500 bg-emerald-50';
  };

  const getRotationDotColor = (daysLeft: number, isOverdue: boolean) => {
    if (isOverdue) return 'bg-red-500';
    if (daysLeft <= 7) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const renderList = () => (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索物资..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: '#0D7377' }}
        >
          <Plus className="w-4 h-4" />
          添加物资
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === 'all' ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          style={categoryFilter === 'all' ? { backgroundColor: '#0D7377' } : {}}
        >
          全部
        </button>
        {Object.entries(SUPPLY_CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategoryFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === key ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            style={categoryFilter === key ? { backgroundColor: '#0D7377' } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredSupplies.length === 0 ? (
        <div className="text-center py-12 text-gray-400">暂无物资数据</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredSupplies.map(supply => {
            const status = getExpiryStatus(supply.expiryDate);
            const daysLeft = getDaysUntilExpiry(supply.expiryDate);
            const daysSinceRotated = differenceInDays(new Date(), new Date(supply.lastRotated));
            const progress = Math.min(100, Math.round((daysSinceRotated / supply.rotationDays) * 100));

            return (
              <div key={supply.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${CATEGORY_COLORS[supply.category]}`}>
                      {CATEGORY_ICONS[supply.category]}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getExpiryStatusBgColor(status)}`}>
                      {getExpiryStatusLabel(status)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{supply.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">
                    {supply.quantity} {supply.unit}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    到期日: {supply.expiryDate}
                    {daysLeft >= 0 ? ` (${daysLeft}天)` : ' (已过期)'}
                  </p>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>轮换进度</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: progress > 80 ? '#FF6B35' : '#0D7377' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(supply)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-[#0D7377] bg-[#0D7377]/10 hover:bg-[#0D7377]/20 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      编辑
                    </button>
                    <button
                      onClick={() => deleteEmergencySupply(supply.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderRotation = () => (
    <div>
      {rotationSupplies.length === 0 ? (
        <div className="text-center py-12 text-gray-400">暂无需要轮换的物资</div>
      ) : (
        <div className="space-y-6">
          {(['已逾期', '7天内', '30天内'] as const).map(groupKey => {
            const items = groupedByDate[groupKey];
            if (!items || items.length === 0) return null;
            return (
              <div key={groupKey}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${groupKey === '已逾期' ? 'bg-red-500' : groupKey === '7天内' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <h3 className="font-semibold text-gray-800">{groupKey}</h3>
                  <span className="text-xs text-gray-400">({items.length}项)</span>
                </div>
                <div className="space-y-2 ml-1.5">
                  {items.map(item => {
                    const daysSinceRotation = differenceInDays(new Date(), new Date(item.lastRotated));
                    return (
                      <div key={item.id} className={`rounded-lg p-4 ${getRotationColor(item.daysLeft, item.needsRotation)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${getRotationDotColor(item.daysLeft, item.needsRotation)}`} />
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {SUPPLY_CATEGORY_LABELS[item.category]} · 已轮换 {daysSinceRotation} 天
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => rotateSupply(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                            style={{ backgroundColor: '#0D7377' }}
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            标记轮换
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderRecommend = () => (
    <div>
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" style={{ color: '#0D7377' }} />
          <h3 className="font-semibold text-gray-800">家庭配置</h3>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">家庭成员数</label>
            <input
              type="number"
              min={1}
              value={localConfig.memberCount}
              onChange={e => setLocalConfig({ ...localConfig, memberCount: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">儿童数</label>
            <input
              type="number"
              min={0}
              value={localConfig.childrenCount}
              onChange={e => setLocalConfig({ ...localConfig, childrenCount: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">老人数</label>
            <input
              type="number"
              min={0}
              value={localConfig.elderlyCount}
              onChange={e => setLocalConfig({ ...localConfig, elderlyCount: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">储备天数</label>
            <input
              type="number"
              min={1}
              value={localConfig.supplyDays}
              onChange={e => setLocalConfig({ ...localConfig, supplyDays: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleCalculate}
          className="px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors"
          style={{ backgroundColor: '#0D7377' }}
        >
          计算推荐量
        </button>
      </div>

      {recommended && (
        <div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100" style={{ backgroundColor: '#0D7377' }}>
                  <th className="text-left px-4 py-3 text-white font-medium">物资类别</th>
                  <th className="text-center px-4 py-3 text-white font-medium">推荐量</th>
                  <th className="text-center px-4 py-3 text-white font-medium">当前存量</th>
                  <th className="text-center px-4 py-3 text-white font-medium">差距</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(recommended).map(([key, rec], idx) => {
                  const current = currentStockByCategory[key] || 0;
                  const deficit = current - rec.quantity;
                  const sufficient = deficit >= 0;
                  return (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 text-gray-800">{rec.name}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{rec.quantity} {rec.unit}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{current}</td>
                      <td className="px-4 py-3 text-center">
                        {sufficient ? (
                          <span className="text-emerald-600 font-medium">充足</span>
                        ) : (
                          <span className="text-red-600 font-medium">不足 -{Math.abs(deficit)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddDeficient}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: '#FF6B35' }}
            >
              <ShoppingCart className="w-4 h-4" />
              一键添加不足物资到采购清单
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/80 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">应急物资管理</h1>

        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-gray-100 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === tab.key ? { backgroundColor: '#0D7377' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'list' && renderList()}
          {activeTab === 'rotation' && renderRotation()}
          {activeTab === 'recommend' && renderRecommend()}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editItem ? '编辑物资' : '添加物资'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">分类</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as EmergencySupply['category'] })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
                >
                  {Object.entries(SUPPLY_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">数量</label>
                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">单位</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">到期日期</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">轮换周期(天)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.rotationDays}
                    onChange={e => setForm({ ...form, rotationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">上次轮换日期</label>
                  <input
                    type="date"
                    value={form.lastRotated}
                    onChange={e => setForm({ ...form, lastRotated: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: '#0D7377' }}
              >
                {editItem ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
