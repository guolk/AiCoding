import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  adStatusLabels,
  adStatusColors,
  formatDate,
  platformNames,
} from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import {
  Target,
  TrendingUp,
  DollarSign,
  Play,
  Pause,
  Plus,
  Edit3,
  X,
} from 'lucide-react';
import type { AdCampaign, Platform } from '@/../shared/types';

export function Campaigns() {
  const { adCampaigns } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'amazon' as Platform,
    type: 'SP',
    budget: '',
    dailyBudget: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const summaryStats = useMemo(() => {
    const totalBudget = adCampaigns.reduce((sum, c) => sum + c.budget, 0);
    const activeCampaigns = adCampaigns.filter((c) => c.status === 'active').length;
    const avgAcos =
      adCampaigns.length > 0
        ? adCampaigns.reduce((sum, c) => sum + (c.acos || 0), 0) / adCampaigns.length
        : 0;
    const totalSales = adCampaigns.reduce((sum, c) => sum + c.sales, 0);

    return { totalBudget, activeCampaigns, avgAcos, totalSales };
  }, [adCampaigns]);

  const handleOpenModal = (campaign?: AdCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        platform: campaign.platform,
        type: campaign.type,
        budget: campaign.budget.toString(),
        dailyBudget: campaign.dailyBudget?.toString() || '',
        startDate: campaign.startDate,
        endDate: campaign.endDate || '',
        notes: campaign.notes || '',
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: '',
        platform: 'amazon',
        type: 'SP',
        budget: '',
        dailyBudget: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
  };

  const toggleCampaignStatus = (campaign: AdCampaign) => {
    void campaign;
    // 模拟状态切换
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总预算"
          value={formatCurrency(summaryStats.totalBudget)}
          change={5.2}
          icon={DollarSign}
          color="blue"
          delay={0}
        />
        <StatCard
          title="活动中广告"
          value={formatNumber(summaryStats.activeCampaigns)}
          change={1}
          changeLabel="较上周"
          icon={Target}
          color="green"
          delay={100}
        />
        <StatCard
          title="平均 ACOS"
          value={formatPercent(summaryStats.avgAcos)}
          change={-2.3}
          icon={TrendingUp}
          color="yellow"
          delay={200}
        />
        <StatCard
          title="总销售额"
          value={formatCurrency(summaryStats.totalSales)}
          change={15.8}
          icon={DollarSign}
          color="green"
          delay={300}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">广告活动列表</h2>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          新建广告活动
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {adCampaigns.map((campaign, index) => (
          <div
            key={campaign.id}
            className="glass-card-hover p-5"
            style={{
              animationDelay: `${index * 100}ms`,
              opacity: 0,
              animation: `fadeInUp 0.6s ease-out ${index * 100}ms forwards`,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {campaign.name}
                  </h3>
                  <span className={adStatusColors[campaign.status]}>
                    {adStatusLabels[campaign.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{platformNames[campaign.platform]}</span>
                  <span>·</span>
                  <span>{campaign.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCampaignStatus(campaign)}
                  className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white"
                  title={campaign.status === 'active' ? '暂停' : '启用'}
                >
                  {campaign.status === 'active' ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} />
                  )}
                </button>
                <button
                  onClick={() => handleOpenModal(campaign)}
                  className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white"
                  title="编辑"
                >
                  <Edit3 size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">预算</p>
                <p className="text-white font-medium">
                  {formatCurrency(campaign.budget)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">ACOS</p>
                <p
                  className={`font-medium ${
                    (campaign.acos || 0) > 40
                      ? 'text-danger-500'
                      : (campaign.acos || 0) > 25
                      ? 'text-warning-500'
                      : 'text-success-500'
                  }`}
                >
                  {formatPercent(campaign.acos || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">销售额</p>
                <p className="text-white font-medium">
                  {formatCurrency(campaign.sales)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-700">
              <div>
                <p className="text-xs text-gray-500 mb-1">曝光量</p>
                <p className="text-gray-300">{formatNumber(campaign.impressions)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">点击量</p>
                <p className="text-gray-300">{formatNumber(campaign.clicks)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">订单数</p>
                <p className="text-gray-300">{formatNumber(campaign.orders)}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-700 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {formatDate(campaign.startDate)} -{' '}
                {campaign.endDate ? formatDate(campaign.endDate) : '长期'}
              </span>
              {campaign.notes && (
                <span className="text-gray-400 truncate max-w-[200px]">
                  {campaign.notes}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="glass-card p-6 w-full max-w-lg mx-4 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingCampaign ? '编辑广告活动' : '新建广告活动'}
              </h3>
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
                  活动名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="请输入活动名称"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    平台
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        platform: e.target.value as Platform,
                      })
                    }
                    className="input-field w-full"
                  >
                    <option value="amazon">Amazon</option>
                    <option value="ebay">eBay</option>
                    <option value="shopify">Shopify</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    广告类型
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="input-field w-full"
                    placeholder="SP / SB / SD"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    总预算 (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="input-field w-full"
                    placeholder="5000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    日预算 (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.dailyBudget}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyBudget: e.target.value })
                    }
                    className="input-field w-full"
                    placeholder="200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    开始日期
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    结束日期
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input-field w-full resize-none"
                  rows={3}
                  placeholder="活动备注说明..."
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingCampaign ? '保存修改' : '创建活动'}
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
