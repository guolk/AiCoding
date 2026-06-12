import { useState } from 'react';
import { useVisaStore } from '@/store/visaStore';
import type { VisaRecord, BorderRecord, VisaType, BorderDirection } from '@/types';
import { formatDate, daysUntil, isExpired, isExpiringSoon, daysBetween, todayISO } from '@/utils/date';
import {
  FileCheck2,
  Calendar,
  Plane,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  IdCard,
  X,
} from 'lucide-react';

const VISA_TYPE_CONFIG: Record<VisaType, { label: string; emoji: string; color: string }> = {
  'digital-nomad': { label: '数字游民签证', emoji: '🏝️', color: 'bg-teal-100 text-teal-700' },
  tourist: { label: '旅游签证', emoji: '🎒', color: 'bg-blue-100 text-blue-700' },
  business: { label: '商务签证', emoji: '💼', color: 'bg-purple-100 text-purple-700' },
  student: { label: '学生签证', emoji: '🎓', color: 'bg-amber-100 text-amber-700' },
  other: { label: '其他', emoji: '📋', color: 'bg-gray-100 text-gray-700' },
};

const COUNTRY_FLAGS: Record<string, string> = {
  TH: '🇹🇭', PT: '🇵🇹', ID: '🇮🇩', JP: '🇯🇵', KR: '🇰🇷', SG: '🇸🇬',
  MY: '🇲🇾', VN: '🇻🇳', PH: '🇵🇭', US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷',
  DE: '🇩🇪', ES: '🇪🇸', IT: '🇮🇹', NL: '🇳🇱', AU: '🇦🇺', CA: '🇨🇦',
  NZ: '🇳🇿', IN: '🇮🇳', BR: '🇧🇷', MX: '🇲🇽', AR: '🇦🇷', CL: '🇨🇱',
  CO: '🇨🇴', PE: '🇵🇪', ZA: '🇿🇦', EG: '🇪🇬', TR: '🇹🇷', AE: '🇦🇪',
  SA: '🇸🇦', IL: '🇮🇱', GR: '🇬🇷', CZ: '🇨🇿', PL: '🇵🇱', HU: '🇭🇺',
  AT: '🇦🇹', BE: '🇧🇪', CH: '🇨🇭', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰',
  FI: '🇫🇮', IS: '🇮🇸', IE: '🇮🇪', GE: '🇬🇪', RS: '🇷🇸', BG: '🇧🇬',
  RO: '🇷🇴', CN: '🇨🇳', HK: '🇭🇰', TW: '🇹🇼', LK: '🇱🇰', NP: '🇳🇵',
  KH: '🇰🇭', LA: '🇱🇦', BN: '🇧🇳',
};

function getFlag(countryCode: string): string {
  return COUNTRY_FLAGS[countryCode?.toUpperCase()] || '🏳️';
}

function getVisaStatus(visa: VisaRecord): { label: string; color: string; icon: typeof CheckCircle2 } {
  if (isExpired(visa.expiryDate)) {
    return { label: '已过期', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle };
  }
  if (isExpiringSoon(visa.expiryDate, 30)) {
    return { label: '即将到期', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
  }
  return { label: '正常', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 };
}

const TABS = [
  { id: 'archive', label: '签证档案', icon: IdCard },
  { id: 'calendar', label: '到期日历', icon: Calendar },
  { id: 'border', label: '出入境记录', icon: Plane },
] as const;

type TabId = typeof TABS[number]['id'];

export default function Visa() {
  const [activeTab, setActiveTab] = useState<TabId>('archive');
  const [showVisaModal, setShowVisaModal] = useState(false);
  const [showBorderModal, setShowBorderModal] = useState(false);
  const { visas, borders, addVisa, removeVisa, addBorder, removeBorder } = useVisaStore();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">签证管理</h1>
          <p className="mt-2 text-slate-500">追踪签证状态、到期时间和出入境记录</p>
        </div>

        <div className="mb-6 flex gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-[600px]">
          {activeTab === 'archive' && (
            <VisaArchiveTab
              visas={visas}
              onAdd={() => setShowVisaModal(true)}
              onRemove={removeVisa}
            />
          )}
          {activeTab === 'calendar' && <VisaCalendarTab visas={visas} />}
          {activeTab === 'border' && (
            <BorderRecordsTab
              borders={borders}
              onAdd={() => setShowBorderModal(true)}
              onRemove={removeBorder}
            />
          )}
        </div>

        {showVisaModal && (
          <AddVisaModal onClose={() => setShowVisaModal(false)} onSubmit={(v) => { addVisa(v); setShowVisaModal(false); }} />
        )}

        {showBorderModal && (
          <AddBorderModal onClose={() => setShowBorderModal(false)} onSubmit={(b) => { addBorder(b); setShowBorderModal(false); }} />
        )}
      </div>
    </div>
  );
}

