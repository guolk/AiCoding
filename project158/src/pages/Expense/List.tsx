import { useEffect, useState, useMemo } from 'react';
import {
  Button, Table, Space, Tag, Card, Input, Select, DatePicker,
  Row, Col, Statistic, Progress, Checkbox, Modal, message, Popconfirm, Image
} from 'antd';
import {
  Plus, Search, Edit, Delete, Eye, FileText, Car, Hotel,
  Coffee, Users, MoreHorizontal, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useItineraryStore } from '@/store/useItineraryStore';
import { useReimbursementStore } from '@/store/useReimbursementStore';
import type { Expense, ExpenseCategory, ExpenseStatus } from '@/types/expense';
import type { InvoiceImage } from '@/types/common';

const { RangePicker } = DatePicker;
const { Option } = Select;

const statusMap: Record<ExpenseStatus, { text: string; color: string }> = {
  unsubmitted: { text: '未提交', color: 'default' },
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '已批准', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
  reimbursed: { text: '已报销', color: 'blue' },
};

const categoryMap: Record<ExpenseCategory, { label: string; icon: React.ReactNode; color: string }> = {
  transport: { label: '交通', icon: <Car size={18} />, color: '#1890ff' },
  accommodation: { label: '住宿', icon: <Hotel size={18} />, color: '#722ed1' },
  food: { label: '餐饮', icon: <Coffee size={18} />, color: '#fa8c16' },
  entertainment: { label: '招待', icon: <Users size={18} />, color: '#eb2f96' },
  other: { label: '其他', icon: <MoreHorizontal size={18} />, color: '#8c8c8c' },
};

const categoryColors: Record<ExpenseCategory, string> = {
  transport: '#1890ff',
  accommodation: '#722ed1',
  food: '#fa8c16',
  entertainment: '#eb2f96',
  other: '#8c8c8c',
};

