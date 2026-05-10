import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, message, Card, Statistic, Row, Col, Descriptions, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, BarChartOutlined, EyeOutlined, LikeOutlined, CommentOutlined, ShareAltOutlined } from '@ant-design/icons'
import { contentPlanningAPI } from '../utils/api'
import { PLATFORM_LABEL_MAP, PLATFORMS } from '../utils/constants'

const Competitors = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedCompetitor, setSelectedCompetitor] = useState(null)
  const [competitorData, setCompetitorData] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()
  const [dataForm] = Form.useForm()
  const [addDataModalVisible, setAddDataModalVisible] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await contentPlanningAPI.getCompetitors()
      setData(response.data)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await contentPlanningAPI.deleteCompetitor(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingItem) {
        await contentPlanningAPI.updateCompetitor(editingItem.id, values)
        message.success('更新成功')
      } else {
        await contentPlanningAPI.createCompetitor(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleViewDetail = async (record) => {
    setSelectedCompetitor(record)
    setDetailModalVisible(true)
    try {
      const response = await contentPlanningAPI.getCompetitorData(record.id, { limit: 10 })
      setCompetitorData(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddData = () => {
    dataForm.resetFields()
    setAddDataModalVisible(true)
  }

  const handleSubmitData = async () => {
    try {
      const values = await dataForm.validateFields()
      await contentPlanningAPI.addCompetitorData(selectedCompetitor.id, values)
      message.success('数据添加成功')
      setAddDataModalVisible(false)
      const response = await contentPlanningAPI.getCompetitorData(selectedCompetitor.id, { limit: 10 })
      setCompetitorData(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    {
      title: '账号名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform) => {
        const p = PLATFORMS[platform]
        return <Tag color={p?.color || 'default'}>{p?.label || platform}</Tag>
      }
    },
    {
      title: '垂直领域',
      dataIndex: 'niche',
      key: 'niche',
      width: 150
    },
    {
      title: '最新粉丝数',
      key: 'followers',
      width: 140,
      render: (_, record) => {
        if (record.recent_data) {
          return <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{record.recent_data.follower_count?.toLocaleString()}</span>
        }
        return '-'
      }
    },
    {
      title: '平均互动率',
      key: 'engagement',
      width: 120,
      render: (_, record) => {
        if (record.recent_data) {
          return <span>{record.recent_data.engagement_rate?.toFixed(2)}%</span>
        }
        return '-'
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<BarChartOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const dataColumns = [
    {
      title: '记录日期',
      dataIndex: 'record_date',
      key: 'record_date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: '粉丝数',
      dataIndex: 'follower_count',
      key: 'follower_count',
      render: (v) => v?.toLocaleString()
    },
    {
      title: '平均浏览',
      dataIndex: 'avg_views',
      key: 'avg_views',
      render: (v) => v?.toLocaleString()
    },
    {
      title: '平均点赞',
      dataIndex: 'avg_likes',
      key: 'avg_likes',
      render: (v) => v?.toLocaleString()
    },
    {
      title: '平均评论',
      dataIndex: 'avg_comments',
      key: 'avg_comments',
      render: (v) => v?.toLocaleString()
    },
    {
      title: '平均分享',
      dataIndex: 'avg_shares',
      key: 'avg_shares',
      render: (v) => v?.toLocaleString()
    },
    {
      title: '互动率',
      dataIndex: 'engagement_rate',
      key: 'engagement_rate',
      render: (v) => `${v?.toFixed(2)}%`
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}><TeamOutlined /> 竞品监控</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加竞品
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="监控中竞品"
              value={data.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="覆盖平台数"
              value={new Set(data.map(d => d.platform)).size}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="card-shadow">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="暂无竞品数据，点击右上角添加" /> }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑竞品' : '添加竞品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="账号名称"
            rules={[{ required: true, message: '请输入账号名称' }]}
          >
            <Input placeholder="例如：某某科技" />
          </Form.Item>
          <Form.Item
            name="platform"
            label="平台"
            rules={[{ required: true, message: '请选择平台' }]}
          >
            <Select placeholder="选择平台" options={PLATFORM_LABEL_MAP} />
          </Form.Item>
          <Form.Item
            name="account_url"
            label="账号链接"
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item
            name="niche"
            label="垂直领域"
          >
            <Input placeholder="例如：科技、美妆、美食" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="竞品账号描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="竞品详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="add" type="primary" onClick={handleAddData}>
            添加数据
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedCompetitor && (
          <div>
            <Descriptions column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="账号名称">{selectedCompetitor.name}</Descriptions.Item>
              <Descriptions.Item label="平台">
                <Tag color={PLATFORMS[selectedCompetitor.platform]?.color}>
                  {PLATFORMS[selectedCompetitor.platform]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="垂直领域">{selectedCompetitor.niche || '-'}</Descriptions.Item>
              <Descriptions.Item label="账号链接">{selectedCompetitor.account_url || '-'}</Descriptions.Item>
            </Descriptions>

            {selectedCompetitor.recent_data && (
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} md={6}>
                  <Card size="small">
                    <Statistic
                      title="粉丝数"
                      value={selectedCompetitor.recent_data.follower_count || 0}
                      prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small">
                    <Statistic
                      title="平均浏览"
                      value={selectedCompetitor.recent_data.avg_views || 0}
                      prefix={<EyeOutlined style={{ color: '#52c41a' }} />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small">
                    <Statistic
                      title="平均点赞"
                      value={selectedCompetitor.recent_data.avg_likes || 0}
                      prefix={<LikeOutlined style={{ color: '#faad14' }} />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small">
                    <Statistic
                      title="互动率"
                      value={selectedCompetitor.recent_data.engagement_rate || 0}
                      suffix="%"
                      precision={2}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            <h4>历史数据记录</h4>
            <Table
              columns={dataColumns}
              dataSource={competitorData}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </div>
        )}
      </Modal>

      <Modal
        title="添加竞品数据"
        open={addDataModalVisible}
        onCancel={() => setAddDataModalVisible(false)}
        onOk={handleSubmitData}
      >
        <Form form={dataForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="follower_count" label="粉丝数">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="avg_views" label="平均浏览">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="avg_likes" label="平均点赞">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="avg_comments" label="平均评论">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="avg_shares" label="平均分享">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="engagement_rate" label="互动率 (%)">
                <Input type="number" step="0.1" placeholder="0.0" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default Competitors
