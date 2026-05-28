import React, { useState } from 'react';
import { Card, List, Button, Tag, Modal, Form, Input, Select, DatePicker, Switch, Space, Statistic, Table, Avatar, Popconfirm, message } from 'antd';
import { PlusOutlined, PlayCircleOutlined, TrophyOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { Competition, QuestionCategory, DifficultyLevel, Question } from '../types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../utils/constants';
import dayjs from 'dayjs';
import CompetitionDetail from './CompetitionDetail';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const Competitions: React.FC = () => {
  const { competitions, setCompetitions, questions, user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleJoin = (competition: Competition) => {
    setSelectedCompetition(competition);
    setShowDetail(true);
  };

  const handleDelete = (id: string) => {
    setCompetitions(prev => prev.filter(c => c.id !== id));
    message.success('竞赛删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newCompetition: Competition = {
        id: Date.now().toString(),
        title: values.title,
        description: values.description,
        startTime: values.dateRange[0].toISOString(),
        endTime: values.dateRange[1].toISOString(),
        duration: values.duration,
        questionCount: values.questionCount,
        randomQuestions: values.randomQuestions || false,
        shuffleOptions: values.shuffleOptions || false,
        noBacktrack: values.noBacktrack || false,
        participants: [],
        categories: values.categories,
        difficulties: values.difficulties,
        leaderboard: []
      };

      setCompetitions(prev => [...prev, newCompetition]);
      setIsModalOpen(false);
      message.success('竞赛创建成功');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const getStatus = (competition: Competition) => {
    const now = dayjs();
    const start = dayjs(competition.startTime);
    const end = dayjs(competition.endTime);
    
    if (now.isBefore(start)) return { text: '即将开始', color: 'blue' };
    if (now.isAfter(end)) return { text: '已结束', color: 'default' };
    return { text: '进行中', color: 'green' };
  };

  if (showDetail && selectedCompetition) {
    return <CompetitionDetail competition={selectedCompetition} onBack={() => setShowDetail(false)} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title="竞赛活动"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            创建竞赛
          </Button>
        }
      >
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
          dataSource={competitions}
          renderItem={(competition) => {
            const status = getStatus(competition);
            return (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    status.text !== '已结束' && (
                      <Button 
                        type="primary" 
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleJoin(competition)}
                      >
                        {status.text === '进行中' ? '开始答题' : '查看详情'}
                      </Button>
                    ),
                    <Popconfirm
                      key="delete"
                      title="确定要删除这个竞赛吗？此操作不可恢复！"
                      onConfirm={() => handleDelete(competition.id)}
                      okText="确定删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>
                  ].filter(Boolean)}
                >
                  <Card.Meta
                    avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={
                      <Space>
                        {competition.title}
                        <Tag color={status.color}>{status.text}</Tag>
                      </Space>
                    }
                    description={
                      <>
                        <p style={{ marginBottom: 8 }}>{competition.description}</p>
                        <Space wrap style={{ marginBottom: 8 }}>
                          {competition.categories.map(cat => (
                            <Tag key={cat} color="blue">{CATEGORY_LABELS[cat]}</Tag>
                          ))}
                          {competition.difficulties.map(diff => (
                            <Tag key={diff} color="orange">{DIFFICULTY_LABELS[diff]}</Tag>
                          ))}
                        </Space>
                        <Space size="large">
                          <Statistic title="题目数量" value={competition.questionCount} />
                          <Statistic title="答题时间" value={competition.duration} suffix="分钟" />
                          <Statistic title="参与人数" value={competition.participants.length} />
                        </Space>
                        <div style={{ marginTop: 12, color: '#999' }}>
                          时间：{dayjs(competition.startTime).format('YYYY-MM-DD HH:mm')} ~ {dayjs(competition.endTime).format('YYYY-MM-DD HH:mm')}
                        </div>
                      </>
                    }
                  />
                  
                  {competition.leaderboard.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <h4>排行榜</h4>
                      <Table
                        size="small"
                        pagination={false}
                        columns={[
                          { title: '排名', dataIndex: 'rank', key: 'rank', width: 60 },
                          { title: '姓名', dataIndex: 'userName', key: 'userName' },
                          { title: '得分', dataIndex: 'score', key: 'score' }
                        ]}
                        dataSource={competition.leaderboard.slice(0, 5).map((item, index) => ({
                          ...item,
                          key: item.userId,
                          rank: index + 1
                        }))}
                      />
                    </div>
                  )}
                </Card>
              </List.Item>
            );
          }}
        />
      </Card>

      <Modal
        title="创建竞赛"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="竞赛名称"
            rules={[{ required: true, message: '请输入竞赛名称' }]}
          >
            <Input placeholder="请输入竞赛名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="竞赛描述"
          >
            <TextArea rows={3} placeholder="请输入竞赛描述" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="竞赛时间"
            rules={[{ required: true, message: '请选择竞赛时间' }]}
          >
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="duration"
            label="答题时长（分钟）"
            rules={[{ required: true, message: '请输入答题时长' }]}
          >
            <Input type="number" placeholder="请输入答题时长" />
          </Form.Item>

          <Form.Item
            name="questionCount"
            label="题目数量"
            rules={[{ required: true, message: '请输入题目数量' }]}
          >
            <Input type="number" placeholder="请输入题目数量" />
          </Form.Item>

          <Form.Item
            name="categories"
            label="题目分类"
            rules={[{ required: true, message: '请选择题目分类' }]}
          >
            <Select mode="multiple" placeholder="请选择题目分类">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="difficulties"
            label="题目难度"
            rules={[{ required: true, message: '请选择题目难度' }]}
          >
            <Select mode="multiple" placeholder="请选择题目难度">
              {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="randomQuestions" label="随机抽题" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="shuffleOptions" label="选项随机打乱" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="noBacktrack" label="禁止回退" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Competitions;
