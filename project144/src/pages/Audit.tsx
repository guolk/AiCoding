import { useState, useMemo } from 'react';
import { useAppStore } from '@/store';
import { Layout, StatCard, Badge, EmptyState, Modal } from '@/components';
import type { Account, AuditResult, PasswordStrength } from '@/types';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Users,
  Lock,
  Unlock,
  Eye,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { checkPasswordStrength, getDaysUntilExpiry, generateStrongPassword } from '@/utils/password';
import { cn } from '@/lib/utils';

type TabKey = 'password' | 'twofa' | 'recovery' | 'expiry';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: typeof ShieldAlert;
}

const tabs: TabConfig[] = [
  { key: 'password', label: '密码强度审计', icon: KeyRound },
  { key: 'twofa', label: '双重认证审计', icon: ShieldCheck },
  { key: 'recovery', label: '恢复信息审计', icon: ShieldAlert },
  { key: 'expiry', label: '密码过期审计', icon: Clock },
];

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  weak: '#ef4444',
  fair: '#f59e0b',
  good: '#10b981',
  strong: '#3b82f6',
};

const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak: '弱密码',
  fair: '一般',
  good: '良好',
  strong: '强密码',
};

const GRADIENT_COLORS = [
  { start: '#6366f1', end: '#8b5cf6' },
  { start: '#10b981', end: '#059669' },
  { start: '#f59e0b', end: '#d97706' },
  { start: '#ef4444', end: '#dc2626' },
];

