import { useState } from 'react'
import {
  Row, Col, Card, Button, Modal, Form, Input, Select, Space, App,
  Table, Tag, Popconfirm, Empty, Descriptions, Timeline, Input as AntInput
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, HistoryOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { useStore } from '../../store'
import type { PRDDocument, PRDHistoryEntry } from '../../types'

export default function PRDList() {
  const { message } = App.useApp()
  const { prdDocuments, addPRD, updatePRD, deletePRD } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PRDDocument | null>(null)
  const [detailItem, setDetailItem] = useState<PRDDocument | null>(null)
  const [historyItem, setHistoryItem] = useState<PRDDocument | null>(null)
  const [newVersion, setNewVersion] = useState('')
  const [newChanges, setNewChanges] = useState('')
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: PRDDocument) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deletePRD(id)
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString()
      if (editingItem) {
        updatePRD(editingItem.id, { ...values, updatedAt: now })
        message.success('更新成功')
      } else {
        const newItem: PRDDocument = {
          id: uuidv4(),
          ...values,
          createdAt: now,
          updatedAt: now,
          history: [{
            version: values.version,
            date: dayjs().format('YYYY-MM-DD'),
            author: values.author,
            changes: '初始版本'
          }]
        }
        addPRD(newItem)
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const handleAddVersion = () => {
    if (!historyItem || !newVersion.trim()) {
      message.error('请输入版本号')
      return
    }
    const newEntry: PRDHistoryEntry = {
      version: newVersion,
      date: dayjs().format('YYYY-MM-DD'),
      author: historyItem.author,
      changes: newChanges || '无'
    }
    const updated: PRDDocument = {
      ...historyItem,
      version: newVersion,
      updatedAt: new Date().toISOString(),
      history: [...historyItem.history, newEntry]
    }
    updatePRD(historyItem.id, updated)
    setHistoryItem(updated)
    setNewVersion('')
    setNewChanges('')
    message.success('版本更新成功')
  }

  const columns = [
    { title: '文档标题', dataIndex: 'title', key: 'title', width: 200 },
    { title: '当前版本', dataIndex: 'version', key: 'version', width: 100 },
    { title: '作者', dataIndex: 'author', key: 'author', width: 100 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160, render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: '版本数', key: 'history', width: 80,
      render: (_: unknown, r: PRDDocument) => <Tag color="blue">{r.history.length}个版本</Tag>
    },
    {
      title: '操作', key: 'action', width: 240, fixed: 'right' as const,
      render: (_: unknown, r: PRDDocument) => (
        <Space>
          <Button size="small" type="link" icon={<FileTextOutlined />} onClick={() => { setDetailItem(r); setDetailOpen(true) }}>查看</Button>
          <Button size="small" type="link" icon={<HistoryOutlined />} onClick={() => { setHistoryItem(r); setNewVersion(''); setNewChanges(''); setHistoryOpen(true) }}>版本</Button>
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
        <h2 style={{ margin: 0 }}>PRD文档管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>创建PRD</Button>
      </Row>

      {prdDocuments.length === 0 ? (
        <Empty description="暂无PRD文档" />
      ) : (
        <Table
          rowKey="id"
          dataSource={prdDocuments}
          columns={columns}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      )}

      <Modal
        title={editingItem ? '编辑PRD' : '创建PRD'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="title" label="文档标题" rules={[{ required: true }]}>
                <Input placeholder="请输入文档标题" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="version" label="版本号" rules={[{ required: true }]}>
                <Input placeholder="如：v1.0" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="author" label="作者" rules={[{ required: true }]}>
            <Input placeholder="请输入作者" />
          </Form.Item>
          <Form.Item name="content" label="文档内容(Markdown)" rules={[{ required: true }]}>
            <Input.TextArea rows={10} placeholder="# PRD文档内容..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="PRD文档详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={720}
      >
        {detailItem && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="标题">{detailItem.title}</Descriptions.Item>
              <Descriptions.Item label="版本">{detailItem.version}</Descriptions.Item>
              <Descriptions.Item label="作者">{detailItem.author}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{dayjs(detailItem.updatedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
            </Descriptions>
            <Card title="文档内容" size="small">
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{detailItem.content}</pre>
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        title="版本历史"
        open={historyOpen}
        onCancel={() => setHistoryOpen(false)}
        footer={null}
        width={640}
      >
        {historyItem && (
          <div>
            <Card size="small" title="添加新版本" style={{ marginBottom: 16 }}>
              <Row gutter={8}>
                <Col span={6}>
                  <AntInput placeholder="版本号" value={newVersion} onChange={(e) => setNewVersion(e.target.value)} />
                </Col>
                <Col span={14}>
                  <AntInput placeholder="变更说明" value={newChanges} onChange={(e) => setNewChanges(e.target.value)} />
                </Col>
                <Col span={4}>
                  <Button type="primary" onClick={handleAddVersion}>添加</Button>
                </Col>
              </Row>
            </Card>
            <Card size="small" title="历史版本">
              <Timeline
                items={[...historyItem.history].reverse().map((h) => ({
                  color: 'blue',
                  children: (
                    <Card size="small" style={{ marginBottom: 4 }}>
                      <Space>
                        <Tag color="blue">v{h.version.replace('v', '')}</Tag>
                        <strong>{h.date}</strong>
                        <span style={{ color: '#999' }}>{h.author}</span>
                      </Space>
                      <div style={{ color: '#666', marginTop: 4 }}>{h.changes}</div>
                    </Card>
                  )
                }))}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}
