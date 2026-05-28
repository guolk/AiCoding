import React from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Badge } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  TrophyOutlined,
  FileTextOutlined,
  BarChartOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, notifications } = useAppContext();

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '仪表盘' },
    { key: '/question-bank', icon: <BookOutlined />, label: '题库管理' },
    { key: '/competitions', icon: <TrophyOutlined />, label: '竞赛活动' },
    { key: '/assessments', icon: <FileTextOutlined />, label: '评估测试' },
    { key: '/analytics', icon: <BarChartOutlined />, label: '数据分析' },
    { key: '/operations', icon: <BellOutlined />, label: '活动运营' }
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const userMenuItems = [
    { key: 'profile', label: '个人中心' },
    { key: 'settings', label: '设置' }
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={200}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          知识竞赛系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Badge count={unreadCount} size="small">
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <Avatar src={user.avatar} icon={<UserOutlined />} />
                <span>{user.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px', background: '#f0f2f5', minHeight: 280 }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
