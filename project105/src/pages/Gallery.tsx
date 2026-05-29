import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, EyeOff, Star, Filter, Search, Grid, List } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import StarRating from '../components/gallery/StarRating';
import { formatDate } from '../utils/helpers';

export default function Gallery() {
  const navigate = useNavigate();
  const { works, searchQuery } = useAppStore();
  const [filterPublic, setFilterPublic] = useState<'all' | 'public' | 'private'>('all');

  const filteredWorks = works.filter((work) => {
    const matchesPublic = 
      filterPublic === 'all' ||
      (filterPublic === 'public' && work.is_public) ||
      (filterPublic === 'private' && !work.is_public);
    const matchesSearch = !searchQuery ||
      work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPublic && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 hover:border-lego-blue rounded-brick transition-all"
          >
            <Filter size={18} />
            <span>筛选</span>
          </button>
          <select
            value={filterPublic}
            onChange={(e) => setFilterPublic(e.target.value as 'all' | 'public' | 'private')}
            className="brick-input w-40"
          >
            <option value="all">全部作品</option>
            <option value="public">公开作品</option>
            <option value="private">私密作品</option>
          </select>
          <span className="text-sm text-gray-500">
            共 {filteredWorks.length} 个作品
          </span>
        </div>
        <button className="brick-btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>发布作品</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredWorks.map((work, index) => {
          const photos = useAppStore.getState().getWorkPhotos(work.id);
          const coverPhoto = photos.find((p) => p.is_cover) || photos[0];

          return (
            <div
              key={work.id}
              className="brick-card overflow-hidden cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/gallery/${work.id}`)}
            >
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                {coverPhoto ? (
                  <img
                    src={coverPhoto.photo_url}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lego-yellow/20 to-lego-red/10">
                    <span className="text-6xl">🎨</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <span className={`status-badge ${work.is_public ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                    {work.is_public ? (
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        公开
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <EyeOff size={12} />
                        私密
                      </span>
                    )}
                  </span>
                </div>
                {photos.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {photos.length} 张照片
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lego-dark group-hover:text-lego-blue transition-colors">
                  {work.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {work.description}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
                        难度 {work.difficulty_rating}
                      </span>
                    </div>
                    <StarRating rating={work.satisfaction_rating} size={14} />
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(work.created_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWorks.length === 0 && (
        <div className="brick-card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-brick flex items-center justify-center">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-lego-dark mb-2">还没有作品</h3>
          <p className="text-gray-500 mb-4">发布你的第一个作品与他人分享</p>
          <button className="brick-btn-primary flex items-center gap-2 mx-auto">
            <Plus size={18} />
            <span>发布作品</span>
          </button>
        </div>
      )}
    </div>
  );
}
