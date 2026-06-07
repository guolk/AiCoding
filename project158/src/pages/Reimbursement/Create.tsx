import { useEffect, useState, useMemo } from 'react';
import {
  Card, Form, Input, Button, Space, Table, Checkbox, message, Tag,
  Row, Col, Statistic, Modal, Select, Alert, Divider
} from 'antd';
import {
  ArrowLeft, Save, FileCheck, Eye, AlertTriangle, Car, Hotel,
  Coffee, Users, MoreHorizontal, FileText, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReimbursementStore } from '@/store/useReimbursementStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useItineraryStore } from '@/store/useItineraryStore';
import type { Expense, ExpenseCategory } from '@/types/expense';
import type { InvoiceImage } from '@/types/common';

const { Option } = Select;

const categoryMap: Record<ExpenseCategory, { label: string; icon: React.ReactNode; color: string }> = {
  transport: { label: '交通', icon: <Car size={16} />, color: '#1890ff' },
  accommodation: { label: '住宿', icon: <Hotel size={16} />, color: '#722ed1' },
  food: { label: '餐饮', icon: <Coffee size={16} />, color: '#fa8c16' },
  entertainment: { label: '招待', icon: <Users size={16} />, color: '#eb2f96' },
  other: { label: '其他', icon: <MoreHorizontal size={16} />, color: '#8c8c8c' },
};

