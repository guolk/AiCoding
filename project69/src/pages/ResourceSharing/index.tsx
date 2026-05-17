import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Popconfirm,
  List,
  Row,
  Col,
  Statistic,
  Drawer,
  Descriptions,
  Divider,
  DatePicker,
  Upload,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  ToolOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ShareAltOutlined,
  WarningOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { Equipment, BorrowRecord, Member, SharedResource } from '../../types';
import {
  equipmentStorage,
  borrowRecordStorage,
  memberStorage,
  sharedResourceStorage,
  generateId,
} from '../../utils/storage';

const { Dragger } = Upload;

const ResourceSharing: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([]);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [borrowModalVisible, setBorrowModalVisible] = useState(false);
  const [resourceModalVisible, setResourceModalVisible] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [activeTab, setActiveTab] = useState<'equipment' | 'borrow' | 'resources'>('equipment');
  const [equipmentForm] = Form.useForm();
  const [borrowForm] = Form.useForm();
  const [resourceForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEquipment(equipmentStorage.getAll());
    setBorrowRecords(borrowRecordStorage.getAll());
    setMembers(memberStorage.getAll());
    setSharedResources(sharedResourceStorage.getAll());
  };

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    equipmentForm.resetFields();
    equipmentForm.setFieldsValue({
      available: true,
    });
    setEquipmentModalVisible(true);
  };

  const handleEditEquipment = (item: Equipment) => {
    setEditingEquipment(item);
    equipmentForm.setFieldsValue(item);
    setEquipmentModalVisible(true);
  };

  const handleDeleteEquipment = (id: string) => {
    equipmentStorage.delete(id);
    loadData();
    message.success('删除成功');
  };

  const handleSaveEquipment = async () => {
    try {
      const values = await equipmentForm.validateFields();
      const equipmentData: Equipment = {
        ...values,
        id: editingEquipment?.id || generateId(),
      };

      if (editingEquipment) {
        equipmentStorage.update(editingEquipment.id, equipmentData);
        message.success('更新成功');
      } else {
        equipmentStorage.add(equipmentData);
        message.success('添加成功');
      }

      setEquipmentModalVisible(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBorrow = (item: Equipment) => {
    if (!item.available) {
      message.warning('该设备当前不可用');
      return;
    }
    setSelectedEquipment(item);
    borrowForm.resetFields();
    setBorrowModalVisible(true);
  };

  const handleSubmitBorrow = async () => {
    if (!selectedEquipment) return;

    try {
      const values = await borrowForm.validateFields();
      const borrowRecord: BorrowRecord = {
        id: generateId(),
        equipmentId: selectedEquipment.id,
        borrowerId: values.borrowerId,
        ownerId: selectedEquipment.ownerId,
        borrowDate: values.borrowDate.format('YYYY-MM-DD'),
        expectedReturnDate: values.expectedReturnDate.format('YYYY-MM-DD'),
        status: 'pending',
        notes: values.notes,
      };

      borrowRecordStorage.add(borrowRecord);
      equipmentStorage.update(selectedEquipment.id, { available: false });
      message.success('借用申请已提交');
      setBorrowModalVisible(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveBorrow = (recordId: string) => {
    borrowRecordStorage.update(recordId, { status: 'approved' });
    message.success('已批准借用');
    loadData();
  };

  const handleRejectBorrow = (recordId: string) => {
    const record = borrowRecordStorage.getById(recordId);
    if (record) {
      equipmentStorage.update(record.equipmentId, { available: true });
    }
    borrowRecordStorage.update(recordId, { status: 'rejected' });
    message.success('已拒绝借用');
    loadData();
  };

  const handleReturnEquipment = (recordId: string) => {
    const record = borrowRecordStorage.getById(recordId);
    if (record) {
      equipmentStorage.update(record.equipmentId, { available: true });
      borrowRecordStorage.update(recordId, {
        status: 'returned',
        actualReturnDate: dayjs().format('YYYY-MM-DD'),
      });
      message.success('设备已归还');
      loadData();
    }
  };

  const handleAddResource = () => {
    resourceForm.resetFields();
    setFileList([]);
    setResourceModalVisible(true);
  };

  const handleSaveResource = async () => {
    try {
      const values = await resourceForm.validateFields();
      const resource: SharedResource = {
        id: generateId(),
        name: values.name,
        type: values.type,
        ownerId: values.ownerId,
        fileUrl: '',
        permissions: values.permissions?.map((memberId: string) => ({
          memberId,
          level: 'view' as const,
        })) || [],
        createdAt: new Date().toISOString(),
      };

      sharedResourceStorage.add(resource);
      message.success('资源上传成功');
      setResourceModalVisible(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteResource = (id: string) => {
    sharedResourceStorage.delete(id);
    loadData();
    message.success('删除成功');
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '未知';
  const getEquipmentName = (id: string) => equipment.find(e => e.id === id)?.name || '未知';

  const getBorrowStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      approved: 'blue',
      returned: 'green',
      rejected: 'default',
    };
    return colors[status] || 'default';
  };

  const getBorrowStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: '待审批',
      approved: '使用中',
      returned: '已归还',
      rejected: '已拒绝',
    };
    return texts[status] || status;
  };

  const equipmentColumns: ColumnsType<Equipment> = [
    {
      title: '设备名称',
      dataIndex: 'name',
      render: (_, record) => (
        <Space>
          <ToolOutlined />
          <span style={{ fontWeight: 500 }}>{record.name}</span>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      render: c => <Tag color="blue">{c}</Tag>,
    },
    {
      title: '所有者',
      dataIndex: 'ownerId',
      render: id => getMemberName(id),
    },
    {
      title: '状态',
      dataIndex: 'available',
      render: v => (
        <Tag color={v ? 'green' : 'red'}>
          {v ? '可用' : '使用中'}
        </Tag>
      ),
    },
    { title: '描述', dataIndex: 'description' },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            disabled={!record.available}
            onClick={() => handleBorrow(record)}
          >
            申请借用
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditEquipment(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDeleteEquipment(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const borrowColumns: ColumnsType<BorrowRecord> = [
    {
      title: '设备',
      dataIndex: 'equipmentId',
      render: id => getEquipmentName(id),
    },
    {
      title: '借用人',
      dataIndex: 'borrowerId',
      render: id => getMemberName(id),
    },
    {
      title: '借出日期',
      dataIndex: 'borrowDate',
    },
    {
      title: '预计归还',
      dataIndex: 'expectedReturnDate',
    },
    {
      title: '实际归还',
      dataIndex: 'actualReturnDate',
      render: v => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: s => <Tag color={getBorrowStatusColor(s)}>{getBorrowStatusText(s)}</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleApproveBorrow(record.id)}
              >
                批准
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleRejectBorrow(record.id)}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleReturnEquipment(record.id)}
            >
              确认归还
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const resourceColumns: ColumnsType<SharedResource> = [
    {
      title: '资源名称',
      dataIndex: 'name',
      render: (_, record) => (
        <Space>
          {record.type === 'score' && <FileTextOutlined />}
          {record.type === 'recording' && <ClockCircleOutlined />}
          {record.type === 'document' && <FileTextOutlined />}
          {record.type === 'other' && <ShareAltOutlined />}
          <span style={{ fontWeight: 500 }}>{record.name}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: t => {
        const labels: Record<string, string> = {
          score: '乐谱',
          recording: '录音',
          document: '文档',
          other: '其他',
        };
        return <Tag color="purple">{labels[t] || t}</Tag>;
      },
    },
    {
      title: '上传者',
      dataIndex: 'ownerId',
      render: id => getMemberName(id),
    },
    {
      title: '共享给',
      dataIndex: 'permissions',
      render: p => (
        <Space wrap>
          {p.length === 0 ? (
            <Tag color="green">所有人</Tag>
          ) : (
            p.slice(0, 3).map((perm: any, idx: number) => (
              <Tag key={idx} color="blue">{getMemberName(perm.memberId)}</Tag>
            ))
          )}
          {p.length > 3 && <Tag>等{p.length}人</Tag>}
        </Space>
      ),
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      render: t => dayjs(t).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />}>预览</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDeleteResource(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    totalEquipment: equipment.length,
    availableEquipment: equipment.filter(e => e.available).length,
    pendingBorrows: borrowRecords.filter(r => r.status === 'pending').length,
    totalResources: sharedResources.length,
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="设备总数" value={stats.totalEquipment} prefix={<ToolOutlined />} suffix="件" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="可用设备"
              value={stats.availableEquipment}
              prefix={<CheckCircleOutlined />}
              suffix="件"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审批借用"
              value={stats.pendingBorrows}
              prefix={<WarningOutlined />}
              suffix="条"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="共享资源" value={stats.totalResources} prefix={<ShareAltOutlined />} suffix="个" />
          </Card>
        </Col>
      </Row>

      <Card
        tabList={[
          { key: 'equipment', label: '设备管理' },
          { key: 'borrow', label: '借用记录' },
          { key: 'resources', label: '共享资源' },
        ]}
        activeTabKey={activeTab}
        onTabChange={key => setActiveTab(key as any)}
        extra={
          activeTab === 'equipment' ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEquipment}>
              添加设备
            </Button>
          ) : activeTab === 'resources' ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddResource}>
              上传资源
            </Button>
          ) : null
        }
      >
        {activeTab === 'equipment' && (
          <Table columns={equipmentColumns} dataSource={equipment} rowKey="id" />
        )}

        {activeTab === 'borrow' && (
          <Table columns={borrowColumns} dataSource={borrowRecords} rowKey="id" />
        )}

        {activeTab === 'resources' && (
          <Table columns={resourceColumns} dataSource={sharedResources} rowKey="id" />
        )}
      </Card>

      <Modal
        title={editingEquipment ? '编辑设备' : '添加设备'}
        open={equipmentModalVisible}
        onCancel={() => setEquipmentModalVisible(false)}
        onOk={handleSaveEquipment}
        width={500}
      >
        <Form form={equipmentForm} layout="vertical">
          <Form.Item name="name" label="设备名称" rules={[{ required: true }]}>
            <Input placeholder="如：Fender 电吉他" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="分类" rules={[{ required: true }]}>
                <Select
                  placeholder="选择分类"
                  options={[
                    { label: '吉他', value: '吉他' },
                    { label: '贝斯', value: '贝斯' },
                    { label: '鼓', value: '鼓' },
                    { label: '键盘', value: '键盘' },
                    { label: '管乐', value: '管乐' },
                    { label: '弦乐', value: '弦乐' },
                    { label: '话筒', value: '话筒' },
                    { label: '效果器', value: '效果器' },
                    { label: '其他', value: '其他' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ownerId" label="所有者" rules={[{ required: true }]}>
                <Select
                  placeholder="选择所有者"
                  options={members.map(m => ({ label: m.name, value: m.id }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="设备描述">
            <Input.TextArea rows={3} placeholder="描述设备的品牌、型号、状态等信息" />
          </Form.Item>
          <Form.Item name="available" label="是否可用" valuePropName="checked">
            <Select
              options={[
                { label: '可用', value: true },
                { label: '不可用', value: false },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="申请借用设备"
        open={borrowModalVisible}
        onCancel={() => setBorrowModalVisible(false)}
        onOk={handleSubmitBorrow}
      >
        {selectedEquipment && (
          <div style={{ marginBottom: 16 }}>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="设备名称">{selectedEquipment.name}</Descriptions.Item>
              <Descriptions.Item label="分类">{selectedEquipment.category}</Descriptions.Item>
              <Descriptions.Item label="所有者">{getMemberName(selectedEquipment.ownerId)}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
        <Form form={borrowForm} layout="vertical">
          <Form.Item name="borrowerId" label="借用人" rules={[{ required: true }]}>
            <Select
              placeholder="选择借用人"
              options={members.map(m => ({ label: m.name, value: m.id }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="borrowDate" label="借用日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expectedReturnDate" label="预计归还日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} placeholder="借用用途或其他说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="上传共享资源"
        open={resourceModalVisible}
        onCancel={() => setResourceModalVisible(false)}
        onOk={handleSaveResource}
        width={600}
      >
        <Form form={resourceForm} layout="vertical">
          <Form.Item name="name" label="资源名称" rules={[{ required: true }]}>
            <Input placeholder="如：海阔天空-总谱.pdf" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="资源类型" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '乐谱', value: 'score' },
                    { label: '录音', value: 'recording' },
                    { label: '文档', value: 'document' },
                    { label: '其他', value: 'other' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ownerId" label="上传者" rules={[{ required: true }]}>
                <Select
                  options={members.map(m => ({ label: m.name, value: m.id }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="permissions" label="共享给">
            <Select
              mode="multiple"
              placeholder="选择可访问的成员（不选则对所有人可见）"
              style={{ width: '100%' }}
              options={members.map(m => ({ label: m.name, value: m.id }))}
            />
          </Form.Item>
          <Form.Item label="上传文件">
            <Dragger
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              multiple
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
              <p className="ant-upload-hint">支持 PDF、音频、图片等多种格式</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResourceSharing;
