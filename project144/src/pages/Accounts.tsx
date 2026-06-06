import { useState, useMemo } from 'react';
import { useAppStore } from '@/store';
import { Layout, Modal, ConfirmDialog, Badge, EmptyState, PasswordStrengthMeter } from '@/components';
import type { Account, ImportanceLevel, CancellationStatus } from '@/types';
import { Plus, Search, Edit2, Trash2, Filter, Shield, ShieldOff, Mail, Phone, Calendar, Tag, Inbox } from 'lucide-react';

interface AccountFormData {
  platformName: string;
  email: string;
  phone: string;
  registerDate: string;
  purpose: string;
  importanceLevel: ImportanceLevel;
  cancellationStatus: CancellationStatus;
  passwordHint: string;
  has2FA: boolean;
  lastPasswordChange: string;
  passwordChangeInterval: number;
  recoveryEmail: string;
  recoveryPhone: string;
  recoveryCodes: string;
}

const defaultFormData: AccountFormData = {
  platformName: '',
  email: '',
  phone: '',
  registerDate: new Date().toISOString().split('T')[0],
  purpose: '',
  importanceLevel: 'daily',
  cancellationStatus: 'active',
  passwordHint: '',
  has2FA: false,
  lastPasswordChange: new Date().toISOString().split('T')[0],
  passwordChangeInterval: 90,
  recoveryEmail: '',
  recoveryPhone: '',
  recoveryCodes: '',
};

const importanceLabels: Record<ImportanceLevel, string> = {
  core: '核心',
  daily: '日常',
  temporary: '临时',
};

const importanceVariants: Record<ImportanceLevel, 'danger' | 'info' | 'warning'> = {
  core: 'danger',
  daily: 'info',
  temporary: 'warning',
};

const cancellationLabels: Record<CancellationStatus, string> = {
  active: '活跃',
  pending: '待注销',
  cancelled: '已注销',
  impossible: '无法注销',
};

const cancellationVariants: Record<CancellationStatus, 'success' | 'warning' | 'default' | 'danger'> = {
  active: 'success',
  pending: 'warning',
  cancelled: 'default',
  impossible: 'danger',
};

