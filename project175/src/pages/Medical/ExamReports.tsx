import { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  FileText,
  MapPin,
  StickyNote,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Search,
  Heart,
  Droplets,
  Activity,
  Scan,
  Bone,
  Stethoscope,
} from 'lucide-react';
import { useHealthStore } from '@/store';
import type { ExamReport, ExamType } from '@/types';
import { cn, formatDate } from '@/utils';

const examTypeLabels: Record<ExamType, string> = {
  urine: '尿常规',
  kidney: '肾功能',
  ecg: '心电图',
  blood: '血生化',
  xray: 'X光',
  ultrasound: 'B超',
  other: '其他',
};

const examTypeIcons: Record<ExamType, typeof Heart> = {
  urine: Droplets,
  kidney: Activity,
  ecg: Heart,
  blood: Droplets,
  xray: Scan,
  ultrasound: Bone,
  other: FileText,
};

const examTypeColors: Record<ExamType, string> = {
  urine: 'from-yellow-500 to-amber-600',
  kidney: 'from-blue-500 to-cyan-600',
  ecg: 'from-green-500 to-emerald-600',
  blood: 'from-red-500 to-rose-600',
  xray: 'from-purple-500 to-indigo-600',
  ultrasound: 'from-teal-500 to-cyan-600',
  other: 'from-gray-500 to-slate-600',
};

