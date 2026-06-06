import { useState, useMemo } from 'react';
import { useAppStore } from '@/store';
import { Layout, Modal, ConfirmDialog, Badge, EmptyState, StatCard, PasswordStrengthMeter, LoadingSpinner } from '@/components';
import type { Account } from '@/types';
import { checkPasswordPwned, type PwnedResult } from '@/utils/password';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Monitor,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  Mail,
  KeyRound,
  Database,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabKey = 'email' | 'password' | 'history' | 'suspicious';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: typeof Mail;
}

interface HIBPBreach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  LogoPath: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  IsMalware: boolean;
}

interface EmailCheckResult {
  email: string;
  breaches: HIBPBreach[];
  checkedAt: string;
}

const tabs: TabConfig[] = [
  { key: 'email', label: '邮箱泄露检测', icon: Mail },
  { key: 'password', label: '密码泄露检测', icon: KeyRound },
  { key: 'history', label: '泄露历史', icon: Database },
  { key: 'suspicious', label: '可疑登录', icon: AlertTriangle },
];

const DATA_TYPE_LABELS: Record<string, string> = {
  'Email addresses': '邮箱地址',
  'Passwords': '密码',
  'Password hashes': '密码哈希',
  'Phone numbers': '电话号码',
  'Usernames': '用户名',
  'IP addresses': 'IP地址',
  'Physical addresses': '物理地址',
  'Names': '姓名',
  'Dates of birth': '出生日期',
  'Genders': '性别',
  'Locations': '位置信息',
  'Social media profiles': '社交媒体资料',
  'Credit card data': '信用卡数据',
  'Bank account data': '银行账户数据',
  'Security questions and answers': '安全问题与答案',
  'Device information': '设备信息',
  'Employment details': '雇佣信息',
  'Financial data': '财务数据',
  'Government issued IDs': '政府签发ID',
  'Health data': '健康数据',
};

