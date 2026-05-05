import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useState } from 'react';
import Input from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'tel', 'number', 'url', 'search', 'date', 'time'],
    },
    as: {
      control: 'select',
      options: ['input', 'textarea'],
    },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    helperText: { control: 'text' },
    isRequired: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { onChange: fn() },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveInput(args: Story['args']) {
  const [value, setValue] = useState('');
  return (
    <Input
      {...args}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export const Default: Story = {
  args: {
    label: '用户名',
    placeholder: '请输入用户名',
  },
  render: InteractiveInput,
};

export const WithLabel: Story = {
  args: {
    label: '邮箱地址',
    type: 'email',
    placeholder: '请输入邮箱地址',
  },
  render: InteractiveInput,
};

export const WithError: Story = {
  args: {
    label: '密码',
    type: 'password',
    placeholder: '请输入密码',
    error: '密码长度至少需要6个字符',
  },
  render: InteractiveInput,
};

export const WithHelperText: Story = {
  args: {
    label: '手机号',
    type: 'tel',
    placeholder: '请输入手机号',
    helperText: '用于接收验证码',
  },
  render: InteractiveInput,
};

export const Required: Story = {
  args: {
    label: '必填字段',
    placeholder: '此字段为必填项',
    isRequired: true,
  },
  render: InteractiveInput,
};

export const Disabled: Story = {
  args: {
    label: '禁用状态',
    placeholder: '此字段已禁用',
    disabled: true,
  },
  render: InteractiveInput,
};

export const Textarea: Story = {
  args: {
    label: '详细描述',
    as: 'textarea',
    placeholder: '请输入详细描述...',
    rows: 4,
  },
  render: InteractiveInput,
};

export const Password: Story = {
  args: {
    label: '密码',
    type: 'password',
    placeholder: '请输入密码',
    isRequired: true,
  },
  render: InteractiveInput,
};

export const Search: Story = {
  args: {
    label: '搜索',
    type: 'search',
    placeholder: '搜索...',
  },
  render: InteractiveInput,
};

export const WithIcons: Story = {
  args: {
    label: '搜索用户',
    type: 'search',
    placeholder: '输入用户名或邮箱搜索...',
    leftIcon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  render: InteractiveInput,
};
