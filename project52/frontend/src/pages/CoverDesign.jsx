import React, { useState, useEffect } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, InputNumber, ColorPicker, message, Card, Row, Col, Tabs, Empty, Space, Divider
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, EyeOutlined
} from '@ant-design/icons'
import { contentProductionAPI } from '../utils/api'
import { PLATFORM_LABEL_MAP, PLATFORMS } from '../utils/constants'

const CoverDesign = () => {
  const [templates, setTemplates] = useState([])
  const [platformSizes, setPlatformSizes] = useState({})
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [form] = Form.useForm()
  const [previewForm] = Form.useForm()
  const [previewResult, setPreviewResult] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [templatesRes, sizesRes] = await Promise.all([
        contentProductionAPI.getCoverTemplates(),
        contentProductionAPI.getPlatformSizes()
      ])
      setTemplates(templatesRes.data)
      setPlatformSizes(sizesRes.data)
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
      width: 1280,
      height: 720,
      background_color: '#ffffff',
      text_color: '#000000',
      accent_color: '#3498db',
      font_family: 'sans-serif',
      layout: 'center'
    })
    setModalVisible(true)
  }

  const handleEdit = (template) => {
    setEditingItem(template)
    form.setFieldsValue(template)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await contentProductionAPI.deleteCoverTemplate(id)
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
        await contentProductionAPI.updateCoverTemplate(editingItem.id, values)
        message.success('更新成功')
      } else {
        await contentProductionAPI.createCoverTemplate(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const handlePreview = (template) => {
    setSelectedTemplate(template)
    previewForm.resetFields()
    setPreviewResult(null)
    setPreviewModalVisible(true)
  }

  const handleGeneratePreview = async () => {
    try {
      const values = await previewForm.validateFields()
      const response = await contentProductionAPI.generateCover(
        selectedTemplate.id,
        values.title,
        values.subtitle
      )
      setPreviewResult(response.data)
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
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform) => {
        const p = PLATFORMS[platform]
        return <span style={{ color: p?.color }}>{p?.label || platform}</span>
      }
    },
    {
      title: '尺寸',
      key: 'size',
      width: 150,
      render: (_, record) => `${record.width} × ${record.height}`
    },
    {
      title: '背景色',
      key: 'colors',
      width: 200,
      render: (_, record) => (
        <Space>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 20, backgroundColor: record.background_color, border: '1px solid #ccc' }} />
            <span>背景</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 20, backgroundColor: record.text_color, border: '1px solid #ccc' }} />
            <span>文字</span>
          </div>
        </Space>
      )
    },
    {
      title: '布局',
      dataIndex: 'layout',
      key: 'layout',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
            预览
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
    { id: 101, name: '简约白底蓝调', platform: 'bilibili', platform_key: 'bilibili', width: 1280, height: 720, background_color: '#ffffff', text_color: '#1a1a1a', accent_color: '#1890ff', layout: 'center', is_default: true },
    { id: 102, name: '深色科技风', platform: 'douyin', platform_key: 'douyin', width: 1080, height: 1920, background_color: '#1a1a2e', text_color: '#ffffff', accent_color: '#00d4ff', layout: 'center', is_default: true },
    { id: 103, name: '渐变活力橙', platform: 'xiaohongshu', platform_key: 'bilibili', width: 1280, height: 720, background_color: '#fff7e6', text_color: '#595959', accent_color: '#fa8c16', layout: 'center', is_default: true }
  ]

  const handlePreviewDefault = (template) => {
    setSelectedTemplate(template)
    previewForm.resetFields()
    setPreviewResult(null)
    setPreviewModalVisible(true)
  }

  const myTab = {
    key: 'my',
    label: '我的模板',
    icon: <PictureOutlined />,
    children: (
      <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加模板</Button>} className="card-shadow">
        <Table columns={columns} dataSource={templates} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} locale={{ emptyText: <Empty description="暂无封面模板，点击右上角添加" /> }} />
      </Card>
    )
  }

  const defaultTab = {
    key: 'default',
    label: '预设模板',
    icon: <PictureOutlined />,
    children: (
      <Card title="预设模板" className="card-shadow">
        <Row gutter={[16, 16]}>
          {defaultTemplates.map((template) => (
            <Col key={template.id} xs={24} md={8}>
              <Card size="small" hoverable title={template.name} extra={<Button type="link" onClick={() => handlePreviewDefault(template)}>预览</Button>}>
                <div style={{ height: 120, backgroundColor: template.background_color, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 4, border: '1px solid #e8e8e8' }}>
                  <div style={{ color: template.text_color, fontSize: 18, fontWeight: 'bold' }}>示例标题</div>
                  <div style={{ color: template.accent_color, fontSize: 12, marginTop: 8 }}>副标题文字</div>
                </div>
                <div style={{ marginTop: 12, color: '#666', fontSize: 12 }}>尺寸: {template.width} × {template.height}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    )
  }

  const sizesTab = {
    key: 'sizes',
    label: '平台尺寸',
    icon: <PictureOutlined />,
    children: (
      <Card title="各平台推荐尺寸" className="card-shadow">
        <Row gutter={[16, 16]}>
          {Object.entries(platformSizes).map(([platform, sizes]) => (
            <Col key={platform} xs={24} md={12}>
              <Card size="small" title={<span style={{ color: PLATFORMS[platform]?.color }}>{PLATFORMS[platform]?.label || platform}</span>}>
                {Object.entries(sizes).map(([key, size]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>{size.name}</span>
                    <span style={{ color: '#666' }}>{size.width} × {size.height}</span>
                  </div>
                ))}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}><PictureOutlined /> 封面设计</h2>
      <Tabs items={[myTab, defaultTab, sizesTab]} />

      <Modal title={editingItem ? '编辑模板' : '创建模板'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
                <Input placeholder="例如：产品评测" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="platform" label="平台" rules={[{ required: true, message: '请选择平台' }]}>
                <Select placeholder="选择平台" options={PLATFORM_LABEL_MAP} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="width" label="宽度 (px)"><InputNumber style={{ width: '100%' }} placeholder="例如：1280" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="height" label="高度 (px)"><InputNumber style={{ width: '100%' }} placeholder="例如：720" /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="background_color" label="背景色"><ColorPicker showText /></Form.Item></Col>
            <Col span={8}><Form.Item name="text_color" label="文字颜色"><ColorPicker showText /></Form.Item></Col>
            <Col span={8}><Form.Item name="accent_color" label="强调色"><ColorPicker showText /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="font_family" label="字体">
                <Select placeholder="选择字体" options={[{ value: 'sans-serif', label: '无衬线字体' }, { value: 'serif', label: '衬线字体' }, { value: 'monospace', label: '等宽字体' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="layout" label="布局">
                <Select placeholder="选择布局" options={[{ value: 'center', label: '居中' }, { value: 'left', label: '左对齐' }, { value: 'right', label: '右对齐' }, { value: 'top', label: '顶部' }, { value: 'bottom', label: '底部' }]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="封面预览" open={previewModalVisible} onCancel={() => setPreviewModalVisible(false)} footer={null} width={700}>
        <Form form={previewForm} layout="vertical">
          <Form.Item name="title" label="主标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入主标题" />
          </Form.Item>
          <Form.Item name="subtitle" label="副标题"><Input placeholder="请输入副标题（可选）" /></Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleGeneratePreview} block>生成预览</Button>
          </Form.Item>
        </Form>

        {previewResult && (
          <div>
            <Divider>预览效果</Divider>
            <Card size="small">
              <div style={{ width: '100%', aspectRatio: `${previewResult.dimensions?.split('×')[0]}/${previewResult.dimensions?.split('×')[1]}`, backgroundColor: previewResult.styles?.background_color, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: previewResult.styles?.text_color, marginBottom: 8 }}>{previewResult.title}</div>
                {previewResult.subtitle && <div style={{ fontSize: 14, color: previewResult.styles?.accent_color }}>{previewResult.subtitle}</div>}
              </div>
            </Card>
            <div style={{ marginTop: 16, color: '#666', fontSize: 12, textAlign: 'center' }}>尺寸: {previewResult.dimensions} | 模板: {previewResult.template_name}</div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CoverDesign
