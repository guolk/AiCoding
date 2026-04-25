import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card, Row, Col, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

function DashboardPage() {
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    // 折线图
    const lineChart = echarts.init(lineChartRef.current);
    const lineOption = {
      title: { text: '用户访问趋势' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['访问量', '独立访客'] },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '访问量',
          type: 'line',
          smooth: true,
          data: [1200, 1320, 1010, 1340, 900, 2300, 2100]
        },
        {
          name: '独立访客',
          type: 'line',
          smooth: true,
          data: [800, 920, 710, 940, 600, 1500, 1400]
        }
      ]
    };
    lineChart.setOption(lineOption);

    // 柱状图
    const barChart = echarts.init(barChartRef.current);
    const barOption = {
      title: { text: '各部门业绩对比' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['本月', '上月'] },
      xAxis: {
        type: 'category',
        data: ['销售部', '技术部', '市场部', '客服部', '人力资源部']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '本月',
          type: 'bar',
          data: [3200, 2800, 2400, 1800, 1200]
        },
        {
          name: '上月',
          type: 'bar',
          data: [2900, 2600, 2200, 1600, 1100]
        }
      ]
    };
    barChart.setOption(barOption);

    // 饼图
    const pieChart = echarts.init(pieChartRef.current);
    const pieOption = {
      title: { text: '用户来源分布', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '用户来源',
          type: 'pie',
          radius: '60%',
          data: [
            { value: 1048, name: '搜索引擎' },
            { value: 735, name: '直接访问' },
            { value: 580, name: '社交媒体' },
            { value: 484, name: '广告投放' },
            { value: 300, name: '其他渠道' }
          ]
        }
      ]
    };
    pieChart.setOption(pieOption);

    return () => {
      lineChart.dispose();
      barChart.dispose();
      pieChart.dispose();
    };
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">仪表盘</h1>
      
      <div className="info-section">
        <h3>数据筛选</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10 }}>
          <RangePicker 
            defaultValue={[dayjs().subtract(7, 'day'), dayjs()]} 
            style={{ width: 300 }} 
          />
          <Select defaultValue="all" style={{ width: 150 }}>
            <Option value="all">全部部门</Option>
            <Option value="sales">销售部</Option>
            <Option value="tech">技术部</Option>
            <Option value="market">市场部</Option>
          </Select>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="访问趋势图">
            <div ref={lineChartRef} className="chart-container"></div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="部门业绩对比">
            <div ref={barChartRef} className="chart-container"></div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="用户来源分布">
            <div ref={pieChartRef} className="chart-container"></div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="实时数据">
            <div className="info-section">
              <h3>系统状态</h3>
              <p>CPU 使用率: 45%</p>
              <p>内存使用率: 62%</p>
              <p>磁盘使用率: 78%</p>
              <p>网络带宽: 12.5 Mbps</p>
            </div>
            <div className="info-section">
              <h3>最新动态</h3>
              <ul>
                <li>新用户注册: 5 分钟前</li>
                <li>订单完成: 12 分钟前</li>
                <li>系统备份: 1 小时前</li>
                <li>安全扫描: 3 小时前</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardPage;
