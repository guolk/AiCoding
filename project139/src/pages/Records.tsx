import { useState, useMemo } from 'react';
import { Star, Clock, ShoppingCart, History, Plus, Trash2, Search, X, CheckCircle2 } from 'lucide-react';
import type { UsageRecord, PurchaseRecord, ShoppingItem } from '@/types';
import { useAppStore } from '@/store';
import { generateId } from '@/utils/helpers';
import { cn } from '@/lib/utils';

type TabKey = 'usage' | 'shopping' | 'purchase';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'usage', label: '使用记录', icon: <Clock className="w-4 h-4" /> },
  { key: 'shopping', label: '采购清单', icon: <ShoppingCart className="w-4 h-4" /> },
  { key: 'purchase', label: '采购历史', icon: <History className="w-4 h-4" /> },
];

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  firstaid: { label: '急救', color: 'bg-red-100 text-red-700' },
  emergency: { label: '应急', color: 'bg-orange-100 text-orange-700' },
  medicine: { label: '药品', color: 'bg-blue-100 text-blue-700' },
};

function TypeBadge({ type }: { type: string }) {
  const badge = TYPE_BADGE[type];
  if (!badge) return null;
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', badge.color)}>
      {badge.label}
    </span>
  );
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4 cursor-default',
            i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-300'
          )}
          onClick={() => onChange?.(i)}
        />
      ))}
    </div>
  );
}

