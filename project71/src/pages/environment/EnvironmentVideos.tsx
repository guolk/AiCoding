import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Play, Filter, ChevronDown, Clock, Star, BookOpen, CheckCircle, XCircle } from 'lucide-react'
import { videos, userProfile } from '../../data/mockData'
import clsx from 'clsx'
import { Video } from '../../types'

export const EnvironmentVideos: React.FC = () => {
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [watchedVideos, setWatchedVideos] = useState<string[]>([])

  const categories = ['all', ...new Set(videos.map(v => v.category))]
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced']

  const levelNames: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  }

  const filteredVideos = videos.filter(v => {
    if (difficultyFilter !== 'all' && v.difficulty !== difficultyFilter) return false
    if (categoryFilter !== 'all' && v.category !== categoryFilter) return false
    return true
  })

  const recommendedVideos = videos.filter(v => v.difficulty === userProfile.level)

  const toggleWatched = (id: string) => {
    setWatchedVideos(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-amber-100 text-amber-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (selectedVideo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedVideo(null)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{selectedVideo.title}</h1>
            <p className="text-gray-500">{selectedVideo.source}</p>
          </div>
          <button
            onClick={() => toggleWatched(selectedVideo.id)}
            className={clsx(
              'btn-secondary flex items-center gap-2',
              watchedVideos.includes(selectedVideo.id) && 'bg-green-100 text-green-700 border-green-200'
            )}
          >
            {watchedVideos.includes(selectedVideo.id) ? (
              <>
                <CheckCircle className="w-5 h-5" />
                已学习
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                标记完成
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative flex items-center justify-center">
                <img
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <button className="relative w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors group">
                  <Play className="w-10 h-10 text-white ml-1 group-hover:scale-110 transition-transform" />
                </button>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {selectedVideo.duration}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className={`badge ${getDifficultyColor(selectedVideo.difficulty)}`}>
                  {levelNames[selectedVideo.difficulty]}
                </span>
                <span className="badge bg-blue-100 text-blue-700">{selectedVideo.category}</span>
              </div>

              <h3 className="font-bold text-gray-800 mb-2">视频简介</h3>
              <p className="text-gray-600 mb-6">{selectedVideo.description}</p>

              <h3 className="font-bold text-gray-800 mb-4">学习要点</h3>
              <div className="space-y-3">
                {selectedVideo.keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">核心词汇</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedVideo.vocabulary.map((word, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-center"
                  >
                    <p className="font-bold text-gray-800">{word}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">视频信息</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">难度</span>
                  <span className={`badge ${getDifficultyColor(selectedVideo.difficulty)}`}>
                    {levelNames[selectedVideo.difficulty]}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">时长</span>
                  <span className="font-medium text-gray-800">{selectedVideo.duration}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">分类</span>
                  <span className="font-medium text-gray-800">{selectedVideo.category}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">词汇量</span>
                  <span className="font-medium text-gray-800">{selectedVideo.vocabulary.length} 个</span>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                学习建议
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-700">
                  1. 第一遍：无字幕观看，理解大意
                </p>
                <p className="text-gray-700">
                  2. 第二遍：英文字幕，记录不认识的单词
                </p>
                <p className="text-gray-700">
                  3. 第三遍：双语字幕，对照理解
                </p>
                <p className="text-gray-700">
                  4. 跟读练习：模仿发音和语调
                </p>
                <p className="text-gray-700">
                  5. 词汇学习：掌握视频中的核心词汇
                </p>
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">相关视频</h3>
              <div className="space-y-3">
                {videos
                  .filter(v => v.id !== selectedVideo.id && v.category === selectedVideo.category)
                  .slice(0, 3)
                  .map(video => (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-24 h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <Play className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm line-clamp-2">{video.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getDifficultyColor(video.difficulty)}`}>
                            {levelNames[video.difficulty]}
                          </span>
                          <span className="text-xs text-gray-400">{video.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/environment" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">原声视频推荐</h1>
          <p className="text-gray-500">基于词汇掌握量推荐适合难度的视频</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">你的水平：</span>
          <span className={`badge ${getDifficultyColor(userProfile.level)}`}>
            {levelNames[userProfile.level]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Play className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">全部视频</p>
            <p className="text-xl font-bold text-gray-800">{videos.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">已学习</p>
            <p className="text-xl font-bold text-gray-800">{watchedVideos.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">为你推荐</p>
            <p className="text-xl font-bold text-gray-800">{recommendedVideos.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">总学习时长</p>
            <p className="text-xl font-bold text-gray-800">6.5h</p>
          </div>
        </div>
      </div>

      {recommendedVideos.length > 0 && (
        <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-600" />
              为你推荐（{levelNames[userProfile.level]}难度）
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedVideos.slice(0, 3).map(video => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group card-hover rounded-xl overflow-hidden bg-white border border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Play className="w-14 h-14 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${getDifficultyColor(video.difficulty)}`}>
                      {levelNames[video.difficulty]}
                    </span>
                    <span className="text-xs text-gray-400">{video.source}</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-2">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">筛选：</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">难度：</span>
              {difficulties.map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    difficultyFilter === diff
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {diff === 'all' ? '全部' : levelNames[diff]}
                </button>
              ))}
            </div>
            <div className="w-px bg-gray-200 hidden md:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">分类：</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    categoryFilter === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {cat === 'all' ? '全部' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map(video => (
            <div
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className={clsx(
                'group card-hover rounded-xl overflow-hidden bg-white border transition-all cursor-pointer relative',
                watchedVideos.includes(video.id)
                  ? 'border-green-300 bg-green-50/30'
                  : 'border-gray-100 hover:border-primary-300 hover:shadow-xl'
              )}
            >
              {watchedVideos.includes(video.id) && (
                <div className="absolute top-2 left-2 z-10 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  已学习
                </div>
              )}
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Play className="w-14 h-14 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${getDifficultyColor(video.difficulty)}`}>
                    {levelNames[video.difficulty]}
                  </span>
                  <span className="badge bg-blue-100 text-blue-700">{video.category}</span>
                  <span className="text-xs text-gray-400 ml-auto">{video.source}</span>
                </div>
                <h4 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                  {video.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{video.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <BookOpen className="w-3 h-3" />
                  <span>{video.vocabulary.length} 个核心词汇</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">没有找到符合条件的视频</p>
          </div>
        )}
      </div>
    </div>
  )
}