export default function ExpenseList() {
  const navigate = useNavigate();
  const expenses = useExpenseStore(state => state.expenses);
  const loading = useExpenseStore(state => state.loading);
  const fetchExpenses = useExpenseStore(state => state.fetchExpenses);
  const deleteExpense = useExpenseStore(state => state.deleteExpense);
  const budgetComparison = useExpenseStore(state => state.budgetComparison);
  const calculateBudgetComparison = useExpenseStore(state => state.calculateBudgetComparison);

  const itineraries = useItineraryStore(state => state.itineraries);
  const fetchItineraries = useItineraryStore(state => state.fetchItineraries);

  const createReimbursement = useReimbursementStore(state => state.createReimbursement);
  const reimbursementLoading = useReimbursementStore(state => state.loading);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | undefined>();
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [itineraryFilter, setItineraryFilter] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [previewImage, setPreviewImage] = useState<InvoiceImage | null>(null);
  const [createReimbursementModal, setCreateReimbursementModal] = useState(false);
  const [reimbursementTitle, setReimbursementTitle] = useState('');

  useEffect(() => {
    fetchExpenses();
    fetchItineraries();
  }, [fetchExpenses, fetchItineraries]);

  useEffect(() => {
    if (itineraryFilter) {
      calculateBudgetComparison(itineraryFilter);
    }
  }, [itineraryFilter, calculateBudgetComparison]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (categoryFilter && expense.category !== categoryFilter) return false;
      if (statusFilter && expense.status !== statusFilter) return false;
      if (itineraryFilter && expense.itineraryId !== itineraryFilter) return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const expenseDate = dayjs(expense.expenseDate);
        if (expenseDate.isBefore(dateRange[0]) || expenseDate.isAfter(dateRange[1])) return false;
      }
      if (searchText) {
        const search = searchText.toLowerCase();
        const matchDescription = expense.description?.toLowerCase().includes(search);
        const matchMerchant = expense.merchant?.toLowerCase().includes(search);
        const matchAmount = expense.amount.toString().includes(search);
        if (!matchDescription && !matchMerchant && !matchAmount) return false;
      }
      return true;
    });
  }, [expenses, categoryFilter, statusFilter, dateRange, searchText, itineraryFilter]);

  const categoryStats = useMemo(() => {
    const stats: Record<ExpenseCategory, number> = {
      transport: 0,
      accommodation: 0,
      food: 0,
      entertainment: 0,
      other: 0,
    };
    filteredExpenses.forEach(e => {
      stats[e.category] += e.amount;
    });
    return stats;
  }, [filteredExpenses]);

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      message.success('删除成功');
    } catch {
      message.error('删除失败');
    }
  };

  const handleBatchCreateReimbursement = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择费用项');
      return;
    }
    if (!reimbursementTitle.trim()) {
      message.warning('请输入报销单标题');
      return;
    }
    try {
      await createReimbursement(selectedRowKeys as string[], reimbursementTitle);
      message.success('报销单创建成功');
      setCreateReimbursementModal(false);
      setSelectedRowKeys([]);
      setReimbursementTitle('');
      navigate('/reimbursement');
    } catch {
      message.error('创建失败');
    }
  };

  const selectedExpenses = expenses.filter(e => selectedRowKeys.includes(e.id));
  const selectedTotal = selectedExpenses.reduce((sum, e) => sum + e.amount, 0);

  const columns = [
    {
      title: '费用类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: ExpenseCategory) => {
        const info = categoryMap[category];
        return (
          <Space>
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
      sorter: (a: Expense, b: Expense) => a.amount - b.amount,
    },
    {
      title: '消费日期',
      dataIndex: 'expenseDate',
      key: 'expenseDate',
      width: 120,
      sorter: (a: Expense, b: Expense) => dayjs(a.expenseDate).valueOf() - dayjs(b.expenseDate).valueOf(),
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
      width: 100,
      render: (images: InvoiceImage[], record: Expense) => (
        <Space>
          <Tag color={images.length > 0 ? 'green' : 'red'}>
            {images.length > 0 ? `${images.length} 张` : '无'}
          </Tag>
          {images.length > 0 && (
            <Button
              type="link"
              size="small"
              onClick={() => setPreviewImage(images[0])}
              icon={<Eye size={14} />}
            >
              预览
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ExpenseStatus) => {
        const info = statusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: Expense) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => message.info('查看详情功能开发中')}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<Edit size={14} />}
            disabled={record.status !== 'unsubmitted'}
            onClick={() => message.info('编辑功能开发中')}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此费用记录？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={record.status !== 'unsubmitted'}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<Delete size={14} />}
              disabled={record.status !== 'unsubmitted'}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record: Expense) => ({
      disabled: record.status !== 'unsubmitted',
    }),
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold m-0">费用列表</h2>
          <Tag color="blue" className="text-base py-1 px-3">
            总计: ¥{totalAmount.toLocaleString()}
          </Tag>
        </div>
        <Space>
          {selectedRowKeys.length > 0 && (
            <Button
              icon={<FileText size={16} />}
              onClick={() => setCreateReimbursementModal(true)}
            >
              批量创建报销单 ({selectedRowKeys.length})
            </Button>
          )}
          <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/expense/create')}>
            费用录入
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        {(['transport', 'accommodation', 'food', 'entertainment', 'other'] as ExpenseCategory[]).map(category => (
          <Col xs={24} sm={12} lg={4.8} key={category}>
            <Card size="small">
              <Statistic
                title={
                  <Space>
                    <span style={{ color: categoryColors[category] }}>{categoryMap[category].icon}</span>
                    <span>{categoryMap[category].label}</span>
                  </Space>
                }
                value={categoryStats[category]}
                precision={2}
                prefix="¥"
                valueStyle={{ color: categoryColors[category], fontSize: '18px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {itineraryFilter && budgetComparison && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">关联行程预算使用情况</span>
            <Space>
              <span>预算: ¥{budgetComparison.budget.toLocaleString()}</span>
              <span>已用: ¥{budgetComparison.actual.toLocaleString()}</span>
              <span className={budgetComparison.difference >= 0 ? 'text-green-500' : 'text-red-500'}>
                剩余: ¥{budgetComparison.difference.toLocaleString()}
              </span>
            </Space>
          </div>
          <Progress
            percent={budgetComparison.percentage}
            status={budgetComparison.percentage > 100 ? 'exception' : 'active'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': budgetComparison.percentage > 100 ? '#ff4d4f' : '#52c41a',
            }}
          />
        </Card>
      )}

      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="搜索说明/商家/金额"
              prefix={<Search size={16} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder={<Space><Filter size={14} />类别筛选</Space>}
              value={categoryFilter}
              onChange={setCategoryFilter}
              allowClear
              className="w-full"
            >
              {(['transport', 'accommodation', 'food', 'entertainment', 'other'] as ExpenseCategory[]).map(cat => (
                <Option key={cat} value={cat}>
                  <Space>
                    <span style={{ color: categoryColors[cat] }}>{categoryMap[cat].icon}</span>
                    {categoryMap[cat].label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              className="w-full"
            >
              {(['unsubmitted', 'pending', 'approved', 'rejected', 'reimbursed'] as ExpenseStatus[]).map(status => (
                <Option key={status} value={status}>
                  {statusMap[status].text}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="关联行程"
              value={itineraryFilter}
              onChange={setItineraryFilter}
              allowClear
              className="w-full"
              showSearch
              optionFilterProp="children"
            >
              {itineraries.map(itinerary => (
                <Option key={itinerary.id} value={itinerary.id}>
                  {itinerary.title}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={5}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full"
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredExpenses}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredExpenses.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <Modal
        title="创建报销单"
        open={previewImage !== null}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        width={600}
      >
        {previewImage && (
          <div className="text-center">
            <p className="mb-4">{previewImage.fileName}</p>
            <Image
              src={previewImage.url}
              alt={previewImage.fileName}
              style={{ maxHeight: '70vh', maxWidth: '100%' }}
            />
          </div>
        )}
      </Modal>

      <Modal
        title="批量创建报销单"
        open={createReimbursementModal}
        onCancel={() => setCreateReimbursementModal(false)}
        onOk={handleBatchCreateReimbursement}
        confirmLoading={reimbursementLoading}
        okText="创建"
        cancelText="取消"
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-2">已选择 <span className="font-semibold text-blue-500">{selectedRowKeys.length}</span> 项费用</p>
          <p className="text-gray-600">合计金额: <span className="font-semibold text-lg">¥{selectedTotal.toLocaleString()}</span></p>
        </div>
        <div className="mb-4">
          <Checkbox
            checked={selectedExpenses.every(e => e.images.length > 0)}
            disabled
          >
            所有费用项均已上传发票
          </Checkbox>
        </div>
        <Input
          placeholder="请输入报销单标题，如：2024年1月北京出差报销"
          value={reimbursementTitle}
          onChange={e => setReimbursementTitle(e.target.value)}
        />
      </Modal>
    </div>
  );
}
