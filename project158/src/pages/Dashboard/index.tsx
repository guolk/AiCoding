import { useEffect, useMemo, useState } from 'react';
import {
  Card, Row, Col, List, Tag, Button, Avatar, Badge,
  Empty, Progress, Space, Modal, message
} from 'antd';
import {
  Plane, Receipt, FileBarChart, TrendingUp, Calendar,
  Clock, AlertCircle, Plus, CreditCard, Route,
  FileText, Users, ArrowRight, CheckCircle, XCircle
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useItineraryStore } from '@/store/useItineraryStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useReimbursementStore } from '@/store/useReimbursementStore';
import type { Itinerary } from '@/types/itinerary';
import type { Expense } from '@/types/expense';

export default function Dashboard() {
  const navigate = useNavigate();
  const itineraries = useItineraryStore(state => state.itineraries);
  const fetchItineraries = useItineraryStore(state => state.fetchItineraries);
  const expenses = useExpenseStore(state => state.expenses);
  const fetchExpenses = useExpenseStore(state => state.fetchExpenses);
  const reimbursements = useReimbursementStore(state => state.reimbursements);
  const fetchReimbursements = useReimbursementStore(state => state.fetchReimbursements);
  const [quickActionModal, setQuickActionModal] = useState<string | null>(null);

  useEffect(() => {
    fetchItineraries();
    fetchExpenses();
    fetchReimbursements();
  }, [fetchItineraries, fetchExpenses, fetchReimbursements]);

  const stats = useMemo(() => {
    const thisMonth = dayjs().month();
    const thisYear = dayjs().year();

    const monthTrips = itineraries.filter(i => {
      const start = dayjs(i.startDate);
      return start.month() === thisMonth && start.year() === thisYear;
    }).length;

    const pendingExpenses = expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingApprovals = reimbursements.filter(r =>
      r.status === 'submitted' || r.status === 'reviewing'
    ).length;

    const totalBudget = 200000;
    const usedBudget = expenses
      .filter(e => dayjs(e.expenseDate).year() === thisYear)
      .reduce((sum, e) => sum + e.amount, 0);
    const savingRate = totalBudget > 0 ? (((totalBudget - usedBudget) / totalBudget) * 100).toFixed(1) : '0';

    return {
      monthTrips,
      pendingExpenses,
      pendingApprovals,
      savingRate,
      usedBudget,
      totalBudget,
      budgetPercent: totalBudget > 0 ? (usedBudget / totalBudget * 100).toFixed(1) : '0',
    };
  }, [itineraries, expenses, reimbursements]);

  const recentTrips = useMemo(() => {
    return itineraries
      .sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf())
      .slice(0, 4);
  }, [itineraries]);

  const todoItems = useMemo(() => {
    const todos: { id: string; title: string; description: string; priority: 'high' | 'medium' | 'low'; type: string }[] = [];

    const pendingExpenseCount = expenses.filter(e => e.status === 'pending').length;
    if (pendingExpenseCount > 0) {
      todos.push({
        id: 'expense-pending',
        title: `${pendingExpenseCount} 笔费用待报销`,
        description: '选择费用创建报销单',
        priority: 'high',
        type: 'expense',
      });
    }

    const reviewingCount = reimbursements.filter(r => r.status === 'reviewing').length;
    if (reviewingCount > 0) {
      todos.push({
        id: 'reimbursement-reviewing',
        title: `${reviewingCount} 个报销单待审批`,
        description: '请及时处理报销审批',
        priority: 'high',
        type: 'reimbursement',
      });
    }

    const draftCount = reimbursements.filter(r => r.status === 'draft').length;
    if (draftCount > 0) {
      todos.push({
        id: 'reimbursement-draft',
        title: `${draftCount} 个报销单草稿`,
        description: '继续编辑或提交报销单',
        priority: 'medium',
        type: 'reimbursement',
      });
    }

    const upcomingTrips = itineraries.filter(i =>
      dayjs(i.startDate).isAfter(dayjs()) &&
      dayjs(i.startDate).isBefore(dayjs().add(7, 'day'))
    ).length;
    if (upcomingTrips > 0) {
      todos.push({
        id: 'trip-upcoming',
        title: `${upcomingTrips} 个行程即将开始`,
        description: '请做好出行准备',
        priority: 'medium',
        type: 'trip',
      });
    }

    const incompleteExpenses = expenses.filter(e =>
      (e.images?.length || 0) === 0
    ).length;
    if (incompleteExpenses > 0) {
      todos.push({
        id: 'expense-invoice',
        title: `${incompleteExpenses} 笔费用缺少发票`,
        description: '请尽快补充发票图片',
        priority: 'low',
        type: 'expense',
      });
    }

    return todos.slice(0, 5);
  }, [expenses, reimbursements, itineraries]);

  const monthlyExpenseData = useMemo(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const thisYear = dayjs().year();
    const data = new Array(12).fill(0);

    expenses
      .filter(e => dayjs(e.expenseDate).year() === thisYear)
      .forEach(e => {
        const month = dayjs(e.expenseDate).month();
        data[month] += e.amount;
      });

    return { months, data };
  }, [expenses]);

  const monthlyExpenseOption: Record<string, any> = {
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => `${params[0].axisValue}<br/>费用: ¥${params[0].value.toLocaleString()}`,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: monthlyExpenseData.months,
      axisLabel: { fontSize: 10 },
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: "¥{value}", fontSize: 10 },
      splitLine: { lineStyle: { type: "dashed" } },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: {
            type: "linear",
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: "#667eea" },
              { offset: 1, color: "#764ba2" },
            ],
          },
        },
        itemStyle: {
          color: "#764ba2",
          borderColor: "#fff",
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(102, 126, 234, 0.25)" },
              { offset: 1, color: "rgba(102, 126, 234, 0.05)" },
            ],
          },
        },
        data: monthlyExpenseData.data,
      },
    ],
  };

  const budgetProgressOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' },
              ],
            },
          },
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#f0f0f0']],
          },
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        data: [{ value: Number(stats.budgetPercent) }],
        detail: {
          width: 60,
          height: 60,
          fontSize: 24,
          fontWeight: 'bold',
          color: '#764ba2',
          formatter: '{value}%',
          offsetCenter: [0, 0],
        },
      },
    ],
  };

  const statCards = [
    {
      label: '本月出差次数',
      value: stats.monthTrips,
      unit: '次',
      icon: <Plane size={28} />,
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      action: '/itinerary/list',
    },
    {
      label: '待报销金额',
      value: stats.pendingExpenses.toLocaleString(),
      unit: '元',
      icon: <Receipt size={28} />,
      bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      action: '/expense/list',
    },
    {
      label: '待审批事项',
      value: stats.pendingApprovals,
      unit: '项',
      icon: <FileBarChart size={28} />,
      bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      action: '/reimbursement/list',
    },
    {
      label: '费用节省率',
      value: stats.savingRate,
      unit: '%',
      icon: <TrendingUp size={28} />,
      bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      action: '/analysis/expense',
    },
  ];

  const quickActions = [
    { label: '新增行程', icon: <Plus size={20} />, color: '#667eea', action: 'itinerary-create' },
    { label: '录入费用', icon: <CreditCard size={20} />, color: '#f5576c', action: 'expense-create' },
    { label: '创建报销', icon: <FileText size={20} />, color: '#4facfe', action: 'reimbursement-create' },
    { label: '行程管理', icon: <Route size={20} />, color: '#43e97b', action: 'itinerary-list' },
  ];

  const tripStatusColors: Record<string, string> = {
    planning: 'blue',
    in_progress: 'processing',
    completed: 'success',
    cancelled: 'error',
  };

  const tripStatusText: Record<string, string> = {
    planning: '计划中',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  };

  const priorityColors = {
    high: 'red',
    medium: 'orange',
    low: 'blue',
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'itinerary-create':
        navigate('/itinerary/create');
        break;
      case 'expense-create':
        navigate('/expense/create');
        break;
      case 'reimbursement-create':
        navigate('/reimbursement/create');
        break;
      case 'itinerary-list':
        navigate('/itinerary/list');
        break;
      default:
        break;
    }
    setQuickActionModal(null);
  };

  const handleTodoClick = (todo: any) => {
    switch (todo.type) {
      case 'expense':
        navigate('/expense/list');
        break;
      case 'reimbursement':
        navigate('/reimbursement/list');
        break;
      case 'trip':
        navigate('/itinerary/list');
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold m-0">首页仪表盘</h2>
        <span className="text-gray-500">{dayjs().format('YYYY年MM月DD日 dddd')}</span>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(card.action)}
            >
              <div className="p-4 rounded-lg" style={{ background: card.bg }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-80 text-sm mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-white m-0 flex items-baseline gap-1">
                      {card.value}
                      <span className="text-base font-normal opacity-80">{card.unit}</span>
                    </p>
                  </div>
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <span className="text-white">{card.icon}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={8}>
          <Card title="预算使用进度" extra={<Button type="link" size="small" onClick={() => navigate('/analysis/expense')}>详情</Button>}>
            <div className="flex flex-col items-center">
              <ReactECharts option={budgetProgressOption} style={{ height: '220px', width: '100%' }} />
              <div className="w-full px-4 mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">已使用</span>
                  <span className="font-semibold">¥{stats.usedBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">总预算</span>
                  <span className="font-semibold">¥{stats.totalBudget.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="月度费用趋势" extra={<Button type="link" size="small" onClick={() => navigate('/analysis/expense')}>详情</Button>}>
            <ReactECharts option={monthlyExpenseOption} style={{ height: '280px' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={14}>
          <Card title="近期行程" extra={<Button type="link" size="small" onClick={() => navigate('/itinerary/list')}>全部行程</Button>}>
            {recentTrips.length === 0 ? (
              <Empty description="暂无行程" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={recentTrips}
                renderItem={(trip) => (
                  <List.Item
                    className="cursor-pointer hover:bg-gray-50 rounded-lg px-3 -mx-3 transition-colors"
                    onClick={() => navigate(`/itinerary/detail/${trip.id}`)}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="p-2 rounded-full" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                          <Plane size={20} className="text-white" />
                        </div>
                      }
                      title={
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{trip.destinations.join(' → ')}</span>
                          <Tag color={tripStatusColors[trip.status]}>{tripStatusText[trip.status]}</Tag>
                        </div>
                      }
                      description={
                        <div className="flex items-center gap-4 text-gray-500 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {dayjs(trip.startDate).format('MM-DD')} ~ {dayjs(trip.endDate).format('MM-DD')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {trip.visits.length} 个拜访
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard size={14} />
                            ¥{trip.budget.toLocaleString()}
                          </span>
                        </div>
                      }
                    />
                    <ArrowRight size={16} className="text-gray-400" />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="待办事项" extra={<Badge count={todoItems.length} />}>
            {todoItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-green-500 mb-2 mx-auto" />
                <p className="text-gray-500 mb-0">暂无待办事项</p>
              </div>
            ) : (
              <List
                dataSource={todoItems}
                renderItem={(item) => (
                  <List.Item
                    className="cursor-pointer hover:bg-gray-50 rounded-lg px-3 -mx-3 transition-colors"
                    onClick={() => handleTodoClick(item)}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          className="p-2 rounded-full"
                          style={{
                            background: item.priority === 'high' ? '#fff1f0' : item.priority === 'medium' ? '#fff7e6' : '#e6f7ff',
                          }}
                        >
                          <AlertCircle
                            size={20}
                            style={{
                              color: item.priority === 'high' ? '#ff4d4f' : item.priority === 'medium' ? '#fa8c16' : '#1890ff',
                            }}
                          />
                        </div>
                      }
                      title={
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item.title}</span>
                          <Tag color={priorityColors[item.priority]}>
                            {item.priority === 'high' ? '紧急' : item.priority === 'medium' ? '重要' : '普通'}
                          </Tag>
                        </div>
                      }
                      description={item.description}
                    />
                    <ArrowRight size={16} className="text-gray-400" />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="快捷操作">
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={12} sm={6} key={index}>
              <Card
                hoverable
                className="text-center cursor-pointer"
                onClick={() => handleQuickAction(action.action)}
                styles={{ body: { padding: '24px 16px' } }}
              >
                <div
                  className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ background: `${action.color}15`, color: action.color }}
                >
                  {action.icon}
                </div>
                <p className="font-medium mb-0">{action.label}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