export default function ReimbursementCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [itineraryFilter, setItineraryFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | undefined>();
  const [previewModal, setPreviewModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<InvoiceImage | null>(null);

  const createReimbursement = useReimbursementStore(state => state.createReimbursement);
  const loading = useReimbursementStore(state => state.loading);
  const checkCompleteness = useReimbursementStore(state => state.checkCompleteness);

  const expenses = useExpenseStore(state => state.expenses);
  const fetchExpenses = useExpenseStore(state => state.fetchExpenses);

  const itineraries = useItineraryStore(state => state.itineraries);
  const fetchItineraries = useItineraryStore(state => state.fetchItineraries);

  useEffect(() => {
    fetchExpenses();
    fetchItineraries();
  }, [fetchExpenses, fetchItineraries]);

  const unsubmittedExpenses = useMemo(() => {
    let filtered = expenses.filter(e => e.status === 'unsubmitted');
    if (itineraryFilter) {
      filtered = filtered.filter(e => e.itineraryId === itineraryFilter);
    }
    if (categoryFilter) {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }
    return filtered;
  }, [expenses, itineraryFilter, categoryFilter]);

  const selectedTotal = selectedExpenses.reduce((sum, id) => {
    const expense = expenses.find(e => e.id === id);
    return sum + (expense?.amount || 0);
  }, 0);

  const selectedCount = selectedExpenses.length;

  const completeness = useMemo(() => {
    return checkCompleteness(selectedExpenses);
  }, [selectedExpenses, checkCompleteness]);

  const missingInvoiceCount = selectedExpenses.filter(id => {
    const expense = expenses.find(e => e.id === id);
    return expense && expense.images.length === 0;
  }).length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(unsubmittedExpenses.map(e => e.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleSelectExpense = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedExpenses([...selectedExpenses, id]);
    } else {
      setSelectedExpenses(selectedExpenses.filter(eid => eid !== id));
    }
  };

  const handleCreate = async (values: { title: string }) => {
    if (selectedExpenses.length === 0) {
      message.error('请至少选择一项费用');
      return;
    }
    if (!values.title?.trim()) {
      message.error('请输入报销单标题');
      return;
    }
    if (missingInvoiceCount > 0) {
      Modal.confirm({
        title: '确认提交',
        icon: <AlertTriangle className="text-yellow-500" />,
        content: `您选择的费用中有 ${missingInvoiceCount} 项缺少发票，是否继续创建？`,
        okText: '继续创建',
        cancelText: '返回修改',
        onOk: async () => {
          try {
            await createReimbursement(selectedExpenses, values.title, itineraryFilter);
            message.success('报销单创建成功');
            navigate('/reimbursement');
          } catch {
            message.error('创建失败，请重试');
          }
        },
      });
      return;
    }
    try {
      await createReimbursement(selectedExpenses, values.title, itineraryFilter);
      message.success('报销单创建成功');
      navigate('/reimbursement');
    } catch {
      message.error('创建失败，请重试');
    }
  };

  const columns = [
    {
      title: '选择',
      key: 'select',
      width: 60,
      render: (_: unknown, record: Expense) => (
        <Checkbox
          checked={selectedExpenses.includes(record.id)}
          onChange={(e) => handleSelectExpense(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: '费用类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: ExpenseCategory) => {
        const info = categoryMap[category];
        return (
          <Space size={4}>
            <span style={{ color: info.color }}>{info.icon}</span>
            <span>{info.label}</span>
          </Space>
        );
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (value: number) => <span className="font-semibold">¥{value.toLocaleString()}</span>,
    },
    {
      title: '消费日期',
      dataIndex: 'expenseDate',
      key: 'expenseDate',
      width: 120,
    },
    {
      title: '商家',
      dataIndex: 'merchant',
      key: 'merchant',
      width: 150,
      ellipsis: true,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '关联行程',
      dataIndex: 'itineraryId',
      key: 'itineraryId',
      width: 150,
      render: (itineraryId: string) => {
        const itinerary = itineraries.find(i => i.id === itineraryId);
        return itinerary ? <Tag color="blue">{itinerary.title}</Tag> : '-';
      },
    },
    {
      title: '发票',
      dataIndex: 'images',
      key: 'images',
      width: 120,
      render: (images: InvoiceImage[], record: Expense) => {
        const hasMissingInvoice = selectedExpenses.includes(record.id) && images.length === 0;
        return (
          <div className="flex items-center gap-2">
            <Tag color={images.length > 0 ? 'green' : 'red'}>
              {images.length > 0 ? `${images.length} 张` : '无'}
            </Tag>
            {images.length > 0 && (
              <Button
                type="link"
                size="small"
                onClick={() => setPreviewImage(images[0])}
              >
                预览
              </Button>
            )}
            {hasMissingInvoice && (
              <AlertTriangle size={14} className="text-red-500" />
            )}
          </div>
        );
      },
    },
  ];

  const previewExpenses = selectedExpenses.map(id => expenses.find(e => e.id === id)).filter(Boolean) as Expense[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/reimbursement')}>
            返回
          </Button>
          <h2 className="text-2xl font-bold m-0">创建报销单</h2>
        </div>
        <Space>
          <Button
            icon={<Eye size={16} />}
            onClick={() => setPreviewModal(true)}
            disabled={selectedExpenses.length === 0}
          >
            预览报销单
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title={
                <Space>
                  <FileText size={16} />
                  <span>已选费用项</span>
                </Space>
              }
              value={selectedCount}
              suffix="项"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title={
                <Space>
                  <FileCheck size={16} />
                  <span>报销总金额</span>
                </Space>
              }
              value={selectedTotal}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className={missingInvoiceCount > 0 ? 'border-red-300' : ''}>
            <Statistic
              title={
                <Space>
                  {missingInvoiceCount > 0 ? <AlertTriangle size={16} className="text-red-500" /> : <FileCheck size={16} />}
                  <span>缺少发票</span>
                </Space>
              }
              value={missingInvoiceCount}
              suffix="项"
              valueStyle={{ color: missingInvoiceCount > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {missingInvoiceCount > 0 && (
        <Alert
          message="完整性检查"
          description={`有 ${missingInvoiceCount} 项费用缺少发票，可能会影响审核进度。建议补充发票后再提交。`}
          type="warning"
          showIcon
          className="mb-6"
        />
      )}

      <Card className="mb-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="报销单标题"
                rules={[{ required: true, message: '请输入报销单标题' }]}
              >
                <Input placeholder="请输入报销单标题，例如：2024年1月北京出差报销" maxLength={50} showCount />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="关联行程（可选）">
                <Select
                  placeholder="按行程筛选费用"
                  value={itineraryFilter}
                  onChange={setItineraryFilter}
                  allowClear
                  className="w-full"
                  showSearch
                  optionFilterProp="children"
                >
                  {itineraries.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title={
          <Space>
            <span>选择费用项</span>
            <Checkbox
              checked={unsubmittedExpenses.length > 0 && selectedExpenses.length === unsubmittedExpenses.length}
              indeterminate={selectedExpenses.length > 0 && selectedExpenses.length < unsubmittedExpenses.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              全选
            </Checkbox>
            <Select
              placeholder="按类别筛选"
              value={categoryFilter}
              onChange={setCategoryFilter}
              allowClear
              className="w-32"
              size="small"
            >
              {(['transport', 'accommodation', 'food', 'entertainment', 'other'] as ExpenseCategory[]).map(cat => (
                <Option key={cat} value={cat}>
                  {categoryMap[cat].label}
                </Option>
              ))}
            </Select>
          </Space>
        }
        extra={
          <Tag color="blue" className="text-base py-1 px-3">
            已选: {selectedExpenses.length} 项，合计: ¥{selectedTotal.toLocaleString()}
          </Tag>
        }
      >
        {unsubmittedExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">暂无可报销的费用</p>
            <p className="text-sm mt-2">请先录入费用后再创建报销单</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={unsubmittedExpenses}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            rowClassName={(record) =>
              selectedExpenses.includes(record.id) && record.images.length === 0
                ? 'bg-red-50'
                : ''
            }
          />
        )}
      </Card>

      <div className="mt-6 flex justify-end">
        <Space>
          <Button onClick={() => navigate('/reimbursement')}>取消</Button>
          <Button
            type="primary"
            icon={<FileCheck size={16} />}
            onClick={() => form.submit()}
            loading={loading}
            disabled={selectedExpenses.length === 0}
          >
            创建报销单
          </Button>
        </Space>
      </div>

      <Modal
        title="报销单预览"
        open={previewModal}
        onCancel={() => setPreviewModal(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModal(false)}>关闭</Button>,
          <Button key="confirm" type="primary" onClick={() => {
            setPreviewModal(false);
            form.submit();
          }}>
            确认创建
          </Button>,
        ]}
        width={800}
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">{form.getFieldValue('title') || '报销单预览'}</h3>
          <p className="text-gray-500">申请人：张明</p>
          <p className="text-gray-500">创建时间：{new Date().toLocaleString()}</p>
        </div>

        <Divider />

        <Table
          columns={[
            { title: '类别', dataIndex: 'category', key: 'category', width: 100, render: (c: ExpenseCategory) => categoryMap[c].label },
            { title: '日期', dataIndex: 'expenseDate', key: 'expenseDate', width: 120 },
            { title: '说明', dataIndex: 'description', key: 'description' },
            { title: '商家', dataIndex: 'merchant', key: 'merchant', width: 120 },
            { title: '金额', dataIndex: 'amount', key: 'amount', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
          ]}
          dataSource={previewExpenses}
          rowKey="id"
          pagination={false}
          size="small"
          summary={(pageData) => {
            let total = 0;
            pageData.forEach((data: any) => { total += data.amount || 0; });
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>合计</Table.Summary.Cell>
                <Table.Summary.Cell index={4} className="font-bold">¥{total.toLocaleString()}</Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />

        {missingInvoiceCount > 0 && (
          <Alert
            message="注意"
            description={`有 ${missingInvoiceCount} 项费用缺少发票`}
            type="warning"
            showIcon
            className="mt-4"
          />
        )}
      </Modal>

      <Modal
        title="发票预览"
        open={previewImage !== null}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        width={600}
      >
        {previewImage && (
          <div className="text-center">
            <p className="mb-4">{previewImage.fileName}</p>
            <img
              src={previewImage.url}
              alt={previewImage.fileName}
              style={{ maxHeight: '70vh', maxWidth: '100%' }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
