import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Map, AlertTriangle, TrendingUp, Eye, Target, BookOpen } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { TagBadge } from '../community/TagBadge'

export function KnowledgeMap() {
  const { currentUser, knowledgeAreas, allTags, questions, getQuestionsByTag } = useApp()

  const radarData = knowledgeAreas.map(ka => ({
    subject: ka.tagName,
    A: ka.score,
    fullMark: 100,
  }))

  const barData = knowledgeAreas.map(ka => ({
    name: ka.tagName,
    回答数: ka.questionsAnswered,
    采纳数: ka.answersAccepted,
  }))

  const popularTags = [...allTags].sort((a, b) => b.questionCount - a.questionCount).slice(0, 10)
  const knowledgeGaps = popularTags.filter(
    tag => !currentUser.followedTags.includes(tag.id) &&
      !knowledgeAreas.some(ka => ka.tagId === tag.id)
  )

  const trendingTags = popularTags.filter(
    tag => !knowledgeAreas.some(ka => ka.tagId === tag.id)
  ).slice(0, 5)

  const totalAnswered = knowledgeAreas.reduce((sum, ka) => sum + ka.questionsAnswered, 0)
  const totalAccepted = knowledgeAreas.reduce((sum, ka) => sum + ka.answersAccepted, 0)
  const avgScore = Math.round(knowledgeAreas.reduce((sum, ka) => sum + ka.score, 0) / knowledgeAreas.length)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Map className="w-6 h-6" />
          <h1 className="text-2xl font-bold">知识地图</h1>
        </div>
        <p className="text-white/80">可视化你的知识积累，发现学习盲区</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalAnswered}</div>
              <div className="text-sm text-gray-500">总回答数</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalAccepted}</div>
              <div className="text-sm text-gray-500">采纳数</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{knowledgeAreas.length}</div>
              <div className="text-sm text-gray-500">知识领域</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{avgScore}%</div>
              <div className="text-sm text-gray-500">平均掌握度</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-primary-500" />
            知识雷达图
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="掌握度"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            领域贡献统计
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="回答数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="采纳数" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          知识盲区发现
          <span className="text-sm font-normal text-gray-500">热门领域中你尚未涉猎的内容</span>
        </h2>

        {knowledgeGaps.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {knowledgeGaps.map(tag => (
                <TagBadge key={tag.id} tag={tag} showCount />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {knowledgeGaps.slice(0, 3).map(tag => {
                const tagQuestions = getQuestionsByTag(tag.id)
                return (
                  <div key={tag.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TagBadge tag={tag} size="sm" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      该领域有 {tag.questionCount} 个问题，{tag.followerCount} 人关注
                    </p>
                    <p className="text-xs text-gray-500">
                      热门问题示例: {tagQuestions[0]?.title?.slice(0, 30)}...
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p className="text-gray-500">你已经覆盖了所有热门领域！</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          领域详情
        </h2>
        <div className="space-y-4">
          {knowledgeAreas.map(ka => {
            const tag = allTags.find(t => t.id === ka.tagId)
            return (
              <div key={ka.tagId} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {tag && <TagBadge tag={tag} />}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{ka.score}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ka.score >= 70 ? 'bg-green-500' :
                      ka.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${ka.score}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>回答 {ka.questionsAnswered} 个</span>
                  <span>采纳 {ka.answersAccepted} 个</span>
                  <span>采纳率 {ka.questionsAnswered > 0 ? Math.round(ka.answersAccepted / ka.questionsAnswered * 100) : 0}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
