import { useState } from 'react'
import {
  Row, Col, Card, Button, Modal, Form, Input, Select, Space, App,
  Table, Popconfirm, InputNumber, Tag, Empty
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { v4 as uuidv4 } from 'uuid'
import { useStore } from '../../store'
import type { MarketPosition } from '../../types'

export default function MarketPositioning() {
  const { message } = App.useApp()
  const { marketPositions, competitors, addMarketPosition, updateMarketPosition, deleteMarketPosition } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MarketPosition | null>(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: MarketPosition) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMarketPosition(id)
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingItem) {
        updateMarketPosition(editingItem.id, { ...values })
        message.success('更新成功')
      } else {
        const newItem: MarketPosition = {
          id: uuidv4(),
          ...values
        }
        addMarketPosition(newItem)
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const xLabel = marketPositions[0]?.xLabel || '产品成熟度'
  const yLabel = marketPositions[0]?.yLabel || '价格'

  const chartOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const d = params.data
        return `<strong>${d.name}</strong><br/>${xLabel}: ${d.value[0]}<br/>${yLabel}: ${d.value[1]}<br/>${d.note || ''}`
      }
    },
    grid: { top: 40, bottom: 60, left: 60, right: 40 },
    xAxis: {
      type: 'value',
      name: xLabel,
      min: 0,
      max: 100,
      splitLine: { show: true, lineStyle: { type: 'dashed' } }
    },
    yAxis: {
      type: 'value',
      name: yLabel,
      min: 0,
      max: 100,
      splitLine: { show: true, lineStyle: { type: 'dashed' } }
    },
    series: [{
      type: 'scatter',
      symbolSize: 30,
      data: marketPositions.map((m) => {
        const comp = m.competitorId === 'self'
          ? { name: '我们的产品' }
          : competitors.find((c) => c.id === m.competitorId) || { name: m.competitorId }
        return {
          name: comp.name,
          value: [m.xValue, m.yValue],
          note: m.note,
          itemStyle: {
            color: m.competitorId === 'self' ? '#ff4d4f' : '#1677ff',
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: comp.name,
            position: 'top',
            color: m.competitorId === 'self' ? '#ff4d4f' : '#333'
          }
        }
      }),
      markLine: {
        silent: true,
        lineStyle: { type: 'dashed', color: '#999' },
        data: [
          { xAxis: 50 },
          { yAxis: 50 }
        ]
      }
    }]
  }

  const columns = [
    {
      title: '产品', dataIndex: 'competitorId', key: 'competitorId', width: 150,
      render: (id: string) => {
        if (id === 'self') return <Tag color="red">我们的产品</Tag>
        const c = competitors.find((x) => x.id === id)
        return c ? <Tag color="blue">{c.name}</Tag> : id
      }
    },
    { title: xLabel, dataIndex: 'xValue', key: 'xValue', width: 100 },
    { title: yLabel, dataIndex: 'yValue', key: 'yValue', width: 100 },
    { title: '备注', dataIndex: 'note', key: 'note' },
    {
      title: '操作', key: 'action', width: 140,
      render: (_: unknown, r: MarketPosition) => (
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
        <h2 style={{ margin: 0 }}>市场定位分析</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加定位</Button>
      </Row>

      {marketPositions.length === 0 ? (
        <Empty description="暂无定位数据，请添加" />
      ) : (
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <Card title="竞争格局四象限图">
              <ReactECharts option={chartOption} style={{ height: 400 }} />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="定位数据">
              <Table rowKey="id" dataSource={marketPositions} columns={columns} size="small" pagination={false} />
            </Card>
          </Col>
        </Row>
      )}

      <Modal
        title={editingItem ? '编辑定位' : '添加定位'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="competitorId" label="竞品/自身" rules={[{ required: true }]}>
            <Select placeholder="请选择">
              <Select.Option value="self">我们的产品</Select.Option>
              {competitors.map((c) => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="xLabel" label="X轴维度" rules={[{ required: true }]} initialValue="产品成熟度">
                <Input placeholder="如：产品成熟度" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="yLabel" label="Y轴维度" rules={[{ required: true }]} initialValue="价格">
                <Input placeholder="如：价格" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="xValue" label="X轴数值(0-100)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="yValue" label="Y轴数值(0-100)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={2} placeholder="备注说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
