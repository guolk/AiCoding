import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { CustomerTag, CUSTOMER_TAG_LABELS, PLATFORM_LABELS } from '@/types';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit2,
  Phone,
  Star,
  DollarSign,
  Calendar,
  AlertTriangle,
  Crown,
  RefreshCw,
  X
} from 'lucide-react';

type TagFilter = 'all' | CustomerTag;

const tagStyles: Record<CustomerTag, string> = {
  vip: 'bg-amber-100 text-amber-700 border-amber-200',
  returning: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blacklist: 'bg-red-100 text-red-700 border-red-200',
};

const tagIcons: Record<CustomerTag, React.ReactNode> = {
  vip: <Crown className="w-3 h-3" />,
  returning: <RefreshCw className="w-3 h-3" />,
  blacklist: <AlertTriangle className="w-3 h-3" />,
};

export default function CustomerList() {
  const navigate = useNavigate();
  const store = useAppStore();
  const customers = store.customers;
  const getBookingsByCustomer = store.getBookingsByCustomer;

  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<TagFilter>('all');

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesSearch = query === '' ||
        customer.name.toLowerCase().includes(query) ||
        customer.phone.includes(searchQuery.trim());

      const matchesTag = tagFilter === 'all' || customer.tags.includes(tagFilter);

      return matchesSearch && matchesTag;
    });
  }, [customers, searchQuery, tagFilter]);

  const tagCounts = {
    all: customers.length,
    vip: customers.filter((c) => c.tags.includes('vip')).length,
    returning: customers.filter((c) => c.tags.includes('returning')).length,
    blacklist: customers.filter((c) => c.tags.includes('blacklist')).length,
  };

  const getLastStayDate = (customerId: string) => {
    const bookings = getBookingsByCustomer(customerId);
    if (bookings.length === 0) return null;

    const checkedOutBookings = bookings
      .filter((b) => b.status === 'checked-out' || b.status === 'checked-in')
      .sort((a, b) => new Date(b.checkOut).getTime() - new Date(a.checkOut).getTime());

    if (checkedOutBookings.length === 0) {
      const pendingBookings = bookings
        .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
      return pendingBookings[0]?.checkIn || null;
    }

    return checkedOutBookings[0]?.checkOut || null;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString('zh-CN')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
              <p className="mt-1 text-sm text-gray-500">
                共 {customers.length} 位客户
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索客户姓名或电话..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'vip', 'returning', 'blacklist'] as TagFilter[]).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      tagFilter === tag
                        ? tag === 'all'
                          ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-md'
                          : tag === 'vip'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                          : tag === 'returning'
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md'
                          : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {tag === 'all' ? '全部' : CUSTOMER_TAG_LABELS[tag]}
                    <span className={`ml-1.5 ${
                      tagFilter === tag ? 'text-white/80' : 'text-gray-400'
                    }`}>
                      ({tagCounts[tag]})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无客户</h3>
            <p className="text-gray-500">
              {searchQuery
                ? '没有找到匹配的客户，请尝试其他搜索词'
                : tagFilter === 'all'
                ? '还没有添加任何客户'
                : `没有${CUSTOMER_TAG_LABELS[tagFilter as CustomerTag]}客户`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => {
              const isBlacklisted = customer.tags.includes('blacklist');
              const isVip = customer.tags.includes('vip');
              const lastStayDate = getLastStayDate(customer.id);

              return (
                <div
                  key={customer.id}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group ${
                    isBlacklisted
                      ? 'border-red-200 ring-1 ring-red-100'
                      : isVip
                      ? 'border-amber-200 ring-1 ring-amber-50'
                      : 'border-gray-100 hover:border-emerald-100'
                  }`}
                >
                  {isBlacklisted && (
                    <div className="bg-red-50 px-4 py-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700">黑名单客户</span>
                    </div>
                  )}

                  <div className={`p-5 ${isBlacklisted ? 'pt-3' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          isVip
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                            : isBlacklisted
                            ? 'bg-red-100 text-red-600'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isVip ? <Crown className="w-6 h-6" /> : customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {customer.name}
                            </h3>
                            {isVip && (
                              <Crown className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {customer.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {customer.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${tagStyles[tag]}`}
                          >
                            {tagIcons[tag]}
                            {CUSTOMER_TAG_LABELS[tag]}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>入住次数</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {customer.totalBookings}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                          <DollarSign className="w-3 h-3" />
                          <span>累计消费</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatPrice(customer.totalSpent)}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                          <Star className="w-3 h-3" />
                          <span>平均评分</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-lg font-semibold text-gray-900">
                            {customer.avgRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>最近入住</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(lastStayDate)}
                        </div>
                      </div>
                    </div>

                    {customer.notes && (
                      <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-sm text-amber-800 line-clamp-2">
                          {customer.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/customers/${customer.id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        查看详情
                      </button>
                      <button
                        onClick={() => navigate(`/customers/${customer.id}/edit`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        编辑
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
