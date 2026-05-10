import React, { useState, useEffect } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Card, Row, Col, Statistic, Tabs, Empty, Space, Divider
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, MoneyCollectOutlined, CalculatorOutlined
} from '@ant-design/icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { monetizationAPI } from '../utils/api'
import { PLATFORM_LABEL_MAP, PLATFORMS, REVENUE_TYPE_LABEL_MAP, REVENUE_TYPES } from '../utils/constants'
import dayjs from 'dayjs'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

const Revenue = () => {
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [priceModalVisible, setPriceModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [priceResult, setPriceResult] = useState(null)
  const [form] = Form.useForm()
  const [priceForm] = Form.useForm()
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [recordsRes, summaryRes] = await Promise.all([
        monetizationAPI.getRevenue(),
        monetizationAPI.getRevenueSummary(period)
      ])
      setRecords(recordsRes.data)
      setSummary(summaryRes.data)
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
    form.setFieldsValue({
      ...record,
      record_date: dayjs(record.record_date)
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await monetizationAPI.deleteRevenue(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        record_date: values.record_date?.format('YYYY-MM-DD')
      }

      if (editingItem) {
        await monetizationAPI.updateRevenue(editingItem.id, submitData)
        message.success('更新成功')
      } else {
        await monetizationAPI.createRevenue(submitData)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleCalculatePrice = async () => {
    try {
      const values = await priceForm.validateFields()
      const response = await monetizationAPI.getPriceRecommendation(values)
      setPriceResult(response.data)
    } catch (error) {
      message.error('计算失败')
    }
  }

  const columns = [
    {
      title: '日期',
      dataIndex: 'record_date',
      key: 'record_date',
      width: 120
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform) => {
        const p = PLATFORMS[platform]
        return <span style={{ color: p?.color }}>{p?.label || platform}</span>
      }
    },
    {
      title: '收益类型',
      dataIndex: 'revenue_type',
      key: 'revenue_type',
      width: 120,
      render: (type) => {
        const map = REVENUE_TYPES[type]
        return map?.label || type
      }
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount, record) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          ¥{amount?.toFixed(2)}
        </span>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const platformChartData = summary?.by_platform
    ? Object.entries(summary.by_platform).map(([key, value]) => ({
        name: PLATFORMS[key]?.label || key,
        value: value
      }))
    : []

  const typeChartData = summary?.by_type
    ? Object.entries(summary.by_type).map(([key, value]) => ({
        name: REVENUE_TYPES[key]?.label || key,
        value: value
      }))
    : []

  const tabItems = [
    {
      key: 'records',
      label: '收益记录',
      icon: <MoneyCollectOutlined />,
      children: (
        <Card
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加记录</Button>}
          className="card-shadow"
        >
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="暂无收益记录" /> }}
          />
        </Card>
      )
    },
    {
      key: 'price',
      label: '报价计算',
      icon: <CalculatorOutlined />,
      children: (
        <div>
          <Card title="智能报价计算器" className="card-shadow" style={{ marginBottom: 24 }}>
            <Form form={priceForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="platform"
                    label="平台"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="选择平台" options={PLATFORM_LABEL_MAP} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="content_type"
                    label="内容类型"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="选择类型"
                      options={[
                        { value: 'video', label: '长视频' },
                        { value: 'short_video', label: '短视频' },
                        { value: 'article', label: '文章' },
                        { value: 'live', label: '直播' }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="follower_count"
                    label="粉丝数"
                    rules={[{ required: true }]}
                  >
                    <InputNumber style={{ width: '100%' }} placeholder="例如：100000" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="engagement_rate"
                    label="平均互动率 (%)"
                    rules={[{ required: true }]}
                  >
                    <InputNumber step="0.1" style={{ width: '100%' }} placeholder="例如：5.0" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" onClick={handleCalculatePrice} block icon={<CalculatorOutlined />}>
                  计算报价
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {priceResult && (
            <Card title="报价结果" className="card-shadow">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Card size="small">
                    <Statistic
                      title="建议报价"
                      value={priceResult.suggested_price}
                      prefix="¥"
                      precision={2}
                      valueStyle={{ color: '#1890ff', fontSize: 32 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small">
                    <Statistic
                      title="最低报价"
                      value={priceResult.min_price}
                      prefix="¥"
                      precision={2}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small">
                    <Statistic
                      title="最高报价"
                      value={priceResult.max_price}
                      prefix="¥"
                      precision={2}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
              </Row>
              <Divider>计算公式</Divider>
              <Card type="inner" size="small">
                <p><strong>公式：</strong>{priceResult.breakdown?.formula}</p>
                <p>
                  <strong>基础价格/千粉：</strong> ¥{priceResult.breakdown?.base_price_per_1000?.toFixed(2)}
                </p>
                <p>
                  <strong>互动率系数：</strong> {priceResult.breakdown?.engagement_multiplier}x
                </p>
                <p>
                  <strong>粉丝量级系数：</strong> {priceResult.breakdown?.tier_factor}x
                </p>
              </Card>
            </Card>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}><MoneyCollectOutlined /> 收益管理</h2>

      {summary && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="本期收益"
                  value={summary.total_amount}
                  prefix="¥"
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="收益记录"
                  value={summary.record_count}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="覆盖平台"
                  value={Object.keys(summary.by_platform || {}).length}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="收益类型"
                  value={Object.keys(summary.by_type || {}).length}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 120, marginBottom: 24 }}
            options={[
              { value: 'week', label: '本周' },
              { value: 'month', label: '本月' },
              { value: 'quarter', label: '本季度' },
              { value: 'year', label: '本年' }
            ]}
          />

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card title="按平台分布" className="card-shadow">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={platformChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `¥${value?.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="按类型分布" className="card-shadow">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `¥${value?.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}

      <Tabs items={tabItems} />

      <Modal
        title={editingItem ? '编辑收益' : '添加收益'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="record_date"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="platform"
                label="平台"
                rules={[{ required: true, message: '请选择平台' }]}
              >
                <Select placeholder="选择平台" options={PLATFORM_LABEL_MAP} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="revenue_type"
                label="收益类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="选择类型" options={REVENUE_TYPE_LABEL_MAP} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="amount"
            label="金额 (元)"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber style={{ width: '100%' }} step="0.01" placeholder="例如：1000.00" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="收益来源描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Revenue
