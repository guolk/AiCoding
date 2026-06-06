import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, ChefHat, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { useServiceStore } from '../../store/serviceStore';
import { useMenuStore } from '../../store/menuStore';
import { preparations } from '../../data/preparations';
import { customers } from '../../data/customers';
import { formatDate, getDaysUntil } from '../../utils/date';
import { ShoppingList } from './ShoppingList';
import { Timeline } from './Timeline';
import { EquipmentChecklist } from './EquipmentChecklist';
import type { PreparationPlan } from '../../types';

const statusConfig: Record<string, { label: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gold' }> = {
  pending: { label: '待处理', variant: 'secondary' },
  in_progress: { label: '进行中', variant: 'primary' },
  shopping: { label: '采购中', variant: 'warning' },
  preparing: { label: '备餐中', variant: 'gold' },
  ready: { label: '已就绪', variant: 'success' },
  completed: { label: '已完成', variant: 'success' },
};

export function PreparationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { services } = useServiceStore();
  const { menus } = useMenuStore();
  const [preparation, setPreparation] = useState<PreparationPlan | null>(() =>
    preparations.find((p) => p.id === id) || null
  );

  const { service, customer, menu } = useMemo(() => {
    if (!preparation) return { service: null, customer: null, menu: null };
    
    const svc = services.find((s) => s.id === preparation.serviceId) || null;
    const cust = customers.find((c) => c.id === svc?.customerId) || null;
    const mn = menus.find((m) => m.id === preparation.menuId) || null;
    
    return { service: svc, customer: cust, menu: mn };
  }, [preparation, services, menus]);

  if (!preparation) {
    return (
      <div className="text-center py-16">
        <h2 className="font-serif text-xl font-semibold text-primary-700 mb-2">
          备餐计划不存在
        </h2>
        <Button variant="outline" onClick={() => navigate('/preparation')}>
          返回列表
        </Button>
      </div>
    );
  }

  const status = statusConfig[preparation.status];
  const serviceDate = service?.serviceDate || '';
  const daysUntil = getDaysUntil(serviceDate);

  const countdownText = daysUntil < 0
    ? `已过期 ${Math.abs(daysUntil)} 天`
    : daysUntil === 0
    ? '今天服务'
    : daysUntil === 1
    ? '明天服务'
    : `距离服务还有 ${daysUntil} 天`;

  const handleUpdatePreparation = (updates: Partial<PreparationPlan>) => {
    setPreparation((prev) => prev ? { ...prev, ...updates } : null);
  };

  const shoppingProgress = preparation.shoppingList.length > 0
    ? Math.round((preparation.shoppingList.filter((item) => item.purchased).length /
        preparation.shoppingList.length) * 100)
    : 0;

  const equipmentProgress = preparation.equipmentChecklist.length > 0
    ? Math.round((preparation.equipmentChecklist.filter((item) => item.checked).length /
        preparation.equipmentChecklist.length) * 100)
    : 0;

  const tabs = [
    {
      label: (
        <div className="flex items-center gap-2">
          <span>备货清单</span>
          <Badge variant="outline" size="sm">{shoppingProgress}%</Badge>
        </div>
      ),
      content: (
        <ShoppingList
          shoppingList={preparation.shoppingList}
          guestCount={service?.guestCount || 4}
          menu={menu}
          onUpdate={(shoppingList) => handleUpdatePreparation({ shoppingList })}
        />
      ),
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <span>时间安排</span>
          <Badge variant="outline" size="sm">{preparation.timeline.length}项</Badge>
        </div>
      ),
      content: (
        <Timeline
          timeline={preparation.timeline}
          serviceDate={serviceDate}
          serviceTime={serviceDate ? new Date(serviceDate).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '18:00'}
          onUpdate={(timeline) => handleUpdatePreparation({ timeline })}
        />
      ),
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <span>设备检查</span>
          <Badge variant="outline" size="sm">{equipmentProgress}%</Badge>
        </div>
      ),
      content: (
        <EquipmentChecklist
          equipmentChecklist={preparation.equipmentChecklist}
          onUpdate={(equipmentChecklist) => handleUpdatePreparation({ equipmentChecklist })}
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/preparation')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <div className="flex-1">
          <h1 className="font-serif text-2xl font-bold text-primary-800">
            备餐计划详情
          </h1>
          <p className="text-sm text-gray-500">#{preparation.id}</p>
        </div>
        <Badge variant={status.variant} size="md">
          {status.label}
        </Badge>
      </div>

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">客户</p>
                <p className="font-medium text-primary-700">
                  {customer?.name || '未知客户'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">服务日期</p>
                <p className="font-medium text-primary-700">
                  {serviceDate ? formatDate(serviceDate, 'yyyy年MM月dd日') : '未设置'}
                </p>
                {serviceDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(serviceDate).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-coral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-coral-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">倒计时</p>
                <p className={`font-medium ${daysUntil <= 1 && daysUntil >= 0 ? 'text-coral-600' : 'text-primary-700'}`}>
                  {countdownText}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {service?.guestCount || 0} 人份
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">菜品数量</p>
                <p className="font-medium text-primary-700">
                  {preparation.timeline.length} 道菜
                </p>
                {menu?.name && (
                  <p className="text-xs text-gray-400 mt-1 truncate max-w-[180px]">
                    菜单：{menu.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>备餐详情</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs tabs={tabs} />
        </CardContent>
      </Card>
    </div>
  );
}
