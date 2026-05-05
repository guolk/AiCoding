import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryClient';
import { languageExchangeApi } from '@/services/languageExchangeService';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import { SubscriptionPlan, UserSubscription, SubscriptionTier } from '@/types';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  currentTier?: SubscriptionTier;
  billingCycle: 'monthly' | 'yearly';
  onSubscribe: (tier: SubscriptionTier, cycle: 'monthly' | 'yearly') => void;
}

function PlanCard({ plan, isPopular, currentTier, billingCycle, onSubscribe }: PlanCardProps) {
  const isCurrentPlan = currentTier === plan.tier;
  const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const monthlyEquivalent = billingCycle === 'yearly' 
    ? Math.round(plan.priceYearly / 12) 
    : plan.priceMonthly;

  const tierColors: Record<SubscriptionTier, string> = {
    free: 'border-gray-200',
    premium: 'border-indigo-400',
    professional: 'border-purple-400',
  };

  const tierBg: Record<SubscriptionTier, string> = {
    free: 'bg-gray-50',
    premium: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    professional: 'bg-gradient-to-br from-purple-50 to-purple-100',
  };

  return (
    <div
      className={`relative rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
        tierColors[plan.tier]
      } ${isPopular ? 'ring-2 ring-indigo-500' : ''}`}
    >
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-center py-1.5 text-sm font-medium">
          ⭐ 最受欢迎
        </div>
      )}

      <div className={`p-6 ${isPopular ? 'pt-14' : ''} ${tierBg[plan.tier]}`}>
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>

        <div className="mt-4">
          {price === 0 ? (
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-gray-900">免费</span>
            </div>
          ) : (
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-gray-900">¥</span>
              <span className="text-4xl font-bold text-gray-900">{price}</span>
              <span className="text-gray-500 mb-1">
                /{billingCycle === 'yearly' ? '年' : '月'}
              </span>
            </div>
          )}
          {billingCycle === 'yearly' && price > 0 && (
            <p className="text-sm text-green-600 mt-1">
              相当于 ¥{monthlyEquivalent}/月，立省 ¥
              {plan.priceMonthly * 12 - plan.priceYearly}
            </p>
          )}
        </div>

        {isCurrentPlan ? (
          <Button fullWidth variant="ghost" className="mt-4 bg-green-50 text-green-600 border-0">
            ✅ 当前套餐
          </Button>
        ) : (
          <Button
            fullWidth
            className="mt-4"
            onClick={() => onSubscribe(plan.tier, billingCycle)}
          >
            {price === 0 ? '使用免费版' : `立即订阅`}
          </Button>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <h4 className="font-medium text-gray-900 mb-4">包含功能</h4>
        <ul className="space-y-3">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              {feature.isIncluded ? (
                <span className="text-green-500 mt-0.5">✓</span>
              ) : (
                <span className="text-gray-300 mt-0.5">✗</span>
              )}
              <div className={`${feature.isIncluded ? 'text-gray-700' : 'text-gray-400'}`}>
                <span className="font-medium text-sm">{feature.name}</span>
                <p className="text-xs text-gray-500">{feature.description}</p>
                {feature.limit && (
                  <p className="text-xs text-indigo-600">
                    {feature.isUnlimited ? '无限' : `限制: ${feature.limit}`}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function UsageStats({ subscription }: { subscription?: UserSubscription | null }) {
  const mockUsage = {
    matchesUsed: 2,
    matchesLimit: subscription?.usage?.matchesLimit || 3,
    aiCorrectionsUsed: 12,
    aiCorrectionsLimit: subscription?.usage?.aiCorrectionsLimit || 50,
    recordingMinutesUsed: 45,
    recordingMinutesLimit: subscription?.usage?.recordingMinutesLimit || 600,
  };

  const getProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const ProgressBar = ({
    label,
    used,
    limit,
    unit,
  }: {
    label: string;
    used: number;
    limit: number;
    unit: string;
  }) => {
    const percentage = Math.min((used / limit) * 100, 100);
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-500">
            {used}/{limit} {unit}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
              used,
              limit
            )}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">本月使用情况</h3>
      <div className="space-y-6">
        <ProgressBar
          label="每日匹配"
          used={mockUsage.matchesUsed}
          limit={mockUsage.matchesLimit}
          unit="次"
        />
        <ProgressBar
          label="AI语法纠正"
          used={mockUsage.aiCorrectionsUsed}
          limit={mockUsage.aiCorrectionsLimit}
          unit="次"
        />
        <ProgressBar
          label="录音时长"
          used={mockUsage.recordingMinutesUsed}
          limit={mockUsage.recordingMinutesLimit}
          unit="分钟"
        />
      </div>
    </div>
  );
}

function CurrentSubscriptionCard({
  subscription,
  onCancel,
}: {
  subscription?: UserSubscription | null;
  onCancel: () => void;
}) {
  if (!subscription) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">当前订阅</h3>
        <p className="text-gray-500">免费版用户</p>
      </div>
    );
  }

  const tierNames: Record<SubscriptionTier, string> = {
    free: '免费版',
    premium: 'Premium',
    professional: 'Professional',
  };

  const tierColors: Record<SubscriptionTier, string> = {
    free: 'bg-gray-100 text-gray-700',
    premium: 'bg-indigo-100 text-indigo-700',
    professional: 'bg-purple-100 text-purple-700',
  };

  const endDate = new Date(subscription.endDate);
  const now = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">当前订阅</h3>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${tierColors[subscription.tier]}`}>
            {tierNames[subscription.tier]}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              subscription.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {subscription.status === 'active' ? '活跃' : '已过期'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">开始日期</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(subscription.startDate).toLocaleDateString('zh-CN')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">到期日期</p>
          <p className="text-sm font-medium text-gray-900">
            {endDate.toLocaleDateString('zh-CN')}
            {daysLeft > 0 && (
              <span className="text-xs text-orange-500 ml-1">({daysLeft}天后)</span>
            )}
          </p>
        </div>
      </div>

      {subscription.tier !== 'free' && (
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-red-500 hover:text-red-600">
          取消订阅
        </Button>
      )}
    </div>
  );
}

