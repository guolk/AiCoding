import { useNavigate } from 'react-router-dom';
import { Calendar, User, Palette, Award } from 'lucide-react';
import type { CourseRecord, Student } from '../../types';

interface CourseCardProps {
  course: CourseRecord;
  student?: Student;
}

export default function CourseCard({ course, student }: CourseCardProps) {
  const navigate = useNavigate();

  const getParticipationColor = (level: number) => {
    if (level >= 9) return 'bg-green-500';
    if (level >= 7) return 'bg-primary-500';
    if (level >= 5) return 'bg-yellow-500';
    return 'bg-red-400';
  };

  return (
    <div
      className="card cursor-pointer group animate-slide-up"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {student && (
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-warm flex-shrink-0">
              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h3 className="font-display text-lg text-gray-800 group-hover:text-primary-600 transition-colors">
              {course.topic}
            </h3>
            {student && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <User size={14} />
                <span>{student.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Calendar size={14} />
          <span>{course.date}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">参与度</span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getParticipationColor(course.observation.participationLevel)} transition-all duration-500`}
              style={{ width: `${course.observation.participationLevel * 10}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600">
            {course.observation.participationLevel}/10
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {course.techniques.slice(0, 3).map((tech, index) => (
          <span key={index} className="tag bg-secondary-50 text-secondary-700 text-xs">
            {tech}
          </span>
        ))}
        {course.techniques.length > 3 && (
          <span className="tag bg-gray-100 text-gray-500 text-xs">
            +{course.techniques.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Palette size={14} className="text-primary-400" />
          <span className="text-xs text-gray-500">
            {course.materials.length} 种材料
          </span>
        </div>
        {course.observation.participationLevel >= 9 && (
          <div className="flex items-center gap-1 text-yellow-500">
            <Award size={14} />
            <span className="text-xs font-medium">优秀课堂</span>
          </div>
        )}
      </div>
    </div>
  );
}
