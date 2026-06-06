import { useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Award,
  BarChart3,
  LineChart as LineChartIcon,
  User,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';
import { useServiceStore } from '../../store/serviceStore';
import { useCustomerStore } from '../../store/customerStore';
import { services } from '../../data/services';

interface RepurchaseTrackerProps {
  customerId?: string;
}

interface CustomerRepurchaseData {
  customerId: string;
  customerName: string;
  serviceCount: number;
  totalSpent: number;
  lastServiceDate: string;
  avgSpendPerService: number;
  repurchaseTag: 'new' | 'regular' | 'loyal' | 'vip';
}

export function RepurchaseTracker({ customerId }: RepurchaseTrackerProps) {
  const { customers } = useCustomerStore();
  const { repurchaseStats, calculateRepurchaseRate } = useServiceStore();

  const stats = useMemo(() => {
    const data = repurchaseStats || calculateRepurchaseRate();
    return data;
  }, [repurchaseStats, calculateRepurchaseRate]);

  const filteredServices = useMemo(() => {
    if (customerId) {
      return services.filter((s) => s.customerId === customerId);
    }
    return services;
  }, [customerId]);

  const repurchaseData = useMemo(() => {
    const customerServiceMap = new Map<string, typeof services>();
    filteredServices.forEach((service) => {
      const existing = customerServiceMap.get(service.customerId) || [];
      customerServiceMap.set(service.customerId, [...existing, service]);
    });

    const customerData: CustomerRepurchaseData[] = [];
    const now = new Date();

    customerServiceMap.forEach((customerServices, custId) => {
      const customer = customers.find((c) => c.id === custId);
      if (!customer) return;

      const sortedServices = [...customerServices].sort(
        (a, b) =>
          new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime()
      );

      const serviceCount = sortedServices.length;
      const totalSpent = sortedServices.reduce((sum, s) => sum + s.totalPrice, 0);
      const lastServiceDate = sortedServices[sortedServices.length - 1].serviceDate;
      const avgSpendPerService = totalSpent / serviceCount;

      let repurchaseTag: CustomerRepurchaseData['repurchaseTag'];
      if (serviceCount >= 5) {
        repurchaseTag = 'vip';
      } else if (serviceCount >= 3) {
        repurchaseTag = 'loyal';
      } else if (serviceCount >= 2) {
        repurchaseTag = 'regular';
      } else {
        repurchaseTag = 'new';
      }

      customerData.push({
        customerId: custId,
        customerName: customer.name,
        serviceCount,
        totalSpent,
        lastServiceDate,
        avgSpendPerService,
        repurchaseTag,
      });
    });

    return customerData.sort((a, b) => b.serviceCount - a.serviceCount);
  }, [filteredServices, customers]);

  const overallStats = useMemo(() => {
    const totalCustomers = repurchaseData.length;
    const repeatCustomers = repurchaseData.filter(
      (c) => c.serviceCount > 1
    ).length;
    const overallRepurchaseRate =
      totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthServices = filteredServices.filter((s) => {
      const date = new Date(s.serviceDate);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const thisMonthCustomers = new Set(
      thisMonthServices.map((s) => s.customerId)
    );
    const thisMonthRepeatCustomers = Array.from(thisMonthCustomers).filter(
      (custId) => {
        const customerServices = filteredServices.filter(
          (s) => s.customerId === custId
        );
        return customerServices.length > 1;
      }
    );

    const monthRepurchaseRate =
      thisMonthCustomers.size > 0
        ? (thisMonthRepeatCustomers.length / thisMonthCustomers.size) * 100
        : 0;

    let totalInterval = 0;
    let intervalCount = 0;

    repurchaseData.forEach((customer) => {
      const customerServices = filteredServices
        .filter((s) => s.customerId === customer.customerId)
        .sort(
          (a, b) =>
            new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime()
        );

      for (let i = 1; i < customerServices.length; i++) {
        const interval = differenceInDays(
          new Date(customerServices[i].serviceDate),
          new Date(customerServices[i - 1].serviceDate)
        );
        totalInterval += interval;
        intervalCount++;
      }
    });

    const avgInterval = intervalCount > 0 ? totalInterval / intervalCount : 0;

    return {
      overallRepurchaseRate,
      monthRepurchaseRate,
      avgInterval,
      totalServices: filteredServices.length,
      totalCustomers,
      repeatCustomers,
    };
  }, [repurchaseData, filteredServices]);

  const monthlyTrendData = useMemo(() => {
    const monthlyData = new Map<
      string,
      { total: number; repeat: number; revenue: number }
    >();

    filteredServices.forEach((service) => {
      const monthKey = format(new Date(service.serviceDate), 'yyyy-MM');
      const existing = monthlyData.get(monthKey) || {
        total: 0,
        repeat: 0,
        revenue: 0,
      };
      existing.total++;
      existing.revenue += service.totalPrice;

      const customerServices = filteredServices.filter(
        (s) => s.customerId === service.customerId
      );
      if (customerServices.length > 1) {
        existing.repeat++;
      }

      monthlyData.set(monthKey, existing);
    });

    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: format(new Date(month + '-01'), 'MM月', { locale: zhCN }),
        总服务数: data.total,
        复购服务数: data.repeat,
        复购率: data.total > 0 ? ((data.repeat / data.total) * 100).toFixed(1) : 0,
        营收: data.revenue,
      }));
  }, [filteredServices]);

  const frequencyDistribution = useMemo(() => {
    const distribution = [
      { range: '1次', count: 0, customers: [] as string[] },
      { range: '2-3次', count: 0, customers: [] as string[] },
      { range: '4-5次', count: 0, customers: [] as string[] },
      { range: '6-10次', count: 0, customers: [] as string[] },
      { range: '10次以上', count: 0, customers: [] as string[] },
    ];

    repurchaseData.forEach((customer) => {
      if (customer.serviceCount === 1) {
        distribution[0].count++;
        distribution[0].customers.push(customer.customerName);
      } else if (customer.serviceCount <= 3) {
        distribution[1].count++;
        distribution[1].customers.push(customer.customerName);
      } else if (customer.serviceCount <= 5) {
        distribution[2].count++;
        distribution[2].customers.push(customer.customerName);
      } else if (customer.serviceCount <= 10) {
        distribution[3].count++;
        distribution[3].customers.push(customer.customerName);
      } else {
        distribution[4].count++;
        distribution[4].customers.push(customer.customerName);
      }
    });

    return distribution.map((item) => ({
      消费频次: item.range,
      客户数: item.count,
      客户列表: item.customers.join(', '),
    }));
  }, [repurchaseData]);

  const getRepurchaseTagConfig = (tag: CustomerRepurchaseData['repurchaseTag']) => {
    switch (tag) {
      case 'vip':
        return { variant: 'gold', label: 'VIP客户', icon: <Award className="w-3 h-3" /> };
      case 'loyal':
        return { variant: 'success', label: '忠实客户', icon: <TrendingUp className="w-3 h-3" /> };
      case 'regular':
        return { variant: 'primary', label: '常客', icon: <Users className="w-3 h-3" /> };
      case 'new':
        return { variant: 'secondary', label: '新客户', icon: <User className="w-3 h-3" /> };
      default:
        return { variant: 'outline', label: '未知', icon: null };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">总体复购率</div>
                <div className="text-2xl font-bold text-primary-700">
                  {overallStats.overallRepurchaseRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">本月复购率</div>
                <div className="text-2xl font-bold text-green-600">
                  {overallStats.monthRepurchaseRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">平均消费间隔</div>
                <div className="text-2xl font-bold text-amber-600">
                  {overallStats.avgInterval.toFixed(0)} 天
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-gold-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">复购客户数</div>
                <div className="text-2xl font-bold text-gold-600">
                  {overallStats.repeatCustomers}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-primary-500" />
              复购率趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#6b7280"
                    fontSize={12}
                    label={{
                      value: '服务数',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#6b7280', fontSize: 12 },
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#6b7280"
                    fontSize={12}
                    label={{
                      value: '复购率(%)',
                      angle: 90,
                      position: 'insideRight',
                      style: { fill: '#6b7280', fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="总服务数"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ fill: '#0d9488', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="复购服务数"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="复购率"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              消费频次分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="消费频次"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    label={{
                      value: '客户数',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#6b7280', fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} 人`,
                      name,
                    ]}
                  />
                  <Bar
                    dataKey="客户数"
                    fill="#0d9488"
                    radius={[4, 4, 0, 0]}
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            客户复购排行
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>排名</TableHead>
                <TableHead>客户名称</TableHead>
                <TableHead>服务次数</TableHead>
                <TableHead>累计消费</TableHead>
                <TableHead>平均消费</TableHead>
                <TableHead>上次消费日期</TableHead>
                <TableHead>复购标签</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repurchaseData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                repurchaseData.map((customer, index) => {
                  const tagConfig = getRepurchaseTagConfig(customer.repurchaseTag);
                  return (
                    <TableRow key={customer.customerId}>
                      <TableCell>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? 'bg-gold-100 text-gold-700'
                              : index === 1
                              ? 'bg-gray-100 text-gray-600'
                              : index === 2
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-charcoal">
                        {customer.customerName}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary-600">
                          {customer.serviceCount} 次
                        </span>
                      </TableCell>
                      <TableCell>¥{customer.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>
                        ¥{customer.avgSpendPerService.toFixed(0)}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(customer.lastServiceDate),
                          'yyyy年MM月dd日',
                          { locale: zhCN }
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tagConfig.variant as any}
                          size="sm"
                          className="gap-1"
                        >
                          {tagConfig.icon}
                          {tagConfig.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
