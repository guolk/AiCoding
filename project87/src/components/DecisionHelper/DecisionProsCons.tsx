import React, { useState } from 'react';
import { Plus, Trash2, ThumbsUp, ThumbsDown, Clock, Bell, Check } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const DecisionProsCons: React.FC = () => {
  const { products, decisionItems, addDecisionItem, triggerReminder } = useApp();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [tempPros, setTempPros] = useState<string[]>([]);
  const [tempCons, setTempCons] = useState<string[]>([]);

  const itemsWithProducts = decisionItems.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  const handleAddToWishlist = () => {
    if (selectedProduct) {
      addDecisionItem({
        productId: selectedProduct,
        pros: tempPros,
        cons: tempCons,
        addedToWishlistAt: new Date().toISOString(),
      });
      setSelectedProduct('');
      setTempPros([]);
      setTempCons([]);
    }
  };

  const addPro = () => {
    if (newPro.trim()) {
      setTempPros([...tempPros, newPro.trim()]);
      setNewPro('');
    }
  };

  const addCon = () => {
    if (newCon.trim()) {
      setTempCons([...tempCons, newCon.trim()]);
      setNewCon('');
    }
  };

  const removePro = (index: number) => {
    setTempPros(tempPros.filter((_, i) => i !== index));
  };

  const removeCon = (index: number) => {
    setTempCons(tempCons.filter((_, i) => i !== index));
  };

  const getDaysUntilReminder = (reminderDate: string) => {
    const now = new Date();
    const reminder = new Date(reminderDate);
    const diff = reminder.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const availableProducts = products.filter(
    (p) => !decisionItems.some((d) => d.productId === p.id)
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">决策辅助 - Pros & Cons</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">添加到愿望清单</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择产品</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">请选择产品</option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {availableProducts.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">所有产品都已在愿望清单中</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ThumbsUp size={16} className="inline mr-1 text-green-500" />
                购买理由 (Pros)
              </label>
              <div className="space-y-2 mb-2">
                {tempPros.map((pro, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <span className="flex-1 text-sm text-gray-700">{pro}</span>
                    <button onClick={() => removePro(index)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPro}
                  onChange={(e) => setNewPro(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="输入一个理由..."
                />
                <button
                  onClick={addPro}
                  className="px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ThumbsDown size={16} className="inline mr-1 text-red-500" />
                顾虑担忧 (Cons)
              </label>
              <div className="space-y-2 mb-2">
                {tempCons.map((con, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                    <span className="flex-1 text-sm text-gray-700">{con}</span>
                    <button onClick={() => removeCon(index)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCon}
                  onChange={(e) => setNewCon(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="输入一个顾虑..."
                />
                <button
                  onClick={addCon}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToWishlist}
              disabled={!selectedProduct}
              className="w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Clock size={18} />
              加入愿望清单 (7天后提醒)
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">愿望清单</h3>
          {itemsWithProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              <Clock size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">愿望清单为空</p>
              <p className="mt-2">添加产品并记录购买理由与顾虑</p>
            </div>
          ) : (
            <div className="space-y-4">
              {itemsWithProducts
                .filter((item) => item.product)
                .map((item) => {
                  const daysLeft = getDaysUntilReminder(item.reminderDate);
                  const isReady = daysLeft <= 0;
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-lg shadow overflow-hidden ${
                        isReady && !item.isReminderTriggered ? 'reminder-pulse border-2 border-yellow-400' : ''
                      }`}
                    >
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-white">{item.product?.name}</h4>
                            <p className="text-cyan-100 text-sm">
                              ¥{item.product?.currentPrice.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {isReady ? (
                              !item.isReminderTriggered ? (
                                <button
                                  onClick={() => triggerReminder(item.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-medium hover:bg-yellow-300"
                                >
                                  <Bell size={14} />
                                  确认提醒
                                </button>
                              ) : (
                                <span className="flex items-center gap-1 px-3 py-1.5 bg-green-400 text-green-900 rounded-lg text-sm font-medium">
                                  <Check size={14} />
                                  已确认
                                </span>
                              )
                            ) : (
                              <div className="text-white">
                                <span className="text-2xl font-bold">{daysLeft}</span>
                                <span className="text-sm ml-1">天后</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <ThumbsUp size={14} className="text-green-500" />
                            购买理由
                          </h5>
                          {item.pros.length === 0 ? (
                            <p className="text-sm text-gray-400">暂无记录</p>
                          ) : (
                            <ul className="space-y-1">
                              {item.pros.map((pro, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-green-500">•</span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <ThumbsDown size={14} className="text-red-500" />
                            顾虑担忧
                          </h5>
                          {item.cons.length === 0 ? (
                            <p className="text-sm text-gray-400">暂无记录</p>
                          ) : (
                            <ul className="space-y-1">
                              {item.cons.map((con, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-red-500">•</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecisionProsCons;
