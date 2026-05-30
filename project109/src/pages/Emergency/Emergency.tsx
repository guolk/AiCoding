import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  FileText,
  Scale,
  Home,
  Shield,
  CreditCard,
  Users,
  Search,
  FileDown,
  Copy,
  Check,
  Phone,
  User,
  Star
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/store/useStore';

type UrgencyLevel = 'urgent' | 'important' | 'normal';

interface EmergencyItem {
  id: string;
  type: string;
  title: string;
  urgency: UrgencyLevel;
  details: string;
}

export default function Emergency() {
  const { documents, legalDocuments, insurancePolicies, bankAccounts, emergencyContacts, familyRecords } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const urgentPackageItems: EmergencyItem[] = useMemo(() => {
    const items: EmergencyItem[] = [];

    documents.forEach((doc) => {
      if (doc.type === 'id_card' || doc.type === 'passport' || doc.type === 'driver_license') {
        items.push({
          id: `doc-${doc.id}`,
          type: '证件',
          title: `${doc.name}的${doc.type === 'id_card' ? '身份证' : doc.type === 'passport' ? '护照' : '驾驶证'}`,
          urgency: 'urgent',
          details: `号码: ${doc.number} | 有效期: ${doc.expiryDate}`
        });
      }
    });

    familyRecords.forEach((record) => {
      if (record.type === 'property_certificate' || record.type === 'vehicle_registration') {
        items.push({
          id: `record-${record.id}`,
          type: '财产',
          title: record.title,
          urgency: 'important',
          details: `发证机构: ${record.issuingAuthority}`
        });
      }
    });

    legalDocuments.forEach((legal) => {
      if (legal.type === 'property_contract') {
        items.push({
          id: `legal-${legal.id}`,
          type: '法律',
          title: legal.title,
          urgency: 'important',
          details: `签订日期: ${legal.signDate}`
        });
      }
    });

    insurancePolicies.forEach((policy) => {
      items.push({
        id: `insurance-${policy.id}`,
        type: '保险',
        title: `${policy.policyType} - ${policy.insuranceCompany}`,
        urgency: 'important',
        details: `保单号: ${policy.policyNumber} | 紧急电话: ${policy.emergencyPhone}`
      });
    });

    bankAccounts.forEach((account) => {
      if (account.accountType === '储蓄卡') {
        items.push({
          id: `bank-${account.id}`,
          type: '银行',
          title: `${account.bankName} - ${account.accountType}`,
          urgency: 'normal',
          details: `账号: ${account.accountNumber} | 开户行: ${account.branch}`
        });
      }
    });

    return items;
  }, [documents, legalDocuments, insurancePolicies, bankAccounts, familyRecords]);

  const urgentItems = urgentPackageItems.filter((item) => item.urgency === 'urgent');
  const importantItems = urgentPackageItems.filter((item) => item.urgency === 'important');
  const normalItems = urgentPackageItems.filter((item) => item.urgency === 'normal');

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return urgentPackageItems;
    }
    const term = searchTerm.toLowerCase();
    return urgentPackageItems.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.details.toLowerCase().includes(term) ||
        item.type.toLowerCase().includes(term)
    );
  }, [urgentPackageItems, searchTerm]);

  const primaryContacts = emergencyContacts.filter((c) => c.priority <= 2);
  const secondaryContacts = emergencyContacts.filter((c) => c.priority > 2);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleExportEmergencyPackage = () => {
    const exportData = {
      emergencyPackage: urgentPackageItems,
      emergencyContacts: emergencyContacts,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency-package-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'important':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getUrgencyLabel = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'urgent':
        return '紧急';
      case 'important':
        return '重要';
      case 'normal':
        return '一般';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '证件':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case '法律':
        return <Scale className="w-5 h-5 text-purple-600" />;
      case '财产':
        return <Home className="w-5 h-5 text-green-600" />;
      case '保险':
        return <Shield className="w-5 h-5 text-red-600" />;
      case '银行':
        return <CreditCard className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const renderItemsSection = (title: string, items: EmergencyItem[], urgency: UrgencyLevel) => {
    if (items.length === 0) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className={`w-6 h-6 mr-2 ${urgency === 'urgent' ? 'text-red-500' : urgency === 'important' ? 'text-orange-500' : 'text-yellow-500'}`} />
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <span className={`ml-3 px-3 py-1 text-xs font-medium rounded-full border ${getUrgencyBadge(urgency)}`}>
            {getUrgencyLabel(urgency)}
          </span>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${
                urgency === 'urgent'
                  ? 'border-red-200 bg-red-50/50 hover:bg-red-50'
                  : urgency === 'important'
                  ? 'border-orange-200 bg-orange-50/50 hover:bg-orange-50'
                  : 'border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50'
              } transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 mr-2">{item.type}</span>
                      <h3 className="text-base font-semibold text-gray-800">{item.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContactCard = (contact: typeof emergencyContacts[0], isPrimary: boolean) => (
    <div
      key={contact.id}
      className={`p-4 rounded-lg border ${
        isPrimary ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`p-3 rounded-lg ${isPrimary ? 'bg-red-100' : 'bg-gray-100'} mr-4`}>
            <User className={`w-6 h-6 ${isPrimary ? 'text-red-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-800">{contact.name}</h3>
              {isPrimary && (
                <Star className="w-4 h-4 text-yellow-500 ml-2 fill-yellow-500" />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{contact.relationship}</p>
            <div className="flex items-center mt-2">
              <Phone className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">{contact.phone}</span>
            </div>
            {contact.address && (
              <p className="text-xs text-gray-500 mt-2">{contact.address}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => handleCopy(contact.phone, contact.id)}
          className={`p-2 rounded-lg transition-colors ${
            copiedId === contact.id
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          title="复制电话号码"
        >
          {copiedId === contact.id ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">紧急信息</h1>
            <p className="text-gray-500 mt-2">快速访问您的紧急包和联系人信息</p>
          </div>
          <button
            onClick={handleExportEmergencyPackage}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <FileDown className="w-5 h-5 mr-2" />
            导出紧急包
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-300 border-2 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-3 rounded-lg mr-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-700">紧急包</h2>
              <p className="text-sm text-red-600">包含所有重要证件和文件信息，建议定期导出备份</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="快速搜索所有紧急信息..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>

          {searchTerm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                找到 <span className="font-semibold text-gray-800">{filteredItems.length}</span> 条匹配结果
              </p>
              {filteredItems.length > 0 ? (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full mr-2 border ${getUrgencyBadge(item.urgency)}`}>
                            {getUrgencyLabel(item.urgency)}
                          </span>
                          <span className="text-sm font-medium text-gray-500 mr-2">{item.type}</span>
                          <span className="font-semibold text-gray-800">{item.title}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Search className="w-8 h-8 mr-3 text-gray-300" />
                  <span>没有找到匹配的信息</span>
                </div>
              )}
            </div>
          )}
        </div>

        {!searchTerm && (
          <>
            {renderItemsSection('紧急文件', urgentItems, 'urgent')}
            {renderItemsSection('重要文件', importantItems, 'important')}
            {renderItemsSection('一般信息', normalItems, 'normal')}
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <Star className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">优先联系人</h2>
            </div>
            {primaryContacts.length > 0 ? (
              <div className="space-y-4">
                {primaryContacts.map((contact) => renderContactCard(contact, true))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Users className="w-8 h-8 mr-3 text-gray-300" />
                <span>暂无优先联系人</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">次要联系人</h2>
            </div>
            {secondaryContacts.length > 0 ? (
              <div className="space-y-4">
                {secondaryContacts.map((contact) => renderContactCard(contact, false))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Users className="w-8 h-8 mr-3 text-gray-300" />
                <span>暂无次要联系人</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
