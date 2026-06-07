import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { useAppStore } from '../store';
import StudentCard from '../components/Student/StudentCard';

export default function Students() {
  const { students } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  const classes = ['all', ...new Set(students.map(s => s.className))];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm) || 
                          student.className.includes(searchTerm);
    const matchesClass = filterClass === 'all' || student.className === filterClass;
    return matchesSearch && matchesClass;
  });

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
        <button className="btn-primary flex items-center gap-2">
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
    </div>
  );
}
