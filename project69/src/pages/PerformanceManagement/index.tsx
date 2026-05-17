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
  InputNumber,
  List,
  Row,
  Col,
  Statistic,
  Drawer,
  Descriptions,
  Divider,
  Checkbox,
  Rate,
  DatePicker,
  TimePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  AudioOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Performance, Song, Member, SetlistItem, PreparationItem } from '../../types';
import { performanceStorage, songStorage, memberStorage, generateId } from '../../utils/storage';

const PerformanceManagement: React.FC = () => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [prepModalVisible, setPrepModalVisible] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
  const [viewingPerformance, setViewingPerformance] = useState<Performance | null>(null);
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const [prepForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPerformances(performanceStorage.getAll());
    setSongs(songStorage.getAll());
    setMembers(memberStorage.getAll());
  };

  const handleAdd = () => {
    setEditingPerformance(null);
    form.resetFields();
    form.setFieldsValue({
      setlist: [],
      preparationList: [],
    });
    setModalVisible(true);
  };

  const handleEdit = (performance: Performance) => {
    setEditingPerformance(performance);
    form.setFieldsValue({
      ...performance,
      date: dayjs(performance.date),
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    performanceStorage.delete(id);
    loadData();
    message.success('删除成功');
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const performanceData: Performance = {
        ...values,
        id: editingPerformance?.id || generateId(),
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        setlist: editingPerformance?.setlist || [],
        preparationList: editingPerformance?.preparationList || [],
      };

      if (editingPerformance) {
        performanceStorage.update(editingPerformance.id, performanceData);
        message.success('更新成功');
      } else {
        performanceStorage.add(performanceData);
        message.success('添加成功');
      }

      setModalVisible(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewDetail = (performance: Performance) => {
    setViewingPerformance(performance);
    setDetailVisible(true);
  };

  const handleAddSetlistItem = (songId: string) => {
    if (!viewingPerformance) return;
    const newItem: SetlistItem = {
      id: generateId(),
      songId,
      order: viewingPerformance.setlist.length + 1,
    };
    const updatedSetlist = [...viewingPerformance.setlist, newItem];
    performanceStorage.update(viewingPerformance.id, { setlist: updatedSetlist });
    message.success('已添加到演出曲目单');
    loadData();
    setViewingPerformance({ ...viewingPerformance, setlist: updatedSetlist });
  };

  const handleRemoveSetlistItem = (itemId: string) => {
    if (!viewingPerformance) return;
    const updatedSetlist = viewingPerformance.setlist.filter(s => s.id !== itemId);
    performanceStorage.update(viewingPerformance.id, { setlist: updatedSetlist });
    message.success('已从曲目单移除');
    loadData();
    setViewingPerformance({ ...viewingPerformance, setlist: updatedSetlist });
  };

  const handleAddPrepItem = async () => {
    if (!viewingPerformance) return;

    try {
      const values = await prepForm.validateFields();
      const newItem: PreparationItem = {
        id: generateId(),
        name: values.name,
        category: values.category,
        responsibleId: values.responsibleId,
        completed: false,
        deadline: values.deadline?.format('YYYY-MM-DD'),
      };

      const updatedList = [...viewingPerformance.preparationList, newItem];
      performanceStorage.update(viewingPerformance.id, { preparationList: updatedList });
      message.success('准备事项添加成功');
      setPrepModalVisible(false);
      prepForm.resetFields();
      loadData();
      setViewingPerformance({ ...viewingPerformance, preparationList: updatedList });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePrepItem = (itemId: string) => {
    if (!viewingPerformance) return;
    const updatedList = viewingPerformance.preparationList.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    performanceStorage.update(viewingPerformance.id, { preparationList: updatedList });
    loadData();
    setViewingPerformance({ ...viewingPerformance, preparationList: updatedList });
  };

  const handleDeletePrepItem = (itemId: string) => {
    if (!viewingPerformance) return;
    const updatedList = viewingPerformance.preparationList.filter(item => item.id !== itemId);
    performanceStorage.update(viewingPerformance.id, { preparationList: updatedList });
    message.success('已删除');
    loadData();
    setViewingPerformance({ ...viewingPerformance, preparationList: updatedList });
  };

  const handleAddReview = async () => {
    if (!viewingPerformance) return;

    try {
      const values = await reviewForm.validateFields();
      performanceStorage.update(viewingPerformance.id, {
        review: {
          ...values,
          createdAt: new Date().toISOString(),
        },
      });
      message.success('复盘记录已保存');
      setReviewModalVisible(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const getSongName = (id: string) => songs.find(s => s.id === id)?.name || '未知';
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '未指定';

  const getUpcomingCount = () => {
    const now = dayjs();
    return performances.filter(p => dayjs(p.date).isAfter(now)).length;
  };

  const getCompletedCount = () => {
    const now = dayjs();
    return performances.filter(p => dayjs(p.date).isBefore(now) && p.review).length;
  };

  const getAvgRating = () => {
    const reviewed = performances.filter(p => p.review);
    if (reviewed.length === 0) return 0;
    const sum = reviewed.reduce((acc, p) => acc + (p.review?.overallRating || 0), 0);
    return (sum / reviewed.length).toFixed(1);
  };

  const columns: ColumnsType<Performance> = [
    {
      title: '演出名称',
      dataIndex: 'title',
      render: v => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: '日期',
      dataIndex: 'date',
      render: (_, record) => (
        <Space>
          <CalendarOutlined />
          <span>{record.date}</span>
          <ClockCircleOutlined />
          <span>{record.time}</span>
        </Space>
      ),
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
    },
    {
      title: '地点',
      dataIndex: 'location',
      render: (_, record) => (
        <Space>
          <EnvironmentOutlined />
          <span>{record.location}</span>
          <Tag color="blue">{record.venue}</Tag>
        </Space>
      ),
    },
    {
      title: '曲目数量',
      dataIndex: 'setlist',
      render: items => <Tag color="purple">{items.length} 首</Tag>,
    },
    {
      title: '观众数',
      dataIndex: 'audienceCount',
      render: v => v || '-',
    },
    {
      title: '状态',
      render: (_, record) => {
        const now = dayjs();
        const isPast = dayjs(record.date).isBefore(now);
        if (record.review) {
          return (
            <Space>
              <Tag color="green">已完成</Tag>
              <Rate disabled value={record.review.overallRating} />
            </Space>
          );
        }
        return isPast ? <Tag color="orange">待复盘</Tag> : <Tag color="blue">即将到来</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总演出场次" value={performances.length} prefix={<TrophyOutlined />} suffix="场" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="即将到来"
              value={getUpcomingCount()}
              prefix={<CalendarOutlined />}
              suffix="场"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成演出"
              value={getCompletedCount()}
              prefix={<CheckCircleOutlined />}
              suffix="场"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均评分"
              value={getAvgRating()}
              prefix={<StarOutlined />}
              suffix="/5"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="演出管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加演出
          </Button>
        }
      >
        <Table columns={columns} dataSource={performances} rowKey="id" />
      </Card>

      <Modal
        title={editingPerformance ? '编辑演出' : '添加演出'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="演出名称" rules={[{ required: true }]}>
            <Input placeholder="如：春季音乐节演出" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="演出日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="time" label="演出时间" rules={[{ required: true }]}>
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="location" label="地点" rules={[{ required: true }]}>
                <Input placeholder="如：城市音乐厅" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="venue" label="场馆/舞台" rules={[{ required: true }]}>
                <Input placeholder="如：主舞台" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="audienceCount" label="预计观众数">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="演出详情"
        width={700}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        extra={
          <Space>
            <Button icon={<PlusOutlined />} onClick={() => setPrepModalVisible(true)}>
              添加准备事项
            </Button>
            {!viewingPerformance?.review && (
              <Button type="primary" onClick={() => setReviewModalVisible(true)}>
                演出复盘
              </Button>
            )}
          </Space>
        }
      >
        {viewingPerformance && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="演出名称">{viewingPerformance.title}</Descriptions.Item>
              <Descriptions.Item label="日期">
                <Space>
                  <CalendarOutlined />
                  {viewingPerformance.date}
                  <ClockCircleOutlined />
                  {viewingPerformance.time}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="地点">
                <Space>
                  <EnvironmentOutlined />
                  {viewingPerformance.location}
                  <Tag color="blue">{viewingPerformance.venue}</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="观众数">{viewingPerformance.audienceCount || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <Space>
                <AudioOutlined />
                演出曲目单
              </Space>
            </Divider>

            {viewingPerformance.setlist.length === 0 ? (
              <Card style={{ marginBottom: 16 }}>
                <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                  <AudioOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                  <p>暂无曲目，请从下方添加</p>
                </div>
              </Card>
            ) : (
              <List
                dataSource={viewingPerformance.setlist.sort((a, b) => a.order - b.order)}
                style={{ marginBottom: 16 }}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Popconfirm title="确定从曲目单移除?" onConfirm={() => handleRemoveSetlistItem(item.id)}>
                        <Button type="link" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color="blue">{item.order}</Tag>
                          {getSongName(item.songId)}
                        </Space>
                      }
                      description={item.notes}
                    />
                  </List.Item>
                )}
              />
            )}

            <Card title="添加曲目到演出单" size="small" style={{ marginBottom: 24 }}>
              <Select
                mode="multiple"
                placeholder="选择要添加的曲目"
                style={{ width: '100%' }}
                options={songs
                  .filter(s => s.status === '可演出')
                  .map(s => ({ label: `${s.name} - ${s.artist}`, value: s.id }))}
                onSelect={songId => handleAddSetlistItem(songId)}
              />
            </Card>

            <Divider orientation="left">
              <Space>
                <CheckCircleOutlined />
                准备清单
                <Tag color="green">
                  {viewingPerformance.preparationList.filter(i => i.completed).length}/{viewingPerformance.preparationList.length}
                </Tag>
              </Space>
            </Divider>

            {viewingPerformance.preparationList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                <FileTextOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                <p>暂无准备事项</p>
              </div>
            ) : (
              <List
                dataSource={viewingPerformance.preparationList}
                style={{ marginBottom: 16 }}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Popconfirm title="确定删除?" onConfirm={() => handleDeletePrepItem(item.id)}>
                        <Button type="link" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Checkbox
                          checked={item.completed}
                          onChange={() => handleTogglePrepItem(item.id)}
                        />
                      }
                      title={
                        <Space>
                          <span style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#999' : undefined }}>
                            {item.name}
                          </span>
                          <Tag color={item.category === '装备' ? 'orange' : item.category === '人员' ? 'blue' : 'default'}>
                            {item.category}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space>
                          {item.responsibleId && <span>负责人：{getMemberName(item.responsibleId)}</span>}
                          {item.deadline && <span>截止：{item.deadline}</span>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}

            {viewingPerformance.review && (
              <>
                <Divider orientation="left">
                  <Space>
                    <StarOutlined />
                    演出复盘
                  </Space>
                </Divider>
                <Card size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="总体评分">
                      <Rate disabled value={viewingPerformance.review.overallRating} />
                    </Descriptions.Item>
                    <Descriptions.Item label="发挥亮点">
                      {viewingPerformance.review.highlights}
                    </Descriptions.Item>
                    <Descriptions.Item label="需要改进">
                      {viewingPerformance.review.improvements}
                    </Descriptions.Item>
                    <Descriptions.Item label="复盘时间">
                      {dayjs(viewingPerformance.review.createdAt).format('YYYY-MM-DD HH:mm')}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </>
            )}
          </div>
        )}
      </Drawer>

      <Modal
        title="演出复盘"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onOk={handleAddReview}
        width={600}
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item name="overallRating" label="总体评分" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="highlights" label="发挥亮点" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="记录这次演出中表现好的方面" />
          </Form.Item>
          <Form.Item name="improvements" label="需要改进" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="记录需要改进的地方和下次演出的注意事项" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加准备事项"
        open={prepModalVisible}
        onCancel={() => setPrepModalVisible(false)}
        onOk={handleAddPrepItem}
      >
        <Form form={prepForm} layout="vertical">
          <Form.Item name="name" label="事项名称" rules={[{ required: true }]}>
            <Input placeholder="如：检查音响设备" />
          </Form.Item>
          <Form.Item name="category" label="类别" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '装备', value: '装备' },
                { label: '人员', value: '人员' },
                { label: '其他', value: '其他' },
              ]}
            />
          </Form.Item>
          <Form.Item name="responsibleId" label="负责人">
            <Select
              placeholder="选择负责人（可选）"
              allowClear
              options={members.map(m => ({ label: m.name, value: m.id }))}
            />
          </Form.Item>
          <Form.Item name="deadline" label="截止日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PerformanceManagement;
