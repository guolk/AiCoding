import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Tag,
  Space,
  Progress,
  Avatar,
  Timeline,
  Calendar,
  Badge,
  Button,
} from 'antd';
import {
  TeamOutlined,
  AudioOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  ToolOutlined,
  ShareAltOutlined,
  StarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Member, Rehearsal, Song, Performance, RehearsalRecord } from '../../types';
import {
  memberStorage,
  rehearsalStorage,
  songStorage,
  performanceStorage,
  rehearsalRecordStorage,
  equipmentStorage,
  borrowRecordStorage,
} from '../../utils/storage';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [records, setRecords] = useState<RehearsalRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMembers(memberStorage.getAll());
    setRehearsals(rehearsalStorage.getAll());
    setSongs(songStorage.getAll());
    setPerformances(performanceStorage.getAll());
    setRecords(rehearsalRecordStorage.getAll());
  };

  const activeMembers = (members || []).filter(m => m.status === 'active');
  const plannedRehearsals = (rehearsals || []).filter(r => r.status === 'planned');
  const upcomingRehearsals = plannedRehearsals
    .filter(r => dayjs(r.date).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
    .slice(0, 5);

  const upcomingPerformances = (performances || [])
    .filter(p => dayjs(p.date).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
    .slice(0, 5);

  const learningSongs = (songs || []).filter(s => s.status === '学习中');
  const readySongs = (songs || []).filter(s => s.status === '可演出');
  const archivedSongs = (songs || []).filter(s => s.status === '已归档');

  const totalRehearsalHours = (records || []).reduce((sum, r) => sum + r.duration, 0);
  const openIssues = (records || []).flatMap(r => r.technicalIssues || []).filter((i: any) => i?.status === 'open').length;

  const getListData = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayRehearsals = rehearsals.filter(r => r.date === dateStr);
    const dayPerformances = performances.filter(p => p.date === dateStr);
    
    return [
      ...dayRehearsals.map(r => ({ type: 'rehearsal', content: r.title })),
      ...dayPerformances.map(p => ({ type: 'performance', content: p.title })),
    ];
  };

  const cellRender = (current: dayjs.Dayjs, info: any) => {
    if (info.type !== 'date') return info.originNode;
    const listData = getListData(current);
    return (
      <div className="ant-picker-calendar-date-content">
        {info.originNode}
        <ul className="events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {listData.map((item, idx) => (
            <li key={idx} style={{ fontSize: 12, lineHeight: '18px' }}>
              <Badge
                status={item.type === 'rehearsal' ? 'processing' : 'success'}
                text={item.content}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  };

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

  const memberAttendance = activeMembers
    .map(m => ({
      ...m,
      rate: getAttendanceRate(m.id),
    }))
    .sort((a, b) => a.rate - b.rate);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card hoverable onClick={() => navigate('/band')}>
            <Statistic
              title="乐队成员"
              value={activeMembers.length}
              prefix={<TeamOutlined />}
              suffix="人"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card hoverable onClick={() => navigate('/songs')}>
            <Statistic
              title="曲目库"
              value={songs.length}
              prefix={<AudioOutlined />}
              suffix="首"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card hoverable onClick={() => navigate('/records')}>
            <Statistic
              title="排练记录"
              value={records.length}
              prefix={<FileTextOutlined />}
              suffix="次"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card hoverable onClick={() => navigate('/performances')}>
            <Statistic
              title="演出场次"
              value={performances.length}
              prefix={<TrophyOutlined />}
              suffix="场"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card hoverable onClick={() => navigate('/resources')}>
            <Statistic
              title="设备数量"
              value={equipmentStorage.getAll().length}
              prefix={<ToolOutlined />}
              suffix="件"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card hoverable>
            <Statistic
              title="累计排练"
              value={Math.round(totalRehearsalHours / 60)}
              prefix={<ClockCircleOutlined />}
              suffix="小时"
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                即将到来的排练
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/band')}>
                查看全部 <ArrowRightOutlined />
              </Button>
            }
            size="small"
          >
            {upcomingRehearsals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                <CalendarOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                <p>暂无排练计划</p>
              </div>
            ) : (
              <List
                dataSource={upcomingRehearsals}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<CalendarOutlined />} />}
                      title={item.title}
                      description={
                        <Space>
                          <Tag color="blue">{item.date}</Tag>
                          <Tag>{item.startTime}-{item.endTime}</Tag>
                          <span>{item.location}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title={
              <Space>
                <TrophyOutlined />
                即将到来的演出
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/performances')}>
                查看全部 <ArrowRightOutlined />
              </Button>
            }
            size="small"
          >
            {upcomingPerformances.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                <TrophyOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                <p>暂无演出安排</p>
              </div>
            ) : (
              <List
                dataSource={upcomingPerformances}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: '#fa8c16' }} />}
                      title={item.title}
                      description={
                        <Space>
                          <Tag color="orange">{item.date}</Tag>
                          <Tag>{item.time}</Tag>
                          <span>{item.location}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title={
              <Space>
                <StarOutlined />
                曲目状态统计
              </Space>
            }
            size="small"
          >
            <List>
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: '#fa8c16' }}>
                      {learningSongs.length}
                    </Avatar>
                  }
                  title="学习中"
                  description={
                    <Progress
                      percent={songs.length ? Math.round((learningSongs.length / songs.length) * 100) : 0}
                      size="small"
                      strokeColor="#fa8c16"
                      showInfo={false}
                    />
                  }
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: '#52c41a' }}>
                      {readySongs.length}
                    </Avatar>
                  }
                  title="可演出"
                  description={
                    <Progress
                      percent={songs.length ? Math.round((readySongs.length / songs.length) * 100) : 0}
                      size="small"
                      strokeColor="#52c41a"
                      showInfo={false}
                    />
                  }
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: '#8c8c8c' }}>
                      {archivedSongs.length}
                    </Avatar>
                  }
                  title="已归档"
                  description={
                    <Progress
                      percent={songs.length ? Math.round((archivedSongs.length / songs.length) * 100) : 0}
                      size="small"
                      strokeColor="#8c8c8c"
                      showInfo={false}
                    />
                  }
                />
              </List.Item>
            </List>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                日程日历
              </Space>
            }
            size="small"
          >
            <Calendar
              cellRender={cellRender as any}
              fullscreen={false}
              style={{ border: 'none', padding: 0 }}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                    待解决的技术问题
                  </Space>
                }
                size="small"
                extra={
                  openIssues > 0 ? (
                    <Badge count={openIssues} />
                  ) : null
                }
              >
                {openIssues === 0 ? (
                  <div style={{ textAlign: 'center', padding: 16, color: '#52c41a' }}>
                    <CheckCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                    <p>所有技术问题已解决！</p>
                  </div>
                ) : (
                  <List
                    size="small"
                    dataSource={records.flatMap(r => r.technicalIssues).filter(i => i.status === 'open').slice(0, 5)}
                    renderItem={item => (
                      <List.Item>
                        <Space>
                          <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                          <span>{item.description}</span>
                          {item.measure && <Tag style={{ fontSize: 12 }}>{item.measure}</Tag>}
                        </Space>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>

            <Col span={24}>
              <Card
                title={
                  <Space>
                    <TeamOutlined />
                    成员出席率统计
                  </Space>
                }
                size="small"
                extra={
                  <Button type="link" onClick={() => navigate('/band')}>
                    详细 <ArrowRightOutlined />
                  </Button>
                }
              >
                <List
                  size="small"
                  dataSource={memberAttendance.slice(0, 5)}
                  renderItem={item => (
                    <List.Item>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                          <Avatar size="small" icon={<TeamOutlined />} />
                          <span>{item.name}</span>
                          <Tag color="blue">{item.instrument}</Tag>
                        </Space>
                        <Progress
                          percent={item.rate}
                          size="small"
                          style={{ width: 120 }}
                          strokeColor={item.rate >= 90 ? '#52c41a' : item.rate >= 70 ? '#fa8c16' : '#f5222d'}
                        />
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
