import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, DatePicker, message, Popconfirm, Tag, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import filter from 'lodash-es/filter';

const { Option } = Select;
const { Search } = Input;

const initialUsers = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', status: 'active', department: '技术部', createTime: '2023-01-15', avatar: '#1890ff' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: '编辑', status: 'active', department: '市场部', createTime: '2023-02-20', avatar: '#52c41a' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: '普通用户', status: 'inactive', department: '销售部', createTime: '2023-03-10', avatar: '#faad14' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '编辑', status: 'active', department: '技术部', createTime: '2023-04-05', avatar: '#722ed1' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', role: '普通用户', status: 'active', department: '客服部', createTime: '2023-05-12', avatar: '#eb2f96' },
  { id: 6, name: '孙八', email: 'sunba@example.com', role: '管理员', status: 'active', department: '人力资源部', createTime: '2023-06-18', avatar: '#13c2c2' },
  { id: 7, name: '周九', email: 'zhoujiu@example.com', role: '普通用户', status: 'inactive', department: '技术部', createTime: '2023-07-22', avatar: '#1890ff' },
  { id: 8, name: '吴十', email: 'wushi@example.com', role: '编辑', status: 'active', department: '市场部', createTime: '2023-08-30', avatar: '#52c41a' },
];

function UserManagementPage() {
  const [users, setUsers] = useState(initialUsers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      createTime: dayjs(record.createTime)
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setUsers(users.filter(user => user.id !== id));
    message.success('用户删除成功');
  };

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        if (editingUser) {
          setUsers(users.map(user => 
            user.id === editingUser.id ? { ...user, ...values } : user
          ));
          message.success('用户信息更新成功');
        } else {
          const newUser = {
            ...values,
            id: Math.max(...users.map(u => u.id)) + 1,
            avatar: `hsl(${Math.random() * 360}, 70%, 50%)`
          };
          setUsers([newUser, ...users]);
          message.success('用户添加成功');
        }
        setIsModalVisible(false);
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  const handleReset = () => {
    setSearchText('');
    setFilterRole('');
    setFilterStatus('');
  };

  const filteredUsers = filter(users, user => {
    const matchesSearch = !searchText || 
      user.name.includes(searchText) || 
      user.email.includes(searchText);
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    {
      title: '用户信息',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: record.avatar }}>{text[0]}</Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      )
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: '管理员', value: '管理员' },
        { text: '编辑', value: '编辑' },
        { text: '普通用户', value: '普通用户' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => {
        let color = 'default';
        if (role === '管理员') color = 'red';
        else if (role === '编辑') color = 'blue';
        return <Tag color={color}>{role}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? '活跃' : '禁用'}
        </Tag>
      )
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) => dayjs(a.createTime).unix() - dayjs(b.createTime).unix()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">用户管理</h1>
      
      <div className="info-section">
        <h3>搜索筛选</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
          <Search
            placeholder="搜索用户名或邮箱"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="选择角色"
            allowClear
            style={{ width: 150 }}
            value={filterRole || undefined}
            onChange={setFilterRole}
          >
            <Option value="管理员">管理员</Option>
            <Option value="编辑">编辑</Option>
            <Option value="普通用户">普通用户</Option>
          </Select>
          <Select
            placeholder="选择状态"
            allowClear
            style={{ width: 150 }}
            value={filterStatus || undefined}
            onChange={setFilterStatus}
          >
            <Option value="active">活跃</Option>
            <Option value="inactive">禁用</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加用户
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{
            total: filteredUsers.length,
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </div>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            role: '普通用户',
            status: 'active',
            createTime: dayjs()
          }}
        >
          <Form.Item
            name="name"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Option value="管理员">管理员</Option>
              <Option value="编辑">编辑</Option>
              <Option value="普通用户">普通用户</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="active">活跃</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="部门"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select>
              <Option value="技术部">技术部</Option>
              <Option value="市场部">市场部</Option>
              <Option value="销售部">销售部</Option>
              <Option value="客服部">客服部</Option>
              <Option value="人力资源部">人力资源部</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="createTime"
            label="创建时间"
            rules={[{ required: true, message: '请选择创建时间' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagementPage;
