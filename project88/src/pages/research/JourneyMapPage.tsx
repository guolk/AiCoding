import { useState } from 'react'
import {
  Row, Col, Card, Button, Modal, Form, Input, Select, Space, App,
  Table, Tag, Popconfirm, Empty, InputNumber, Divider
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, LineChartOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { v4 as uuidv4 } from 'uuid'
import { useStore } from '../../store'
import type { JourneyMap, JourneyStage } from '../../types'

const stageForm = (stage: Partial<JourneyStage> = {}) => ({
  id: stage.id || uuidv4(),
  stage: stage.stage || '',
  action: stage.action || '',
  feeling: stage.feeling ?? 3,
  painPoint: stage.painPoint || '',
  opportunity: stage.opportunity || ''
})

export default function JourneyMapPage() {
  const { message } = App.useApp()
  const { journeys, personas, addJourney, updateJourney, deleteJourney } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<JourneyMap | null>(null)
  const [viewItem, setViewItem] = useState<JourneyMap | null>(null)
  const [stages, setStages] = useState<JourneyStage[]>([stageForm(), stageForm(), stageForm()])
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setStages([stageForm(), stageForm(), stageForm()])
    setIsModalOpen(true)
  }

  const handleEdit = (record: JourneyMap) => {
    setEditingItem(record)
    form.setFieldsValue({ name: record.name, personaIds: record.personaIds })
    setStages(record.stages.length > 0 ? record.stages.map((s) => stageForm(s)) : [stageForm()])
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteJourney(id)
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString()
      const validStages = stages.filter((s) => s.stage.trim() !== '')
      if (validStages.length === 0) {
        message.error('请至少添加一个阶段')
        return
      }
      if (editingItem) {
        updateJourney(editingItem.id, { ...values, stages: validStages })
        message.success('更新成功')
      } else {
        const newItem: JourneyMap = {
          id: uuidv4(),
          ...values,
          stages: validStages,
          createdAt: now
        }
        addJourney(newItem)
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const updateStage = (index: number, field: keyof JourneyStage, value: unknown) => {
    const newStages = [...stages]
    newStages[index] = { ...newStages[index], [field]: value } as JourneyStage
    setStages(newStages)
  }

  const addStage = () => {
    setStages([...stages, stageForm()])
  }

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      setStages(stages.filter((_, i) => i !== index))
    }
  }

  const chartOption = (journey: JourneyMap) => {
    const stageNames = journey.stages.map((s) => s.stage)
    const feelings = journey.stages.map((s) => s.feeling)
    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 40, bottom: 60, left: 50, right: 30 },
      xAxis: {
        type: 'category',
        data: stageNames,
        axisLabel: { interval: 0, rotate: 0 }
      },
      yAxis: {
        type: 'value',
        min: 1,
        max: 5,
        axisLabel: {
          formatter: (v: number) => ['', '很差', '较差', '一般', '较好', '很好'][v]
        }
      },
      series: [{
        name: '用户感受',
        type: 'line',
        data: feelings,
        smooth: true,
        lineStyle: { width: 3, color: '#1677ff' },
        itemStyle: { color: '#1677ff' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22,119,255,0.3)' },
              { offset: 1, color: 'rgba(22,119,255,0.05)' }
            ]
          }
        },
        markLine: {
          data: [{ yAxis: 3, name: '一般' }],
          lineStyle: { color: '#999', type: 'dashed' }
        }
      }]
    }
  }

  const columns = [
    { title: '旅程名称', dataIndex: 'name', key: 'name', width: 200 },
    {
      title: '关联画像', dataIndex: 'personaIds', key: 'personaIds', width: 200,
      render: (ids: string[]) => ids.map((id) => {
        const p = personas.find((x) => x.id === id)
        return p ? <Tag key={id} color="blue">{p.name}</Tag> : null
      })
    },
    { title: '阶段数', key: 'stages', width: 100, render: (_: unknown, r: JourneyMap) => r.stages.length },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: unknown, r: JourneyMap) => (
        <Space>
          <Button size="small" type="link" icon={<LineChartOutlined />} onClick={() => { setViewItem(r); setViewOpen(true) }}>查看</Button>
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
        <h2 style={{ margin: 0 }}>用户旅程地图</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>创建旅程</Button>
      </Row>

      {journeys.length === 0 ? (
        <Empty description="暂无旅程地图" />
      ) : (
        <Table rowKey="id" dataSource={journeys} columns={columns} pagination={{ pageSize: 10 }} />
      )}

      <Modal
        title={editingItem ? '编辑旅程地图' : '创建旅程地图'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="旅程名称" rules={[{ required: true }]}>
            <Input placeholder="如：数据分析师日常工作旅程" />
          </Form.Item>
          <Form.Item name="personaIds" label="关联用户画像" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="选择关联的用户画像">
              {personas.map((p) => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Divider orientation="left">阶段定义</Divider>
          {stages.map((stage, index) => (
            <Card
              key={stage.id}
              size="small"
              title={`阶段 ${index + 1}`}
              extra={stages.length > 1 ? (
                <Button type="link" danger size="small" onClick={() => removeStage(index)}>删除</Button>
              ) : null}
              style={{ marginBottom: 12 }}
            >
              <Row gutter={8}>
                <Col span={8}>
                  <Form.Item label="阶段名称" style={{ marginBottom: 8 }}>
                    <Input value={stage.stage} onChange={(e) => updateStage(index, 'stage', e.target.value)} placeholder="如：登录" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="用户行为" style={{ marginBottom: 8 }}>
                    <Input value={stage.action} onChange={(e) => updateStage(index, 'action', e.target.value)} placeholder="用户做什么" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="感受(1-5)" style={{ marginBottom: 8 }}>
                    <InputNumber min={1} max={5} value={stage.feeling} onChange={(v) => updateStage(index, 'feeling', v || 3)} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="痛点" style={{ marginBottom: 0 }}>
                    <Input value={stage.painPoint} onChange={(e) => updateStage(index, 'painPoint', e.target.value)} placeholder="用户的痛点" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="机会点" style={{ marginBottom: 0 }}>
                    <Input value={stage.opportunity} onChange={(e) => updateStage(index, 'opportunity', e.target.value)} placeholder="改进机会" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
          <Button type="dashed" block onClick={addStage}>+ 添加阶段</Button>
        </Form>
      </Modal>

      <Modal
        title="旅程地图详情"
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={900}
      >
        {viewItem && (
          <div>
            <Card size="small" title="用户感受曲线" style={{ marginBottom: 16 }}>
              <ReactECharts option={chartOption(viewItem)} style={{ height: 300 }} />
            </Card>
            <Card size="small" title="阶段详情">
              <Table
                rowKey="id"
                dataSource={viewItem.stages}
                size="small"
                pagination={false}
                columns={[
                  { title: '阶段', dataIndex: 'stage', key: 'stage', width: 100 },
                  { title: '行为', dataIndex: 'action', key: 'action', width: 150 },
                  {
                    title: '感受', dataIndex: 'feeling', key: 'feeling', width: 80,
                    render: (v: number) => <Tag color={v >= 4 ? 'green' : v >= 3 ? 'blue' : v >= 2 ? 'orange' : 'red'}>{v}/5</Tag>
                  },
                  { title: '痛点', dataIndex: 'painPoint', key: 'painPoint' },
                  { title: '机会点', dataIndex: 'opportunity', key: 'opportunity' }
                ]}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}
