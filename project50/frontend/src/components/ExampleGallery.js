import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Typography, Space, Tag, Spin, message } from 'antd';
import { EyeOutlined, DatabaseOutlined } from '@ant-design/icons';
import { getExamples, getExample } from '../utils/api';

const { Title, Text, Paragraph } = Typography;

const ExampleGallery = ({ onLoadStructure }) => {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(null);

  useEffect(() => {
    loadExamples();
  }, []);

  const loadExamples = async () => {
    try {
      const response = await getExamples();
      if (response.data.success) {
        setExamples(response.data.data);
      }
    } catch (error) {
      message.error('加载示例失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadExample = async (name) => {
    setLoadingDetail(name);
    try {
      const response = await getExample(name);
      if (response.data.success && onLoadStructure) {
        onLoadStructure({
          structure: response.data.data.structure,
          info: response.data.data.info
        });
      }
    } catch (error) {
      message.error('加载晶体结构失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoadingDetail(null);
    }
  };

  const crystalColors = {
    nacl: '#1890ff',
    diamond: '#52c41a',
    perovskite: '#faad14',
    quartz: '#722ed1',
    ice: '#13c2c2'
  };

  const crystalIcons = {
    nacl: '🧂',
    diamond: '💎',
    perovskite: '🔶',
    quartz: '🌀',
    ice: '❄️'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: 16 }}>加载经典晶体示例...</Paragraph>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <Title level={3}>经典晶体结构示例</Title>
        <Paragraph type="secondary">
          选择以下经典晶体结构进行学习和分析。每种结构都代表了不同的晶体学特征。
        </Paragraph>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {examples.map((example) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={example.key}>
            <Card
              hoverable
              style={{ height: '100%' }}
              bodyStyle={{ padding: 24 }}
              cover={
                <div 
                  style={{ 
                    height: 160, 
                    background: `linear-gradient(135deg, ${crystalColors[example.key]}15, ${crystalColors[example.key]}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 72
                  }}
                >
                  {crystalIcons[example.key] || '💎'}
                </div>
              }
            >
              <Card.Meta
                title={
                  <Space>
                    <Text strong>{example.name}</Text>
                    <Tag color="blue">{example.structure_type}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small" style={{ marginTop: 12 }}>
                    <Tag color="purple">{example.crystal_system}</Tag>
                    <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
                      {example.description}
                    </Paragraph>
                    <Button 
                      type="primary" 
                      icon={<EyeOutlined />}
                      onClick={() => handleLoadExample(example.key)}
                      loading={loadingDetail === example.key}
                      block
                    >
                      加载结构
                    </Button>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>关于这些示例</Title>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Paragraph>
              <Text strong>NaCl (岩盐结构):</Text> 面心立方结构，氯离子和钠离子交替排列，
              配位数为6。这是离子晶体的典型代表。
            </Paragraph>
            <Paragraph>
              <Text strong>金刚石结构:</Text> 每个碳原子与4个相邻碳原子形成四面体配位，
              属于面心立方晶格。这是共价晶体的典型代表。
            </Paragraph>
            <Paragraph>
              <Text strong>钙钛矿结构:</Text> ABO₃型结构，A位离子在立方体顶点，
              B位离子在体心，氧离子在面心。广泛存在于功能性材料中。
            </Paragraph>
          </Col>
          <Col span={12}>
            <Paragraph>
              <Text strong>石英:</Text> 二氧化硅的一种形式，属于六方晶系。
              结构由SiO₄四面体通过共享顶点氧原子形成三维骨架。
            </Paragraph>
            <Paragraph>
              <Text strong>冰Ih:</Text> 常见的冰结构，属于六方晶系。
              水分子通过氢键形成具有开放孔洞的结构，因此冰比水轻。
            </Paragraph>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ExampleGallery;
