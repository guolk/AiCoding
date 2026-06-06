import { useState, useRef } from 'react';
import {
  Settings,
  Key,
  Download,
  Upload,
  Trash2,
  Shield,
  Bell,
  Palette,
  AlertTriangle,
  CheckCircle,
  FileJson,
  Lock,
  Eye,
  EyeOff,
  Moon,
  Sun,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Layout, Modal, ConfirmDialog, PasswordStrengthMeter } from '@/components';
import {
  encryptData,
  decryptData,
  generateSalt,
  generateChecksum,
  verifyChecksum,
  deriveKey,
  hashPassword,
} from '@/utils/crypto';
import type { EncryptedStorage, Account, BreachRecord, SuspiciousLogin, DigitalAsset, SecurityHabit, PasswordHistory } from '@/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface SettingsCardProps {
  icon: typeof Settings;
  title: string;
  description: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}

function SettingsCard({ icon: Icon, title, description, children, variant = 'default' }: SettingsCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl p-6 border shadow-sm',
        variant === 'danger'
          ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
          : 'border-gray-200 dark:border-gray-800'
      )}
    >
      <div className="flex items-start gap-4 mb-6">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            variant === 'danger'
              ? 'bg-red-100 dark:bg-red-900/30'
              : 'bg-blue-100 dark:bg-blue-900/30'
          )}
        >
          <Icon
            className={cn(
              'w-6 h-6',
              variant === 'danger'
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            )}
          />
        </div>
        <div>
          <h3
            className={cn(
              'text-lg font-semibold mb-1',
              variant === 'danger'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-900 dark:text-white'
            )}
          >
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    masterPasswordHash,
    encryptionKey,
    accounts,
    breachRecords,
    suspiciousLogins,
    assets,
    habits,
    passwordHistories,
    logout,
    addAccount,
    addBreachRecord,
    addSuspiciousLogin,
    addAsset,
    addHabit,
  } = useAppStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [exportPassword, setExportPassword] = useState('');
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [useExportPassword, setUseExportPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [importPassword, setImportPassword] = useState('');
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');
  const [importPreview, setImportPreview] = useState<{
    accounts: number;
    breachRecords: number;
    suspiciousLogins: number;
    assets: number;
    habits: number;
    passwordHistories: number;
  } | null>(null);

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);
  const [isConfirmImportDialogOpen, setIsConfirmImportDialogOpen] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupReminder, setAutoBackupReminder] = useState(true);
  const [backupReminderDays, setBackupReminderDays] = useState(30);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('请填写所有密码字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('新密码长度至少为8位');
      return;
    }

    const salt = generateSalt();
    const { hash } = hashPassword(currentPassword, salt);

    if (hash !== masterPasswordHash) {
      setPasswordError('当前密码不正确');
      return;
    }

    setPasswordSuccess(true);
    setTimeout(() => {
      setIsChangePasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(false);
    }, 1500);
  };

  const handleExport = async () => {
    if (!encryptionKey) return;

    setIsExporting(true);
    try {
      const exportData = {
        accounts,
        breachRecords,
        suspiciousLogins,
        assets,
        habits,
        passwordHistories,
      };

      let finalKey = encryptionKey;
      let salt = generateSalt();

      if (useExportPassword && exportPassword) {
        finalKey = deriveKey(exportPassword, salt);
      }

      const { encryptedData, iv } = encryptData(exportData, finalKey);
      const checksum = generateChecksum(encryptedData, finalKey);

      const encryptedStorage: EncryptedStorage = {
        version: 1,
        encryptedData,
        salt,
        iv,
        checksum,
      };

      const jsonStr = JSON.stringify(encryptedStorage, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const fileName = `guardvault-backup-${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExportModalOpen(false);
      setExportPassword('');
      setUseExportPassword(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError('');
    setImportPreview(null);
  };

  const handleVerifyImport = async () => {
    if (!importFile || !encryptionKey) return;

    setImportError('');
    setImportPreview(null);

    try {
      const text = await importFile.text();
      const encryptedStorage: EncryptedStorage = JSON.parse(text);

      if (
        !encryptedStorage.version ||
        !encryptedStorage.encryptedData ||
        !encryptedStorage.salt ||
        !encryptedStorage.iv ||
        !encryptedStorage.checksum
      ) {
        setImportError('文件格式不正确，请选择有效的备份文件');
        return;
      }

      let key = encryptionKey;
      if (importPassword) {
        key = deriveKey(importPassword, encryptedStorage.salt);
      }

      if (!verifyChecksum(encryptedStorage.encryptedData, key, encryptedStorage.checksum)) {
        setImportError('校验和验证失败，文件可能已被篡改或密码错误');
        return;
      }

      const decrypted = decryptData(
        encryptedStorage.encryptedData,
        key,
        encryptedStorage.iv
      ) as {
        accounts: Account[];
        breachRecords: BreachRecord[];
        suspiciousLogins: SuspiciousLogin[];
        assets: DigitalAsset[];
        habits: SecurityHabit[];
        passwordHistories: PasswordHistory[];
      };

      setImportPreview({
        accounts: decrypted.accounts?.length || 0,
        breachRecords: decrypted.breachRecords?.length || 0,
        suspiciousLogins: decrypted.suspiciousLogins?.length || 0,
        assets: decrypted.assets?.length || 0,
        habits: decrypted.habits?.length || 0,
        passwordHistories: decrypted.passwordHistories?.length || 0,
      });
    } catch {
      setImportError('文件解析失败，请确保文件格式正确且密码正确');
    }
  };

  const handleImport = async () => {
    if (!importFile || !encryptionKey || !importPreview) return;

    try {
      const text = await importFile.text();
      const encryptedStorage: EncryptedStorage = JSON.parse(text);

      let key = encryptionKey;
      if (importPassword) {
        key = deriveKey(importPassword, encryptedStorage.salt);
      }

      const decrypted = decryptData(
        encryptedStorage.encryptedData,
        key,
        encryptedStorage.iv
      ) as {
        accounts: Account[];
        breachRecords: BreachRecord[];
        suspiciousLogins: SuspiciousLogin[];
        assets: DigitalAsset[];
        habits: SecurityHabit[];
        passwordHistories: PasswordHistory[];
      };

      decrypted.accounts?.forEach((acc) => {
        addAccount(acc);
      });
      decrypted.breachRecords?.forEach((record) => {
        addBreachRecord(record);
      });
      decrypted.suspiciousLogins?.forEach((login) => {
        addSuspiciousLogin(login);
      });
      decrypted.assets?.forEach((asset) => {
        addAsset(asset);
      });
      decrypted.habits?.forEach((habit) => {
        addHabit(habit);
      });

      setIsConfirmImportDialogOpen(false);
      setIsImportModalOpen(false);
      setImportFile(null);
      setImportPassword('');
      setImportPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleClearData = () => {
    localStorage.removeItem('guardvault_data');
    logout();
    setIsClearDataDialogOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              设置
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              管理应用设置和数据安全
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SettingsCard
            icon={Key}
            title="主密码管理"
            description="修改您的主密码，确保数据安全"
          >
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    修改主密码
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    定期更换主密码以提高安全性
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </SettingsCard>

          <SettingsCard
            icon={Download}
            title="加密导出备份"
            description="导出您的所有数据为AES-256加密的JSON文件"
          >
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <FileJson className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    导出数据备份
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    guardvault-backup-YYYYMMDD.json
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </SettingsCard>

          <SettingsCard
            icon={Upload}
            title="从备份文件导入"
            description="从加密的JSON备份文件中恢复数据"
          >
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    导入数据备份
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    验证格式、校验和并解密数据
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </SettingsCard>

          <SettingsCard
            icon={Shield}
            title="数据备份设置"
            description="配置自动备份提醒和安全选项"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    自动备份提醒
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    定期提醒您备份数据
                  </p>
                </div>
                <button
                  onClick={() => setAutoBackupReminder(!autoBackupReminder)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    autoBackupReminder ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                      autoBackupReminder ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
              {autoBackupReminder && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    备份提醒间隔（天）
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="7"
                      max="90"
                      value={backupReminderDays}
                      onChange={(e) => setBackupReminderDays(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[60px] text-center">
                      {backupReminderDays} 天
                    </span>
                  </div>
                </div>
              )}
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Palette}
            title="应用设置"
            description="自定义主题和通知偏好"
          >
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-3">
                  主题设置
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <Sun className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      浅色
                    </span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <Moon className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      深色
                    </span>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                      theme === 'system'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      系统
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      通知提醒
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      接收安全提醒和通知
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                      notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Trash2}
            title="危险操作区"
            description="清除所有数据，此操作不可撤销"
            variant="danger"
          >
            <button
              onClick={() => setIsClearDataDialogOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              清除所有数据
            </button>
            <p className="text-xs text-red-600 dark:text-red-400 mt-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              警告：此操作将永久删除所有存储的数据，包括账号、密码、资产等所有信息。请确保已备份重要数据。
            </p>
          </SettingsCard>
        </div>

        <Modal
          isOpen={isChangePasswordModalOpen}
          onClose={() => {
            setIsChangePasswordModalOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError('');
            setPasswordSuccess(false);
          }}
          title="修改主密码"
          footer={
            <>
              <button
                onClick={() => {
                  setIsChangePasswordModalOpen(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setPasswordSuccess(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleChangePassword}
                disabled={passwordSuccess}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {passwordSuccess ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    修改成功
                  </span>
                ) : (
                  '确认修改'
                )}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                密码修改成功！
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                当前密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入当前密码"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                新密码
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入新密码"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                确认新密码
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请再次输入新密码"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {newPassword && <PasswordStrengthMeter password={newPassword} />}
          </div>
        </Modal>

        <Modal
          isOpen={isExportModalOpen}
          onClose={() => {
            setIsExportModalOpen(false);
            setExportPassword('');
            setUseExportPassword(false);
          }}
          title="导出数据备份"
          footer={
            <>
              <button
                onClick={() => {
                  setIsExportModalOpen(false);
                  setExportPassword('');
                  setUseExportPassword(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || (useExportPassword && !exportPassword)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  '导出中...'
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    导出
                  </span>
                )}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>导出信息：</strong>
              </p>
              <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                <li>• 数据格式：AES-256 加密 JSON</li>
                <li>• 包含：账号、泄露记录、登录记录、资产、习惯、密码历史</li>
                <li>• 文件名：guardvault-backup-YYYYMMDD.json</li>
              </ul>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    导出密码保护
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    使用额外密码加密导出文件
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUseExportPassword(!useExportPassword)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  useExportPassword ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    useExportPassword ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
            {useExportPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  导出密码
                </label>
                <div className="relative">
                  <input
                    type={showExportPassword ? 'text' : 'password'}
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入导出密码"
                  />
                  <button
                    onClick={() => setShowExportPassword(!showExportPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showExportPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  请牢记此密码，否则将无法恢复备份数据
                </p>
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            setImportFile(null);
            setImportPassword('');
            setImportError('');
            setImportPreview(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          title="导入数据备份"
          footer={
            <>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                  setImportPassword('');
                  setImportError('');
                  setImportPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              {importPreview ? (
                <button
                  onClick={() => setIsConfirmImportDialogOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  确认导入
                </button>
              ) : (
                <button
                  onClick={handleVerifyImport}
                  disabled={!importFile}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  验证文件
                </button>
              )}
            </>
          }
        >
          <div className="space-y-4">
            {importError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {importError}
              </div>
            )}
            {importPreview && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  文件验证成功！
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600 dark:text-gray-400">账号：</div>
                  <div className="font-medium text-gray-900 dark:text-white">{importPreview.accounts} 条</div>
                  <div className="text-gray-600 dark:text-gray-400">泄露记录：</div>
                  <div className="font-medium text-gray-900 dark:text-white">{importPreview.breachRecords} 条</div>
                  <div className="text-gray-600 dark:text-gray-400">登录记录：</div>
                  <div className="font-medium text-gray-900 dark:text-white">{importPreview.suspiciousLogins} 条</div>
                  <div className="text-gray-600 dark:text-gray-400">资产：</div>
                  <div className="font-medium text-gray-900 dark:text-white">{importPreview.assets} 条</div>
                  <div className="text-gray-600 dark:text-gray-400">安全习惯：</div>
                  <div className="font-medium text-gray-900 dark:text-white">{importPreview.habits} 条</div>
                  <div className="text-gray-600 dark:text-gray-400">密码历史：</div>
                  <div className="font-medium text-gray-900 dark:text-white">{importPreview.passwordHistories} 条</div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择备份文件
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100"
              />
              {importFile && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  已选择：{importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                备份密码（可选）
              </label>
              <div className="relative">
                <input
                  type={showImportPassword ? 'text' : 'password'}
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如果备份文件使用了密码保护，请输入"
                />
                <button
                  onClick={() => setShowImportPassword(!showImportPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showImportPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </Modal>

        <ConfirmDialog
          isOpen={isClearDataDialogOpen}
          onClose={() => setIsClearDataDialogOpen(false)}
          onConfirm={handleClearData}
          title="清除所有数据"
          message="您确定要清除所有数据吗？此操作将永久删除所有存储的账号、密码、资产等信息，且无法恢复。请确保已备份重要数据。"
          confirmText="确认清除"
          cancelText="取消"
          variant="danger"
        />

        <ConfirmDialog
          isOpen={isConfirmImportDialogOpen}
          onClose={() => setIsConfirmImportDialogOpen(false)}
          onConfirm={handleImport}
          title="确认导入数据"
          message="导入将合并备份文件中的数据到当前数据库。这不会删除现有数据，但可能会添加重复记录。确定要继续吗？"
          confirmText="确认导入"
          cancelText="取消"
          variant="info"
        />
      </div>
    </Layout>
  );
}

function ChevronRight(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
