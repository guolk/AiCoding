import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Slider, Tag, Space, Popconfirm, message, Card, Row, Col, Tabs, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, BulbOutlined, RadarChartOutlined } from '@ant-design/icons'
import { contentPlanningAPI } from '../utils/api'

const difficultyLabels = {
  1: '非常简单',
  2: '简单',
  3: '中等',
  4: '困难',
  5: '非常困难'
}

const trafficLabels = {
  1: '低',
  2: '较低',
  3: '中等',
  4: '较高',
  5: '高'
}

const TopicIdeas = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await contentPlanningAPI.getTopics()
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
    form.setFieldsValue({
      traffic_potential: 3,
      production_difficulty: 3,
      priority: 0
    })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await contentPlanningAPI.deleteTopic(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingItem) {
        await contentPlanningAPI.updateTopic(editingItem.id, values)
        message.success('更新成功')
      } else {
        await contentPlanningAPI.createTopic(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const getScoreColor = (traffic, difficulty) => {
    if (traffic >= 4 && difficulty <= 2) return '#52c41a'
    if (traffic >= 3 && difficulty <= 3) return '#1890ff'
    if (traffic <= 2 && difficulty >= 4) return '#ff4d4f'
    return '#faad14'
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          {record.priority > 0 && <Tag color="red">高优先</Tag>}
        </Space>
      )
    },
    {
      title: '流量潜力',
      dataIndex: 'traffic_potential',
      key: 'traffic_potential',
      width: 120,
      render: (value) => (
        <Tag color={value >= 4 ? 'green' : value >= 3 ? 'blue' : 'orange'}>
          {trafficLabels[value]} ({value}/5)
        </Tag>
      )
    },
    {
      title: '制作难度',
      dataIndex: 'production_difficulty',
      key: 'production_difficulty',
      width: 120,
      render: (value) => (
        <Tag color={value <= 2 ? 'green' : value <= 3 ? 'blue' : 'red'}>
          {difficultyLabels[value]} ({value}/5)
        </Tag>
      )
    },
    {
      title: '综合评分',
      key: 'score',
      width: 100,
      render: (_, record) => {
        const score = record.traffic_potential * 2 - record.production_difficulty
        return (
          <span style={{ color: getScoreColor(record.traffic_potential, record.production_difficulty), fontWeight: 'bold' }}>
            {score}
          </span>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors = {
          pending: 'default',
          approved: 'green',
          rejected: 'red',
          in_progress: 'blue',
          completed: 'purple'
        }
        return <Tag color={colors[status] || 'default'}>{status}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
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

  const renderMatrix = () => {
    if (data.length === 0) {
      return <Empty description="暂无选题数据" />
    }

    const matrix = Array(5).fill(null).map(() => Array(5).fill(null).map(() => []))

    data.forEach(item => {
      const row = 5 - item.production_difficulty
      const col = item.traffic_potential - 1
      if (row >= 0 && row < 5 && col >= 0 && col < 5) {
        matrix[row][col].push(item)
      }
    })

    const getCellClass = (traffic, difficulty) => {
      if (traffic >= 4 && difficulty <= 2) return 'matrix-cell matrix-cell-high'
      if (traffic <= 2 && difficulty >= 4) return 'matrix-cell matrix-cell-low'
      return 'matrix-cell matrix-cell-medium'
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: 100, textAlign: 'center', padding: 8 }}></th>
              {[1, 2, 3, 4, 5].map(t => (
                <th key={t} style={{ textAlign: 'center', padding: 8, minWidth: 150 }}>
                  {trafficLabels[t]} ({t})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[5, 4, 3, 2, 1].map((d, rowIndex) => (
              <tr key={d}>
                <td style={{ textAlign: 'center', padding: 8, fontWeight: 'bold' }}>
                  {difficultyLabels[d]}<br />
                  <span style={{ fontWeight: 'normal', color: '#666' }}>(难度 {d})</span>
                </td>
                {[1, 2, 3, 4, 5].map(t => {
                  const items = matrix[rowIndex][t - 1]
                  return (
                    <td key={t} className={getCellClass(t, d)}>
                      {items.length > 0 ? (
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                            {items.length} 个选题
                          </div>
                          {items.slice(0, 3).map(item => (
                            <div key={item.id} style={{ fontSize: 12, marginBottom: 4, color: '#333' }}>
                              • {item.title.length > 15 ? item.title.slice(0, 15) + '...' : item.title}
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div style={{ fontSize: 12, color: '#1890ff' }}>+{items.length - 3} 更多</div>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: '#999' }}>-</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 16, textAlign: 'center', color: '#666', fontSize: 12 }}>
          ↑ 制作难度（越往上越简单） | 流量潜力 →（越往右越高）
        </div>
      </div>
    )
  }

  const tabItems = [
    {
      key: 'list',
      label: '列表视图',
      icon: <BulbOutlined />,
      children: (
        <Card className="card-shadow">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'matrix',
      label: '矩阵视图',
      icon: <RadarChartOutlined />,
      children: (
        <Card title="选题评估矩阵（流量潜力 vs 制作难度）" className="card-shadow">
          {renderMatrix()}
        </Card>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}><BulbOutlined /> 选题库</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加选题
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <div style={{ color: '#666' }}>总选题</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>{data.length}</div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <div style={{ color: '#666' }}>高潜力选题</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
              {data.filter(d => d.traffic_potential >= 4).length}
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <div style={{ color: '#666' }}>低难度选题</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#722ed1' }}>
              {data.filter(d => d.production_difficulty <= 2).length}
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <div style={{ color: '#666' }}>优先级选题</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#faad14' }}>
              {data.filter(d => d.priority > 0).length}
            </div>
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal
        title={editingItem ? '编辑选题' : '添加选题'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="选题标题"
            rules={[{ required: true, message: '请输入选题标题' }]}
          >
            <Input placeholder="请输入选题标题" />
          </Form.Item>
          <Form.Item
            name="description"
            label="详细描述"
          >
            <Input.TextArea rows={3} placeholder="详细描述这个选题" />
          </Form.Item>
          <Form.Item
            name="traffic_potential"
            label="流量潜力 (1-5)"
          >
            <Slider
              min={1}
              max={5}
              marks={trafficLabels}
              tooltip={{ formatter: value => trafficLabels[value] }}
            />
          </Form.Item>
          <Form.Item
            name="production_difficulty"
            label="制作难度 (1-5)"
          >
            <Slider
              min={1}
              max={5}
              marks={difficultyLabels}
              tooltip={{ formatter: value => difficultyLabels[value] }}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estimated_reach"
                label="预计触达"
              >
                <Input type="number" placeholder="预计触达人数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estimated_engagement"
                label="预计互动率 (%)"
              >
                <Input type="number" step="0.1" placeholder="预计互动率" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="priority"
            label="优先级"
          >
            <Select
              options={[
                { value: 0, label: '普通' },
                { value: 1, label: '高优先级' },
                { value: 2, label: '非常高优先级' }
              ]}
            />
          </Form.Item>
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select mode="tags" placeholder="输入相关标签" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TopicIdeas
