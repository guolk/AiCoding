import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Home, CalendarDays, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Booking, BookingStatus, BOOKING_STATUS_LABELS, PLATFORM_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import BookingForm from '@/components/booking/BookingForm';

const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

type DateStatus = 'available' | 'booked' | 'checked-in' | 'conflict' | 'past';

interface CellData {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: DateStatus;
  bookings: Booking[];
}

const statusStyles: Record<DateStatus, string> = {
  available: 'bg-white hover:bg-emerald-50 border-gray-100',
  booked: 'bg-amber-50 border-amber-200',
  'checked-in': 'bg-emerald-100 border-emerald-300',
  conflict: 'bg-red-100 border-red-300',
  past: 'bg-gray-50 border-gray-100 text-gray-400',
};

const statusLabels: Record<DateStatus, string> = {
  available: '可订',
  booked: '已预订',
  'checked-in': '入住中',
  conflict: '冲突',
  past: '已过',
};

const bookingStatusBadgeStyles: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  'checked-in': 'bg-green-100 text-green-800',
  'checked-out': 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function BookingCalendar() {
  const { properties, bookings } = useAppStore();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredBooking, setHoveredBooking] = useState<Booking | null>(null);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const propertyBookings = useMemo(() => {
    return bookings.filter(
      (b) => b.propertyId === selectedPropertyId && b.status !== 'cancelled'
    );
  }, [bookings, selectedPropertyId]);

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const totalDaysInMonth = lastDay.getDate();

  const calendarCells: CellData[] = [];

  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
    calendarCells.push({
      date,
      dateStr: date.toISOString().split('T')[0],
      isCurrentMonth: false,
      isToday: false,
      status: 'past',
      bookings: [],
    });
  }

  const todayStr = today.toISOString().split('T')[0];

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = dateStr === todayStr;

    const dateBookings = propertyBookings.filter((b) => {
      return dateStr >= b.checkIn && dateStr < b.checkOut;
    });

    let status: DateStatus = 'available';
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      status = 'past';
    } else if (dateBookings.length > 0) {
      const hasCheckedIn = dateBookings.some((b) => b.status === 'checked-in');
      status = hasCheckedIn ? 'checked-in' : 'booked';
    }

    calendarCells.push({
      date,
      dateStr,
      isCurrentMonth: true,
      isToday,
      status,
      bookings: dateBookings,
    });
  }

  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(currentYear, currentMonth + 1, i);
    calendarCells.push({
      date,
      dateStr: date.toISOString().split('T')[0],
      isCurrentMonth: false,
      isToday: false,
      status: 'available',
      bookings: [],
    });
  }

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleDateClick = (cell: CellData) => {
    if (!cell.isCurrentMonth || cell.status === 'past') return;
    setSelectedDate(cell.dateStr);
    setShowForm(true);
  };

  const stats = useMemo(() => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    let bookedNights = 0;
    let checkedInNights = 0;
    let totalRevenue = 0;

    propertyBookings.forEach((booking) => {
      if (booking.status === 'cancelled') return;

      const checkIn = new Date(Math.max(new Date(booking.checkIn).getTime(), monthStart.getTime()));
      const checkOut = new Date(Math.min(new Date(booking.checkOut).getTime(), monthEnd.getTime() + 24 * 60 * 60 * 1000));

      if (checkIn >= checkOut) return;

      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      if (booking.status === 'checked-in') {
        checkedInNights += nights;
      } else if (booking.status !== 'checked-out') {
        bookedNights += nights;
      }

      totalRevenue += booking.totalAmount;
    });

    const totalNightsInMonth = totalDaysInMonth;
    const occupancyRate = totalNightsInMonth > 0
      ? ((bookedNights + checkedInNights) / totalNightsInMonth) * 100
      : 0;

    return {
      bookedNights,
      checkedInNights,
      occupancyRate: Math.min(occupancyRate, 100),
      totalRevenue,
    };
  }, [propertyBookings, currentYear, currentMonth, totalDaysInMonth]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">预订日历</h1>
              <p className="mt-1 text-sm text-gray-500">
                管理房源预订状态，查看可用日期
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDate(null);
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600" />
                房源列表
              </h3>
              <div className="space-y-2">
                {properties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => setSelectedPropertyId(property.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedPropertyId === property.id
                        ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">
                      {property.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ¥{property.basePrice}/晚 · {property.layout.bedrooms}室
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selectedProperty && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-amber-500" />
                  {monthNames[currentMonth]}统计
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">已预订</span>
                    <span className="font-semibold text-amber-600">{stats.bookedNights} 晚</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">入住中</span>
                    <span className="font-semibold text-emerald-600">{stats.checkedInNights} 晚</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">入住率</span>
                    <span className="font-semibold text-blue-600">
                      {stats.occupancyRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">预估收入</span>
                    <span className="text-lg font-bold text-emerald-700">
                      {formatCurrency(stats.totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">图例说明</h3>
              <div className="space-y-2">
                {(['available', 'booked', 'checked-in', 'past'] as DateStatus[]).map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border ${statusStyles[status]}`} />
                    <span className="text-sm text-gray-600">{statusLabels[status]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="text-lg font-bold text-gray-900">
                    {currentYear}年 {monthNames[currentMonth]}
                  </h2>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  今天
                </button>
              </div>

              <div className="grid grid-cols-7">
                {weekdayNames.map((day, index) => (
                  <div
                    key={day}
                    className={`p-3 text-center text-sm font-semibold ${
                      index === 0 || index === 6 ? 'text-red-500' : 'text-gray-600'
                    } bg-gray-50`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarCells.map((cell, index) => (
                  <div
                    key={index}
                    onClick={() => handleDateClick(cell)}
                    className={`relative min-h-[100px] p-2 border-t border-r cursor-pointer transition-all ${
                      index % 7 === 6 ? 'border-r-0' : ''
                    } ${
                      !cell.isCurrentMonth ? 'opacity-40' : ''
                    } ${statusStyles[cell.status]}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        cell.isToday
                          ? 'bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center'
                          : cell.date.getDay() === 0 || cell.date.getDay() === 6
                          ? 'text-red-500'
                          : 'text-gray-900'
                      }`}>
                        {cell.date.getDate()}
                      </span>
                      {cell.status !== 'available' && cell.status !== 'past' && (
                        <span className="text-xs text-gray-500">
                          {statusLabels[cell.status]}
                        </span>
                      )}
                    </div>

                    {cell.bookings.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {cell.bookings.slice(0, 2).map((booking) => (
                          <div
                            key={booking.id}
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              setHoveredBooking(booking);
                            }}
                            onMouseLeave={() => setHoveredBooking(null)}
                            className={`text-xs px-2 py-1 rounded truncate ${
                              bookingStatusBadgeStyles[booking.status]
                            }`}
                          >
                            {booking.customerName}
                          </div>
                        ))}
                        {cell.bookings.length > 2 && (
                          <div className="text-xs text-gray-500 px-2">
                            +{cell.bookings.length - 2} 更多
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {hoveredBooking && (
              <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {hoveredBooking.customerName}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        bookingStatusBadgeStyles[hoveredBooking.status]
                      }`}>
                        {BOOKING_STATUS_LABELS[hoveredBooking.status]}
                      </span>
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {hoveredBooking.checkIn} → {hoveredBooking.checkOut}
                      <span className="ml-2">({hoveredBooking.nights}晚)</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {PLATFORM_LABELS[hoveredBooking.platform]} · {formatCurrency(hoveredBooking.totalAmount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hoveredBooking.status === 'pending' && (
                      <CheckCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    {hoveredBooking.status === 'confirmed' && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                    {hoveredBooking.status === 'checked-in' && (
                      <Clock className="w-5 h-5 text-emerald-500" />
                    )}
                    {hoveredBooking.status === 'checked-out' && (
                      <CheckCircle className="w-5 h-5 text-gray-400" />
                    )}
                    {hoveredBooking.status === 'cancelled' && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                {hoveredBooking.notes && (
                  <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg">
                    {hoveredBooking.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedDate(null);
        }}
        initialData={selectedDate ? {
          propertyId: selectedPropertyId,
          checkIn: selectedDate,
        } : { propertyId: selectedPropertyId }}
      />
    </div>
  );
}
