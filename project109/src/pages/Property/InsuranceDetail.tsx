import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  Phone,
  User,
  Calendar,
  FileCheck,
  Clock,
  Building2
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/store/useStore';

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatCurrency(amount: string): string {
  const num = parseFloat(amount.replace(/,/g, ''));
  if (num >= 10000) {
    return (num / 10000).toFixed(0) + '万';
  }
  return amount;
}

export default function InsuranceDetail() {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();
  const { insurancePolicies, familyMembers } = useStore();

  const policy = insurancePolicies.find((p) => p.id === policyId);

  const policyInfo = useMemo(() => {
    if (!policy) return null;
    const daysUntilExpiry = getDaysUntilExpiry(policy.expiryDate);
    
    let status = 'active';
    let statusText = '有效期内';
    let statusColor = 'text-green-600';
    let statusBg = 'bg-green-500';
    
    if (daysUntilExpiry < 0) {
      status = 'expired';
      statusText = '已过期';
      statusColor = 'text-red-600';
      statusBg = 'bg-red-500';
    } else if (daysUntilExpiry <= 30) {
      status = 'warning';
      statusText = `即将到期 (${daysUntilExpiry}天)`;
      statusColor = 'text-orange-600';
      statusBg = 'bg-orange-500';
    }

    const associatedMember = policy.memberId
      ? familyMembers.find((m) => m.id === policy.memberId)
      : null;

    return {
      ...policy,
      daysUntilExpiry,
      status,
      statusText,
      statusColor,
      statusBg,
      associatedMember,
    };
  }, [policy, familyMembers]);

  if (!policyInfo) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">保险单不存在</p>
          <button
            onClick={() => navigate('/property')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            返回财产文件管理
          </button>
        </div>
      </AppLayout>
    );
  }

  const gradientClass =
    policyInfo.status === 'expired'
      ? 'from-gray-400 to-gray-600'
      : policyInfo.status === 'warning'
      ? 'from-orange-400 to-red-500'
      : 'from-blue-500 to-indigo-600';

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/property')}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            返回
          </button>
        </div>

        <div className={`bg-gradient-to-r ${gradientClass} rounded-2xl shadow-xl p-8 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center">
                <Shield className="w-8 h-8 mr-3 opacity-90" />
                <h2 className="text-xl font-semibold opacity-90">{policyInfo.policyType}</h2>
              </div>
              <h1 className="text-3xl font-bold mt-3">{policyInfo.insuranceCompany}</h1>
              <p className="text-white/70 mt-2 font-mono">保单号：{policyInfo.policyNumber}</p>
            </div>
            <div className={`px-4 py-2 rounded-full ${policyInfo.statusBg} bg-opacity-30 backdrop-blur`}>
              <span className="text-sm font-medium">{policyInfo.statusText}</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/70 text-sm">保险金额</p>
            <div className="flex items-end mt-2">
              <span className="text-5xl font-bold">¥{formatCurrency(policyInfo.coverageAmount)}</span>
              <span className="text-lg opacity-70 ml-2 mb-1">元</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm">生效日期</p>
              <p className="text-lg font-medium mt-1">{policyInfo.startDate}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">到期日期</p>
              <p className="text-lg font-medium mt-1">{policyInfo.expiryDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">受益人信息</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">受益人</span>
                <span className="font-medium text-gray-800">{policyInfo.beneficiary}</span>
              </div>
              {policyInfo.associatedMember && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">关联成员</span>
                  <span className="font-medium text-gray-800">{policyInfo.associatedMember.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">报案电话</h3>
            </div>
            <a
              href={`tel:${policyInfo.emergencyPhone}`}
              className="flex items-center justify-center w-full py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              <Phone className="w-6 h-6 mr-2" />
              <span className="text-xl font-bold">{policyInfo.emergencyPhone}</span>
            </a>
            <p className="text-center text-sm text-gray-500 mt-3">
              遇紧急情况请立即拨打报案电话
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <FileCheck className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">详细信息</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <Building2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">保险公司</p>
                <p className="font-medium text-gray-800">{policyInfo.insuranceCompany}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FileCheck className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">保险类型</p>
                <p className="font-medium text-gray-800">{policyInfo.policyType}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">保障期限</p>
                <p className="font-medium text-gray-800">
                  {policyInfo.startDate} 至 {policyInfo.expiryDate}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">剩余天数</p>
                <p className={`font-medium ${policyInfo.statusColor}`}>
                  {policyInfo.daysUntilExpiry > 0
                    ? `${policyInfo.daysUntilExpiry} 天`
                    : '已过期'}
                </p>
              </div>
            </div>
          </div>
          {policyInfo.notes && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">备注</p>
              <p className="text-gray-700 mt-2">{policyInfo.notes}</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
