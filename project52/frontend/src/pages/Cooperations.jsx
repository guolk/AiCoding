import React, { useState, useEffect } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Card, Row, Col, Statistic, Tag, Space, Popconfirm, Empty
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, FileTextOutlined
} from '@ant-design/icons'
import { monetizationAPI } from '../utils/api'
import { PLATFORM_LABEL_MAP, PLATFORMS, CONTENT_TYPE_LABEL_MAP } from '../utils/constants'
import dayjs from 'dayjs'

const statusColors = {
  pending: 'default',
  negotiating: 'processing',
  confirmed: 'blue',
  in_progress: 'orange',
  completed: 'green',
  cancelled: 'red'
}

const statusLabels = {
  pending: '待联系',
  negotiating: '洽谈中',
  confirmed: '已确认',
  in_progress: '执行中',
  completed: '已完成',
  cancelled: '已取消'
}

const Cooperations = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await monetizationAPI.getCooperations()
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
    form.setFieldsValue({
      status: 'pending'
    })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await monetizationAPI.deleteCooperation(id)
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
        start_date: values.start_date?.format('YYYY-MM-DD'),
        end_date: values.end_date?.format('YYYY-MM-DD')
      }

      if (editingItem) {
        await monetizationAPI.updateCooperation(editingItem.id, submitData)
        message.success('更新成功')
      } else {
        await monetizationAPI.createCooperation(submitData)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    {
      title: '客户名称',
      dataIndex: 'client_name',
      key: 'client_name'
    },
    {
      title: '项目名称',
      dataIndex: 'project_name',
      key: 'project_name'
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
      render: (platform) => {
        if (!platform) return '-'
        const p = PLATFORMS[platform]
        return <span style={{ color: p?.color }}>{p?.label || platform}</span>
      }
    },
    {
      title: '内容类型',
      dataIndex: 'content_type',
      key: 'content_type',
      width: 100,
      render: (type) => {
        if (!type) return '-'
        const map = CONTENT_TYPE_LABEL_MAP.find(m => m.value === type)
        return map?.label || type
      }
    },
    {
      title: '报价',
      dataIndex: 'quoted_price',
      key: 'quoted_price',
      width: 120,
      render: (price) => `¥${price?.toLocaleString()}`
    },
    {
      title: '成交价',
      dataIndex: 'agreed_price',
      key: 'agreed_price',
      width: 120,
      render: (price, record) => {
        if (!price) return '-'
        return (
          <span style={{ color: price > record.quoted_price ? '#52c41a' : '#1890ff' }}>
            ¥{price?.toLocaleString()}
          </span>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      )
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

  const totalQuoted = data.reduce((sum, item) => sum + (item.quoted_price || 0), 0)
  const totalAgreed = data.reduce((sum, item) => sum + (item.agreed_price || 0), 0)

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}><TeamOutlined /> 商业合作</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="合作项目"
              value={data.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="总报价"
              value={totalQuoted}
              prefix="¥"
              precision={0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="总成交价"
              value={totalAgreed}
              prefix="¥"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="进行中"
              value={data.filter(d => ['pending', 'negotiating', 'confirmed', 'in_progress'].includes(d.status)).length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加合作</Button>}
        className="card-shadow"
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="暂无合作项目" /> }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑合作' : '添加合作'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="client_name"
                label="客户名称"
                rules={[{ required: true, message: '请输入客户名称' }]}
              >
                <Input placeholder="例如：某某科技公司" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="client_contact" label="联系方式">
                <Input placeholder="联系人/电话/微信" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="project_name" label="项目名称">
            <Input placeholder="项目名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="platform" label="平台">
                <Select placeholder="选择平台" options={PLATFORM_LABEL_MAP} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="content_type" label="内容类型">
                <Select placeholder="选择类型" options={CONTENT_TYPE_LABEL_MAP} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="follower_count" label="粉丝数">
                <InputNumber style={{ width: '100%' }} placeholder="用于报价参考" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="engagement_rate" label="互动率 (%)">
                <InputNumber step="0.1" style={{ width: '100%' }} placeholder="用于报价参考" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="quoted_price" label="报价 (元)">
                <InputNumber style={{ width: '100%' }} placeholder="你报的价格" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="agreed_price" label="成交价 (元)">
                <InputNumber style={{ width: '100%' }} placeholder="最终成交价格" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="start_date" label="开始日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="end_date" label="结束日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="选择状态"
              options={Object.entries(statusLabels).map(([key, label]) => ({
                value: key,
                label
              }))}
            />
          </Form.Item>
          <Form.Item name="contract_file" label="合同文件">
            <Input placeholder="合同文件路径或链接" />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={3} placeholder="合作详情、要求等" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Cooperations
