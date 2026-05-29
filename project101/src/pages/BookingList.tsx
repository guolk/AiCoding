import { useState, useMemo } from 'react';
import { Plus, Search, Filter, X, CheckCircle, LogOut, XCircle, Eye, Edit2, Calendar, User, DollarSign, Building } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Booking, BookingPlatform, BookingStatus, BOOKING_STATUS_LABELS, PLATFORM_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import BookingForm from '@/components/booking/BookingForm';

type PlatformFilter = 'all' | BookingPlatform;
type StatusFilter = 'all' | BookingStatus;

const statusBadgeStyles: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  'checked-in': 'bg-green-100 text-green-800 border-green-200',
  'checked-out': 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const platformOptions: BookingPlatform[] = ['airbnb', 'tujia', 'meituan', 'ctrip', 'booking', 'direct'];
const statusOptions: BookingStatus[] = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];

export default function BookingList() {
  const { properties, bookings, updateBookingStatus } = useAppStore();

  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || '未知房源';
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (platformFilter !== 'all' && booking.platform !== platformFilter) return false;
      if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
      if (searchQuery && !booking.customerName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.status === 'checked-in' && b.status !== 'checked-in') return -1;
      if (a.status !== 'checked-in' && b.status === 'checked-in') return 1;
      if (a.status === 'confirmed' && b.status !== 'confirmed' && b.status !== 'checked-in') return -1;
      if (a.status !== 'confirmed' && a.status !== 'checked-in' && b.status === 'confirmed') return 1;
      if (a.status === 'pending' && b.status !== 'pending' && b.status !== 'confirmed' && b.status !== 'checked-in') return -1;
      if (a.status !== 'pending' && a.status !== 'confirmed' && a.status !== 'checked-in' && b.status === 'pending') return 1;
      return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
    });
  }, [bookings, platformFilter, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<BookingStatus, number> = {
      pending: 0,
      confirmed: 0,
      'checked-in': 0,
      'checked-out': 0,
      cancelled: 0,
    };
    bookings.forEach((b) => {
      counts[b.status]++;
    });
    return counts;
  }, [bookings]);

  const platformCounts = useMemo(() => {
    const counts: Record<PlatformFilter, number> = {
      all: bookings.length,
      airbnb: 0,
      tujia: 0,
      meituan: 0,
      ctrip: 0,
      booking: 0,
      direct: 0,
    };
    bookings.forEach((b) => {
      counts[b.platform]++;
    });
    return counts;
  }, [bookings]);

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    updateBookingStatus(bookingId, newStatus);
  };

  const openEditForm = (booking: Booking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBooking(null);
  };

  const getStatusActions = (booking: Booking) => {
    const actions: { label: string; status: BookingStatus; icon: typeof CheckCircle; className: string }[] = [];

    switch (booking.status) {
      case 'pending':
        actions.push({
          label: '确认',
          status: 'confirmed',
          icon: CheckCircle,
          className: 'bg-blue-500 hover:bg-blue-600 text-white',
        });
        actions.push({
          label: '取消',
          status: 'cancelled',
          icon: XCircle,
          className: 'bg-red-500 hover:bg-red-600 text-white',
        });
        break;
      case 'confirmed':
        actions.push({
          label: '办理入住',
          status: 'checked-in',
          icon: CheckCircle,
          className: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        });
        actions.push({
          label: '取消',
          status: 'cancelled',
          icon: XCircle,
          className: 'bg-red-500 hover:bg-red-600 text-white',
        });
        break;
      case 'checked-in':
        actions.push({
          label: '办理退房',
          status: 'checked-out',
          icon: LogOut,
          className: 'bg-gray-600 hover:bg-gray-700 text-white',
        });
        break;
      default:
        break;
    }

    return actions;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">预订列表</h1>
              <p className="mt-1 text-sm text-gray-500">
                共 {bookings.length} 个预订，{filteredBookings.length} 个符合筛选条件
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBooking(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              新建预订
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索客人姓名..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  showFilters
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                筛选
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">状态筛选</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      statusFilter === 'all'
                        ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    全部 ({bookings.length})
                  </button>
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        statusFilter === status
                          ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-md'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {BOOKING_STATUS_LABELS[status]} ({statusCounts[status]})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">平台筛选</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPlatformFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      platformFilter === 'all'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    全部平台 ({platformCounts.all})
                  </button>
                  {platformOptions.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setPlatformFilter(platform)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        platformFilter === platform
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {PLATFORM_LABELS[platform]} ({platformCounts[platform] || 0})
                    </button>
                  ))}
                </div>
              </div>

              {(platformFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500">已应用筛选:</span>
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                      {BOOKING_STATUS_LABELS[statusFilter]}
                      <button onClick={() => setStatusFilter('all')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {platformFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                      {PLATFORM_LABELS[platformFilter]}
                      <button onClick={() => setPlatformFilter('all')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery('')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setPlatformFilter('all');
                      setSearchQuery('');
                    }}
                    className="ml-auto text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    清除所有筛选
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无预订</h3>
            <p className="text-gray-500 mb-4">
              {bookings.length === 0 ? '还没有任何预订记录' : '没有符合筛选条件的预订'}
            </p>
            <button
              onClick={() => {
                setEditingBooking(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              创建第一个预订
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      房源
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      客人
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      日期
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      平台
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      金额
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm line-clamp-1">
                              {getPropertyName(booking.propertyId)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.nights}晚
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {booking.customerName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.customerPhone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-900">
                              {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.checkIn}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {PLATFORM_LABELS[booking.platform]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(booking.totalAmount)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeStyles[booking.status]}`}>
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {getStatusActions(booking).map((action) => (
                            <button
                              key={action.status}
                              onClick={() => handleStatusChange(booking.id, action.status)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${action.className}`}
                            >
                              <action.icon className="w-3 h-3" />
                              {action.label}
                            </button>
                          ))}
                          <button
                            onClick={() => setViewingBooking(booking)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditForm(booking)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <BookingForm
        isOpen={showForm}
        onClose={closeForm}
        initialData={editingBooking || undefined}
        onSuccess={closeForm}
      />

      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewingBooking(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">预订详情</h2>
              <button
                onClick={() => setViewingBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getPropertyName(viewingBooking.propertyId)}
                </h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusBadgeStyles[viewingBooking.status]}`}>
                  {BOOKING_STATUS_LABELS[viewingBooking.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">入住日期</p>
                  <p className="font-medium text-gray-900">{viewingBooking.checkIn}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">退房日期</p>
                  <p className="font-medium text-gray-900">{viewingBooking.checkOut}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-xs text-amber-600 mb-1">晚数</p>
                  <p className="font-medium text-amber-700">{viewingBooking.nights} 晚</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-600 mb-1">总金额</p>
                  <p className="font-bold text-emerald-700 text-lg">
                    {formatCurrency(viewingBooking.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">客人信息</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">姓名</span>
                    <span className="font-medium text-gray-900">{viewingBooking.customerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">电话</span>
                    <span className="font-medium text-gray-900">{viewingBooking.customerPhone}</span>
                  </div>
                  {viewingBooking.customerIdNo && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">身份证号</span>
                      <span className="font-medium text-gray-900">{viewingBooking.customerIdNo}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">预订信息</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">平台</span>
                    <span className="font-medium text-gray-900">
                      {PLATFORM_LABELS[viewingBooking.platform]}
                    </span>
                  </div>
                  {viewingBooking.platformCommissionRate > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">平台佣金</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(viewingBooking.commission)}
                        <span className="text-xs text-gray-400 ml-1">
                          ({(viewingBooking.platformCommissionRate * 100).toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {viewingBooking.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">备注</h4>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-700">{viewingBooking.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setViewingBooking(null);
                    openEditForm(viewingBooking);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑预订
                </button>
                {viewingBooking.status !== 'checked-out' && viewingBooking.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      if (confirm('确定要取消这个预订吗？')) {
                        handleStatusChange(viewingBooking.id, 'cancelled');
                        setViewingBooking(null);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    取消
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