export default function Audit() {
  const { accounts, getAuditResult, updateAccount, changeAccountPassword } = useAppStore();
  const auditResult: AuditResult = getAuditResult();
  const [activeTab, setActiveTab] = useState<TabKey>('password');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'twofa' | 'password'>('twofa');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const passwordStrengthData = useMemo(() => {
    const counts: Record<PasswordStrength, number> = {
      weak: 0,
      fair: 0,
      good: 0,
      strong: 0,
    };

    accounts.forEach((acc) => {
      const result = checkPasswordStrength(acc.passwordHash);
      counts[result.strength]++;
    });

    return Object.entries(counts).map(([strength, count]) => ({
      name: STRENGTH_LABELS[strength as PasswordStrength],
      value: count,
      color: STRENGTH_COLORS[strength as PasswordStrength],
    }));
  }, [accounts]);

  const twoFAData = useMemo(() => {
    const enabled = accounts.filter((acc) => acc.has2FA).length;
    const disabled = accounts.length - enabled;

    return [
      { name: '已开启2FA', value: enabled, color: '#10b981' },
      { name: '未开启2FA', value: disabled, color: '#f59e0b' },
    ];
  }, [accounts]);

  const recoveryData = useMemo(() => {
    const hasAll = accounts.filter(
      (acc) => acc.recoveryEmail && acc.recoveryPhone && acc.recoveryCodes.length > 0
    ).length;
    const hasPartial = accounts.filter(
      (acc) =>
        (acc.recoveryEmail || acc.recoveryPhone || acc.recoveryCodes.length > 0) &&
        !(acc.recoveryEmail && acc.recoveryPhone && acc.recoveryCodes.length > 0)
    ).length;
    const hasNone = accounts.filter(
      (acc) => !acc.recoveryEmail && !acc.recoveryPhone && acc.recoveryCodes.length === 0
    ).length;

    return [
      { name: '信息完整', value: hasAll, color: '#10b981' },
      { name: '部分缺失', value: hasPartial, color: '#f59e0b' },
      { name: '完全缺失', value: hasNone, color: '#ef4444' },
    ];
  }, [accounts]);

  const expiryData = useMemo(() => {
    const now = new Date();
    const expired = accounts.filter((acc) =>
      getDaysUntilExpiry(acc.lastPasswordChange, acc.passwordChangeInterval) < 0
    ).length;
    const expiringSoon = accounts.filter((acc) => {
      const days = getDaysUntilExpiry(acc.lastPasswordChange, acc.passwordChangeInterval);
      return days >= 0 && days <= 30;
    }).length;
    const healthy = accounts.length - expired - expiringSoon;

    return [
      { name: '已过期', value: expired, color: '#ef4444' },
      { name: '即将过期', value: expiringSoon, color: '#f59e0b' },
      { name: '正常', value: healthy, color: '#10b981' },
    ];
  }, [accounts]);

  const soonExpiredPasswords = useMemo(() => {
    return accounts
      .filter((acc) => {
        const days = getDaysUntilExpiry(acc.lastPasswordChange, acc.passwordChangeInterval);
        return days >= 0 && days <= 30;
      })
      .map((acc) => ({
        account: acc,
        daysUntil: getDaysUntilExpiry(acc.lastPasswordChange, acc.passwordChangeInterval),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [accounts]);

  const alreadyExpiredPasswords = useMemo(() => {
    return accounts
      .filter((acc) => getDaysUntilExpiry(acc.lastPasswordChange, acc.passwordChangeInterval) < 0)
      .map((acc) => ({
        account: acc,
        daysOverdue: Math.abs(getDaysUntilExpiry(acc.lastPasswordChange, acc.passwordChangeInterval)),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [accounts]);

  const missingRecoveryAccounts = useMemo(() => {
    return accounts.filter(
      (acc) => !acc.recoveryEmail || !acc.recoveryPhone || acc.recoveryCodes.length === 0
    );
  }, [accounts]);

  const duplicatePasswordGroups = useMemo(() => {
    return auditResult.duplicatePasswords.map((group) =>
      group.map((id) => accounts.find((acc) => acc.id === id)).filter(Boolean) as Account[]
    );
  }, [auditResult.duplicatePasswords, accounts]);

  const stats = useMemo(() => {
    const totalAccounts = accounts.length;
    const twoFAEnabledRate =
      totalAccounts > 0
        ? Math.round((accounts.filter((acc) => acc.has2FA).length / totalAccounts) * 100)
        : 0;
    const recoveryCompleteRate =
      totalAccounts > 0
        ? Math.round(
            (accounts.filter(
              (acc) => acc.recoveryEmail && acc.recoveryPhone && acc.recoveryCodes.length > 0
            ).length /
              totalAccounts) *
              100
          )
        : 0;

    return {
      weakPasswordCount: auditResult.weakPasswords.length,
      twoFAEnabledRate,
      recoveryCompleteRate,
      expiredCount: auditResult.expiredPasswords.length,
    };
  }, [accounts, auditResult]);

  const handleMark2FA = (account: Account) => {
    setSelectedAccount(account);
    setModalType('twofa');
    setModalOpen(true);
  };

  const handleMarkPasswordChanged = (account: Account) => {
    setSelectedAccount(account);
    setModalType('password');
    setModalOpen(true);
  };

  const confirmMark2FA = () => {
    if (selectedAccount) {
      updateAccount(selectedAccount.id, { has2FA: true });
    }
    setModalOpen(false);
    setSelectedAccount(null);
  };

  const confirmMarkPasswordChanged = () => {
    if (selectedAccount) {
      const newPassword = generateStrongPassword();
      changeAccountPassword(selectedAccount.id, newPassword, '安全审计后更换');
    }
    setModalOpen(false);
    setSelectedAccount(null);
  };

  const getAccountById = (id: string): Account | undefined => {
    return accounts.find((acc) => acc.id === id);
  };

  const ImportanceBadge = ({ level }: { level: string }) => {
    type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';
    const variants: Record<string, { variant: BadgeVariant; label: string }> = {
      core: { variant: 'danger', label: '核心' },
      daily: { variant: 'warning', label: '日常' },
      temporary: { variant: 'info', label: '临时' },
    };
    const config = variants[level] || { variant: 'default' as BadgeVariant, label: level };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderPasswordTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">密码强度分布</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {GRADIENT_COLORS.map((color, i) => (
                    <linearGradient
                      key={`gradient-${i}`}
                      id={`colorGradient-${i}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={color.start} />
                      <stop offset="100%" stopColor={color.end} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={passwordStrengthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {passwordStrengthData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#colorGradient-${index % GRADIENT_COLORS.length})`}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">各强度账号数量</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={passwordStrengthData} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={800}>
                  {passwordStrengthData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={`url(#colorGradient-${index % GRADIENT_COLORS.length})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">弱密码账号</h3>
          <Badge variant="danger">{auditResult.weakPasswords.length}</Badge>
        </div>
        {auditResult.weakPasswords.length === 0 ? (
          <EmptyState icon={CheckCircle} title="没有弱密码" description="所有账号的密码强度都符合要求" />
        ) : (
          <div className="space-y-3">
            {auditResult.weakPasswords.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{account.platformName}</span>
                      <ImportanceBadge level={account.importanceLevel} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{account.email || account.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkPasswordChanged(account)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  更换密码
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">重复密码账号组</h3>
          <Badge variant="warning">{duplicatePasswordGroups.length}</Badge>
        </div>
        {duplicatePasswordGroups.length === 0 ? (
          <EmptyState icon={CheckCircle} title="没有重复密码" description="所有账号都使用了独立的密码" />
        ) : (
          <div className="space-y-4">
            {duplicatePasswordGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="warning">第 {groupIndex + 1} 组</Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    共 {group.length} 个账号使用相同密码
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                          <Eye className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {account.platformName}
                            </span>
                            <ImportanceBadge level={account.importanceLevel} />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {account.email || account.phone}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkPasswordChanged(account)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        更换
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTwoFATab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">2FA开启率</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="twofaGradient-0" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="twofaGradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <Pie
                  data={twoFAData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {twoFAData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#twofaGradient-${index})`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">2FA状态统计</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={twoFAData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={800}>
                  {twoFAData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={`url(#twofaGradient-${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">未开启2FA的重要账号</h3>
          <Badge variant="warning">{auditResult.missing2FA.length}</Badge>
        </div>
        {auditResult.missing2FA.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="所有重要账号均已开启2FA"
            description="您的核心账号都受到双重认证保护"
          />
        ) : (
          <div className="space-y-3">
            {auditResult.missing2FA.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                    <Unlock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{account.platformName}</span>
                      <ImportanceBadge level={account.importanceLevel} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{account.email || account.phone}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      建议立即开启双重认证以提高账户安全性
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMark2FA(account)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    标记已开启
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderRecoveryTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">恢复信息完整度</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="recoveryGradient-0" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="recoveryGradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="recoveryGradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
                <Pie
                  data={recoveryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {recoveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#recoveryGradient-${index})`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">恢复信息分布</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recoveryData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={800}>
                  {recoveryData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={`url(#recoveryGradient-${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">缺少恢复信息的账号</h3>
          <Badge variant="danger">{missingRecoveryAccounts.length}</Badge>
        </div>
        {missingRecoveryAccounts.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="所有账号恢复信息完整"
            description="您的账号都配置了完整的恢复信息"
          />
        ) : (
          <div className="space-y-3">
            {missingRecoveryAccounts.map((account) => {
              const missingItems: string[] = [];
              if (!account.recoveryEmail) missingItems.push('恢复邮箱');
              if (!account.recoveryPhone) missingItems.push('恢复手机');
              if (account.recoveryCodes.length === 0) missingItems.push('恢复代码');

              return (
                <div
                  key={account.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border',
                    missingItems.length >= 2
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800/30'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        missingItems.length >= 2
                          ? 'bg-red-100 dark:bg-red-900/50'
                          : 'bg-yellow-100 dark:bg-yellow-900/50'
                      )}
                    >
                      <AlertTriangle
                        className={cn(
                          'w-5 h-5',
                          missingItems.length >= 2 ? 'text-red-500' : 'text-yellow-500'
                        )}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{account.platformName}</span>
                        <ImportanceBadge level={account.importanceLevel} />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{account.email || account.phone}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {missingItems.map((item) => (
                          <Badge key={item} variant="danger" size="sm">
                            缺少{item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderExpiryTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">密码有效期分布</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="expiryGradient-0" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                  <linearGradient id="expiryGradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="expiryGradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <Pie
                  data={expiryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#expiryGradient-${index})`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">过期状态统计</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expiryData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={800}>
                  {expiryData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={`url(#expiryGradient-${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">即将过期密码（30天内）</h3>
          <Badge variant="warning">{soonExpiredPasswords.length}</Badge>
        </div>
        {soonExpiredPasswords.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="没有即将过期的密码"
            description="所有账号密码都在有效期内"
          />
        ) : (
          <div className="space-y-3">
            {soonExpiredPasswords.map(({ account, daysUntil }) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{account.platformName}</span>
                      <ImportanceBadge level={account.importanceLevel} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{account.email || account.phone}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      还有 {daysUntil} 天过期
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkPasswordChanged(account)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  提前更换
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">已过期密码</h3>
          <Badge variant="danger">{alreadyExpiredPasswords.length}</Badge>
        </div>
        {alreadyExpiredPasswords.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="没有已过期的密码"
            description="所有账号密码都已及时更新"
          />
        ) : (
          <div className="space-y-3">
            {alreadyExpiredPasswords.map(({ account, daysOverdue }) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{account.platformName}</span>
                      <ImportanceBadge level={account.importanceLevel} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{account.email || account.phone}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      已过期 {daysOverdue} 天
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkPasswordChanged(account)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  立即更换
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'password':
        return renderPasswordTab();
      case 'twofa':
        return renderTwoFATab();
      case 'recovery':
        return renderRecoveryTab();
      case 'expiry':
        return renderExpiryTab();
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">安全审计</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              全面检查您的账号安全状态
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="弱密码账号"
            value={stats.weakPasswordCount}
            icon={KeyRound}
            variant={stats.weakPasswordCount > 0 ? 'danger' : 'success'}
          />
          <StatCard
            title="2FA开启率"
            value={stats.twoFAEnabledRate}
            suffix="%"
            icon={ShieldCheck}
            variant={stats.twoFAEnabledRate >= 80 ? 'success' : stats.twoFAEnabledRate >= 50 ? 'warning' : 'danger'}
          />
          <StatCard
            title="恢复信息完整度"
            value={stats.recoveryCompleteRate}
            suffix="%"
            icon={ShieldAlert}
            variant={stats.recoveryCompleteRate >= 80 ? 'success' : stats.recoveryCompleteRate >= 50 ? 'warning' : 'danger'}
          />
          <StatCard
            title="过期密码"
            value={stats.expiredCount}
            icon={Clock}
            variant={stats.expiredCount > 0 ? 'danger' : 'success'}
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
                  activeTab === tab.key
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === 'twofa' ? '确认开启2FA' : '确认更换密码'}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={modalType === 'twofa' ? confirmMark2FA : confirmMarkPasswordChanged}
              className={cn(
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                modalType === 'twofa'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              )}
            >
              确认
            </button>
          </>
        }
      >
        {modalType === 'twofa' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedAccount?.platformName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedAccount?.email || selectedAccount?.phone}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              确认您已在该账号的安全设置中开启了双重认证（2FA）。标记后，该账号将被视为已启用2FA保护。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedAccount?.platformName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedAccount?.email || selectedAccount?.phone}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              系统将自动生成一个新的强密码并更新该账号的密码记录。请确保您已在对应平台实际更新了密码。
            </p>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">新密码预览：</p>
              <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                {generateStrongPassword()}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
