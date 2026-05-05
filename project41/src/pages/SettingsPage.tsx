import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import { useToast } from '@/context/ToastContext';
import {
  generalSettingsSchema,
  securitySettingsSchema,
  emailSettingsSchema,
  notificationSettingsSchema,
  GeneralSettingsFormData,
  SecuritySettingsFormData,
  EmailSettingsFormData,
  NotificationSettingsFormData,
} from '@/schemas';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import type { SystemSettings, SettingsTab } from '@/types';

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: '通用设置' },
  { id: 'security', label: '安全设置' },
  { id: 'email', label: '邮件设置' },
  { id: 'notification', label: '通知设置' },
];

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'text-blue-600 border-blue-600'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: api.getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      showSuccess('设置保存成功');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  if (isLoading || !settings) {
    return (
      <Layout>
        <Loading text="加载中..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-500 mt-1">配置系统的各项参数</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-0">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </TabButton>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <GeneralSettingsTab
                settings={settings}
                onSave={(data) => updateMutation.mutate(data)}
                isSaving={updateMutation.isPending}
              />
            )}
            {activeTab === 'security' && (
              <SecuritySettingsTab
                settings={settings}
                onSave={(data) => updateMutation.mutate(data)}
                isSaving={updateMutation.isPending}
              />
            )}
            {activeTab === 'email' && (
              <EmailSettingsTab
                settings={settings}
                onSave={(data) => updateMutation.mutate(data)}
                isSaving={updateMutation.isPending}
              />
            )}
            {activeTab === 'notification' && (
              <NotificationSettingsTab
                settings={settings}
                onSave={(data) => updateMutation.mutate(data)}
                isSaving={updateMutation.isPending}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function GeneralSettingsTab({
  settings,
  onSave,
  isSaving,
}: {
  settings: SystemSettings;
  onSave: (data: Partial<SystemSettings>) => void;
  isSaving: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      defaultLanguage: settings.defaultLanguage,
      defaultTheme: settings.defaultTheme,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="max-w-2xl space-y-6">
      <Input
        label="网站名称"
        type="text"
        placeholder="请输入网站名称"
        isRequired
        error={errors.siteName?.message}
        register={register('siteName')}
      />
      <Input
        label="网站描述"
        as="textarea"
        placeholder="请输入网站描述"
        error={errors.siteDescription?.message}
        register={register('siteDescription')}
      />
      <Select
        label="默认语言"
        options={[
          { value: 'zh-CN', label: '简体中文' },
          { value: 'en-US', label: 'English' },
        ]}
        register={register('defaultLanguage')}
      />
      <Select
        label="默认主题"
        options={[
          { value: 'light', label: '浅色' },
          { value: 'dark', label: '深色' },
        ]}
        register={register('defaultTheme')}
      />
      <Button type="submit" isLoading={isSaving}>
        保存设置
      </Button>
    </form>
  );
}

function SecuritySettingsTab({
  settings,
  onSave,
  isSaving,
}: {
  settings: SystemSettings;
  onSave: (data: Partial<SystemSettings>) => void;
  isSaving: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      sessionTimeout: settings.sessionTimeout,
      maxLoginAttempts: settings.maxLoginAttempts,
      passwordMinLength: settings.passwordMinLength,
      requireMFA: settings.requireMFA,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="max-w-2xl space-y-6">
      <Input
        label="会话超时（分钟）"
        type="number"
        placeholder="请输入会话超时时间"
        isRequired
        error={errors.sessionTimeout?.message}
        register={register('sessionTimeout', { valueAsNumber: true })}
        helperText="范围：5-120分钟"
      />
      <Input
        label="最大登录尝试次数"
        type="number"
        placeholder="请输入最大登录尝试次数"
        isRequired
        error={errors.maxLoginAttempts?.message}
        register={register('maxLoginAttempts', { valueAsNumber: true })}
        helperText="范围：1-10次"
      />
      <Input
        label="密码最小长度"
        type="number"
        placeholder="请输入密码最小长度"
        isRequired
        error={errors.passwordMinLength?.message}
        register={register('passwordMinLength', { valueAsNumber: true })}
        helperText="范围：6-20个字符"
      />
      <div className="flex items-center">
        <input
          type="checkbox"
          id="requireMFA"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={watch('requireMFA')}
          onChange={(e) => setValue('requireMFA', e.target.checked)}
        />
        <label htmlFor="requireMFA" className="ml-2 block text-sm text-gray-700">
          要求双因素认证
        </label>
      </div>
      <Button type="submit" isLoading={isSaving}>
        保存设置
      </Button>
    </form>
  );
}

function EmailSettingsTab({
  settings,
  onSave,
  isSaving,
}: {
  settings: SystemSettings;
  onSave: (data: Partial<SystemSettings>) => void;
  isSaving: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailSettingsFormData>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtpHost: settings.smtpHost,
      smtpPort: settings.smtpPort,
      smtpUsername: settings.smtpUsername,
      smtpPassword: settings.smtpPassword,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="max-w-2xl space-y-6">
      <Input
        label="SMTP服务器"
        type="text"
        placeholder="请输入SMTP服务器地址"
        isRequired
        error={errors.smtpHost?.message}
        register={register('smtpHost')}
      />
      <Input
        label="SMTP端口"
        type="number"
        placeholder="请输入SMTP端口"
        isRequired
        error={errors.smtpPort?.message}
        register={register('smtpPort', { valueAsNumber: true })}
        helperText="常见端口：25, 465, 587"
      />
      <Input
        label="SMTP用户名"
        type="email"
        placeholder="请输入SMTP用户名"
        isRequired
        error={errors.smtpUsername?.message}
        register={register('smtpUsername')}
      />
      <Input
        label="SMTP密码"
        type="password"
        placeholder="请输入SMTP密码"
        isRequired
        error={errors.smtpPassword?.message}
        register={register('smtpPassword')}
      />
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSaving}>
          保存设置
        </Button>
        <Button type="button" variant="secondary">
          测试邮件
        </Button>
      </div>
    </form>
  );
}

function NotificationSettingsTab({
  settings,
  onSave,
  isSaving,
}: {
  settings: SystemSettings;
  onSave: (data: Partial<SystemSettings>) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<NotificationSettingsFormData>({
    notifyUserCreated: settings.notifyUserCreated,
    notifyUserUpdated: settings.notifyUserUpdated,
    notifyUserDeleted: settings.notifyUserDeleted,
    notifySystemError: settings.notifySystemError,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleOption = (key: keyof NotificationSettingsFormData) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const options = [
    { key: 'notifyUserCreated' as const, label: '新用户创建时发送通知', defaultChecked: settings.notifyUserCreated },
    { key: 'notifyUserUpdated' as const, label: '用户信息更新时发送通知', defaultChecked: settings.notifyUserUpdated },
    { key: 'notifyUserDeleted' as const, label: '用户删除时发送通知', defaultChecked: settings.notifyUserDeleted },
    { key: 'notifySystemError' as const, label: '系统错误时发送通知', defaultChecked: settings.notifySystemError },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {options.map((option) => (
        <div key={option.key} className="flex items-center">
          <input
            type="checkbox"
            id={option.key}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={formData[option.key]}
            onChange={() => toggleOption(option.key)}
          />
          <label htmlFor={option.key} className="ml-2 block text-sm text-gray-700">
            {option.label}
          </label>
        </div>
      ))}
      <div className="pt-4">
        <Button type="submit" isLoading={isSaving}>
          保存设置
        </Button>
      </div>
    </form>
  );
}

export default SettingsPage;