export default function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAppStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [importanceFilter, setImportanceFilter] = useState<ImportanceLevel | 'all'>('all');
  const [cancellationFilter, setCancellationFilter] = useState<CancellationStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>(defaultFormData);
  const [passwordInput, setPasswordInput] = useState('');

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch =
        searchKeyword === '' ||
        account.platformName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        account.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        account.purpose.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchesImportance =
        importanceFilter === 'all' || account.importanceLevel === importanceFilter;

      const matchesCancellation =
        cancellationFilter === 'all' || account.cancellationStatus === cancellationFilter;

      return matchesSearch && matchesImportance && matchesCancellation;
    });
  }, [accounts, searchKeyword, importanceFilter, cancellationFilter]);

  const handleAddClick = () => {
    setFormData(defaultFormData);
    setPasswordInput('');
    setIsAddModalOpen(true);
  };

  const handleEditClick = (account: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAccount(account);
    setFormData({
      platformName: account.platformName,
      email: account.email,
      phone: account.phone,
      registerDate: account.registerDate,
      purpose: account.purpose,
      importanceLevel: account.importanceLevel,
      cancellationStatus: account.cancellationStatus,
      passwordHint: account.passwordHint,
      has2FA: account.has2FA,
      lastPasswordChange: new Date(account.lastPasswordChange).toISOString().split('T')[0],
      passwordChangeInterval: account.passwordChangeInterval,
      recoveryEmail: account.recoveryEmail,
      recoveryPhone: account.recoveryPhone,
      recoveryCodes: account.recoveryCodes.join(', '),
    });
    setPasswordInput(account.passwordHash);
    setIsEditModalOpen(true);
  };

  const handleRowClick = (account: Account) => {
    setSelectedAccount(account);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (account: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAccount) {
      deleteAccount(selectedAccount.id);
    }
    setIsDeleteDialogOpen(false);
    setSelectedAccount(null);
  };

  const handleAddSubmit = () => {
    const recoveryCodesArray = formData.recoveryCodes
      .split(',')
      .map((code) => code.trim())
      .filter((code) => code.length > 0);

    addAccount({
      platformName: formData.platformName,
      email: formData.email,
      phone: formData.phone,
      registerDate: formData.registerDate,
      purpose: formData.purpose,
      importanceLevel: formData.importanceLevel,
      cancellationStatus: formData.cancellationStatus,
      passwordHash: passwordInput,
      passwordHint: formData.passwordHint,
      has2FA: formData.has2FA,
      lastPasswordChange: new Date(formData.lastPasswordChange).toISOString(),
      passwordChangeInterval: formData.passwordChangeInterval,
      recoveryEmail: formData.recoveryEmail,
      recoveryPhone: formData.recoveryPhone,
      recoveryCodes: recoveryCodesArray,
    });

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = () => {
    if (!selectedAccount) return;

    const recoveryCodesArray = formData.recoveryCodes
      .split(',')
      .map((code) => code.trim())
      .filter((code) => code.length > 0);

    updateAccount(selectedAccount.id, {
      platformName: formData.platformName,
      email: formData.email,
      phone: formData.phone,
      registerDate: formData.registerDate,
      purpose: formData.purpose,
      importanceLevel: formData.importanceLevel,
      cancellationStatus: formData.cancellationStatus,
      passwordHash: passwordInput,
      passwordHint: formData.passwordHint,
      has2FA: formData.has2FA,
      lastPasswordChange: new Date(formData.lastPasswordChange).toISOString(),
      passwordChangeInterval: formData.passwordChangeInterval,
      recoveryEmail: formData.recoveryEmail,
      recoveryPhone: formData.recoveryPhone,
      recoveryCodes: recoveryCodesArray,
    });

    setIsEditModalOpen(false);
  };

  const handleFormChange = (field: keyof AccountFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.platformName.trim() !== '';
  };

  const renderFormFields = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          平台名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.platformName}
          onChange={(e) => handleFormChange('platformName', e.target.value)}
          placeholder="例如：GitHub、支付宝"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Mail className="w-4 h-4 inline mr-1" />
            注册邮箱
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            placeholder="email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Phone className="w-4 h-4 inline mr-1" />
            注册手机
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleFormChange('phone', e.target.value)}
            placeholder="13800138000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            注册时间
          </label>
          <input
            type="date"
            value={formData.registerDate}
            onChange={(e) => handleFormChange('registerDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Tag className="w-4 h-4 inline mr-1" />
            用途
          </label>
          <input
            type="text"
            value={formData.purpose}
            onChange={(e) => handleFormChange('purpose', e.target.value)}
            placeholder="例如：开发协作"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            重要程度
          </label>
          <div className="flex gap-2">
            {(['core', 'daily', 'temporary'] as ImportanceLevel[]).map((level) => (
              <label
                key={level}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                  formData.importanceLevel === level
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="importanceLevel"
                  value={level}
                  checked={formData.importanceLevel === level}
                  onChange={(e) => handleFormChange('importanceLevel', e.target.value as ImportanceLevel)}
                  className="sr-only"
                />
                {importanceLabels[level]}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            注销状态
          </label>
          <div className="flex gap-2">
            {(['active', 'pending', 'cancelled', 'impossible'] as CancellationStatus[]).map((status) => (
              <label
                key={status}
                className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg border cursor-pointer transition-colors text-xs ${
                  formData.cancellationStatus === status
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="cancellationStatus"
                  value={status}
                  checked={formData.cancellationStatus === status}
                  onChange={(e) => handleFormChange('cancellationStatus', e.target.value as CancellationStatus)}
                  className="sr-only"
                />
                {cancellationLabels[status]}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          账号密码
        </label>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="输入账号密码"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
        />
        {passwordInput && (
          <div className="mt-2">
            <PasswordStrengthMeter password={passwordInput} />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          密码提示
        </label>
        <input
          type="text"
          value={formData.passwordHint}
          onChange={(e) => handleFormChange('passwordHint', e.target.value)}
          placeholder="用于帮助记忆密码的提示信息"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            是否开启2FA
          </label>
          <div className="flex items-center gap-2">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
              formData.has2FA
                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <input
                type="radio"
                name="has2FA"
                value="true"
                checked={formData.has2FA === true}
                onChange={() => handleFormChange('has2FA', true)}
                className="sr-only"
              />
              <Shield className="w-4 h-4" />
              已开启
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
              !formData.has2FA
                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <input
                type="radio"
                name="has2FA"
                value="false"
                checked={formData.has2FA === false}
                onChange={() => handleFormChange('has2FA', false)}
                className="sr-only"
              />
              <ShieldOff className="w-4 h-4" />
              未开启
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            上次密码修改时间
          </label>
          <input
            type="date"
            value={formData.lastPasswordChange}
            onChange={(e) => handleFormChange('lastPasswordChange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          密码更换间隔天数
        </label>
        <input
          type="number"
          min="1"
          value={formData.passwordChangeInterval}
          onChange={(e) => handleFormChange('passwordChangeInterval', parseInt(e.target.value) || 90)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Mail className="w-4 h-4 inline mr-1" />
            备用恢复邮箱
          </label>
          <input
            type="email"
            value={formData.recoveryEmail}
            onChange={(e) => handleFormChange('recoveryEmail', e.target.value)}
            placeholder="backup@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Phone className="w-4 h-4 inline mr-1" />
            备用恢复手机
          </label>
          <input
            type="tel"
            value={formData.recoveryPhone}
            onChange={(e) => handleFormChange('recoveryPhone', e.target.value)}
            placeholder="13900139000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          恢复码（逗号分隔）
        </label>
        <textarea
          value={formData.recoveryCodes}
          onChange={(e) => handleFormChange('recoveryCodes', e.target.value)}
          placeholder="ABC123, DEF456, GHI789"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 resize-none"
        />
      </div>
    </div>
  );

  const renderDetailContent = () => {
    if (!selectedAccount) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            {selectedAccount.platformName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedAccount.platformName}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={importanceVariants[selectedAccount.importanceLevel]} size="sm">
                {importanceLabels[selectedAccount.importanceLevel]}
              </Badge>
              <Badge variant={cancellationVariants[selectedAccount.cancellationStatus]} size="sm">
                {cancellationLabels[selectedAccount.cancellationStatus]}
              </Badge>
              {selectedAccount.has2FA ? (
                <Badge variant="success" size="sm">
                  <Shield className="w-3 h-3 mr-1" />
                  2FA
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  <ShieldOff className="w-3 h-3 mr-1" />
                  无2FA
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">注册邮箱</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAccount.email || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">注册手机</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAccount.phone || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">注册时间</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAccount.registerDate}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">用途</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAccount.purpose || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">密码提示</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAccount.passwordHint || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">上次密码修改</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(selectedAccount.lastPasswordChange).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">密码更换间隔</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAccount.passwordChangeInterval} 天
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">备用恢复邮箱</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAccount.recoveryEmail || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">备用恢复手机</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAccount.recoveryPhone || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">恢复码数量</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAccount.recoveryCodes.length} 个
            </p>
          </div>
        </div>

        {selectedAccount.recoveryCodes.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">恢复码列表</p>
            <div className="flex flex-wrap gap-2">
              {selectedAccount.recoveryCodes.map((code, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-700 dark:text-gray-300"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">创建时间</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(selectedAccount.createdAt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-1">更新时间</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(selectedAccount.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">账号管理</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              共 {accounts.length} 个账号，当前显示 {filteredAccounts.length} 个
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            添加账号
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索平台名称、邮箱、用途..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Filter className="w-5 h-5" />
                筛选
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    重要程度
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setImportanceFilter('all')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        importanceFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      全部
                    </button>
                    {(['core', 'daily', 'temporary'] as ImportanceLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setImportanceFilter(level)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          importanceFilter === level
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {importanceLabels[level]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    注销状态
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setCancellationFilter('all')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        cancellationFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      全部
                    </button>
                    {(['active', 'pending', 'cancelled', 'impossible'] as CancellationStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => setCancellationFilter(status)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          cancellationFilter === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {cancellationLabels[status]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {filteredAccounts.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Inbox}
                title="暂无账号数据"
                description={
                  searchKeyword || importanceFilter !== 'all' || cancellationFilter !== 'all'
                    ? '没有找到匹配的账号，请尝试调整搜索或筛选条件'
                    : '点击上方"添加账号"按钮开始管理您的账号'
                }
                action={
                  !searchKeyword && importanceFilter === 'all' && cancellationFilter === 'all' ? (
                    <button
                      onClick={handleAddClick}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      添加第一个账号
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      平台名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      邮箱/手机
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      重要程度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      注销状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      2FA状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      注册时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredAccounts.map((account) => (
                    <tr
                      key={account.id}
                      onClick={() => handleRowClick(account)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {account.platformName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {account.platformName}
                            </div>
                            {account.purpose && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {account.purpose}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {account.email || account.phone || '-'}
                        </div>
                        {account.email && account.phone && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {account.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={importanceVariants[account.importanceLevel]}
                          size="sm"
                          dot
                        >
                          {importanceLabels[account.importanceLevel]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={cancellationVariants[account.cancellationStatus]}
                          size="sm"
                          dot
                        >
                          {cancellationLabels[account.cancellationStatus]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {account.has2FA ? (
                          <Badge variant="success" size="sm">
                            <Shield className="w-3 h-3 mr-1" />
                            已开启
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm">
                            <ShieldOff className="w-3 h-3 mr-1" />
                            未开启
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {account.registerDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleEditClick(account, e)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(account, e)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="添加账号"
        className="max-w-2xl"
        footer={
          <>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddSubmit}
              disabled={!isFormValid()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加
            </button>
          </>
        }
      >
        {renderFormFields()}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="编辑账号"
        className="max-w-2xl"
        footer={
          <>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleEditSubmit}
              disabled={!isFormValid()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存
            </button>
          </>
        }
      >
        {renderFormFields()}
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="账号详情"
        className="max-w-2xl"
        footer={
          <>
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              关闭
            </button>
            {selectedAccount && (
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
                  handleEditClick(selectedAccount, fakeEvent);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </button>
            )}
          </>
        }
      >
        {renderDetailContent()}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="确认删除"
        message={`确定要删除账号"${selectedAccount?.platformName}"吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </Layout>
  );
}
