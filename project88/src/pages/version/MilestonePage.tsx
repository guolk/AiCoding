import { useState } from 'react'
import {
  Row, Col, Card, Button, Modal, Form, Input, Select, Space, App,
  Table, Tag, DatePicker, Popconfirm, Empty, Progress, Timeline, Statistic
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FlagOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { useStore } from '../../store'
import type { Milestone } from '../../types'

const statusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'blue',
  done: 'green',
  delayed: 'orange'
}

const statusLabels: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  done: '已完成',
  delayed: '延期'
}

export default function MilestonePage() {
  const { message } = App.useApp()
  const { milestones, roadmapItems, addMilestone, updateMilestone, deleteMilestone } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Milestone | null>(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: Milestone) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : undefined
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMilestone(id)
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const dateStr = values.date ? values.date.format('YYYY-MM-DD') : ''
      if (editingItem) {
        updateMilestone(editingItem.id, { ...values, date: dateStr })
        message.success('更新成功')
      } else {
        const newItem: Milestone = {
          id: uuidv4(),
          ...values,
          date: dateStr
        }
        addMilestone(newItem)
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const totalCount = milestones.length
  const doneCount = milestones.filter((m) => m.status === 'done').length
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const timelineItems = [...milestones]
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
    .map((m) => {
      const rm = roadmapItems.find((r) => r.id === m.roadmapItemId)
      return {
        color: m.status === 'done' ? 'green' : m.status === 'in_progress' ? 'blue' : m.status === 'delayed' ? 'orange' : 'gray',
        children: (
          <Card size="small" style={{ marginBottom: 4 }}>
            <Space>
              <Tag color={statusColors[m.status]}>{statusLabels[m.status]}</Tag>
              <strong>{m.title}</strong>
              <Tag color="purple">{m.version}</Tag>
              <span style={{ color: '#999' }}>{m.date}</span>
            </Space>
            <div style={{ color: '#666', marginTop: 4 }}>
              交付物: {m.deliverables}
              {rm && <span style={{ marginLeft: 8, color: '#1677ff' }}>[{rm.title}]</span>}
            </div>
          </Card>
        )
      }
    })

  const columns = [
    { title: '里程碑名称', dataIndex: 'title', key: 'title', width: 180 },
    { title: '版本号', dataIndex: 'version', key: 'version', width: 100 },
    { title: '计划日期', dataIndex: 'date', key: 'date', width: 120 },
    { title: '交付物', dataIndex: 'deliverables', key: 'deliverables', width: 200, ellipsis: true },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag>
    },
    {
      title: '关联路线图', dataIndex: 'roadmapItemId', key: 'roadmapItemId', width: 150,
      render: (id: string) => {
        const rm = roadmapItems.find((r) => r.id === id)
        return rm ? <Tag color="blue">{rm.title}</Tag> : '-'
      }
    },
    {
      title: '操作', key: 'action', width: 140, fixed: 'right' as const,
      render: (_: unknown, r: Milestone) => (
        <Space>
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
        <h2 style={{ margin: 0 }}>里程碑追踪</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加里程碑</Button>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic title="总里程碑" value={totalCount} prefix={<FlagOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic title="已完成" value={doneCount} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small">
            <div style={{ marginBottom: 8 }}>整体进度</div>
            <Progress percent={progressPercent} status={progressPercent === 100 ? 'success' : 'active'} />
          </Card>
        </Col>
      </Row>

      {milestones.length === 0 ? (
        <Empty description="暂无里程碑" />
      ) : (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="里程碑时间线">
              <Timeline items={timelineItems} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="里程碑列表">
              <Table
                rowKey="id"
                dataSource={milestones}
                columns={columns}
                size="small"
                scroll={{ x: 900 }}
                pagination={{ pageSize: 8, showSizeChanger: true }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Modal
        title={editingItem ? '编辑里程碑' : '添加里程碑'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="title" label="里程碑名称" rules={[{ required: true }]}>
                <Input placeholder="请输入里程碑名称" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="version" label="版本号" rules={[{ required: true }]}>
                <Input placeholder="如：v1.0" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="计划日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select placeholder="请选择状态">
                  <Select.Option value="pending">待开始</Select.Option>
                  <Select.Option value="in_progress">进行中</Select.Option>
                  <Select.Option value="done">已完成</Select.Option>
                  <Select.Option value="delayed">延期</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="deliverables" label="交付物" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="请描述交付物" />
          </Form.Item>
          <Form.Item name="roadmapItemId" label="关联路线图项">
            <Select placeholder="选择关联的路线图项">
              {roadmapItems.map((r) => (
                <Select.Option key={r.id} value={r.id}>{r.title}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
