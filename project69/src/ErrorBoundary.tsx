import React, { Component, ReactNode } from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import { initMockData } from './utils/mockData';

const { Title, Paragraph } = Typography;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      initMockData();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          padding: 20,
          background: '#f0f2f5'
        }}>
          <Card style={{ maxWidth: 500, textAlign: 'center' }}>
            <WarningOutlined style={{ fontSize: 64, color: '#fa8c16', marginBottom: 16 }} />
            <Title level={3}>页面发生错误</Title>
            <Paragraph type="secondary">
              {this.state.error?.message || '抱歉，页面出现了意外错误。'}
            </Paragraph>
            <Space>
              <Button type="primary" icon={<ReloadOutlined />} onClick={this.handleReload}>
                刷新页面
              </Button>
              <Button danger onClick={this.handleReset}>
                重置所有数据
              </Button>
            </Space>
            <Paragraph type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
              如果刷新后仍然报错，请点击「重置所有数据」按钮恢复初始状态
            </Paragraph>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
