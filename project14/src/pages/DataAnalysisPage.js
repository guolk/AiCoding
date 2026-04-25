import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Card, Row, Col, Select, DatePicker, Table, Statistic, Progress, Tag, Descriptions } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, LineChartOutlined, BarChartOutlined, PieChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

function DataAnalysisPage() {
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const scatterChartRef = useRef(null);
  const [timeRange, setTimeRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [dataType, setDataType] = useState('sales');

  const generateRandomData = (count) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(Math.floor(Math.random() * 1000) + 100);
    }
    return data;
  };

  const generateDateRange = (start, end, interval = 1) => {
    const dates = [];
    let current = start.clone();
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.format('MM-DD'));
      current = current.add(interval, 'day');
    }
    return dates;
  };

  useEffect(() => {
    const dates = generateDateRange(timeRange[0], timeRange[1]);
    const data1 = generateRandomData(dates.length);
    const data2 = generateRandomData(dates.length);
    const data3 = generateRandomData(dates.length);

    // 折线图
    const lineChart = echarts.init(lineChartRef.current);
    const lineOption = {
      title: { text: `${dataType === 'sales' ? '销售' : dataType === 'users' ? '用户' : '流量'}趋势分析` },
      tooltip: { trigger: 'axis' },
      legend: { data: ['实际值', '预测值', '目标值'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: dates },
      yAxis: { type: 'value' },
      series: [
        {
          name: '实际值',
          type: 'line',
          smooth: true,
          data: data1,
          areaStyle: { opacity: 0.3 }
        },
        {
          name: '预测值',
          type: 'line',
          smooth: true,
          data: data2,
          lineStyle: { type: 'dashed' }
        },
        {
          name: '目标值',
          type: 'line',
          smooth: true,
          data: data3,
          lineStyle: { type: 'dotted' }
        }
      ]
    };
    lineChart.setOption(lineOption);

    // 柱状图
    const barChart = echarts.init(barChartRef.current);
    const barOption = {
      title: { text: '各地区数据对比' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['第一季度', '第二季度', '第三季度', '第四季度'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['华东', '华北', '华南', '西南', '西北', '东北', '华中']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '第一季度',
          type: 'bar',
          data: [3200, 2800, 3100, 2400, 1800, 1600, 2200]
        },
        {
          name: '第二季度',
          type: 'bar',
          data: [3800, 3200, 3600, 2700, 2100, 1900, 2600]
        },
        {
          name: '第三季度',
          type: 'bar',
          data: [4200, 3600, 4000, 3100, 2400, 2200, 3000]
        },
        {
          name: '第四季度',
          type: 'bar',
          data: [4800, 4100, 4600, 3500, 2800, 2500, 3400]
        }
      ]
    };
    barChart.setOption(barOption);

    // 饼图
    const pieChart = echarts.init(pieChartRef.current);
    const pieOption = {
      title: { text: '数据来源分布', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '数据来源',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 20, fontWeight: 'bold' }
          },
          labelLine: { show: false },
          data: [
            { value: 335, name: '内部系统' },
            { value: 310, name: '第三方API' },
            { value: 234, name: '用户上传' },
            { value: 135, name: '爬虫采集' },
            { value: 148, name: '其他来源' }
          ]
        }
      ]
    };
    pieChart.setOption(pieOption);

    // 散点图
    const scatterChart = echarts.init(scatterChartRef.current);
    const scatterData1 = [];
    const scatterData2 = [];
    for (let i = 0; i < 50; i++) {
      scatterData1.push([Math.random() * 100, Math.random() * 100, Math.random() * 50 + 10]);
      scatterData2.push([Math.random() * 100, Math.random() * 100, Math.random() * 50 + 10]);
    }

    const scatterOption = {
      title: { text: '用户行为分析散点图' },
      tooltip: { trigger: 'item' },
      legend: { data: ['活跃用户', '非活跃用户'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', name: '访问频率' },
      yAxis: { type: 'value', name: '停留时间' },
      series: [
        {
          name: '活跃用户',
          type: 'scatter',
          symbolSize: (data) => data[2] / 2,
          data: scatterData1,
          itemStyle: { color: '#1890ff' }
        },
        {
          name: '非活跃用户',
          type: 'scatter',
          symbolSize: (data) => data[2] / 2,
          data: scatterData2,
          itemStyle: { color: '#faad14' }
        }
      ]
    };
    scatterChart.setOption(scatterOption);

    return () => {
      lineChart.dispose();
      barChart.dispose();
      pieChart.dispose();
      scatterChart.dispose();
    };
  }, [timeRange, dataType]);

  const stats = [
    { title: '总数据量', value: 1258469, suffix: '条', trend: 'up', change: 15.2, icon: <LineChartOutlined /> },
    { title: '数据完整性', value: 98.7, suffix: '%', trend: 'up', change: 2.3, icon: <BarChartOutlined /> },
    { title: '处理速度', value: 1250, suffix: '条/秒', trend: 'down', change: 3.5, icon: <PieChartOutlined /> },
    { title: '存储占用', value: 25.6, suffix: 'GB', trend: 'up', change: 8.1, icon: <LineChartOutlined /> },
  ];

  const tableData = [
    { key: '1', source: '用户行为数据', count: 456789, updateTime: '2023-12-01 14:30', status: '正常', progress: 95 },
    { key: '2', source: '销售订单数据', count: 325468, updateTime: '2023-12-01 13:45', status: '正常', progress: 88 },
    { key: '3', source: '产品库存数据', count: 189654, updateTime: '2023-12-01 12:20', status: '同步中', progress: 65 },
    { key: '4', source: '客户反馈数据', count: 98765, updateTime: '2023-12-01 11:15', status: '正常', progress: 92 },
    { key: '5', source: '系统日志数据', count: 198793, updateTime: '2023-12-01 10:00', status: '异常', progress: 45 },
  ];

  const tableColumns = [
    {
      title: '数据源',
      dataIndex: 'source',
      key: 'source',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: '数据量',
      dataIndex: 'count',
      key: 'count',
      render: (count) => count.toLocaleString()
    },
    {
      title: '同步进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress percent={progress} size="small" status={progress < 50 ? 'exception' : 'active'} />
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === '正常') color = 'green';
        else if (status === '同步中') color = 'blue';
        else if (status === '异常') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    }
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">数据分析</h1>
      
      <div className="info-section">
        <h3>分析参数设置</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
          <RangePicker
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 350 }}
          />
          <Select
            value={dataType}
            onChange={setDataType}
            style={{ width: 150 }}
          >
            <Option value="sales">销售数据</Option>
            <Option value="users">用户数据</Option>
            <Option value="traffic">流量数据</Option>
          </Select>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                suffix={stat.suffix}
                valueStyle={{ color: stat.trend === 'up' ? '#3f8600' : '#cf1322' }}
              />
              <div style={{ marginTop: 8 }}>
                {stat.trend === 'up' ? <ArrowUpOutlined style={{ color: '#3f8600' }} /> : <ArrowDownOutlined style={{ color: '#cf1322' }} />}
                <span style={{ marginLeft: 4 }}>{stat.change}% 较上期</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="趋势分析图">
            <div ref={lineChartRef} className="chart-container"></div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="地区对比图">
            <div ref={barChartRef} className="chart-container"></div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="数据来源分布">
            <div ref={pieChartRef} className="chart-container"></div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="用户行为分析">
            <div ref={scatterChartRef} className="chart-container"></div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="数据源状态监控">
            <Table
              columns={tableColumns}
              dataSource={tableData}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="关键指标详情">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="数据采集延迟">平均 2.5 秒</Descriptions.Item>
              <Descriptions.Item label="数据清洗成功率">99.8%</Descriptions.Item>
              <Descriptions.Item label="数据转换耗时">平均 150 毫秒</Descriptions.Item>
              <Descriptions.Item label="数据加载失败率">0.02%</Descriptions.Item>
              <Descriptions.Item label="数据备份频率">每 4 小时</Descriptions.Item>
              <Descriptions.Item label="数据恢复时间">平均 30 分钟</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统性能指标">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="CPU 使用率">45% (正常)</Descriptions.Item>
              <Descriptions.Item label="内存使用率">72% (正常)</Descriptions.Item>
              <Descriptions.Item label="磁盘 I/O">125 MB/s</Descriptions.Item>
              <Descriptions.Item label="网络带宽">95 Mbps</Descriptions.Item>
              <Descriptions.Item label="数据库连接池">85% 使用率</Descriptions.Item>
              <Descriptions.Item label="缓存命中率">92%</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DataAnalysisPage;
