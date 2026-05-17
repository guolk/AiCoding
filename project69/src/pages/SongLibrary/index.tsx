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
  Rate,
  Row,
  Col,
  Statistic,
  Drawer,
  Descriptions,
  Progress,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  EyeOutlined,
  UploadOutlined,
  AudioOutlined,
  BookOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { Song, SongVersion, SongStatus, Score, Instrument } from '../../types';
import { songStorage, generateId } from '../../utils/storage';

const INSTRUMENTS: Instrument[] = ['主唱', '吉他', '贝斯', '鼓', '键盘', '萨克斯', '小号', '长号', '小提琴', '大提琴', '其他'];
const VERSIONS: SongVersion[] = ['原版', '编曲版', '现场版', 'Demo版', '其他'];
const STATUSES: SongStatus[] = ['学习中', '可演出', '已归档'];

const SongLibrary: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [viewingSong, setViewingSong] = useState<Song | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [scoreForm] = Form.useForm();
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [currentScoreInstrument, setCurrentScoreInstrument] = useState<Instrument | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSongs(songStorage.getAll());
  };

  const handleAdd = () => {
    setEditingSong(null);
    form.resetFields();
    form.setFieldsValue({
      version: '原版',
      status: '学习中',
      difficulty: 3,
    });
    setFileList([]);
    setModalVisible(true);
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    form.setFieldsValue(song);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    songStorage.delete(id);
    loadData();
    message.success('删除成功');
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const now = new Date().toISOString();

      const songData: Song = {
        ...values,
        id: editingSong?.id || generateId(),
        createdAt: editingSong?.createdAt || now,
        updatedAt: now,
        scores: editingSong?.scores || [],
      };

      if (editingSong) {
        songStorage.update(editingSong.id, songData);
        message.success('更新成功');
      } else {
        songStorage.add(songData);
        message.success('添加成功');
      }

      setModalVisible(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewDetail = (song: Song) => {
    setViewingSong(song);
    setDetailVisible(true);
  };

  const handleAddScore = () => {
    scoreForm.resetFields();
    setScoreModalVisible(true);
  };

  const handleSaveScore = async () => {
    if (!viewingSong) return;

    try {
      const values = await scoreForm.validateFields();
      const newScore: Score = {
        id: generateId(),
        songId: viewingSong.id,
        instrument: values.instrument,
        fileName: values.fileName,
        fileUrl: '',
        annotations: [],
        permissions: [],
      };

      const updatedScores = [...viewingSong.scores, newScore];
      songStorage.update(viewingSong.id, { scores: updatedScores });
      message.success('乐谱添加成功');
      setScoreModalVisible(false);
      loadData();
      setViewingSong({ ...viewingSong, scores: updatedScores });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteScore = (scoreId: string) => {
    if (!viewingSong) return;
    const updatedScores = viewingSong.scores.filter(s => s.id !== scoreId);
    songStorage.update(viewingSong.id, { scores: updatedScores });
    message.success('乐谱删除成功');
    loadData();
    setViewingSong({ ...viewingSong, scores: updatedScores });
  };

  const handleUpdateStatus = (songId: string, status: SongStatus) => {
    songStorage.update(songId, { status });
    loadData();
    message.success('状态更新成功');
  };

  const getStatusColor = (status: SongStatus) => {
    const colors: Record<SongStatus, string> = {
      学习中: 'orange',
      可演出: 'green',
      已归档: 'default',
    };
    return colors[status];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const columns: ColumnsType<Song> = [
    {
      title: '曲目名称',
      dataIndex: 'name',
      render: (_, record) => (
        <Space>
          <AudioOutlined />
          <span style={{ fontWeight: 500 }}>{record.name}</span>
        </Space>
      ),
    },
    { title: '艺术家', dataIndex: 'artist' },
    {
      title: '版本',
      dataIndex: 'version',
      render: v => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      render: d => <Rate disabled value={d} />,
    },
    {
      title: '时长',
      dataIndex: 'duration',
      render: d => (
        <Space>
          <ClockCircleOutlined />
          {formatDuration(d)}
        </Space>
      ),
    },
    {
      title: '乐谱数量',
      dataIndex: 'scores',
      render: scores => <Tag color="purple">{scores.length} 份</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: SongStatus, record) => (
        <Select
          value={status}
          style={{ width: 100 }}
          onChange={s => handleUpdateStatus(record.id, s)}
          options={STATUSES.map(s => ({ label: s, value: s }))}
          tagRender={({ label }) => <Tag color={getStatusColor(status)}>{label}</Tag>}
        />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      render: t => dayjs(t).format('YYYY-MM-DD'),
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
    total: songs.length,
    learning: songs.filter(s => s.status === '学习中').length,
    ready: songs.filter(s => s.status === '可演出').length,
    archived: songs.filter(s => s.status === '已归档').length,
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总曲目" value={stats.total} prefix={<BookOutlined />} suffix="首" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="学习中"
              value={stats.learning}
              prefix={<LoadingOutlined />}
              suffix="首"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="可演出"
              value={stats.ready}
              prefix={<CheckCircleOutlined />}
              suffix="首"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已归档"
              value={stats.archived}
              prefix={<BookOutlined />}
              suffix="首"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="作品库"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加曲目
          </Button>
        }
      >
        <Table columns={columns} dataSource={songs} rowKey="id" />
      </Card>

      <Modal
        title={editingSong ? '编辑曲目' : '添加曲目'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="曲目名称" rules={[{ required: true }]}>
                <Input placeholder="输入曲目名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="artist" label="艺术家/原唱" rules={[{ required: true }]}>
                <Input placeholder="输入艺术家名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="version" label="版本" rules={[{ required: true }]}>
                <Select options={VERSIONS.map(v => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="difficulty" label="难度" rules={[{ required: true }]}>
                <Rate />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="duration" label="时长(秒)">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="秒" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={STATUSES.map(s => ({ label: s, value: s }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="曲目详情"
        width={700}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddScore}>
              添加乐谱
            </Button>
          </Space>
        }
      >
        {viewingSong && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="曲目名称">{viewingSong.name}</Descriptions.Item>
              <Descriptions.Item label="艺术家">{viewingSong.artist}</Descriptions.Item>
              <Descriptions.Item label="版本">
                <Tag color="blue">{viewingSong.version}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="难度">
                <Rate disabled value={viewingSong.difficulty} />
              </Descriptions.Item>
              <Descriptions.Item label="时长">{formatDuration(viewingSong.duration)}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(viewingSong.status)}>{viewingSong.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(viewingSong.createdAt).format('YYYY-MM-DD')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {dayjs(viewingSong.updatedAt).format('YYYY-MM-DD')}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">乐谱列表</Divider>

            {viewingSong.scores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <FilePdfOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>暂无乐谱文件</p>
              </div>
            ) : (
              <List
                dataSource={viewingSong.scores}
                renderItem={score => (
                  <List.Item
                    actions={[
                      <Button type="link" icon={<EyeOutlined />}>预览</Button>,
                      <Popconfirm title="确定删除?" onConfirm={() => handleDeleteScore(score.id)}>
                        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />}
                      title={score.fileName}
                      description={
                        <Space>
                          <Tag color="purple">{score.instrument}</Tag>
                          <span>{score.annotations.length} 条标注</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        )}
      </Drawer>

      <Modal
        title="添加乐谱"
        open={scoreModalVisible}
        onCancel={() => setScoreModalVisible(false)}
        onOk={handleSaveScore}
      >
        <Form form={scoreForm} layout="vertical">
          <Form.Item name="instrument" label="适用声部" rules={[{ required: true }]}>
            <Select
              placeholder="选择声部"
              options={INSTRUMENTS.map(i => ({ label: i, value: i }))}
            />
          </Form.Item>
          <Form.Item name="fileName" label="乐谱文件名" rules={[{ required: true }]}>
            <Input placeholder="例如: 海阔天空-吉他.pdf" />
          </Form.Item>
          <Form.Item label="上传乐谱文件">
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>选择PDF文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SongLibrary;
