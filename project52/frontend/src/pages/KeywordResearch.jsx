import React, { useState, useEffect } from 'react'
import { Button, Form, Input, Select, Card, Row, Col, Statistic, Tag, message, Empty, List, Table, Space } from 'antd'
import { SearchOutlined, BarChartOutlined, RiseOutlined, FallOutlined, MinusOutlined, TagOutlined } from '@ant-design/icons'
import { contentProductionAPI } from '../utils/api'
import { PLATFORM_LABEL_MAP, PLATFORMS } from '../utils/constants'

const KeywordResearch = () => {
  const [history, setHistory] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await contentProductionAPI.getKeywordResearch()
      setHistory(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAnalyze = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      const response = await contentProductionAPI.analyzeKeyword(values.keyword, values.platform)
      setResult(response.data)
      
      await contentProductionAPI.createKeywordResearch(response.data)
      fetchHistory()
    } catch (error) {
      message.error('分析失败')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'rising':
        return <RiseOutlined style={{ color: '#52c41a' }} />
      case 'declining':
        return <FallOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <MinusOutlined style={{ color: '#faad14' }} />
    }
  }

  const getCompetitionColor = (level) => {
    switch (level) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'default'
    }
  }

  const topContentColumns = [
    {
      title: '内容标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (v) => v?.toLocaleString()
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes',
      render: (v) => v?.toLocaleString()
    },
    {
      title: '互动率',
      dataIndex: 'engagement_rate',
      key: 'engagement_rate',
      render: (v) => `${v}%`
    }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}><SearchOutlined /> 关键词研究</h2>

      <Card title="关键词分析" className="card-shadow" style={{ marginBottom: 24 }}>
        <Form form={form} layout="inline">
          <Form.Item
            name="keyword"
            label="关键词"
            rules={[{ required: true, message: '请输入关键词' }]}
          >
            <Input
              placeholder="输入要分析的关键词"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
          </Form.Item>
          <Form.Item
            name="platform"
            label="平台"
            rules={[{ required: true, message: '请选择平台' }]}
          >
            <Select placeholder="选择平台" options={PLATFORM_LABEL_MAP} style={{ width: 150 }} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleAnalyze}
              loading={loading}
            >
              开始分析
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {result && (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="搜索量"
                  value={result.search_volume}
                  prefix={<BarChartOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <div style={{ color: '#666', marginBottom: 4 }}>竞争程度</div>
                <Tag color={getCompetitionColor(result.competition_level)} style={{ fontSize: 24, padding: '8px 16px' }}>
                  {result.competition_level === 'high' ? '高' : result.competition_level === 'medium' ? '中' : '低'}
                </Tag>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <div style={{ color: '#666', marginBottom: 4 }}>趋势</div>
                <div style={{ fontSize: 24 }}>
                  <Space>
                    {getTrendIcon(result.trend)}
                    <span>
                      {result.trend === 'rising' ? '上升' : result.trend === 'declining' ? '下降' : '稳定'}
                    </span>
                  </Space>
                </div>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="相关关键词"
                  value={result.related_keywords?.length || 0}
                  prefix={<TagOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card title="分析建议" style={{ marginBottom: 24 }} className="card-shadow">
            <p style={{ fontSize: 16, lineHeight: 1.8 }}>{result.recommendation}</p>
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="相关关键词" className="card-shadow">
                <Tag.Group>
                  {result.related_keywords?.map((keyword, index) => (
                    <Tag
                      key={index}
                      color="blue"
                      style={{ marginBottom: 8, fontSize: 14, padding: '4px 12px' }}
                    >
                      {keyword}
                    </Tag>
                  ))}
                </Tag.Group>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="热门内容" className="card-shadow">
                <Table
                  columns={topContentColumns}
                  dataSource={result.top_content}
                  rowKey={(record, index) => index}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {history.length > 0 && (
        <Card title="搜索历史" style={{ marginTop: 24 }} className="card-shadow">
          <List
            dataSource={history}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Tag color={PLATFORMS[item.platform]?.color}>{PLATFORMS[item.platform]?.label}</Tag>}
                  title={<span style={{ fontSize: 16, fontWeight: 500 }}>{item.keyword}</span>}
                  description={
                    <Space>
                      <span>搜索量: {item.search_volume?.toLocaleString()}</span>
                      <span>|</span>
                      <span>竞争: {item.competition_level}</span>
                      <span>|</span>
                      <span>趋势: {item.trend}</span>
                    </Space>
                  }
                />
                <div style={{ color: '#999', fontSize: 12 }}>
                  {new Date(item.research_date).toLocaleString()}
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}

      {!result && history.length === 0 && (
        <Empty description="输入关键词开始分析" style={{ marginTop: 60 }} />
      )}
    </div>
  )
}

export default KeywordResearch
