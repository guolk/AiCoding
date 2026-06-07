import { useNavigate } from 'react-router-dom';
import { Calendar, Palette, User } from 'lucide-react';
import type { Student } from '../../types';
import { useState } from 'react';

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-primary-600 bg-primary-100';
    return 'text-gray-600 bg-gray-100';
  };

  const avgScore = Math.round(
    (student.styleAssessment.colorSense + 
     student.styleAssessment.compositionAwareness +
     student.styleAssessment.abstractTendency +
     student.styleAssessment.concreteTendency) / 4
  );

  return (
    <div
      className="card cursor-pointer group animate-slide-up"
      onClick={() => navigate(`/students/${student.id}`)}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className={`w-16 h-16 rounded-2xl overflow-hidden bg-gradient-warm flex items-center justify-center ${!imageLoaded ? 'animate-pulse' : ''}`}>
            {imageLoaded ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
                style={{ display: 'none' }}
              />
            )}
            {!imageLoaded && <User size={24} className="text-white" />}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getScoreColor(avgScore)}`}>
            {avgScore}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-gray-800 group-hover:text-primary-600 transition-colors">
            {student.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span className="tag bg-secondary-50 text-secondary-700">
              {student.age}岁
            </span>
            <span className="tag bg-purple-50 text-purple-700">
              {student.className}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
            <Calendar size={12} />
            <span>入学 {student.enrollmentDate}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {student.artCharacteristics}
      </p>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <Palette size={14} className="text-primary-400" />
        <span className="text-xs text-gray-500">风格标签：</span>
        <span className="tag bg-primary-50 text-primary-600 text-xs">
          {student.styleAssessment.abstractTendency > student.styleAssessment.concreteTendency ? '抽象型' : '具象型'}
        </span>
        <span className="tag bg-pink-50 text-pink-600 text-xs">
          色彩感 {student.styleAssessment.colorSense}/10
        </span>
      </div>
    </div>
  );
}
