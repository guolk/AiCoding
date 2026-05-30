import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  CreditCard,
  User,
  Globe,
  Car,
  Shield,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import { useStore } from '@/store/useStore';
import { Document, DocumentType } from '@/utils/mockData';
import { calculateDaysRemaining, getReminderStatus, formatDate } from '@/utils/dateUtils';

const documentTypeMap: Record<DocumentType, { label: string; icon: typeof User; color: string }> = {
  id_card: { label: '身份证', icon: User, color: 'bg-blue-500' },
  passport: { label: '护照', icon: Globe, color: 'bg-purple-500' },
  driver_license: { label: '驾照', icon: Car, color: 'bg-orange-500' },
  social_security: { label: '社保卡', icon: Shield, color: 'bg-green-500' },
  bank_card: { label: '银行卡', icon: CreditCard, color: 'bg-indigo-500' },
  other: { label: '其他', icon: FileText, color: 'bg-gray-500' },
};

const filterOptions: { value: DocumentType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'id_card', label: '身份证' },
  { value: 'passport', label: '护照' },
  { value: 'driver_license', label: '驾照' },
  { value: 'social_security', label: '社保卡' },
  { value: 'bank_card', label: '银行卡' },
  { value: 'other', label: '其他' },
];

function DocumentCard({ document, onView, onEdit, onDelete }: {
  document: Document;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const typeInfo = documentTypeMap[document.type];
  const Icon = typeInfo.icon;
  const daysRemaining = calculateDaysRemaining(document.expiryDate);
  const status = getReminderStatus(daysRemaining);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`${typeInfo.color} p-2.5 rounded-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{document.name}</h3>
              <p className="text-sm text-gray-500">{typeInfo.label}</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => { onView(); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    查看详情
                  </button>
                  <button
                    onClick={() => { onEdit(); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={() => { onDelete(); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">证件号码</span>
            <span className="text-sm font-medium text-gray-800 font-mono">{document.number}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">有效期至</span>
            <span className="text-sm font-medium text-gray-800">{formatDate(document.expiryDate)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <StatusBadge status={status}>
            {daysRemaining < 0
              ? '已过期'
              : daysRemaining <= 30
              ? `${daysRemaining}天后到期`
              : daysRemaining <= 90
              ? `${daysRemaining}天后到期`
              : '正常'}
          </StatusBadge>
          <button
            onClick={onView}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            查看详情 →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsList() {
  const navigate = useNavigate();
  const { documents, deleteDocument } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<DocumentType | 'all'>('all');

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || doc.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [documents, searchQuery, selectedType]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`确定要删除证件 "${name}" 吗？此操作不可撤销。`)) {
      deleteDocument(id);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">证件管理</h1>
            <p className="text-gray-500 mt-1">管理您的身份证、护照、驾照等重要证件</p>
          </div>
          <button
            onClick={() => navigate('/documents/add')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            添加证件
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索证件名称、号码或签发机构..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocumentType | 'all')}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onView={() => navigate(`/documents/${document.id}`)}
                onEdit={() => navigate(`/documents/${document.id}/edit`)}
                onDelete={() => handleDelete(document.id, document.name)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            iconType="file"
            title="暂无证件"
            description={
              searchQuery || selectedType !== 'all'
                ? '没有找到符合条件的证件，请尝试其他搜索条件'
                : '开始添加您的第一个证件吧'
            }
            action={
              searchQuery || selectedType !== 'all'
                ? undefined
                : {
                    label: '添加证件',
                    onClick: () => navigate('/documents/add'),
                  }
            }
          />
        )}
      </div>
    </AppLayout>
  );
}
