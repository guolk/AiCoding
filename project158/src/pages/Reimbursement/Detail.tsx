import { useEffect, useState, useMemo } from 'react';
import {
  Card, Descriptions, Tag, Button, Space, Spin, Table, message,
  Timeline, Modal, Alert, Divider, Row, Col, Statistic
} from 'antd';
import {
  ArrowLeft, Edit, Send, Printer, FileCheck, Clock,
  CheckCircle, XCircle, FileText, Download, Car, Hotel,
  Coffee, Users, MoreHorizontal
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { useReimbursementStore } from '@/store/useReimbursementStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useItineraryStore } from '@/store/useItineraryStore';
import type { Reimbursement, ReimbursementStatus, ReimbursementStatusLog } from '@/types/reimbursement';
import type { Expense, ExpenseCategory } from '@/types/expense';

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

const categoryMap: Record<ExpenseCategory, { label: string; icon: React.ReactNode; color: string }> = {
  transport: { label: '交通', icon: <Car size={16} />, color: '#1890ff' },
  accommodation: { label: '住宿', icon: <Hotel size={16} />, color: '#722ed1' },
  food: { label: '餐饮', icon: <Coffee size={16} />, color: '#fa8c16' },
  entertainment: { label: '招待', icon: <Users size={16} />, color: '#eb2f96' },
  other: { label: '其他', icon: <MoreHorizontal size={16} />, color: '#8c8c8c' },
};

export default function ReimbursementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentReimbursement = useReimbursementStore(state => state.currentReimbursement);
  const loading = useReimbursementStore(state => state.loading);
  const fetchReimbursementById = useReimbursementStore(state => state.fetchReimbursementById);
  const submitReimbursement = useReimbursementStore(state => state.submitReimbursement);

  const expenses = useExpenseStore(state => state.expenses);
  const fetchExpenses = useExpenseStore(state => state.fetchExpenses);

  const itineraries = useItineraryStore(state => state.itineraries);
  const fetchItineraries = useItineraryStore(state => state.fetchItineraries);

  const [previewModal, setPreviewModal] = useState(false);
  const [pdfPreviewModal, setPdfPreviewModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReimbursementById(id);
      fetchExpenses();
      fetchItineraries();
    }
  }, [id, fetchReimbursementById, fetchExpenses, fetchItineraries]);

  const handleSubmit = async () => {
    if (!id) return;
    try {
      await submitReimbursement(id);
      message.success('提交成功');
    } catch {
      message.error('提交失败');
    }
  };

  const handleExportPDF = () => {
    setPdfPreviewModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentReimbursement) {
    return (
      <div>
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/reimbursement')}>
          返回
        </Button>
        <div className="mt-8 text-center text-gray-500">
          <p className="text-lg">报销单不存在</p>
        </div>
      </div>
    );
  }

  const statusInfo = statusMap[currentReimbursement.status];

  const reimbursementExpenses = currentReimbursement.items
    .map(item => expenses.find(e => e.id === item.expenseId))
    .filter(Boolean) as Expense[];

  const categoryStats = useMemo(() => {
    const stats: Record<ExpenseCategory, number> = {
      transport: 0,
      accommodation: 0,
      food: 0,
      entertainment: 0,
      other: 0,
    };
    reimbursementExpenses.forEach(e => {
      stats[e.category] += e.amount;
    });
    return stats;
  }, [reimbursementExpenses]);

  const pieChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: (Object.keys(categoryStats) as ExpenseCategory[]).map(key => ({
          value: categoryStats[key],
          name: categoryMap[key].label,
          itemStyle: { color: categoryMap[key].color },
        })).filter(d => d.value > 0),
      },
    ],
  };

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
                <div>{dayjs(log.time).format('YYYY-MM-DD HH:mm')}</div>
                <div>操作人：{log.operatorName}</div>
                {log.comment && <div className="text-xs mt-1 bg-gray-100 p-2 rounded">意见：{log.comment}</div>}
              </div>
            )}
            {!log && <div className="text-sm">等待中</div>}
          </div>
        ),
      });
    });

    return items;
  };

  const timelineItems = getStatusTimeline(
    currentReimbursement.statusLogs || [],
    currentReimbursement.status
  );

  const expenseColumns = [
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
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '发票',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images: any[]) => (
        <Tag color={images.length > 0 ? 'green' : 'red'}>
          {images.length > 0 ? `${images.length} 张` : '无'}
        </Tag>
      ),
    },
  ];

  const itinerary = itineraries.find(i => i.id === currentReimbursement.itineraryId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/reimbursement')}>
            返回
          </Button>
          <h2 className="text-2xl font-bold m-0">{currentReimbursement.title}</h2>
          <Tag color={statusInfo.color} className="text-base py-1 px-3">
            <Space size={4}>
              {statusInfo.icon}
              {statusInfo.text}
            </Space>
          </Tag>
        </div>
        <Space>
          <Button icon={<Download size={16} />} onClick={handleExportPDF}>
            导出PDF
          </Button>
          <Button icon={<Printer size={16} />} onClick={() => setPreviewModal(true)}>
            打印预览
          </Button>
          {currentReimbursement.status === 'draft' && (
            <>
              <Button icon={<Edit size={16} />}>
                编辑
              </Button>
              <Button type="primary" icon={<Send size={16} />} onClick={handleSubmit}>
                提交审批
              </Button>
            </>
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="报销总金额"
              value={currentReimbursement.totalAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="费用项数"
              value={currentReimbursement.items.length}
              suffix="项"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="提交时间"
              value={currentReimbursement.submitTime ? dayjs(currentReimbursement.submitTime).format('MM-DD') : '-'}
              valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="申请人"
              value={currentReimbursement.applicantName || '-'}
              valueStyle={{ color: '#52c41a', fontSize: '18px' }}
            />
          </Card>
        </Col>
      </Row>

      {currentReimbursement.rejectReason && (
        <Alert
          message="驳回原因"
          description={currentReimbursement.rejectReason}
          type="error"
          showIcon
          className="mb-6"
        />
      )}

      {currentReimbursement.paidTime && (
        <Alert
          message="打款信息"
          description={
            <Space>
              <span>打款时间：{dayjs(currentReimbursement.paidTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              <span>打款金额：<span className="font-bold text-green-600">¥{currentReimbursement.paidAmount?.toLocaleString()}</span></span>
            </Space>
          }
          type="success"
          showIcon
          className="mb-6"
        />
      )}

      {itinerary && (
        <Card className="mb-6" size="small">
          <Descriptions column={3} size="small">
            <Descriptions.Item label="关联行程">{itinerary.title}</Descriptions.Item>
            <Descriptions.Item label="行程日期">{itinerary.startDate} ~ {itinerary.endDate}</Descriptions.Item>
            <Descriptions.Item label="行程预算">¥{itinerary.budget.toLocaleString()}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card title="基本信息" className="mb-6">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="报销单标题">{currentReimbursement.title}</Descriptions.Item>
          <Descriptions.Item label="总金额">
            <span className="text-lg font-bold text-blue-600">¥{currentReimbursement.totalAmount.toLocaleString()}</span>
          </Descriptions.Item>
          <Descriptions.Item label="费用项数">{currentReimbursement.items.length} 项</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="申请人">{currentReimbursement.applicantName || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{dayjs(currentReimbursement.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
          <Descriptions.Item label="提交时间">{currentReimbursement.submitTime ? dayjs(currentReimbursement.submitTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
          <Descriptions.Item label="审核时间">{currentReimbursement.reviewTime ? dayjs(currentReimbursement.reviewTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="状态追踪" className="mb-6">
        <Timeline
          mode="left"
          items={timelineItems}
        />
      </Card>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="费用明细">
            <Table
              columns={expenseColumns}
              dataSource={reimbursementExpenses}
              rowKey="id"
              pagination={false}
              summary={(pageData) => {
                let total = 0;
                pageData.forEach((data: any) => {
                  total += data.amount || 0;
                });
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={1}>合计</Table.Summary.Cell>
                    <Table.Summary.Cell index={1} className="font-bold text-lg">¥{total.toLocaleString()}</Table.Summary.Cell>
                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                    <Table.Summary.Cell index={4}></Table.Summary.Cell>
                    <Table.Summary.Cell index={5}></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="费用构成">
            <ReactECharts option={pieChartOption} style={{ height: '300px' }} />
            <div className="mt-4 space-y-2">
              {(Object.keys(categoryStats) as ExpenseCategory[]).map(key => (
                categoryStats[key] > 0 && (
                  <div key={key} className="flex justify-between items-center">
                    <Space size={4}>
                      <span style={{ color: categoryMap[key].color }}>{categoryMap[key].icon}</span>
                      <span>{categoryMap[key].label}</span>
                    </Space>
                    <span className="font-semibold">¥{categoryStats[key].toLocaleString()}</span>
                  </div>
                )
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {currentReimbursement.approvals && currentReimbursement.approvals.length > 0 && (
        <Card title="审批记录" className="mb-6">
          <Space direction="vertical" className="w-full">
            {currentReimbursement.approvals.map((approval: any) => (
              <div key={approval.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Space>
                    <span className={`font-medium ${approval.action === 'approve' ? 'text-green-600' : 'text-red-600'}`}>
                      {approval.action === 'approve' ? '✅ 批准' : '❌ 拒绝'}
                    </span>
                  </Space>
                  <span className="text-gray-500 text-sm">{dayjs(approval.time).format('YYYY-MM-DD HH:mm:ss')}</span>
                </div>
                {approval.comment && (
                  <p className="text-gray-600">{approval.comment}</p>
                )}
              </div>
            ))}
          </Space>
        </Card>
      )}

      <Modal
        title="报销单打印预览"
        open={previewModal}
        onCancel={() => setPreviewModal(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModal(false)}>关闭</Button>,
          <Button key="print" type="primary" onClick={() => window.print()}>
            <Printer size={16} /> 打印
          </Button>,
        ]}
        width={900}
      >
        <div className="p-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{currentReimbursement.title}</h2>
            <p className="text-gray-500 mt-2">报销单编号：{currentReimbursement.id}</p>
          </div>
          <Divider />
          <Descriptions column={2} bordered size="small" className="mb-4">
            <Descriptions.Item label="申请人">{currentReimbursement.applicantName}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{dayjs(currentReimbursement.createdAt).format('YYYY-MM-DD')}</Descriptions.Item>
            <Descriptions.Item label="总金额">¥{currentReimbursement.totalAmount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="状态">{statusInfo.text}</Descriptions.Item>
          </Descriptions>
          <h4 className="font-bold mb-2">费用明细</h4>
          <Table
            columns={expenseColumns}
            dataSource={reimbursementExpenses}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            summary={(pageData) => {
              let total = 0;
              pageData.forEach((data: any) => { total += data.amount || 0; });
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>合计金额（大写）：人民币 {total.toLocaleString()} 元整</Table.Summary.Cell>
                  <Table.Summary.Cell index={5} className="font-bold">¥{total.toLocaleString()}</Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
          <div className="mt-8 flex justify-between">
            <div className="text-center">
              <Divider style={{ width: 150 }}>申请人签字</Divider>
              <p className="text-gray-400">日期：____________</p>
            </div>
            <div className="text-center">
              <Divider style={{ width: 150 }}>审批人签字</Divider>
              <p className="text-gray-400">日期：____________</p>
            </div>
            <div className="text-center">
              <Divider style={{ width: 150 }}>财务签字</Divider>
              <p className="text-gray-400">日期：____________</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title="PDF预览"
        open={pdfPreviewModal}
        onCancel={() => setPdfPreviewModal(false)}
        footer={[
          <Button key="close" onClick={() => setPdfPreviewModal(false)}>关闭</Button>,
          <Button key="download" type="primary" icon={<Download size={16} />} onClick={() => message.success('PDF下载功能开发中')}>
            下载PDF
          </Button>,
        ]}
        width={900}
      >
        <div className="bg-white border rounded-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{currentReimbursement.title}</h2>
            <p className="text-gray-500 mt-2">报销单编号：{currentReimbursement.id}</p>
          </div>
          <Divider />
          <Descriptions column={2} bordered size="small" className="mb-4">
            <Descriptions.Item label="申请人">{currentReimbursement.applicantName}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{dayjs(currentReimbursement.createdAt).format('YYYY-MM-DD')}</Descriptions.Item>
            <Descriptions.Item label="总金额">¥{currentReimbursement.totalAmount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="状态">{statusInfo.text}</Descriptions.Item>
          </Descriptions>
          <h4 className="font-bold mb-2">费用明细</h4>
          <Table
            columns={expenseColumns}
            dataSource={reimbursementExpenses}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            summary={(pageData) => {
              let total = 0;
              pageData.forEach((data: any) => { total += data.amount || 0; });
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>合计金额（大写）：人民币 {total.toLocaleString()} 元整</Table.Summary.Cell>
                  <Table.Summary.Cell index={5} className="font-bold">¥{total.toLocaleString()}</Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
          <div className="mt-8 flex justify-between">
            <div className="text-center">
              <Divider style={{ width: 150 }}>申请人签字</Divider>
              <p className="text-gray-400">日期：____________</p>
            </div>
            <div className="text-center">
              <Divider style={{ width: 150 }}>审批人签字</Divider>
              <p className="text-gray-400">日期：____________</p>
            </div>
            <div className="text-center">
              <Divider style={{ width: 150 }}>财务签字</Divider>
              <p className="text-gray-400">日期：____________</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
