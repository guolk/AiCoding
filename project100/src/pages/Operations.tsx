import React, { useState } from 'react';
import { Card, List, Button, Tag, Modal, Form, Input, Select, message, Table, Avatar, Space } from 'antd';
import { PlusOutlined, BellOutlined, TrophyOutlined, HistoryOutlined, CheckOutlined, BookOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { Notification, Honor } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const Operations: React.FC = () => {
  const { notifications, setNotifications, honors, competitions, user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: values.title,
        content: values.content,
        type: values.type,
        publishDate: dayjs().toISOString(),
        isRead: false
      };

      setNotifications(prev => [newNotification, ...prev]);
      setIsModalOpen(false);
      message.success('通知发布成功');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const historyColumns = [
    { title: '竞赛名称', dataIndex: 'competitionTitle', key: 'title' },
    { title: '得分', dataIndex: 'score', key: 'score', render: (s: number) => <Tag color="blue">{s}分</Tag> },
    { title: '排名', dataIndex: 'rank', key: 'rank', render: (r: number) => <Tag color="orange">第{r}名</Tag> },
    { title: '完成时间', dataIndex: 'completedAt', key: 'date', render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm') }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>活动运营</h2>
      
      <Card title="通知公告" style={{ marginBottom: 24 }} extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          发布通知
        </Button>
      }>
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              actions={[
                !item.isRead && (
                  <Button type="link" onClick={() => markAsRead(item.id)}>
                    标记已读
                  </Button>
                )
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={item.type === 'competition' ? <TrophyOutlined /> : item.type === 'training' ? <BookOutlined /> : <BellOutlined />} 
                    style={{ 
                      backgroundColor: item.type === 'competition' ? '#1890ff' : item.type === 'training' ? '#722ed1' : '#faad14' 
                    }} 
                  />
                }
                title={
                  <Space>
                    {item.title}
                    {!item.isRead && <Tag color="red">新</Tag>}
                  </Space>
                }
                description={
                  <>
                    <p style={{ marginBottom: 4 }}>{item.content}</p>
                    <small style={{ color: '#999' }}>
                      {dayjs(item.publishDate).format('YYYY-MM-DD HH:mm')}
                    </small>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="优秀表彰" style={{ marginBottom: 24 }}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
          dataSource={honors}
          renderItem={(item) => (
            <List.Item>
              <Card hoverable>
                <div style={{ textAlign: 'center' }}>
                  <Avatar size={64} style={{ marginBottom: 12, backgroundColor: item.rank === 1 ? '#faad14' : item.rank === 2 ? '#d9d9d9' : '#d48806' }}>
                    {item.userName.charAt(0)}
                  </Avatar>
                  <h3>{item.userName}</h3>
                  <Tag color="blue">{item.competitionTitle}</Tag>
                  <div style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold', color: item.rank === 1 ? '#faad14' : '#666' }}>
                    第{item.rank}名
                  </div>
                  <div style={{ color: '#999', fontSize: 12 }}>
                    {item.awardDate}
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Card title="成绩档案">
        <Table
          rowKey="competitionId"
          columns={historyColumns}
          dataSource={user.competitionHistory || []}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="发布通知"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="发布"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="通知标题"
            rules={[{ required: true, message: '请输入通知标题' }]}
          >
            <Input placeholder="请输入通知标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="通知内容"
            rules={[{ required: true, message: '请输入通知内容' }]}
          >
            <TextArea rows={4} placeholder="请输入通知内容" />
          </Form.Item>

          <Form.Item
            name="type"
            label="通知类型"
            rules={[{ required: true, message: '请选择通知类型' }]}
          >
            <Select placeholder="请选择通知类型">
              <Option value="competition">竞赛通知</Option>
              <Option value="training">培训通知</Option>
              <Option value="system">系统通知</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Operations;