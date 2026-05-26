import { Link } from 'react-router-dom'
import { MessageCircle, CheckCircle, Award, Users, Calendar, Edit3, TrendingUp, Star, BookOpen } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { TagBadge } from '../community/TagBadge'
import { formatDate, formatNumber } from '../../lib/utils'
import { levelConfig } from '../../data/mockData'

export function Profile() {
  const { currentUser, allTags, getQuestionsByUser, getAnswersByUser, getLevelInfo, getNextLevelPoints } = useApp()

  const userQuestions = getQuestionsByUser(currentUser.id)
  const userAnswers = getAnswersByUser(currentUser.id)
  const levelInfo = getLevelInfo(currentUser.level)
  const nextLevelPoints = getNextLevelPoints(currentUser.level)
  const progressToNext = Math.min(100, Math.round((currentUser.points / nextLevelPoints) * 100))

  const expertiseTagDetails = currentUser.expertiseTags
    .map(id => allTags.find(t => t.id === id))
    .filter(Boolean)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={currentUser.avatar}
            alt={currentUser.username}
            className="w-24 h-24 rounded-full ring-4 ring-white/30 object-cover"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-2xl font-bold">{currentUser.username}</h1>
              <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-sm font-medium">
                Lv.{currentUser.level} {levelInfo?.name}
              </span>
            </div>
            <p className="text-white/80 mb-4">{currentUser.bio}</p>
            <div className="flex items-center justify-center sm:justify-start gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatNumber(currentUser.points)}</div>
                <div className="text-xs text-white/70">当前积分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentUser.helpedUsers}</div>
                <div className="text-xs text-white/70">帮助人数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentUser.acceptedAnswers}</div>
                <div className="text-xs text-white/70">采纳回答</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>距离下一等级</span>
            <span>{nextLevelPoints - currentUser.points} 积分</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{currentUser.questionsAsked}</div>
              <div className="text-sm text-gray-500">提问数</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Edit3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{currentUser.questionsAnswered}</div>
              <div className="text-sm text-gray-500">回答数</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{currentUser.acceptedAnswers}</div>
              <div className="text-sm text-gray-500">采纳数</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{currentUser.helpedUsers}</div>
              <div className="text-sm text-gray-500">帮助人数</div>
            </div>
          </div>
        </div>
      </div>

      {expertiseTagDetails.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            擅长领域
          </h2>
          <div className="flex flex-wrap gap-2">
            {expertiseTagDetails.map(tag => (
              <TagBadge key={tag?.id} tag={tag!} size="lg" />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-500" />
            我的提问
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {userQuestions.length > 0 ? (
              userQuestions.map(q => (
                <Link
                  key={q.id}
                  to={`/questions/${q.id}`}
                  className="block p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">{q.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatDate(q.createdAt)}</span>
                    <span>{q.answerCount} 回答</span>
                    {q.hasAcceptedAnswer && (
                      <span className="text-green-600">已解决</span>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">暂无提问记录</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-green-500" />
            我的回答
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {userAnswers.length > 0 ? (
              userAnswers.map(a => (
                <div
                  key={a.id}
                  className="p-4 rounded-lg border border-gray-100"
                >
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {a.content.replace(/[#*`>\-]/g, '').slice(0, 100)}...
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatDate(a.createdAt)}</span>
                    <span>{a.voteCount} 赞</span>
                    {a.isAccepted && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        已采纳
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">暂无回答记录</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          获得徽章
          <span className="text-sm font-normal text-gray-500">({currentUser.badges.length})</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {currentUser.badges.map(badge => (
            <div
              key={badge.id}
              className="p-4 rounded-xl border text-center hover:shadow-md transition-shadow"
              style={{
                borderColor: badge.rarity === 'legendary' ? '#f59e0b' :
                  badge.rarity === 'epic' ? '#a855f7' :
                  badge.rarity === 'rare' ? '#3b82f6' : '#d1d5db',
                backgroundColor: badge.rarity === 'legendary' ? '#fef3c7' :
                  badge.rarity === 'epic' ? '#f5f3ff' :
                  badge.rarity === 'rare' ? '#eff6ff' : '#f9fafb',
              }}
            >
              <Award className={`w-8 h-8 mx-auto mb-2 ${
                badge.rarity === 'legendary' ? 'text-yellow-500' :
                badge.rarity === 'epic' ? 'text-purple-500' :
                badge.rarity === 'rare' ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <div className="text-sm font-medium text-gray-900">{badge.name}</div>
              <div className="text-xs text-gray-500 mt-1">{badge.description}</div>
            </div>
          ))}
          {currentUser.badges.length === 0 && (
            <p className="text-gray-500 text-center col-span-full py-8">暂无徽章，快去回答问题吧！</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-500" />
          关注的标签
        </h2>
        <div className="flex flex-wrap gap-2">
          {currentUser.followedTags.map(tagId => {
            const tag = allTags.find(t => t.id === tagId)
            return tag ? (
              <TagBadge key={tagId} tag={tag} showCount />
            ) : null
          })}
        </div>
      </div>
    </div>
  )
}
