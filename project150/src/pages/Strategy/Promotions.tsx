import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  platformNames,
  platformColors,
} from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import {
  Tag,
  TrendingUp,
  Calendar,
  FileText,
  Plus,
  Edit,
  DollarSign,
  Target,
  ChevronDown,
  Clock,
  CheckCircle,
  PlayCircle,
} from 'lucide-react';
import type { Promotion, Platform } from '@/../shared/types';

type PromotionStatus = 'upcoming' | 'active' | 'completed';

export function Promotions() {
  const { promotions, addPromotion } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PromotionStatus | 'all'>('all');
  const [formData, setFormData] = useState({
    name: '',
    platform: 'amazon' as Platform,
    type: '',
    startDate: '',
    endDate: '',
    discountDescription: '',
    budget: '',
    targetSales: '',
  });

  const getPromotionStatus = (promotion: Promotion): PromotionStatus => {
    const today = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (today < start) return 'upcoming';
    if (today > end) return 'completed';
    return 'active';
  };

  const getStatusConfig = (status: PromotionStatus) => {
    switch (status) {
      case 'upcoming':
        return {
          label: '即将开始',
          color: 'bg-primary-600/20 text-primary-400 border-primary-600/30',
          dotColor: 'bg-primary-500',
          icon: Clock,
        };
      case 'active':
        return {
          label: '进行中',
          color: 'bg-success-600/20 text-success-400 border-success-600/30',
          dotColor: 'bg-success-500',
          icon: PlayCircle,
        };
      case 'completed':
        return {
          label: '已完成',
          color: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
          dotColor: 'bg-gray-500',
          icon: CheckCircle,
        };
    }
  };

  const filteredPromotions = useMemo(() => {
    if (statusFilter === 'all') return promotions;
    return promotions.filter((p) => getPromotionStatus(p) === statusFilter);
  }, [promotions, statusFilter]);

  const summaryStats = useMemo(() => {
    const totalPromotions = promotions.length;
    const activePromotions = promotions.filter(
      (p) => getPromotionStatus(p) === 'active'
    ).length;
    const totalBudget = promotions.reduce((sum, p) => sum + (p.budget || 0), 0);
    const avgROI =
      promotions.filter((p) => p.roi !== undefined).reduce((sum, p) => sum + (p.roi || 0), 0) /
      (promotions.filter((p) => p.roi !== undefined).length || 1);

    return { totalPromotions, activePromotions, totalBudget, avgROI };
  }, [promotions]);

  const handleAddPromotion = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) return;

    const newPromotion: Promotion = {
      id: `promo${Date.now()}`,
      name: formData.name,
      platform: formData.platform,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      discountDescription: formData.discountDescription,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      targetSales: formData.targetSales ? parseFloat(formData.targetSales) : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    addPromotion(newPromotion);
    setShowAddForm(false);
    setFormData({
      name: '',
      platform: 'amazon',
      type: '',
      startDate: '',
      endDate: '',
      discountDescription: '',
      budget: '',
      targetSales: '',
    });
  };

  const getChartData = (promotion: Promotion) => {
    return [
      { name: '目标销售额', value: promotion.targetSales || 0 },
      { name: '实际销售额', value: promotion.actualSales || 0 },
    ];
  };

  const getTimelineData = () => {
    const sorted = [...promotions].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    return sorted.map((p) => ({
      ...p,
      status: getPromotionStatus(p),
      duration:
        (new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    }));
  };

  const ChartTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const statusFilters: { id: PromotionStatus | 'all'; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'upcoming', label: '即将开始' },
    { id: 'active', label: '进行中' },
    { id: 'completed', label: '已完成' },
  ];

  const timelineData = getTimelineData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">促销活动管理</h2>
          <p className="text-sm text-gray-400 mt-1">
            规划、执行和评估各平台促销活动
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  statusFilter === filter.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-700 border border-white/10'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            添加促销
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="glass-card p-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Edit size={20} className="text-primary-400" />
            新建促销活动
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">活动名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：618年中大促"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">平台</label>
              <div className="relative">
                <select
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value as Platform })
                  }
                  className="input-field appearance-none pr-10 w-full"
                >
                  <option value="amazon">Amazon</option>
                  <option value="ebay">eBay</option>
                  <option value="shopify">Shopify</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">活动类型</label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="例如：LD、7DD、Sitewide"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">预算 (USD)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="促销预算"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">开始日期</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">结束日期</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">折扣说明</label>
              <input
                type="text"
                value={formData.discountDescription}
                onChange={(e) =>
                  setFormData({ ...formData, discountDescription: e.target.value })
                }
                placeholder="例如：满100减20"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">目标销售额 (USD)</label>
              <input
                type="number"
                value={formData.targetSales}
                onChange={(e) => setFormData({ ...formData, targetSales: e.target.value })}
                placeholder="预期销售额"
                className="input-field w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleAddPromotion}
              className="btn-primary"
              disabled={!formData.name || !formData.startDate || !formData.endDate}
            >
              创建活动
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="总活动数"
          value={formatNumber(summaryStats.totalPromotions)}
          icon={Tag}
          color="blue"
          delay={0}
        />
        <StatCard
          title="进行中活动"
          value={formatNumber(summaryStats.activePromotions)}
          change={1}
          icon={PlayCircle}
          color="green"
          delay={100}
        />
        <StatCard
          title="总预算"
          value={formatCurrency(summaryStats.totalBudget)}
          icon={DollarSign}
          color="yellow"
          delay={200}
        />
        <StatCard
          title="平均 ROI"
          value={`${summaryStats.avgROI.toFixed(2)}x`}
          change={0.8}
          icon={TrendingUp}
          color="yellow"
          delay={300}
        />
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-6">促销时间线</h3>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-dark-600" />
          <div className="space-y-6">
            {timelineData.map((promotion, index) => {
              const status = getPromotionStatus(promotion);
              const statusConfig = getStatusConfig(status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={promotion.id}
                  className="relative flex gap-4"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: 0,
                    animation: `fadeInUp 0.5s ease-out ${index * 100}ms forwards`,
                  }}
                >
                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 ${statusConfig.color}`}
                      style={{
                        backgroundColor: status === 'active' ? 'rgba(16, 185, 129, 0.1)' : undefined,
                        boxShadow: status === 'active' ? '0 0 20px rgba(16, 185, 129, 0.3)' : undefined,
                      }}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${statusConfig.dotColor} ${
                          status === 'active' ? 'animate-pulse' : ''
                        }`}
                      />
                    </div>
                    {status === 'active' && (
                      <div className="absolute inset-0 w-16 h-16 rounded-xl bg-success-500/20 animate-ping opacity-30" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-semibold">{promotion.name}</h4>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {platformNames[promotion.platform]} · {promotion.type}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusConfig.color}`}
                      >
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(promotion.startDate)} ~ {formatDate(promotion.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag size={14} />
                        {promotion.duration} 天
                      </span>
                      {promotion.discountDescription && (
                        <span className="flex items-center gap-1">
                          <Tag size={14} />
                          {promotion.discountDescription}
                        </span>
                      )}
                    </div>
                    {status === 'completed' && promotion.roi !== undefined && (
                      <div className="mt-3 flex items-center gap-6">
                        <div>
                          <span className="text-xs text-gray-500">ROI</span>
                          <p
                            className={`text-xl font-bold ${
                              promotion.roi >= 5
                                ? 'text-success-400'
                                : promotion.roi >= 2
                                ? 'text-primary-400'
                                : 'text-warning-400'
                            }`}
                          >
                            {promotion.roi.toFixed(2)}x
                          </p>
                        </div>
                        {promotion.targetSales && promotion.actualSales && (
                          <div>
                            <span className="text-xs text-gray-500">完成率</span>
                            <p className="text-xl font-bold text-white">
                              {formatPercent(
                                (promotion.actualSales / promotion.targetSales) * 100
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...filteredPromotions]
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .map((promotion, index) => {
            const status = getPromotionStatus(promotion);
            const statusConfig = getStatusConfig(status);
            const StatusIcon = statusConfig.icon;
            const chartData = getChartData(promotion);
            const completionRate =
              promotion.targetSales && promotion.actualSales
                ? (promotion.actualSales / promotion.targetSales) * 100
                : null;

            return (
              <div
                key={promotion.id}
                className="glass-card p-6 relative overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`,
                  opacity: 0,
                  animation: `fadeInUp 0.5s ease-out ${index * 100}ms forwards`,
                }}
              >
                {status === 'active' && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-success-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                )}

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {promotion.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className="text-sm font-medium"
                          style={{ color: platformColors[promotion.platform] }}
                        >
                          {platformNames[promotion.platform]}
                        </span>
                        <span className="text-sm text-gray-500">·</span>
                        <span className="text-sm text-gray-400">{promotion.type}</span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusConfig.color}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${statusConfig.dotColor} ${
                          status === 'active' ? 'animate-pulse' : ''
                        }`}
                      />
                      <StatusIcon size={12} />
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-dark-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar size={12} />
                        活动时间
                      </p>
                      <p className="text-sm text-gray-300">
                        {formatDate(promotion.startDate)}
                      </p>
                      <p className="text-sm text-gray-300">
                        ~ {formatDate(promotion.endDate)}
                      </p>
                    </div>
                    <div className="bg-dark-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <DollarSign size={12} />
                        预算
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {promotion.budget ? formatCurrency(promotion.budget) : '-'}
                      </p>
                    </div>
                  </div>

                  {promotion.discountDescription && (
                    <div className="bg-primary-600/10 border border-primary-600/20 rounded-lg p-3 mb-4">
                      <p className="text-xs text-primary-400 mb-1">折扣优惠</p>
                      <p className="text-sm text-white font-medium">
                        {promotion.discountDescription}
                      </p>
                    </div>
                  )}

                  {(promotion.targetSales || promotion.actualSales) && (
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Target size={14} />
                          目标销售额
                        </span>
                        <span className="text-white font-medium">
                          {promotion.targetSales
                            ? formatCurrency(promotion.targetSales)
                            : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-1">
                          <TrendingUp size={14} />
                          实际销售额
                        </span>
                        <span className="text-white font-medium">
                          {promotion.actualSales
                            ? formatCurrency(promotion.actualSales)
                            : '-'}
                        </span>
                      </div>
                      {completionRate !== null && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">完成进度</span>
                            <span
                              className={`font-medium ${
                                completionRate >= 100
                                  ? 'text-success-400'
                                  : completionRate >= 70
                                  ? 'text-primary-400'
                                  : 'text-warning-400'
                              }`}
                            >
                              {formatPercent(completionRate)}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-bar-fill ${
                                completionRate >= 100
                                  ? 'bg-success-500'
                                  : completionRate >= 70
                                  ? 'bg-primary-500'
                                  : 'bg-warning-500'
                              }`}
                              style={{ width: `${Math.min(completionRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {status === 'completed' && promotion.roi !== undefined && (
                    <div className="bg-dark-700/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">投资回报率</p>
                          <p
                            className={`text-2xl font-bold ${
                              promotion.roi >= 5
                                ? 'text-success-400'
                                : promotion.roi >= 2
                                ? 'text-primary-400'
                                : 'text-warning-400'
                            }`}
                          >
                            {promotion.roi.toFixed(2)}x
                          </p>
                        </div>
                        {promotion.actualSales !== undefined && promotion.budget !== undefined && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">净利润</p>
                            <p className="text-lg font-semibold text-success-400">
                              {formatCurrency(promotion.actualSales - promotion.budget)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {promotion.targetSales && promotion.actualSales && (
                    <div className="h-40 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis
                            dataKey="name"
                            stroke="#6B7280"
                            tick={{ fill: '#9CA3AF', fontSize: 11 }}
                          />
                          <YAxis
                            stroke="#6B7280"
                            tick={{ fill: '#9CA3AF', fontSize: 11 }}
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar
                            dataKey="value"
                            name="金额"
                            fill="#3B82F6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {promotion.reviewNotes && (
                    <div className="border-t border-dark-700 pt-4">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <FileText size={12} />
                        经验总结
                      </p>
                      <p className="text-sm text-gray-300">{promotion.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Tag size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">暂无促销活动</p>
        </div>
      )}
    </div>
  );
}
