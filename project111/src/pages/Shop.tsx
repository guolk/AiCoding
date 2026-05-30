import React from 'react';
import { Star, History, Filter, CheckCircle, Clock } from 'lucide-react';
import { useShopStore } from '../stores/useShopStore';
import { useUserStore } from '../stores/useUserStore';
import ShopItemCard from '../components/ShopItemCard';
import Modal from '../components/Modal';
import type { ShopCategory, ShopItem } from '../types';
import { SHOP_CATEGORY_LABELS } from '../types';

export default function Shop() {
  const { items, history, filterCategory, setFilterCategory, getFilteredItems, redeemItem } =
    useShopStore();
  const { currentUser, updateCoins } = useUserStore();

  const categories: (ShopCategory | 'all')[] = ['all', 'screen_time', 'pocket_money', 'privilege', 'other'];
  const filteredItems = getFilteredItems();

  const [redeemModalOpen, setRedeemModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<ShopItem | null>(null);
  const [showHistory, setShowHistory] = React.useState(false);
  const [redeemSuccess, setRedeemSuccess] = React.useState(false);

  const userHistory = history.filter((h) => h.userId === currentUser.id);

  const handleRedeemClick = (item: ShopItem) => {
    if (currentUser.coins >= item.priceCoins) {
      setSelectedItem(item);
      setRedeemModalOpen(true);
    }
  };

  const confirmRedeem = async () => {
    if (!selectedItem) return;
    
    updateCoins(-selectedItem.priceCoins);
    await redeemItem(selectedItem.id);
    setRedeemSuccess(true);
    
    setTimeout(() => {
      setRedeemSuccess(false);
      setRedeemModalOpen(false);
      setSelectedItem(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-neutral-800 mb-1">🛍️ 积分商城</h1>
          <p className="text-neutral-500">用金币兑换你想要的奖励</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              showHistory
                ? 'bg-secondary-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <History className="w-5 h-5" />
            兑换记录
          </button>
          <div className="flex items-center gap-2 px-6 py-3 bg-gradient-warm rounded-2xl text-white shadow-lg">
            <Star className="w-6 h-6 fill-current" />
            <span className="font-display text-xl">{currentUser.coins}</span>
          </div>
        </div>
      </div>

      {showHistory ? (
        <div className="card">
          <h3 className="font-display text-lg text-neutral-800 mb-4">📜 兑换记录</h3>
          {userHistory.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无兑换记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-neutral-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl">
                      🎁
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-800">{record.itemName}</p>
                      <p className="text-sm text-neutral-500">
                        {new Date(record.redeemedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-primary-600 font-semibold">
                      <Star className="w-4 h-4 fill-current" />
                      -{record.coinsSpent}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {record.status === 'completed' ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          已发放
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          待发放
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-neutral-500" />
              <span className="font-medium text-neutral-600">分类筛选</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filterCategory === cat
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat === 'all' ? '全部商品' : SHOP_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                userCoins={currentUser.coins}
                onRedeem={handleRedeemClick}
              />
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={redeemModalOpen}
        onClose={() => setRedeemModalOpen(false)}
        title="确认兑换"
        size="md"
      >
        {selectedItem && (
          <div className="space-y-6">
            {redeemSuccess ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h3 className="font-display text-2xl text-green-600 mb-2">兑换成功！</h3>
                <p className="text-neutral-500">
                  奖励将由管理员尽快发放
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-float-slow">
                    {selectedItem.icon}
                  </div>
                  <h3 className="font-display text-xl text-neutral-800 mb-1">
                    {selectedItem.name}
                  </h3>
                  <p className="text-neutral-500">{selectedItem.description}</p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">所需金币</span>
                    <span className="flex items-center gap-1 text-xl font-bold text-primary-600">
                      <Star className="w-6 h-6 fill-current" />
                      {selectedItem.priceCoins}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200">
                    <span className="text-neutral-600">你的余额</span>
                    <span className="flex items-center gap-1 text-xl font-bold text-secondary-600">
                      <Star className="w-6 h-6 fill-current" />
                      {currentUser.coins}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200">
                    <span className="text-neutral-600">兑换后剩余</span>
                    <span className="flex items-center gap-1 text-xl font-bold text-neutral-700">
                      <Star className="w-6 h-6 fill-current" />
                      {currentUser.coins - selectedItem.priceCoins}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setRedeemModalOpen(false)}
                    className="flex-1 btn-outline"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmRedeem}
                    className="flex-1 btn-primary"
                  >
                    ✅ 确认兑换
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
