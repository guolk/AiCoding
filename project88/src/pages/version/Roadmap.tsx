import { useState } from 'react'
import {
  Row, Col, Card, Button, Modal, Form, Input, Select, Space, App,
  Table, Tag, DatePicker, Popconfirm, Empty, Timeline, InputNumber
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { useStore } from '../../store'
import type { RoadmapItem } from '../../types'

const priorityColors: Record<string, string> = {
  high: 'red',
  medium: 'orange',
  low: 'blue'
}

const priorityLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低'
}

const statusColors: Record<string, string> = {
  planned: 'default',
  in_progress: 'blue',
  done: 'green',
  delayed: 'orange'
}

const statusLabels: Record<string, string> = {
  planned: '计划中',
  in_progress: '进行中',
  done: '已完成',
  delayed: '延期'
}

export default function Roadmap() {
  const { message } = App.useApp()
  const { roadmapItems, requirements, addRoadmapItem, updateRoadmapItem, deleteRoadmapItem } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: RoadmapItem) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteRoadmapItem(id)
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingItem) {
        updateRoadmapItem(editingItem.id, { ...values })
        message.success('更新成功')
      } else {
        const newItem: RoadmapItem = {
          id: uuidv4(),
          ...values
        }
        addRoadmapItem(newItem)
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const years = [...new Set(roadmapItems.map((r) => r.year))].sort()

  const chartOption = {
    tooltip: { trigger: 'axis' },
    grid: { top: 40, bottom: 40, left: 80, right: 40 },
    xAxis: {
      type: 'category',
      data: ['Q1', 'Q2', 'Q3', 'Q4']
    },
    yAxis: {
      type: 'category',
      data: years.map((y) => `${y}年`)
    },
    series: [{
      type: 'heatmap',
      data: roadmapItems.map((r) => {
        const quarterIndex = { Q1: 0, Q2: 1, Q3: 2, Q4: 3 }[r.quarter] || 0
        const yearIndex = years.indexOf(r.year)
        const color = r.priority === 'high' ? '#ff4d4f' : r.priority === 'medium' ? '#faad14' : '#1677ff'
        return [quarterIndex, yearIndex, 1, r.title, color, r.status]
      }),
      label: {
        show: true,
        formatter: (params: any) => params.data[3],
        color: '#fff'
      },
      itemStyle: {
        color: (params: any) => params.data[4]
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.5)'
        }
      }
    }]
  }

  const columns = [
    { title: '功能名称', dataIndex: 'title', key: 'title', width: 200 },
    {
      title: '季度', dataIndex: 'quarter', key: 'quarter', width: 80,
      render: (v: string) => <Tag color="blue">{v}</Tag>
    },
    { title: '年份', dataIndex: 'year', key: 'year', width: 80 },
    {
      title: '优先级', dataIndex: 'priority', key: 'priority', width: 80,
      render: (v: string) => <Tag color={priorityColors[v]}>{priorityLabels[v]}</Tag>
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag>
    },
    { title: '描述', dataIndex: 'description', key: 'description', width: 200, ellipsis: true },
    {
      title: '关联需求', dataIndex: 'requirementIds', key: 'requirementIds', width: 150,
      render: (ids: string[]) => ids?.map((id) => {
        const r = requirements.find((x) => x.id === id)
        return r ? <Tag key={id}>{r.title.slice(0, 8)}...</Tag> : null
      })
    },
    {
      title: '操作', key: 'action', width: 140, fixed: 'right' as const,
      render: (_: unknown, r: RoadmapItem) => (
        <Space>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const timelineItems = [...roadmapItems]
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      const order: Record<string, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 }
      return (order[a.quarter] || 0) - (order[b.quarter] || 0)
    })
    .map((r) => ({
      color: r.status === 'done' ? 'green' : r.status === 'in_progress' ? 'blue' : 'gray',
      children: (
        <Card size="small" style={{ marginBottom: 4 }}>
          <Space>
            <Tag color={priorityColors[r.priority]}>{priorityLabels[r.priority]}优先级</Tag>
            <Tag color={statusColors[r.status]}>{statusLabels[r.status]}</Tag>
            <strong>{r.title}</strong>
            <span style={{ color: '#999' }}>{r.year} {r.quarter}</span>
          </Space>
          <div style={{ color: '#666', marginTop: 4 }}>{r.description}</div>
        </Card>
      )
    }))

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>产品路线图</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加规划</Button>
      </Row>

      {roadmapItems.length === 0 ? (
        <Empty description="暂无路线图规划" />
      ) : (
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <Card title="路线图时间轴">
              <ReactECharts option={chartOption} style={{ height: 300 }} />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="规划时间线">
              <Timeline items={timelineItems} />
            </Card>
          </Col>
        </Row>
      )}

      <Card title="规划列表" style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          dataSource={roadmapItems}
          columns={columns}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑规划' : '添加规划'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="功能名称" rules={[{ required: true }]}>
            <Input placeholder="请输入功能名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="quarter" label="季度" rules={[{ required: true }]}>
                <Select placeholder="请选择季度">
                  <Select.Option value="Q1">Q1</Select.Option>
                  <Select.Option value="Q2">Q2</Select.Option>
                  <Select.Option value="Q3">Q3</Select.Option>
                  <Select.Option value="Q4">Q4</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="year" label="年份" rules={[{ required: true }]}>
                <InputNumber min={2024} max={2030} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
                <Select placeholder="请选择优先级">
                  <Select.Option value="high">高</Select.Option>
                  <Select.Option value="medium">中</Select.Option>
                  <Select.Option value="low">低</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select placeholder="请选择状态">
                  <Select.Option value="planned">计划中</Select.Option>
                  <Select.Option value="in_progress">进行中</Select.Option>
                  <Select.Option value="done">已完成</Select.Option>
                  <Select.Option value="delayed">延期</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="描述" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="功能描述" />
          </Form.Item>
          <Form.Item name="requirementIds" label="关联需求">
            <Select mode="multiple" placeholder="选择关联的需求">
              {requirements.map((r) => (
                <Select.Option key={r.id} value={r.id}>{r.title}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
