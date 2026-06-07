import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { useAppStore } from '../store';
import StudentCard from '../components/Student/StudentCard';
import Modal from '../components/ui/Modal';
import type { Student, StyleAssessment } from '../types';

export default function Students() {
  const { students, addStudent } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: 6,
    className: '启蒙一班',
    enrollmentDate: new Date().toISOString().split('T')[0],
    artCharacteristics: '',
    parentExpectation: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random(),
    styleAssessment: {
      abstractTendency: 6,
      concreteTendency: 6,
      colorSense: 6,
      compositionAwareness: 6,
      notes: '',
    } as StyleAssessment,
  });

  const classes = ['all', ...new Set(students.map(s => s.className))];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm) || 
                          student.className.includes(searchTerm);
    const matchesClass = filterClass === 'all' || student.className === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Omit<Student, 'id'> = {
      ...formData,
    };
    addStudent(newStudent);
    setIsModalOpen(false);
    setFormData({
      name: '',
      age: 6,
      className: '启蒙一班',
      enrollmentDate: new Date().toISOString().split('T')[0],
      artCharacteristics: '',
      parentExpectation: '',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random(),
      styleAssessment: {
        abstractTendency: 6,
        concreteTendency: 6,
        colorSense: 6,
        compositionAwareness: 6,
        notes: '',
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-gray-800 mb-2">
            👨‍🎨 学生管理
          </h1>
          <p className="text-gray-500">
            共 {students.length} 位学员，查看和管理学员档案
          </p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} />
          添加学员
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索学员姓名或班级..."
            className="input-field pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <div className="flex gap-2">
            {classes.map(cls => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterClass === cls
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cls === 'all' ? '全部' : cls}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <div key={student.id} style={{ animationDelay: `${index * 100}ms` }}>
            <StudentCard student={student} />
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500">没有找到匹配的学员</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="✨ 新增学员" maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入学员姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年龄</label>
              <input
                type="number"
                min="3"
                max="18"
                required
                className="input-field"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">班级</label>
              <select
                className="input-field"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              >
                <option>启蒙一班</option>
                <option>启蒙二班</option>
                <option>创意一班</option>
                <option>创意二班</option>
                <option>进阶一班</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">入学日期</label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.enrollmentDate}
                onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">艺术发展特点</label>
            <textarea
              rows={3}
              className="input-field"
              value={formData.artCharacteristics}
              onChange={(e) => setFormData({ ...formData, artCharacteristics: e.target.value })}
              placeholder="描述学员的艺术天赋、兴趣爱好、学习特点等..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">家长期望</label>
            <textarea
              rows={3}
              className="input-field"
              value={formData.parentExpectation}
              onChange={(e) => setFormData({ ...formData, parentExpectation: e.target.value })}
              placeholder="家长对学员学习绘画的期望和目标..."
            />
          </div>

          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6">
            <h3 className="font-display text-lg text-gray-800 mb-4">🎨 绘画风格初步评估</h3>
            <div className="space-y-5">
              {[
                { key: 'abstractTendency', label: '抽象倾向' },
                { key: 'concreteTendency', label: '具象倾向' },
                { key: 'colorSense', label: '色彩感' },
                { key: 'compositionAwareness', label: '构图意识' },
              ].map(item => (
                <div key={item.key} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-gray-600 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.styleAssessment[item.key as keyof StyleAssessment] as number}
                      onChange={(e) => setFormData({
                        ...formData,
                        styleAssessment: {
                          ...formData.styleAssessment,
                          [item.key]: parseInt(e.target.value),
                        },
                      })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <span className="w-10 text-center font-medium text-primary-600">
                      {formData.styleAssessment[item.key as keyof StyleAssessment]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">评估备注</label>
              <textarea
                rows={2}
                className="input-field"
                value={formData.styleAssessment.notes}
                onChange={(e) => setFormData({
                  ...formData,
                  styleAssessment: {
                    ...formData.styleAssessment,
                    notes: e.target.value,
                  },
                })}
                placeholder="记录对学员绘画风格的观察和建议..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              确认添加
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
