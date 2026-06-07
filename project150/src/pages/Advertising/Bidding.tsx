import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  formatCurrency,
  formatPercent,
  formatDate,
} from '@/lib/api';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Clock,
} from 'lucide-react';
import type { KeywordBid } from '@/../shared/types';

export function Bidding() {
  const { keywordBids, adCampaigns } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    campaignId: '',
    keyword: '',
    oldBid: '',
    newBid: '',
    reason: '',
  });

  const getCampaignName = (campaignId: string) => {
    const campaign = adCampaigns.find((c) => c.id === campaignId);
    return campaign?.name || '-';
  };

  const sortedBids = useMemo(() => {
    return [...keywordBids].sort((a, b) => b.date.localeCompare(a.date));
  }, [keywordBids]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
  };

  const BidChangeIndicator = ({ oldBid, newBid }: { oldBid: number; newBid: number }) => {
    const change = ((newBid - oldBid) / oldBid) * 100;
    const isPositive = newBid > oldBid;

    return (
      <div className="flex items-center gap-2">
        <span className={`font-medium ${isPositive ? 'text-danger-500' : 'text-success-500'}`}>
          {formatCurrency(oldBid)} → {formatCurrency(newBid)}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-danger-600/20 text-danger-500 border border-danger-600/30'
              : 'bg-success-600/20 text-success-500 border border-success-600/30'
          }`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? '+' : ''}
          {change.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">关键词出价优化历史</h2>
          <p className="text-sm text-gray-400 mt-1">
            跟踪所有关键词出价调整及其效果
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          记录出价调整
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>关键词</th>
                <th>所属活动</th>
                <th>出价变化</th>
                <th>调整日期</th>
                <th>调整原因</th>
                <th className="text-right">7天 ACOS</th>
                <th className="text-right">7天销售额</th>
              </tr>
            </thead>
            <tbody>
              {sortedBids.map((bid: KeywordBid, index) => (
                <tr
                  key={bid.id}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    opacity: 0,
                    animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards`,
                  }}
                >
                  <td>
                    <span className="text-white font-medium">{bid.keyword}</span>
                  </td>
                  <td className="text-gray-300">{getCampaignName(bid.campaignId)}</td>
                  <td>
                    <BidChangeIndicator oldBid={bid.oldBid} newBid={bid.newBid} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock size={14} className="text-gray-500" />
                      {formatDate(bid.date)}
                    </div>
                  </td>
                  <td className="text-gray-400 max-w-xs truncate">{bid.reason || '-'}</td>
                  <td className="text-right">
                    {bid.effect7dAcos !== undefined ? (
                      <span
                        className={`font-medium ${
                          bid.effect7dAcos > 40
                            ? 'text-danger-500'
                            : bid.effect7dAcos > 25
                            ? 'text-warning-500'
                            : 'text-success-500'
                        }`}
                      >
                        {formatPercent(bid.effect7dAcos)}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="text-right">
                    {bid.effect7dSales !== undefined ? (
                      <span className="text-white font-medium">
                        {formatCurrency(bid.effect7dSales)}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedBids.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">暂无出价调整记录</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="glass-card p-6 w-full max-w-lg mx-4 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">记录出价调整</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  所属广告活动
                </label>
                <select
                  value={formData.campaignId}
                  onChange={(e) =>
                    setFormData({ ...formData, campaignId: e.target.value })
                  }
                  className="input-field w-full"
                  required
                >
                  <option value="">请选择广告活动</option>
                  {adCampaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  关键词
                </label>
                <input
                  type="text"
                  value={formData.keyword}
                  onChange={(e) =>
                    setFormData({ ...formData, keyword: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="wireless earbuds noise cancelling"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    原出价 (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oldBid}
                    onChange={(e) =>
                      setFormData({ ...formData, oldBid: e.target.value })
                    }
                    className="input-field w-full"
                    placeholder="1.20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    新出价 (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.newBid}
                    onChange={(e) =>
                      setFormData({ ...formData, newBid: e.target.value })
                    }
                    className="input-field w-full"
                    placeholder="1.50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  调整原因
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="input-field w-full resize-none"
                  rows={3}
                  placeholder="排名下滑，需提高出价抢位置..."
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  保存记录
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
