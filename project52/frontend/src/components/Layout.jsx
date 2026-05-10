import React, { useState } from 'react'
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd'
import {
  DashboardOutlined,
  CalendarOutlined,
  BulbOutlined,
  TeamOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SearchOutlined,
  PictureOutlined,
  MoneyCollectOutlined,
  LineChartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '数据看板'
  },
  {
    key: 'content-planning',
    icon: <CalendarOutlined />,
    label: '内容规划',
    children: [
      { key: '/content-calendar', icon: <CalendarOutlined />, label: '内容日历' },
      { key: '/topic-ideas', icon: <BulbOutlined />, label: '选题库' },
      { key: '/competitors', icon: <TeamOutlined />, label: '竞品监控' }
    ]
  },
  {
    key: '/data-aggregation',
    icon: <BarChartOutlined />,
    label: '数据聚合'
  },
  {
    key: 'content-production',
    icon: <FileTextOutlined />,
    label: '内容生产',
    children: [
      { key: '/script-templates', icon: <FileTextOutlined />, label: '脚本模板' },
      { key: '/keyword-research', icon: <SearchOutlined />, label: '关键词研究' },
      { key: '/cover-design', icon: <PictureOutlined />, label: '封面设计' }
    ]
  },
  {
    key: 'monetization',
    icon: <MoneyCollectOutlined />,
    label: '变现管理',
    children: [
      { key: '/revenue', icon: <MoneyCollectOutlined />, label: '收益记录' },
      { key: '/cooperations', icon: <TeamOutlined />, label: '商业合作' }
    ]
  },
  {
    key: 'analytics',
    icon: <LineChartOutlined />,
    label: '成长分析',
    children: [
      { key: '/content-attribution', icon: <BarChartOutlined />, label: '内容归因' },
      { key: '/follower-insights', icon: <UserOutlined />, label: '粉丝画像' }
    ]
  }
]

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const userMenu = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      }
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div className="logo">
          {collapsed ? '工具箱' : '创作者工具箱'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.full_name || user?.username || '用户'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
