import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Scale,
  Users,
  Home,
  AlertTriangle,
  CreditCard,
  Shield,
  PieChart,
  Clock,
  TrendingUp,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/store/useStore';

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    documents,
    legalDocuments,
    familyRecords,
    insurancePolicies,
    bankAccounts,
    investments,
    emergencyContacts,
    familyMembers
  } = useStore();

  const expirySummary = useMemo(() => {
    let in7Days = 0;
    let in30Days = 0;
    let in90Days = 0;
    let expired = 0;

    const allExpiringItems = [
      ...documents.map((d) => ({ expiryDate: d.expiryDate })),
      ...legalDocuments.map((d) => ({ expiryDate: d.expiryDate })),
      ...insurancePolicies.map((p) => ({ expiryDate: p.expiryDate })),
      ...familyRecords.filter((r) => r.expiryDate).map((r) => ({ expiryDate: r.expiryDate })),
    ];

    allExpiringItems.forEach((item) => {
      const days = getDaysUntilExpiry(item.expiryDate);
      if (days < 0) {
        expired++;
      } else if (days <= 7) {
        in7Days++;
      } else if (days <= 30) {
        in30Days++;
      } else if (days <= 90) {
        in90Days++;
      }
    });

    return { in7Days, in30Days, in90Days, expired };
  }, [documents, legalDocuments, insurancePolicies, familyRecords]);

  const quickAccessItems = [
    { path: '/documents', icon: FileText, label: '证件管理', color: 'bg-blue-500' },
    { path: '/legal', icon: Scale, label: '法律文件', color: 'bg-purple-500' },
    { path: '/family', icon: Users, label: '家庭文件', color: 'bg-green-500' },
    { path: '/property', icon: Home, label: '财产文件', color: 'bg-orange-500' },
    { path: '/emergency', icon: AlertTriangle, label: '紧急信息', color: 'bg-red-500' },
  ];

  const stats = [
    { label: '证件数量', value: documents.length, icon: FileText, color: 'text-blue-500' },
    { label: '法律文件', value: legalDocuments.length, icon: Scale, color: 'text-purple-500' },
    { label: '家庭成员', value: familyMembers.length, icon: Users, color: 'text-green-500' },
    { label: '银行账户', value: bankAccounts.length, icon: CreditCard, color: 'text-orange-500' },
    { label: '保险保单', value: insurancePolicies.length, icon: Shield, color: 'text-red-500' },
    { label: '投资账户', value: investments.length, icon: PieChart, color: 'text-indigo-500' },
    { label: '紧急联系人', value: emergencyContacts.length, icon: AlertTriangle, color: 'text-pink-500' },
    { label: '家庭记录', value: familyRecords.length, icon: FileCheck, color: 'text-teal-500' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">仪表板</h1>
          <p className="text-gray-500 mt-2">欢迎回来，查看您的家庭档案概览</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">已过期</p>
                <p className="text-3xl font-bold text-red-700">{expirySummary.expired}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">7天内到期</p>
                <p className="text-3xl font-bold text-orange-700">{expirySummary.in7Days}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-400" />
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">30天内到期</p>
                <p className="text-3xl font-bold text-yellow-700">{expirySummary.in30Days}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-400" />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">90天内到期</p>
                <p className="text-3xl font-bold text-green-700">{expirySummary.in90Days}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">快速入口</h2>
          <div className="grid grid-cols-5 gap-4">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className={`${item.color} p-3 rounded-lg mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">数据统计</h2>
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center p-4 rounded-xl border border-gray-200"
                >
                  <Icon className={`w-8 h-8 mr-4 ${stat.color}`} />
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
