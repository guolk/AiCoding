import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, Tag, Space, App,
  Card, Descriptions, DatePicker, Popconfirm, Row, Col
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useStore } from '../../store'
import type { Interview } from '../../types'

export default function InterviewList() {
  const { message } = App.useApp()
  const { interviews, addInterview, updateInterview, deleteInterview } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Interview | null>(null)
  const [detailItem, setDetailItem] = useState<Interview | null>(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: Interview) => {
    setEditingItem(record)
    form.setFieldsValue({ ...record, date: record.date ? record.date : undefined })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteInterview(id)
    message.success('删除成功')
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const now = new Date().toISOString()
      const dateStr = values.date ? values.date.format('YYYY-MM-DD') : ''
      if (editingItem) {
        updateInterview(editingItem.id, { ...values, date: dateStr })
        message.success('更新成功')
      } else {
        const newItem: Interview = {
          id: uuidv4(),
          ...values,
          date: dateStr,
          createdAt: now,
          tags: values.tags || []
        }
        addInterview(newItem)
        message.success('添加成功')
      }
      setIsModalOpen(false)
    } catch {
      message.error('请检查表单填写是否完整')
    }
  }

  const columns = [
    { title: '访谈对象', dataIndex: 'userName', key: 'userName', width: 120 },
    { title: '用户角色', dataIndex: 'userRole', key: 'userRole', width: 150 },
    { title: '访谈日期', dataIndex: 'date', key: 'date', width: 120 },
    {
      title: '关键洞察', dataIndex: 'insights', key: 'insights', width: 300,
      ellipsis: true
    },
    {
      title: '标签', dataIndex: 'tags', key: 'tags', width: 150,
      render: (tags: string[]) => tags?.map((t) => <Tag key={t} color="blue">{t}</Tag>)
    },
    {
      title: '操作', key: 'action', width: 200, fixed: 'right' as const,
      render: (_: unknown, r: Interview) => (
        <Space>
          <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => { setDetailItem(r); setDetailOpen(true) }}>查看</Button>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>访谈记录管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加访谈</Button>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <span style={{ color: '#666' }}>
          四段式记录法：<Tag color="blue">背景</Tag> → <Tag color="green">问题</Tag> → <Tag color="orange">金句引用</Tag> → <Tag color="purple">洞察</Tag>
        </span>
      </Card>

      <Table
        rowKey="id"
        dataSource={interviews}
        columns={columns}
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Modal
        title={editingItem ? '编辑访谈记录' : '添加访谈记录'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="userName" label="访谈对象" rules={[{ required: true }]}>
                <Input placeholder="请输入用户姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="userRole" label="用户角色" rules={[{ required: true }]}>
                <Input placeholder="请输入用户角色" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="date" label="访谈日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Card size="small" title="1. 背景" style={{ marginBottom: 12 }}>
            <Form.Item name="background" rules={[{ required: true, message: '请输入背景信息' }]} style={{ marginBottom: 0 }}>
              <Input.TextArea rows={2} placeholder="用户的基本背景信息" />
            </Form.Item>
          </Card>
          <Card size="small" title="2. 问题" style={{ marginBottom: 12 }}>
            <Form.Item name="questions" rules={[{ required: true, message: '请输入访谈问题' }]} style={{ marginBottom: 0 }}>
              <Input.TextArea rows={2} placeholder="访谈的主要问题" />
            </Form.Item>
          </Card>
          <Card size="small" title="3. 金句引用" style={{ marginBottom: 12 }}>
            <Form.Item name="quotes" rules={[{ required: true, message: '请输入金句引用' }]} style={{ marginBottom: 0 }}>
              <Input.TextArea rows={2} placeholder="用户说过的有代表性的话" />
            </Form.Item>
          </Card>
          <Card size="small" title="4. 洞察" style={{ marginBottom: 12 }}>
            <Form.Item name="insights" rules={[{ required: true, message: '请输入洞察' }]} style={{ marginBottom: 0 }}>
              <Input.TextArea rows={2} placeholder="从访谈中提炼的洞察" />
            </Form.Item>
          </Card>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后回车" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="访谈详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={700}
      >
        {detailItem && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="访谈对象">{detailItem.userName}</Descriptions.Item>
            <Descriptions.Item label="用户角色">{detailItem.userRole}</Descriptions.Item>
            <Descriptions.Item label="访谈日期">{detailItem.date}</Descriptions.Item>
            <Descriptions.Item label="标签">
              {detailItem.tags?.map((t) => <Tag key={t} color="blue">{t}</Tag>)}
            </Descriptions.Item>
            <Descriptions.Item label="背景"><div style={{ whiteSpace: 'pre-wrap' }}>{detailItem.background}</div></Descriptions.Item>
            <Descriptions.Item label="问题"><div style={{ whiteSpace: 'pre-wrap' }}>{detailItem.questions}</div></Descriptions.Item>
            <Descriptions.Item label="金句引用">
              <div style={{ whiteSpace: 'pre-wrap', color: '#1677ff', fontStyle: 'italic' }}>{detailItem.quotes}</div>
            </Descriptions.Item>
            <Descriptions.Item label="洞察"><div style={{ whiteSpace: 'pre-wrap' }}>{detailItem.insights}</div></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
