import React from 'react';
import { Card, Row, Col, Statistic, List, Avatar, Tag, Progress, Button, Badge } from 'antd';
import { TrophyOutlined, BookOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, competitions, courses, notifications, questions } = useAppContext();

  const upcomingCompetitions = competitions.filter(c => dayjs(c.startTime).isAfter(dayjs()));
  const ongoingCompetitions = competitions.filter(c => 
    dayjs(c.startTime).isBefore(dayjs()) && dayjs(c.endTime).isAfter(dayjs())
  );

  const radarOption = {
    radar: {
      indicator: [
        { name: '产品知识', max: 100 },
        { name: '规章制度', max: 100 },
        { name: '行业知识', max: 100 },
        { name: '安全规范', max: 100 }
      ],
      radius: 100
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          user.knowledgeRadar?.product || 0,
          user.knowledgeRadar?.regulation || 0,
          user.knowledgeRadar?.industry || 0,
          user.knowledgeRadar?.safety || 0
        ],
        name: '知识掌握度',
        areaStyle: { opacity: 0.3 }
      }]
    }]
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>欢迎回来，{user.name}！</h2>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="竞赛参与次数"
              value={user.competitionHistory?.length || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="获得证书"
              value={user.certificates?.length || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待参加竞赛"
              value={upcomingCompetitions.length + ongoingCompetitions.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待完成培训"
              value={courses.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="进行中的活动" style={{ marginBottom: 16 }}>
            <List
              itemLayout="horizontal"
              dataSource={[...ongoingCompetitions, ...upcomingCompetitions]}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="primary" onClick={() => navigate('/competitions')}>
                      参加
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={item.title}
                    description={
                      <>
                        <Tag color="blue">{dayjs(item.startTime).format('YYYY-MM-DD')} - {dayjs(item.endTime).format('YYYY-MM-DD')}</Tag>
                        <span style={{ marginLeft: 8 }}>{item.description}</span>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title="最新通知">
            <List
              itemLayout="horizontal"
              dataSource={notifications.slice(0, 3)}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.isRead ? <BellOutlined /> : <Badge dot><BellOutlined /></Badge>}
                    title={item.title}
                    description={
                      <>
                        <span>{item.content}</span>
                        <br />
                        <small style={{ color: '#999' }}>{dayjs(item.publishDate).format('YYYY-MM-DD HH:mm')}</small>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="知识掌握度雷达图" style={{ marginBottom: 16 }}>
            <ReactECharts option={radarOption} style={{ height: 300 }} />
          </Card>

          <Card title="我的证书">
            <List
              dataSource={user.certificates?.slice(0, 3) || []}
              renderItem={(cert) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                    title={cert.title}
                    description={
                      <>
                        <div>分数：{cert.score}分</div>
                        <div style={{ color: '#999', fontSize: 12 }}>有效期至：{cert.validUntil}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
