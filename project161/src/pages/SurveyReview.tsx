import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTreeStore } from '@/store/treeStore';
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye, FileCheck } from 'lucide-react';
import { AUDIT_RESULT_LABELS } from '@/types';

export default function SurveyReview() {
  const { auditRecords, updateAuditRecord } = useTreeStore();
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [filterResult, setFilterResult] = useState('');

  const filtered = auditRecords.filter((a) => !filterResult || a.result === filterResult);
  const pendingCount = auditRecords.filter((a) => a.result === 'pending').length;
  const approvedCount = auditRecords.filter((a) => a.result === 'approved').length;
  const rejectedCount = auditRecords.filter((a) => a.result === 'rejected').length;

  const selectedAudit = auditRecords.find((a) => a.id === selectedRecord);

  const handleAudit = (id: string, result: 'approved' | 'rejected') => {
    updateAuditRecord(id, {
      result,
      auditedAt: new Date().toISOString().split('T')[0],
      comment: result === 'approved' ? '审核通过' : '数据质量不达标，请补充完善后重新提交',
    });
    setSelectedRecord(null);
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-forest-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'approved': return 'bg-forest-100 text-forest-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-500';
    }
  };

  const qualityColor = (value: string) => {
    switch (value) {
      case 'accurate':
      case 'clear':
      case 'complete': return 'text-forest-600';
      case 'approximate':
      case 'acceptable':
      case 'partial': return 'text-amber-500';
      default: return 'text-red-500';
    }
  };

  const qualityLabel: Record<string, string> = {
    accurate: '精确', approximate: '近似', inaccurate: '不准确',
    clear: '清晰', acceptable: '可接受', poor: '模糊',
    complete: '完整', partial: '部分', incomplete: '不完整',
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/survey" className="p-2 rounded-lg hover:bg-forest-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-forest-600" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest-600">数据质量审核</h1>
          <p className="text-brown-700/70 mt-1">审核普查数据的坐标精度、照片质量和数据完整性</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-500">待审核</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{pendingCount}</p>
            </div>
            <Clock className="w-10 h-10 text-amber-300" />
          </div>
        </div>
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-forest-600">已通过</p>
              <p className="text-3xl font-bold text-forest-500 mt-1">{approvedCount}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-forest-400" />
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">已退回</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{rejectedCount}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-300" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {[
          { value: '', label: '全部' },
          { value: 'pending', label: '待审核' },
          { value: 'approved', label: '已通过' },
          { value: 'rejected', label: '已退回' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterResult(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterResult === f.value ? 'bg-forest-600 text-white' : 'bg-white border border-forest-200 text-brown-700/70 hover:bg-forest-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-forest-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-forest-50">
                  <th className="text-left text-sm font-medium text-forest-700 p-4">树种</th>
                  <th className="text-left text-sm font-medium text-forest-700 p-4">坐标精度</th>
                  <th className="text-left text-sm font-medium text-forest-700 p-4">照片质量</th>
                  <th className="text-left text-sm font-medium text-forest-700 p-4">数据完整性</th>
                  <th className="text-left text-sm font-medium text-forest-700 p-4">状态</th>
                  <th className="text-left text-sm font-medium text-forest-700 p-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id} className="border-t border-forest-50 hover:bg-forest-50/30 transition-colors">
                    <td className="p-4">
                      <Link to={`/archives/${record.treeId}`} className="font-medium text-brown-700 hover:text-forest-600">
                        {record.treeSpecies}
                      </Link>
                    </td>
                    <td className="p-4"><span className={`text-sm ${qualityColor(record.coordinateAccuracy)}`}>{qualityLabel[record.coordinateAccuracy]}</span></td>
                    <td className="p-4"><span className={`text-sm ${qualityColor(record.photoQuality)}`}>{qualityLabel[record.photoQuality]}</span></td>
                    <td className="p-4"><span className={`text-sm ${qualityColor(record.dataCompleteness)}`}>{qualityLabel[record.dataCompleteness]}</span></td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${getResultColor(record.result)}`}>
                        {getResultIcon(record.result)}
                        {AUDIT_RESULT_LABELS[record.result as keyof typeof AUDIT_RESULT_LABELS]}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedRecord(record.id)}
                        className="flex items-center gap-1 text-sm text-forest-600 hover:text-forest-800"
                      >
                        <Eye className="w-4 h-4" /> 详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          {selectedAudit ? (
            <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
              <h3 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                审核详情
              </h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-brown-700/60">树种</span>
                  <span className="font-medium">{selectedAudit.treeSpecies}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brown-700/60">审核员</span>
                  <span>{selectedAudit.auditor}</span>
                </div>
                <hr className="border-forest-100" />
                <div className="flex justify-between text-sm">
                  <span className="text-brown-700/60">坐标精度</span>
                  <span className={`font-medium ${qualityColor(selectedAudit.coordinateAccuracy)}`}>{qualityLabel[selectedAudit.coordinateAccuracy]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brown-700/60">照片质量</span>
                  <span className={`font-medium ${qualityColor(selectedAudit.photoQuality)}`}>{qualityLabel[selectedAudit.photoQuality]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brown-700/60">数据完整性</span>
                  <span className={`font-medium ${qualityColor(selectedAudit.dataCompleteness)}`}>{qualityLabel[selectedAudit.dataCompleteness]}</span>
                </div>
                {selectedAudit.comment && (
                  <>
                    <hr className="border-forest-100" />
                    <div>
                      <p className="text-xs text-brown-700/50 mb-1">审核意见</p>
                      <p className="text-sm text-brown-700/80">{selectedAudit.comment}</p>
                    </div>
                  </>
                )}
              </div>

              {selectedAudit.result === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAudit(selectedAudit.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> 通过
                  </button>
                  <button
                    onClick={() => handleAudit(selectedAudit.id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> 退回
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6 text-center">
              <Eye className="w-10 h-10 text-brown-700/20 mx-auto mb-3" />
              <p className="text-sm text-brown-700/50">点击"详情"查看审核记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
