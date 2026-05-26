import { Trophy, Star, Award, TrendingUp, Zap, Target, Crown, Gem } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { TagBadge } from '../community/TagBadge'
import { levelConfig } from '../../data/mockData'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function LearningIncentives() {
  const { currentUser, pointsHistory, allTags, getLevelInfo, getNextLevelPoints } = useApp()

  const levelInfo = getLevelInfo(currentUser.level)
  const nextLevelPoints = getNextLevelPoints(currentUser.level)
  const progressToNext = Math.min(100, Math.round((currentUser.points / nextLevelPoints) * 100))

  const chartData = pointsHistory.map(p => ({
    date: p.date.split('-').slice(1).join('/'),
    points: p.points,
  }))

  const pointsRules = [
    { action: '发布问题', points: '+5', icon: MessageCircleIcon },
    { action: '回答问题', points: '+10', icon: EditIcon },
    { action: '回答被采纳', points: '+50', icon: CheckIcon },
    { action: '每日挑战完成', points: '+30', icon: Target },
    { action: '获得徽章', points: '+100', icon: Award },
    { action: '升级奖励', points: '+200', icon: Trophy },
  ]

  const nextLevel = levelConfig[(currentUser.level + 1) as keyof typeof levelConfig]

  const badgeRarityColors = {
    common: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
    rare: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
    epic: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300' },
    legendary: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300' },
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Lv.{currentUser.level} {levelInfo?.name}</h1>
            </div>
            <p className="text-white/80">当前积分: {currentUser.points.toLocaleString()}</p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm text-white/70 mb-1">
              下一等级: {nextLevel?.name || '已达最高等级'}
            </p>
            <p className="text-lg font-semibold">
              {nextLevel ? `还需 ${nextLevelPoints - currentUser.points} 积分` : '恭喜达到顶级！'}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-white/70">
            <span>{levelInfo?.name}</span>
            <span>{progressToNext}%</span>
            <span>{nextLevel?.name || '最高等级'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            积分获取记录
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="points"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorPoints)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            积分规则
          </h2>
          <div className="space-y-3">
            {pointsRules.map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <rule.icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{rule.action}</span>
                </div>
                <span className="text-sm font-semibold text-green-600">{rule.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Gem className="w-5 h-5 text-purple-500" />
          等级体系
        </h2>
        <div className="relative">
          <div className="flex overflow-x-auto pb-4 gap-2">
            {Object.entries(levelConfig).map(([level, config]) => {
              const levelNum = parseInt(level)
              const isCurrent = levelNum === currentUser.level
              const isPast = levelNum < currentUser.level
              return (
                <div
                  key={level}
                  className={`flex-shrink-0 w-32 p-4 rounded-xl border-2 text-center transition-all ${
                    isCurrent
                      ? 'border-primary-500 bg-primary-50 scale-105'
                      : isPast
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="text-2xl font-bold text-gray-900">Lv.{level}</div>
                  <div className="text-sm font-medium text-gray-700 mt-1">{config.name}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {config.minPoints.toLocaleString()}分
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          我的徽章 ({currentUser.badges.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentUser.badges.map(badge => {
            const colors = badgeRarityColors[badge.rarity]
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border-2 ${colors.border} ${colors.bg} text-center hover:shadow-md transition-shadow`}
              >
                <Award className={`w-10 h-10 mx-auto mb-2 ${colors.text}`} />
                <div className="font-semibold text-gray-900">{badge.name}</div>
                <div className="text-xs text-gray-600 mt-1">{badge.description}</div>
                <div className={`text-xs mt-2 font-medium ${colors.text}`}>
                  {badge.rarity === 'legendary' ? '传奇' :
                    badge.rarity === 'epic' ? '史诗' :
                    badge.rarity === 'rare' ? '稀有' : '普通'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          徽章解锁提示
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTags.slice(0, 6).map(tag => {
            const isUnlocked = currentUser.badges.some(b => b.tagId === tag.id)
            return (
              <div
                key={tag.id}
                className={`p-4 rounded-lg border ${
                  isUnlocked ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TagBadge tag={tag} size="sm" />
                  {isUnlocked ? (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckIcon className="w-3 h-3" />
                      已解锁
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">回答10个解锁</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {isUnlocked ? `已获得${tag.name}达人徽章` : `在${tag.name}领域回答10个问题解锁达人徽章`}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MessageCircleIcon(props: any) {
  return <MessageCircle {...props} />
}

function EditIcon(props: any) {
  return <Edit3 {...props} />
}

function CheckIcon(props: any) {
  return <CheckCircle {...props} />
}

import { MessageCircle, Edit3, CheckCircle } from 'lucide-react'
