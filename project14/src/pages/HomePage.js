import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ShoppingOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons';

function HomePage({ data, now, today }) {
  const stats = [
    { title: '用户总数', value: 12846, prefix: <UserOutlined />, suffix: '人', trend: 'up', change: 12.5 },
    { title: '今日订单', value: 1568, prefix: <ShoppingOutlined />, suffix: '单', trend: 'up', change: 8.3 },
    { title: '销售额', value: 245680, prefix: <DollarOutlined />, suffix: '元', trend: 'down', change: 3.2 },
    { title: '待处理工单', value: 42, prefix: <FileTextOutlined />, suffix: '个', trend: 'up', change: 15.8 },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">首页 - 性能优化演示</h1>
      
      <div className="info-section">
        <h3>当前时间信息</h3>
        <p>使用 dayjs: {now}</p>
        <p>使用 dayjs: {today}</p>
        <p>数据: {data.join(', ')}</p>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ color: stat.trend === 'up' ? '#3f8600' : '#cf1322' }}
              />
              <div style={{ marginTop: 8 }}>
                {stat.trend === 'up' ? <ArrowUpOutlined style={{ color: '#3f8600' }} /> : <ArrowDownOutlined style={{ color: '#cf1322' }} />}
                <span style={{ marginLeft: 4 }}>{stat.change}% 较昨日</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="info-section" style={{ marginTop: 20 }}>
        <h3>项目说明</h3>
        <p>这是一个用于演示React应用性能优化的示例项目。已实施以下优化：</p>
        <ul>
          <li>配置了代码分割，将依赖分离到不同的chunk中</li>
          <li>实现了组件懒加载，首屏只加载必要的代码</li>
          <li>配置了Tree Shaking，消除未使用的代码</li>
          <li>为静态资源配置了合理的缓存策略</li>
          <li>使用dayjs替代moment.js，减少体积</li>
          <li>使用lodash-es支持Tree Shaking</li>
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
