import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  PieChart,
  Shield,
  Plus,
  Building2,
  ArrowRight,
  Landmark,
  PiggyBank,
  FileCheck
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/store/useStore';

type TabType = 'accounts' | 'investments' | 'insurance';

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function Property() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('accounts');
  const { bankAccounts, investments, insurancePolicies } = useStore();

  const tabs = [
    { key: 'accounts', label: '银行账户', icon: CreditCard },
    { key: 'investments', label: '投资档案', icon: PieChart },
    { key: 'insurance', label: '保险单', icon: Shield },
  ];

  const insuranceWithStatus = insurancePolicies.map((policy) => ({
    ...policy,
    daysUntilExpiry: getDaysUntilExpiry(policy.expiryDate),
  }));

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (num >= 10000) {
      return `¥${(num / 10000).toFixed(0)}万`;
    }
    return `¥${amount}`;
  };

  const maskAccountNumber = (number: string) => {
    if (number.length <= 4) return number;
    return number.slice(0, 4) + ' **** ' + number.slice(-4);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">财产文件管理</h1>
            <p className="text-gray-500 mt-1">管理银行账户、投资和保险信息</p>
          </div>
          <button
            onClick={() => {}}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            添加
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">银行账户</p>
                <p className="text-2xl font-bold text-gray-800">{bankAccounts.length} 个</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">投资档案</p>
                <p className="text-2xl font-bold text-gray-800">{investments.length} 个</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">保险单</p>
                <p className="text-2xl font-bold text-gray-800">{insurancePolicies.length} 个</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabType)}
                    className={`flex items-center px-6 py-4 font-medium transition-colors border-b-2 ${
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'accounts' && (
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        <Landmark className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{account.bankName}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {maskAccountNumber(account.accountNumber)}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {account.branch} · {account.accountType}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
                {bankAccounts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无银行账户</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'investments' && (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div
                    key={investment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg mr-4">
                        <PiggyBank className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{investment.institution}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          账号：{maskAccountNumber(investment.accountNumber)}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">{investment.accountType}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
                {investments.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无投资档案</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'insurance' && (
              <div className="space-y-4">
                {insuranceWithStatus.map((policy) => {
                  const statusClass =
                    policy.daysUntilExpiry < 0
                      ? 'border-l-4 border-l-red-500'
                      : policy.daysUntilExpiry <= 30
                      ? 'border-l-4 border-l-orange-500'
                      : '';

                  const statusText =
                    policy.daysUntilExpiry < 0
                      ? '已过期'
                      : policy.daysUntilExpiry <= 30
                      ? `即将到期 (${policy.daysUntilExpiry}天)`
                      : `有效期内`;

                  const statusColor =
                    policy.daysUntilExpiry < 0
                      ? 'text-red-600 bg-red-50'
                      : policy.daysUntilExpiry <= 30
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-green-600 bg-green-50';

                  return (
                    <div
                      key={policy.id}
                      onClick={() => navigate(`/property/insurance/${policy.id}`)}
                      className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer ${statusClass}`}
                    >
                      <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg mr-4">
                          <FileCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-800">{policy.insuranceCompany}</h3>
                            <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                              {statusText}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{policy.policyType}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            保额：{formatCurrency(policy.coverageAmount)} · 到期：{policy.expiryDate}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  );
                })}
                {insuranceWithStatus.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无保险单</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
