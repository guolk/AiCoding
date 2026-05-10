import React, { useState, useEffect } from 'react'
import {
  Card, Select, message, Empty, Spin, Row, Col, Statistic, Tag, Tabs, Alert
} from 'antd'
import {
  UserOutlined, TeamOutlined
} from '@ant-design/icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { analyticsAPI } from '../utils/api'
import { PLATFORMS } from '../utils/constants'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

const FollowerInsights = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [platform, setPlatform] = useState(undefined)

  useEffect(() => {
    fetchData()
  }, [platform])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await analyticsAPI.getFollowerInsights({ platform })
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

  if (!data || !data.accounts || data.accounts.length === 0) {
    return <Empty description="暂无粉丝画像数据，请先在数据聚合中添加平台账号" />
  }

  const renderPieData = (distribution) => {
    if (!distribution || Object.keys(distribution).length === 0) return []
    return Object.entries(distribution).map(([key, value]) => ({
      name: key,
      value: value
    }))
  }

  const renderAccountTabs = () => {
    return data.accounts.map((account, index) => {
      const platformInfo = PLATFORMS[account.platform]
      const insights = account.simulated_data || {}

      const ageData = renderPieData(insights.age_distribution)
      const genderData = renderPieData(insights.gender_distribution)
      const locationData = renderPieData(insights.location_distribution)

      return {
        key: index,
        label: (
          <span>
            <Tag color={platformInfo?.color}>{platformInfo?.label}</Tag>
            {account.account_name || '未命名账号'}
          </span>
        ),
        children: (
          <div>
            {insights.age_distribution && Object.keys(insights.age_distribution).length > 0 && (
              <Card title="年龄分布" style={{ marginBottom: 16 }} className="card-shadow">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ageData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {insights.gender_distribution && Object.keys(insights.gender_distribution).length > 0 && (
              <Card title="性别分布" style={{ marginBottom: 16 }} className="card-shadow">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={i === 0 ? '#1890ff' : '#eb2f96'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {insights.location_distribution && Object.keys(insights.location_distribution).length > 0 && (
              <Card title="地域分布" style={{ marginBottom: 16 }} className="card-shadow">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" fill="#1890ff" name="占比" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            <Row gutter={[16, 16]}>
              {insights.interest_tags && insights.interest_tags.length > 0 && (
                <Col xs={24} md={12}>
                  <Card title="兴趣标签" className="card-shadow">
                    <div>
                      {insights.interest_tags.map((tag, i) => (
                        <Tag
                          key={i}
                          color={COLORS[i % COLORS.length]}
                          style={{ marginBottom: 8, padding: '4px 12px', fontSize: 14 }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </Card>
                </Col>
              )}

              {insights.active_hours && insights.active_hours.length > 0 && (
                <Col xs={24} md={12}>
                  <Card title="活跃时段" className="card-shadow">
                    <div>
                      {insights.active_hours.map((hour, i) => (
                        <Tag
                          key={i}
                          color="blue"
                          style={{ marginBottom: 8, padding: '4px 12px', fontSize: 14 }}
                        >
                          {hour}:00 - {hour + 1}:00
                        </Tag>
                      ))}
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )
      }
    })
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}><UserOutlined /> 粉丝画像分析</h2>

      {data.cross_platform_analysis && data.cross_platform_analysis.has_multiple_platforms && (
        <Alert
          message="跨平台分析"
          description={
            <div>
              <p>
                <strong>估计重叠率：</strong>
                <span style={{ marginLeft: 8, color: '#1890ff', fontWeight: 'bold' }}>
                  {data.cross_platform_analysis.overlap_analysis?.estimated_overlap_percent}%
                </span>
              </p>
              <p>{data.cross_platform_analysis.overlap_analysis?.interpretation}</p>
              <p style={{ color: '#1890ff' }}>
                <strong>建议：</strong>{data.cross_platform_analysis.overlap_analysis?.recommendation}
              </p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Tabs items={renderAccountTabs()} />

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="已分析平台"
              value={data.accounts?.length || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="数据覆盖"
              value={data.accounts?.filter(a => a.simulated_data).length || 0}
              suffix={`/ ${data.accounts?.length || 0}`}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default FollowerInsights
