import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { VideoCourse, VideoChapter } from '@/types';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Select from '@/components/Select';
import Input from '@/components/Input';
import { videoCoursesData } from '@/data/exercises';
import { getDifficultyLabel, getDifficultyColor, formatTime } from '@/utils/music';
import { queryKeys } from '@/services/queryClient';

function VideoCoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<VideoCourse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [freeFilter, setFreeFilter] = useState<'all' | 'free' | 'paid'>('all');

  const { data: coursesData, isLoading } = useQuery({
    queryKey: queryKeys.videoCourses.list(),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { items: videoCoursesData, total: videoCoursesData.length };
    },
  });

  const filteredCourses = (coursesData?.items || []).filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || course.difficulty === difficultyFilter;
    const matchesFree = freeFilter === 'all' ||
      (freeFilter === 'free' && (course.price === 0 || course.isSubscriptionOnly)) ||
      (freeFilter === 'paid' && course.price > 0 && !course.isSubscriptionOnly);
    return matchesSearch && matchesDifficulty && matchesFree;
  });

  if (isLoading) {
    return (
      <Layout>
        <Loading isLoading={true} text="加载视频课程..." />
      </Layout>
    );
  }

  if (selectedCourse) {
    return (
      <Layout>
        <CourseDetail
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">视频课程</h1>
          <p className="text-gray-500 mt-1">跟随专业教师学习音乐课程</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="搜索课程名称、描述或讲师..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <Select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as typeof difficultyFilter)}
              options={[
                { value: 'all', label: '全部难度' },
                { value: 'beginner', label: '基础' },
                { value: 'intermediate', label: '进阶' },
                { value: 'advanced', label: '高级' },
              ]}
              className="w-32"
            />
            <Select
              value={freeFilter}
              onChange={(e) => setFreeFilter(e.target.value as typeof freeFilter)}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'free', label: '免费/订阅' },
                { value: 'paid', label: '付费购买' },
              ]}
              className="w-36"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => setSelectedCourse(course)}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">没有找到课程</h3>
            <p className="mt-2 text-gray-500">尝试调整搜索条件或筛选器</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function CourseCard({ course, onClick }: { course: VideoCourse; onClick: () => void }) {
  const color = getDifficultyColor(course.difficulty);
  const label = getDifficultyLabel(course.difficulty);

  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="relative">
      <div
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${course.thumbnailUrl})` }}
      />
      <div className="absolute top-3 left-3 flex gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
          {label}
        </span>
        {course.isSubscriptionOnly ? (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            会员专享
          </span>
        ) : course.price > 0 ? (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
            ¥{course.price}
          </span>
        ) : (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            免费
          </span>
        )}
      </div>
      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black bg-opacity-70 text-white rounded text-sm">
        {formatTime(course.duration)}
      </div>
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
        {course.title}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {course.description}
      </p>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{course.instructor}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span>{course.chapters.length} 章节</span>
        </div>
      </div>
    </div>
  </div>
  );
}

function CourseDetail({ course, onBack }: { course: VideoCourse; onBack: () => void }) {
  const [activeChapter, setActiveChapter] = useState<VideoChapter | null>(course.chapters[0] || null);
  const [showSubtitles, setShowSubtitles] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={onBack}>
          ← 返回列表
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-500 mt-1">讲师: {course.instructor}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black rounded-xl overflow-hidden aspect-video relative">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${course.thumbnailUrl})`, opacity: 0.7 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 rounded-full bg-white bg-opacity-90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black bg-opacity-70 rounded-lg p-2 text-white text-sm">
                {activeChapter?.title || '选择章节播放中...'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">课程描述</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSubtitles}
                    onChange={(e) => setShowSubtitles(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">显示字幕</span>
                </label>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {course.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {getDifficultyLabel(course.difficulty)}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {formatTime(course.duration)}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {course.chapters.length} 个章节
              </span>
            </div>
          </div>

          {course.isSubscriptionOnly ? (
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">此课程为会员专享</h3>
              <p className="text-purple-100 mb-4">
                订阅会员即可观看此课程及所有其他视频课程。
              </p>
              <Button className="bg-white text-purple-600 hover:bg-purple-50">
                立即订阅
              </Button>
            </div>
          ) : course.price > 0 ? (
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">购买此课程</h3>
                  <p className="text-orange-100 mt-1">永久观看，不限次数</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">¥{course.price}</p>
                  <Button className="mt-2 bg-white text-orange-600 hover:bg-orange-50">
                    立即购买
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">此课程免费</h3>
              <p className="text-green-100">
                您可以免费观看此课程的所有内容。
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">课程章节</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {course.chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(chapter)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeChapter?.id === chapter.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activeChapter?.id === chapter.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {activeChapter?.id === chapter.id ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${
                        activeChapter?.id === chapter.id ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {chapter.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(chapter.endTime - chapter.startTime)}
                      </p>
                      {chapter.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {chapter.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {course.subtitles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">字幕</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {course.subtitles.map((subtitle) => (
                  <div key={subtitle.id} className="text-sm">
                    <span className="text-gray-400 text-xs">
                      {formatTime(subtitle.startTime)}
                    </span>
                    <p className="text-gray-700 mt-1">{subtitle.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">讲师信息</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {course.instructor.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{course.instructor}</p>
                <p className="text-sm text-gray-500">专业音乐教师</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              拥有多年音乐教学经验，擅长钢琴/小提琴/吉他等多种乐器教学。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCoursesPage;
