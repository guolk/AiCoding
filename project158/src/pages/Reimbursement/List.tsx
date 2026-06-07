import { useEffect, useState, useMemo } from 'react';
import {
  Button, Table, Space, Tag, Card, Row, Col, Statistic,
  Tabs, Timeline, Badge, Empty
} from 'antd';
import { Plus, FileText, Clock, CheckCircle, XCircle, Send, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useReimbursementStore } from '@/store/useReimbursementStore';
import type { Reimbursement, ReimbursementStatus, ReimbursementStatusLog } from '@/types/reimbursement';

const { TabPane } = Tabs;

const statusMap: Record<ReimbursementStatus, { text: string; color: string; icon: React.ReactNode }> = {
  draft: { text: '草稿', color: 'default', icon: <FileText size={16} /> },
  submitted: { text: '已提交', color: 'blue', icon: <Send size={16} /> },
  reviewing: { text: '审核中', color: 'orange', icon: <Clock size={16} /> },
  paid: { text: '已打款', color: 'green', icon: <CheckCircle size={16} /> },
  rejected: { text: '已驳回', color: 'red', icon: <XCircle size={16} /> },
};

const statusOrder: ReimbursementStatus[] = ['draft', 'submitted', 'reviewing', 'paid', 'rejected'];

const timelineColorMap: Record<ReimbursementStatus, string> = {
  draft: '#bfbfbf',
  submitted: '#1890ff',
  reviewing: '#faad14',
  paid: '#52c41a',
  rejected: '#ff4d4f',
};

