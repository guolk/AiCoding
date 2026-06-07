import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronRight, User, BookOpen, Award } from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { cn } from '@/lib/utils';

const grades = [
  { value: undefined, label: '全部年级' },
  { value: 1, label: '一年级' },
  { value: 2, label: '二年级' },
  { value: 3, label: '三年级' },
  { value: 4, label: '四年级' },
  { value: 5, label: '五年级' },
  { value: 6, label: '六年级' },
];

export default function StudentList() {
  const { students, fetchStudents, setCurrentStudent } = useStudentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchStudents(searchQuery, selectedGrade);
  }, [fetchStudents, searchQuery, selectedGrade]);

  const handleStudentClick = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    setCurrentStudent(student || null);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索学生姓名、班级、兴趣..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={selectedGrade ?? ''}
              onChange={(e) => setSelectedGrade(e.target.value ? Number(e.target.value) : undefined)}
              className="input-field pl-10 pr-10 appearance-none bg-white cursor-pointer"
            >
              {grades.map((grade) => (
                <option key={grade.label} value={grade.value ?? ''}>
                  {grade.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student, index) => (
          <Link
            key={student.id}
            to={`/students/${student.id}`}
            onClick={() => handleStudentClick(student.id)}
            className="card p-5 card-hover animate-slide-up group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4 mb-4">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-16 h-16 rounded-2xl"
              />
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                  {student.name}
                </h3>
                <p className="text-sm text-slate-500">{student.grade}年级{student.className}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    student.grade <= 2 ? "bg-green-100 text-green-700" :
                    student.grade <= 4 ? "bg-blue-100 text-blue-700" :
                    "bg-purple-100 text-purple-700"
                  )}>
                    {student.grade <= 2 ? "低年级" : student.grade <= 4 ? "中年级" : "高年级"}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                <span className="truncate">兴趣：{student.interests}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span className="truncate">{student.learningStyle}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> 作品
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" /> 评估
                </span>
              </div>
              <span className="text-xs text-slate-400">
                档案创建于 {new Date(student.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {students.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-display text-lg font-medium text-slate-700 mb-2">没有找到匹配的学生</h3>
          <p className="text-slate-500">请尝试调整搜索条件或筛选年级</p>
        </div>
      )}
    </div>
  );
}