export default function Breach() {
  const {
    accounts,
    breachRecords,
    suspiciousLogins,
    addBreachRecord,
    updateBreachRecord,
    deleteBreachRecord,
    addSuspiciousLogin,
    deleteSuspiciousLogin,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailCheckResult, setEmailCheckResult] = useState<EmailCheckResult | null>(null);
  const [passwordCheckResult, setPasswordCheckResult] = useState<PwnedResult | null>(null);
  const [expandedBreach, setExpandedBreach] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'markPasswordChanged' | 'deleteBreach' | 'deleteLogin';
    id: string;
    title: string;
    message: string;
  } | null>(null);
  const [addLoginModal, setAddLoginModal] = useState(false);
  const [newLogin, setNewLogin] = useState({
    accountId: '',
    loginTime: new Date().toISOString().slice(0, 16),
    location: '',
    device: '',
    ipAddress: '',
    notes: '',
  });

  const stats = useMemo(() => {
    const uniqueEmails = new Set(accounts.map((acc) => acc.email).filter(Boolean));
    const totalBreaches = breachRecords.length;
    const handledBreaches = breachRecords.filter((b) => b.passwordChanged).length;
    const pendingBreaches = totalBreaches - handledBreaches;

    return {
      checkedEmails: uniqueEmails.size,
      totalBreaches,
      handledBreaches,
      pendingBreaches,
    };
  }, [accounts, breachRecords]);

  const sortedBreachRecords = useMemo(() => {
    return [...breachRecords].sort(
      (a, b) => new Date(b.breachDate).getTime() - new Date(a.breachDate).getTime()
    );
  }, [breachRecords]);

  const sortedSuspiciousLogins = useMemo(() => {
    return [...suspiciousLogins].sort(
      (a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
    );
  }, [suspiciousLogins]);

  const getDataTypeLabel = (dataType: string): string => {
    return DATA_TYPE_LABELS[dataType] || dataType;
  };

  const handleEmailCheck = async () => {
    if (!email.trim()) {
      setEmailError('请输入邮箱地址');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('请输入有效的邮箱地址');
      return;
    }

    setEmailLoading(true);
    setEmailError(null);
    setEmailCheckResult(null);

    try {
      const response = await fetch(
        `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email.trim())}?truncateResponse=false`,
        {
          headers: {
            'hibp-api-key': 'demo',
            'User-Agent': 'GuardVault-Security-Tracker',
          },
        }
      );

      if (response.status === 404) {
        setEmailCheckResult({
          email: email.trim(),
          breaches: [],
          checkedAt: new Date().toISOString(),
        });
        return;
      }

      if (response.status === 429) {
        throw new Error('API请求过于频繁，请稍后再试（速率限制）');
      }

      if (response.status === 401) {
        throw new Error('API密钥无效，请检查配置');
      }

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const breaches: HIBPBreach[] = await response.json();
      setEmailCheckResult({
        email: email.trim(),
        breaches,
        checkedAt: new Date().toISOString(),
      });

      breaches.forEach((breach) => {
        const exists = breachRecords.some(
          (r) => r.email === email.trim() && r.source === breach.Name
        );
        if (!exists) {
          addBreachRecord({
            email: email.trim(),
            source: breach.Name,
            breachDate: breach.BreachDate,
            description: breach.Description,
            dataTypes: breach.DataClasses,
            passwordChanged: false,
            verified: breach.IsVerified,
          });
        }
      });
    } catch (error) {
      setEmailError(
        error instanceof Error ? error.message : '检测邮箱泄露时发生未知错误'
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleBatchCheck = async () => {
    const uniqueEmails = Array.from(
      new Set(accounts.map((acc) => acc.email).filter(Boolean))
    );

    if (uniqueEmails.length === 0) {
      setEmailError('没有可用的邮箱地址进行检测');
      return;
    }

    setBatchLoading(true);
    setEmailError(null);

    try {
      for (let i = 0; i < uniqueEmails.length; i++) {
        const currentEmail = uniqueEmails[i];
        if (!currentEmail) continue;

        try {
          await new Promise((resolve) => setTimeout(resolve, 1600));

          const response = await fetch(
            `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(currentEmail)}?truncateResponse=false`,
            {
              headers: {
                'hibp-api-key': 'demo',
                'User-Agent': 'GuardVault-Security-Tracker',
              },
            }
          );

          if (response.status === 200) {
            const breaches: HIBPBreach[] = await response.json();
            breaches.forEach((breach) => {
              const exists = breachRecords.some(
                (r) => r.email === currentEmail && r.source === breach.Name
              );
              if (!exists) {
                addBreachRecord({
                  email: currentEmail,
                  source: breach.Name,
                  breachDate: breach.BreachDate,
                  description: breach.Description,
                  dataTypes: breach.DataClasses,
                  passwordChanged: false,
                  verified: breach.IsVerified,
                });
              }
            });
          } else if (response.status === 429) {
            throw new Error('API请求过于频繁，请稍后再试（速率限制）');
          }
        } catch (error) {
          console.error(`检测邮箱 ${currentEmail} 时出错:`, error);
        }
      }
    } catch (error) {
      setEmailError(
        error instanceof Error ? error.message : '批量检测时发生错误'
      );
    } finally {
      setBatchLoading(false);
    }
  };

  const handlePasswordCheck = async () => {
    if (!password) {
      setPasswordError('请输入密码');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordCheckResult(null);

    try {
      const result = await checkPasswordPwned(password);
      setPasswordCheckResult(result);
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : '检测密码泄露时发生未知错误'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleMarkPasswordChanged = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'markPasswordChanged',
      id,
      title: '标记已更换密码',
      message: '确认您已为该泄露事件涉及的账号更换了新密码？',
    });
  };

  const handleDeleteBreach = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'deleteBreach',
      id,
      title: '删除泄露记录',
      message: '确定要删除这条泄露记录吗？此操作无法撤销。',
    });
  };

  const handleDeleteLogin = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'deleteLogin',
      id,
      title: '删除可疑登录记录',
      message: '确定要删除这条可疑登录记录吗？此操作无法撤销。',
    });
  };

  const confirmAction = () => {
    if (!confirmDialog) return;

    switch (confirmDialog.type) {
      case 'markPasswordChanged':
        updateBreachRecord(confirmDialog.id, {
          passwordChanged: true,
          changeDate: new Date().toISOString(),
        });
        break;
      case 'deleteBreach':
        deleteBreachRecord(confirmDialog.id);
        break;
      case 'deleteLogin':
        deleteSuspiciousLogin(confirmDialog.id);
        break;
    }

    setConfirmDialog(null);
  };

  const handleAddLogin = () => {
    if (!newLogin.accountId || !newLogin.location || !newLogin.device || !newLogin.ipAddress) {
      return;
    }

    addSuspiciousLogin({
      accountId: newLogin.accountId,
      loginTime: new Date(newLogin.loginTime).toISOString(),
      location: newLogin.location,
      device: newLogin.device,
      ipAddress: newLogin.ipAddress,
      notes: newLogin.notes,
    });

    setAddLoginModal(false);
    setNewLogin({
      accountId: '',
      loginTime: new Date().toISOString().slice(0, 16),
      location: '',
      device: '',
      ipAddress: '',
      notes: '',
    });
  };

  const getAccountById = (id: string): Account | undefined => {
    return accounts.find((acc) => acc.id === id);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEmailTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              邮箱地址
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                placeholder="请输入要检测的邮箱地址"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleEmailCheck()}
              />
            </div>
            {emailError && (
              <p className="mt-2 text-sm text-red-500">{emailError}</p>
            )}
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleEmailCheck}
              disabled={emailLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {emailLoading ? (
                <LoadingSpinner className="w-4 h-4" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              检测
            </button>
            <button
              onClick={handleBatchCheck}
              disabled={batchLoading}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {batchLoading ? (
                <LoadingSpinner className="w-4 h-4" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              批量检测
            </button>
          </div>
        </div>

        {emailCheckResult && (
          <div className="mt-6">
            {emailCheckResult.breaches.length === 0 ? (
              <div className="p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">
                      未检测到泄露
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      邮箱 {emailCheckResult.email} 未在已知的数据泄露事件中出现
                    </p>
                    <p className="text-xs text-green-500 dark:text-green-600 mt-1">
                      检测时间: {formatDateTime(emailCheckResult.checkedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                  <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400">
                      检测到 {emailCheckResult.breaches.length} 次数据泄露
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-500">
                      邮箱 {emailCheckResult.email} 已在以下数据泄露事件中暴露
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {emailCheckResult.breaches.map((breach) => (
                    <div
                      key={breach.Name}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                            <Database className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-gray-900 dark:text-white">
                                {breach.Title}
                              </h5>
                              {breach.IsVerified && (
                                <Badge variant="danger" size="sm">
                                  已验证
                                </Badge>
                              )}
                              {breach.IsSensitive && (
                                <Badge variant="warning" size="sm">
                                  敏感
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              泄露日期: {formatDate(breach.BreachDate)} · 影响{' '}
                              {breach.PwnCount.toLocaleString()} 账号
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {breach.DataClasses.slice(0, 5).map((type) => (
                                <Badge key={type} variant="default" size="sm">
                                  {getDataTypeLabel(type)}
                                </Badge>
                              ))}
                              {breach.DataClasses.length > 5 && (
                                <Badge variant="default" size="sm">
                                  +{breach.DataClasses.length - 5} 更多
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderPasswordTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              密码
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                  setPasswordCheckResult(null);
                }}
                placeholder="请输入要检测的密码"
                className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordCheck()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-2 text-sm text-red-500">{passwordError}</p>
            )}
          </div>
          <div className="flex items-end">
            <button
              onClick={handlePasswordCheck}
              disabled={passwordLoading || !password}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {passwordLoading ? (
                <LoadingSpinner className="w-4 h-4" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              检测
            </button>
          </div>
        </div>

        {password && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <PasswordStrengthMeter password={password} />
          </div>
        )}

        {passwordCheckResult && (
          <div className="mt-6">
            {passwordCheckResult.isPwned ? (
              <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400">
                      密码已泄露！
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                      此密码已在 {passwordCheckResult.count.toLocaleString()} 次数据泄露事件中出现
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-500 mt-2">
                      <strong>警告：</strong>请立即更换所有使用此密码的账号密码！
                    </p>
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        检测方式：使用 k-匿名算法，仅发送密码SHA-1哈希的前5位字符到服务器，确保密码安全。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">
                      密码未泄露
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                      此密码未在已知的数据泄露事件中出现
                    </p>
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        检测方式：使用 k-匿名算法，仅发送密码SHA-1哈希的前5位字符到服务器，确保密码安全。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      {sortedBreachRecords.length === 0 ? (
        <EmptyState
          icon={Database}
          title="暂无泄露历史记录"
          description="使用邮箱泄露检测功能来查看和保存数据泄露记录"
        />
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-4">
            {sortedBreachRecords.map((record) => {
              const isExpanded = expandedBreach === record.id;
              return (
                <div key={record.id} className="relative pl-14">
                  <div
                    className={cn(
                      'absolute left-4 w-5 h-5 rounded-full border-4 flex items-center justify-center',
                      record.passwordChanged
                        ? 'bg-green-500 border-green-200 dark:border-green-900'
                        : 'bg-red-500 border-red-200 dark:border-red-900'
                    )}
                  />

                  <div
                    className={cn(
                      'bg-white dark:bg-gray-900 rounded-xl border transition-all',
                      record.passwordChanged
                        ? 'border-gray-200 dark:border-gray-800'
                        : 'border-red-200 dark:border-red-900/50'
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {record.source}
                            </h4>
                            {record.verified && (
                              <Badge variant="danger" size="sm">
                                已验证
                              </Badge>
                            )}
                            {record.passwordChanged ? (
                              <Badge variant="success" size="sm">
                                已更换密码
                              </Badge>
                            ) : (
                              <Badge variant="warning" size="sm">
                                待处理
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {record.email}
                            </span>
                            <span className="mx-2">·</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              泄露日期: {formatDate(record.breachDate)}
                            </span>
                            {record.changeDate && (
                              <>
                                <span className="mx-2">·</span>
                                <span className="text-green-600 dark:text-green-400">
                                  更换时间: {formatDate(record.changeDate)}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() =>
                              setExpandedBreach(isExpanded ? null : record.id)
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {!record.passwordChanged && (
                            <button
                              onClick={() => handleMarkPasswordChanged(record.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              标记已更换
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBreach(record.id)}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {record.description}
                          </p>
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                              泄露数据类型:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {record.dataTypes.map((type) => (
                                <Badge key={type} variant="default" size="sm">
                                  {getDataTypeLabel(type)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderSuspiciousTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          可疑登录记录
        </h3>
        <button
          onClick={() => setAddLoginModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加记录
        </button>
      </div>

      {sortedSuspiciousLogins.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="暂无可疑登录记录"
          description="当您发现可疑的登录活动时，可以在此处添加记录"
        />
      ) : (
        <div className="space-y-3">
          {sortedSuspiciousLogins.map((login) => {
            const account = getAccountById(login.accountId);
            return (
              <div
                key={login.id}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {account?.platformName || '未知账号'}
                        </h5>
                        <Badge variant="warning" size="sm">
                          可疑
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(login.loginTime)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {login.location}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Monitor className="w-3.5 h-3.5" />
                          {login.device}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          IP: {login.ipAddress}
                        </div>
                      </div>
                      {login.notes && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          {login.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteLogin(login.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={addLoginModal}
        onClose={() => setAddLoginModal(false)}
        title="添加可疑登录记录"
        footer={
          <>
            <button
              onClick={() => setAddLoginModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddLogin}
              disabled={!newLogin.accountId || !newLogin.location || !newLogin.device || !newLogin.ipAddress}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              添加
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              关联账号
            </label>
            <select
              value={newLogin.accountId}
              onChange={(e) => setNewLogin({ ...newLogin, accountId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择账号</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.platformName} ({acc.email || acc.phone})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              登录时间
            </label>
            <input
              type="datetime-local"
              value={newLogin.loginTime}
              onChange={(e) => setNewLogin({ ...newLogin, loginTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                位置
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={newLogin.location}
                  onChange={(e) => setNewLogin({ ...newLogin, location: e.target.value })}
                  placeholder="如：北京市"
                  className="w-full pl-9 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                设备
              </label>
              <div className="relative">
                <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={newLogin.device}
                  onChange={(e) => setNewLogin({ ...newLogin, device: e.target.value })}
                  placeholder="如：iPhone 15"
                  className="w-full pl-9 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              IP地址
            </label>
            <div className="relative">
              <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={newLogin.ipAddress}
                onChange={(e) => setNewLogin({ ...newLogin, ipAddress: e.target.value })}
                placeholder="如：192.168.1.100"
                className="w-full pl-9 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              备注
            </label>
            <textarea
              value={newLogin.notes}
              onChange={(e) => setNewLogin({ ...newLogin, notes: e.target.value })}
              placeholder="描述此次可疑登录的详细信息..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'email':
        return renderEmailTab();
      case 'password':
        return renderPasswordTab();
      case 'history':
        return renderHistoryTab();
      case 'suspicious':
        return renderSuspiciousTab();
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              数据泄露追踪
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              监控和管理您的账号数据泄露情况
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="检测邮箱数"
            value={stats.checkedEmails}
            icon={Mail}
            variant="primary"
          />
          <StatCard
            title="泄露事件数"
            value={stats.totalBreaches}
            icon={ShieldAlert}
            variant={stats.totalBreaches > 0 ? 'danger' : 'success'}
          />
          <StatCard
            title="已处理数"
            value={stats.handledBreaches}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="待处理数"
            value={stats.pendingBreaches}
            icon={AlertTriangle}
            variant={stats.pendingBreaches > 0 ? 'warning' : 'success'}
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

      <ConfirmDialog
        isOpen={confirmDialog?.isOpen || false}
        onClose={() => setConfirmDialog(null)}
        onConfirm={confirmAction}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        variant={confirmDialog?.type === 'markPasswordChanged' ? 'info' : 'danger'}
        confirmText={
          confirmDialog?.type === 'markPasswordChanged' ? '确认标记' : '删除'
        }
      />
    </Layout>
  );
}
