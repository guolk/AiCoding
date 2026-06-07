import { useState } from 'react';
import { Search, Plus, Calendar } from 'lucide-react';
import { useAppStore } from '../store';
import CourseCard from '../components/Course/CourseCard';

export default function Courses() {
  const { courses, getStudentById } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState('all');

  const sortedCourses = [...courses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredCourses = sortedCourses.filter(course => {
    const student = getStudentById(course.studentId);
    const matchesSearch = course.topic.includes(searchTerm) || 
                          (student?.name.includes(searchTerm)) ||
                          course.techniques.some(t => t.includes(searchTerm));
    const matchesStudent = filterStudent === 'all' || course.studentId === filterStudent;
    return matchesSearch && matchesStudent;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-gray-800 mb-2">
            📚 课程教学记录
          </h1>
          <p className="text-gray-500">
            共 {courses.length} 条课程记录，记录教学内容和课堂观察
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          添加课程
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索课程主题、学员或技法..."
            className="input-field pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input-field max-w-xs"
          value={filterStudent}
          onChange={(e) => setFilterStudent(e.target.value)}
        >
          <option value="all">全部学员</option>
          {Array.from(new Set(courses.map(c => c.studentId))).map(studentId => {
            const student = getStudentById(studentId);
            return (
              <option key={studentId} value={studentId}>
                {student?.name}
              </option>
            );
          })}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <div key={course.id} style={{ animationDelay: `${index * 100}ms` }}>
            <CourseCard 
              course={course} 
              student={getStudentById(course.studentId)} 
            />
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500">没有找到匹配的课程记录</p>
        </div>
      )}
    </div>
  );
}
