import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, DatePicker, TimePicker, Tag, Space, Popconfirm, message, Card, Row, Col, Badge } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { contentPlanningAPI } from '../utils/api'
import { PLATFORM_LABEL_MAP, CONTENT_TYPE_LABEL_MAP, CONTENT_STATUS_LABEL_MAP, PLATFORMS, CONTENT_STATUS } from '../utils/constants'

const ContentCalendar = () => {
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
      const response = await contentPlanningAPI.getCalendar()
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
    form.setFieldsValue({
      ...record,
      publish_date: record.publish_date ? dayjs(record.publish_date) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await contentPlanningAPI.deleteCalendarItem(id)
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
        publish_date: values.publish_date?.format('YYYY-MM-DD')
      }

      if (editingItem) {
        await contentPlanningAPI.updateCalendarItem(editingItem.id, submitData)
        message.success('更新成功')
      } else {
        await contentPlanningAPI.createCalendarItem(submitData)
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
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
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
      title: '内容类型',
      dataIndex: 'content_type',
      key: 'content_type',
      width: 100,
      render: (type) => {
        const map = CONTENT_TYPE_LABEL_MAP.find(m => m.value === type)
        return map?.label || type
      }
    },
    {
      title: '主题',
      dataIndex: 'topic',
      key: 'topic',
      width: 120
    },
    {
      title: '发布日期',
      dataIndex: 'publish_date',
      key: 'publish_date',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const s = CONTENT_STATUS[status]
        return <Tag color={s?.color || 'default'}>{s?.label || status}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
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

  const stats = {
    idea: data.filter(d => d.status === 'idea').length,
    planning: data.filter(d => d.status === 'planning').length,
    production: data.filter(d => d.status === 'production').length,
    published: data.filter(d => d.status === 'published').length
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}><CalendarOutlined /> 内容日历</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加内容
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Badge status="default" text="想法" />
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>{stats.idea}</div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Badge status="processing" text="规划中" />
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>{stats.planning}</div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Badge status="warning" text="制作中" />
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>{stats.production}</div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Badge status="success" text="已发布" />
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>{stats.published}</div>
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
        />
      </Card>

      <Modal
        title={editingItem ? '编辑内容' : '添加内容'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入内容标题" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="内容描述" />
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
                name="content_type"
                label="内容类型"
              >
                <Select placeholder="选择类型" options={CONTENT_TYPE_LABEL_MAP} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="topic"
            label="主题"
          >
            <Input placeholder="内容主题" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="publish_date"
                label="发布日期"
                rules={[{ required: true, message: '请选择发布日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="publish_time"
                label="发布时间"
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="选择状态" options={CONTENT_STATUS_LABEL_MAP} />
          </Form.Item>
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select mode="tags" placeholder="输入标签" />
          </Form.Item>
          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={2} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ContentCalendar
