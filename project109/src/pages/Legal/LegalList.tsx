import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  Home,
  Briefcase,
  Shield,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { useStore } from '@/store/useStore';
import type { LegalType, LegalDocument } from '@/utils/mockData';

const typeConfig: Record<LegalType, { label: string; icon: typeof Scale; color: string }> = {
  property_contract: { label: '房产合同', icon: Home, color: 'text-orange-600' },
  labor_contract: { label: '劳动合同', icon: Briefcase, color: 'text-blue-600' },
  insurance_contract: { label: '保险合同', icon: Shield, color: 'text-green-600' },
  other: { label: '其他', icon: FileText, color: 'text-gray-600' },
};

function getExpiryStatus(expiryDate: string, reminderDays: number): { status: 'normal' | 'warning' | 'danger' | 'expired'; daysRemaining: number } {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { status: 'expired', daysRemaining };
  }
  if (daysRemaining <= 7) {
    return { status: 'danger', daysRemaining };
  }
  if (daysRemaining <= reminderDays) {
    return { status: 'warning', daysRemaining };
  }
  return { status: 'normal', daysRemaining };
}

export default function LegalList() {
  const navigate = useNavigate();
  const { legalDocuments } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<LegalType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'warning' | 'expired'>('all');

  const filteredDocuments = useMemo(() => {
    return legalDocuments.filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.partyA.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.partyB.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      const { status } = getExpiryStatus(doc.expiryDate, doc.reminderDays);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [legalDocuments, searchQuery, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    let normal = 0;
    let warning = 0;
    let expired = 0;

    legalDocuments.forEach((doc) => {
      const { status } = getExpiryStatus(doc.expiryDate, doc.reminderDays);
      if (status === 'expired') expired++;
      else if (status === 'danger' || status === 'warning') warning++;
      else normal++;
    });

    return { normal, warning, expired, total: legalDocuments.length };
  }, [legalDocuments]);

  const getTypeIcon = (type: LegalType) => {
    const config = typeConfig[type];
    const Icon = config.icon;
    return <Icon className={`w-6 h-6 ${config.color}`} />;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="法律文件管理"
          subtitle="管理您的合同和法律文件，设置到期提醒"
          icon={<Scale className="w-6 h-6" />}
          action={{
            label: '添加文件',
            onClick: () => navigate('/legal/add'),
          }}
        />

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">全部文件</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">正常</p>
            <p className="text-2xl font-bold text-green-600">{stats.normal}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">即将到期</p>
            <p className="text-2xl font-bold text-orange-600">{stats.warning}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">已过期</p>
            <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center flex-1 min-w-[200px]">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="搜索文件标题或合同双方..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as LegalType | 'all')}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部类型</option>
                <option value="property_contract">房产合同</option>
                <option value="labor_contract">劳动合同</option>
                <option value="insurance_contract">保险合同</option>
                <option value="other">其他</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'normal' | 'warning' | 'expired')}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部状态</option>
              <option value="normal">正常</option>
              <option value="warning">即将到期</option>
              <option value="expired">已过期</option>
            </select>
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <EmptyState
            title="暂无法律文件"
            description="点击上方按钮添加您的第一份法律文件"
            icon={<Scale className="w-16 h-16 text-gray-300" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onClick={() => navigate(`/legal/${doc.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

interface DocumentCardProps {
  document: LegalDocument;
  onClick: () => void;
}

function DocumentCard({ document, onClick }: DocumentCardProps) {
  const typeInfo = typeConfig[document.type];
  const Icon = typeInfo.icon;
  const { status, daysRemaining } = getExpiryStatus(document.expiryDate, document.reminderDays);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 ${typeInfo.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <StatusBadge status={status}>
          {status === 'expired' ? '已过期' :
            status === 'danger' ? '即将过期' :
            status === 'warning' ? '即将到期' : '正常'}
        </StatusBadge>
      </div>

      <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
        {document.title}
      </h3>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">甲方：</span>
          <span className="truncate">{document.partyA}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">乙方：</span>
          <span className="truncate">{document.partyB}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">有效期：</span>
          <span>{formatDate(document.effectiveDate)} ~ {formatDate(document.expiryDate)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {daysRemaining < 0
            ? `已过期 ${Math.abs(daysRemaining)} 天`
            : daysRemaining <= 7
              ? `剩余 ${daysRemaining} 天`
              : `剩余 ${daysRemaining} 天到期`}
        </span>
        <span className="text-xs text-gray-400">{typeInfo.label}</span>
      </div>
    </div>
  );
}
