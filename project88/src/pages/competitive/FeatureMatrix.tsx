import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, Tag, Space, App,
  Card, Row, Col, Checkbox, Input as AntInput, Popconfirm, Statistic
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useStore } from '../../store'
import type { FeatureItem } from '../../types'

export default function FeatureMatrix() {
  const { message } = App.useApp()
  const { features, competitors, addFeature, updateFeature, deleteFeature } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FeatureItem | null>(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    form.setFieldsValue({
      ours: false,
      competitors: Object.fromEntries(competitors.map((c) => [c.id, false]))
    })
    setIsModalOpen(true)
  }

  const handleEdit = (record: FeatureItem) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      competitors: record.competitors
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteFeature(id)
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingItem) {
        updateFeature(editingItem.id, { ...values })
        message.success('更新成功')
      } else {
        const newItem: FeatureItem = {
          id: uuidv4(),
          ...values,
          competitors: values.competitors || {}
        }
        addFeature(newItem)
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const oursCount = features.filter((f) => f.ours).length
  const competitorsHave = features.filter((f) => Object.values(f.competitors).some(Boolean)).length
  const bothHave = features.filter((f) => f.ours && Object.values(f.competitors).some(Boolean)).length
  const noneHave = features.filter((f) => !f.ours && !Object.values(f.competitors).some(Boolean)).length

  const baseColumns = [
    { title: '功能', dataIndex: 'feature', key: 'feature', width: 180, fixed: 'left' as const },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100 }
  ]

  const dynamicColumns = competitors.map((c) => ({
    title: c.name,
    key: c.id,
    width: 100,
    render: (_: unknown, r: FeatureItem) => (
      <Checkbox checked={r.competitors[c.id] || false} disabled />
    )
  }))

  const endColumns = [
    {
      title: '我们', key: 'ours', width: 80,
      render: (_: unknown, r: FeatureItem) => (
        <Checkbox checked={r.ours} disabled />
      )
    },
    { title: '备注', dataIndex: 'notes', key: 'notes', width: 150 },
    {
      title: '操作', key: 'action', width: 140, fixed: 'right' as const,
      render: (_: unknown, r: FeatureItem) => (
        <Space>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const columns = [...baseColumns, ...dynamicColumns, ...endColumns]

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>功能对比矩阵</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加功能</Button>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="我们拥有" value={oursCount} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="竞品拥有" value={competitorsHave} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="双方都有" value={bothHave} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="都没有" value={noneHave} valueStyle={{ color: '#8c8c8c' }} /></Card>
        </Col>
      </Row>

      <Table
        rowKey="id"
        dataSource={features}
        columns={columns}
        scroll={{ x: 800 }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        rowClassName={(r) => {
          const compHas = Object.values(r.competitors).some(Boolean)
          if (r.ours && compHas) return 'both-row'
          if (r.ours && !compHas) return 'ours-row'
          if (!r.ours && compHas) return 'comp-row'
          return 'none-row'
        }}
      />

      <style>{`
        .both-row td { background: rgba(22,119,255,0.06) !important; }
        .ours-row td { background: rgba(82,196,26,0.08) !important; }
        .comp-row td { background: rgba(250,140,22,0.08) !important; }
        .none-row td { background: rgba(140,140,140,0.06) !important; }
      `}</style>

      <Modal
        title={editingItem ? '编辑功能' : '添加功能'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="feature" label="功能名称" rules={[{ required: true }]}>
                <Input placeholder="请输入功能名称" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="category" label="分类" rules={[{ required: true }]}>
                <Select placeholder="请选择分类">
                  <Select.Option value="基础功能">基础功能</Select.Option>
                  <Select.Option value="高级功能">高级功能</Select.Option>
                  <Select.Option value="效率工具">效率工具</Select.Option>
                  <Select.Option value="平台支持">平台支持</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="ours" valuePropName="checked">
            <Checkbox>我们拥有此功能</Checkbox>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.ours !== cur.ours}>
            {({ getFieldValue }) => getFieldValue('ours') ? (
              <Form.Item name="oursNote" label="我们的说明" style={{ marginBottom: 16 }}>
                <AntInput placeholder="我们对此功能的说明" />
              </Form.Item>
            ) : null}
          </Form.Item>
          <Card size="small" title="竞品对比" style={{ marginBottom: 16 }}>
            {competitors.map((c) => (
              <Form.Item
                key={c.id}
                name={['competitors', c.id]}
                valuePropName="checked"
                style={{ marginBottom: 8 }}
              >
                <Checkbox>{c.name}</Checkbox>
              </Form.Item>
            ))}
          </Card>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
