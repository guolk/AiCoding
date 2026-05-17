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
  DatePicker,
  TimePicker,
  List,
  Statistic,
  Row,
  Col,
  Progress,
  Avatar,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Member, Instrument, Rehearsal, LeaveRequest, AvailableTime } from '../../types';
import { memberStorage, rehearsalStorage, generateId } from '../../utils/storage';

const INSTRUMENTS: Instrument[] = ['主唱', '吉他', '贝斯', '鼓', '键盘', '萨克斯', '小号', '长号', '小提琴', '大提琴', '其他'];
const DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const BandManagement: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [rehearsalModalVisible, setRehearsalModalVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingRehearsal, setEditingRehearsal] = useState<Rehearsal | null>(null);
  const [selectedRehearsal, setSelectedRehearsal] = useState<Rehearsal | null>(null);
  const [memberForm] = Form.useForm();
  const [rehearsalForm] = Form.useForm();
  const [leaveForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<'members' | 'rehearsals' | 'leaves'>('members');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMembers(memberStorage.getAll());
    setRehearsals(rehearsalStorage.getAll());
  };

  const handleAddMember = () => {
    setEditingMember(null);
    memberForm.resetFields();
    memberForm.setFieldsValue({
      availableTimes: [],
      status: 'active',
    });
    setMemberModalVisible(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    memberForm.setFieldsValue({
      ...member,
      joinDate: dayjs(member.joinDate),
    });
    setMemberModalVisible(true);
  };

  const handleDeleteMember = (id: string) => {
    memberStorage.delete(id);
    loadData();
    message.success('删除成功');
  };

  const handleSaveMember = async () => {
    try {
      const values = await memberForm.validateFields();
      const memberData: Member = {
        ...values,
        id: editingMember?.id || generateId(),
        joinDate: values.joinDate.format('YYYY-MM-DD'),
      };

      if (editingMember) {
        memberStorage.update(editingMember.id, memberData);
        message.success('更新成功');
      } else {
        memberStorage.add(memberData);
        message.success('添加成功');
      }

      setMemberModalVisible(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRehearsal = () => {
    setEditingRehearsal(null);
    rehearsalForm.resetFields();
    rehearsalForm.setFieldsValue({
      status: 'planned',
      participantIds: [],
      songIds: [],
      leaveRequests: [],
    });
    setRehearsalModalVisible(true);
  };

  const handleEditRehearsal = (rehearsal: Rehearsal) => {
    setEditingRehearsal(rehearsal);
    rehearsalForm.setFieldsValue({
      ...rehearsal,
      date: dayjs(rehearsal.date),
    });
    setRehearsalModalVisible(true);
  };

  const handleDeleteRehearsal = (id: string) => {
    rehearsalStorage.delete(id);
    loadData();
    message.success('删除成功');
  };

  const handleSaveRehearsal = async () => {
    try {
      const values = await rehearsalForm.validateFields();
      const rehearsalData: Rehearsal = {
        ...values,
        id: editingRehearsal?.id || generateId(),
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
      };

      if (editingRehearsal) {
        rehearsalStorage.update(editingRehearsal.id, rehearsalData);
        message.success('更新成功');
      } else {
        rehearsalStorage.add(rehearsalData);
        message.success('添加成功');
      }

      setRehearsalModalVisible(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const recommendBestTime = () => {
    const activeMembers = members.filter(m => m.status === 'active');
    if (activeMembers.length === 0) {
      message.warning('没有活跃成员');
      return;
    }

    const timeScores: Record<string, number> = {};

    for (let day = 0; day < 7; day++) {
      for (let hour = 9; hour < 22; hour++) {
        const timeStr = `${DAYS[day]} ${hour.toString().padStart(2, '0')}:00`;
        timeScores[`${day}-${hour}`] = 0;

        activeMembers.forEach(member => {
          const available = member.availableTimes.some(t => {
            if (t.dayOfWeek !== day) return false;
            const startHour = parseInt(t.startTime.split(':')[0]);
            const endHour = parseInt(t.endTime.split(':')[0]);
            return hour >= startHour && hour < endHour;
          });
          if (available) timeScores[`${day}-${hour}`]++;
        });
      }
    }

    const bestTimes = Object.entries(timeScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, score]) => {
        const [day, hour] = key.split('-').map(Number);
        return { day: DAYS[day], time: `${hour.toString().padStart(2, '0')}:00`, score };
      });

    const content = (
      <List
        dataSource={bestTimes}
        renderItem={item => (
          <List.Item>
            <Space>
              <CalendarOutlined />
              <span>{item.day}</span>
              <ClockCircleOutlined />
              <span>{item.time}</span>
              <Tag color="green">{item.score}/{activeMembers.length} 人可用</Tag>
              <Progress
                percent={Math.round((item.score / activeMembers.length) * 100)}
                size="small"
                style={{ width: 100 }}
              />
            </Space>
          </List.Item>
        )}
      />
    );

    Modal.info({
      title: '推荐的最佳排练时间',
      content,
      width: 500,
    });
  };

  const handleLeaveRequest = (rehearsal: Rehearsal) => {
    setSelectedRehearsal(rehearsal);
    leaveForm.resetFields();
    setLeaveModalVisible(true);
  };

  const handleSubmitLeave = async () => {
    if (!selectedRehearsal) return;

    try {
      const values = await leaveForm.validateFields();
      const leaveRequest: LeaveRequest = {
        id: generateId(),
        memberId: values.memberId,
        rehearsalId: selectedRehearsal.id,
        reason: values.reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const updatedRehearsal = {
        ...selectedRehearsal,
        leaveRequests: [...selectedRehearsal.leaveRequests, leaveRequest],
      };

      rehearsalStorage.update(selectedRehearsal.id, updatedRehearsal);
      message.success('请假申请已提交');
      setLeaveModalVisible(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveLeave = (rehearsalId: string, leaveId: string) => {
    const rehearsal = rehearsalStorage.getById(rehearsalId);
    if (!rehearsal) return;

    const updatedLeaves = rehearsal.leaveRequests.map(l =>
      l.id === leaveId ? { ...l, status: 'approved' as const } : l
    );

    rehearsalStorage.update(rehearsalId, { leaveRequests: updatedLeaves });
    message.success('已批准请假');
    loadData();
  };

  const handleRejectLeave = (rehearsalId: string, leaveId: string) => {
    const rehearsal = rehearsalStorage.getById(rehearsalId);
    if (!rehearsal) return;

    const updatedLeaves = rehearsal.leaveRequests.map(l =>
      l.id === leaveId ? { ...l, status: 'rejected' as const } : l
    );

    rehearsalStorage.update(rehearsalId, { leaveRequests: updatedLeaves });
    message.success('已拒绝请假');
    loadData();
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '未知';

  const getAttendanceRate = (memberId: string) => {
    const completedRehearsals = rehearsals.filter(r => r.status === 'completed');
    if (completedRehearsals.length === 0) return 100;

    let attended = 0;
    completedRehearsals.forEach(r => {
      const leave = r.leaveRequests.find(l => l.memberId === memberId);
      if (!leave || leave.status !== 'approved') {
        if (r.participantIds.includes(memberId)) attended++;
      }
    });

    return Math.round((attended / completedRehearsals.length) * 100);
  };

  const memberColumns: ColumnsType<Member> = [
    {
      title: '成员',
      dataIndex: 'name',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{record.name}</span>
          <Tag color="blue">{record.instrument}</Tag>
        </Space>
      ),
    },
    { title: '电话', dataIndex: 'phone' },
    { title: '邮箱', dataIndex: 'email' },
    {
      title: '可排练时间',
      dataIndex: 'availableTimes',
      render: (times: AvailableTime[]) => (
        <Tooltip
          title={
            <List
              size="small"
              dataSource={times}
              renderItem={t => (
                <List.Item>{DAYS[t.dayOfWeek]} {t.startTime}-{t.endTime}</List.Item>
              )}
            />
          }
        >
          <Tag color="green">{times.length} 个时段</Tag>
        </Tooltip>
      ),
    },
    {
      title: '出席率',
      render: (_, record) => {
        const rate = getAttendanceRate(record.id);
        return <Progress percent={rate} size="small" style={{ width: 100 }} />;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: status => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '活跃' : '非活跃'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditMember(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDeleteMember(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rehearsalColumns: ColumnsType<Rehearsal> = [
    { title: '标题', dataIndex: 'title' },
    {
      title: '日期',
      dataIndex: 'date',
      render: (_, record) => (
        <Space>
          <CalendarOutlined />
          <span>{record.date}</span>
          <ClockCircleOutlined />
          <span>{record.startTime}-{record.endTime}</span>
        </Space>
      ),
    },
    { title: '地点', dataIndex: 'location' },
    {
      title: '参与人数',
      dataIndex: 'participantIds',
      render: ids => <Tag>{ids.length} 人</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: status => {
        const colors: Record<string, string> = {
          planned: 'blue',
          completed: 'green',
          cancelled: 'default',
        };
        const labels: Record<string, string> = {
          planned: '已计划',
          completed: '已完成',
          cancelled: '已取消',
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleLeaveRequest(record)}>请假</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditRehearsal(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDeleteRehearsal(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const pendingLeaves = rehearsals.flatMap(r =>
    r.leaveRequests
      .filter(l => l.status === 'pending')
      .map(l => ({ ...l, rehearsal: r }))
  );

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="乐队成员"
              value={members.filter(m => m.status === 'active').length}
              prefix={<TeamOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="计划排练"
              value={rehearsals.filter(r => r.status === 'planned').length}
              prefix={<ScheduleOutlined />}
              suffix="场"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审批请假"
              value={pendingLeaves.length}
              prefix={<ExclamationCircleOutlined />}
              suffix="条"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成排练"
              value={rehearsals.filter(r => r.status === 'completed').length}
              prefix={<CheckCircleOutlined />}
              suffix="场"
            />
          </Card>
        </Col>
      </Row>

      <Card
        tabList={[
          { key: 'members', label: '成员管理' },
          { key: 'rehearsals', label: '排练日程' },
          { key: 'leaves', label: '请假管理' },
        ]}
        activeTabKey={activeTab}
        onTabChange={key => setActiveTab(key as any)}
        extra={
          activeTab === 'members' ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMember}>
              添加成员
            </Button>
          ) : activeTab === 'rehearsals' ? (
            <Space>
              <Button icon={<CalendarOutlined />} onClick={recommendBestTime}>
                智能推荐时间
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRehearsal}>
                添加排练
              </Button>
            </Space>
          ) : null
        }
      >
        {activeTab === 'members' && (
          <Table columns={memberColumns} dataSource={members} rowKey="id" />
        )}

        {activeTab === 'rehearsals' && (
          <Table columns={rehearsalColumns} dataSource={rehearsals} rowKey="id" />
        )}

        {activeTab === 'leaves' && (
          <Table
            rowKey="id"
            dataSource={pendingLeaves as any}
            columns={[
              {
                title: '成员',
                dataIndex: 'memberId',
                render: id => getMemberName(id),
              },
              {
                title: '排练',
                dataIndex: ['rehearsal', 'title'],
              },
              {
                title: '日期',
                dataIndex: ['rehearsal', 'date'],
              },
              { title: '请假原因', dataIndex: 'reason' },
              {
                title: '申请时间',
                dataIndex: 'createdAt',
                render: t => dayjs(t).format('YYYY-MM-DD HH:mm'),
              },
              {
                title: '操作',
                key: 'actions',
                render: (_, record: any) => (
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleApproveLeave(record.rehearsal.id, record.id)}
                    >
                      批准
                    </Button>
                    <Button
                      danger
                      size="small"
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleRejectLeave(record.rehearsal.id, record.id)}
                    >
                      拒绝
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal
        title={editingMember ? '编辑成员' : '添加成员'}
        open={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        onOk={handleSaveMember}
        width={700}
      >
        <Form form={memberForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="instrument" label="声部" rules={[{ required: true }]}>
                <Select options={INSTRUMENTS.map(i => ({ label: i, value: i }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="电话" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="joinDate" label="加入日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '活跃', value: 'active' },
                    { label: '非活跃', value: 'inactive' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="availableTimes"
            label="可参加排练时间"
            tooltip="添加成员通常可参加的排练时间段"
          >
            <Select
              mode="multiple"
              placeholder="选择可排练时间"
              style={{ width: '100%' }}
              options={DAYS.flatMap((day, dayIdx) =>
                ['19:00-21:00', '20:00-22:00', '14:00-18:00', '10:00-14:00'].map(time => ({
                  label: `${day} ${time}`,
                  value: {
                    dayOfWeek: dayIdx,
                    startTime: time.split('-')[0],
                    endTime: time.split('-')[1],
                  },
                }))
              )}
              optionLabelProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingRehearsal ? '编辑排练' : '添加排练'}
        open={rehearsalModalVisible}
        onCancel={() => setRehearsalModalVisible(false)}
        onOk={handleSaveRehearsal}
        width={700}
      >
        <Form form={rehearsalForm} layout="vertical">
          <Form.Item name="title" label="排练标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="date" label="日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="startTime" label="开始时间" rules={[{ required: true }]}>
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="endTime" label="结束时间" rules={[{ required: true }]}>
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="location" label="地点" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="participantIds" label="参与成员">
            <Select
              mode="multiple"
              placeholder="选择参与成员"
              style={{ width: '100%' }}
              options={members
                .filter(m => m.status === 'active')
                .map(m => ({ label: `${m.name} (${m.instrument})`, value: m.id }))}
            />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="请假申请"
        open={leaveModalVisible}
        onCancel={() => setLeaveModalVisible(false)}
        onOk={handleSubmitLeave}
      >
        <Form form={leaveForm} layout="vertical">
          <Form.Item name="memberId" label="请假成员" rules={[{ required: true }]}>
            <Select
              placeholder="选择成员"
              options={members.map(m => ({ label: m.name, value: m.id }))}
            />
          </Form.Item>
          <Form.Item name="reason" label="请假原因" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="请输入请假原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BandManagement;
