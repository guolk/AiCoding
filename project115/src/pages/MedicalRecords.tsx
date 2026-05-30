import { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Calendar,
  Edit2,
  Trash2,
  User,
  Building2,
  CheckCircle,
  Info,
  X
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  formatDate, 
  getTodayDateString,
  isSameDay
} from '../utils/dateUtils';
import { cn } from '../lib/utils';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { StatCard } from '../components/common/StatCard';
import { MedicalRecord } from '../types';

interface MedicalRecordFormData {
  date: string;
  hospital: string;
  doctor: string;
  department: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  nextVisitDate: string;
}

interface ExamReportFormData {
  examType: string;
  examDate: string;
  keyIndicators: string;
  notes: string;
  fileUrl: string;
}

const initialRecordForm: MedicalRecordFormData = {
  date: getTodayDateString(),
  hospital: '',
  doctor: '',
  department: '',
  diagnosis: '',
  prescription: '',
  notes: '',
  nextVisitDate: ''
};

const initialReportForm: ExamReportFormData = {
  examType: '',
  examDate: getTodayDateString(),
  keyIndicators: '',
  notes: '',
  fileUrl: ''
};

export function MedicalRecords() {
  const { 
    medicalRecords, 
    examReports,
    addMedicalRecord, 
    updateMedicalRecord, 
    deleteMedicalRecord,
    addExamReport,
    deleteExamReport
  } = useAppStore();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [recordForm, setRecordForm] = useState<MedicalRecordFormData>(initialRecordForm);
  const [reportForm, setReportForm] = useState<ExamReportFormData>(initialReportForm);

  const sortedRecords = [...medicalRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const upcomingVisits = medicalRecords
    .filter(r => r.nextVisitDate)
    .filter(r => {
      const visitDate = new Date(r.nextVisitDate!);
      return visitDate >= new Date();
    })
    .sort((a, b) => new Date(a.nextVisitDate!).getTime() - new Date(b.nextVisitDate!).getTime());

  const handleRecordSubmit = () => {
    if (!recordForm.hospital.trim() || !recordForm.diagnosis.trim()) return;

    const recordData = {
      date: recordForm.date,
      hospital: recordForm.hospital,
      doctor: recordForm.doctor,
      department: recordForm.department,
      diagnosis: recordForm.diagnosis,
      prescription: recordForm.prescription,
      notes: recordForm.notes,
      ...(recordForm.nextVisitDate ? { nextVisitDate: recordForm.nextVisitDate } : {})
    };

    if (editingRecord) {
      updateMedicalRecord(editingRecord.id, recordData);
    } else {
      addMedicalRecord(recordData);
    }

    handleCloseRecordModal();
  };

  const handleOpenEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setRecordForm({
      date: record.date,
      hospital: record.hospital,
      doctor: record.doctor,
      department: record.department,
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      notes: record.notes,
      nextVisitDate: record.nextVisitDate || ''
    });
    setIsRecordModalOpen(true);
  };

  const handleCloseRecordModal = () => {
    setIsRecordModalOpen(false);
    setEditingRecord(null);
    setRecordForm(initialRecordForm);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个就医记录吗？相关的检查报告也会被删除。')) {
      deleteMedicalRecord(id);
    }
  };

  const handleReportSubmit = () => {
    if (!selectedRecord || !reportForm.examType.trim()) return;

    addExamReport({
      recordId: selectedRecord.id,
      examType: reportForm.examType,
      examDate: reportForm.examDate,
      keyIndicators: reportForm.keyIndicators,
      notes: reportForm.notes,
      ...(reportForm.fileUrl ? { fileUrl: reportForm.fileUrl } : {})
    });

    handleCloseReportModal();
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setReportForm(initialReportForm);
  };

  const getRecordReports = (recordId: string) => {
    return examReports.filter(r => r.recordId === recordId);
  };

  const isVisitToday = (date: string) => isSameDay(date, getTodayDateString());
  const isVisitTomorrow = (date: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDay(date, tomorrow.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">就医管理</h1>
          <p className="text-slate-500">追踪就医记录、复诊提醒和检查报告</p>
        </div>
        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-5 h-5" />
          新增记录
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="就医记录"
          value={medicalRecords.length}
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="待复诊"
          value={upcomingVisits.length}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="检查报告"
          value={examReports.length}
          icon={FileText}
          color="green"
        />
      </div>

      {upcomingVisits.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            复诊提醒
          </h3>
          <div className="space-y-3">
            {upcomingVisits.slice(0, 3).map((record) => (
              <div 
                key={record.id} 
                className={cn(
                  "p-4 rounded-xl bg-white/10 backdrop-blur-sm",
                  isVisitToday(record.nextVisitDate!) && "ring-2 ring-yellow-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{record.hospital}</p>
                    <p className="text-sm text-blue-100">{record.department} - {record.doctor}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold",
                      isVisitToday(record.nextVisitDate!) ? "text-yellow-300" : "",
                      isVisitTomorrow(record.nextVisitDate!) ? "text-green-300" : ""
                    )}>
                      {formatDate(record.nextVisitDate!)}
                    </p>
                    <p className="text-xs text-blue-100">
                      {isVisitToday(record.nextVisitDate!) ? "今天复诊" : 
                       isVisitTomorrow(record.nextVisitDate!) ? "明天复诊" : "预约复诊"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">就医记录时间线</h2>

            {sortedRecords.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="暂无就医记录"
                description="点击上方按钮添加您的第一个就医记录"
              />
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
                
                <div className="space-y-6">
                  {sortedRecords.map((record, index) => {
                    const reports = getRecordReports(record.id);
                    const isFirst = index === 0;
                    
                    return (
                      <div key={record.id} className="relative pl-14">
                        <div className={cn(
                          "absolute left-4 w-5 h-5 rounded-full border-4 border-white shadow-md",
                          isFirst ? "bg-purple-500" : "bg-slate-400"
                        )} />
                        
                        <div className={cn(
                          "p-5 rounded-2xl border transition-all",
                          isFirst 
                            ? "bg-purple-50 border-purple-200 shadow-md" 
                            : "bg-white border-slate-100 hover:shadow-md"
                        )}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                isFirst ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-600"
                              )}>
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-800">{record.hospital}</h3>
                                <p className="text-sm text-slate-500">{formatDate(record.date)}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setSelectedRecord(record)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                title="查看详情"
                              >
                                <Info className="w-4 h-4 text-slate-500" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(record)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-slate-500" />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <User className="w-4 h-4 text-slate-400" />
                              <span>{record.doctor || '未记录'}</span>
                              <span className="text-slate-300">·</span>
                              <span>{record.department || '未记录'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span>诊断: {record.diagnosis}</span>
                            </div>
                          </div>

                          {record.prescription && (
                            <div className="p-3 bg-emerald-50 rounded-lg mb-3">
                              <p className="text-xs text-emerald-600 font-medium mb-1">处方/治疗方案</p>
                              <p className="text-sm text-emerald-800">{record.prescription}</p>
                            </div>
                          )}

                          {record.nextVisitDate && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-blue-700">
                                下次复诊: {formatDate(record.nextVisitDate)}
                              </span>
                            </div>
                          )}

                          {reports.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <p className="text-xs text-slate-500 mb-2">关联检查报告 ({reports.length})</p>
                              <div className="flex flex-wrap gap-2">
                                {reports.map((report) => (
                                  <span 
                                    key={report.id}
                                    className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-full"
                                  >
                                    {report.examType}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">近期统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">就诊医院</p>
                    <p className="font-bold text-slate-800">
                      {new Set(medicalRecords.map(r => r.hospital)).size} 家
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">就诊医生</p>
                    <p className="font-bold text-slate-800">
                      {new Set(medicalRecords.map(r => r.doctor).filter(Boolean)).size} 位
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">检查报告</p>
                    <p className="font-bold text-slate-800">{examReports.length} 份</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">就医小贴士</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>复诊前整理好之前的检查报告</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>记录当前服用的所有药物</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>提前预约，避免长时间等待</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>带上身份证和医保卡</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>按时服药，不要自行停药</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isRecordModalOpen}
        onClose={handleCloseRecordModal}
        title={editingRecord ? '编辑就医记录' : '新增就医记录'}
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleRecordSubmit(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                就诊日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={recordForm.date}
                onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                医院 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recordForm.hospital}
                onChange={(e) => setRecordForm({ ...recordForm, hospital: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="如: 市第一人民医院"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                医生
              </label>
              <input
                type="text"
                value={recordForm.doctor}
                onChange={(e) => setRecordForm({ ...recordForm, doctor: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="如: 张医生"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                科室
              </label>
              <input
                type="text"
                value={recordForm.department}
                onChange={(e) => setRecordForm({ ...recordForm, department: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="如: 心内科"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              诊断结果 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={recordForm.diagnosis}
              onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="如: 高血压"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              处方/治疗方案
            </label>
            <textarea
              value={recordForm.prescription}
              onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
              placeholder="记录医生开的处方或治疗建议..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              备注
            </label>
            <textarea
              value={recordForm.notes}
              onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
              placeholder="其他需要记录的信息..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              下次复诊日期（可选）
            </label>
            <input
              type="date"
              value={recordForm.nextVisitDate}
              onChange={(e) => setRecordForm({ ...recordForm, nextVisitDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseRecordModal}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              {editingRecord ? '保存修改' : '添加记录'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="就医记录详情"
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedRecord.hospital}</h2>
                <p className="text-slate-500">{formatDate(selectedRecord.date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">医生</p>
                <p className="font-medium text-slate-800">{selectedRecord.doctor || '-'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">科室</p>
                <p className="font-medium text-slate-800">{selectedRecord.department || '-'}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">诊断结果</p>
              <p className="font-medium text-slate-800">{selectedRecord.diagnosis}</p>
            </div>

            {selectedRecord.prescription && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-700 font-medium mb-1">处方/治疗方案</p>
                <p className="font-medium text-emerald-800">{selectedRecord.prescription}</p>
              </div>
            )}

            {selectedRecord.nextVisitDate && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  下次复诊
                </p>
                <p className="font-medium text-blue-800">{formatDate(selectedRecord.nextVisitDate)}</p>
              </div>
            )}

            {selectedRecord.notes && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">备注</p>
                <p className="font-medium text-slate-800">{selectedRecord.notes}</p>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-700">检查报告</h4>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  + 添加报告
                </button>
              </div>
              
              {getRecordReports(selectedRecord.id).length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  暂无检查报告
                </div>
              ) : (
                <div className="space-y-2">
                  {getRecordReports(selectedRecord.id).map((report) => (
                    <div key={report.id} className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800">{report.examType}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{formatDate(report.examDate)}</span>
                          <button
                            onClick={() => {
                              if (window.confirm('确定要删除这份检查报告吗？')) {
                                deleteExamReport(report.id);
                              }
                            }}
                            className="p-1 rounded hover:bg-slate-200 transition-colors"
                          >
                            <X className="w-3 h-3 text-slate-500" />
                          </button>
                        </div>
                      </div>
                      {report.keyIndicators && (
                        <p className="text-sm text-slate-600">{report.keyIndicators}</p>
                      )}
                      {report.notes && (
                        <p className="text-sm text-slate-500 mt-1">{report.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              关闭
            </button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
        title="添加检查报告"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleReportSubmit(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                检查类型 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={reportForm.examType}
                onChange={(e) => setReportForm({ ...reportForm, examType: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="如: 血常规"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                检查日期
              </label>
              <input
                type="date"
                value={reportForm.examDate}
                onChange={(e) => setReportForm({ ...reportForm, examDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              关键指标
            </label>
            <textarea
              value={reportForm.keyIndicators}
              onChange={(e) => setReportForm({ ...reportForm, keyIndicators: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
              placeholder="记录重要的检查结果..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              备注
            </label>
            <textarea
              value={reportForm.notes}
              onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
              placeholder="其他需要记录的信息..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseReportModal}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              添加报告
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
