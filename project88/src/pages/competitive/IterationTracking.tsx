import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, Space, App,
  Card, Row, Col, DatePicker, Popconfirm, Tag, Timeline
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { useStore } from '../../store'
import type { CompetitorVersion } from '../../types'

export default function IterationTracking() {
  const { message } = App.useApp()
  const { competitorVersions, competitors, addVersion, updateVersion, deleteVersion } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CompetitorVersion | null>(null)
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | undefined>()
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: CompetitorVersion) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : undefined
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteVersion(id)
    message.success('删除成功')
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const dateStr = values.date ? values.date.format('YYYY-MM-DD') : ''
      if (editingItem) {
        updateVersion(editingItem.id, { ...values, date: dateStr })
        message.success('更新成功')
      } else {
        const newItem: CompetitorVersion = {
          id: uuidv4(),
          ...values,
          date: dateStr
        }
        addVersion(newItem)
        message.success('添加成功')
      }
      setIsModalOpen(false)
    } catch {
      message.error('请检查表单填写是否完整')
    }
  }

  const filteredVersions = selectedCompetitor
    ? competitorVersions.filter((v) => v.competitorId === selectedCompetitor)
    : competitorVersions

  const timelineData = [...filteredVersions]
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    .map((v) => {
      const comp = competitors.find((c) => c.id === v.competitorId)
      return {
        color: comp?.id === 'com-1' ? 'blue' : comp?.id === 'com-2' ? 'green' : 'orange',
        children: (
          <Card size="small" style={{ marginBottom: 8 }}>
            <Row justify="space-between" align="middle">
              <span>
                <Tag color="blue">{comp?.name}</Tag>
                <strong>{v.version}</strong>
                <span style={{ color: '#999', marginLeft: 8 }}>{v.date}</span>
              </span>
            </Row>
            <div style={{ marginTop: 8 }}>
              <div><strong>变更内容：</strong>{v.changes}</div>
              <div style={{ color: '#666' }}><strong>影响评估：</strong>{v.impact}</div>
            </div>
          </Card>
        )
      }
    })

  const columns = [
    {
      title: '竞品', dataIndex: 'competitorId', key: 'competitorId', width: 120,
      render: (id: string) => {
        const c = competitors.find((x) => x.id === id)
        return c ? <Tag color="blue">{c.name}</Tag> : id
      }
    },
    { title: '版本号', dataIndex: 'version', key: 'version', width: 120 },
    { title: '发布日期', dataIndex: 'date', key: 'date', width: 120 },
    { title: '变更内容', dataIndex: 'changes', key: 'changes', width: 250, ellipsis: true },
    { title: '影响评估', dataIndex: 'impact', key: 'impact', width: 200, ellipsis: true },
    {
      title: '操作', key: 'action', width: 160, fixed: 'right' as const,
      render: (_: unknown, r: CompetitorVersion) => (
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
        <h2 style={{ margin: 0 }}>竞品迭代追踪</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>记录迭代</Button>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <span>筛选竞品：</span>
          <Select
            placeholder="全部竞品"
            allowClear
            style={{ width: 200 }}
            value={selectedCompetitor}
            onChange={setSelectedCompetitor}
          >
            {competitors.map((c) => (
              <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="迭代时间线" size="small">
            {timelineData.length > 0 ? <Timeline items={timelineData} /> : <div style={{ color: '#999' }}>暂无数据</div>}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="迭代记录列表" size="small">
            <Table
              rowKey="id"
              dataSource={filteredVersions}
              columns={columns}
              size="small"
              scroll={{ x: 800 }}
              pagination={{ pageSize: 8, showSizeChanger: true }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingItem ? '编辑迭代记录' : '记录迭代'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="competitorId" label="竞品" rules={[{ required: true }]}>
                <Select placeholder="请选择竞品">
                  {competitors.map((c) => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="version" label="版本号" rules={[{ required: true }]}>
                <Input placeholder="如：v2.0" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="date" label="发布日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="changes" label="变更内容" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="详细描述本次版本更新的内容" />
          </Form.Item>
          <Form.Item name="impact" label="影响评估" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="评估本次更新对市场和我们的影响" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
