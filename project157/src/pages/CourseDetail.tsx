import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, BookOpen, Eye, MessageCircle, Palette, Brush, Target, Heart } from 'lucide-react';
import { useAppStore } from '../store';
import Tabs from '../components/ui/Tabs';
import RatingBar from '../components/ui/RatingBar';
import type { TabType } from '../types';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, getStudentById, getArtworksByStudentId } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [course, setCourse] = useState(courses.find(c => c.id === id));
  const [student, setStudent] = useState(course ? getStudentById(course.studentId) : undefined);
  const [artworks, setArtworks] = useState(course ? getArtworksByStudentId(course.studentId).filter(a => a.courseId === id) : []);

  useEffect(() => {
    if (id) {
      const foundCourse = courses.find(c => c.id === id);
      setCourse(foundCourse);
      if (foundCourse) {
        setStudent(getStudentById(foundCourse.studentId));
        setArtworks(getArtworksByStudentId(foundCourse.studentId).filter(a => a.courseId === id));
      }
    }
  }, [id, courses, getStudentById, getArtworksByStudentId]);

  if (!course || !student) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-gray-500 mb-4">未找到该课程记录</p>
        <button onClick={() => navigate('/courses')} className="btn-primary">
          返回课程列表
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: '课程内容', icon: <BookOpen size={18} /> },
    { id: 'style', label: '课堂观察', icon: <Eye size={18} /> },
    { id: 'communication', label: '作品点评', icon: <MessageCircle size={18} /> },
  ];

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        返回课程列表
      </button>

      <div className="card mb-6 bg-gradient-to-r from-secondary-50 to-primary-50">
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-warm shadow-soft flex-shrink-0">
            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-display text-gray-800">
                {course.topic}
              </h1>
              <span className="tag bg-white text-primary-600">
                <Calendar size={14} className="mr-1" />
                {course.date}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">学员：</span>
              <span className="font-medium text-gray-800">{student.name}</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{student.className}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabType)} />

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-display text-gray-800">教学目标</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {course.objectives}
            </p>
          </div>

          <div className="card animate-slide-up delay-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-cool flex items-center justify-center">
                <Palette size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-display text-gray-800">使用材料</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {course.materials.map((material, index) => (
                <span 
                  key={index} 
                  className="tag bg-secondary-50 text-secondary-700"
                >
                  {material}
                </span>
              ))}
            </div>
          </div>

          <div className="card lg:col-span-2 animate-slide-up delay-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-pink flex items-center justify-center">
                <Brush size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-display text-gray-800">技法要点</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {course.techniques.map((technique, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 text-center"
                >
                  <div className="text-2xl mb-2">
                    {['🎨', '✏️', '🖌️', '🖍️', '🖼️', '🎭'][index % 6]}
                  </div>
                  <p className="text-sm font-medium text-gray-700">{technique}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'style' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card animate-slide-up">
            <h2 className="text-xl font-display text-gray-800 mb-6">📊 课堂表现</h2>
            
            <RatingBar 
              label="参与程度" 
              value={course.observation.participationLevel} 
              color="primary" 
            />

            <div className="mt-6 p-4 rounded-2xl bg-secondary-50">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={18} className="text-pink-500" />
                <h3 className="font-medium text-gray-700">情感表达</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {course.observation.emotionalExpression}
              </p>
            </div>
          </div>

          <div className="card animate-slide-up delay-100">
            <h2 className="text-xl font-display text-gray-800 mb-6">📝 技巧掌握</h2>
            
            <div className="p-4 rounded-2xl bg-green-50 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Brush size={18} className="text-green-600" />
                <h3 className="font-medium text-gray-700">掌握情况</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {course.observation.skillMastery}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-primary-50">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={18} className="text-primary-600" />
                <h3 className="font-medium text-gray-700">教师备注</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {course.observation.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communication' && (
        <div>
          {artworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {artworks.map((artwork, index) => (
                <div key={artwork.id} className="card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100 group">
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-lg font-display text-gray-800 mb-2">
                    {artwork.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{artwork.date}</p>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle size={16} className="text-primary-600" />
                      <span className="text-sm font-medium text-primary-700">教师点评</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {artwork.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-500">本节课暂无作品记录</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