function VisaArchiveTab({
  visas,
  onAdd,
  onRemove,
}: {
  visas: VisaRecord[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          全部签证 <span className="ml-2 text-sm font-normal text-slate-400">({visas.length})</span>
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          <Plus size={16} />
          添加签证
        </button>
      </div>

      {visas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm ring-1 ring-slate-200">
          <FileCheck2 size={48} className="mb-4 text-slate-300" />
          <p className="text-slate-500">暂无签证记录</p>
          <p className="mt-1 text-sm text-slate-400">点击右上角添加你的第一张签证</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visas.map((visa) => (
            <VisaCard key={visa.id} visa={visa} onRemove={() => onRemove(visa.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function VisaCard({ visa, onRemove }: { visa: VisaRecord; onRemove: () => void }) {
  const typeConfig = VISA_TYPE_CONFIG[visa.visaType];
  const status = getVisaStatus(visa);
  const StatusIcon = status.icon;
  const remainingDays = daysUntil(visa.expiryDate);
  const totalDays = daysBetween(visa.issueDate, visa.expiryDate);
  const usedDays = totalDays - remainingDays;
  const usedPercent = Math.min(100, Math.max(0, (usedDays / totalDays) * 100));

  const remainingText = isExpired(visa.expiryDate)
    ? '已过期'
    : `剩余 ${remainingDays} 天`;

  const remainingColor = isExpired(visa.expiryDate)
    ? 'text-red-600'
    : isExpiringSoon(visa.expiryDate, 30)
      ? 'text-amber-600'
      : 'text-slate-700';

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md">
      <button
        onClick={onRemove}
        className="absolute right-4 top-4 rounded-md p-1.5 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-4xl leading-none">{getFlag(visa.countryCode)}</div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{visa.country}</h3>
            <div className={`mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${typeConfig.color}`}>
              <span>{typeConfig.emoji}</span>
              <span>{typeConfig.label}</span>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${status.color}`}>
          <StatusIcon size={12} />
          {status.label}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-slate-600">{formatDate(visa.issueDate, 'MM/dd')}</span>
          <ArrowRight size={14} className="text-slate-300" />
          <span className="text-slate-600">{formatDate(visa.expiryDate, 'MM/dd/yy')}</span>
        </div>
        <div className={`rounded-lg bg-slate-50 px-3 py-2 font-semibold ${remainingColor}`}>
          {remainingText}
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
          <span>已使用 {usedDays}/{totalDays} 天</span>
          <span>{visa.maxStayDays}天停留期</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              isExpired(visa.expiryDate)
                ? 'bg-red-500'
                : isExpiringSoon(visa.expiryDate, 30)
                  ? 'bg-amber-500'
                  : 'bg-teal-500'
            }`}
            style={{ width: `${usedPercent}%` }}
          />
        </div>
      </div>

      {visa.requirements && (
        <div className="mb-2 rounded-lg bg-blue-50/50 px-3 py-2 text-xs text-blue-700">
          <span className="font-medium">签证要求：</span>
          {visa.requirements}
        </div>
      )}
      {visa.notes && (
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span className="font-medium text-slate-700">备注：</span>
          {visa.notes}
        </div>
      )}
    </div>
  );
}

function VisaCalendarTab({ visas }: { visas: VisaRecord[] }) {
  const sortedVisas = [...visas].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">签证到期时间轴</h2>
      </div>

      {sortedVisas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm ring-1 ring-slate-200">
          <Calendar size={48} className="mb-4 text-slate-300" />
          <p className="text-slate-500">暂无签证记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedVisas.map((visa) => {
            const typeConfig = VISA_TYPE_CONFIG[visa.visaType];
            const status = getVisaStatus(visa);
            const StatusIcon = status.icon;
            const remainingDays = daysUntil(visa.expiryDate);
            const totalDays = daysBetween(visa.issueDate, visa.expiryDate);
            const usedDays = totalDays - remainingDays;
            const usedPercent = Math.min(100, Math.max(0, (usedDays / totalDays) * 100));

            const shouldRenew = remainingDays <= 90 && remainingDays > 0;
            const renewUrgent = remainingDays <= 30 && remainingDays > 0;

            return (
              <div
                key={visa.id}
                className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        isExpired(visa.expiryDate)
                          ? 'bg-red-100'
                          : isExpiringSoon(visa.expiryDate, 30)
                            ? 'bg-amber-100'
                            : 'bg-teal-100'
                      }`}
                    >
                      <span className="text-2xl">{getFlag(visa.countryCode)}</span>
                    </div>
                    <div className="mt-2 h-full w-px flex-1 bg-slate-200" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{visa.country}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${typeConfig.color}`}>
                        <span>{typeConfig.emoji}</span>
                        <span>{typeConfig.label}</span>
                      </span>
                      <div className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${status.color}`}>
                        <StatusIcon size={12} />
                        {status.label}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDate(visa.expiryDate)}
                      </span>
                      <span className={`font-semibold ${
                        isExpired(visa.expiryDate)
                          ? 'text-red-600'
                          : isExpiringSoon(visa.expiryDate, 30)
                            ? 'text-amber-600'
                            : 'text-slate-700'
                      }`}>
                        {isExpired(visa.expiryDate) ? '已过期' : `剩余 ${remainingDays} 天`}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                        <span>已使用 {usedDays}/{totalDays} 天 ({usedPercent.toFixed(0)}%)</span>
                        <span>签发 {formatDate(visa.issueDate, 'yyyy/MM/dd')}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            isExpired(visa.expiryDate)
                              ? 'bg-red-500'
                              : isExpiringSoon(visa.expiryDate, 30)
                                ? 'bg-amber-500'
                                : 'bg-gradient-to-r from-teal-400 to-teal-600'
                          }`}
                          style={{ width: `${usedPercent}%` }}
                        />
                      </div>
                    </div>

                    {shouldRenew && (
                      <div
                        className={`mt-4 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${
                          renewUrgent
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">
                            {renewUrgent ? '紧急续签提醒' : '续签计划建议'}
                          </span>
                          <span className="ml-2">
                            {renewUrgent
                              ? `签证将在 ${remainingDays} 天后到期，请立即办理续签或离境！`
                              : `签证将在 ${remainingDays} 天后到期，建议提前准备续签材料或规划行程。`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BorderRecordsTab({
  borders,
  onAdd,
  onRemove,
}: {
  borders: BorderRecord[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const sortedBorders = [...borders].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          出入境记录 <span className="ml-2 text-sm font-normal text-slate-400">({borders.length})</span>
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          <Plus size={16} />
          添加记录
        </button>
      </div>

      {sortedBorders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm ring-1 ring-slate-200">
          <Plane size={48} className="mb-4 text-slate-300" />
          <p className="text-slate-500">暂无出入境记录</p>
          <p className="mt-1 text-sm text-slate-400">点击右上角添加你的第一条记录</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="divide-y divide-slate-100">
            {sortedBorders.map((record) => (
              <BorderRecordItem
                key={record.id}
                record={record}
                onRemove={() => onRemove(record.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BorderRecordItem({
  record,
  onRemove,
}: {
  record: BorderRecord;
  onRemove: () => void;
}) {
  const isEntry = record.direction === 'entry';

  return (
    <div className="group flex items-center gap-4 p-4 transition-colors hover:bg-slate-50">
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
          isEntry ? 'bg-green-100' : 'bg-orange-100'
        }`}
      >
        <span className="text-xl">{isEntry ? '🛬' : '🛫'}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getFlag(record.countryCode)}</span>
          <span className="font-semibold text-slate-900">{record.country}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
              isEntry
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {isEntry ? '入境' : '出境'}
          </span>
        </div>
        {record.notes && (
          <p className="mt-1 text-sm text-slate-500">{record.notes}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="text-sm font-medium text-slate-700">
          {formatDate(record.date)}
        </div>
        <div className="text-xs text-slate-400">
          {formatDate(record.date, 'EEEE')}
        </div>
      </div>

      <button
        onClick={onRemove}
        className="rounded-md p-2 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function AddVisaModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (visa: Omit<VisaRecord, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    country: '',
    countryCode: '',
    visaType: 'tourist' as VisaType,
    issueDate: todayISO(),
    expiryDate: '',
    maxStayDays: 30,
    notes: '',
    requirements: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.country || !form.expiryDate) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">添加签证</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">国家/地区</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="例如：泰国"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">国家代码 (2位)</label>
              <input
                type="text"
                value={form.countryCode}
                onChange={(e) => setForm({ ...form, countryCode: e.target.value.toUpperCase() })}
                placeholder="例如：TH"
                maxLength={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">签证类型</label>
            <select
              value={form.visaType}
              onChange={(e) => setForm({ ...form, visaType: e.target.value as VisaType })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              {Object.entries(VISA_TYPE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">签发日期</label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">到期日期</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">最长停留天数</label>
            <input
              type="number"
              value={form.maxStayDays}
              onChange={(e) => setForm({ ...form, maxStayDays: Number(e.target.value) })}
              min={1}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">签证要求</label>
            <input
              type="text"
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              placeholder="例如：收入证明、健康保险..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">备注</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="添加备注信息..."
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              添加签证
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddBorderModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (border: Omit<BorderRecord, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    country: '',
    countryCode: '',
    direction: 'entry' as BorderDirection,
    date: todayISO(),
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.country || !form.date) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">添加出入境记录</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">出入境类型</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, direction: 'entry' })}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  form.direction === 'entry'
                    ? 'bg-green-100 text-green-700 ring-2 ring-green-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🛬 入境
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, direction: 'exit' })}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  form.direction === 'exit'
                    ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🛫 出境
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">国家/地区</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="例如：泰国"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">国家代码</label>
              <input
                type="text"
                value={form.countryCode}
                onChange={(e) => setForm({ ...form, countryCode: e.target.value.toUpperCase() })}
                placeholder="例如：TH"
                maxLength={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">日期</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">备注</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="例如：素万那普机场"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              添加记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