export default function ReimbursementList() {
  const navigate = useNavigate();
  const reimbursements = useReimbursementStore(state => state.reimbursements);
  const loading = useReimbursementStore(state => state.loading);
  const fetchReimbursements = useReimbursementStore(state => state.fetchReimbursements);
  const submitReimbursement = useReimbursementStore(state => state.submitReimbursement);

  const [activeTab, setActiveTab] = useState<ReimbursementStatus | 'all'>('all');

  useEffect(() => {
    fetchReimbursements();
  }, [fetchReimbursements]);

  const stats = useMemo(() => {
    const result: Record<string, { count: number; amount: number }> = {
      all: { count: 0, amount: 0 },
      draft: { count: 0, amount: 0 },
      submitted: { count: 0, amount: 0 },
      reviewing: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
    };

    reimbursements.forEach(r => {
      result.all.count++;
      result.all.amount += r.totalAmount;
      if (result[r.status]) {
        result[r.status].count++;
        result[r.status].amount += r.totalAmount;
      }
    });

    return result;
  }, [reimbursements]);

  const filteredReimbursements = useMemo(() => {
    if (activeTab === 'all') return reimbursements;
    return reimbursements.filter(r => r.status === activeTab);
  }, [reimbursements, activeTab]);

  const getStatusTimeline = (statusLogs: ReimbursementStatusLog[], currentStatus: ReimbursementStatus) => {
    const items: { color: string; dot: React.ReactNode; children: React.ReactNode }[] = [];
    const currentIndex = statusOrder.indexOf(currentStatus);

    statusOrder.forEach((status, index) => {
      const log = statusLogs.find(l => l.status === status);
      const isPassed = index <= currentIndex;
      const color = isPassed ? timelineColorMap[status] : '#e8e8e8';

      items.push({
        color,
        dot: isPassed ? statusMap[status].icon : undefined,
        children: (
          <div className={isPassed ? '' : 'text-gray-400'}>
            <div className="font-medium">{statusMap[status].text}</div>
            {log && (
              <div className="text-sm text-gray-500">
                {dayjs(log.time).format('MM-DD HH:mm')} · {log.operatorName}
                {log.comment && <div className="text-xs mt-1">{log.comment}</div>}
              </div>
            )}
            {!log && <div className="text-sm">等待中</div>}
          </div>
        ),
      });
    });

    return items;
  };

  const handleSubmit = async (id: string) => {
    try {
      await submitReimbursement(id);
      // message.success('提交成功');
    } catch {
      // message.error('提交失败');
    }
  };

  const expandedRowRender = (record: Reimbursement) => {
    const timelineItems = getStatusTimeline(record.statusLogs || [], record.status);
    return (
      <div className="px-8 py-4">
        <div className="mb-4">
          <span className="font-medium text-gray-600">状态流转时间线</span>
        </div>
        <Timeline
          mode="left"
          items={timelineItems}
        />
        {record.rejectReason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600 font-medium mb-1">驳回原因</div>
            <div className="text-red-500">{record.rejectReason}</div>
          </div>
        )}
        {record.paidTime && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-600 font-medium mb-1">打款信息</div>
            <div className="text-green-500">
              打款时间：{dayjs(record.paidTime).format('YYYY-MM-DD HH:mm:ss')}
              <span className="mx-2">|</span>
              打款金额：¥{record.paidAmount?.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: '报销单标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Reimbursement) => (
        <a onClick={() => navigate(`/reimbursement/${record.id}`)} className="font-medium">
          {text}
        </a>
      ),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      render: (value: number) => <span className="font-semibold text-lg">¥{value.toLocaleString()}</span>,
      sorter: (a: Reimbursement, b: Reimbursement) => a.totalAmount - b.totalAmount,
    },
    {
      title: '费用项数',
      dataIndex: 'items',
      key: 'items',
      width: 100,
      render: (items: any[]) => (
        <Badge count={items?.length || 0} showZero color="#1890ff" />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ReimbursementStatus) => {
        const info = statusMap[status];
        return (
          <Tag color={info.color} className="text-sm py-1 px-3">
            <Space size={4}>
              {info.icon}
              {info.text}
            </Space>
          </Tag>
        );
      },
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName',
      width: 100,
      render: (name: string) => name || '-',
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: Reimbursement) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/reimbursement/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'draft' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleSubmit(record.id)}
            >
              提交
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const statCards = [
    { key: 'all', label: '全部', count: stats.all.count, amount: stats.all.amount, color: '#1890ff', icon: <FileText size={20} /> },
    { key: 'draft', label: '草稿', count: stats.draft.count, amount: stats.draft.amount, color: '#8c8c8c', icon: <FileText size={20} /> },
    { key: 'submitted', label: '已提交', count: stats.submitted.count, amount: stats.submitted.amount, color: '#1890ff', icon: <Send size={20} /> },
    { key: 'reviewing', label: '审核中', count: stats.reviewing.count, amount: stats.reviewing.amount, color: '#faad14', icon: <Clock size={20} /> },
    { key: 'paid', label: '已打款', count: stats.paid.count, amount: stats.paid.amount, color: '#52c41a', icon: <DollarSign size={20} /> },
    { key: 'rejected', label: '已驳回', count: stats.rejected.count, amount: stats.rejected.amount, color: '#ff4d4f', icon: <XCircle size={20} /> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold m-0">报销管理</h2>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/reimbursement/create')}>
          创建报销单
        </Button>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        {statCards.map(card => (
          <Col xs={24} sm={12} lg={4} key={card.key}>
            <Card
              size="small"
              className={`cursor-pointer transition-all ${activeTab === card.key ? 'border-2' : ''}`}
              style={{ borderColor: activeTab === card.key ? card.color : undefined }}
              onClick={() => setActiveTab(card.key as ReimbursementStatus | 'all')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{card.label}</p>
                  <p className="text-2xl font-bold m-0" style={{ color: card.color }}>
                    {card.count}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    ¥{card.amount.toLocaleString()}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <span style={{ color: card.color }}>{card.icon}</span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ReimbursementStatus | 'all')}
          className="mb-4"
          items={[
            { key: 'all', label: '全部' },
            { key: 'draft', label: `草稿 (${stats.draft.count})` },
            { key: 'submitted', label: `已提交 (${stats.submitted.count})` },
            { key: 'reviewing', label: `审核中 (${stats.reviewing.count})` },
            { key: 'paid', label: `已打款 (${stats.paid.count})` },
            { key: 'rejected', label: `已驳回 (${stats.rejected.count})` },
          ]}
        />

        {filteredReimbursements.length === 0 ? (
          <Empty description="暂无报销单" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredReimbursements}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            expandable={{
              expandedRowRender,
              defaultExpandAllRows: false,
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        )}
      </Card>
    </div>
  );
}
