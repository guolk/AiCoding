import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import {
  CustomerTag,
  CUSTOMER_TAG_LABELS,
  PLATFORM_LABELS,
  BOOKING_STATUS_LABELS,
} from '@/types';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Star,
  DollarSign,
  Calendar,
  AlertTriangle,
  Crown,
  RefreshCw,
  MessageSquare,
  Edit2,
  Save,
  X,
  Clock,
  MapPin,
  Tag,
  Percent,
} from 'lucide-react';

const tagStyles: Record<CustomerTag, string> = {
  vip: 'bg-amber-100 text-amber-700 border-amber-200',
  returning: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blacklist: 'bg-red-100 text-red-700 border-red-200',
};

const tagActiveStyles: Record<CustomerTag, string> = {
  vip: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent',
  returning: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-transparent',
  blacklist: 'bg-gradient-to-r from-red-600 to-red-700 text-white border-transparent',
};

const tagIcons: Record<CustomerTag, React.ReactNode> = {
  vip: <Crown className="w-4 h-4" />,
  returning: <RefreshCw className="w-4 h-4" />,
  blacklist: <AlertTriangle className="w-4 h-4" />,
};

const bookingStatusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  'checked-in': 'bg-blue-100 text-blue-700',
  'checked-out': 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

export default function CustomerDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const customers = useAppStore((state) => state.customers);
  const getBookingsByCustomer = useAppStore((state) => state.getBookingsByCustomer);
  const reviews = useAppStore((state) => state.reviews);
  const properties = useAppStore((state) => state.properties);
  const toggleCustomerTag = useAppStore((state) => state.toggleCustomerTag);
  const updateCustomer = useAppStore((state) => state.updateCustomer);

  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);

  const customer = useMemo(() => {
    const c = customers.find((c) => c.id === id);
    if (c && notes === '' && !isEditingNotes) {
      setNotes(c.notes || '');
    }
    if (c && discount === 0 && !isEditingDiscount) {
      setDiscount(c.discount);
    }
    return c;
  }, [customers, id]);

  const customerBookings = useMemo(() => {
    if (!customer) return [];
    return getBookingsByCustomer(customer.id).sort(
      (a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
    );
  }, [customer, getBookingsByCustomer]);

  const customerReviews = useMemo(() => {
    if (!customer) return [];
    return reviews
      .filter((r) => r.customerId === customer.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [customer, reviews]);

  const stats = useMemo(() => {
    if (!customer) return null;

    const lastBooking = customerBookings[0];
    const lastStayDate = lastBooking?.checkOut || lastBooking?.checkIn || null;

    return {
      totalBookings: customer.totalBookings,
      totalSpent: customer.totalSpent,
      avgRating: customer.avgRating,
      lastStayDate,
    };
  }, [customer, customerBookings]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString('zh-CN')}`;
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || '未知房源';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-amber-500 fill-amber-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleToggleTag = (tag: CustomerTag) => {
    if (!customer) return;
    toggleCustomerTag(customer.id, tag);
  };

  const handleSaveNotes = () => {
    if (!customer) return;
    updateCustomer(customer.id, { notes });
    setIsEditingNotes(false);
  };

  const handleSaveDiscount = () => {
    if (!customer) return;
    const validDiscount = Math.max(0, Math.min(1, discount));
    updateCustomer(customer.id, { discount: validDiscount });
    setIsEditingDiscount(false);
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">客户不存在</h3>
          <p className="text-gray-500 mb-4">未找到指定的客户信息</p>
          <button
            onClick={() => navigate('/customers')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回客户列表
          </button>
        </div>
      </div>
    );
  }

  const isBlacklisted = customer.tags.includes('blacklist');
  const isVip = customer.tags.includes('vip');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${
        isBlacklisted
          ? 'bg-red-500'
          : isVip
          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
          : 'bg-gradient-to-r from-emerald-700 to-emerald-800'
      } text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/customers')}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回客户列表
          </button>

          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
              isVip
                ? 'bg-white/20'
                : isBlacklisted
                ? 'bg-white/20'
                : 'bg-white/20'
            }`}>
              {isVip ? <Crown className="w-10 h-10" /> : customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{customer.name}</h1>
                {isVip && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                    <Crown className="w-4 h-4" />
                    VIP客户
                  </span>
                )}
                {isBlacklisted && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    黑名单
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-white/90">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">总入住次数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">总消费金额</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSpent)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">平均评分</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
                    <div className="flex">
                      {renderStars(Math.round(stats.avgRating))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">最近入住</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.lastStayDate ? formatDate(stats.lastStayDate) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className={`bg-white rounded-xl shadow-sm border p-6 ${
              isBlacklisted
                ? 'border-red-200'
                : isVip
                ? 'border-amber-200'
                : 'border-gray-100'
            }`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                客户标签
              </h2>
              <div className="space-y-3">
                {(['vip', 'returning', 'blacklist'] as CustomerTag[]).map((tag) => {
                  const isActive = customer.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`w-full inline-flex items-center justify-between gap-2 px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isActive
                          ? `${tagActiveStyles[tag]} shadow-sm`
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {tagIcons[tag]}
                        <span className="font-medium">{CUSTOMER_TAG_LABELS[tag]}</span>
                      </span>
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isActive
                          ? 'border-white bg-white/30'
                          : 'border-gray-300'
                      }`}>
                        {isActive && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              {customer.totalBookings > 1 && !customer.tags.includes('returning') && (
                <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <RefreshCw className="w-4 h-4 inline mr-1" />
                  提示：该客户已入住 {customer.totalBookings} 次，可标记为回头客
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-500" />
                优惠折扣
              </h2>
              <div className="space-y-4">
                {isEditingDiscount ? (
                  <div className="space-y-3">
                    <div className="flex items-end gap-2">
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        placeholder="0.00 - 1.00"
                      />
                      <span className="text-gray-500 pb-2">折</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveDiscount}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setDiscount(customer.discount);
                          setIsEditingDiscount(false);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors"
                    onClick={() => setIsEditingDiscount(true)}
                  >
                    <div>
                      <p className="text-sm text-gray-500">当前折扣率</p>
                      <p className="text-2xl font-bold text-amber-700">
                        {discount > 0 ? `${(discount * 100).toFixed(0)}% 折扣` : '无折扣'}
                      </p>
                    </div>
                    <Edit2 className="w-5 h-5 text-amber-600" />
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  折扣范围：0 - 1，例如 0.1 表示 10% 折扣
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  客户备注
                </h2>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-amber-600 hover:text-amber-700 text-sm flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    编辑
                  </button>
                )}
              </div>
              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                    placeholder="添加客户备注信息..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveNotes}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setNotes(customer.notes || '');
                        setIsEditingNotes(false);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 min-h-[100px]">
                  {notes ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
                  ) : (
                    <p className="text-gray-400 text-center py-4">暂无备注信息</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  入住历史
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-sm text-gray-600">
                    {customerBookings.length} 条记录
                  </span>
                </h2>
              </div>

              {customerBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">暂无入住记录</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {customerBookings.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {getPropertyName(booking.propertyId)}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              bookingStatusStyles[booking.status]
                            }`}>
                              {BOOKING_STATUS_LABELS[booking.status]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            预订平台：{PLATFORM_LABELS[booking.platform]}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{formatPrice(booking.totalAmount)}</p>
                          <p className="text-sm text-gray-500">{booking.nights} 晚</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <span>入住：{formatDate(booking.checkIn)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span>退房：{formatDate(booking.checkOut)}</span>
                        </div>
                        {booking.platform !== 'direct' && booking.commission > 0 && (
                          <div className="text-gray-400">
                            平台佣金：{formatPrice(booking.commission)}
                          </div>
                        )}
                      </div>

                      {booking.notes && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <span className="font-medium">备注：</span>
                            {booking.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  评价记录
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-sm text-gray-600">
                    {customerReviews.length} 条评价
                  </span>
                </h2>
              </div>

              {customerReviews.length === 0 ? (
                <div className="p-8 text-center">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">暂无评价记录</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {customerReviews.map((review) => (
                    <div key={review.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3">
                            {renderStars(review.rating)}
                            <span className="font-semibold text-gray-900">
                              {getPropertyName(review.propertyId)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDateTime(review.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-gray-700">{review.comment}</p>
                      </div>

                      {review.reply && (
                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                          <p className="text-sm text-emerald-600 font-medium mb-1">商家回复</p>
                          <p className="text-emerald-800">{review.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
