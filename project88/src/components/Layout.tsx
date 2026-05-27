import { useState } from 'react'
import { Layout as AntLayout, Menu, theme } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  FundOutlined,
  BulbOutlined,
  LineChartOutlined,
  CalendarOutlined,
  FlagOutlined,
  BarChartOutlined,
  FolderOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = AntLayout

interface Props {
  children: React.ReactNode
}

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台概览' },
  {
    key: 'req-group',
    icon: <FileTextOutlined />,
    label: '需求管理',
    children: [
      { key: '/requirements', icon: <BulbOutlined />, label: '需求池' }
    ]
  },
  {
    key: 'research-group',
    icon: <UserOutlined />,
    label: '用户研究',
    children: [
      { key: '/research/interviews', icon: <TeamOutlined />, label: '访谈记录' },
      { key: '/research/personas', icon: <UserOutlined />, label: '用户画像' },
      { key: '/research/journeys', icon: <LineChartOutlined />, label: '旅程地图' }
    ]
  },
  {
    key: 'comp-group',
    icon: <FundOutlined />,
    label: '竞品分析',
    children: [
      { key: '/competitive/features', icon: <BarChartOutlined />, label: '功能对比' },
      { key: '/competitive/iterations', icon: <CalendarOutlined />, label: '迭代追踪' },
      { key: '/competitive/positioning', icon: <LineChartOutlined />, label: '市场定位' }
    ]
  },
  {
    key: 'ver-group',
    icon: <CalendarOutlined />,
    label: '版本规划',
    children: [
      { key: '/version/roadmap', icon: <LineChartOutlined />, label: '产品路线图' },
      { key: '/version/milestones', icon: <FlagOutlined />, label: '里程碑追踪' },
      { key: '/version/effects', icon: <BarChartOutlined />, label: '效果追踪' }
    ]
  },
  {
    key: 'doc-group',
    icon: <FolderOutlined />,
    label: '文档管理',
    children: [
      { key: '/documents/prd', icon: <FileTextOutlined />, label: 'PRD文档' }
    ]
  }
]

export default function Layout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { token: { colorBgContainer } } = theme.useToken()

  const selectedKeys = [location.pathname]
  const openKeys = ['req-group', 'research-group', 'comp-group', 'ver-group', 'doc-group']

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
      >
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 600,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {collapsed ? 'PM' : '产品经理工作台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>产品经理工作台</span>
        </Header>
        <Content style={{ margin: 16, padding: 24, background: colorBgContainer, borderRadius: 8, minHeight: 280 }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
