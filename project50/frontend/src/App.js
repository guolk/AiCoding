import React, { useState, useCallback } from 'react';
import { Layout, Menu, Button, Space, Modal, message, Typography } from 'antd';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  UploadOutlined, 
  DatabaseOutlined, 
  BookOutlined, 
  DashboardOutlined,
  ExperimentOutlined,
  SettingOutlined
} from '@ant-design/icons';
import CrystalViewer from './components/CrystalViewer';
import AnalysisPanel from './components/AnalysisPanel';
import XRDViewer from './components/XRDViewer';
import ExampleGallery from './components/ExampleGallery';
import CODSearch from './components/CODSearch';
import ToolPanel from './components/ToolPanel';
import BrillouinZone from './components/BrillouinZone';
import { uploadCIF, parseCIFContent, analyzeStructure, simulateXRD, generateReport } from './utils/api';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [crystalData, setCrystalData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [xrdData, setXrdData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file) => {
    setLoading(true);
    try {
      const response = await uploadCIF(file);
      if (response.data.success) {
        setCrystalData(response.data.data);
        setAnalysisResults(null);
        setXrdData(null);
        message.success('CIF文件解析成功！');
        navigate('/viewer');
      }
    } catch (error) {
      message.error('CIF文件解析失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleLoadStructure = useCallback(async (data) => {
    setCrystalData(data.structure);
    setAnalysisResults(null);
    setXrdData(null);
    navigate('/viewer');
    message.success('晶体结构加载成功！');
  }, [navigate]);

  const handleAnalyze = async () => {
    if (!crystalData?.lattice || !crystalData?.atoms) {
      message.warning('请先加载晶体结构');
      return;
    }
    setLoading(true);
    try {
      const response = await analyzeStructure(crystalData.lattice, crystalData.atoms);
      if (response.data.success) {
        setAnalysisResults(response.data.data);
        message.success('对称性分析完成！');
      }
    } catch (error) {
      message.error('分析失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateXRD = async () => {
    if (!crystalData?.lattice || !crystalData?.atoms) {
      message.warning('请先加载晶体结构');
      return;
    }
    setLoading(true);
    try {
      const response = await simulateXRD(crystalData.lattice, crystalData.atoms, {
        wavelength: 1.5406,
        min_angle: 0,
        max_angle: 90,
        step: 0.1
      });
      if (response.data.success) {
        setXrdData(response.data.data);
        message.success('XRD模拟完成！');
        navigate('/xrd');
      }
    } catch (error) {
      message.error('XRD模拟失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!crystalData) {
      message.warning('请先加载晶体结构');
      return;
    }
    setLoading(true);
    try {
      const response = await generateReport(crystalData, analysisResults || {}, xrdData);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'crystal_analysis_report.pdf';
      link.click();
      message.success('报告生成成功！');
    } catch (error) {
      message.error('报告生成失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { key: '/viewer', icon: <DashboardOutlined />, label: '3D晶体查看器' },
    { key: '/examples', icon: <BookOutlined />, label: '经典晶体示例' },
    { key: '/cod', icon: <DatabaseOutlined />, label: 'COD数据库检索' },
    { key: '/brillouin', icon: <ExperimentOutlined />, label: '布里渊区' },
    { key: '/settings', icon: <SettingOutlined />, label: '设置' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: 'linear-gradient(90deg, #1a365d 0%, #2c5282 100%)',
        padding: '0 24px'
      }}>
        <Title level={4} style={{ color: 'white', margin: 0, flex: 1 }}>
          💎 晶体结构分析平台
        </Title>
        <Space>
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            loading={loading}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.cif,.CIF';
              input.onchange = (e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              };
              input.click();
            }}
          >
            上传CIF文件
          </Button>
          <Button 
            onClick={handleAnalyze}
            disabled={!crystalData || loading}
            loading={loading}
          >
            分析结构
          </Button>
          <Button 
            onClick={handleSimulateXRD}
            disabled={!crystalData || loading}
            loading={loading}
          >
            XRD模拟
          </Button>
          <Button 
            type="dashed"
            onClick={handleGenerateReport}
            disabled={!crystalData || loading}
          >
            导出报告
          </Button>
        </Space>
      </Header>
      <Layout>
        <Sider width={220} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Content style={{ margin: '16px', overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={
              <div style={{ padding: 24, textAlign: 'center' }}>
                <Title level={2}>欢迎使用晶体结构分析平台</Title>
                <p>上传CIF文件或从经典示例/COD数据库开始</p>
                <Space direction="vertical" size="large" style={{ marginTop: 40 }}>
                  <Space>
                    <Button 
                      size="large" 
                      type="primary"
                      icon={<UploadOutlined />}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.cif,.CIF';
                        input.onchange = (e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        };
                        input.click();
                      }}
                    >
                      上传CIF文件
                    </Button>
                    <Button 
                      size="large"
                      icon={<BookOutlined />}
                      onClick={() => navigate('/examples')}
                    >
                      查看经典示例
                    </Button>
                    <Button 
                      size="large"
                      icon={<DatabaseOutlined />}
                      onClick={() => navigate('/cod')}
                    >
                      搜索COD数据库
                    </Button>
                  </Space>
                </Space>
              </div>
            } />
            <Route path="/viewer" element={
              <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
                <div style={{ flex: 1 }}>
                  <CrystalViewer 
                    crystalData={crystalData} 
                    analysisResults={analysisResults}
                  />
                </div>
                <div style={{ width: 320, background: '#fff', marginLeft: 16, padding: 16, overflow: 'auto' }}>
                  <ToolPanel 
                    crystalData={crystalData}
                    analysisResults={analysisResults}
                    onLoadStructure={handleLoadStructure}
                  />
                </div>
              </div>
            } />
            <Route path="/examples" element={
              <ExampleGallery onLoadStructure={handleLoadStructure} />
            } />
            <Route path="/cod" element={
              <CODSearch onLoadStructure={handleLoadStructure} />
            } />
            <Route path="/xrd" element={
              <XRDViewer xrdData={xrdData} crystalData={crystalData} />
            } />
            <Route path="/brillouin" element={
              <BrillouinZone crystalData={crystalData} />
            } />
            <Route path="/settings" element={
              <div style={{ padding: 24 }}>
                <Title level={3}>设置</Title>
                <AnalysisPanel 
                  crystalData={crystalData}
                  analysisResults={analysisResults}
                />
              </div>
            } />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
