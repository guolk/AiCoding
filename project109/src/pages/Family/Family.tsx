import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck,
  FileText,
  Plus,
  ChevronRight,
  User,
  GraduationCap,
  Home,
  Car,
  Shield,
  FileSignature,
  FileKey
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/store/useStore';

type TabType = 'members' | 'records' | 'legal';

const familyRecordTypeConfig = {
  property_certificate: { label: '房产证', icon: Home, color: 'bg-blue-100 text-blue-600' },
  vehicle_registration: { label: '车辆登记证', icon: Car, color: 'bg-green-100 text-green-600' },
  education_certificate: { label: '学历证书', icon: GraduationCap, color: 'bg-purple-100 text-purple-600' },
  will: { label: '遗嘱', icon: FileSignature, color: 'bg-red-100 text-red-600' },
  power_of_attorney: { label: '授权书', icon: FileKey, color: 'bg-orange-100 text-orange-600' },
  other: { label: '其他', icon: FileText, color: 'bg-gray-100 text-gray-600' },
};

export default function Family() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const { familyMembers, familyRecords, documents } = useStore();

  const getMemberDocumentCount = (memberId: string) => {
    return documents.filter((d) => d.memberId === memberId).length;
  };

  const recordsByType = familyRecords.reduce((acc, record) => {
    const type = record.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(record);
    return acc;
  }, {} as Record<string, typeof familyRecords>);

  const tabs = [
    { key: 'members', label: '家庭成员', icon: Users },
    { key: 'records', label: '家庭记录', icon: FileCheck },
    { key: 'legal', label: '遗嘱授权书', icon: Shield },
  ];

  const willAndAttorneyRecords = familyRecords.filter(
    (r) => r.type === 'will' || r.type === 'power_of_attorney'
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">家庭文件管理</h1>
            <p className="text-gray-500 mt-1">管理家庭成员信息及重要文件</p>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'members') {
              } else if (activeTab === 'records') {
              }
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            添加
          </button>
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
            {activeTab === 'members' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {familyMembers.map((member) => {
                  const docCount = getMemberDocumentCount(member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => navigate(`/family/member/${member.id}`)}
                      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                          <p className="text-sm text-gray-500">{member.relationship}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="w-4 h-4 mr-1" />
                          {docCount} 个证件
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'records' && (
              <div className="space-y-6">
                {Object.entries(recordsByType).map(([type, records]) => {
                  const config = familyRecordTypeConfig[type] || familyRecordTypeConfig.other;
                  const Icon = config.icon;
                  return (
                    <div key={type}>
                      <div className="flex items-center mb-3">
                        <div className={`p-2 rounded-lg mr-3 ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">{config.label}</h3>
                      </div>
                      <div className="bg-gray-50 rounded-xl">
                        {records.map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 mb-2 last:mb-0"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{record.title}</h4>
                              <p className="text-sm text-gray-500 mt-1">{record.issuingAuthority}</p>
                              {record.issuingAuthority && (
                                <p className="text-sm text-gray-400 mt-1">{record.issuingAuthority}</p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {Object.keys(recordsByType).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无家庭记录</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'legal' && (
              <div className="space-y-4">
                {willAndAttorneyRecords.map((record) => {
                  const config = familyRecordTypeConfig[record.type] || familyRecordTypeConfig.other;
                  const Icon = config.icon;
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg mr-4 ${config.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{record.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {record.issuingAuthority} · {record.issueDate}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  );
                })}
                {willAndAttorneyRecords.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无遗嘱或授权书</p>
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
