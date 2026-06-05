import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, Crown, X, Save, UserPlus, UserMinus } from 'lucide-react';
import { useStudentStore } from '../../store/useStudentStore';
import { useClassroomStore } from '../../store/useClassroomStore';
import { StudentGroup } from '../../types';

const GroupsPage: React.FC = () => {
  const { students } = useStudentStore();
  const { groups, groupMembers, addGroup, updateGroup, deleteGroup, addGroupMember, removeGroupMember, updateGroupMemberRole, getGroupMembers } = useClassroomStore();
  
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
  const [groupForm, setGroupForm] = useState({ name: '', description: '', assignment: '' });
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groups[0]?.id || null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberRole, setMemberRole] = useState('成员');

  const selectedGroup = useMemo(() => groups.find(g => g.id === selectedGroupId), [groups, selectedGroupId]);
  const selectedGroupMembers = useMemo(() => selectedGroupId ? getGroupMembers(selectedGroupId) : [], [groupMembers, selectedGroupId, getGroupMembers]);
  
  const availableStudents = useMemo(() => {
    const memberIds = new Set(selectedGroupMembers.map(m => m.studentId));
    return students.filter(s => !memberIds.has(s.id));
  }, [students, selectedGroupMembers]);

  const groupColors = [
    'from-blue-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-purple-500 to-pink-500',
    'from-red-500 to-rose-500',
    'from-cyan-500 to-blue-500',
  ];

  const handleSaveGroup = () => {
    if (!groupForm.name.trim()) return;
    
    if (editingGroup) {
      updateGroup(editingGroup.id, groupForm);
    } else {
      addGroup(groupForm);
    }
    
    setShowGroupModal(false);
    setEditingGroup(null);
    setGroupForm({ name: '', description: '', assignment: '' });
  };

  const handleEditGroup = (group: StudentGroup) => {
    setEditingGroup(group);
    setGroupForm({ name: group.name, description: group.description, assignment: group.assignment });
    setShowGroupModal(true);
  };

  const handleDeleteGroup = (id: string) => {
    if (window.confirm('确定要删除这个小组吗？')) {
      deleteGroup(id);
      if (selectedGroupId === id && groups.length > 1) {
        setSelectedGroupId(groups.find(g => g.id !== id)?.id || null);
      }
    }
  };

  const handleAddMember = (studentId: string) => {
    if (!selectedGroupId) return;
    addGroupMember(selectedGroupId, studentId, memberRole);
    setShowAddMemberModal(false);
  };

  const getStudentById = (id: string) => students.find(s => s.id === id);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">小组管理</h1>
          <p className="text-slate-500 mt-1 text-sm">创建学习小组，分配组员，管理小组作业</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingGroup(null); setGroupForm({ name: '', description: '', assignment: '' }); setShowGroupModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
        >
          <Plus size={16} />
          创建小组
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-4 gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">小组列表</h3>
          </div>
          <div className="p-3 max-h-[500px] overflow-y-auto">
            {groups.map((group, index) => {
              const members = getGroupMembers(group.id);
              return (
                <motion.div
                  key={group.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all mb-2 ${
                    selectedGroupId === group.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${groupColors[index % groupColors.length]} flex items-center justify-center text-white`}>
                        <Users size={18} />
                      </div>
                      <div>
                        <p className={`font-medium ${selectedGroupId === group.id ? 'text-white' : 'text-slate-800'}`}>{group.name}</p>
                        <p className={`text-xs mt-1 ${selectedGroupId === group.id ? 'text-white/80' : 'text-slate-500'}`}>{members.length} 名成员</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditGroup(group); }}
                        className={`p-1.5 rounded-lg ${selectedGroupId === group.id ? 'hover:bg-white/20' : 'hover:bg-slate-100'}`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                        className={`p-1.5 rounded-lg ${selectedGroupId === group.id ? 'hover:bg-white/20' : 'hover:bg-slate-100'}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-3 space-y-6"
        >
          {selectedGroup ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{selectedGroup.name}</h3>
                      <p className="text-slate-500 mt-1">{selectedGroup.description}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddMemberModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-500/20"
                    >
                      <UserPlus size={14} />
                      添加成员
                    </motion.button>
                  </div>
                  {selectedGroup.assignment && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-sm font-medium text-amber-800 mb-1">当前任务</p>
                      <p className="text-sm text-amber-700">{selectedGroup.assignment}</p>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-4">小组成员</h4>
                  {selectedGroupMembers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Users size={48} className="mx-auto mb-3 opacity-50" />
                      <p>暂无成员，点击上方按钮添加</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4">
                      {selectedGroupMembers.map((member, index) => {
                        const student = getStudentById(member.studentId);
                        if (!student) return null;
                        return (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-slate-50 rounded-xl p-4 relative group"
                          >
                            <button
                              onClick={() => removeGroupMember(member.id)}
                              className="absolute top-2 right-2 p-1 bg-red-100 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                            >
                              <UserMinus size={12} />
                            </button>
                            <img
                              src={student.photoUrl}
                              alt={student.name}
                              className="w-16 h-16 rounded-xl mx-auto mb-3 object-cover"
                            />
                            <p className="font-medium text-center text-slate-800">{student.name}</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              {member.role === '组长' && <Crown size={14} className="text-amber-500" />}
                              <select
                                value={member.role}
                                onChange={(e) => updateGroupMemberRole(member.id, e.target.value)}
                                className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                              >
                                <option value="组长">组长</option>
                                <option value="成员">成员</option>
                                <option value="记录员">记录员</option>
                                <option value="发言人">发言人</option>
                              </select>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-400">
              <Users size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">请选择或创建一个小组</p>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showGroupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowGroupModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-6">{editingGroup ? '编辑小组' : '创建小组'}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">小组名称</label>
                  <input
                    type="text"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    placeholder="如：第一小组、探索者小组"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">小组描述</label>
                  <textarea
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    placeholder="简述小组的特点或目标"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">当前任务</label>
                  <textarea
                    value={groupForm.assignment}
                    onChange={(e) => setGroupForm({ ...groupForm, assignment: e.target.value })}
                    placeholder="分配给小组的任务或作业"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveGroup}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
                >
                  {editingGroup ? '保存修改' : '创建小组'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddMemberModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAddMemberModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">添加成员</h3>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">成员角色</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="组长">组长</option>
                  <option value="成员">成员</option>
                  <option value="记录员">记录员</option>
                  <option value="发言人">发言人</option>
                </select>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {availableStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Users size={40} className="mx-auto mb-3 opacity-50" />
                    <p>所有学生都已加入该小组</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {availableStudents.map((student) => (
                      <motion.button
                        key={student.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAddMember(student.id)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all text-left"
                      >
                        <img
                          src={student.photoUrl}
                          alt={student.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.studentNo}</p>
                        </div>
                      </motion.button>
                    ))}
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

export default GroupsPage;
