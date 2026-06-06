import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ArrowLeft, Calendar, User, Star, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { useServiceStore } from '../../store/serviceStore';
import { useCustomerStore } from '../../store/customerStore';
import { services } from '../../data/services';
import { SelfAssessment } from './SelfAssessment';
import { PreferenceUpdate } from './PreferenceUpdate';
import { RepurchaseTracker } from './RepurchaseTracker';

export function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reviews } = useServiceStore();
  const { customers } = useCustomerStore();

  const service = services.find((s) => s.id === id);
  const customer = customers.find((c) => c.id === service?.customerId);
  const existingReview = reviews.find((r) => r.serviceId === id);

  if (!service) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <p>未找到该服务记录</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/review')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-gold-500 fill-gold-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const tabs = [
    {
      label: '自我评估',
      content: <SelfAssessment serviceId={service.id} customerId={service.customerId} />,
    },
    {
      label: '偏好更新',
      content: <PreferenceUpdate serviceId={service.id} customerId={service.customerId} />,
    },
    {
      label: '复购追踪',
      content: <RepurchaseTracker customerId={service.customerId} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/review')}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-semibold text-primary-700">
            服务复盘详情
          </h1>
          <p className="text-gray-500 mt-1">
            服务编号：{service.id}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <div className="text-lg font-medium text-charcoal">
                  {customer?.name || '未知客户'}
                </div>
                <div className="text-sm text-gray-500">
                  {customer?.phone || ''}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-1">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5 text-primary-500" />
                <span>
                  {format(
                    new Date(service.serviceDate),
                    'yyyy年MM月dd日 HH:mm',
                    { locale: zhCN }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5 text-primary-500" />
                <span>{service.guestCount} 人</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                {renderStars(service.rating)}
                <span className="ml-1">{service.rating}分</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="primary">{service.occasion}</Badge>
              <Badge variant={existingReview ? 'success' : 'warning'}>
                {existingReview ? '已复盘' : '待复盘'}
              </Badge>
              <span className="text-lg font-semibold text-primary-600">
                ¥{service.totalPrice}
              </span>
            </div>
          </div>

          {service.feedback && (
            <div className="mt-4 p-4 bg-cream/50 rounded-lg">
              <div className="text-sm font-medium text-primary-700 mb-1">
                客户反馈：
              </div>
              <p className="text-gray-600">{service.feedback}</p>
            </div>
          )}

          <div className="mt-4">
            <div className="text-sm font-medium text-primary-700 mb-2">
              服务菜单：
            </div>
            <div className="flex flex-wrap gap-2">
              {service.menu.map((dish, index) => (
                <Badge key={index} variant="outline">
                  {dish.dishName}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs tabs={tabs} />
    </div>
  );
}
