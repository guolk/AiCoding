import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, Tag, Space, App,
  Row, Col, Card, Slider, Statistic, Divider, Tooltip, Popconfirm
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, BulbOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useStore } from '../../store'
import type { Requirement, Channel, KanoType, RequirementStatus } from '../../types'

const channelLabels: Record<Channel, string> = {
  interview: '用户访谈',
  survey: '用户问卷',
  ticket: '客服工单',
  competitor: '竞品对标'
}

const channelColors: Record<Channel, string> = {
  interview: 'green',
  survey: 'blue',
  ticket: 'orange',
  competitor: 'purple'
}

const kanoLabels: Record<KanoType, string> = {
  must: '必备需求',
  expected: '期望需求',
  excited: '兴奋需求',
  indifferent: '无差异需求',
  reverse: '反向需求'
}

const kanoColors: Record<KanoType, string> = {
  must: 'red',
  expected: 'orange',
  excited: 'green',
  indifferent: 'default',
  reverse: 'magenta'
}

const statusLabels: Record<RequirementStatus, string> = {
  pending: '待处理',
  kano_classified: 'KANO已分类',
  rice_scored: 'RICE已评分',
  planned: '已规划',
  developing: '开发中',
  done: '已完成'
}

export default function RequirementList() {
  const { message } = App.useApp()
  const { requirements, addRequirement, updateRequirement, deleteRequirement } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [kanoModalOpen, setKanoModalOpen] = useState(false)
  const [riceModalOpen, setRiceModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Requirement | null>(null)
  const [kanoItem, setKanoItem] = useState<Requirement | null>(null)
  const [riceItem, setRiceItem] = useState<Requirement | null>(null)
  const [form] = Form.useForm()
  const [kanoForm] = Form.useForm()
  const [riceForm] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: Requirement) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteRequirement(id)
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString()
      if (editingItem) {
        updateRequirement(editingItem.id, { ...values, updatedAt: now })
        message.success('更新成功')
      } else {
        const newItem: Requirement = {
          id: uuidv4(),
          ...values,
          createdAt: now,
          updatedAt: now,
          status: 'pending',
          kanoType: null,
          kanoReason: '',
          rice: null,
          tags: values.tags || []
        }
        addRequirement(newItem)
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const handleKanoSubmit = () => {
    if (!kanoItem) return
    kanoForm.validateFields().then((values) => {
      updateRequirement(kanoItem.id, {
        kanoType: values.kanoType,
        kanoReason: values.kanoReason,
        status: 'kano_classified',
        updatedAt: new Date().toISOString()
      })
      message.success('KANO分类成功')
      setKanoModalOpen(false)
    })
  }

  const handleRiceSubmit = () => {
    if (!riceItem) return
    riceForm.validateFields().then((values) => {
      const { reach, impact, confidence, effort } = values
      const score = +((reach * impact * confidence) / effort).toFixed(2)
      updateRequirement(riceItem.id, {
        rice: { reach, impact, confidence, effort, score },
        status: 'rice_scored',
        updatedAt: new Date().toISOString()
      })
      message.success('RICE评分成功')
      setRiceModalOpen(false)
    })
  }

  const columns = [
    { title: '需求标题', dataIndex: 'title', key: 'title', width: 200, fixed: 'left' as const },
    {
      title: '来源渠道', dataIndex: 'channel', key: 'channel', width: 100,
      render: (v: Channel) => <Tag color={channelColors[v]}>{channelLabels[v]}</Tag>
    },
    { title: '来源详情', dataIndex: 'source', key: 'source', width: 150 },
    {
      title: 'KANO分类', dataIndex: 'kanoType', key: 'kanoType', width: 110,
      render: (v: KanoType | null) => v
        ? <Tag color={kanoColors[v]}>{kanoLabels[v]}</Tag>
        : <Tag>未分类</Tag>
    },
    {
      title: 'RICE评分', key: 'rice', width: 120,
      render: (_: unknown, r: Requirement) => r.rice
        ? <span style={{ fontWeight: 600, color: r.rice.score >= 5 ? '#52c41a' : r.rice.score >= 2 ? '#faad14' : '#ff4d4f' }}>
            {r.rice.score}
          </span>
        : <Tag>未评分</Tag>
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 120,
      render: (v: RequirementStatus) => <Tag color="blue">{statusLabels[v]}</Tag>
    },
    {
      title: '标签', dataIndex: 'tags', key: 'tags', width: 150,
      render: (tags: string[]) => tags?.map((t) => <Tag key={t}>{t}</Tag>)
    },
    {
      title: '操作', key: 'action', width: 260, fixed: 'right' as const,
      render: (_: unknown, r: Requirement) => (
        <Space>
          <Tooltip title="KANO分类">
            <Button size="small" type="link" icon={<BulbOutlined />} onClick={() => { setKanoItem(r); kanoForm.setFieldsValue({ kanoType: r.kanoType, kanoReason: r.kanoReason }); setKanoModalOpen(true) }}>KANO</Button>
          </Tooltip>
          <Tooltip title="RICE评分">
            <Button size="small" type="link" onClick={() => { setRiceItem(r); riceForm.setFieldsValue(r.rice || {}); setRiceModalOpen(true) }}>RICE</Button>
          </Tooltip>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const pendingCount = requirements.filter((r) => r.status === 'pending').length
  const kanoCount = requirements.filter((r) => r.kanoType !== null).length
  const riceCount = requirements.filter((r) => r.rice !== null).length

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>需求管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加需求</Button>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="待处理" value={pendingCount} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="KANO已分类" value={kanoCount} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="RICE已评分" value={riceCount} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>

      <Table
        rowKey="id"
        dataSource={requirements}
        columns={columns}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Modal
        title={editingItem ? '编辑需求' : '添加需求'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="需求标题" rules={[{ required: true, message: '请输入需求标题' }]}>
            <Input placeholder="请输入需求标题" />
          </Form.Item>
          <Form.Item name="description" label="需求描述" rules={[{ required: true, message: '请输入需求描述' }]}>
            <Input.TextArea rows={3} placeholder="请输入需求描述" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="channel" label="来源渠道" rules={[{ required: true, message: '请选择来源渠道' }]}>
                <Select placeholder="请选择来源渠道">
                  {Object.entries(channelLabels).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="source" label="来源详情" rules={[{ required: true, message: '请输入来源详情' }]}>
                <Input placeholder="如：用户姓名/工单编号等" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后回车" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="KANO模型分类" open={kanoModalOpen} onOk={handleKanoSubmit} onCancel={() => setKanoModalOpen(false)} width={500}>
        <Form form={kanoForm} layout="vertical">
          <Form.Item name="kanoType" label="KANO分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择KANO分类">
              {Object.entries(kanoLabels).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="kanoReason" label="分类理由">
            <Input.TextArea rows={3} placeholder="请说明分类的理由" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="RICE优先级评分" open={riceModalOpen} onOk={handleRiceSubmit} onCancel={() => setRiceModalOpen(false)} width={560}>
        <Form form={riceForm} layout="vertical">
          <Divider orientation="left">影响范围 (Reach) - 影响多少用户</Divider>
          <Form.Item name="reach" label="1-5分" rules={[{ required: true }]} initialValue={3}>
            <Slider min={1} max={5} marks={{ 1: '极少', 3: '中等', 5: '大量' }} />
          </Form.Item>
          <Divider orientation="left">影响程度 (Impact) - 对用户影响多大</Divider>
          <Form.Item name="impact" label="1-5分" rules={[{ required: true }]} initialValue={3}>
            <Slider min={1} max={5} marks={{ 1: '微乎其微', 3: '中等', 5: '巨大影响' }} />
          </Form.Item>
          <Divider orientation="left">信心程度 (Confidence) - 对评分的把握</Divider>
          <Form.Item name="confidence" label="1-5分" rules={[{ required: true }]} initialValue={3}>
            <Slider min={1} max={5} marks={{ 1: '猜测', 3: '中等', 5: '非常确定' }} />
          </Form.Item>
          <Divider orientation="left">工作量 (Effort) - 需要投入多少</Divider>
          <Form.Item name="effort" label="1-5分" rules={[{ required: true }]} initialValue={3}>
            <Slider min={1} max={5} marks={{ 1: '极少', 3: '中等', 5: '巨大' }} />
          </Form.Item>
          <Card size="small" style={{ background: '#f6ffed' }}>
            <Statistic
              title="综合得分 = (Reach × Impact × Confidence) / Effort"
              value={(() => {
                const r = riceForm.getFieldValue('reach') || 0
                const i = riceForm.getFieldValue('impact') || 0
                const c = riceForm.getFieldValue('confidence') || 0
                const e = riceForm.getFieldValue('effort') || 1
                return e > 0 ? ((r * i * c) / e).toFixed(2) : 0
              })()}
              valueStyle={{ fontSize: 32, color: '#52c41a' }}
            />
          </Card>
        </Form>
      </Modal>
    </div>
  )
}