function UsageTab() {
  const { usageRecords, firstAidItems, emergencySupplies, medicines, addUsageRecord } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<'firstaid' | 'emergency' | 'medicine'>('firstaid');
  const [formItemId, setFormItemId] = useState('');
  const [formQty, setFormQty] = useState(1);
  const [formReason, setFormReason] = useState('');

  const sortedRecords = useMemo(
    () => [...usageRecords].sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime()),
    [usageRecords]
  );

  const itemsByType = useMemo(() => {
    if (formType === 'firstaid') return firstAidItems.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity }));
    if (formType === 'emergency') return emergencySupplies.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity }));
    return medicines.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity }));
  }, [formType, firstAidItems, emergencySupplies, medicines]);

  const selectedItem = itemsByType.find((i) => i.id === formItemId);

  const handleSubmit = () => {
    if (!formItemId || formQty <= 0 || !formReason.trim()) return;
    const item = itemsByType.find((i) => i.id === formItemId);
    if (!item) return;
    const remaining = Math.max(0, item.quantity - formQty);
    addUsageRecord({
      itemId: formItemId,
      itemType: formType,
      itemName: item.name,
      quantityUsed: formQty,
      remainingQuantity: remaining,
      usedAt: new Date().toISOString().split('T')[0],
      reason: formReason.trim(),
    });
    setShowModal(false);
    setFormItemId('');
    setFormQty(1);
    setFormReason('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">使用记录</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: '#0D7377' }}
        >
          <Plus className="w-4 h-4" />
          记录使用
        </button>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="text-center py-12 text-gray-400">暂无使用记录</div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-4">
            {sortedRecords.map((record) => (
              <TimelineItem key={record.id} record={record} />
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">记录使用</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">物品类型</label>
                <select
                  value={formType}
                  onChange={(e) => { setFormType(e.target.value as typeof formType); setFormItemId(''); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30"
                >
                  <option value="firstaid">急救用品</option>
                  <option value="emergency">应急物资</option>
                  <option value="medicine">药品</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">物品名称</label>
                <select
                  value={formItemId}
                  onChange={(e) => setFormItemId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30"
                >
                  <option value="">请选择物品</option>
                  {itemsByType.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}（库存: {item.quantity}）</option>
                  ))}
                </select>
              </div>
              {selectedItem && (
                <p className="text-xs text-gray-500">当前库存: {selectedItem.quantity}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">使用数量</label>
                <input
                  type="number"
                  min={1}
                  max={selectedItem?.quantity ?? 999}
                  value={formQty}
                  onChange={(e) => setFormQty(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">使用原因</label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 resize-none"
                  placeholder="请输入使用原因"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!formItemId || formQty <= 0 || !formReason.trim()}
                className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0D7377' }}
              >
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ record }: { record: UsageRecord }) {
  const originalQty = record.remainingQuantity + record.quantityUsed;
  const pct = originalQty > 0 ? Math.round((record.remainingQuantity / originalQty) * 100) : 0;

  return (
    <div className="relative pl-10">
      <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#0D7377' }} />
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">{record.usedAt}</span>
          <TypeBadge type={record.itemType} />
        </div>
        <div className="font-medium text-gray-800 mb-1">{record.itemName}</div>
        <div className="text-sm text-gray-500 mb-2">
          使用 <span className="font-medium" style={{ color: '#FF6B35' }}>{record.quantityUsed}</span> 件
          · 剩余 <span className="font-medium text-gray-700">{record.remainingQuantity}</span> 件
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: pct > 50 ? '#0D7377' : pct > 20 ? '#f59e0b' : '#ef4444',
            }}
          />
        </div>
        <div className="text-xs text-gray-400">原因: {record.reason}</div>
      </div>
    </div>
  );
}

function ShoppingTab() {
  const { shoppingList, firstAidItems, emergencySupplies, medicines, addToShoppingList, removeFromShoppingList, clearShoppingList, addPurchaseRecord } = useAppStore();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [addType, setAddType] = useState<'firstaid' | 'emergency' | 'medicine'>('firstaid');
  const [addItemId, setAddItemId] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [purchaseItemId, setPurchaseItemId] = useState<string | null>(null);
  const [purchaseSource, setPurchaseSource] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseQuality, setPurchaseQuality] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const allItems = useMemo(() => [
    ...firstAidItems.map((i) => ({ id: i.id, name: i.name, type: 'firstaid' as const })),
    ...emergencySupplies.map((i) => ({ id: i.id, name: i.name, type: 'emergency' as const })),
    ...medicines.map((i) => ({ id: i.id, name: i.name, type: 'medicine' as const })),
  ], [firstAidItems, emergencySupplies, medicines]);

  const filteredItems = useMemo(
    () => allItems.filter((i) => i.type === addType),
    [allItems, addType]
  );

  const handleCheck = (itemId: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
        setPurchaseItemId(null);
      } else {
        next.add(itemId);
        setPurchaseItemId(itemId);
      }
      return next;
    });
  };

  const handleAddToList = () => {
    if (!addItemId || addQty <= 0) return;
    const item = allItems.find((i) => i.id === addItemId);
    if (!item) return;
    addToShoppingList({ itemId: item.id, itemName: item.name, quantity: addQty, type: item.type });
    setShowAddForm(false);
    setAddItemId('');
    setAddQty(1);
  };

  const handleCompletePurchase = (shopItem: ShoppingItem) => {
    if (!purchaseSource.trim() || !purchasePrice) return;
    addPurchaseRecord({
      itemId: shopItem.itemId,
      itemName: shopItem.itemName,
      quantity: shopItem.quantity,
      price: Number(purchasePrice),
      source: purchaseSource.trim(),
      quality: purchaseQuality,
      purchasedAt: new Date().toISOString().split('T')[0],
    });
    removeFromShoppingList(shopItem.itemId);
    setPurchaseItemId(null);
    setPurchaseSource('');
    setPurchasePrice('');
    setPurchaseQuality(5);
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.delete(shopItem.itemId);
      return next;
    });
  };

  const handleClear = () => {
    clearShoppingList();
    setCheckedItems(new Set());
    setShowClearConfirm(false);
    setClearSuccess(true);
    setTimeout(() => setClearSuccess(false), 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">采购清单</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={shoppingList.length === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <Trash2 className="w-4 h-4" />
            清空清单
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#0D7377' }}
          >
            <Plus className="w-4 h-4" />
            添加到采购清单
          </button>
        </div>
      </div>

      {shoppingList.length === 0 ? (
        <div className="text-center py-12 text-gray-400">采购清单为空</div>
      ) : (
        <div className="space-y-3">
          {shoppingList.map((item) => (
            <div key={item.itemId} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checkedItems.has(item.itemId)}
                  onChange={() => handleCheck(item.itemId)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#0D7377]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{item.itemName}</span>
                    <TypeBadge type={item.type} />
                  </div>
                  <span className="text-sm text-gray-500">需要 {item.quantity} 件</span>
                </div>
              </div>
              {checkedItems.has(item.itemId) && purchaseItemId === item.itemId && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">购买来源</label>
                      <input
                        type="text"
                        value={purchaseSource}
                        onChange={(e) => setPurchaseSource(e.target.value)}
                        placeholder="如: 京东、药店"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">价格 (元)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">质量评分</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-5 h-5 cursor-pointer',
                            i <= purchaseQuality ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-300'
                          )}
                          onClick={() => setPurchaseQuality(i as 1 | 2 | 3 | 4 | 5)}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCompletePurchase(item)}
                    disabled={!purchaseSource.trim() || !purchasePrice}
                    className="w-full py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#FF6B35' }}
                  >
                    完成采购
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">添加到采购清单</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">物品类型</label>
                <select
                  value={addType}
                  onChange={(e) => { setAddType(e.target.value as typeof addType); setAddItemId(''); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30"
                >
                  <option value="firstaid">急救用品</option>
                  <option value="emergency">应急物资</option>
                  <option value="medicine">药品</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">物品名称</label>
                <select
                  value={addItemId}
                  onChange={(e) => setAddItemId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30"
                >
                  <option value="">请选择物品</option>
                  {filteredItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">需要数量</label>
                <input
                  type="number"
                  min={1}
                  value={addQty}
                  onChange={(e) => setAddQty(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30"
                />
              </div>
              <button
                onClick={handleAddToList}
                disabled={!addItemId || addQty <= 0}
                className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0D7377' }}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">确认清空</h3>
            <p className="text-sm text-gray-600 mb-4">确定要清空采购清单吗？此操作不可撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium bg-red-500 hover:bg-red-600"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      {clearSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-slide-in">
          <div className="flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg bg-emerald-500 text-white text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            清单已清空
          </div>
        </div>
      )}
    </div>
  );
}

function PurchaseTab() {
  const { purchaseRecords } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = useMemo(() => {
    const sorted = [...purchaseRecords].sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
    if (!searchTerm.trim()) return sorted;
    const term = searchTerm.trim().toLowerCase();
    return sorted.filter((r) => r.itemName.toLowerCase().includes(term));
  }, [purchaseRecords, searchTerm]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">采购历史</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索物品名称"
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 w-52"
          />
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 text-gray-400">暂无采购记录</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-500">日期</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">物品名称</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">数量</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">价格</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">来源</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">质量评分</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-2 text-gray-600">{record.purchasedAt}</td>
                  <td className="py-3 px-2 font-medium text-gray-800">{record.itemName}</td>
                  <td className="py-3 px-2 text-gray-600">{record.quantity}</td>
                  <td className="py-3 px-2 text-gray-600">¥{record.price.toFixed(2)}</td>
                  <td className="py-3 px-2 text-gray-600">{record.source}</td>
                  <td className="py-3 px-2"><StarRating rating={record.quality} /></td>
                  <td className="py-3 px-2">
                    <button className="text-xs px-2 py-1 rounded" style={{ color: '#0D7377' }}>
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Records() {
  const [activeTab, setActiveTab] = useState<TabKey>('usage');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">使用与采购管理</h1>

      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-b-[#0D7377] text-[#0D7377]'
                : 'border-b-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'usage' && <UsageTab />}
      {activeTab === 'shopping' && <ShoppingTab />}
      {activeTab === 'purchase' && <PurchaseTab />}
    </div>
  );
}