export function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: queryKeys.subscription.plans,
    queryFn: () => languageExchangeApi.getSubscriptionPlans(),
  });

  const { data: currentSubscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: queryKeys.subscription.current,
    queryFn: () => languageExchangeApi.getCurrentSubscription(),
  });

  const isLoading = isLoadingPlans || isLoadingSubscription;

  const handleSubscribe = async (tier: SubscriptionTier, cycle: 'monthly' | 'yearly') => {
    if (tier === 'free') return;
    setSelectedTier(tier);
    setShowConfirmModal(true);
  };

  const confirmSubscribe = async () => {
    if (!selectedTier || selectedTier === 'free') return;
    setIsSubscribing(true);
    try {
      await languageExchangeApi.subscribe(selectedTier, billingCycle);
      setShowConfirmModal(false);
      setSelectedTier(null);
    } catch (error) {
      console.error('订阅失败:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCancel = async () => {
    try {
      await languageExchangeApi.cancelSubscription();
    } catch (error) {
      console.error('取消订阅失败:', error);
    }
  };

  const sortedPlans = plans?.slice().sort((a, b) => {
    const order: SubscriptionTier[] = ['free', 'premium', 'professional'];
    return order.indexOf(a.tier) - order.indexOf(b.tier);
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订阅管理</h1>
          <p className="text-gray-500 mt-1">选择适合您的学习计划</p>
        </div>

        {isLoading ? (
          <Loading text="加载中..." />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        billingCycle === 'monthly'
                          ? 'bg-white text-gray-900 shadow'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      月付
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        billingCycle === 'yearly'
                          ? 'bg-white text-gray-900 shadow'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      年付
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        省20%
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sortedPlans?.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isPopular={plan.isPopular}
                      currentTier={currentSubscription?.tier || 'free'}
                      billingCycle={billingCycle}
                      onSubscribe={handleSubscribe}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <CurrentSubscriptionCard
                  subscription={currentSubscription || null}
                  onCancel={handleCancel}
                />
                <UsageStats subscription={currentSubscription || null} />
              </div>
            </div>
          </>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">确认订阅</h3>
              <p className="text-gray-600 mb-6">
                您确定要订阅 {selectedTier === 'premium' ? 'Premium' : 'Professional'} 计划吗？
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedTier(null);
                  }}
                >
                  取消
                </Button>
                <Button fullWidth onClick={confirmSubscribe} isLoading={isSubscribing}>
                  确认订阅
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SubscriptionPage;
