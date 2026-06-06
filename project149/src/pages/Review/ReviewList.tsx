import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Search, Calendar, User, Star, ChevronRight, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useServiceStore } from '../../store/serviceStore';
import { useCustomerStore } from '../../store/customerStore';
import { services } from '../../data/services';

interface ServiceWithReviewStatus {
  id: string;
  customerId: string;
  customerName: string;
  serviceDate: string;
  occasion: string;
  guestCount: number;
  totalPrice: number;
  rating: number;
  hasReviewed: boolean;
}

export function ReviewList() {
  const navigate = useNavigate();
  const { reviews } = useServiceStore();
  const { customers } = useCustomerStore();

  const [dateFilter, setDateFilter] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const reviewedServiceIds = useMemo(() => {
    return new Set(reviews.map((r) => r.serviceId));
  }, [reviews]);

  const serviceList: ServiceWithReviewStatus[] = useMemo(() => {
    return services.map((service) => {
      const customer = customers.find((c) => c.id === service.customerId);
      return {
        id: service.id,
        customerId: service.customerId,
        customerName: customer?.name || '未知客户',
        serviceDate: service.serviceDate,
        occasion: service.occasion,
        guestCount: service.guestCount,
        totalPrice: service.totalPrice,
        rating: service.rating,
        hasReviewed: reviewedServiceIds.has(service.id),
      };
    });
  }, [customers, reviewedServiceIds]);

  const filteredServices = useMemo(() => {
    return serviceList.filter((service) => {
      const matchKeyword =
        !searchKeyword ||
        service.customerName.includes(searchKeyword) ||
        service.occasion.includes(searchKeyword);

      const matchDate = !dateFilter || service.serviceDate.startsWith(dateFilter);

      const matchCustomer = !customerFilter || service.customerId === customerFilter;

      const matchRating =
        !ratingFilter || service.rating === parseInt(ratingFilter);

      return matchKeyword && matchDate && matchCustomer && matchRating;
    });
  }, [serviceList, searchKeyword, dateFilter, customerFilter, ratingFilter]);

  const customerOptions = useMemo(() => {
    return [
      { value: '', label: '全部客户' },
      ...customers.map((c) => ({ value: c.id, label: c.name })),
    ];
  }, [customers]);

  const ratingOptions = [
    { value: '', label: '全部评分' },
    { value: '5', label: '5星' },
    { value: '4', label: '4星' },
    { value: '3', label: '3星' },
    { value: '2', label: '2星' },
    { value: '1', label: '1星' },
  ];

  const stats = useMemo(() => {
    const total = serviceList.length;
    const reviewed = serviceList.filter((s) => s.hasReviewed).length;
    const pending = total - reviewed;
    const avgRating =
      total > 0
        ? serviceList.reduce((sum, s) => sum + s.rating, 0) / total
        : 0;
    return { total, reviewed, pending, avgRating };
  }, [serviceList]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-gold-500 fill-gold-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-primary-700">
            服务复盘
          </h1>
          <p className="text-gray-500 mt-1">
            对已完成的服务进行复盘总结，提升服务质量
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">总服务数</div>
            <div className="text-3xl font-bold text-primary-700 mt-1">
              {stats.total}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">已复盘</div>
            <div className="text-3xl font-bold text-green-600 mt-1">
              {stats.reviewed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">待复盘</div>
            <div className="text-3xl font-bold text-amber-600 mt-1">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">平均评分</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-bold text-gold-600">
                {stats.avgRating.toFixed(1)}
              </span>
              {renderStars(Math.round(stats.avgRating))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">筛选条件</CardTitle>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="关键词搜索"
              placeholder="客户名称、场合..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              prefix={<Search className="w-4 h-4" />}
            />
            <Input
              label="服务日期"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              prefix={<Calendar className="w-4 h-4" />}
            />
            <Select
              label="客户筛选"
              value={customerFilter}
              onChange={(val) => setCustomerFilter(val as string)}
              options={customerOptions}
              placeholder="选择客户"
            />
            <Select
              label="评分筛选"
              value={ratingFilter}
              onChange={(val) => setRatingFilter(val as string)}
              options={ratingOptions}
              placeholder="选择评分"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            服务记录列表
            <span className="text-sm font-normal text-gray-500 ml-2">
              共 {filteredServices.length} 条记录
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {filteredServices.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                暂无符合条件的服务记录
              </div>
            ) : (
              filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="p-4 hover:bg-cream/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/review/${service.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-charcoal">
                            {service.customerName}
                          </span>
                          <Badge
                            variant={service.hasReviewed ? 'success' : 'warning'}
                            size="sm"
                          >
                            {service.hasReviewed ? '已复盘' : '待复盘'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {service.occasion} · {service.guestCount || 0}人
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(
                              new Date(service.serviceDate),
                              'yyyy年MM月dd日 HH:mm',
                              { locale: zhCN }
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            {renderStars(service.rating)}
                          </span>
                          <span>¥{service.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/review/${service.id}`);
                        }}
                      >
                        {service.hasReviewed ? '查看复盘' : '开始复盘'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
