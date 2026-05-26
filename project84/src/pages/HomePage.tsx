import { Link } from 'react-router-dom'
import { MessageCircle, TrendingUp, Users, Award, Flame, BookOpen, Map, Compass, Zap, ChevronRight, Star, Target } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { QuestionCard } from '../components/community/QuestionCard'
import { TagBadge } from '../components/community/TagBadge'
import { formatNumber } from '../lib/utils'

export function HomePage() {
  const { questions, allTags, currentUser } = useApp()

  const hotQuestions = [...questions]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 4)

  const newQuestions = [...questions]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 4)

  const hotTags = [...allTags]
    .sort((a, b) => b.followerCount - a.followerCount)
    .slice(0, 6)

  const stats = [
    { label: '总问题', value: questions.length, icon: MessageCircle, color: 'bg-blue-100 text-blue-600' },
    { label: '已解决', value: questions.filter(q => q.hasAcceptedAnswer).length, icon: Award, color: 'bg-green-100 text-green-600' },
    { label: '活跃用户', value: 1280, icon: Users, color: 'bg-purple-100 text-purple-600' },
    { label: '今日新增', value: 12, icon: Flame, color: 'bg-orange-100 text-orange-600' },
  ]

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-yellow-300" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">欢迎回来，{currentUser.username}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            探索知识，分享智慧
          </h1>
          <p className="text-lg text-white/80 mb-6">
            在这个社区中，提问、回答、学习，与志同道合的人一起成长。
            你的每一个回答都可能帮助到他人。
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/questions/ask"
              className="flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              发布问题
            </Link>
            <Link
              to="/questions"
              className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors"
            >
              浏览问题
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`inline-flex p-2.5 rounded-xl ${stat.color} mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(stat.value)}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                热门问题
              </h2>
              <Link to="/questions" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
                查看更多 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {hotQuestions.map(q => (
                <QuestionCard key={q.id} question={q} compact />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-500" />
                最新问题
              </h2>
              <Link to="/questions" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
                查看更多 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {newQuestions.map(q => (
                <QuestionCard key={q.id} question={q} compact />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              热门标签
            </h2>
            <div className="space-y-3">
              {hotTags.map(tag => (
                <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <TagBadge tag={tag} size="sm" showCount />
                  <span className="text-xs text-gray-400">{formatNumber(tag.followerCount)} 关注</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <Target className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">每日挑战</h3>
            <p className="text-sm text-white/80 mb-4">
              完成今日挑战，获得额外积分奖励，提升你的知识水平！
            </p>
            <Link
              to="/stream"
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              开始挑战
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快速导航</h2>
            <div className="space-y-2">
              <Link to="/questions" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900">问答社区</div>
                  <div className="text-xs text-gray-500">浏览和提问</div>
                </div>
              </Link>
              <Link to="/learning" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Award className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium text-gray-900">学习激励</div>
                  <div className="text-xs text-gray-500">积分等级徽章</div>
                </div>
              </Link>
              <Link to="/stream" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Compass className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="font-medium text-gray-900">学习流</div>
                  <div className="text-xs text-gray-500">个性化推荐</div>
                </div>
              </Link>
              <Link to="/map" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Map className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="font-medium text-gray-900">知识地图</div>
                  <div className="text-xs text-gray-500">可视化知识</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
