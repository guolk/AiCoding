import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Select, Empty, List, Tag, Table, Progress, Space } from 'antd';
import {
  Clock, CheckCircle, AlertCircle, TrendingUp, Target, Award,
  BarChart3, PieChart, Calendar, Users, Zap
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { useItineraryStore } from '@/store/useItineraryStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useReimbursementStore } from '@/store/useReimbursementStore';
import type { Itinerary } from '@/types/itinerary';

const { Option } = Select;

interface EfficiencyData {
  name: string;
  days: number;
  output: number;
  department: string;
  expense: number;
}

export default function AnalysisEfficiency() {
  const itineraries = useItineraryStore(state => state.itineraries);
  const fetchItineraries = useItineraryStore(state => state.fetchItineraries);
  const expenses = useExpenseStore(state => state.expenses);
  const reimbursements = useReimbursementStore(state => state.reimbursements);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  const yearItineraries = useMemo(() => {
    return itineraries.filter(i => dayjs(i.startDate).year() === selectedYear && i.status === 'completed');
  }, [itineraries, selectedYear]);

  const stats = useMemo(() => {
    const totalTrips = yearItineraries.length;
    const totalDays = yearItineraries.reduce((sum, i) => {
      return sum + dayjs(i.endDate).diff(dayjs(i.startDate), 'day') + 1;
    }, 0);
    const totalVisits = yearItineraries.reduce((sum, i) => sum + i.visits.length, 0);
    const avgVisitsPerTrip = totalTrips > 0 ? (totalVisits / totalTrips).toFixed(1) : '0';

    const totalExpense = expenses
      .filter(e => dayjs(e.expenseDate).year() === selectedYear)
      .reduce((sum, e) => sum + e.amount, 0);

    const avgCostPerDay = totalDays > 0 ? totalExpense / totalDays : 0;
    const roi = totalExpense > 0 ? ((totalVisits * 10000 - totalExpense) / totalExpense * 100).toFixed(1) : '0';

    const approvalTimes: number[] = [];
    reimbursements.forEach(r => {
      if (r.submitTime && r.reviewTime) {
        const hours = dayjs(r.reviewTime).diff(dayjs(r.submitTime), 'hour');
        approvalTimes.push(hours);
      }
    });
    const avgApprovalTime = approvalTimes.length > 0
      ? (approvalTimes.reduce((a, b) => a + b, 0) / approvalTimes.length).toFixed(1)
      : '0';

    const passRate = reimbursements.length > 0
      ? ((reimbursements.filter(r => r.status === 'paid').length / reimbursements.length) * 100).toFixed(1)
      : '0';

    return {
      totalTrips,
      totalDays,
      totalVisits,
      avgVisitsPerTrip,
      totalExpense,
      avgCostPerDay,
      roi,
      avgApprovalTime,
      passRate,
    };
  }, [yearItineraries, expenses, reimbursements, selectedYear]);

  const scatterData = useMemo((): EfficiencyData[] => {
    const userData: Record<string, EfficiencyData> = {
      'user_001': { name: '张明', days: 0, output: 0, department: '技术部', expense: 0 },
      'user_002': { name: '李华', days: 0, output: 0, department: '技术部', expense: 0 },
      'user_003': { name: '王芳', days: 0, output: 0, department: '财务部', expense: 0 },
      'user_004': { name: '赵敏', days: 0, output: 0, department: '行政部', expense: 0 },
    };

    yearItineraries.forEach(i => {
      const data = userData[i.userId] || userData['user_001'];
      data.days += dayjs(i.endDate).diff(dayjs(i.startDate), 'day') + 1;
      data.output += i.visits.length * 10 + i.destinations.length * 5;
    });

    expenses.filter(e => dayjs(e.expenseDate).year() === selectedYear).forEach(e => {
      const itinerary = itineraries.find(i => i.id === e.itineraryId);
      const userId = itinerary?.userId || 'user_001';
      if (userData[userId]) {
        userData[userId].expense += e.amount;
      }
    });

    return Object.values(userData).filter(d => d.days > 0);
  }, [yearItineraries, expenses, itineraries, selectedYear]);

  const scatterOption = {
    title: {
      text: '出差天数 vs 成果产出',
      left: 'center',
      textStyle: { fontSize: 16 },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = scatterData[params.dataIndex];
        return `${data.name}<br/>部门: ${data.department}<br/>出差天数: ${data.days}天<br/>成果产出: ${data.output}分<br/>总费用: ¥${data.expense.toLocaleString()}`;
      },
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      name: '出差天数',
      type: 'value',
      axisLabel: { formatter: '{value}天' },
      splitLine: { lineStyle: { type: 'dashed' } },
    },
    yAxis: {
      name: '成果产出',
      type: 'value',
      axisLabel: { formatter: '{value}分' },
      splitLine: { lineStyle: { type: 'dashed' } },
    },
    series: [
      {
        type: 'scatter',
        symbolSize: (data: number[]) => {
          const d = scatterData.find(s => s.days === data[0] && s.output === data[1]);
          return Math.max(20, Math.min(60, (d?.expense || 0) / 500));
        },
        itemStyle: {
          color: (params: any) => {
            const d = scatterData[params.dataIndex];
            const colors: Record<string, string> = {
              '技术部': '#1890ff',
              '财务部': '#52c41a',
              '行政部': '#faad14',
              '销售部': '#eb2f96',
            };
            return colors[d.department] || '#722ed1';
          },
          opacity: 0.8,
        },
        data: scatterData.map(d => [d.days, d.output]),
      },
    ],
  };

  const departmentData = useMemo(() => {
    const deptData: Record<string, { trips: number; days: number; visits: number; expense: number }> = {
      '技术部': { trips: 0, days: 0, visits: 0, expense: 0 },
      '财务部': { trips: 0, days: 0, visits: 0, expense: 0 },
      '行政部': { trips: 0, days: 0, visits: 0, expense: 0 },
      '销售部': { trips: 0, days: 0, visits: 0, expense: 0 },
    };

    const userDeptMap: Record<string, string> = {
      'user_001': '技术部',
      'user_002': '技术部',
      'user_003': '财务部',
      'user_004': '行政部',
    };

    yearItineraries.forEach(i => {
      const dept = userDeptMap[i.userId] || '技术部';
      const days = dayjs(i.endDate).diff(dayjs(i.startDate), 'day') + 1;
      deptData[dept].trips += 1;
      deptData[dept].days += days;
      deptData[dept].visits += i.visits.length;
    });

    expenses.filter(e => dayjs(e.expenseDate).year() === selectedYear).forEach(e => {
      const itinerary = itineraries.find(i => i.id === e.itineraryId);
      const userId = itinerary?.userId || 'user_001';
      const dept = userDeptMap[userId] || '技术部';
      deptData[dept].expense += e.amount;
    });

    return deptData;
  }, [yearItineraries, expenses, itineraries, selectedYear]);

  const departmentOption = {
    title: {
      text: '部门效率对比',
      left: 'center',
      textStyle: { fontSize: 16 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['出差次数', '平均每次产出', '人均费用'],
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
      data: Object.keys(departmentData),
    },
    yAxis: [
      {
        type: 'value',
        name: '次数/产出',
        position: 'left',
      },
      {
        type: 'value',
        name: '费用(元)',
        position: 'right',
        axisLabel: { formatter: '¥{value}' },
      },
    ],
    series: [
      {
        name: '出差次数',
        type: 'bar',
        data: Object.values(departmentData).map(d => d.trips),
        itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "平均每次产出",
        type: "bar",
        data: Object.values(departmentData).map(d => d.trips > 0 ? (d.visits / d.trips * 10).toFixed(0) : 0),
        itemStyle: { color: "#52c41a", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '人均费用',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: Object.values(departmentData).map(d => d.trips > 0 ? (d.expense / d.trips).toFixed(0) : 0),
        lineStyle: { width: 3, color: '#faad14' },
        itemStyle: { color: '#faad14' },
      },
    ],
  };

  const roiTrendData = useMemo(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const roiData: number[] = [];

    for (let m = 0; m < 12; m++) {
      const monthTrips = yearItineraries.filter(i => dayjs(i.startDate).month() === m);
      const monthExpense = expenses
        .filter(e => dayjs(e.expenseDate).year() === selectedYear && dayjs(e.expenseDate).month() === m)
        .reduce((sum, e) => sum + e.amount, 0);
      const monthVisits = monthTrips.reduce((sum, i) => sum + i.visits.length, 0);
      const roi = monthExpense > 0 ? ((monthVisits * 10000 - monthExpense) / monthExpense * 100) : 0;
      roiData.push(Number(roi.toFixed(1)));
    }

    return { months, roiData };
  }, [yearItineraries, expenses, selectedYear]);

  const roiTrendOption = {
    title: {
      text: 'ROI趋势',
      left: 'center',
      textStyle: { fontSize: 16 },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => `${params[0].axisValue}<br/>投资回报率: ${params[0].value}%`,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: roiTrendData.months,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { type: 'dashed' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' },
            ],
          },
        },
        itemStyle: {
          color: '#764ba2',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.05)' },
            ],
          },
        },
        data: roiTrendData.roiData,
      },
    ],
  };

  const rankingData = useMemo(() => {
    return scatterData
      .map(d => ({
        ...d,
        efficiency: d.days > 0 ? (d.output / d.days).toFixed(2) : '0',
        costEfficiency: d.output > 0 ? (d.expense / d.output).toFixed(0) : '0',
      }))
      .sort((a, b) => Number(b.efficiency) - Number(a.efficiency));
  }, [scatterData]);

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
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (dept: string) => {
        const colors: Record<string, string> = {
          '技术部': 'blue',
          '财务部': 'green',
          '行政部': 'orange',
          '销售部': 'magenta',
        };
        return <Tag color={colors[dept]}>{dept}</Tag>;
      },
    },
    {
      title: '出差天数',
      dataIndex: 'days',
      key: 'days',
      render: (days: number) => `${days}天`,
    },
    {
      title: '成果产出',
      dataIndex: 'output',
      key: 'output',
      render: (output: number) => `${output}分`,
    },
    {
      title: '日均产出',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (eff: string) => <span className="font-semibold text-green-600">{eff}分/天</span>,
    },
    {
      title: '费用',
      dataIndex: 'expense',
      key: 'expense',
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
  ];

  const statCards = [
    { label: '平均审批时间', value: stats.avgApprovalTime, unit: '小时', icon: <Clock size={24} />, color: '#1890ff', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { label: '一次通过率', value: stats.passRate, unit: '%', icon: <CheckCircle size={24} />, color: '#52c41a', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { label: 'ROI', value: stats.roi, unit: '%', icon: <TrendingUp size={24} />, color: Number(stats.roi) >= 0 ? '#52c41a' : '#ff4d4f', bg: Number(stats.roi) >= 0 ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { label: '日均费用', value: stats.avgCostPerDay.toFixed(0), unit: '元', icon: <BarChart3 size={24} />, color: '#faad14', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  ];

  const efficiencyList = [
    { name: '审批流程优化', progress: 92, description: '减少审批环节，提升审批效率30%', icon: <Zap size={20} /> },
    { name: '智能费用预测', progress: 78, description: '基于历史数据预测费用，提前预警超支', icon: <Target size={20} /> },
    { name: '自动行程推荐', progress: 85, description: '基于员工偏好和历史数据推荐最优行程', icon: <Award size={20} /> },
    { name: 'OCR发票识别', progress: 95, description: '自动识别发票信息，减少人工录入', icon: <PieChart size={20} /> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold m-0">效率评估</h2>
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
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="overflow-hidden">
              <div className="p-4 rounded-lg" style={{ background: card.bg }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-80 text-sm mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-white m-0 flex items-center gap-1">
                      {card.value}<span className="text-base font-normal">{card.unit}</span>
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
        <Col xs={24} lg={14}>
          <Card>
            <ReactECharts option={scatterOption} style={{ height: '400px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card>
            <ReactECharts option={departmentOption} style={{ height: '400px' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={roiTrendOption} style={{ height: '400px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="流程优化建议">
            <List
              dataSource={efficiencyList}
              renderItem={(item) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <Space>
                        <span className="p-2 rounded-full bg-blue-50 text-blue-500">
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </Space>
                      <span className="text-blue-500 font-semibold">{item.progress}%</span>
                    </div>
                    <Progress percent={item.progress} showInfo={false} className="mb-2" />
                    <p className="text-gray-500 text-sm mb-0">{item.description}</p>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card title="效率排行榜">
        <Table
          columns={rankColumns}
          dataSource={rankingData}
          rowKey="name"
          pagination={false}
        />
      </Card>
    </div>
  );
}
