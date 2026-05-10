import React, { useState } from 'react'
import { Card, Form, Input, Button, Tabs, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

const Login = () => {
  const [activeTab, setActiveTab] = useState('login')
  const navigate = useNavigate()
  const { login, register } = useAuthStore()

  const handleLogin = async (values) => {
    const success = await login(values.username, values.password)
    if (success) {
      message.success('登录成功')
      navigate('/dashboard')
    } else {
      message.error('登录失败，请检查用户名和密码')
    }
  }

  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    const success = await register({
      username: values.username,
      email: values.email,
      password: values.password,
      full_name: values.fullName
    })
    if (success) {
      message.success('注册成功，请登录')
      setActiveTab('login')
    } else {
      message.error('注册失败，用户名或邮箱可能已存在')
    }
  }

  const loginItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form
          layout="vertical"
          onFinish={handleLogin}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form
          layout="vertical"
          onFinish={handleRegister}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" size="large" />
          </Form.Item>
          <Form.Item
            name="fullName"
            label="姓名"
          >
            <Input placeholder="请输入姓名（可选）" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码', min: 6 }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            rules={[{ required: true, message: '请确认密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              注册
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ]

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-title">
          <h1 style={{ marginBottom: 8, color: '#1890ff' }}>自媒体创作者运营工具箱</h1>
          <p style={{ color: '#666' }}>一站式内容运营管理平台</p>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={loginItems}
          size="large"
        />
      </Card>
    </div>
  )
}

export default Login
