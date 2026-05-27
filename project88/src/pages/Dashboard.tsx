import { Row, Col, Card, Statistic, Tag, List, Avatar } from 'antd'
import {
  BulbOutlined, UserOutlined, TeamOutlined, FundOutlined,
  CalendarOutlined, FileTextOutlined, RiseOutlined
} from '@ant-design/icons'
import { useStore } from '../store'

export default function Dashboard() {
  const { requirements, interviews, personas, journeys, competitors, roadmapItems, milestones, prdDocuments } = useStore()

  const pendingCount = requirements.filter((r) => r.status === 'pending').length
  const kanoDone = requirements.filter((r) => r.kanoType !== null).length
  const riceDone = requirements.filter((r) => r.rice !== null).length
  const inProgressCount = milestones.filter((m) => m.status === 'in_progress').length
  const doneCount = milestones.filter((m) => m.status === 'done').length

  const recentRequirements = [...requirements].slice(-5).reverse()
  const recentInterviews = [...interviews].slice(-3).reverse()

  const channelStats = {
    interview: requirements.filter((r) => r.channel === 'interview').length,
    survey: requirements.filter((r) => r.channel === 'survey').length,
    ticket: requirements.filter((r) => r.channel === 'ticket').length,
    competitor: requirements.filter((r) => r.channel === 'competitor').length
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 24 }}>工作台概览</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="需求总数" value={requirements.length} prefix={<BulbOutlined />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="待处理需求" value={pendingCount} prefix={<BulbOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="KANO已分类" value={kanoDone} prefix={<RiseOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="RICE已评分" value={riceDone} prefix={<RiseOutlined />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="访谈记录" value={interviews.length} prefix={<TeamOutlined />} valueStyle={{ color: '#13c2c2' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="用户画像" value={personas.length} prefix={<UserOutlined />} valueStyle={{ color: '#eb2f96' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="竞品数量" value={competitors.length} prefix={<FundOutlined />} valueStyle={{ color: '#fa541c' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="路线图规划" value={roadmapItems.length} prefix={<CalendarOutlined />} valueStyle={{ color: '#2f54eb' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" title="进行中里程碑">
            <Statistic value={inProgressCount} valueStyle={{ color: '#1677ff', fontSize: 36 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" title="已完成里程碑">
            <Statistic value={doneCount} valueStyle={{ color: '#52c41a', fontSize: 36 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" title="旅程地图">
            <Statistic value={journeys.length} valueStyle={{ color: '#722ed1', fontSize: 36 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" title="PRD文档">
            <Statistic value={prdDocuments.length} prefix={<FileTextOutlined />} valueStyle={{ color: '#13c2c2', fontSize: 36 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近需求" extra={<Tag color="blue">{recentRequirements.length}条</Tag>}>
            <List
              dataSource={recentRequirements}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<BulbOutlined />} style={{ backgroundColor: '#1677ff' }} />}
                    title={item.title}
                    description={
                      <span>
                        <Tag color={item.channel === 'interview' ? 'green' : item.channel === 'survey' ? 'blue' : item.channel === 'ticket' ? 'orange' : 'purple'}>
                          {item.channel === 'interview' ? '访谈' : item.channel === 'survey' ? '问卷' : item.channel === 'ticket' ? '工单' : '竞品'}
                        </Tag>
                        <Tag color={item.kanoType === 'must' ? 'red' : item.kanoType === 'expected' ? 'orange' : item.kanoType === 'excited' ? 'green' : 'default'}>
                          {item.kanoType === 'must' ? '必备' : item.kanoType === 'expected' ? '期望' : item.kanoType === 'excited' ? '兴奋' : '未分类'}
                        </Tag>
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="需求来源分布">
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="用户访谈" value={channelStats.interview} valueStyle={{ color: '#52c41a' }} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="用户问卷" value={channelStats.survey} valueStyle={{ color: '#1677ff' }} />
                </Card>
              </Col>
              <Col span={12} style={{ marginTop: 16 }}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="客服工单" value={channelStats.ticket} valueStyle={{ color: '#faad14' }} />
                </Card>
              </Col>
              <Col span={12} style={{ marginTop: 16 }}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="竞品对标" value={channelStats.competitor} valueStyle={{ color: '#722ed1' }} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
