import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Select, Empty, Tag, Table } from 'antd';
import { DollarSign, TrendingDown, TrendingUp, PieChart, BarChart3, Calendar, Car, Hotel, Coffee, Users, MoreHorizontal } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useItineraryStore } from '@/store/useItineraryStore';
import type { Expense, ExpenseCategory } from '@/types/expense';

const { Option } = Select;

const categoryMap: Record<ExpenseCategory, { label: string; icon: React.ReactNode; color: string }> = {
  transport: { label: '交通', icon: <Car size={18} />, color: '#1890ff' },
  accommodation: { label: '住宿', icon: <Hotel size={18} />, color: '#722ed1' },
  food: { label: '餐饮', icon: <Coffee size={18} />, color: '#fa8c16' },
  entertainment: { label: '招待', icon: <Users size={18} />, color: '#eb2f96' },
  other: { label: '其他', icon: <MoreHorizontal size={18} />, color: '#8c8c8c' },
};

const categoryColors: Record<ExpenseCategory, string> = {
  transport: '#1890ff',
  accommodation: '#722ed1',
  food: '#fa8c16',
  entertainment: '#eb2f96',
  other: '#8c8c8c',
};

export default function AnalysisExpense() {
  const expenses = useExpenseStore(state => state.expenses);
  const fetchExpenses = useExpenseStore(state => state.fetchExpenses);
  const itineraries = useItineraryStore(state => state.itineraries);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const yearExpenses = useMemo(() => {
    return expenses.filter(e => dayjs(e.expenseDate).year() === selectedYear);
  }, [expenses, selectedYear]);

  const stats = useMemo(() => {
    const totalExpense = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
    const tripCount = new Set(yearExpenses.map(e => e.itineraryId).filter(Boolean)).size;
    const avgPerTrip = tripCount > 0 ? totalExpense / tripCount : 0;

    const lastYear = selectedYear - 1;
    const lastYearExpenses = expenses.filter(e => dayjs(e.expenseDate).year() === lastYear);
    const lastYearTotal = lastYearExpenses.reduce((sum, e) => sum + e.amount, 0);

    const yoy = lastYearTotal > 0 ? ((totalExpense - lastYearTotal) / lastYearTotal * 100).toFixed(1) : '0';

    const currentMonth = dayjs().month();
    const currentMonthExpenses = yearExpenses.filter(e => dayjs(e.expenseDate).month() === currentMonth);
    const lastMonthExpenses = yearExpenses.filter(e => dayjs(e.expenseDate).month() === currentMonth - 1);
    const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const mom = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : '0';

    return {
      totalExpense,
      avgPerTrip,
      yoy,
      mom,
    };
  }, [yearExpenses, expenses, selectedYear]);

  const categoryPieData = useMemo(() => {
    const stats: Record<ExpenseCategory, number> = {
      transport: 0,
      accommodation: 0,
      food: 0,
      entertainment: 0,
      other: 0,
    };
    yearExpenses.forEach(e => {
      stats[e.category] += e.amount;
    });
    return (Object.keys(stats) as ExpenseCategory[])
      .map(key => ({
        value: stats[key],
        name: categoryMap[key].label,
        itemStyle: { color: categoryColors[key] },
      }))
      .filter(d => d.value > 0);
  }, [yearExpenses]);

  const categoryPieOption = {
    title: {
      text: '费用分类占比',
      left: 'center',
      textStyle: { fontSize: 16 },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            formatter: '{b}\n¥{c}',
          },
        },
        labelLine: {
          show: false,
        },
        data: categoryPieData,
      },
    ],
  };

  const monthlyTrendData = useMemo(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const categoryTotals: Record<ExpenseCategory, number[]> = {
      transport: new Array(12).fill(0),
      accommodation: new Array(12).fill(0),
      food: new Array(12).fill(0),
      entertainment: new Array(12).fill(0),
      other: new Array(12).fill(0),
    };

    yearExpenses.forEach(e => {
      const month = dayjs(e.expenseDate).month();
      categoryTotals[e.category][month] += e.amount;
    });

    return { months, categoryTotals };
  }, [yearExpenses]);

  const monthlyTrendOption = {
    title: {
      text: '月度费用趋势',
      left: 'center',
      textStyle: { fontSize: 16 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        let total = 0;
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((p: any) => {
          total += p.value;
          result += `${p.marker} ${p.seriesName}: ¥${p.value.toLocaleString()}<br/>`;
        });
        result += `<strong>合计: ¥${total.toLocaleString()}</strong>`;
        return result;
      },
    },
    legend: {
      data: (Object.keys(categoryMap) as ExpenseCategory[]).map(k => categoryMap[k].label),
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: monthlyTrendData.months,
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '¥{value}' },
    },
    series: (Object.keys(monthlyTrendData.categoryTotals) as ExpenseCategory[]).map(category => ({
      name: categoryMap[category].label,
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      itemStyle: { color: categoryColors[category] },
      data: monthlyTrendData.categoryTotals[category],
    })),
  };

  const personalRankData = useMemo(() => {
    const userExpenses: Record<string, { name: string; total: number; count: number }> = {
      'user_001': { name: '张明', total: 0, count: 0 },
      'user_002': { name: '李华', total: 0, count: 0 },
      'user_003': { name: '王芳', total: 0, count: 0 },
      'user_004': { name: '赵敏', total: 0, count: 0 },
    };

    yearExpenses.forEach(e => {
      const itinerary = itineraries.find(i => i.id === e.itineraryId);
      const userId = itinerary?.userId || 'user_001';
      if (userExpenses[userId]) {
        userExpenses[userId].total += e.amount;
        userExpenses[userId].count += 1;
      }
    });

    return Object.values(userExpenses)
      .filter(u => u.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [yearExpenses, itineraries]);

  const personalRankOption = {
    title: {
      text: '个人月度费用排名',
      left: 'center',
      textStyle: { fontSize: 16 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p = params[0];
        const data = personalRankData[p.dataIndex];
        return `${p.name}<br/>总费用: ¥${data.total.toLocaleString()}<br/>费用项: ${data.count}项`;
      },
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: '¥{value}' },
    },
    yAxis: {
      type: 'category',
      data: personalRankData.map(d => d.name).reverse(),
    },
    series: [
      {
        type: 'bar',
        data: personalRankData.map((d, index) => ({
          value: d.total,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: index === 0 ? '#faad14' : '#1890ff' },
                { offset: 1, color: index === 0 ? '#ffec3d' : '#69c0ff' },
              ],
            },
            borderRadius: [0, 4, 4, 0],
          },
        })).reverse(),
        label: {
          show: true,
          position: 'right',
          formatter: '¥{c}',
        },
        barWidth: '60%',
      },
    ],
  };

  const years = [dayjs().year() - 2, dayjs().year() - 1, dayjs().year(), dayjs().year() + 1];

  const rankColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => {
        const colors = ['#faad14', '#bfbfbf', '#d46b08', '#8c8c8c'];
        return (
          <Tag color={colors[index] || 'default'} className="w-full text-center">
            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
          </Tag>
        );
      },
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '总费用',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => <span className="font-semibold">¥{value.toLocaleString()}</span>,
      sorter: (a: any, b: any) => a.total - b.total,
    },
    {
      title: '费用项数',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  if (expenses.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">费用分析</h2>
        <Empty description="暂无费用数据" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold m-0">费用分析</h2>
        <Select
          value={selectedYear}
          onChange={setSelectedYear}
          style={{ width: 120 }}
        >
          {years.map(year => (
            <Option key={year} value={year}>{year}年</Option>
          ))}
        </Select>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="overflow-hidden">
            <div
              className="p-4 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm mb-1">总费用</p>
                  <p className="text-2xl font-bold text-white m-0">¥{stats.totalExpense.toLocaleString()}</p>
                  <p className="text-white text-opacity-70 text-xs mt-1">元</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <DollarSign size={28} className="text-white" />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="overflow-hidden">
            <div
              className="p-4 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm mb-1">平均每次出差</p>
                  <p className="text-2xl font-bold text-white m-0">¥{stats.avgPerTrip.toFixed(0)}</p>
                  <p className="text-white text-opacity-70 text-xs mt-1">元</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <PieChart size={28} className="text-white" />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="overflow-hidden">
            <div
              className="p-4 rounded-lg"
              style={{ background: Number(stats.yoy) >= 0 ? 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm mb-1">费用同比</p>
                  <p className="text-2xl font-bold text-white m-0 flex items-center gap-1">
                    {Number(stats.yoy) >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    {Math.abs(Number(stats.yoy))}%
                  </p>
                  <p className="text-white text-opacity-70 text-xs mt-1">较去年</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Calendar size={28} className="text-white" />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="overflow-hidden">
            <div
              className="p-4 rounded-lg"
              style={{ background: Number(stats.mom) >= 0 ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm mb-1">费用环比</p>
                  <p className="text-2xl font-bold text-white m-0 flex items-center gap-1">
                    {Number(stats.mom) >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    {Math.abs(Number(stats.mom))}%
                  </p>
                  <p className="text-white text-opacity-70 text-xs mt-1">较上月</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <BarChart3 size={28} className="text-white" />
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={10}>
          <Card>
            <ReactECharts option={categoryPieOption} style={{ height: '400px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card>
            <ReactECharts option={monthlyTrendOption} style={{ height: '400px' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card>
            <ReactECharts option={personalRankOption} style={{ height: '400px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="费用排行榜详情">
            <Table
              columns={rankColumns}
              dataSource={personalRankData}
              rowKey="name"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
