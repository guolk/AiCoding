import { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Button, Space, Spin, message, Timeline, List, Progress, Modal, Input, Tooltip } from 'antd';
import { ArrowLeft, Edit, Route, Trash2, FileText, Share2, Copy, MapPin, Plane, Hotel, Users, CreditCard } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useItineraryStore } from '@/store/useItineraryStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { generateItineraryDoc } from '@/utils/pdfGenerator';
import type { Itinerary, ItineraryStatus, Destination, Transportation, Accommodation, Visit } from '@/types/itinerary';
import type { Expense } from '@/types/expense';

const { TextArea } = Input;

const statusMap: Record<string, { text: string; gradient: string }> = {
  draft: { text: '草稿', gradient: 'from-gray-400 to-gray-500' },
  pending: { text: '待审批', gradient: 'from-orange-400 to-orange-500' },
  approved: { text: '已批准', gradient: 'from-green-400 to-green-500' },
  rejected: { text: '已拒绝', gradient: 'from-red-400 to-red-500' },
  cancelled: { text: '已取消', gradient: 'from-gray-400 to-gray-500' },
  completed: { text: '已完成', gradient: 'from-blue-400 to-blue-500' },
  in_progress: { text: '进行中', gradient: 'from-purple-400 to-purple-500' },
};

const transportTypeMap: Record<string, string> = {
  flight: '飞机',
  train: '高铁/火车',
  car: '自驾',
  taxi: '出租车',
  other: '其他',
};

const expenseCategoryMap: Record<string, string> = {
  transport: '交通',
  accommodation: '住宿',
  food: '餐饮',
  entertainment: '招待',
  other: '其他',
};

