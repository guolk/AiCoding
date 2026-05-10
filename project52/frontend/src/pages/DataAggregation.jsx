import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Card, Row, Col, Statistic, Empty, Divider, Tabs, List, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined, UserOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { dataAggregationAPI } from '../utils/api'
import { PLATFORM_LABEL_MAP, PLATFORMS, CONTENT_TYPE_LABEL_MAP } from '../utils/constants'

const DataAggregation = () => {
  const [accounts, setAccounts] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(false)
  const [accountModalVisible, setAccountModalVisible] = useState(false)
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [accountForm] = Form.useForm()
  const [analyticsForm] = Form.useForm()
  const [performanceData, setPerformanceData] = useState([])

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const response = await dataAggregationAPI.getAccounts()
      setAccounts(response.data)
      
      for (const account of response.data) {
        try {
          const anaResponse = await dataAggregationAPI.getAnalytics(account.id)
          setAnalytics(prev => ({ ...prev, [account.id]: anaResponse.data }))
        } catch (e) {
          console.error(e)
        }
      }

      const perfResponse = await dataAggregationAPI.getContentPerformance()
      setPerformanceData(perfResponse.data)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = () => {
    setEditingAccount(null)
    accountForm.resetFields()
    setAccountModalVisible(true)
  }

  const handleEditAccount = (account) => {
    setEditingAccount(account)
    accountForm.setFieldsValue(account)
    setAccountModalVisible(true)
  }

  const handleDeleteAccount = async (id) => {
    try {
      await dataAggregationAPI.deleteAccount(id)
      message.success('删除成功')
      fetchAccounts()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmitAccount = async () => {
    try {
      const values = await accountForm.validateFields()

      if (editingAccount) {
        await dataAggregationAPI.updateAccount(editingAccount.id, values)
        message.success('更新成功')
      } else {
        await dataAggregationAPI.createAccount(values)
        message.success('创建成功')
      }
      setAccountModalVisible(false)
      fetchAccounts()
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddAnalytics = (account) => {
    setSelectedAccount(account)
    analyticsForm.resetFields()
    setAnalyticsModalVisible(true)
  }

  const handleSubmitAnalytics = async () => {
    try {
      const values = await analyticsForm.validateFields()
      const submitData = {
        ...values,
        date: values.date?.format('YYYY-MM-DD')
      }

      await dataAggregationAPI.addAnalytics(selectedAccount.id, submitData)
      message.success('数据添加成功')
      setAnalyticsModalVisible(false)
      fetchAccounts()
    } catch (error) {
      console.error(error)
    }
  }

  const accountColumns = [
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
      title: '账号名称',
      dataIndex: 'account_name',
      key: 'account_name'
    },
    {
      title: '账号链接',
      dataIndex: 'account_url',
      key: 'account_url',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (active) => <Tag color={active ? 'green' : 'red'}>{active ? '活跃' : '不活跃'}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="link"
            size="small"
            icon={<PlusCircleOutlined />}
            onClick={() => handleAddAnalytics(record)}
          >
            添加数据
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditAccount(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAccount(record.id)}
          >
            删除
          </Button>
        </div>
      )
    }
  ]

  const renderAccountChart = (account) => {
    const data = analytics[account.id] || []
    if (data.length === 0) {
      return <Empty description="暂无数据" />
    }

    const chartData = data.map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString()
    }))

    return (
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="follower_count" stroke="#1890ff" fill="#1890ff" fillOpacity={0.3} name="粉丝数" />
          <Area type="monotone" dataKey="total_views" stroke="#52c41a" fill="#52c41a" fillOpacity={0.3} name="浏览量" />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  const performanceColumns = [
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
      render: (platform) => {
        const p = PLATFORMS[platform]
        return <Tag color={p?.color || 'default'}>{p?.label || platform}</Tag>
      }
    },
    {
      title: '发布日期',
      dataIndex: 'publish_date',
      key: 'publish_date',
      width: 120
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
      title: '评论',
      dataIndex: 'comments',
      key: 'comments',
      render: (v) => v?.toLocaleString()
    },
    {
      title: '分享',
      dataIndex: 'shares',
      key: 'shares',
      render: (v) => v?.toLocaleString()
    },
    {
      title: '互动率',
      dataIndex: 'engagement_rate',
      key: 'engagement_rate',
      render: (v) => `${v?.toFixed(2)}%`
    },
    {
      title: '完播率',
      dataIndex: 'completion_rate',
      key: 'completion_rate',
      render: (v) => `${v?.toFixed(2)}%`
    }
  ]

  const tabItems = [
    {
      key: 'accounts',
      label: '平台账号',
      icon: <UserOutlined />,
      children: (
        <>
          <Card
            title="我的平台账号"
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAddAccount}>添加账号</Button>}
            className="card-shadow"
            style={{ marginBottom: 24 }}
          >
            <Table
              columns={accountColumns}
              dataSource={accounts}
              rowKey="id"
              loading={loading}
              pagination={false}
              locale={{ emptyText: <Empty description="暂无平台账号，请添加" /> }}
            />
          </Card>

          <Divider />

          <h3 style={{ marginBottom: 16 }}>各平台数据趋势</h3>
          <Row gutter={[16, 16]}>
            {accounts.map(account => (
              <Col key={account.id} xs={24} lg={12}>
                <Card
                  title={PLATFORMS[account.platform]?.label || account.platform}
                  size="small"
                  className="card-shadow"
                >
                  {renderAccountChart(account)}
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )
    },
    {
      key: 'performance',
      label: '内容表现',
      icon: <BarChartOutlined />,
      children: (
        <Card title="内容表现数据" className="card-shadow">
          <Table
            columns={performanceColumns}
            dataSource={performanceData}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="暂无内容表现数据" /> }}
          />
        </Card>
      )
    }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}><BarChartOutlined /> 多平台数据聚合</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="已绑定平台"
              value={accounts.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="覆盖平台数"
              value={new Set(accounts.map(a => a.platform)).size}
            />
          </Card>
        </Col>
      </Row>

      <Tabs items={tabItems} />

      <Modal
        title={editingAccount ? '编辑平台账号' : '添加平台账号'}
        open={accountModalVisible}
        onCancel={() => setAccountModalVisible(false)}
        onOk={handleSubmitAccount}
        width={500}
      >
        <Form form={accountForm} layout="vertical">
          <Form.Item
            name="platform"
            label="平台"
            rules={[{ required: true, message: '请选择平台' }]}
          >
            <Select placeholder="选择平台" options={PLATFORM_LABEL_MAP} />
          </Form.Item>
          <Form.Item
            name="account_name"
            label="账号名称"
          >
            <Input placeholder="账号名称" />
          </Form.Item>
          <Form.Item
            name="account_url"
            label="账号链接"
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item
            name="api_key"
            label="API Key (可选)"
          >
            <Input placeholder="API Key" />
          </Form.Item>
          <Form.Item
            name="api_secret"
            label="API Secret (可选)"
          >
            <Input.Password placeholder="API Secret" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加每日数据"
        open={analyticsModalVisible}
        onCancel={() => setAnalyticsModalVisible(false)}
        onOk={handleSubmitAnalytics}
        width={600}
      >
        <Form form={analyticsForm} layout="vertical">
          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="follower_count" label="粉丝总数">
                <InputNumber style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="follower_gain" label="新增粉丝">
                <InputNumber style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="total_views" label="总浏览量">
                <InputNumber style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="total_likes" label="总点赞">
                <InputNumber style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="total_comments" label="总评论">
                <InputNumber style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="total_shares" label="总分享">
                <InputNumber style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="avg_engagement_rate" label="平均互动率 (%)">
                <InputNumber style={{ width: '100%' }} step="0.1" placeholder="0.0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="revenue" label="收益 (元)">
                <InputNumber style={{ width: '100%' }} step="0.01" placeholder="0.00" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default DataAggregation
