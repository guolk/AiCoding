import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Scale,
  Home,
  Briefcase,
  Shield,
  FileText,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Calendar,
  DollarSign,
  Users,
  FileWarning,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useStore } from '@/store/useStore';
import type { LegalType, LegalDocument } from '@/utils/mockData';

const typeConfig: Record<LegalType, { label: string; icon: typeof Scale; color: string; bgColor: string }> = {
  property_contract: { label: '房产合同', icon: Home, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  labor_contract: { label: '劳动合同', icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  insurance_contract: { label: '保险合同', icon: Shield, color: 'text-green-600', bgColor: 'bg-green-100' },
  other: { label: '其他', icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100' },
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

export default function LegalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { legalDocuments, deleteLegalDocument } = useStore();
  const [expandedClauses, setExpandedClauses] = useState<Record<string, boolean>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const document = useMemo(() => {
    return legalDocuments.find((d) => d.id === id);
  }, [legalDocuments, id]);

  const expiryInfo = useMemo(() => {
    if (!document) return null;
    return getExpiryStatus(document.expiryDate, document.reminderDays);
  }, [document]);

  const expiryProgress = useMemo(() => {
    if (!document || !expiryInfo) return 0;

    const effectiveDate = new Date(document.effectiveDate);
    const expiryDate = new Date(document.expiryDate);
    const today = new Date();

    const totalDuration = expiryDate.getTime() - effectiveDate.getTime();
    const elapsedDuration = today.getTime() - effectiveDate.getTime();

    const progress = (elapsedDuration / totalDuration) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [document, expiryInfo]);

  if (!document) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <FileWarning className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">文件不存在</h2>
          <p className="text-gray-500 mb-4">该法律文件可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/legal')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            返回列表
          </button>
        </div>
      </AppLayout>
    );
  }

  const typeInfo = typeConfig[document.type];
  const TypeIcon = typeInfo.icon;

  const toggleClause = (clauseId: string) => {
    setExpandedClauses((prev) => ({
      ...prev,
      [clauseId]: !prev[clauseId],
    }));
  };

  const handleDelete = () => {
    deleteLegalDocument(document.id);
    navigate('/legal');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (!expiryInfo) return 'bg-gray-200';
    if (expiryInfo.status === 'expired') return 'bg-red-500';
    if (expiryInfo.status === 'danger') return 'bg-red-500';
    if (expiryInfo.status === 'warning') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={document.title}
          subtitle={typeInfo.label}
          icon={<Scale className="w-6 h-6" />}
          breadcrumbs={[
            { label: '法律文件', path: '/legal' },
            { label: document.title },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${typeInfo.bgColor}`}>
                    <TypeIcon className={`w-8 h-8 ${typeInfo.color}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{document.title}</h2>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={expiryInfo?.status || 'normal'}>
                        {expiryInfo?.status === 'expired' ? '已过期' :
                          expiryInfo?.status === 'danger' ? '即将过期' :
                          expiryInfo?.status === 'warning' ? '即将到期' : '正常'}
                      </StatusBadge>
                      <span className="text-sm text-gray-500">{typeInfo.label}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/legal/${document.id}/edit`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">合同有效期进度</span>
                  <span className="text-sm text-gray-500">
                    {Math.round(expiryProgress)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressColor()}`}
                    style={{ width: `${expiryProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>{formatDate(document.effectiveDate)}</span>
                  <span>
                    {expiryInfo?.daysRemaining && expiryInfo.daysRemaining >= 0
                      ? `剩余 ${expiryInfo.daysRemaining} 天`
                      : `已过期 ${Math.abs(expiryInfo?.daysRemaining || 0)} 天`}
                  </span>
                  <span>{formatDate(document.expiryDate)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">甲方</p>
                      <p className="text-sm font-medium text-gray-700">{document.partyA}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">乙方</p>
                      <p className="text-sm font-medium text-gray-700">{document.partyB}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">签订日期</p>
                      <p className="text-sm font-medium text-gray-700">{formatDate(document.signDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">有效期</p>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDate(document.effectiveDate)} ~ {formatDate(document.expiryDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {document.contractAmount && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">合同金额</p>
                      <p className="text-lg font-semibold text-gray-900">¥{document.contractAmount}</p>
                    </div>
                  </div>
                </div>
              )}

              {document.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">备注</p>
                  <p className="text-sm text-gray-600">{document.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 mb-1">提醒设置</p>
                    <p className="text-sm text-gray-600">到期前 {document.reminderDays} 天提醒</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">关键条款</h3>
                <span className="text-sm text-gray-500">
                  共 {document.keyClauses.length} 条
                </span>
              </div>

              {document.keyClauses.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无关键条款</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {document.keyClauses.map((clause, index) => {
                    const isExpanded = expandedClauses[clause.id] !== false;

                    return (
                      <div
                        key={clause.id}
                        className={`border rounded-lg overflow-hidden transition-colors ${
                          clause.highlighted
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <button
                          onClick={() => toggleClause(clause.id)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              clause.highlighted
                                ? 'bg-yellow-200 text-yellow-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{clause.title}</h4>
                              {clause.highlighted && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4">
                            <p className="text-sm text-gray-600 pl-11 leading-relaxed">
                              {clause.content}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/legal/${document.id}/edit`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Edit2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-700">编辑文件</p>
                    <p className="text-xs text-gray-400">修改文件信息</p>
                  </div>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="font-medium text-red-600">删除文件</p>
                    <p className="text-xs text-red-400">永久删除此文件</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">文件信息</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">创建时间</span>
                  <span className="text-gray-600">{formatDate(document.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">更新时间</span>
                  <span className="text-gray-600">{formatDate(document.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">文件ID</span>
                  <span className="text-gray-600 text-xs font-mono">{document.id}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6">
              <h3 className="text-lg font-semibold text-primary-800 mb-2">状态概览</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-primary-600">当前状态</span>
                  <StatusBadge status={expiryInfo?.status || 'normal'}>
                    {expiryInfo?.status === 'expired' ? '已过期' :
                      expiryInfo?.status === 'danger' ? '即将过期' :
                      expiryInfo?.status === 'warning' ? '即将到期' : '正常'}
                  </StatusBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-600">剩余天数</span>
                  <span className="font-semibold text-primary-800">
                    {expiryInfo?.daysRemaining && expiryInfo.daysRemaining >= 0
                      ? `${expiryInfo.daysRemaining} 天`
                      : `已过期 ${Math.abs(expiryInfo?.daysRemaining || 0)} 天`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-600">提醒设置</span>
                  <span className="font-medium text-primary-800">
                    提前 {document.reminderDays} 天
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="删除法律文件"
        description="确定要删除此法律文件吗？此操作无法撤销。"
        confirmText="确认删除"
        cancelText="取消"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteModal(false)}
        variant="danger"
      />
    </AppLayout>
  );
}
