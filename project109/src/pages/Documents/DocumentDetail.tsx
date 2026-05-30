import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Globe,
  Car,
  Shield,
  CreditCard,
  FileText,
  Calendar,
  Building2,
  FileText as FileTextIcon,
  Clock,
  AlertCircle,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { useStore } from '@/store/useStore';
import { Document, DocumentType } from '@/utils/mockData';
import { calculateDaysRemaining, getReminderStatus, formatDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const documentTypeMap: Record<DocumentType, { label: string; icon: typeof User; color: string; bgColor: string }> = {
  id_card: { label: '身份证', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  passport: { label: '护照', icon: Globe, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  driver_license: { label: '驾照', icon: Car, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  social_security: { label: '社保卡', icon: Shield, color: 'text-green-600', bgColor: 'bg-green-100' },
  bank_card: { label: '银行卡', icon: CreditCard, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  other: { label: '其他', icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

function ExpiryProgressBar({ document }: { document: Document }) {
  const issueDate = new Date(document.issueDate);
  const expiryDate = new Date(document.expiryDate);
  const today = new Date();

  const totalDays = Math.max(1, Math.ceil((expiryDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.ceil((today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  const daysRemaining = calculateDaysRemaining(document.expiryDate);
  const status = getReminderStatus(daysRemaining);

  const progressColor =
    status === 'expired'
      ? 'bg-gray-400'
      : status === 'danger'
      ? 'bg-red-500'
      : status === 'warning'
      ? 'bg-yellow-500'
      : 'bg-green-500';

  return (
    <div className="bg-gray-50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">有效期进度</h3>
        <span className="text-sm text-gray-500">
          {formatDate(document.issueDate)} - {formatDate(document.expiryDate)}
        </span>
      </div>
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', progressColor)}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            已使用 {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          {daysRemaining < 0 ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : (
            <Clock className="w-4 h-4 text-gray-400" />
          )}
          <span
            className={cn(
              'text-sm font-medium',
              daysRemaining < 0
                ? 'text-red-600'
                : daysRemaining <= 30
                ? 'text-red-600'
                : daysRemaining <= 90
                ? 'text-yellow-600'
                : 'text-green-600'
            )}
          >
            {daysRemaining < 0
              ? `已过期 ${Math.abs(daysRemaining)} 天`
              : `剩余 ${daysRemaining} 天`}
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-500" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function DocumentDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { documents, deleteDocument } = useStore();
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (id) {
      const found = documents.find((doc) => doc.id === id);
      setDocument(found || null);
    }
  }, [id, documents]);

  const handleDelete = () => {
    if (document && window.confirm(`确定要删除证件 "${document.name}" 吗？此操作不可撤销。`)) {
      deleteDocument(document.id);
      navigate('/documents');
    }
  };

  if (!document) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">证件不存在</h2>
          <p className="text-gray-500 mb-6">该证件可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回证件列表
          </button>
        </div>
      </AppLayout>
    );
  }

  const typeInfo = documentTypeMap[document.type];
  const Icon = typeInfo.icon;
  const daysRemaining = calculateDaysRemaining(document.expiryDate);
  const status = getReminderStatus(daysRemaining);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回证件列表
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={cn('p-3 rounded-xl', typeInfo.bgColor)}>
              <Icon className={cn('w-8 h-8', typeInfo.color)} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">{document.name}</h1>
                <StatusBadge status={status}>
                  {daysRemaining < 0
                    ? '已过期'
                    : daysRemaining <= 30
                    ? `${daysRemaining}天后到期`
                    : daysRemaining <= 90
                    ? `${daysRemaining}天后到期`
                    : '正常'}
                </StatusBadge>
              </div>
              <p className="text-gray-500 mt-1">{typeInfo.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/documents/${document.id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">证件照片</h2>
              {document.photoUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={document.photoUrl}
                    alt={document.name}
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-lg">
                  <FileTextIcon className="w-16 h-16 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-center">暂无照片</p>
                  <p className="text-sm text-gray-400 text-center mt-1">
                    点击编辑按钮上传证件照片
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">基本信息</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoRow
                  icon={FileTextIcon}
                  label="证件类型"
                  value={typeInfo.label}
                />
                <InfoRow
                  icon={User}
                  label="持有人"
                  value={document.name}
                />
                <InfoRow
                  icon={CreditCard}
                  label="证件号码"
                  value={document.number}
                />
                <InfoRow
                  icon={Calendar}
                  label="签发日期"
                  value={formatDate(document.issueDate)}
                />
                <InfoRow
                  icon={Calendar}
                  label="有效期至"
                  value={formatDate(document.expiryDate)}
                />
                <InfoRow
                  icon={Building2}
                  label="签发机构"
                  value={document.issuingAuthority}
                />
              </div>
            </div>

            <ExpiryProgressBar document={document} />

            {document.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">备注</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {document.notes}
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">提醒设置</h2>
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-100">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">到期提醒</p>
                    <p className="text-sm text-gray-500">
                      到期前 {document.reminderDays} 天发送提醒通知
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/documents/${document.id}/edit`)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  调整设置
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
