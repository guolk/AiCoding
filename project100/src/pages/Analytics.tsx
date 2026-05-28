import React from 'react';
import { Card, Row, Col, Table, Statistic } from 'antd';
import { BarChartOutlined, PieChartOutlined, RadarChartOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useAppContext } from '../context/AppContext';
import { CATEGORY_LABELS } from '../utils/constants';

const Analytics: React.FC = () => {
  const { questions, departments, user } = useAppContext();

  // 题目正确率数据
  const accuracyData = questions.map(q => ({
    name: q.content.substring(0, 20) + '...',
    value: q.stats.totalAttempts > 0 
      ? Math.round((q.stats.correctAttempts / q.stats.totalAttempts) * 100)
      : 0
  })).sort((a, b) => a.value - b.value).slice(0, 10);

  // 部门对比数据
  const departmentOption = {
    title: { text: '各部门知识水平对比', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: departments.map(d => d.name) },
    yAxis: { type: 'value', max: 100 },
    series: [{
      type: 'bar',
      data: departments.map(d => d.avgScore),
      itemStyle: { color: '#1890ff' }
    }]
  };

  // 题目正确率分布
  const accuracyOption = {
    title: { text: '题目正确率分布（错误率最高的10题）', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', max: 100 },
    yAxis: { type: 'category', data: accuracyData.map(d => d.name) },
    series: [{
      type: 'bar',
      data: accuracyData.map(d => d.value),
      itemStyle: {
        color: (params: any) => params.value > 60 ? '#52c41a' : params.value > 40 ? '#faad14' : '#f5222d'
      }
    }]
  };

  // 个人知识雷达图
  const radarOption = {
    title: { text: '个人知识掌握情况', left: 'center' },
    tooltip: {},
    radar: {
      indicator: Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
        name: label,
        max: 100
      }))
    },
    series: [{
      type: 'radar',
      data: [{
        value: Object.entries(CATEGORY_LABELS).map(([key]) => user.knowledgeRadar?.[key as keyof typeof user.knowledgeRadar] || 0),
        name: '知识掌握度',
        areaStyle: { opacity: 0.3 }
      }]
    }]
  };

  const questionStatsColumns = [
    { title: '题目', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '分类', dataIndex: 'category', key: 'category', render: (cat: string) => CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] },
    { title: '总答题次数', dataIndex: ['stats', 'totalAttempts'], key: 'total' },
    { title: '正确次数', dataIndex: ['stats', 'correctAttempts'], key: 'correct' },
    { 
      title: '正确率', 
      key: 'accuracy', 
      render: (_: any, record: any) => {
        const rate = record.stats.totalAttempts > 0 
          ? Math.round((record.stats.correctAttempts / record.stats.totalAttempts) * 100)
          : 0;
        return `${rate}%`;
      }
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>数据分析</h2>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总题目数"
              value={questions.length}
              prefix={<PieChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃题目"
              value={questions.filter(q => q.isActive).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均正确率"
              value={Math.round(questions.reduce((acc, q) => {
                const rate = q.stats.totalAttempts > 0 ? (q.stats.correctAttempts / q.stats.totalAttempts) : 0;
                return acc + rate;
              }, 0) / questions.length * 100)}
              suffix="%"
              prefix={<RadarChartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="部门数"
              value={departments.length}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <ReactECharts option={departmentOption} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ReactECharts option={accuracyOption} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <ReactECharts option={radarOption} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="题目详情统计">
            <Table
              rowKey="id"
              columns={questionStatsColumns}
              dataSource={questions}
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;