import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Layout, Modal, ConfirmDialog, Badge, EmptyState, StatCard } from '@/components';
import type { DigitalAsset, AssetType } from '@/types';
import {
  Package,
  Gamepad2,
  Music,
  BookOpen,
  Wallet,
  CreditCard,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  DollarSign,
  CalendarClock,
  Bell,
  CheckCircle,
  XCircle,
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
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

type TabType = 'copyright' | 'balance' | 'subscription';
type FilterType = 'all' | 'software' | 'game' | 'music' | 'ebook';

interface FormData {
  type: AssetType;
  name: string;
  platform: string;
  bindingAccountId: string;
  purchaseDate: string;
  price: string;
  balance: string;
  currency: string;
  renewalDate: string;
  autoRenewal: boolean;
  annualFee: string;
  notes: string;
}

const initialFormData: FormData = {
  type: 'software',
  name: '',
  platform: '',
  bindingAccountId: '',
  purchaseDate: '',
  price: '',
  balance: '',
  currency: 'CNY',
  renewalDate: '',
  autoRenewal: false,
  annualFee: '',
  notes: '',
};

const typeIcons: Record<AssetType, typeof Package> = {
  software: Package,
  game: Gamepad2,
  music: Music,
  ebook: BookOpen,
  balance: Wallet,
  subscription: CreditCard,
};

const typeLabels: Record<AssetType, string> = {
  software: '软件',
  game: '游戏',
  music: '音乐',
  ebook: '电子书',
  balance: '储值余额',
  subscription: '订阅服务',
};

const typeGradients: Record<AssetType, string> = {
  software: 'from-blue-500 to-cyan-500',
  game: 'from-purple-500 to-pink-500',
  music: 'from-green-500 to-emerald-500',
  ebook: 'from-orange-500 to-amber-500',
  balance: 'from-indigo-500 to-blue-500',
  subscription: 'from-rose-500 to-red-500',
};

const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Assets() {
  const { assets, accounts, addAsset, updateAsset, deleteAsset, getTotalAssetValue } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('copyright');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DigitalAsset | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; assetId: string | null }>({
    isOpen: false,
    assetId: null,
  });
  const [animatedStats, setAnimatedStats] = useState({
    totalValue: 0,
    annualFees: 0,
    activeSubscriptions: 0,
    totalBalance: 0,
  });

  const copyrightAssets = useMemo(
    () => assets.filter((a) => ['software', 'game', 'music', 'ebook'].includes(a.type)),
    [assets]
  );

  const balanceAssets = useMemo(() => assets.filter((a) => a.type === 'balance'), [assets]);
  const subscriptionAssets = useMemo(() => assets.filter((a) => a.type === 'subscription'), [assets]);

  const filteredCopyrightAssets = useMemo(() => {
    if (filterType === 'all') return copyrightAssets;
    return copyrightAssets.filter((a) => a.type === filterType);
  }, [copyrightAssets, filterType]);

  const totalAnnualFees = useMemo(
    () => subscriptionAssets.reduce((sum, s) => sum + (s.annualFee || 0), 0),
    [subscriptionAssets]
  );

  const activeSubscriptions = useMemo(
    () => subscriptionAssets.filter((s) => s.autoRenewal).length,
    [subscriptionAssets]
  );

  const totalBalance = useMemo(
    () => balanceAssets.reduce((sum, b) => sum + (b.balance || 0), 0),
    [balanceAssets]
  );

  const totalAssetValue = useMemo(() => getTotalAssetValue(), [getTotalAssetValue]);

  const pieChartData = useMemo(
    () =>
      balanceAssets.map((a) => ({
        name: a.name,
        value: a.balance || 0,
      })),
    [balanceAssets]
  );

  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return subscriptionAssets
      .filter((s) => {
        if (!s.renewalDate) return false;
        const renewalDate = new Date(s.renewalDate);
        return renewalDate >= now && renewalDate <= thirtyDaysLater;
      })
      .sort((a, b) => {
        const dateA = new Date(a.renewalDate || '').getTime();
        const dateB = new Date(b.renewalDate || '').getTime();
        return dateA - dateB;
      });
  }, [subscriptionAssets]);

  const calendarData = useMemo(() => {
    const data: Record<number, DigitalAsset[]> = {};
    subscriptionAssets.forEach((s) => {
      if (s.renewalDate) {
        const date = new Date(s.renewalDate);
        const day = date.getDate();
        if (!data[day]) data[day] = [];
        data[day].push(s);
      }
    });
    return data;
  }, [subscriptionAssets]);

  const balanceHistory = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        value: totalBalance + Math.random() * 500 - 250,
      };
    });
    return last30Days;
  }, [totalBalance]);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        totalValue: Math.round(totalAssetValue * easeProgress),
        annualFees: Math.round(totalAnnualFees * easeProgress),
        activeSubscriptions: Math.round(activeSubscriptions * easeProgress),
        totalBalance: Math.round(totalBalance * easeProgress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [totalAssetValue, totalAnnualFees, activeSubscriptions, totalBalance]);

  const getDaysUntilRenewal = (renewalDate?: string) => {
    if (!renewalDate) return null;
    const now = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleOpenModal = (asset?: DigitalAsset) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        type: asset.type,
        name: asset.name,
        platform: asset.platform,
        bindingAccountId: asset.bindingAccountId || '',
        purchaseDate: asset.purchaseDate || '',
        price: asset.price?.toString() || '',
        balance: asset.balance?.toString() || '',
        currency: asset.currency || 'CNY',
        renewalDate: asset.renewalDate || '',
        autoRenewal: asset.autoRenewal,
        annualFee: asset.annualFee?.toString() || '',
        notes: asset.notes,
      });
    } else {
      setEditingAsset(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
    setFormData(initialFormData);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const assetData: Omit<DigitalAsset, 'id'> = {
      type: formData.type,
      name: formData.name.trim(),
      platform: formData.platform.trim(),
      bindingAccountId: formData.bindingAccountId || undefined,
      purchaseDate: formData.purchaseDate || undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      balance: formData.balance ? parseFloat(formData.balance) : undefined,
      currency: formData.currency || undefined,
      renewalDate: formData.renewalDate || undefined,
      autoRenewal: formData.autoRenewal,
      annualFee: formData.annualFee ? parseFloat(formData.annualFee) : undefined,
      notes: formData.notes.trim(),
    };

    if (editingAsset) {
      updateAsset(editingAsset.id, assetData);
    } else {
      addAsset(assetData);
    }

    handleCloseModal();
  };

  const handleDelete = (assetId: string) => {
    setDeleteConfirm({ isOpen: true, assetId });
  };

  const confirmDelete = () => {
    if (deleteConfirm.assetId) {
      deleteAsset(deleteConfirm.assetId);
    }
    setDeleteConfirm({ isOpen: false, assetId: null });
  };

  const handleUpdateBalance = (asset: DigitalAsset, newBalance: number) => {
    updateAsset(asset.id, { balance: newBalance });
  };

  const getBindingAccountName = (accountId?: string) => {
    if (!accountId) return '未绑定';
    const account = accounts.find((a) => a.id === accountId);
    return account ? account.platformName : '未知账号';
  };

  const renderCopyrightCard = (asset: DigitalAsset) => {
    const Icon = typeIcons[asset.type];
    const gradient = typeGradients[asset.type];
    const TypeIcon = typeIcons[asset.type];

    return (
      <div
        key={asset.id}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden group"
      >
        <div className={`h-2 bg-gradient-to-r ${gradient}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleOpenModal(asset)}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(asset.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{asset.name}</h3>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="info" size="sm">
              <TypeIcon className="w-3 h-3 mr-1" />
              {typeLabels[asset.type]}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">{asset.platform}</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">购买日期</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {asset.purchaseDate || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">价格</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {asset.price !== undefined ? `¥${asset.price.toFixed(2)}` : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">绑定账号</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {getBindingAccountName(asset.bindingAccountId)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBalanceItem = (asset: DigitalAsset) => {
    const daysUntil = getDaysUntilRenewal(asset.renewalDate);
    const [isEditing, setIsEditing] = useState(false);
    const [newBalance, setNewBalance] = useState(asset.balance?.toString() || '0');

    const handleSave = () => {
      handleUpdateBalance(asset, parseFloat(newBalance) || 0);
      setIsEditing(false);
    };

    return (
      <div
        key={asset.id}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeGradients.balance} flex items-center justify-center`}>
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{asset.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{asset.platform}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                绑定: {getBindingAccountName(asset.bindingAccountId)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-right"
                />
                <button
                  onClick={handleSave}
                  className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewBalance(asset.balance?.toString() || '0');
                  }}
                  className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ¥{asset.balance?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{asset.currency || 'CNY'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(asset)}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSubscriptionCard = (asset: DigitalAsset) => {
    const daysUntil = getDaysUntilRenewal(asset.renewalDate);
    const isUrgent = daysUntil !== null && daysUntil <= 7;
    const isOverdue = daysUntil !== null && daysUntil < 0;

    return (
      <div
        key={asset.id}
        className={cn(
          'bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-5 transition-all',
          isOverdue
            ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10'
            : isUrgent
            ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/10'
            : 'border-gray-200 dark:border-gray-800 hover:shadow-md'
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeGradients.subscription} flex items-center justify-center`}>
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{asset.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{asset.platform}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleOpenModal(asset)}
              className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(asset.id)}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">年费</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ¥{asset.annualFee?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">续费日期</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {asset.renewalDate || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">自动续费</p>
            <Badge variant={asset.autoRenewal ? 'success' : 'default'} size="sm" dot>
              {asset.autoRenewal ? '已开启' : '已关闭'}
            </Badge>
          </div>
        </div>

        {daysUntil !== null && (
          <div
            className={cn(
              'flex items-center justify-between p-3 rounded-lg',
              isOverdue
                ? 'bg-red-100 dark:bg-red-900/30'
                : isUrgent
                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                : 'bg-gray-50 dark:bg-gray-800'
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarClock
                className={cn(
                  'w-5 h-5',
                  isOverdue
                    ? 'text-red-600 dark:text-red-400'
                    : isUrgent
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  isOverdue
                    ? 'text-red-700 dark:text-red-300'
                    : isUrgent
                    ? 'text-yellow-700 dark:text-yellow-300'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                {isOverdue
                  ? `已过期 ${Math.abs(daysUntil)} 天`
                  : daysUntil === 0
                  ? '今天到期'
                  : `距离续费还有 ${daysUntil} 天`}
              </span>
            </div>
            {isUrgent && !isOverdue && (
              <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-pulse" />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          {year}年{month + 1}月 续费日历
        </h3>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }
            const hasRenewal = calendarData[day] && calendarData[day].length > 0;
            const isToday = day === today;
            return (
              <div
                key={day}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center text-sm relative',
                  isToday
                    ? 'bg-blue-600 text-white font-bold'
                    : hasRenewal
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                title={hasRenewal ? calendarData[day].map((a) => a.name).join(', ') : undefined}
              >
                {day}
                {hasRenewal && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {calendarData[day].length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderForm = () => {
    const typeOptions: AssetType[] = ['software', 'game', 'music', 'ebook', 'balance', 'subscription'];
    const showPurchaseFields = ['software', 'game', 'music', 'ebook', 'subscription'].includes(formData.type);
    const showBalanceFields = formData.type === 'balance';
    const showSubscriptionFields = formData.type === 'subscription';

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            资产类型
          </label>
          <div className="grid grid-cols-3 gap-2">
            {typeOptions.map((type) => {
              const Icon = typeIcons[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                    formData.type === type
                      ? `border-blue-500 bg-blue-50 dark:bg-blue-900/20`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      formData.type === type ? 'text-blue-600' : 'text-gray-400'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs',
                      formData.type === type
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {typeLabels[type]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              平台
            </label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入平台"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            绑定账号
          </label>
          <select
            value={formData.bindingAccountId}
            onChange={(e) => setFormData({ ...formData, bindingAccountId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择绑定账号（可选）</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.platformName} - {account.email || account.phone}
              </option>
            ))}
          </select>
        </div>

        {showPurchaseFields && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                购买日期
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                价格 (¥)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        {showBalanceFields && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                余额 (¥)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                货币
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="CNY">人民币 (CNY)</option>
                <option value="USD">美元 (USD)</option>
                <option value="EUR">欧元 (EUR)</option>
                <option value="JPY">日元 (JPY)</option>
                <option value="GBP">英镑 (GBP)</option>
              </select>
            </div>
          </div>
        )}

        {showSubscriptionFields && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  续费日期
                </label>
                <input
                  type="date"
                  value={formData.renewalDate}
                  onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  年费 (¥)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.annualFee}
                  onChange={(e) => setFormData({ ...formData, annualFee: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">自动续费</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  开启后将在续费日期自动扣款
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, autoRenewal: !formData.autoRenewal })}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  formData.autoRenewal ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    formData.autoRenewal ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            备注
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="请输入备注信息"
          />
        </div>
      </div>
    );
  };

  const tabs: { key: TabType; label: string; icon: typeof Package }[] = [
    { key: 'copyright', label: '版权资产', icon: Package },
    { key: 'balance', label: '储值余额', icon: Wallet },
    { key: 'subscription', label: '订阅管理', icon: CreditCard },
  ];

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'software', label: '软件' },
    { key: 'game', label: '游戏' },
    { key: 'music', label: '音乐' },
    { key: 'ebook', label: '电子书' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">资产清单管理</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              管理您的数字版权资产、储值余额和订阅服务
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加资产
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总资产价值"
            value={animatedStats.totalValue}
            icon={DollarSign}
            variant="primary"
            prefix="¥"
          />
          <StatCard
            title="订阅年费总额"
            value={animatedStats.annualFees}
            icon={CreditCard}
            variant="danger"
            prefix="¥"
          />
          <StatCard
            title="活跃订阅数"
            value={animatedStats.activeSubscriptions}
            icon={CalendarClock}
            variant="success"
          />
          <StatCard
            title="储值总余额"
            value={animatedStats.totalBalance}
            icon={Wallet}
            variant="warning"
            prefix="¥"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'copyright' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setFilterType(option.key)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        filterType === option.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {filteredCopyrightAssets.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="暂无版权资产"
                    description="点击右上角按钮添加您的第一个数字版权资产"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCopyrightAssets.map(renderCopyrightCard)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'balance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      余额列表
                    </h3>
                    {balanceAssets.length === 0 ? (
                      <EmptyState
                        icon={Wallet}
                        title="暂无储值余额"
                        description="点击右上角按钮添加您的第一个储值账户"
                      />
                    ) : (
                      <div className="space-y-4">
                        {balanceAssets.map(renderBalanceItem)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-blue-600" />
                        余额分布
                      </h3>
                      {pieChartData.length > 0 ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {pieChartData.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={chartColors[index % chartColors.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: number) => [`¥${value.toFixed(2)}`, '余额']}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-wrap justify-center gap-3 mt-4">
                            {pieChartData.map((item, index) => (
                              <div key={item.name} className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: chartColors[index % chartColors.length],
                                  }}
                                />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {item.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                          暂无数据
                        </div>
                      )}
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <AreaChart className="w-5 h-5 text-blue-600" />
                        余额趋势
                      </h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={balanceHistory}>
                            <defs>
                              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                            <Tooltip
                              formatter={(value: number) => [`¥${value.toFixed(2)}`, '总余额']}
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              fill="url(#balanceGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                {upcomingRenewals.length > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      30天内到期提醒
                    </h3>
                    <div className="space-y-2">
                      {upcomingRenewals.map((asset) => {
                        const daysUntil = getDaysUntilRenewal(asset.renewalDate);
                        return (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${typeGradients.subscription} flex items-center justify-center`}>
                                <CreditCard className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {asset.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {asset.renewalDate} · ¥{asset.annualFee?.toFixed(2)}/年
                                </p>
                              </div>
                            </div>
                            <Badge variant={daysUntil !== null && daysUntil <= 7 ? 'danger' : 'warning'}>
                              {daysUntil === 0 ? '今天到期' : `还有 ${daysUntil} 天`}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      订阅列表
                    </h3>
                    {subscriptionAssets.length === 0 ? (
                      <EmptyState
                        icon={CreditCard}
                        title="暂无订阅服务"
                        description="点击右上角按钮添加您的第一个订阅服务"
                      />
                    ) : (
                      <div className="space-y-4">
                        {subscriptionAssets.map(renderSubscriptionCard)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    {renderCalendar()}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-blue-600" />
                        年费支出统计
                      </h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={subscriptionAssets.map((s) => ({
                              name: s.name.length > 6 ? s.name.slice(0, 6) + '...' : s.name,
                              fee: s.annualFee || 0,
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                            <Tooltip
                              formatter={(value: number) => [`¥${value.toFixed(2)}`, '年费']}
                            />
                            <Bar dataKey="fee" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAsset ? '编辑资产' : '添加资产'}
        className="max-w-xl"
        footer={
          <>
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingAsset ? '保存修改' : '添加资产'}
            </button>
          </>
        }
      >
        {renderForm()}
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, assetId: null })}
        onConfirm={confirmDelete}
        title="确认删除"
        message="确定要删除这个资产吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </Layout>
  );
}