export default function ItineraryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentItinerary = useItineraryStore(state => state.currentItinerary);
  const loading = useItineraryStore(state => state.loading);
  const fetchItineraryById = useItineraryStore(state => state.fetchItineraryById);
  const deleteItinerary = useItineraryStore(state => state.deleteItinerary);

  const expenses = useExpenseStore(state => state.expenses);
  const budgetComparison = useExpenseStore(state => state.budgetComparison);
  const fetchExpenses = useExpenseStore(state => state.fetchExpenses);
  const calculateBudgetComparison = useExpenseStore(state => state.calculateBudgetComparison);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItineraryById(id);
      fetchExpenses(id);
      calculateBudgetComparison(id);
    }
  }, [id, fetchItineraryById, fetchExpenses, calculateBudgetComparison]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteItinerary(id);
      message.success('删除成功');
      navigate('/itinerary');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleGenerateDoc = () => {
    if (!currentItinerary) return;

    const docData = {
      title: currentItinerary.title,
      employeeName: '张三',
      department: '技术部',
      startDate: currentItinerary.startDate,
      endDate: currentItinerary.endDate,
      purpose: currentItinerary.purpose,
      destinations: currentItinerary.destinations?.map(d => ({
        city: d.city,
        arrivalDate: d.arriveDate,
        departureDate: d.leaveDate,
      })) || [],
      flights: currentItinerary.transportations?.map(t => ({
        flightNo: t.transportNo,
        departure: t.fromCity,
        destination: t.toCity,
        departureTime: t.departTime,
        arrivalTime: t.arriveTime,
      })) || [],
      hotels: currentItinerary.accommodations?.map(a => ({
        name: a.hotelName,
        city: a.address,
        checkIn: a.checkIn,
        checkOut: a.checkOut,
      })) || [],
      meetings: currentItinerary.visits?.map(v => ({
        date: v.time?.split(' ')[0] || '',
        time: v.time?.split(' ')[1] || '',
        location: v.address,
        topic: v.purpose,
        attendees: v.clientName,
      })) || [],
    };

    const html = generateItineraryDoc(docData);
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    } else {
      message.error('请允许弹出窗口');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      message.success('链接已复制到剪贴板');
      setShareModalVisible(false);
    } catch (error) {
      message.error('复制失败，请手动复制');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentItinerary) {
    return (
      <div>
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/itinerary')}>
          返回
        </Button>
        <div className="mt-8 text-center text-gray-500">
          <p className="text-lg">行程不存在</p>
        </div>
      </div>
    );
  }

  const statusInfo = statusMap[currentItinerary.status] || {
    text: currentItinerary.status,
    gradient: 'from-gray-400 to-gray-500',
  };

  const sortedDestinations = [...(currentItinerary.destinations || [])].sort(
    (a, b) => a.sequence - b.sequence
  );

  const budgetPercent = budgetComparison?.percentage || 0;
  const progressColor = budgetPercent > 100 ? 'red' : budgetPercent > 80 ? 'orange' : 'green';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/itinerary')}>
            返回
          </Button>
          <h2 className="text-2xl font-bold m-0">{currentItinerary.title}</h2>
          <Tag className={`bg-gradient-to-r ${statusInfo.gradient} text-white border-0 px-3 py-1`}>
            {statusInfo.text}
          </Tag>
        </div>
        <Space>
          <Button icon={<FileText size={16} />} onClick={handleGenerateDoc}>
            生成行程表
          </Button>
          <Button icon={<Share2 size={16} />} onClick={() => setShareModalVisible(true)}>
            分享行程
          </Button>
          <Button icon={<Route size={16} />} onClick={() => navigate('/itinerary/optimize')}>
            路线优化
          </Button>
          <Button icon={<Edit size={16} />}>编辑</Button>
          <Button
            icon={<Trash2 size={16} />}
            danger
            onClick={() => setDeleteModalVisible(true)}
          >
            删除
          </Button>
        </Space>
      </div>

      <Card title="基本信息">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="行程标题">{currentItinerary.title}</Descriptions.Item>
          <Descriptions.Item label="出行目的">{currentItinerary.purpose}</Descriptions.Item>
          <Descriptions.Item label="开始日期">{currentItinerary.startDate}</Descriptions.Item>
          <Descriptions.Item label="结束日期">{currentItinerary.endDate}</Descriptions.Item>
          <Descriptions.Item label="预算金额">¥{currentItinerary.budget.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{currentItinerary.createdAt}</Descriptions.Item>
          <Descriptions.Item label="目的地数量" span={2}>
            {sortedDestinations.length} 个
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2">
            <MapPin size={18} className="text-blue-500" />
            目的地城市
          </span>
        }
      >
        {sortedDestinations.length > 0 ? (
          <Timeline
            items={sortedDestinations.map((dest: Destination, index) => ({
              color: 'blue',
              children: (
                <div className="py-2">
                  <div className="font-medium text-lg">{dest.city}</div>
                  <div className="text-gray-500 text-sm mt-1">
                    到达: {dest.arriveDate} | 离开: {dest.leaveDate}
                  </div>
                  <Tag color="blue" className="mt-2">第 {index + 1} 站</Tag>
                </div>
              ),
            }))}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">暂无目的地信息</div>
        )}
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2">
            <Plane size={18} className="text-green-500" />
            交通信息
          </span>
        }
      >
        {currentItinerary.transportations?.length > 0 ? (
          <List
            dataSource={currentItinerary.transportations}
            renderItem={(item: Transportation) => (
              <List.Item className="flex flex-col md:flex-row md:items-start gap-4 p-4 bg-gray-50 rounded-lg mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag color="blue">{transportTypeMap[item.type] || item.type}</Tag>
                    <span className="font-medium">{item.transportNo || '未填写'}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">出发:</span> {item.fromCity} {item.departTime && `(${item.departTime})`}
                    </div>
                    <div>
                      <span className="text-gray-500">到达:</span> {item.toCity} {item.arriveTime && `(${item.arriveTime})`}
                    </div>
                  </div>
                </div>
                <div className="text-blue-600 font-semibold">
                  ¥{item.cost?.toLocaleString() || 0}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">暂无交通信息</div>
        )}
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2">
            <Hotel size={18} className="text-purple-500" />
            住宿信息
          </span>
        }
      >
        {currentItinerary.accommodations?.length > 0 ? (
          <List
            dataSource={currentItinerary.accommodations}
            renderItem={(item: Accommodation) => (
              <List.Item className="flex flex-col md:flex-row md:items-start gap-4 p-4 bg-gray-50 rounded-lg mb-3">
                <div className="flex-1">
                  <div className="font-medium text-lg mb-2">{item.hotelName}</div>
                  <div className="text-gray-500 text-sm mb-2">{item.address}</div>
                  <div className="text-sm">
                    <span className="text-gray-500">入住:</span> {item.checkIn}
                    <span className="mx-2">|</span>
                    <span className="text-gray-500">退房:</span> {item.checkOut}
                  </div>
                </div>
                <div className="text-blue-600 font-semibold">
                  ¥{item.cost?.toLocaleString() || 0}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">暂无住宿信息</div>
        )}
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2">
            <Users size={18} className="text-orange-500" />
            客户拜访计划
          </span>
        }
      >
        {currentItinerary.visits?.length > 0 ? (
          <List
            dataSource={currentItinerary.visits}
            renderItem={(item: Visit) => (
              <List.Item className="flex flex-col md:flex-row md:items-start gap-4 p-4 bg-gray-50 rounded-lg mb-3">
                <div className="flex-1">
                  <div className="font-medium text-lg mb-2">{item.clientName}</div>
                  <div className="text-gray-500 text-sm mb-2">{item.address}</div>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-gray-500">拜访时间:</span> {item.time}
                    </div>
                    <div>
                      <span className="text-gray-500">拜访目的:</span> {item.purpose}
                    </div>
                    <div>
                      <span className="text-gray-500">联系人:</span> {item.contact}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">暂无客户拜访计划</div>
        )}
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2">
            <CreditCard size={18} className="text-cyan-500" />
            费用记录与预算对比
          </span>
        }
      >
        {budgetComparison && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">预算使用情况</span>
              <span className="text-gray-500">
                已花费 ¥{budgetComparison.actual.toLocaleString()} / 预算 ¥{budgetComparison.budget.toLocaleString()}
              </span>
            </div>
            <Progress
              percent={budgetPercent}
              status={budgetPercent > 100 ? 'exception' : budgetPercent > 80 ? 'normal' : 'success'}
              strokeColor={progressColor}
              showInfo
              format={percent => `${percent}%`}
            />
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">
                {budgetComparison.difference >= 0
                  ? `剩余预算: ¥${budgetComparison.difference.toLocaleString()}`
                  : `超支: ¥${Math.abs(budgetComparison.difference).toLocaleString()}`}
              </span>
            </div>
          </div>
        )}

        {expenses.length > 0 ? (
          <List
            dataSource={expenses}
            renderItem={(item: Expense) => (
              <List.Item className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                <div className="flex-1">
                  <div className="font-medium">{item.description}</div>
                  <div className="text-sm text-gray-500">
                    <Tag color="blue">{expenseCategoryMap[item.category] || item.category}</Tag>
                    {item.expenseDate}
                    {item.merchant && ` | ${item.merchant}`}
                  </div>
                </div>
                <div className="text-blue-600 font-semibold">
                  ¥{item.amount.toLocaleString()}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">暂无关联费用记录</div>
        )}
      </Card>

      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
      >
        <p>确定要删除该行程吗？此操作不可恢复。</p>
      </Modal>

      <Modal
        title="分享行程"
        open={shareModalVisible}
        onOk={handleShare}
        onCancel={() => setShareModalVisible(false)}
        okText="复制链接"
        cancelText="关闭"
      >
        <p className="mb-3">复制以下链接分享给他人：</p>
        <div className="flex gap-2">
          <Input value={window.location.href} readOnly />
          <Tooltip title="复制链接">
            <Button icon={<Copy size={16} />} onClick={handleShare} />
          </Tooltip>
        </div>
      </Modal>
    </div>
  );
}
