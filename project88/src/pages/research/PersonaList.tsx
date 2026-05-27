import { useState } from 'react'
import {
  Row, Col, Card, Button, Modal, Form, Input, Select, Tag, Space, App,
  Avatar, Descriptions, Popconfirm, Empty
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined,
  AimOutlined, FrownOutlined, ThunderboltOutlined, MessageOutlined
} from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useStore } from '../../store'
import type { Persona } from '../../types'

export default function PersonaList() {
  const { message } = App.useApp()
  const { personas, addPersona, updatePersona, deletePersona } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Persona | null>(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: Persona) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deletePersona(id)
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString()
      if (editingItem) {
        updatePersona(editingItem.id, { ...values })
        message.success('更新成功')
      } else {
        const newItem: Persona = {
          id: uuidv4(),
          ...values,
          createdAt: now,
          tags: values.tags || []
        }
        addPersona(newItem)
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>用户画像</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加画像</Button>
      </Row>

      {personas.length === 0 ? (
        <Empty description="暂无用户画像" />
      ) : (
        <Row gutter={[16, 16]}>
          {personas.map((p) => (
            <Col xs={24} md={12} lg={8} key={p.id}>
              <Card
                hoverable
                actions={[
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(p)}>编辑</Button>,
                  <Popconfirm title="确认删除？" onConfirm={() => handleDelete(p.id)}>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                  </Popconfirm>
                ]}
              >
                <Card.Meta
                  avatar={<Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />}
                  title={p.name}
                  description={
                    <span>
                      <Tag color="blue">{p.role}</Tag>
                      <Tag>{p.age}</Tag>
                    </span>
                  }
                />
                <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
                  <Descriptions.Item label={<span><AimOutlined /> 职业</span>}>{p.occupation}</Descriptions.Item>
                  <Descriptions.Item label={<span><ThunderboltOutlined /> 目标</span>}>
                    <div style={{ maxHeight: 60, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{p.goals}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label={<span><FrownOutlined /> 痛点</span>}>
                    <div style={{ maxHeight: 60, overflow: 'auto', whiteSpace: 'pre-wrap', color: '#ff4d4f' }}>{p.frustrations}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label={<span><MessageOutlined /> 金句</span>}>
                    <div style={{ fontStyle: 'italic', color: '#1677ff' }}>"{p.quote}"</div>
                  </Descriptions.Item>
                </Descriptions>
                <div style={{ marginTop: 8 }}>
                  {p.tags?.map((t) => <Tag key={t} style={{ marginBottom: 4 }}>{t}</Tag>)}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingItem ? '编辑用户画像' : '添加用户画像'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="画像名称" rules={[{ required: true }]}>
                <Input placeholder="如：数据分析师-小王" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role" label="用户角色" rules={[{ required: true }]}>
                <Input placeholder="如：产品经理" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="age" label="年龄段" rules={[{ required: true }]}>
                <Input placeholder="如：25-30岁" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="occupation" label="职业" rules={[{ required: true }]}>
                <Input placeholder="如：互联网公司产品经理" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="goals" label="目标" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="用户的主要目标" />
          </Form.Item>
          <Form.Item name="frustrations" label="痛点" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="用户的主要痛点" />
          </Form.Item>
          <Form.Item name="behaviors" label="行为特征" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="用户的典型行为" />
          </Form.Item>
          <Form.Item name="quote" label="代表性金句" rules={[{ required: true }]}>
            <Input placeholder="如：没有数据我就没法做决策" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后回车" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
