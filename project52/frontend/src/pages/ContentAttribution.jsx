import React, { useState, useEffect } from 'react'
import {
  Card, Select, DatePicker, message, Empty, Spin, Row, Col, Table, Statistic, Tag, Alert
} from 'antd'
import {
  BarChartOutlined, RiseOutlined
} from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { analyticsAPI } from '../utils/api'
import { PLATFORM_LABEL_MAP } from '../utils/constants'

const ContentAttribution = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [platform, setPlatform] = useState(undefined)
  const [period, setPeriod] = useState('90d')

  useEffect(() => {
    fetchData()
  }, [platform, period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await analyticsAPI.getContentAttribution({ platform })
      setData(response.data)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!data) {
    return <Empty description="暂无分析数据" />
  }

  const renderRadarData = (items) => {
    if (!items || items.length === 0) return []
    return items.slice(0, 8).map(item => ({
      subject: item.category?.length > 15 ? item.category.slice(0, 15) + '...' : item.category,
      engagement: item.avg_engagement,
      views: item.avg_views / 1000
    }))
  }

  const columns = [
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '平均浏览量',
      dataIndex: 'avg_views',
      key: 'avg_views',
      render: (v) => v?.toLocaleString()
    },
    {
      title: '平均互动率',
      dataIndex: 'avg_engagement',
      key: 'avg_engagement',
      render: (v) => <span style={{ fontWeight: 'bold', color: v > 5 ? '#52c41a' : '#1890ff' }}>{v}%</span>
    },
    {
      title: '样本量',
      dataIndex: 'sample_size',
      key: 'sample_size'
    }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}><BarChartOutlined /> 内容表现归因分析</h2>

      <Card style={{ marginBottom: 24 }} className="card-shadow">
        <Row gutter={16}>
          <Col span={8}>
            <Select
              placeholder="选择平台"
              style={{ width: '100%' }}
              value={platform}
              onChange={setPlatform}
              allowClear
              options={PLATFORM_LABEL_MAP}
            />
          </Col>
          <Col span={8}>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: '100%' }}
              options={[
                { value: '30d', label: '最近30天' },
                { value: '90d', label: '最近90天' },
                { value: '180d', label: '最近180天' }
              ]}
            />
          </Col>
        </Row>
      </Card>

      {data.recommendations && data.recommendations.length > 0 && (
        <Alert
          message="优化建议"
          description={
            <ul>
              {data.recommendations.map((rec, index) => (
                <li key={index}>
                  <Tag color={rec.priority === 'high' ? 'red' : 'blue'}>{rec.type}</Tag>
                  {rec.message}
                </li>
              ))}
            </ul>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="按主题分析" className="card-shadow">
            {data.by_topic && data.by_topic.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={renderRadarData(data.by_topic)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                    <Radar name="互动率(%)" dataKey="engagement" stroke="#1890ff" fill="#1890ff" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
                <Table
                  columns={columns}
                  dataSource={data.by_topic}
                  rowKey={(record, index) => index}
                  size="small"
                  pagination={false}
                />
              </div>
            ) : (
              <Empty description="暂无主题数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="按内容格式分析" className="card-shadow">
            {data.by_content_type && data.by_content_type.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.by_content_type}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg_views" fill="#1890ff" name="平均浏览量" />
                    <Bar dataKey="avg_engagement" fill="#52c41a" name="互动率%" />
                  </BarChart>
                </ResponsiveContainer>
                <Table
                  columns={columns}
                  dataSource={data.by_content_type}
                  rowKey={(record, index) => index}
                  size="small"
                  pagination={false}
                />
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="按发布时间分析" className="card-shadow">
            {data.by_publish_time && data.by_publish_time.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.by_publish_time}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg_engagement" fill="#722ed1" name="互动率%" />
                  </BarChart>
                </ResponsiveContainer>
                <Table
                  columns={columns}
                  dataSource={data.by_publish_time}
                  rowKey={(record, index) => index}
                  size="small"
                  pagination={false}
                />
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="按发布星期分析" className="card-shadow">
            {data.by_publish_day && data.by_publish_day.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.by_publish_day}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg_views" fill="#faad14" name="平均浏览量" />
                    <Bar dataKey="avg_engagement" fill="#52c41a" name="互动率%" />
                  </BarChart>
                </ResponsiveContainer>
                <Table
                  columns={columns}
                  dataSource={data.by_publish_day}
                  rowKey={(record, index) => index}
                  size="small"
                  pagination={false}
                />
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="分析周期" style={{ marginTop: 24 }} className="card-shadow">
        <Statistic
          title="分析时间范围"
          value={`${data.period?.start_date} 至 ${data.period?.end_date}`}
          prefix={<RiseOutlined />}
        />
      </Card>
    </div>
  )
}

export default ContentAttribution