export default function ExamReports() {
  const { examReports, addExamReport, updateExamReport, deleteExamReport } = useHealthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ExamReport | null>(null);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    type: 'blood' as ExamType,
    typeLabel: '',
    hospital: '',
    summary: '',
    findings: '',
    isNormal: true,
    note: '',
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ExamReport | null>(null);
  const [filterType, setFilterType] = useState<ExamType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'abnormal'>('all');

  const sortedReports = useMemo(
    () => [...examReports].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [examReports]
  );

  const filteredReports = useMemo(() => {
    return sortedReports.filter((r) => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (filterStatus === 'normal' && !r.isNormal) return false;
      if (filterStatus === 'abnormal' && r.isNormal) return false;
      return true;
    });
  }, [sortedReports, filterType, filterStatus]);

  const normalCount = useMemo(
    () => examReports.filter((r) => r.isNormal).length,
    [examReports]
  );

  const abnormalCount = useMemo(
    () => examReports.filter((r) => !r.isNormal).length,
    [examReports]
  );

  const openAddModal = () => {
    setEditingReport(null);
    setFormData({
      date: formatDate(new Date()),
      type: 'blood',
      typeLabel: '',
      hospital: '',
      summary: '',
      findings: '',
      isNormal: true,
      note: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (report: ExamReport) => {
    setEditingReport(report);
    setFormData({
      date: report.date,
      type: report.type,
      typeLabel: report.typeLabel,
      hospital: report.hospital,
      summary: report.summary,
      findings: report.findings.join('\n'),
      isNormal: report.isNormal,
      note: report.note || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReport(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.summary.trim()) return;

    const findingsArray = formData.findings
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const data = {
      date: formData.date,
      type: formData.type,
      typeLabel: formData.typeLabel || examTypeLabels[formData.type],
      hospital: formData.hospital,
      summary: formData.summary,
      findings: findingsArray,
      isNormal: formData.isNormal,
      note: formData.note || undefined,
    };

    if (editingReport) {
      updateExamReport(editingReport.id, data);
    } else {
      addExamReport(data);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    deleteExamReport(id);
    setDeleteConfirmId(null);
    if (selectedReport?.id === id) {
      setSelectedReport(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 text-violet-100 text-sm">
            <FileText className="w-4 h-4" />
            检查报告
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums">{examReports.length}</span>
            <span className="text-lg text-violet-100">份</span>
          </div>
          <div className="mt-2 text-xs text-violet-100">
            累计检查报告
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <CheckCircle className="w-4 h-4" />
            结果正常
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-green-600 tabular-nums">{normalCount}</span>
            <span className="text-lg text-gray-400">份</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {examReports.length > 0 ? `占比 ${Math.round((normalCount / examReports.length) * 100)}%` : '暂无数据'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            需要关注
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-amber-600 tabular-nums">{abnormalCount}</span>
            <span className="text-lg text-gray-400">份</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            异常或需复查
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg shadow-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">检查报告</h3>
              <p className="text-xs text-gray-500">尿常规、肾功能、心电图等检查结果</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            添加报告
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">筛选：</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                filterType === 'all'
                  ? 'bg-violet-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              全部类型
            </button>
            {(Object.keys(examTypeLabels) as ExamType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  filterType === type
                    ? 'bg-violet-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {examTypeLabels[type]}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                filterStatus === 'all'
                  ? 'bg-violet-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              全部
            </button>
            <button
              onClick={() => setFilterStatus('normal')}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                filterStatus === 'normal'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              正常
            </button>
            <button
              onClick={() => setFilterStatus('abnormal')}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                filterStatus === 'abnormal'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              异常
            </button>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-3 text-gray-500">暂无检查报告</p>
            <button
              onClick={openAddModal}
              className="mt-2 text-sm text-violet-600 hover:text-violet-700"
            >
              点击添加第一份报告
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const Icon = examTypeIcons[report.type];
              const color = examTypeColors[report.type];
              const isExpanded = selectedReport?.id === report.id;
              return (
                <div
                  key={report.id}
                  className={cn(
                    'rounded-xl transition-all overflow-hidden',
                    isExpanded
                      ? 'bg-violet-50 border-2 border-violet-200'
                      : 'bg-gray-50/50 hover:bg-gray-50 border-2 border-transparent'
                  )}
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setSelectedReport(isExpanded ? null : report)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                          color
                        )}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{report.typeLabel}</h4>
                            <span
                              className={cn(
                                'text-xs font-medium px-2 py-0.5 rounded-full',
                                report.isNormal
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              )}
                            >
                              {report.isNormal ? '正常' : '异常'}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                            <span>{report.date}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {report.hospital}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-1">{report.summary}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(report);
                            }}
                            className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(report.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <ChevronRight className={cn(
                          'w-5 h-5 text-gray-400 transition-transform',
                          isExpanded && 'rotate-90'
                        )} />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-violet-100">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">检查结论</p>
                          <p className="text-sm text-gray-700 bg-white rounded-lg p-3">
                            {report.summary}
                          </p>
                        </div>
                        {report.findings.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">详细结果</p>
                            <div className="bg-white rounded-lg p-3 space-y-1.5">
                              {report.findings.map((finding, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                                  <span>{finding}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {report.note && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">备注</p>
                            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                              {report.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingReport ? '编辑检查报告' : '添加检查报告'}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  检查日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  检查类型
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(examTypeLabels) as ExamType[]).map((type) => {
                    const Icon = examTypeIcons[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={cn(
                          'flex flex-col items-center gap-1 py-3 rounded-xl border transition-all',
                          formData.type === type
                            ? 'border-violet-500 bg-violet-50 text-violet-600'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{examTypeLabels[type]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  类型名称（可选）
                </label>
                <input
                  type="text"
                  value={formData.typeLabel}
                  onChange={(e) => setFormData({ ...formData, typeLabel: e.target.value })}
                  placeholder="自定义名称，留空使用默认"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  检查医院
                </label>
                <input
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  placeholder="请输入医院名称"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  检查结论 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="简要描述检查结果"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  详细结果
                </label>
                <textarea
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  placeholder="每行一条检查结果..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
                />
                <p className="mt-1 text-xs text-gray-400">每行一条检查项结果</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isNormal"
                  checked={formData.isNormal}
                  onChange={(e) => setFormData({ ...formData, isNormal: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="isNormal" className="text-sm text-gray-700">
                  检查结果正常
                </label>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <StickyNote className="inline w-4 h-4 mr-1" />
                  备注（选填）
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="医生建议、注意事项等..."
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={cn(
                    'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white',
                    formData.summary.trim() && formData.date
                      ? 'bg-violet-600 hover:bg-violet-700'
                      : 'cursor-not-allowed bg-violet-300'
                  )}
                  disabled={!formData.summary.trim() || !formData.date}
                >
                  {editingReport ? '保存修改' : '添加报告'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              确定要删除这份检查报告吗？删除后无法恢复。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
