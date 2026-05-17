import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Space, theme } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  AudioOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ShareAltOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import BandManagement from './pages/BandManagement';
import SongLibrary from './pages/SongLibrary';
import RehearsalRecords from './pages/RehearsalRecords';
import PerformanceManagement from './pages/PerformanceManagement';
import ResourceSharing from './pages/ResourceSharing';
import { initMockData } from './utils/mockData';

const { Header, Content, Sider } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">仪表盘</Link> },
  { key: '/band', icon: <TeamOutlined />, label: <Link to="/band">乐队管理</Link> },
  { key: '/songs', icon: <AudioOutlined />, label: <Link to="/songs">作品库</Link> },
  { key: '/records', icon: <FileTextOutlined />, label: <Link to="/records">排练记录</Link> },
  { key: '/performances', icon: <TrophyOutlined />, label: <Link to="/performances">演出管理</Link> },
  { key: '/resources', icon: <ShareAltOutlined />, label: <Link to="/resources">资源共享</Link> },
];

const AppContent: React.FC = () => {
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleResetData = () => {
    initMockData();
    window.location.reload();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        style={{ background: colorBgContainer }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Space>
            <AudioOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>乐队管理平台</span>
          </Space>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>
            {menuItems.find(m => m.key === location.pathname)?.label?.props?.children || '仪表盘'}
          </h2>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleResetData}>
              重置示例数据
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/band" element={<BandManagement />} />
              <Route path="/songs" element={<SongLibrary />} />
              <Route path="/records" element={<RehearsalRecords />} />
              <Route path="/performances" element={<PerformanceManagement />} />
              <Route path="/resources" element={<ResourceSharing />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const validateAndFixData = () => {
    try {
      const keys = ['band_members', 'band_rehearsals', 'band_songs', 'band_rehearsal_records', 'band_performances', 'band_equipment', 'band_borrow_records'];
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            JSON.parse(data);
          } catch (e) {
            console.warn(`Invalid data in ${key}, resetting...`);
            localStorage.removeItem(key);
          }
        }
      });
      return true;
    } catch (e) {
      console.error('Data validation failed:', e);
      return false;
    }
  };

const App: React.FC = () => {
  useEffect(() => {
    try {
      validateAndFixData();
      if (!localStorage.getItem('band_initialized')) {
        initMockData();
      }
    } catch (e) {
      console.error('Init failed, resetting all data...');
      localStorage.clear();
      initMockData();
    }
  }, []);

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
