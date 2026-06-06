import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Clock, ChefHat, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useServiceStore } from '../../store/serviceStore';
import { preparations } from '../../data/preparations';
import { customers } from '../../data/customers';
import { formatDate, getDaysUntil } from '../../utils/date';
import type { PreparationStatus, PreparationPlan } from '../../types';

const statusConfig: Record<PreparationStatus, { label: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gold' }> = {
  pending: { label: '待处理', variant: 'secondary' },
  in_progress: { label: '进行中', variant: 'primary' },
  shopping: { label: '采购中', variant: 'warning' },
  preparing: { label: '备餐中', variant: 'gold' },
  ready: { label: '已就绪', variant: 'success' },
  completed: { label: '已完成', variant: 'success' },
};

interface PreparationWithService extends PreparationPlan {
  customerName: string;
  serviceDate: string;
  guestCount: number;
  dishCount: number;
}

export function PreparationList() {
  const navigate = useNavigate();
  const { services } = useServiceStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const preparationsWithService = useMemo((): PreparationWithService[] => {
    return preparations.map((prep) => {
      const service = services.find((s) => s.id === prep.serviceId);
      if (!service) {
        return {
          ...prep,
          customerName: '未知客户',
          serviceDate: '',
          guestCount: 0,
          dishCount: prep.timeline.length,
        };
      }
      const customer = customers.find((c) => c.id === service.customerId);
      
      return {
        ...prep,
        customerName: customer?.name || '未知客户',
        serviceDate: service.serviceDate,
        guestCount: service.guestCount,
        dishCount: service.menu?.length || prep.timeline.length,
      };
    });
  }, [services]);

  const filteredPreparations = useMemo(() => {
    return preparationsWithService.filter((prep) => {
      const matchesStatus = statusFilter === 'all' || prep.status === statusFilter;
      const matchesSearch = prep.customerName.includes(searchTerm) ||
        prep.id.includes(searchTerm);
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const daysUntil = getDaysUntil(prep.serviceDate);
        if (dateRange === 'today') matchesDate = daysUntil === 0;
        else if (dateRange === 'week') matchesDate = daysUntil >= 0 && daysUntil <= 7;
        else if (dateRange === 'month') matchesDate = daysUntil >= 0 && daysUntil <= 30;
        else if (dateRange === 'past') matchesDate = daysUntil < 0;
      }
      
      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [preparationsWithService, statusFilter, dateRange, searchTerm]);

  const getCountdownLabel = (serviceDate: string) => {
    const days = getDaysUntil(serviceDate);
    if (days < 0) return `${Math.abs(days)}天前`;
    if (days === 0) return '今天';
    if (days === 1) return '明天';
    return `${days}天后`;
  };

  const getCountdownColor = (serviceDate: string) => {
    const days = getDaysUntil(serviceDate);
    if (days < 0) return 'text-gray-500';
    if (days <= 1) return 'text-coral-600';
    if (days <= 3) return 'text-amber-600';
    return 'text-primary-600';
  };

  const renderCard = (prep: PreparationWithService) => {
    const status = statusConfig[prep.status];
    const countdownLabel = getCountdownLabel(prep.serviceDate);
    const countdownColor = getCountdownColor(prep.serviceDate);

    return (
      <Card
        key={prep.id}
        className="cursor-pointer transition-all duration-300 hover:-translate-y-1"
        onClick={() => navigate(`/preparation/${prep.id}`)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-serif text-lg font-semibold text-primary-700 mb-1">
                {prep.customerName}
              </h3>
              <p className="text-sm text-gray-500">备餐计划 #{prep.id}</p>
            </div>
            <Badge variant={status.variant} size="sm">
              {status.label}
            </Badge>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-primary-400" />
              <span>{formatDate(prep.serviceDate, 'yyyy年MM月dd日')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className={clsx('w-4 h-4', countdownColor)} />
              <span className={clsx('font-medium', countdownColor)}>
                {countdownLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-gold-500" />
              <span className="text-sm text-gray-600">
                {prep.dishCount} 道菜
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {prep.guestCount} 人份
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-primary-800 mb-2">
          备餐计划
        </h1>
        <p className="text-gray-600">管理所有服务的备餐流程</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="搜索客户名称或计划编号"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as string)}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'pending', label: '待处理' },
                { value: 'in_progress', label: '进行中' },
                { value: 'shopping', label: '采购中' },
                { value: 'preparing', label: '备餐中' },
                { value: 'ready', label: '已就绪' },
                { value: 'completed', label: '已完成' },
              ]}
              className="w-[140px]"
            />
          </div>

          <Select
            value={dateRange}
            onChange={(v) => setDateRange(v as string)}
            options={[
              { value: 'all', label: '全部日期' },
              { value: 'today', label: '今天' },
              { value: 'week', label: '未来7天' },
              { value: 'month', label: '未来30天' },
              { value: 'past', label: '已过期' },
            ]}
            className="w-[140px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPreparations.map(renderCard)}
      </div>

      {filteredPreparations.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-primary-700 mb-2">
            暂无备餐计划
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' || dateRange !== 'all'
              ? '没有找到匹配的备餐计划，请尝试调整筛选条件'
              : '当前没有备餐计划，新的服务订单将自动创建备餐计划'}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateRange('all');
            }}
          >
            重置筛选
          </Button>
        </div>
      )}
    </div>
  );
}
