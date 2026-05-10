import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Space, Spin, Empty } from 'antd'
import { UserOutlined, EyeOutlined, MoneyCollectOutlined, RocketOutlined } from '@ant-design/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { dataAggregationAPI } from '../utils/api'
import { PLATFORMS } from '../utils/constants'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await dataAggregationAPI.getDashboard()
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!data) {
    return <Empty description="暂无数据" />
  }

  const platformChartData = data.platform_comparison?.map(p => ({
    name: PLATFORMS[p.platform]?.label || p.platform,
    followers: p.total_followers,
    views: Math.round(p.avg_views),
    engagement: p.avg_engagement
  })) || []

  const performanceColumns = [
    {
      title: '内容标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform) => {
        const p = PLATFORMS[platform]
        return <Tag color={p?.color || 'default'}>{p?.label || platform}</Tag>
      }
    },
    {
      title: '发布日期',
      dataIndex: 'publish_date',
      key: 'publish_date'
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (views) => views?.toLocaleString()
    },
    {
      title: '互动率',
      dataIndex: 'engagement_rate',
      key: 'engagement_rate',
      render: (rate) => <span>{rate?.toFixed(2)}%</span>
    }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据概览</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总粉丝数"
              value={data.total_followers || 0}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={data.total_views || 0}
              prefix={<EyeOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总收益"
              value={data.total_revenue || 0}
              prefix={<MoneyCollectOutlined style={{ color: '#faad14' }} />}
              suffix="元"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="活跃平台"
              value={data.active_platforms || 0}
              prefix={<RocketOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="各平台粉丝对比" className="card-shadow">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="followers" fill="#1890ff" name="粉丝数" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="各平台互动率对比" className="card-shadow">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="engagement"
                >
                  {platformChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="本周发布" className="card-shadow">
            <Statistic
              value={data.content_published_this_week || 0}
              suffix="篇内容"
              valueStyle={{ fontSize: 48, color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="待发布内容" className="card-shadow">
            <Statistic
              value={data.upcoming_content || 0}
              suffix="篇"
              valueStyle={{ fontSize: 48, color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {data.recent_performance && data.recent_performance.length > 0 && (
        <Card title="最近内容表现" style={{ marginTop: 24 }} className="card-shadow">
          <Table
            columns={performanceColumns}
            dataSource={data.recent_performance}
            rowKey={(record, index) => index}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}
    </div>
  )
}

export default Dashboard
