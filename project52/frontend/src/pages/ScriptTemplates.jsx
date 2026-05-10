import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Card, Row, Col, Statistic, Empty, Tabs, Space, Divider } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, CopyOutlined } from '@ant-design/icons'
import { contentProductionAPI } from '../utils/api'
import { PLATFORM_LABEL_MAP, CONTENT_TYPE_LABEL_MAP } from '../utils/constants'

const ScriptTemplates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [generateModalVisible, setGenerateModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [generatedScript, setGeneratedScript] = useState(null)
  const [form] = Form.useForm()
  const [generateForm] = Form.useForm()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await contentProductionAPI.getScriptTemplates()
      setTemplates(response.data)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await contentProductionAPI.deleteScriptTemplate(id)
      message.success('删除成功')
      fetchTemplates()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingItem) {
        await contentProductionAPI.updateScriptTemplate(editingItem.id, values)
        message.success('更新成功')
      } else {
        await contentProductionAPI.createScriptTemplate(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchTemplates()
    } catch (error) {
      console.error(error)
    }
  }

  const handleGenerate = (template) => {
    setSelectedTemplate(template)
    generateForm.resetFields()
    setGeneratedScript(null)
    setGenerateModalVisible(true)
  }

  const handleGenerateSubmit = async () => {
    try {
      const values = await generateForm.validateFields()
      const response = await contentProductionAPI.generateScript(selectedTemplate.id, values.topic)
      setGeneratedScript(response.data)
    } catch (error) {
      message.error('生成失败')
    }
  }

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '内容类型',
      dataIndex: 'content_type',
      key: 'content_type',
      width: 120,
      render: (type) => {
        const map = CONTENT_TYPE_LABEL_MAP.find(m => m.value === type)
        return map?.label || type
      }
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120
    },
    {
      title: '预计时长',
      dataIndex: 'duration_estimate',
      key: 'duration_estimate',
      width: 100,
      render: (val) => val ? `${val} 秒` : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<CopyOutlined />} onClick={() => handleGenerate(record)}>
            生成脚本
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const defaultTemplates = [
    {
      name: '问题引入型开场',
      description: '用一个引人思考的问题开场，吸引观众注意力',
      opening: '你有没有想过，{topic}背后隐藏着什么秘密？今天我将为你揭示真相...',
      main_content: '首先，让我们来了解一下{topic}的基本概念。\n\n接下来，我将分三个部分详细讲解：\n\n1. 第一点\n2. 第二点\n3. 第三点',
      closing: '以上就是关于{topic}的全部内容，希望对你有所帮助。',
      call_to_action: '如果喜欢这个视频，记得点赞、关注、收藏哦！有什么问题欢迎在评论区留言。'
    },
    {
      name: '故事叙述型',
      description: '用故事引出主题，增加情感共鸣',
      opening: '曾经有一个朋友问我关于{topic}的问题，这个经历让我想和你分享...',
      main_content: '让我先给你讲一个故事...\n\n从这个故事中，我们可以学到...\n\n让我们深入了解一下{topic}：',
      closing: '通过这个故事，相信你对{topic}有了更深的理解。',
      call_to_action: '订阅我的频道，获取更多精彩内容！'
    }
  ]

  const tabItems = [
    {
      key: 'my',
      label: '我的模板',
      icon: <FileTextOutlined />,
      children: (
        <Card
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加模板</Button>}
          className="card-shadow"
        >
          <Table
            columns={columns}
            dataSource={templates}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="暂无脚本模板，点击右上角添加" /> }}
          />
        </Card>
      )
    },
    {
      key: 'default',
      label: '预设模板',
      icon: <FileTextOutlined />,
      children: (
        <Card title="可用的预设模板" className="card-shadow">
          <Row gutter={[16, 16]}>
            {defaultTemplates.map((template, index) => (
              <Col key={index} xs={24} md={12}>
                <Card
                  size="small"
                  title={template.name}
                  extra={<Button type="link" onClick={() => { setSelectedTemplate(template); generateForm.resetFields(); setGeneratedScript(null); setGenerateModalVisible(true); }}>
                    使用
                  </Button>}
                >
                  <p style={{ color: '#666', marginBottom: 12 }}>{template.description}</p>
                  <div>
                    <div><strong>开场：</strong>{template.opening.slice(0, 50)}...</div>
                    <div><strong>正文：</strong>{template.main_content.slice(0, 50)}...</div>
                    <div><strong>结尾：</strong>{template.closing.slice(0, 50)}...</div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )
    }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}><FileTextOutlined /> 脚本模板库</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="我的模板"
              value={templates.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="预设模板"
              value={defaultTemplates.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs items={tabItems} />

      <Modal
        title={editingItem ? '编辑模板' : '创建模板'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="模板名称"
                rules={[{ required: true, message: '请输入模板名称' }]}
              >
                <Input placeholder="例如：科技产品评测" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="content_type" label="内容类型">
                <Select placeholder="选择内容类型" options={CONTENT_TYPE_LABEL_MAP} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="platform" label="适用平台">
                <Select placeholder="选择平台" options={PLATFORM_LABEL_MAP} allowClear />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration_estimate" label="预计时长(秒)">
                <InputNumber style={{ width: '100%' }} placeholder="例如：300" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="opening"
            label="开场脚本"
            extra="使用 {topic} 作为主题占位符"
          >
            <Input.TextArea rows={3} placeholder="视频开场内容..." />
          </Form.Item>
          <Form.Item
            name="main_content"
            label="正文脚本"
            extra="使用 {topic} 作为主题占位符"
          >
            <Input.TextArea rows={5} placeholder="视频主要内容..." />
          </Form.Item>
          <Form.Item
            name="closing"
            label="收尾脚本"
            extra="使用 {topic} 作为主题占位符"
          >
            <Input.TextArea rows={3} placeholder="视频结尾内容..." />
          </Form.Item>
          <Form.Item
            name="call_to_action"
            label="引导行动"
          >
            <Input.TextArea rows={2} placeholder="引导观众点赞、关注、评论..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="生成脚本"
        open={generateModalVisible}
        onCancel={() => setGenerateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={generateForm} layout="vertical">
          <Form.Item
            name="topic"
            label="输入主题"
            rules={[{ required: true, message: '请输入主题' }]}
          >
            <Input placeholder="例如：如何快速学习Python" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleGenerateSubmit} block>
              生成脚本
            </Button>
          </Form.Item>
        </Form>

        {generatedScript && (
          <div>
            <Divider>生成结果</Divider>
            <Card
              type="inner"
              title={`模板：${generatedScript.template_name}`}
              size="small"
            >
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                <Divider orientation="left">开场</Divider>
                <p style={{ color: '#1890ff' }}>{generatedScript.opening || '(无)'}</p>
                
                <Divider orientation="left">正文</Divider>
                <p style={{ color: '#333' }}>{generatedScript.main_content || '(无)'}</p>
                
                <Divider orientation="left">收尾</Divider>
                <p style={{ color: '#52c41a' }}>{generatedScript.closing || '(无)'}</p>
                
                <Divider orientation="left">引导行动</Divider>
                <p style={{ color: '#faad14' }}>{generatedScript.call_to_action || '(无)'}</p>
                
                <Divider orientation="left">完整脚本</Divider>
                <pre style={{
                  backgroundColor: '#f5f5f5',
                  padding: 16,
                  borderRadius: 4,
                  overflowX: 'auto'
                }}>
                  {generatedScript.full_script}
                </pre>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ScriptTemplates
