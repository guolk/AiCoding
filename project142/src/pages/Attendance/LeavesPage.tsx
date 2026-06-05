import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, FileText, Clock, User, Calendar, Download, Eye, AlertCircle } from 'lucide-react';
import { useStudentStore } from '../../store/useStudentStore';
import { useCommunicationStore } from '../../store/useCommunicationStore';
import { LeaveRequest, LeaveStatus } from '../../types';
import { formatDateCN } from '../../utils/helpers';

const LeavesPage: React.FC = () => {
  const { students } = useStudentStore();
  const { leaves, addLeave, updateLeaveStatus, deleteLeave } = useCommunicationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [viewingLeave, setViewingLeave] = useState<LeaveRequest | null>(null);

  const getStatusConfig = (status: LeaveStatus) => {
    const configs: Record<LeaveStatus, { label: string; color: string; bgColor: string }> = {
      pending: { label: '待审核', color: 'text-amber-700', bgColor: 'bg-amber-100' },
      approved: { label: '已批准', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
      rejected: { label: '已拒绝', color: 'text-red-700', bgColor: 'bg-red-100' }
    };
    return configs[status];
  };

  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.name || '未知';
  };

  const getStudentPhoto = (studentId: string) => {
    return students.find(s => s.id === studentId)?.photoUrl || '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLeave(formData.studentId, formData.startDate, formData.endDate, formData.reason);
    setIsModalOpen(false);
    setFormData({ studentId: '', startDate: '', endDate: '', reason: '' });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">请假条管理</h1>
          <p className="text-slate-500 mt-1 text-sm">审核和管理学生请假申请</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
        >
          <Plus size={16} />
          登记请假
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-3 gap-5">
        {(['pending', 'approved', 'rejected'] as LeaveStatus[]).map((status, index) => {
          const config = getStatusConfig(status);
          const count = leaves.filter(l => l.status === status).length;
          return (
            <motion.div
              key={status}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                {status === 'pending' ? <Clock size={22} className={config.color} /> : 
                 status === 'approved' ? <Check size={22} className={config.color} /> : 
                 <X size={22} className={config.color} />}
              </div>
              <div>
                <p className="text-sm text-slate-500">{config.label}</p>
                <p className="text-2xl font-bold text-slate-800">{count}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">请假申请列表</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {leaves.map((leave, index) => {
            const student = students.find(s => s.id === leave.studentId);
            const statusConfig = getStatusConfig(leave.status);
            return (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="p-5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={getStudentPhoto(leave.studentId)}
                    alt={getStudentName(leave.studentId)}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-800">{getStudentName(leave.studentId)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDateCN(leave.startDate)} ~ {formatDateCN(leave.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle size={14} />
                        {leave.reason}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingLeave(leave)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                      title="查看详情"
                    >
                      <Eye size={16} />
                    </button>
                    {leave.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateLeaveStatus(leave.id, 'approved')}
                          className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-slate-500 hover:text-emerald-600"
                          title="批准"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => updateLeaveStatus(leave.id, 'rejected')}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-500 hover:text-red-600"
                          title="拒绝"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => confirm('确定删除此请假记录吗？') && deleteLeave(leave.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-500 hover:text-red-600"
                      title="删除"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        {leaves.length === 0 && (
          <div className="p-12 text-center">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400">暂无请假记录</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">登记请假</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">学生 *</label>
                  <select
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                  >
                    <option value="">请选择学生</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.studentNo})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">开始日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">结束日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">请假原因 *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all resize-none"
                    placeholder="请输入请假原因"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
                  >
                    提交
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingLeave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setViewingLeave(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">请假条详情</h2>
                <button
                  onClick={() => setViewingLeave(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <img
                    src={getStudentPhoto(viewingLeave.studentId)}
                    alt={getStudentName(viewingLeave.studentId)}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">{getStudentName(viewingLeave.studentId)}</h3>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusConfig(viewingLeave.status).bgColor} ${getStatusConfig(viewingLeave.status).color}`}>
                      {getStatusConfig(viewingLeave.status).label}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-500">请假时间</p>
                      <p className="font-medium text-slate-800">
                        {formatDateCN(viewingLeave.startDate)} ~ {formatDateCN(viewingLeave.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-500">请假原因</p>
                      <p className="font-medium text-slate-800">{viewingLeave.reason}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeavesPage;
