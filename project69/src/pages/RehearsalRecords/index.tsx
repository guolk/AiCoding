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
  Upload,
  List,
  Row,
  Col,
  Statistic,
  Drawer,
  Descriptions,
  Divider,
  Badge,
  Checkbox,
  Timeline,
  UploadProps,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  AudioOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { RehearsalRecord, Member, Song, Rehearsal, TechnicalIssue } from '../../types';
import {
  rehearsalRecordStorage,
  memberStorage,
  songStorage,
  rehearsalStorage,
  recordingStorage,
  generateId,
} from '../../utils/storage';

const RehearsalRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<RehearsalRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RehearsalRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<RehearsalRecord | null>(null);
  const [form] = Form.useForm();
  const [issueForm] = Form.useForm();
  const [recordingFileList, setRecordingFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecords(rehearsalRecordStorage.getAll());
    setMembers(memberStorage.getAll());
    setSongs(songStorage.getAll());
    setRehearsals(rehearsalStorage.getAll());
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      participantIds: [],
      songIds: [],
      focusSegments: [],
      technicalIssues: [],
      recordingIds: [],
    });
    setModalVisible(true);
  };

  const handleEdit = (record: RehearsalRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    rehearsalRecordStorage.delete(id);
    loadData();
    message.success('删除成功');
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const recordData: RehearsalRecord = {
        id: editingRecord?.id || generateId(),
        date: values.date,
        duration: values.duration,
        participantIds: values.participantIds || [],
        songIds: values.songIds || [],
        focusSegments: values.focusSegments || [],
        technicalIssues: editingRecord?.technicalIssues || [],
        recordingIds: editingRecord?.recordingIds || [],
        notes: values.notes || '',
        ...(values.rehearsalId ? { rehearsalId: values.rehearsalId } : {}),
      };

      if (editingRecord) {
        rehearsalRecordStorage.update(editingRecord.id, recordData);
        message.success('更新成功');
      } else {
        rehearsalRecordStorage.add(recordData);
        message.success('添加成功');
      }

      setModalVisible(false);
      loadData();
    } catch (e) {
      console.error(e);
      message.error('保存失败，请检查数据');
    }
  };

  const handleViewDetail = (record: RehearsalRecord) => {
    setViewingRecord(record);
    setDetailVisible(true);
  };

  const handleAddIssue = () => {
    issueForm.resetFields();
    setIssueModalVisible(true);
  };

  const handleSaveIssue = async () => {
    if (!viewingRecord) return;

    try {
      const values = await issueForm.validateFields();
      const newIssue: TechnicalIssue = {
        id: generateId(),
        rehearsalRecordId: viewingRecord.id,
        songId: values.songId,
        description: values.description,
        measure: values.measure,
        status: 'open',
        assignedTo: values.assignedTo,
      };

      const updatedIssues = [...viewingRecord.technicalIssues, newIssue];
      rehearsalRecordStorage.update(viewingRecord.id, { technicalIssues: updatedIssues });
      message.success('问题添加成功');
      setIssueModalVisible(false);
      loadData();
      setViewingRecord({ ...viewingRecord, technicalIssues: updatedIssues });
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveIssue = (issueId: string) => {
    if (!viewingRecord) return;
    const updatedIssues = viewingRecord.technicalIssues.map(i =>
      i.id === issueId ? { ...i, status: 'resolved' as const } : i
    );
    rehearsalRecordStorage.update(viewingRecord.id, { technicalIssues: updatedIssues });
    message.success('问题已标记为已解决');
    loadData();
    setViewingRecord({ ...viewingRecord, technicalIssues: updatedIssues });
  };

  const handleDeleteIssue = (issueId: string) => {
    if (!viewingRecord) return;
    const updatedIssues = viewingRecord.technicalIssues.filter(i => i.id !== issueId);
    rehearsalRecordStorage.update(viewingRecord.id, { technicalIssues: updatedIssues });
    message.success('问题已删除');
    loadData();
    setViewingRecord({ ...viewingRecord, technicalIssues: updatedIssues });
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '未知';
  const getSongName = (id: string) => songs.find(s => s.id === id)?.name || '未知';
  const getRehearsalTitle = (id?: string) => id ? (rehearsals.find(r => r.id === id)?.title || '独立排练') : '独立排练';

  const columns: ColumnsType<RehearsalRecord> = [
    {
      title: '排练日期',
      dataIndex: 'date',
      render: v => (
        <Space>
          <CalendarOutlined />
          {v}
        </Space>
      ),
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      defaultSortOrder: 'descend',
    },
    {
      title: '关联排练',
      dataIndex: 'rehearsalId',
      render: id => <Tag color="blue">{getRehearsalTitle(id)}</Tag>,
    },
    {
      title: '参与人数',
      dataIndex: 'participantIds',
      render: ids => (
        <Space>
          <UserOutlined />
          <span>{ids.length} 人</span>
        </Space>
      ),
    },
    {
      title: '排练曲目',
      dataIndex: 'songIds',
      render: ids => <Tag color="purple">{ids.length} 首</Tag>,
    },
    {
      title: '时长',
      dataIndex: 'duration',
      render: m => (
        <Space>
          <ClockCircleOutlined />
          <span>{m} 分钟</span>
        </Space>
      ),
    },
    {
      title: '待解决问题',
      dataIndex: 'technicalIssues',
      render: issues => {
        const openCount = issues.filter((i: any) => i.status === 'open').length;
        return openCount > 0 ? (
          <Badge count={openCount} offset={[0, 0]}>
            <Tag color="orange">技术问题</Tag>
          </Badge>
        ) : (
          <Tag color="green">无问题</Tag>
        );
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

  const stats = {
    total: records.length,
    totalHours: records.reduce((sum, r) => sum + r.duration, 0),
    openIssues: records.flatMap(r => r.technicalIssues).filter(i => i.status === 'open').length,
    totalSongs: new Set(records.flatMap(r => r.songIds)).size,
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="排练记录" value={stats.total} prefix={<FileTextOutlined />} suffix="次" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="累计排练时长"
              value={Math.round(stats.totalHours / 60)}
              prefix={<ClockCircleOutlined />}
              suffix="小时"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待解决问题"
              value={stats.openIssues}
              prefix={<ExclamationCircleOutlined />}
              suffix="个"
              valueStyle={{ color: stats.openIssues > 0 ? '#fa8c16' : undefined }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="涉及曲目" value={stats.totalSongs} prefix={<AudioOutlined />} suffix="首" />
          </Card>
        </Col>
      </Row>

      <Card
        title="排练记录"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加记录
          </Button>
        }
      >
        <Table columns={columns} dataSource={records} rowKey="id" />
      </Card>

      <Modal
        title={editingRecord ? '编辑排练记录' : '添加排练记录'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="排练日期" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration" label="时长(分钟)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} placeholder="分钟" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="rehearsalId" label="关联排练计划">
            <Select
              placeholder="选择关联的排练计划（可选）"
              allowClear
              options={rehearsals.map(r => ({ label: `${r.title} (${r.date})`, value: r.id }))}
            />
          </Form.Item>
          <Form.Item name="participantIds" label="参与人员" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              placeholder="选择参与成员"
              options={members.map(m => ({ label: `${m.name} (${m.instrument})`, value: m.id }))}
            />
          </Form.Item>
          <Form.Item name="songIds" label="排练曲目">
            <Select
              mode="multiple"
              placeholder="选择排练的曲目"
              options={songs.map(s => ({ label: `${s.name} - ${s.artist}`, value: s.id }))}
            />
          </Form.Item>
          <Form.Item name="focusSegments" label="重点练习片段">
            <Select
              mode="tags"
              placeholder="输入或选择重点练习的片段，如：副歌、吉他solo等"
              tokenSeparators={[',']}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="notes" label="排练备注">
            <Input.TextArea rows={3} placeholder="记录本次排练的整体情况和感想" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="排练记录详情"
        width={700}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddIssue}>
              添加技术问题
            </Button>
          </Space>
        }
      >
        {viewingRecord && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="排练日期">{viewingRecord.date}</Descriptions.Item>
              <Descriptions.Item label="关联排练">{getRehearsalTitle(viewingRecord.rehearsalId)}</Descriptions.Item>
              <Descriptions.Item label="时长">{viewingRecord.duration} 分钟</Descriptions.Item>
              <Descriptions.Item label="参与人员">
                {viewingRecord.participantIds.map(id => (
                  <Tag key={id} color="blue">{getMemberName(id)}</Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="排练曲目">
                {viewingRecord.songIds.map(id => (
                  <Tag key={id} color="purple">{getSongName(id)}</Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="重点练习">
                {viewingRecord.focusSegments.length > 0 ? (
                  <Space wrap>
                    {viewingRecord.focusSegments.map((seg, idx) => (
                      <Tag key={idx} color="orange">{seg}</Tag>
                    ))}
                  </Space>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="备注">{viewingRecord.notes || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <Space>
                <ExclamationCircleOutlined />
                技术问题清单
                <Badge count={viewingRecord.technicalIssues.filter(i => i.status === 'open').length} />
              </Space>
            </Divider>

            {viewingRecord.technicalIssues.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 16, color: '#52c41a' }} />
                <p>暂无技术问题</p>
              </div>
            ) : (
              <List
                dataSource={viewingRecord.technicalIssues}
                renderItem={issue => (
                  <List.Item
                    actions={[
                      issue.status === 'open' ? (
                        <Button type="link" onClick={() => handleResolveIssue(issue.id)}>
                          标记已解决
                        </Button>
                      ) : null,
                      <Popconfirm title="确定删除?" onConfirm={() => handleDeleteIssue(issue.id)}>
                        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                      </Popconfirm>,
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      avatar={
                        issue.status === 'open' ? (
                          <ExclamationCircleOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
                        ) : (
                          <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                        )
                      }
                      title={
                        <Space>
                          <span>{getSongName(issue.songId)}</span>
                          {issue.measure && <Tag color="default">{issue.measure}</Tag>}
                          <Tag color={issue.status === 'open' ? 'orange' : 'green'}>
                            {issue.status === 'open' ? '待解决' : '已解决'}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <p style={{ margin: '4px 0' }}>{issue.description}</p>
                          {issue.assignedTo && (
                            <span style={{ color: '#999' }}>负责人：{getMemberName(issue.assignedTo)}</span>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}

            <Divider orientation="left">
              <Space>
                <AudioOutlined />
                排练录音
              </Space>
            </Divider>

            <div style={{ textAlign: 'center', padding: 20 }}>
              <Upload
                fileList={recordingFileList}
                onChange={({ fileList }) => setRecordingFileList(fileList)}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>上传录音文件</Button>
              </Upload>
              <p style={{ color: '#999', marginTop: 8 }}>支持 MP3、WAV 等音频格式</p>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        title="添加技术问题"
        open={issueModalVisible}
        onCancel={() => setIssueModalVisible(false)}
        onOk={handleSaveIssue}
      >
        <Form form={issueForm} layout="vertical">
          <Form.Item name="songId" label="相关曲目" rules={[{ required: true }]}>
            <Select
              placeholder="选择曲目"
              options={songs.map(s => ({ label: s.name, value: s.id }))}
            />
          </Form.Item>
          <Form.Item name="measure" label="小节位置">
            <Input placeholder="如：第32-40小节" />
          </Form.Item>
          <Form.Item name="description" label="问题描述" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="详细描述技术问题，如：速度不一致、衔接不流畅等" />
          </Form.Item>
          <Form.Item name="assignedTo" label="负责人">
            <Select
              placeholder="选择负责解决的成员"
              options={members.map(m => ({ label: m.name, value: m.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RehearsalRecordsPage;
