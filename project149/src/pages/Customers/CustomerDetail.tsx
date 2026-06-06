import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  Star, 
  MessageSquare,
  Plus,
  X,
  AlertTriangle,
  ChefHat,
  Heart,
  ThumbsDown,
  UtensilsCrossed,
  Cake,
  Briefcase,
  PartyPopper
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Input';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { customers as mockCustomers } from '../../data/customers';
import { services } from '../../data/services';
import type { Customer, ServiceRecord, SpecialRequest } from '../../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const occasionTypeOptions = [
  { value: '婚礼晚宴', label: '婚礼晚宴', icon: <Heart className="w-4 h-4" /> },
  { value: '商务宴请', label: '商务宴请', icon: <Briefcase className="w-4 h-4" /> },
  { value: '生日派对', label: '生日派对', icon: <Cake className="w-4 h-4" /> },
  { value: '家庭聚餐', label: '家庭聚餐', icon: <Users className="w-4 h-4" /> },
  { value: '朋友聚会', label: '朋友聚会', icon: <PartyPopper className="w-4 h-4" /> },
  { value: '其他', label: '其他', icon: <UtensilsCrossed className="w-4 h-4" /> },
];

const mockSpecialRequests: SpecialRequest[] = [
  {
    id: 'req-001',
    customerId: 'cust-001',
    occasionType: '婚礼晚宴',
    description: '结婚10周年纪念日，希望准备一个惊喜环节，需要浪漫氛围布置。妻子怀孕6个月，所有菜品需要特别注意食品安全，避免生冷食物。',
    eventDate: '2026-07-15T18:00:00Z',
    guestCount: 6,
    preferences: {
      style: '法式浪漫',
      budget: 2000,
      needDecoration: true,
      dietaryNotes: '孕妇专用餐',
    },
    createdAt: '2026-06-01T10:30:00Z',
  },
  {
    id: 'req-002',
    customerId: 'cust-002',
    occasionType: '生日派对',
    description: '健身教练生日，邀请的都是健身爱好者，需要高蛋白低碳水菜品。希望能有一个健身主题的蛋糕（无糖）。',
    eventDate: '2026-06-20T19:00:00Z',
    guestCount: 12,
    preferences: {
      style: '运动风',
      budget: 1500,
      needDecoration: false,
      dietaryNotes: '高蛋白低碳水，无糖',
    },
    createdAt: '2026-06-05T14:20:00Z',
  },
];

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [specialRequests, setSpecialRequests] = useState<SpecialRequest[]>(mockSpecialRequests);
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    occasionType: '',
    description: '',
    eventDate: '',
    guestCount: 2,
  });

  const customer = useMemo(() => {
    return mockCustomers.find(c => c.id === id);
  }, [id]);

  const customerServices = useMemo(() => {
    return services
      .filter(s => s.customerId === id)
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
  }, [id]);

  const customerRequests = useMemo(() => {
    return specialRequests
      .filter(r => r.customerId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [id, specialRequests]);

  const radarData = useMemo(() => {
    if (!customer) return [];
    return [
      { dimension: '辣', value: customer.tastePreferences.spicy, fullMark: 10 },
      { dimension: '咸', value: customer.tastePreferences.salty, fullMark: 10 },
      { dimension: '甜', value: customer.tastePreferences.sweet, fullMark: 10 },
      { dimension: '酸', value: customer.tastePreferences.sour, fullMark: 10 },
      { dimension: '苦', value: customer.tastePreferences.bitter, fullMark: 10 },
    ];
  }, [customer]);

  const stats = useMemo(() => {
    if (customerServices.length === 0) {
      return { totalServices: 0, avgRating: 0, totalSpent: 0 };
    }
    const totalSpent = customerServices.reduce((sum, s) => sum + s.totalPrice, 0);
    const avgRating = customerServices.reduce((sum, s) => sum + s.rating, 0) / customerServices.length;
    return {
      totalServices: customerServices.length,
      avgRating: avgRating.toFixed(1),
      totalSpent,
    };
  }, [customerServices]);

  const handleAddRequest = () => {
    if (!newRequest.occasionType || !newRequest.description || !newRequest.eventDate) {
      return;
    }
    const request: SpecialRequest = {
      id: `req-${Date.now()}`,
      customerId: id || '',
      occasionType: newRequest.occasionType,
      description: newRequest.description,
      eventDate: new Date(newRequest.eventDate).toISOString(),
      guestCount: newRequest.guestCount,
      preferences: {},
      createdAt: new Date().toISOString(),
    };
    setSpecialRequests(prev => [...prev, request]);
    setShowAddRequestModal(false);
    setNewRequest({ occasionType: '', description: '', eventDate: '', guestCount: 2 });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
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

  const getOccasionIcon = (type: string) => {
    const option = occasionTypeOptions.find(o => o.value === type);
    return option?.icon || <UtensilsCrossed className="w-4 h-4" />;
  };

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 mb-4">客户不存在</p>
        <Button onClick={() => navigate('/customers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回客户列表
        </Button>
      </div>
    );
  }

  const basicInfoContent = (
    <div className="space-y-6">
      {customer.notes && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ChefHat className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-primary-600 mb-1">客户备注</div>
                <p className="text-gray-600">{customer.notes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-5">
          <div className="text-3xl font-bold text-primary-700">{stats.totalServices}</div>
          <div className="text-sm text-primary-600 mt-1">累计服务次数</div>
        </div>
        <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl p-5">
          <div className="text-3xl font-bold text-gold-700">{stats.avgRating}</div>
          <div className="text-sm text-gold-600 mt-1">平均评分</div>
        </div>
        <div className="bg-gradient-to-br from-coral-50 to-coral-100 rounded-xl p-5">
          <div className="text-3xl font-bold text-coral-700">¥{stats.totalSpent.toLocaleString()}</div>
          <div className="text-sm text-coral-600 mt-1">累计消费</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-primary-500" />
                饮食禁忌
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.dietaryRestrictions.length === 0 ? (
                <p className="text-gray-500">暂无饮食禁忌</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {customer.dietaryRestrictions.map(item => (
                    <Badge key={item} variant="primary">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-coral-500" />
                过敏史
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.allergies.length === 0 ? (
                <p className="text-gray-500">暂无过敏史</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {customer.allergies.map(item => (
                    <Badge
                      key={item}
                      variant="danger"
                      className="bg-coral-100 text-coral-700 border-coral-300 border-2"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ThumbsDown className="w-5 h-5 text-gray-500" />
                不喜欢的食材
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.dislikedIngredients.length === 0 ? (
                <p className="text-gray-500">暂无不喜欢的食材</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {customer.dislikedIngredients.map(item => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-coral-500" />
                口味偏好雷达图
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fill: '#2D4A3E', fontSize: 14, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 10]}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={false}
                      tickCount={6}
                    />
                    <Radar
                      name="偏好程度"
                      dataKey="value"
                      stroke="#2D4A3E"
                      fill="#2D4A3E"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => [`${value}/10`, '偏好程度']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-gold-500" />
                喜欢的菜系
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.favoriteCuisines.length === 0 ? (
                <p className="text-gray-500">暂无喜欢的菜系</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {customer.favoriteCuisines.map(item => (
                    <Badge key={item} variant="gold">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const serviceRecordsContent = (
    <div className="space-y-4">
      {customerServices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无服务记录</p>
          </CardContent>
        </Card>
      ) : (
        customerServices.map((service: ServiceRecord) => (
          <Card key={service.id} className="overflow-hidden">
            <CardHeader className="bg-cream/30 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary-700">
                      {format(new Date(service.serviceDate), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {service.guestCount}人
                      </span>
                      <span className="flex items-center gap-1">
                        <ChefHat className="w-3.5 h-3.5" />
                        {service.occasion}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {renderStars(service.rating)}
                  <div className="text-lg font-bold text-gold-600">
                    ¥{service.totalPrice}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-sm font-medium text-primary-600 mb-2">菜单</div>
                <div className="flex flex-wrap gap-2">
                  {service.menu.map((menuItem, index) => (
                    <Badge key={index} variant="secondary">
                      {menuItem.dishName}
                    </Badge>
                  ))}
                </div>
              </div>
              {service.feedback && (
                <div className="bg-cream/50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-primary-600 mb-1">客户评价</div>
                      <p className="text-gray-600 text-sm leading-relaxed">{service.feedback}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const specialRequestsContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-lg font-semibold text-primary-700">特殊需求记录</h3>
        <Button onClick={() => setShowAddRequestModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          添加需求
        </Button>
      </div>

      {customerRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <PartyPopper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无特殊需求记录</p>
          </CardContent>
        </Card>
      ) : (
        customerRequests.map((request: SpecialRequest) => (
          <Card key={request.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-gold-600">
                    {getOccasionIcon(request.occasionType)}
                  </div>
                  <div>
                    <div className="font-semibold text-primary-700">
                      {request.occasionType}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(request.eventDate), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {request.guestCount}人
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="gold">
                  创建于 {format(new Date(request.createdAt), 'MM-dd', { locale: zhCN })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">{request.description}</p>
              {Object.keys(request.preferences).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm font-medium text-primary-600 mb-2">详细要求</div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(request.preferences).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-gray-500">
                          {key === 'style' ? '风格' : 
                           key === 'budget' ? '预算' : 
                           key === 'needDecoration' ? '需要布置' : 
                           key === 'dietaryNotes' ? '饮食注意' : key}
                        </span>
                        <span className="ml-2 text-charcoal">
                          {typeof value === 'boolean' ? (value ? '是' : '否') : 
                           key === 'budget' ? `¥${value}` : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}

      <Modal
        open={showAddRequestModal}
        onClose={() => {
          setShowAddRequestModal(false);
          setNewRequest({ occasionType: '', description: '', eventDate: '', guestCount: 2 });
        }}
        title="添加特殊需求"
        description="记录客户在特定场合的特殊要求"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">场合类型</label>
            <div className="grid grid-cols-3 gap-2">
              {occasionTypeOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setNewRequest(prev => ({ ...prev, occasionType: option.value }))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    newRequest.occasionType === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 text-gray-600'
                  }`}
                >
                  {option.icon}
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="活动日期"
              type="datetime-local"
              value={newRequest.eventDate}
              onChange={(e) => setNewRequest(prev => ({ ...prev, eventDate: e.target.value }))}
            />
            <Input
              label="预计人数"
              type="number"
              min="1"
              value={newRequest.guestCount}
              onChange={(e) => setNewRequest(prev => ({ ...prev, guestCount: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">需求描述</label>
            <textarea
              placeholder="请详细描述客户的特殊需求，包括场地布置、菜品偏好、禁忌事项等..."
              value={newRequest.description}
              onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all resize-none"
              rows={4}
            />
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowAddRequestModal(false);
              setNewRequest({ occasionType: '', description: '', eventDate: '', guestCount: 2 });
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleAddRequest}
            disabled={!newRequest.occasionType || !newRequest.description || !newRequest.eventDate}
          >
            保存
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );

  const tabs = [
    { label: '基本信息', content: basicInfoContent },
    { label: '服务记录', content: serviceRecordsContent },
    { label: '特殊需求', content: specialRequestsContent },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/customers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h1 className="font-serif text-2xl font-bold text-primary-700">客户详情</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar src={customer.avatar} name={customer.name} size="xl" />
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="font-serif text-2xl font-bold text-charcoal">
                  {customer.name}
                </h2>
                {customer.allergies.length > 0 && (
                  <Badge variant="danger" className="w-fit">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    注意过敏
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-gray-600">
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-500" />
                  {customer.phone}
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  {customer.email}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  注册于 {format(new Date(customer.createdAt), 'yyyy年MM月', { locale: zhCN })}
                </span>
              </div>
              {customer.dietaryRestrictions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {customer.dietaryRestrictions.map(item => (
                    <Badge key={item} variant="primary" size="sm">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs tabs={tabs} />
    </div>
  );
}
