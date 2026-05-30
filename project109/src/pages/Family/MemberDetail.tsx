import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  FileText,
  Plus,
  ArrowLeft,
  Calendar,
  IdCard,
  ChevronRight,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/store/useStore';

const documentTypeLabels: Record<string, string> = {
  id_card: '身份证',
  passport: '护照',
  driver_license: '驾驶证',
  social_security: '社保卡',
  bank_card: '银行卡',
  other: '其他',
};

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function MemberDetail() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { familyMembers, documents } = useStore();

  const member = familyMembers.find((m) => m.id === memberId);
  const memberDocuments = documents.filter((d) => d.memberId === memberId);

  const documentList = useMemo(() => {
    return memberDocuments.map((doc) => ({
      ...doc,
      daysUntilExpiry: getDaysUntilExpiry(doc.expiryDate),
    }));
  }, [memberDocuments]);

  if (!member) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">成员不存在</p>
          <button
            onClick={() => navigate('/family')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            返回家庭文件管理
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/family')}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            返回
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-800">{member.name}</h1>
              <div className="flex items-center mt-2 text-gray-500">
                <IdCard className="w-4 h-4 mr-2" />
                <span>{member.relationship}</span>
                <span className="mx-3">·</span>
                <Calendar className="w-4 h-4 mr-2" />
                <span>{member.birthDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">证件列表</h2>
              <p className="text-sm text-gray-500 mt-1">该成员共 {documentList.length} 个证件</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              添加证件
            </button>
          </div>

          <div className="p-6">
            {documentList.length > 0 ? (
              <div className="space-y-4">
                {documentList.map((doc) => {
                  const statusClass =
                    doc.daysUntilExpiry < 0
                      ? 'border-l-4 border-l-red-500'
                      : doc.daysUntilExpiry <= 30
                      ? 'border-l-4 border-l-orange-500'
                      : '';

                  const statusText =
                    doc.daysUntilExpiry < 0
                      ? '已过期'
                      : doc.daysUntilExpiry <= 30
                      ? `即将过期 (${doc.daysUntilExpiry}天)`
                      : `有效期内 (${doc.daysUntilExpiry}天)`;

                  const statusColor =
                    doc.daysUntilExpiry < 0
                      ? 'text-red-600 bg-red-50'
                      : doc.daysUntilExpiry <= 30
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-green-600 bg-green-50';

                  return (
                    <div
                      key={doc.id}
                      className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${statusClass}`}
                    >
                      <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg mr-4">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{documentTypeLabels[doc.type] || doc.type}</h3>
                          <p className="text-sm text-gray-500 mt-1">证件号：{doc.number}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {doc.issueDate} 至 {doc.expiryDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs px-3 py-1 rounded-full ${statusColor}`}>
                          {statusText}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">该成员暂无证件</p>
                <p className="text-sm text-gray-400 mt-2">点击上方按钮添加证件</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
