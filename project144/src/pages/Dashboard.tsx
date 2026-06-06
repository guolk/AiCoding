import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Shield,
  Users,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  Plus,
  Search,
  Bell,
  Calendar,
  Key,
  Database,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Layout, StatCard, Badge, LoadingSpinner, EmptyState } from '@/components';
import { cn } from '@/lib/utils';
import type { Account, SecurityHabit } from '@/types';

interface ReminderItem {
  habit: SecurityHabit;
  account?: Account;
  daysUntil: number;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: typeof Key;
  variant: 'success' | 'warning' | 'info' | 'danger';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    accounts,
    breachRecords,
    habits,
    loading,
    getSecurityScore,
    getUpcomingReminders,
    getTotalAssetValue,
    getAuditResult,
    isAuthenticated,
  } = useAppStore();

  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    accounts: 0,
    twoFA: 0,
    breaches: 0,
    assets: 0,
  });

  const securityScore = useMemo(() => getSecurityScore(), [getSecurityScore]);
  const reminders = useMemo(() => getUpcomingReminders(), [getUpcomingReminders]);
  const totalAssetValue = useMemo(() => getTotalAssetValue(), [getTotalAssetValue]);
  const auditResult = useMemo(() => getAuditResult(), [getAuditResult]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setAnimatedScore(Math.round(securityScore.overall * easeProgress));
      setAnimatedStats({
        accounts: Math.round(accounts.length * easeProgress),
        twoFA: Math.round(
          (accounts.filter((a) => a.has2FA).length / Math.max(accounts.length, 1)) *
            100 *
            easeProgress
        ),
        breaches: Math.round(breachRecords.length * easeProgress),
        assets: Math.round(totalAssetValue * easeProgress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [securityScore.overall, accounts.length, breachRecords.length, totalAssetValue]);

  const scoreColor = useMemo(() => {
    if (securityScore.overall >= 80) return ['#10B981', '#059669'];
    if (securityScore.overall >= 60) return ['#F59E0B', '#D97706'];
    if (securityScore.overall >= 40) return ['#F97316', '#EA580C'];
    return ['#EF4444', '#DC2626'];
  }, [securityScore.overall]);

  const pieData = [
    { name: 'score', value: animatedScore },
    { name: 'remaining', value: 100 - animatedScore },
  ];

  const recentActivities: ActivityItem[] = useMemo(() => {
    const activities: ActivityItem[] = [];

    if (auditResult.expiredPasswords.length > 0) {
      activities.push({
        id: 'expired',
        type: 'password_expired',
        title: '密码即将过期',
        description: `${auditResult.expiredPasswords.length} 个账号密码需要更新`,
        time: '今天',
        icon: Key,
        variant: 'warning',
      });
    }

    if (auditResult.missing2FA.length > 0) {
      activities.push({
        id: '2fa',
        type: 'missing_2fa',
        title: '缺少双因素认证',
        description: `${auditResult.missing2FA.length} 个核心账号未开启2FA`,
        time: '昨天',
        icon: ShieldCheck,
        variant: 'danger',
      });
    }

    if (auditResult.weakPasswords.length > 0) {
      activities.push({
        id: 'weak',
        type: 'weak_password',
        title: '弱密码检测',
        description: `${auditResult.weakPasswords.length} 个账号使用弱密码`,
        time: '2天前',
        icon: AlertTriangle,
        variant: 'warning',
      });
    }

    activities.push({
      id: 'scan',
      type: 'scan',
      title: '安全扫描完成',
      description: '已完成所有账号的安全检查',
      time: '3天前',
      icon: Activity,
      variant: 'success',
    });

    return activities;
  }, [auditResult]);

  const getHabitIcon = (type: string) => {
    switch (type) {
      case 'password_change':
        return Key;
      case '2fa_check':
        return ShieldCheck;
      case 'backup':
        return Database;
      default:
        return Calendar;
    }
  };

  const getHabitTitle = (reminder: ReminderItem) => {
    switch (reminder.habit.type) {
      case 'password_change':
        return reminder.account
          ? `更换 ${reminder.account.platformName} 密码`
          : '更换密码';
      case '2fa_check':
        return reminder.account
          ? `检查 ${reminder.account.platformName} 2FA 状态`
          : '检查双因素认证';
      case 'backup':
        return '备份数据';
      default:
        return '安全提醒';
    }
  };

  const getRiskLevel = () => {
    const risks = [];
    if (auditResult.weakPasswords.length > 0)
      risks.push(`${auditResult.weakPasswords.length} 个弱密码`);
    if (auditResult.missing2FA.length > 0)
      risks.push(`${auditResult.missing2FA.length} 个账号缺少2FA`);
    if (auditResult.expiredPasswords.length > 0)
      risks.push(`${auditResult.expiredPasswords.length} 个密码即将过期`);
    if (auditResult.duplicatePasswords.length > 0)
      risks.push(`${auditResult.duplicatePasswords.length} 组重复密码`);
    return risks;
  };

  const risks = getRiskLevel();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="xl" label="加载中..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              安全概览
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              管理您的数字资产安全状况
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/accounts')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加账号
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                安全评分
              </h2>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={scoreColor[0]} />
                        <stop offset="100%" stopColor={scoreColor[1]} />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                      animationDuration={0}
                    >
                      <Cell fill="url(#scoreGradient)" />
                      <Cell fill="transparent" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-5xl font-bold"
                    style={{ color: scoreColor[0] }}
                  >
                    {animatedScore}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    / 100
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">密码强度</p>
                  <Badge
                    variant={
                      securityScore.passwordStrength === 'strong'
                        ? 'success'
                        : securityScore.passwordStrength === 'good'
                        ? 'info'
                        : securityScore.passwordStrength === 'fair'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {securityScore.passwordStrength === 'strong'
                      ? '强'
                      : securityScore.passwordStrength === 'good'
                      ? '良好'
                      : securityScore.passwordStrength === 'fair'
                      ? '一般'
                      : '弱'}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">2FA 覆盖率</p>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {securityScore.twoFactorUsage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="账号总数"
                value={animatedStats.accounts}
                icon={Users}
                variant="primary"
                trend={{ value: 12, label: '较上月', isPositive: true }}
              />
              <StatCard
                title="2FA 开启率"
                value={animatedStats.twoFA}
                icon={ShieldCheck}
                variant="success"
                suffix="%"
                trend={{ value: 8, label: '较上月', isPositive: true }}
              />
              <StatCard
                title="泄露检测"
                value={animatedStats.breaches}
                icon={AlertTriangle}
                variant="warning"
              />
              <StatCard
                title="总资产价值"
                value={animatedStats.assets}
                icon={Wallet}
                variant="primary"
                prefix="¥"
              />
            </div>

            {risks.length > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      风险提示
                    </h3>
                    <ul className="space-y-2">
                      {risks.map((risk, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <XCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => navigate('/audit')}
                      className="mt-3 text-sm text-orange-600 dark:text-orange-400 font-medium hover:underline flex items-center gap-1"
                    >
                      查看详情
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              待办提醒
              <Badge variant="warning" size="sm">
                {reminders.length} 项
              </Badge>
            </h2>
            {reminders.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="暂无待办事项"
                description="您的所有安全提醒都已处理完毕"
              />
            ) : (
              <div className="space-y-3">
                {reminders.slice(0, 5).map((reminder) => {
                  const Icon = getHabitIcon(reminder.habit.type);
                  const isUrgent = reminder.daysUntil <= 7;
                  const isOverdue = reminder.daysUntil < 0;
                  return (
                    <div
                      key={reminder.habit.id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border transition-colors',
                        isOverdue
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          : isUrgent
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          isOverdue
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : isUrgent
                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-5 h-5',
                            isOverdue
                              ? 'text-red-600 dark:text-red-400'
                              : isUrgent
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-blue-600 dark:text-blue-400'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {getHabitTitle(reminder)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isOverdue
                            ? `已过期 ${Math.abs(reminder.daysUntil)} 天`
                            : reminder.daysUntil === 0
                            ? '今天到期'
                            : `还剩 ${reminder.daysUntil} 天`}
                        </p>
                      </div>
                      <Badge
                        variant={isOverdue ? 'danger' : isUrgent ? 'warning' : 'info'}
                        size="sm"
                      >
                        {isOverdue ? '已过期' : isUrgent ? '紧急' : '待处理'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
            {reminders.length > 5 && (
              <button
                onClick={() => navigate('/habits')}
                className="w-full mt-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                查看全部 {reminders.length} 项提醒
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              近期活动
            </h2>
            <div className="relative">
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="relative pl-12">
                      <div
                        className={cn(
                          'absolute left-3 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900',
                          activity.variant === 'success'
                            ? 'bg-green-500'
                            : activity.variant === 'warning'
                            ? 'bg-yellow-500'
                            : activity.variant === 'danger'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        )}
                      >
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <div className="pt-0.5">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            快速操作
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Plus,
                title: '添加账号',
                description: '添加新的账号信息',
                onClick: () => navigate('/accounts'),
                variant: 'primary' as const,
              },
              {
                icon: Search,
                title: '安全扫描',
                description: '检查账号安全状况',
                onClick: () => navigate('/audit'),
                variant: 'success' as const,
              },
              {
                icon: AlertTriangle,
                title: '泄露检测',
                description: '检查数据泄露记录',
                onClick: () => navigate('/breach'),
                variant: 'warning' as const,
              },
              {
                icon: Wallet,
                title: '资产管理',
                description: '查看数字资产列表',
                onClick: () => navigate('/assets'),
                variant: 'info' as const,
              },
            ].map((action) => (
              <button
                key={action.title}
                onClick={action.onClick}
                className={cn(
                  'p-5 rounded-xl border-2 border-dashed text-left transition-all',
                  'hover:scale-[1.02] hover:shadow-md',
                  action.variant === 'primary'
                    ? 'border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    : action.variant === 'success'
                    ? 'border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    : action.variant === 'warning'
                    ? 'border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                    action.variant === 'primary'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : action.variant === 'success'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : action.variant === 'warning'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30'
                      : 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  <action.icon
                    className={cn(
                      'w-5 h-5',
                      action.variant === 'primary'
                        ? 'text-blue-600 dark:text-blue-400'
                        : action.variant === 'success'
                        ? 'text-green-600 dark:text-green-400'
                        : action.variant === 'warning'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-gray-600 dark:text-gray-400'
                    )}
                  />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {action.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
