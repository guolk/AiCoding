import { useState } from 'react';
import {
  User,
  Bell,
  Database,
  Save,
  RefreshCw,
  AlertTriangle,
  FileDown
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/store/useStore';
import { getStorageItem, STORAGE_KEYS, clearAllStorage } from '@/utils/storageUtils';

export default function Settings() {
  const { user, settings, updateSettings, initializeMockData } = useStore();
  const [defaultReminderDays, setDefaultReminderDays] = useState(settings.defaultReminderDays);
  const [notifyOnWarning, setNotifyOnWarning] = useState(settings.notifyOnWarning);
  const [notifyOnDanger, setNotifyOnDanger] = useState(settings.notifyOnDanger);
  const [saved, setSaved] = useState(false);

  const handleSaveReminderSettings = () => {
    updateSettings({
      defaultReminderDays,
      notifyOnWarning,
      notifyOnDanger,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('确定要重置所有数据吗？此操作不可恢复。')) {
      clearAllStorage();
      initializeMockData();
    }
  };

  const handleExportData = () => {
    const data = {
      user: getStorageItem(STORAGE_KEYS.USER, null),
      documents: getStorageItem(STORAGE_KEYS.DOCUMENTS, []),
      legalDocuments: getStorageItem(STORAGE_KEYS.LEGAL_DOCUMENTS, []),
      familyMembers: getStorageItem(STORAGE_KEYS.FAMILY_MEMBERS, []),
      familyRecords: getStorageItem(STORAGE_KEYS.FAMILY_RECORDS, []),
      bankAccounts: getStorageItem(STORAGE_KEYS.BANK_ACCOUNTS, []),
      insurancePolicies: getStorageItem(STORAGE_KEYS.INSURANCE_POLICIES, []),
      investments: getStorageItem(STORAGE_KEYS.INVESTMENTS, []),
      emergencyContacts: getStorageItem(STORAGE_KEYS.EMERGENCY_CONTACTS, []),
      settings: getStorageItem(STORAGE_KEYS.SETTINGS, {
        defaultReminderDays: 90,
        notifyOnWarning: true,
        notifyOnDanger: true,
      }),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-archive-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">设置</h1>
          <p className="text-gray-500 mt-2">管理您的账户和应用设置</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">账户设置</h2>
              <p className="text-sm text-gray-500">查看和管理您的账户信息</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮箱地址</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-yellow-100 p-3 rounded-lg mr-4">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">提醒偏好设置</h2>
              <p className="text-sm text-gray-500">配置到期提醒和通知设置</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">默认提醒天数</label>
              <select
                value={defaultReminderDays}
                onChange={(e) => setDefaultReminderDays(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value={30}>30 天</option>
                <option value={60}>60 天</option>
                <option value={90}>90 天</option>
                <option value={180}>180 天</option>
                <option value={365}>365 天</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">警告状态提醒</p>
                <p className="text-xs text-gray-500">当证件到期前 30-90 天时发送提醒</p>
              </div>
              <button
                onClick={() => setNotifyOnWarning(!notifyOnWarning)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifyOnWarning ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifyOnWarning ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">紧急状态提醒</p>
                <p className="text-xs text-gray-500">当证件到期前 30 天内时发送提醒</p>
              </div>
              <button
                onClick={() => setNotifyOnDanger(!notifyOnDanger)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifyOnDanger ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifyOnDanger ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleSaveReminderSettings}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <Save className="w-5 h-5 mr-2" />
              {saved ? '已保存' : '保存设置'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">数据管理</h2>
              <p className="text-sm text-gray-500">导出备份和管理您的数据</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">导出数据</p>
                <p className="text-xs text-gray-500">将所有数据导出为 JSON 文件备份</p>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <FileDown className="w-4 h-4 mr-2" />
                导出
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="text-sm font-medium text-red-700">重置数据</p>
                <p className="text-xs text-red-600">清除所有数据并恢复为默认示例数据</p>
              </div>
              <button
                onClick={handleResetData}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重置
              </button>
            </div>

            <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-700">数据存储说明</p>
                <p className="text-xs text-yellow-600">
                  所有数据都存储在浏览器的本地存储中。导出数据以确保数据安全。
                  清除浏览器缓存可能会导致数据丢失。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
