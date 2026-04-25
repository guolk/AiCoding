import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Switch, Button, Card, Row, Col, Divider, Upload, message, Radio, Slider, Rate, Space, Tag, Modal } from 'antd';
import { UploadOutlined, SaveOutlined, ReloadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Group: RadioGroup } = Radio;

const STORAGE_KEY = 'app-settings';

const defaultSettings = {
  theme: 'light',
  language: 'zh-CN',
  notifications: true,
  emailNotifications: true,
  smsNotifications: false,
  autoSave: true,
  autoSaveInterval: 5,
  dataRetention: 90,
  logLevel: 'info',
  performanceMode: 'balanced',
  compressImages: true,
  quality: 80,
  rate: 4,
  enableCache: true,
  cacheDuration: 3600,
  enableCompression: true,
  minifyCode: true,
  enableAnalytics: true,
  anonymizeData: false,
  enableBetaFeatures: false,
  darkMode: false,
  compactMode: false,
  showTutorial: true,
  autoUpdate: true,
  backupFrequency: 'daily',
  enableTwoFactor: false,
  sessionTimeout: 30
};

function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        form.setFieldsValue(parsedSettings);
        console.log('从localStorage加载设置:', parsedSettings);
      } catch (error) {
        console.error('解析保存的设置失败:', error);
        form.setFieldsValue(defaultSettings);
      }
    } else {
      form.setFieldsValue(defaultSettings);
    }
  }, [form]);

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        setLoading(true);
        setTimeout(() => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
          console.log('保存的设置到localStorage:', values);
          message.success('设置保存成功！');
          setLoading(false);
        }, 1000);
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
        message.error('请检查表单填写是否正确');
      });
  };

  const handleReset = () => {
    setConfirmModalVisible(true);
  };

  const confirmReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    form.setFieldsValue(defaultSettings);
    message.info('设置已重置为默认值');
    setConfirmModalVisible(false);
    console.log('设置已重置，localStorage已清除');
  };

  const uploadProps = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  return (
    <div className="page-container">
      <h1 className="page-title">系统设置</h1>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultSettings}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="基本设置" className="form-container">
              <Form.Item name="companyName" label="公司名称" rules={[{ required: true, message: '请输入公司名称' }]}>
                <Input placeholder="请输入公司名称" />
              </Form.Item>

              <Form.Item name="contactEmail" label="联系邮箱" rules={[{ required: true, message: '请输入联系邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}>
                <Input placeholder="请输入联系邮箱" />
              </Form.Item>

              <Form.Item name="contactPhone" label="联系电话">
                <Input placeholder="请输入联系电话" />
              </Form.Item>

              <Form.Item name="address" label="公司地址">
                <TextArea rows={3} placeholder="请输入公司地址" />
              </Form.Item>

              <Form.Item name="logo" label="公司Logo">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>上传Logo</Button>
                </Upload>
              </Form.Item>
            </Card>

            <Card title="外观设置" style={{ marginTop: 24 }}>
              <Form.Item name="theme" label="主题">
                <RadioGroup>
                  <Radio value="light">浅色</Radio>
                  <Radio value="dark">深色</Radio>
                  <Radio value="auto">跟随系统</Radio>
                </RadioGroup>
              </Form.Item>

              <Form.Item name="language" label="语言">
                <Select>
                  <Option value="zh-CN">简体中文</Option>
                  <Option value="zh-TW">繁体中文</Option>
                  <Option value="en-US">English</Option>
                  <Option value="ja-JP">日本語</Option>
                </Select>
              </Form.Item>

              <Form.Item name="darkMode" label="深色模式" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="compactMode" label="紧凑模式" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="通知设置">
              <Form.Item name="notifications" label="启用通知" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="emailNotifications" label="邮件通知" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="smsNotifications" label="短信通知" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Divider />

              <Form.Item name="notificationTypes" label="通知类型">
                <Select mode="multiple" placeholder="选择接收的通知类型">
                  <Option value="system">系统通知</Option>
                  <Option value="security">安全通知</Option>
                  <Option value="marketing">营销通知</Option>
                  <Option value="updates">更新通知</Option>
                </Select>
              </Form.Item>
            </Card>

            <Card title="性能设置" style={{ marginTop: 24 }}>
              <Form.Item name="performanceMode" label="性能模式">
                <Select>
                  <Option value="performance">性能优先</Option>
                  <Option value="balanced">平衡</Option>
                  <Option value="quality">质量优先</Option>
                </Select>
              </Form.Item>

              <Form.Item name="autoSave" label="自动保存" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="autoSaveInterval" label="自动保存间隔 (分钟)">
                <Slider min={1} max={30} marks={{ 1: '1', 5: '5', 10: '10', 20: '20', 30: '30' }} />
              </Form.Item>

              <Form.Item name="enableCache" label="启用缓存" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="cacheDuration" label="缓存时长 (秒)">
                <Input type="number" min={60} max={86400} />
              </Form.Item>
            </Card>

            <Card 
              title="高级设置" 
              style={{ marginTop: 24 }}
              extra={
                <Switch 
                  checked={advancedSettings} 
                  onChange={setAdvancedSettings} 
                  checkedChildren="显示" 
                  unCheckedChildren="隐藏"
                />
              }
            >
              {advancedSettings && (
                <>
                  <Form.Item name="dataRetention" label="数据保留天数">
                    <Select>
                      <Option value={30}>30 天</Option>
                      <Option value={90}>90 天</Option>
                      <Option value={180}>180 天</Option>
                      <Option value={365}>1 年</Option>
                      <Option value={0}>永久保留</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="logLevel" label="日志级别">
                    <Select>
                      <Option value="debug">Debug</Option>
                      <Option value="info">Info</Option>
                      <Option value="warn">Warning</Option>
                      <Option value="error">Error</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="enableCompression" label="启用压缩" valuePropName="checked">
                    <Switch />
                  </Form.Item>

                  <Form.Item name="minifyCode" label="代码压缩" valuePropName="checked">
                    <Switch />
                  </Form.Item>

                  <Form.Item name="enableBetaFeatures" label="启用Beta功能" valuePropName="checked">
                    <Switch />
                  </Form.Item>

                  <Form.Item name="sessionTimeout" label="会话超时 (分钟)">
                    <Input type="number" min={5} max={480} />
                  </Form.Item>
                </>
              )}
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row justify="end" gutter={16}>
          <Col>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleReset}
              danger
            >
              重置设置
            </Button>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSubmit}
              loading={loading}
              size="large"
            >
              保存设置
            </Button>
          </Col>
        </Row>
      </Form>

      <Modal
        title="确认重置"
        open={confirmModalVisible}
        onOk={confirmReset}
        onCancel={() => setConfirmModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <p>确定要重置所有设置为默认值吗？</p>
        <p>此操作不可撤销。</p>
      </Modal>
    </div>
  );
}

export default SettingsPage;
