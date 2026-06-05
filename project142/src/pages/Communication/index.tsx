import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Phone, MessageSquare, Users, Calendar, Trash2, Edit2, X, Save, Megaphone, Home, FileText } from 'lucide-react';
import { useStudentStore } from '../../store/useStudentStore';
import { useCommunicationStore } from '../../store/useCommunicationStore';
import { CommunicationType, Announcement, HomeVisit, Communication } from '../../types';
import { formatDateCN } from '../../utils/helpers';

type TabType = 'communications' | 'announcements' | 'homeVisits';

const communicationTypeConfig: Record<CommunicationType, { label: string; icon: React.ReactNode; color: string }> = {
  phone: { label: '电话', icon: <Phone size={14} />, color: 'bg-blue-500' },
  message: { label: '短信', icon: <MessageSquare size={14} />, color: 'bg-green-500' },
  meeting: { label: '面谈', icon: <Users size={14} />, color: 'bg-purple-500' },
  other: { label: '其他', icon: <FileText size={14} />, color: 'bg-slate-500' },
};

const CommunicationPage: React.FC = () => {
  const { students } = useStudentStore();
  const { communications, announcements, homeVisits, addCommunication, deleteCommunication, addAnnouncement, updateAnnouncement, deleteAnnouncement, addHomeVisit, updateHomeVisit, deleteHomeVisit } = useCommunicationStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('communications');
  
  const [showCommModal, setShowCommModal] = useState(false);
  const [commForm, setCommForm] = useState({ studentId: '', type: 'phone' as CommunicationType, reason: '', content: '', operator: '张老师' });
  
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [annForm, setAnnForm] = useState({ title: '', content: '', author: '张老师' });
  
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<HomeVisit | null>(null);
  const [visitForm, setVisitForm] = useState({ studentId: '', date: new Date().toISOString().split('T')[0], purpose: '', content: '', participants: '' });

  const [viewingItem, setViewingItem] = useState<Communication | Announcement | HomeVisit | null>(null);

  const getStudentById = (id: string) => students.find(s => s.id === id);

  const sortedCommunications = useMemo(() => [...communications].sort((a, b) => b.date.localeCompare(a.date)), [communications]);
  const sortedAnnouncements = useMemo(() => [...announcements].sort((a, b) => b.date.localeCompare(a.date)), [announcements]);
  const sortedVisits = useMemo(() => [...homeVisits].sort((a, b) => b.date.localeCompare(a.date)), [homeVisits]);

  const handleSaveComm = () => {
    if (!commForm.studentId || !commForm.reason || !commForm.content) return;
    addCommunication(commForm.studentId, commForm.type, commForm.reason, commForm.content, commForm.operator);
    setShowCommModal(false);
    setCommForm({ studentId: '', type: 'phone', reason: '', content: '', operator: '张老师' });
  };

  const handleSaveAnn = () => {
    if (!annForm.title || !annForm.content) return;
    
    if (editingAnn) {
      updateAnnouncement(editingAnn.id, annForm);
    } else {
      addAnnouncement(annForm.title, annForm.content, annForm.author);
    }
    
    setShowAnnModal(false);
    setEditingAnn(null);
    setAnnForm({ title: '', content: '', author: '张老师' });
  };

  const handleEditAnn = (ann: Announcement) => {
    setEditingAnn(ann);
    setAnnForm({ title: ann.title, content: ann.content, author: ann.author });
    setShowAnnModal(true);
  };

  const handleDeleteAnn = (id: string) => {
    if (window.confirm('确定要删除这条公告吗？')) {
      deleteAnnouncement(id);
    }
  };

  const handleSaveVisit = () => {
    if (!visitForm.studentId || !visitForm.purpose || !visitForm.content) return;
    
    if (editingVisit) {
      updateHomeVisit(editingVisit.id, visitForm);
    } else {
      addHomeVisit(visitForm.studentId, visitForm.date, visitForm.purpose, visitForm.content, visitForm.participants);
    }
    
    setShowVisitModal(false);
    setEditingVisit(null);
    setVisitForm({ studentId: '', date: new Date().toISOString().split('T')[0], purpose: '', content: '', participants: '' });
  };

  const handleEditVisit = (visit: HomeVisit) => {
    setEditingVisit(visit);
    setVisitForm({ studentId: visit.studentId, date: visit.date, purpose: visit.purpose, content: visit.content, participants: visit.participants });
    setShowVisitModal(true);
  };

  const handleDeleteVisit = (id: string) => {
    if (window.confirm('确定要删除这条家访记录吗？')) {
      deleteHomeVisit(id);
    }
  };

  const tabs = [
    { key: 'communications' as TabType, label: '联系记录', icon: <Phone size={18} />, count: communications.length },
    { key: 'announcements' as TabType, label: '班级公告', icon: <Megaphone size={18} />, count: announcements.length },
    { key: 'homeVisits' as TabType, label: '家访记录', icon: <Home size={18} />, count: homeVisits.length },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">家校沟通</h1>
          <p className="text-slate-500 mt-1 text-sm">记录与家长的沟通，发布班级公告，整理家访记录</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (activeTab === 'communications') {
              setShowCommModal(true);
            } else if (activeTab === 'announcements') {
              setEditingAnn(null);
              setAnnForm({ title: '', content: '', author: '张老师' });
              setShowAnnModal(true);
            } else {
              setEditingVisit(null);
              setVisitForm({ studentId: '', date: new Date().toISOString().split('T')[0], purpose: '', content: '', participants: '' });
              setShowVisitModal(true);
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
        >
          <Plus size={16} />
          新建{activeTab === 'communications' ? '联系记录' : activeTab === 'announcements' ? '公告' : '家访记录'}
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="flex border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === tab.key
                  ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'communications' && (
              <motion.div
                key="communications"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {sortedCommunications.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Phone size={48} className="mx-auto mb-3 opacity-50" />
                    <p>暂无联系记录</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {sortedCommunications.map((comm, index) => {
                      const student = getStudentById(comm.studentId);
                      const typeConfig = communicationTypeConfig[comm.type];
                      return (
                        <motion.div
                          key={comm.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="bg-slate-50 rounded-xl p-5 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <img
                                src={student?.photoUrl}
                                alt={student?.name}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-slate-800">{student?.name}</p>
                                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white ${typeConfig.color}`}>
                                    {typeConfig.icon}
                                    {typeConfig.label}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{student?.parentName} · {student?.parentPhone}</p>
                                <p className="text-sm font-medium text-slate-700 mt-2">{comm.reason}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setViewingItem(comm)}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                              >
                                <FileText size={14} className="text-slate-400" />
                              </button>
                              <button
                                onClick={() => { if (window.confirm('确定删除？')) deleteCommunication(comm.id); }}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
                            <span>{formatDateCN(comm.date)}</span>
                            <span>记录人：{comm.operator}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'announcements' && (
              <motion.div
                key="announcements"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {sortedAnnouncements.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Megaphone size={48} className="mx-auto mb-3 opacity-50" />
                    <p>暂无班级公告</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedAnnouncements.map((ann, index) => (
                      <motion.div
                        key={ann.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
                              <Megaphone size={18} />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-lg">{ann.title}</h4>
                              <p className="text-sm text-slate-500">{formatDateCN(ann.date)} · {ann.author}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditAnn(ann)}
                              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                            >
                              <Edit2 size={14} className="text-slate-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnn(ann.id)}
                              className="p-2 hover:bg-red-100/50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'homeVisits' && (
              <motion.div
                key="homeVisits"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {sortedVisits.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Home size={48} className="mx-auto mb-3 opacity-50" />
                    <p>暂无家访记录</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedVisits.map((visit, index) => {
                      const student = getStudentById(visit.studentId);
                      return (
                        <motion.div
                          key={visit.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-slate-50 rounded-xl p-5 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <img
                                src={student?.photoUrl}
                                alt={student?.name}
                                className="w-14 h-14 rounded-xl object-cover"
                              />
                              <div>
                                <div className="flex items-center gap-3">
                                  <h4 className="font-bold text-slate-800">{student?.name} 家访记录</h4>
                                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                    <Calendar size={12} />
                                    {formatDateCN(visit.date)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">家访目的：{visit.purpose}</p>
                                <p className="text-sm text-slate-500">参与人员：{visit.participants}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setViewingItem(visit)}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                              >
                                <FileText size={14} className="text-slate-400" />
                              </button>
                              <button
                                onClick={() => handleEditVisit(visit)}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                              >
                                <Edit2 size={14} className="text-slate-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteVisit(visit.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4 bg-white rounded-xl">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{visit.content}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCommModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCommModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-6">记录联系</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">选择学生</label>
                  <select
                    value={commForm.studentId}
                    onChange={(e) => setCommForm({ ...commForm, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="">请选择学生</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - {s.parentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">联系方式</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(communicationTypeConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setCommForm({ ...commForm, type: key as CommunicationType })}
                        className={`flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium transition-all ${
                          commForm.type === key
                            ? `${config.color} text-white`
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {config.icon}
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">联系原因</label>
                  <input
                    type="text"
                    value={commForm.reason}
                    onChange={(e) => setCommForm({ ...commForm, reason: e.target.value })}
                    placeholder="如：作业未完成、表现优秀等"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">沟通内容</label>
                  <textarea
                    value={commForm.content}
                    onChange={(e) => setCommForm({ ...commForm, content: e.target.value })}
                    placeholder="详细记录沟通内容..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">记录人</label>
                  <input
                    type="text"
                    value={commForm.operator}
                    onChange={(e) => setCommForm({ ...commForm, operator: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCommModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveComm}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
                >
                  保存记录
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAnnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAnnModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-6">{editingAnn ? '编辑公告' : '发布公告'}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">公告标题</label>
                  <input
                    type="text"
                    value={annForm.title}
                    onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                    placeholder="如：期中考试家长会通知"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">公告内容</label>
                  <textarea
                    value={annForm.content}
                    onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                    placeholder="请输入公告内容..."
                    rows={5}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">发布人</label>
                  <input
                    type="text"
                    value={annForm.author}
                    onChange={(e) => setAnnForm({ ...annForm, author: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAnnModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveAnn}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
                >
                  {editingAnn ? '保存修改' : '发布公告'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVisitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowVisitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-6">{editingVisit ? '编辑家访记录' : '记录家访'}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">选择学生</label>
                  <select
                    value={visitForm.studentId}
                    onChange={(e) => setVisitForm({ ...visitForm, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="">请选择学生</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - {s.parentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">家访日期</label>
                  <input
                    type="date"
                    value={visitForm.date}
                    onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">家访目的</label>
                  <input
                    type="text"
                    value={visitForm.purpose}
                    onChange={(e) => setVisitForm({ ...visitForm, purpose: e.target.value })}
                    placeholder="如：学习情况交流、家庭环境了解等"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">参与人员</label>
                  <input
                    type="text"
                    value={visitForm.participants}
                    onChange={(e) => setVisitForm({ ...visitForm, participants: e.target.value })}
                    placeholder="如：张老师、李老师、学生妈妈"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">家访记录</label>
                  <textarea
                    value={visitForm.content}
                    onChange={(e) => setVisitForm({ ...visitForm, content: e.target.value })}
                    placeholder="详细记录家访内容、交流要点、后续计划等..."
                    rows={6}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowVisitModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveVisit}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
                >
                  {editingVisit ? '保存修改' : '保存记录'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setViewingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">查看详情</h3>
                <button
                  onClick={() => setViewingItem(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="prose prose-slate max-w-none">
                {'content' in viewingItem && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{viewingItem.content}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunicationPage;
