import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Calendar, MapPin, Star, Plus, Eye } from 'lucide-react';
import { useAppStore } from '../store';
import Tabs from '../components/ui/Tabs';

export default function Exhibitions() {
  const navigate = useNavigate();
  const { exhibitions, getStudentById, getPortfolioArtworks, artworks, students } = useAppStore();
  const [activeTab, setActiveTab] = useState('exhibitions');
  const [selectedStudent, setSelectedStudent] = useState('all');

  const tabs = [
    { id: 'exhibitions', label: '参展记录', icon: <Award size={18} /> },
    { id: 'portfolio', label: '作品集', icon: <Star size={18} /> },
  ];

  const filteredExhibitions = exhibitions.filter(exhibition => 
    selectedStudent === 'all' || exhibition.studentId === selectedStudent
  );

  const getAwardColor = (award: string) => {
    if (award.includes('金')) return 'from-yellow-400 to-amber-500';
    if (award.includes('银')) return 'from-gray-300 to-gray-500';
    if (award.includes('铜')) return 'from-orange-400 to-orange-600';
    return 'from-primary-400 to-secondary-500';
  };

  const getAwardIcon = (award: string) => {
    if (award.includes('金')) return '🥇';
    if (award.includes('银')) return '🥈';
    if (award.includes('铜')) return '🥉';
    return '🏅';
  };

  const getAllPortfolioArtworks = () => {
    if (selectedStudent === 'all') {
      return artworks.filter(a => a.isPortfolio);
    }
    return getPortfolioArtworks(selectedStudent);
  };

  const portfolioArtworks = getAllPortfolioArtworks();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-gray-800 mb-2">
            🏆 展览和成果
          </h1>
          <p className="text-gray-500">
            记录学员参展经历，整理优秀作品集
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          添加记录
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-gray-500">筛选学员：</span>
        <select
          className="input-field max-w-xs"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="all">全部学员</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'exhibitions' && (
        <div className="space-y-6">
          {filteredExhibitions.length > 0 ? (
            filteredExhibitions.map((exhibition, index) => {
              const student = getStudentById(exhibition.studentId);
              const artwork = artworks.find(a => a.title === exhibition.artworkTitle);
              
              return (
                <div 
                  key={exhibition.id} 
                  className="card animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-wrap items-start gap-6">
                    {artwork && (
                      <div className="w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 group cursor-pointer">
                        <img 
                          src={artwork.imageUrl} 
                          alt={artwork.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-xl font-display text-gray-800 mb-1">
                            {exhibition.exhibitionName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {exhibition.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              参展作品：{exhibition.artworkTitle}
                            </span>
                          </div>
                        </div>
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAwardColor(exhibition.award)} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}>
                          {getAwardIcon(exhibition.award)}
                        </div>
                      </div>

                      {student && (
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-warm">
                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.className}</p>
                          </div>
                          <span className={`tag bg-gradient-to-br ${getAwardColor(exhibition.award)} text-white ml-auto`}>
                            {exhibition.award}
                          </span>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50">
                        <h4 className="font-medium text-gray-700 mb-2">展览体验</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {exhibition.experience}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-500">暂无参展记录</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {portfolioArtworks.length > 0 ? (
              portfolioArtworks.map((artwork, index) => {
                const student = getStudentById(artwork.studentId);
                
                return (
                  <div 
                    key={artwork.id}
                    className="group cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                    onClick={() => navigate(artwork.studentId ? `/tracking/${artwork.studentId}` : '')}
                  >
                    <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-soft group-hover:shadow-hover transition-all duration-300 group-hover:-translate-y-1 mb-4">
                      <div className="relative w-full h-full">
                        <img 
                          src={artwork.imageUrl} 
                          alt={artwork.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                          <div className="flex items-center gap-2 text-white text-sm">
                            <Eye size={16} />
                            <span>查看详情</span>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-lg shadow-lg">
                          ⭐
                        </div>
                      </div>
                    </div>
                    <h3 className="font-display text-lg text-gray-800 group-hover:text-primary-600 transition-colors mb-1 truncate">
                      {artwork.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {student && (
                        <>
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-warm flex-shrink-0">
                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="truncate">{student.name}</span>
                        </>
                      )}
                      <span className="text-gray-300">·</span>
                      <span className="truncate">{artwork.date}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full card text-center py-16">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-gray-500">暂无作品集</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
