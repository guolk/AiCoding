import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SubscriptionPlan, PurchaseItem, VideoCourse, UserPurchase } from '@/types';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import { formatDate } from '@/utils/music';
import { queryKeys } from '@/services/queryClient';
import { videoCoursesData, subscriptionPlansData } from '@/data/exercises';

const mockPurchases: UserPurchase[] = [
  {
    id: 'purchase-001',
    userId: 1,
    itemType: 'course',
    itemId: 'video-course-001',
    purchaseDate: '2024-04-15T00:00:00Z',
    isActive: true,
    pricePaid: 99,
  },
  {
    id: 'purchase-002',
    userId: 1,
    itemType: 'subscription',
    itemId: 'plan-monthly',
    purchaseDate: '2024-05-01T00:00:00Z',
    expiresAt: '2024-06-01T00:00:00Z',
    isActive: true,
    pricePaid: 99,
  },
];

function PaymentPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'courses' | 'history'>('plans');

  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: queryKeys.purchases.list(),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { items: mockPurchases, total: mockPurchases.length };
    },
  });

  const activeSubscription = purchases?.items.find(
    p => p.itemType === 'subscription' && p.isActive
  );

  const tabs = [
    { key: 'plans' as const, label: '订阅计划', icon: '💎' },
    { key: 'courses' as const, label: '购买课程', icon: '📚' },
    { key: 'history' as const, label: '购买记录', icon: '📋' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">付费中心</h1>
          <p className="text-gray-500 mt-1">订阅会员或购买课程，解锁更多内容</p>
        </div>

        {activeSubscription && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">当前会员状态</p>
                <h3 className="text-2xl font-bold mt-1">
                  {subscriptionPlansData.find(p => p.id === activeSubscription.itemId)?.name || '会员'}
                </h3>
                <p className="text-purple-100 mt-1">
                  有效期至: {formatDate(activeSubscription.expiresAt || '')}
                </p>
              </div>
              <Button className="bg-white text-purple-600 hover:bg-purple-50">
                续费升级
              </Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'plans' && (
              <PlansView
                plans={subscriptionPlansData}
                activePlanId={activeSubscription?.itemId}
              />
            )}
            {activeTab === 'courses' && (
              <CoursesView
                courses={videoCoursesData.filter(c => c.price > 0 && !c.isSubscriptionOnly)}
                purchasedCourseIds={purchases?.items
                  .filter(p => p.itemType === 'course')
                  .map(p => p.itemId) || []}
              />
            )}
            {activeTab === 'history' && (
              <HistoryView purchases={purchases?.items || []} isLoading={purchasesLoading} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function PlansView({
  plans,
  activePlanId,
}: {
  plans: SubscriptionPlan[];
  activePlanId?: string;
}) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const billingCycleLabels: Record<string, string> = {
    monthly: '月',
    quarterly: '季度',
    yearly: '年',
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">选择适合您的订阅计划</h2>
        <p className="text-gray-500 mt-2">所有计划都包含视频课程无限观看、AI伴奏功能</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isActive = activePlanId === plan.id;
          const isPopular = plan.isPopular;

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-6 transition-all ${
                isPopular
                  ? 'border-purple-500 shadow-lg scale-105'
                  : isActive
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-purple-500 text-white rounded-full text-sm font-medium">
                    最受欢迎
                  </span>
                </div>
              )}
              {isActive && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                    当前计划
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">¥{plan.price}</span>
                  <span className="text-gray-500">/{billingCycleLabels[plan.billingCycle]}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                variant={isActive ? 'secondary' : isPopular ? 'primary' : 'secondary'}
                onClick={() => {
                  if (!isActive) {
                    setSelectedPlan(plan.id);
                    setShowPaymentModal(true);
                  }
                }}
              >
                {isActive ? '已订阅' : isPopular ? '立即订阅' : '选择计划'}
              </Button>
            </div>
          );
        })}
      </div>

      {showPaymentModal && selectedPlan && (
        <PaymentModal
          type="subscription"
          itemId={selectedPlan}
          itemName={plans.find(p => p.id === selectedPlan)?.name || ''}
          price={plans.find(p => p.id === selectedPlan)?.price || 0}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
}

function CoursesView({
  courses,
  purchasedCourseIds,
}: {
  courses: VideoCourse[];
  purchasedCourseIds: string[];
}) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isPurchased = purchasedCourseIds.includes(course.id);

          return (
            <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className="h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${course.thumbnailUrl})` }}
              >
                <div className="absolute top-3 right-3 px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
                  ¥{course.price}
                </div>
                {isPurchased && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                    已购买
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span>{course.chapters.length} 章节</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  variant={isPurchased ? 'secondary' : 'primary'}
                  onClick={() => {
                    if (!isPurchased) {
                      setSelectedCourse(course.id);
                      setShowPaymentModal(true);
                    }
                  }}
                >
                  {isPurchased ? '开始学习' : `¥${course.price} 购买`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {showPaymentModal && selectedCourse && (
        <PaymentModal
          type="course"
          itemId={selectedCourse}
          itemName={courses.find(c => c.id === selectedCourse)?.title || ''}
          price={courses.find(c => c.id === selectedCourse)?.price || 0}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
}

function HistoryView({
  purchases,
  isLoading,
}: {
  purchases: UserPurchase[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <Loading isLoading={true} text="加载购买记录..." />;
  }

  const typeLabels: Record<string, string> = {
    subscription: '会员订阅',
    course: '课程购买',
  };

  return (
    <div className="space-y-4">
      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">暂无购买记录</h3>
          <p className="mt-2 text-gray-500">订阅会员或购买课程后，这里会显示您的购买记录</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">订单类型</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">商品名称</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">购买日期</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">到期日期</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">支付金额</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">状态</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      purchase.itemType === 'subscription'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {typeLabels[purchase.itemType]}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {purchase.itemType === 'subscription'
                      ? subscriptionPlansData.find(p => p.id === purchase.itemId)?.name
                      : videoCoursesData.find(c => c.id === purchase.itemId)?.title
                    }
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {formatDate(purchase.purchaseDate)}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {purchase.expiresAt ? formatDate(purchase.expiresAt) : '-'}
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">
                    ¥{purchase.pricePaid}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      purchase.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {purchase.isActive ? '有效' : '已过期'}
                    </span>
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

function PaymentModal({
  type,
  itemId,
  itemName,
  price,
  onClose,
}: {
  type: 'subscription' | 'course';
  itemId: string;
  itemName: string;
  price: number;
  onClose: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'card'>('alipay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mt-4">支付成功！</h3>
          <p className="text-gray-500 mt-2">您已成功购买 {itemName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-lg w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">确认支付</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {type === 'subscription' ? '订阅计划' : '视频课程'}
                </p>
                <p className="font-medium text-gray-900">{itemName}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">¥{price}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">选择支付方式</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'alipay' as const, label: '支付宝', icon: '💙' },
                { key: 'wechat' as const, label: '微信支付', icon: '💚' },
                { key: 'card' as const, label: '银行卡', icon: '💳' },
              ].map((method) => (
                <button
                  key={method.key}
                  onClick={() => setPaymentMethod(method.key)}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    paymentMethod === method.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <p className="text-sm text-gray-700 mt-2">{method.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <input type="checkbox" id="agreement" className="rounded" defaultChecked />
            <label htmlFor="agreement">
              我已阅读并同意 <a href="#" className="text-blue-600">用户协议</a> 和 <a href="#" className="text-blue-600">隐私政策</a>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">应付金额</span>
            <span className="text-2xl font-bold text-red-600">¥{price}</span>
          </div>
          <Button
            className="w-full py-3 text-lg"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">🔄</span>
                处理中...
              </>
            ) : (
              `确认支付 ¥${price}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
