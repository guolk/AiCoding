import { useState, useEffect, useMemo } from 'react';
import { Button, Table, Space, Tag, Card, Select, DatePicker, Input, Modal, message, Radio } from 'antd';
import { Plus, Edit, Trash2, Send, Calendar, List, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useItineraryStore } from '@/store/useItineraryStore';
import type { Itinerary, ItineraryStatus } from '@/types/itinerary';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const statusMap: Record<string, { text: string; gradient: string }> = {
  draft: { text: '草稿', gradient: 'from-gray-400 to-gray-500' },
  pending: { text: '待审批', gradient: 'from-orange-400 to-orange-500' },
  approved: { text: '已批准', gradient: 'from-green-400 to-green-500' },
  rejected: { text: '已拒绝', gradient: 'from-red-400 to-red-500' },
  cancelled: { text: '已取消', gradient: 'from-gray-400 to-gray-500' },
  completed: { text: '已完成', gradient: 'from-blue-400 to-blue-500' },
  in_progress: { text: '进行中', gradient: 'from-purple-400 to-purple-500' },
};

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已批准' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'completed', label: '已完成' },
  { value: 'in_progress', label: '进行中' },
];

interface FilterState {
  status: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  searchText: string;
}

export default function ItineraryList() {
  const navigate = useNavigate();
  const itineraries = useItineraryStore(state => state.itineraries);
  const loading = useItineraryStore(state => state.loading);
  const fetchItineraries = useItineraryStore(state => state.fetchItineraries);
  const deleteItinerary = useItineraryStore(state => state.deleteItinerary);
  const submitForApproval = useItineraryStore(state => state.submitForApproval);

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    dateRange: null,
    searchText: '',
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  const filteredItineraries = useMemo(() => {
    return itineraries.filter(item => {
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const startDate = dayjs(item.startDate);
        const endDate = dayjs(item.endDate);
        const filterStart = filters.dateRange[0];
        const filterEnd = filters.dateRange[1];
        if (endDate.isBefore(filterStart) || startDate.isAfter(filterEnd)) {
          return false;
        }
      }
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(searchLower);
        const purposeMatch = item.purpose.toLowerCase().includes(searchLower);
        const destMatch = item.destinations?.some(d =>
          d.city.toLowerCase().includes(searchLower)
        );
        if (!titleMatch && !purposeMatch && !destMatch) {
          return false;
        }
      }
      return true;
    });
  }, [itineraries, filters]);

  const displayCities = (destinations: any[]) => {
    if (!destinations || destinations.length === 0) return '-';
    const sorted = [...destinations].sort((a, b) => a.sequence - b.sequence);
    const top3 = sorted.slice(0, 3);
    const names = top3.map(d => d.city);
    if (destinations.length > 3) {
      names.push(`+${destinations.length - 3}`);
    }
    return names.join('、');
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteItinerary(deletingId);
      message.success('删除成功');
      setDeleteModalVisible(false);
      setDeletingId(null);
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmitApproval = async (id: string) => {
    try {
      await submitForApproval(id);
      message.success('已提交审批');
    } catch (error) {
      message.error('提交失败');
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const columns = [
    {
      title: '行程标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Itinerary) => (
        <a onClick={() => navigate(`/itinerary/${record.id}`)} className="font-medium">{text}</a>
      ),
    },
    {
      title: '目的地城市',
      dataIndex: 'destinations',
      key: 'destinations',
      render: (dests: any[]) => displayCities(dests),
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ItineraryStatus) => {
        const info = statusMap[status] || { text: status, gradient: 'from-gray-400 to-gray-500' };
        return (
          <Tag className={`bg-gradient-to-r ${info.gradient} text-white border-0`}>
            {info.text}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: unknown, record: Itinerary) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Edit size={14} />} onClick={() => navigate(`/itinerary/${record.id}`)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<Edit size={14} />} onClick={() => navigate(`/itinerary/${record.id}`)}>
            编辑
          </Button>
          {record.status === 'draft' && (
            <Button
              type="link"
              size="small"
              icon={<Send size={14} />}
              onClick={() => handleSubmitApproval(record.id)}
            >
              提交审批
            </Button>
          )}
          <Button
            type="link"
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDeleteClick(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const renderCalendarView = () => {
    if (filteredItineraries.length === 0) {
      return (
        <div className="p-12 text-center text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无行程数据</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItineraries.map(item => {
          const statusInfo = statusMap[item.status];
          return (
            <Card
              key={item.id}
              hoverable
              className="cursor-pointer transition-all hover:shadow-lg"
              onClick={() => navigate(`/itinerary/${item.id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg m-0">{item.title}</h3>
                <Tag className={`bg-gradient-to-r ${statusInfo.gradient} text-white border-0`}>
                  {statusInfo.text}
                </Tag>
              </div>
              <p className="text-gray-600 mb-2 line-clamp-2">{item.purpose}</p>
              <div className="text-sm text-gray-500 mb-3">
                <span>{item.startDate} ~ {item.endDate}</span>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                <span className="font-medium">目的地:</span> {displayCities(item.destinations)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-semibold">¥{item.budget.toLocaleString()}</span>
                <Space size="small">
                  {item.status === 'draft' && (
                    <Button
                      size="small"
                      icon={<Send size={12} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmitApproval(item.id);
                      }}
                    >
                      提交
                    </Button>
                  )}
                  <Button
                    size="small"
                    danger
                    icon={<Trash2 size={12} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(item.id);
                    }}
                  >
                    删除
                  </Button>
                </Space>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold m-0">行程列表</h2>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/itinerary/create')}>
          创建行程
        </Button>
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <Input
              placeholder="搜索标题/目的/城市"
              value={filters.searchText}
              onChange={e => handleFilterChange('searchText', e.target.value)}
              className="w-48"
              allowClear
            />
          </div>
          <Select
            value={filters.status}
            onChange={value => handleFilterChange('status', value)}
            className="w-32"
          >
            {statusOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
          <RangePicker
            value={filters.dateRange}
            onChange={dates => handleFilterChange('dateRange', dates)}
          />
          <div className="flex items-center ml-auto">
            <Radio.Group
              value={viewMode}
              onChange={e => setViewMode(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="list">
                <List size={16} className="inline mr-1" />列表
              </Radio.Button>
              <Radio.Button value="calendar">
                <Calendar size={16} className="inline mr-1" />日历
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </Card>

      <Card>
        {viewMode === 'list' ? (
          <Table
            columns={columns}
            dataSource={filteredItineraries}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              total: filteredItineraries.length,
              onChange: (current, pageSize) => setPagination({ current, pageSize }),
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: total => `共 ${total} 条记录`,
            }}
          />
        ) : (
          renderCalendarView()
        )}
      </Card>

      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
      >
        <p>确定要删除该行程吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
}
