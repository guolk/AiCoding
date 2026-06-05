import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, UserPlus, X, Camera } from 'lucide-react';
import { Student } from '../../types';
import { useStudentStore } from '../../store/useStudentStore';
import { formatDateCN, generateId } from '../../utils/helpers';

const StudentsPage: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, updateStudentPhoto } = useStudentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    studentNo: '',
    gender: '男' as '男' | '女',
    birthDate: '',
    parentName: '',
    parentPhone: '',
    address: '',
    notes: '',
    photoUrl: ''
  });

  const filteredStudents = students.filter(s =>
    s.name.includes(searchTerm) ||
    s.studentNo.includes(searchTerm) ||
    s.parentName.includes(searchTerm)
  );

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      studentNo: '',
      gender: '男',
      birthDate: '',
      parentName: '',
      parentPhone: '',
      address: '',
      notes: '',
      photoUrl: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      studentNo: student.studentNo,
      gender: student.gender,
      birthDate: student.birthDate,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      address: student.address,
      notes: student.notes,
      photoUrl: student.photoUrl
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const basePhotoUrl = formData.gender === '男'
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=boy${generateId()}&backgroundColor=b6e3f4`
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=girl${generateId()}&backgroundColor=ffd5dc`;
    
    const photoData = formData.photoUrl || basePhotoUrl;
    
    if (editingStudent) {
      updateStudent(editingStudent.id, { ...formData, photoUrl: photoData });
    } else {
      addStudent({ ...formData, photoUrl: photoData });
    }
    setIsModalOpen(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, photoUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该学生信息吗？')) {
      deleteStudent(id);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">学生档案</h1>
          <p className="text-slate-500 mt-1 text-sm">管理班级学生的基本信息和照片</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
        >
          <UserPlus size={18} />
          添加学生
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索学生姓名、学号、家长姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">学生</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">学号</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">性别</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">出生日期</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">家长</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">联系电话</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">特殊情况</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-10 h-10 rounded-xl object-cover shadow-sm"
                      />
                      <span className="font-medium text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{student.studentNo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      student.gender === '男' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {student.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDateCN(student.birthDate)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{student.parentName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{student.parentPhone}</td>
                  <td className="px-6 py-4">
                    {student.notes ? (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">{student.notes}</span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-500 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-400">暂无匹配的学生信息</p>
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
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingStudent ? '编辑学生信息' : '添加学生'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <img
                      src={formData.photoUrl || (formData.gender === '男' 
                        ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4'
                        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=ffd5dc')}
                      alt="头像预览"
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-100"
                    />
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors shadow-lg">
                      <Camera size={14} />
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">学生照片</p>
                    <p className="text-sm text-slate-500 mt-1">点击相机图标上传照片，支持JPG、PNG格式</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">学生姓名 *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                      placeholder="请输入学生姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">学号 *</label>
                    <input
                      type="text"
                      required
                      value={formData.studentNo}
                      onChange={(e) => setFormData({ ...formData, studentNo: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                      placeholder="请输入学号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">性别 *</label>
                    <div className="flex gap-4">
                      {(['男', '女'] as const).map(gender => (
                        <label key={gender} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={formData.gender === gender}
                            onChange={() => setFormData({ ...formData, gender })}
                            className="w-4 h-4 text-amber-500 focus:ring-amber-400"
                          />
                          <span className="text-sm text-slate-700">{gender}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">出生日期</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">家长姓名</label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                      placeholder="请输入家长姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">联系电话</label>
                    <input
                      type="tel"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                      placeholder="请输入联系电话"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">家庭住址</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                    placeholder="请输入家庭住址"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">特殊情况备注</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all resize-none"
                    placeholder="如有特殊情况请在此备注，如过敏史、身体状况等"
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
                    {editingStudent ? '保存修改' : '添加学生'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentsPage;
