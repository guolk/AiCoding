import { useState } from 'react'
import {
  Row, Col, Card, Button, Modal, Form, Input, Select, Space, App,
  Table, Tag, DatePicker, Popconfirm, Empty, Descriptions
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { useStore } from '../../store'
import type { EffectRecord } from '../../types'

export default function EffectTracking() {
  const { message } = App.useApp()
  const { effectRecords, roadmapItems, addEffectRecord, updateEffectRecord, deleteEffectRecord } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EffectRecord | null>(null)
  const [detailItem, setDetailItem] = useState<EffectRecord | null>(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: EffectRecord) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      launchDate: record.launchDate ? dayjs(record.launchDate) : undefined
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteEffectRecord(id)
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const dateStr = values.launchDate ? values.launchDate.format('YYYY-MM-DD') : ''
      if (editingItem) {
        updateEffectRecord(editingItem.id, { ...values, launchDate: dateStr })
        message.success('更新成功')
      } else {
        const newItem: EffectRecord = {
          id: uuidv4(),
          ...values,
          launchDate: dateStr
        }
        addEffectRecord(newItem)
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const columns = [
    { title: '功能名称', dataIndex: 'feature', key: 'feature', width: 180 },
    { title: '上线日期', dataIndex: 'launchDate', key: 'launchDate', width: 120 },
    { title: '衡量指标', dataIndex: 'metric', key: 'metric', width: 150 },
    { title: '目标值', dataIndex: 'target', key: 'target', width: 120 },
    { title: '实际值', dataIndex: 'actual', key: 'actual', width: 120 },
    {
      title: '达标情况', key: 'achieved', width: 100,
      render: (_: unknown, r: EffectRecord) => {
        const targetNum = parseFloat(r.target)
        const actualNum = parseFloat(r.actual)
        if (isNaN(targetNum) || isNaN(actualNum)) return <Tag>无法比较</Tag>
        return actualNum >= targetNum
          ? <Tag color="green">已达标</Tag>
          : <Tag color="orange">未达标</Tag>
      }
    },
    {
      title: '关联路线图', dataIndex: 'roadmapItemId', key: 'roadmapItemId', width: 150,
      render: (id: string) => {
        const rm = roadmapItems.find((r) => r.id === id)
        return rm ? <Tag color="blue">{rm.title}</Tag> : '-'
      }
    },
    {
      title: '操作', key: 'action', width: 160, fixed: 'right' as const,
      render: (_: unknown, r: EffectRecord) => (
        <Space>
          <Button size="small" type="link" icon={<BarChartOutlined />} onClick={() => { setDetailItem(r); setDetailOpen(true) }}>详情</Button>
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
        <h2 style={{ margin: 0 }}>效果追踪</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>记录效果</Button>
      </Row>

      {effectRecords.length === 0 ? (
        <Empty description="暂无效果记录" />
      ) : (
        <Table
          rowKey="id"
          dataSource={effectRecords}
          columns={columns}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      )}

      <Modal
        title={editingItem ? '编辑效果记录' : '记录效果'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="feature" label="功能名称" rules={[{ required: true }]}>
            <Input placeholder="请输入功能名称" />
          </Form.Item>
          <Form.Item name="launchDate" label="上线日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="metric" label="衡量指标" rules={[{ required: true }]}>
                <Input placeholder="如：日活用户数" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="target" label="目标值" rules={[{ required: true }]}>
                <Input placeholder="如：10000" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="actual" label="实际值" rules={[{ required: true }]}>
                <Input placeholder="如：12000" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="analysis" label="效果分析" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="请分析效果，说明成功或失败的原因" />
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

      <Modal
        title="效果详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {detailItem && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="功能名称">{detailItem.feature}</Descriptions.Item>
            <Descriptions.Item label="上线日期">{detailItem.launchDate}</Descriptions.Item>
            <Descriptions.Item label="衡量指标">{detailItem.metric}</Descriptions.Item>
            <Descriptions.Item label="目标值">{detailItem.target}</Descriptions.Item>
            <Descriptions.Item label="实际值">{detailItem.actual}</Descriptions.Item>
            <Descriptions.Item label="效果分析">
              <div style={{ whiteSpace: 'pre-wrap' }}>{detailItem.analysis}</div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
