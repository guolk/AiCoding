import { useParams, useNavigate } from 'react-router-dom';
import {
  Wallet,
  CreditCard,
  Hammer,
  LayoutGrid,
  Plus,
  FileText,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RingChart } from '@/components/charts/RingChart';
import { PieChart } from '@/components/charts/PieChart';
import { useProjectStore } from '@/store/useProjectStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useConstructionStore } from '@/store/useConstructionStore';
import { useSpaceStore } from '@/store/useSpaceStore';
import { formatCurrency } from '@/utils/numberUtils';
import { formatRelativeTime } from '@/utils/dateUtils';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  delay: number;
}

function StatCard({ title, value, change, icon, iconBg, iconColor, delay }: StatCardProps) {
  return (
    <Card
      className="hover:shadow-md transition-all duration-300"
      style={{ animation: `fadeInUp 0.5s ease-out ${delay}s both` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {Math.abs(change)}%
                </span>
                <span className="text-sm text-gray-400 ml-1">较上月</span>
              </div>
            )}
          </div>
          <div className={`${iconBg} p-3 rounded-xl`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TimelineItem {
  id: string;
  type: 'expense' | 'task' | 'issue' | 'design';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export default function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById } = useProjectStore();
  const { budgetCategories, getTotalBudgetByProjectId, getTotalSpentByProjectId } = useBudgetStore();
  const { getTaskProgressByProjectId } = useConstructionStore();
  const { functionAreas, getRoomsByProjectId } = useSpaceStore();

  const currentProject = id ? getProjectById(id) : undefined;
  const projectId = id || '';
  const projectRooms = getRoomsByProjectId(projectId);
  const projectFunctionAreas = functionAreas.filter(fa =>
    projectRooms.some(room => room.id === fa.roomId)
  );

  const totalBudget = getTotalBudgetByProjectId(projectId);
  const totalSpent = getTotalSpentByProjectId(projectId);
  const constructionProgress = getTaskProgressByProjectId(projectId);
  const budgetUsagePercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const avgEfficiencyScore =
    projectFunctionAreas.length > 0
      ? Math.round(
          projectFunctionAreas.reduce((sum, fa) => sum + (fa.efficiencyScore || 75), 0) / projectFunctionAreas.length
        )
      : 78;

  const pieChartData = budgetCategories
    .filter((bc) => bc.projectId === projectId)
    .map((bc) => ({
      name: bc.name,
      value: bc.spentAmount,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][
        budgetCategories.findIndex((b) => b.id === bc.id) % 5
      ],
    }));

  if (!id) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">缺少项目ID</h2>
            <p className="text-gray-500">请从项目列表中选择一个项目</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!currentProject) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">项目不存在</h2>
            <p className="text-gray-500">未找到ID为 {id} 的项目</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const timelineActivities: TimelineItem[] = [
    {
      id: '1',
      type: 'expense',
      title: '梵几家具定金支付',
      description: '支付金额 ¥54,000',
      date: '2026-05-20',
      status: 'completed',
    },
    {
      id: '2',
      type: 'task',
      title: '瓦工铺贴施工',
      description: '墙地砖铺贴、勾缝美缝处理',
      date: '2026-05-03',
      status: 'in_progress',
    },
    {
      id: '3',
      type: 'issue',
      title: '客厅地砖色差问题',
      description: '8片瓷砖颜色不一致，待处理',
      date: '2026-05-12',
      status: 'pending',
    },
    {
      id: '4',
      type: 'design',
      title: '设计方案V2.0评审',
      description: '轻奢宋韵方案待审批',
      date: '2026-03-10',
      status: 'completed',
    },
    {
      id: '5',
      type: 'task',
      title: '水电改造工程',
      description: '全屋强电弱电改造，智能布线',
      date: '2026-04-15',
      status: 'completed',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'expense':
        return <CreditCard className="w-5 h-5" />;
      case 'task':
        return <Hammer className="w-5 h-5" />;
      case 'issue':
        return <AlertCircle className="w-5 h-5" />;
      case 'design':
        return <FileText className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getActivityIconBg = (type: string) => {
    switch (type) {
      case 'expense':
        return 'bg-blue-100 text-blue-600';
      case 'task':
        return 'bg-orange-100 text-orange-600';
      case 'issue':
        return 'bg-red-100 text-red-600';
      case 'design':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6 p-6">
        <div
          className="flex items-center justify-between"
          style={{ animation: 'fadeInDown 0.5s ease-out both' }}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">项目总览</h1>
            <p className="text-gray-500 mt-1">
              {currentProject?.name || '民宿改造项目'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              导出报告
            </Button>
            <Button onClick={() => navigate(`/projects/${id}/construction?newTask=true`)}>
              <Plus className="w-4 h-4 mr-2" />
              新建任务
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总预算"
            value={formatCurrency(totalBudget)}
            change={5.2}
            icon={<Wallet className="w-6 h-6" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            delay={0.1}
          />
          <StatCard
            title="已支出"
            value={formatCurrency(totalSpent)}
            change={12.8}
            icon={<CreditCard className="w-6 h-6" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            delay={0.2}
          />
          <StatCard
            title="施工进度"
            value={`${constructionProgress}%`}
            change={8.5}
            icon={<Hammer className="w-6 h-6" />}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            delay={0.3}
          />
          <StatCard
            title="空间效率评分"
            value={`${avgEfficiencyScore}分`}
            change={-2.1}
            icon={<LayoutGrid className="w-6 h-6" />}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card
            className="lg:col-span-1"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.5s both' }}
          >
            <CardHeader>
              <CardTitle className="text-lg">整体进度</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-0">
              <RingChart
                percentage={constructionProgress}
                size={220}
                strokeWidth={16}
                color="#F59E0B"
              />
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">水电改造</span>
                  <span className="font-medium">75%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: '75%' }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">瓦工铺贴</span>
                  <span className="font-medium">60%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: '60%' }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">防水工程</span>
                  <span className="font-medium">100%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="lg:col-span-1"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.6s both' }}
          >
            <CardHeader>
              <CardTitle className="text-lg">预算使用分布</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <PieChart
                data={pieChartData}
                width={320}
                height={280}
                innerRadius={55}
                outerRadius={90}
              />
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">预算使用率</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {budgetUsagePercent}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetUsagePercent > 80
                        ? 'bg-red-500'
                        : budgetUsagePercent > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${budgetUsagePercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  剩余预算: {formatCurrency(totalBudget - totalSpent)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="lg:col-span-1"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.7s both' }}
          >
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">最近活动</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600">
                查看全部
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-200" />
                <div className="space-y-5">
                  {timelineActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="relative flex gap-4"
                      style={{
                        animation: `fadeInLeft 0.4s ease-out ${0.8 + index * 0.1}s both`,
                      }}
                    >
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${getActivityIconBg(
                          activity.type
                        )}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {activity.description}
                            </p>
                          </div>
                          {getStatusIcon(activity.status)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(activity.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card style={{ animation: 'fadeInUp 0.5s ease-out 0.9s both' }}>
          <CardHeader>
            <CardTitle className="text-lg">快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: <Plus className="w-6 h-6" />,
                  title: '新增支出',
                  desc: '记录一笔新的支出',
                  color: 'bg-blue-500',
                  hover: 'hover:bg-blue-600',
                },
                {
                  icon: <Hammer className="w-6 h-6" />,
                  title: '施工任务',
                  desc: '管理施工进度',
                  color: 'bg-orange-500',
                  hover: 'hover:bg-orange-600',
                },
                {
                  icon: <Users className="w-6 h-6" />,
                  title: '供应商',
                  desc: '查看合作供应商',
                  color: 'bg-green-500',
                  hover: 'hover:bg-green-600',
                },
                {
                  icon: <AlertCircle className="w-6 h-6" />,
                  title: '问题追踪',
                  desc: '处理施工问题',
                  color: 'bg-red-500',
                  hover: 'hover:bg-red-600',
                },
              ].map((item, index) => (
                <button
                  key={index}
                  className={`group flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-transparent hover:bg-gray-50 transition-all duration-300`}
                >
                  <div
                    className={`${item.color} ${item.hover} text-white p-3 rounded-xl mb-3 transition-transform group-hover:scale-110`}
                  >
                    {item.icon}
                  </div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </PageLayout>
  );
}
