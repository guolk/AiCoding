import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  TrendingUp,
  Star,
  Plus,
  Utensils,
  ChefHat,
  Clock,
  Bell,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight,
  CalendarDays,
  Flame,
  Droplets,
  Apple,
  Beef,
  Wheat,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useCustomerStore } from '../../store/customerStore';
import { useServiceStore } from '../../store/serviceStore';
import { useMenuStore } from '../../store/menuStore';
import { useDishStore } from '../../store/dishStore';
import { services as serviceData } from '../../data/services';
import { dishes as dishData } from '../../data/dishes';
import type { ServiceRecord } from '../../types';
import { format, differenceInDays, startOfMonth, endOfMonth, isToday, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="w-4 h-4 text-coral-500" />
      <span className="font-mono font-semibold text-primary-700">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: React.ElementType;
  trend?: number;
  color: string;
}

function StatCard({ title, value, unit, icon: Icon, trend, color }: StatCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold text-primary-800 font-serif">
                <AnimatedNumber value={value} />
              </span>
              {unit && <span className="text-sm text-gray-500">{unit}</span>}
            </div>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-coral-500'}`}>
                <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                <span>{trend >= 0 ? '+' : ''}{trend}%</span>
                <span className="text-gray-400">较上月</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { customers } = useCustomerStore();
  const { calculateRepurchaseRate } = useServiceStore();

  const allServices: ServiceRecord[] = serviceData;
  const allDishes = dishData;

  useEffect(() => {
    calculateRepurchaseRate();
  }, [calculateRepurchaseRate]);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const stats = useMemo(() => {
    const thisMonthServices = allServices.filter((s) => {
      const serviceDate = new Date(s.serviceDate);
      return serviceDate >= monthStart && serviceDate <= monthEnd;
    });

    const lastMonthStart = startOfMonth(addDays(monthStart, -1));
    const lastMonthEnd = endOfMonth(lastMonthStart);
    const lastMonthServices = allServices.filter((s) => {
      const serviceDate = new Date(s.serviceDate);
      return serviceDate >= lastMonthStart && serviceDate <= lastMonthEnd;
    });

    const monthlyRevenue = thisMonthServices.reduce((sum, s) => sum + s.totalPrice, 0);
    const lastMonthRevenue = lastMonthServices.reduce((sum, s) => sum + s.totalPrice, 0);
    const revenueTrend = lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

    const avgRating = allServices.length > 0
      ? allServices.reduce((sum, s) => sum + s.rating, 0) / allServices.length
      : 0;

    const serviceTrend = lastMonthServices.length > 0
      ? Math.round(((thisMonthServices.length - lastMonthServices.length) / lastMonthServices.length) * 100)
      : 0;

    const customerCount = customers.length > 0 ? customers.length : 5;
    const customerTrend = 12;

    return {
      customerCount,
      customerTrend,
      serviceCount: thisMonthServices.length,
      serviceTrend,
      monthlyRevenue,
      revenueTrend,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }, [allServices, customers, monthStart, monthEnd]);

  const todayTasks = useMemo(() => [
    { id: 1, time: '10:00', title: '采购食材', type: 'shopping', status: 'pending' },
    { id: 2, time: '14:00', title: '准备张先生家晚宴食材', type: 'prep', status: 'pending' },
    { id: 3, time: '17:30', title: '张先生家晚宴服务', type: 'service', customer: '张先生', status: 'upcoming' },
  ], []);

  const upcomingServices = useMemo(() => {
    return allServices
      .filter((s) => {
        const serviceDate = new Date(s.serviceDate);
        const diff = differenceInDays(serviceDate, now);
        return diff >= 0 && diff <= 7;
      })
      .sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime())
      .slice(0, 5);
  }, [allServices, now]);

  const popularDishesData = useMemo(() => {
    const dishCount = new Map<string, { name: string; count: number; rating: number }>();

    allServices.forEach((service) => {
      service.menu.forEach((menuItem) => {
        const existing = dishCount.get(menuItem.dishId) || {
          name: menuItem.dishName,
          count: 0,
          rating: 0,
        };
        existing.count++;
        const dishRating = service.dishesRating.find((dr) => dr.dishId === menuItem.dishId);
        if (dishRating) {
          existing.rating = (existing.rating * (existing.count - 1) + dishRating.rating) / existing.count;
        }
        dishCount.set(menuItem.dishId, existing);
      });
    });

    return Array.from(dishCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((item, index) => ({
        ...item,
        fill: ['#2D5016', '#4A7C23', '#6B9B3A', '#8FBF5C', '#B5D88A', '#D4E8B8', '#E8F3D6', '#F3F9EA'][index],
      }));
  }, [allServices]);

  const revenueTrendData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = addDays(now, -i);
      const dayServices = allServices.filter((s) => {
        const serviceDate = new Date(s.serviceDate);
        return format(serviceDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      const revenue = dayServices.reduce((sum, s) => sum + s.totalPrice, 0);
      data.push({
        date: format(date, 'MM/dd'),
        revenue,
        services: dayServices.length,
      });
    }
    return data;
  }, [allServices, now]);

  const repurchaseData = useMemo(() => {
    const customerServiceCount = new Map<string, number>();
    allServices.forEach((s) => {
      const cid = s.customerId;
      customerServiceCount.set(cid, (customerServiceCount.get(cid) || 0) + 1);
    });

    const repeatCustomers = Array.from(customerServiceCount.values()).filter((c) => c > 1).length;
    const newCustomers = Array.from(customerServiceCount.values()).filter((c) => c === 1).length;

    return [
      { name: '复购客户', value: repeatCustomers, fill: '#2D5016' },
      { name: '新客户', value: newCustomers, fill: '#8FBF5C' },
    ];
  }, [allServices]);

  const nutritionData = useMemo(() => {
    const allNutrition = allDishes.slice(0, 10).map((d) => d.nutrition);
    const avgNutrition = {
      protein: Math.round(allNutrition.reduce((sum, n) => sum + n.protein, 0) / allNutrition.length),
      carbs: Math.round(allNutrition.reduce((sum, n) => sum + n.carbs, 0) / allNutrition.length),
      fat: Math.round(allNutrition.reduce((sum, n) => sum + n.fat, 0) / allNutrition.length),
      calories: Math.round(allNutrition.reduce((sum, n) => sum + n.calories, 0) / allNutrition.length),
    };

    const proteinScore = Math.min(100, (avgNutrition.protein / 50) * 100);
    const carbsScore = Math.min(100, (avgNutrition.carbs / 60) * 100);
    const fatScore = Math.min(100, (avgNutrition.fat / 30) * 100);
    const overallScore = Math.round((proteinScore + carbsScore + (100 - Math.abs(fatScore - 60))) / 3);

    return {
      avgNutrition,
      proteinScore,
      carbsScore,
      fatScore,
      overallScore,
    };
  }, [allDishes]);

  const recentServices = useMemo(() => {
    return [...allServices]
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
      .slice(0, 5);
  }, [allServices]);

  const nextServiceDate = useMemo(() => {
    const upcoming = allServices
      .filter((s) => new Date(s.serviceDate) > now)
      .sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());
    return upcoming.length > 0 ? new Date(upcoming[0].serviceDate) : addDays(now, 1);
  }, [allServices, now]);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = addDays(now, i);
      const dayServices = allServices.filter((s) => {
        const serviceDate = new Date(s.serviceDate);
        return format(serviceDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      days.push({
        date,
        dayName: format(date, 'EEE', { locale: zhCN }),
        dayNum: format(date, 'd'),
        hasService: dayServices.length > 0,
        serviceCount: dayServices.length,
        isToday: isToday(date),
      });
    }
    return days;
  }, [allServices, now]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-800 font-serif">仪表盘</h1>
          <p className="text-gray-500 mt-1">欢迎回来，今天是 {format(now, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            营业中
          </Badge>
          <CountdownTimer targetDate={nextServiceDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="客户总数"
          value={stats.customerCount}
          unit="位"
          icon={Users}
          trend={stats.customerTrend}
          color="bg-primary-500"
        />
        <StatCard
          title="本月服务次数"
          value={stats.serviceCount}
          unit="次"
          icon={Calendar}
          trend={stats.serviceTrend}
          color="bg-gold-500"
        />
        <StatCard
          title="本月营收"
          value={stats.monthlyRevenue}
          unit="元"
          icon={TrendingUp}
          trend={stats.revenueTrend}
          color="bg-green-500"
        />
        <StatCard
          title="平均客户评分"
          value={Math.floor(stats.avgRating * 10)}
          unit="/10"
          icon={Star}
          color="bg-coral-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                今日任务
              </CardTitle>
              <Badge variant="primary">{todayTasks.length} 项待办</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayTasks.map((task, index) => (
                <div key={task.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'upcoming' ? 'bg-gold-500 animate-pulse' :
                      'bg-gray-300'
                    }`} />
                    {index < todayTasks.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">{task.time}</span>
                        <Badge variant={
                          task.type === 'service' ? 'primary' :
                          task.type === 'shopping' ? 'success' : 'warning'
                        } size="sm">
                          {task.type === 'service' ? '服务' : task.type === 'shopping' ? '采购' : '备餐'}
                        </Badge>
                      </div>
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : task.status === 'upcoming' ? (
                        <AlertCircle className="w-5 h-5 text-gold-500" />
                      ) : null}
                    </div>
                    <p className="font-medium text-primary-800 mt-1">{task.title}</p>
                    {task.customer && (
                      <p className="text-sm text-gray-500">客户：{task.customer}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-6 p-4 bg-gold-50 rounded-xl border border-gold-100">
              <Bell className="w-5 h-5 text-gold-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gold-800">服务提醒</p>
                <p className="text-sm text-gold-600">距离下一场服务开始还有</p>
              </div>
              <CountdownTimer targetDate={nextServiceDate} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-500" />
              快捷操作
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start gap-3"
              onClick={() => navigate('/customers')}
            >
              <Users className="w-5 h-5" />
              新增客户
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start gap-3"
              onClick={() => navigate('/menus')}
            >
              <Utensils className="w-5 h-5" />
              创建菜单
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => navigate('/preparation')}
            >
              <ChefHat className="w-5 h-5" />
              查看备餐计划
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                热门菜品排行
              </CardTitle>
              <Badge variant="gold">本月</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularDishesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {popularDishesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                营收趋势
              </CardTitle>
              <Badge variant="success">最近30天</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: number) => [`¥${value}`, '营收']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2D5016"
                    strokeWidth={3}
                    dot={{ fill: '#2D5016', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#4A7C23' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                最近服务记录
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/review')}
                className="gap-1"
              >
                查看全部 <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">客户</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">日期</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">场合</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">金额</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">评分</th>
                  </tr>
                </thead>
                <tbody>
                  {recentServices.map((service) => (
                    <tr key={service.id} className="border-b border-gray-50 hover:bg-cream/50 transition-colors">
                      <td className="py-3 px-2">
                        <span className="font-medium text-primary-800">
                          {service.customerId === 'cust-001' ? '张先生' :
                           service.customerId === 'cust-002' ? '李女士' :
                           service.customerId === 'cust-003' ? '王女士' :
                           service.customerId === 'cust-004' ? '赵先生' : '陈女士'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {format(new Date(service.serviceDate), 'MM-dd HH:mm')}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary" size="sm">{service.occasion}</Badge>
                      </td>
                      <td className="py-3 px-2 font-medium text-primary-700">¥{service.totalPrice}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
                          <span className="font-medium">{service.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary-500" />
              客户复购率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={repurchaseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {repurchaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-primary-800 font-serif">
                {repurchaseData[0]?.value > 0
                  ? Math.round((repurchaseData[0].value / (repurchaseData[0].value + repurchaseData[1].value)) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500">复购率</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary-500" />
              即将到来的服务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-16 p-3 rounded-xl text-center transition-all ${
                    day.isToday
                      ? 'bg-primary-500 text-white shadow-lg scale-105'
                      : day.hasService
                      ? 'bg-primary-50 border-2 border-primary-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <p className={`text-xs font-medium ${
                    day.isToday ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {day.dayName}
                  </p>
                  <p className={`text-xl font-bold mt-1 ${
                    day.isToday ? 'text-white' : 'text-primary-800'
                  }`}>
                    {day.dayNum}
                  </p>
                  {day.hasService && (
                    <div className="flex justify-center gap-0.5 mt-2">
                      {Array.from({ length: Math.min(day.serviceCount, 3) }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            day.isToday ? 'bg-white' : 'bg-primary-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3 mt-4">
              {upcomingServices.slice(0, 3).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center gap-3 p-3 bg-cream/50 rounded-lg hover:bg-cream transition-colors cursor-pointer"
                  onClick={() => navigate(`/review/${service.id}`)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary-800 truncate">
                      {service.occasion}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(service.serviceDate), 'MM月dd日 HH:mm')}
                    </p>
                  </div>
                  <Badge variant="primary">{service.guestCount}人</Badge>
                </div>
              ))}
              {upcomingServices.length === 0 && (
                <p className="text-center text-gray-400 py-4">暂无即将到来的服务</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" />
              营养均衡度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#f3f4f6"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#2D5016"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${nutritionData.overallScore * 3.52} 352`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary-800 font-serif">
                    {nutritionData.overallScore}
                  </span>
                  <span className="text-xs text-gray-500">综合评分</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Beef className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">蛋白质</span>
                  </div>
                  <span className="text-sm font-medium text-primary-700">
                    {nutritionData.avgNutrition.protein}g
                  </span>
                </div>
                <ProgressBar value={nutritionData.proteinScore} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-gray-600">碳水化合物</span>
                  </div>
                  <span className="text-sm font-medium text-primary-700">
                    {nutritionData.avgNutrition.carbs}g
                  </span>
                </div>
                <ProgressBar value={nutritionData.carbsScore} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">脂肪</span>
                  </div>
                  <span className="text-sm font-medium text-primary-700">
                    {nutritionData.avgNutrition.fat}g
                  </span>
                </div>
                <ProgressBar value={nutritionData.fatScore} className="h-2" />
              </div>

              <div className="flex items-center justify-between p-3 bg-cream/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-600">平均热量</span>
                </div>
                <span className="font-bold text-primary-800">
                  {nutritionData.avgNutrition.calories} kcal
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
