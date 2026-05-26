import { useState } from 'react'
import { Compass, Clock, Target, RefreshCw, CheckCircle, XCircle, BookOpen, Sparkles, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { QuestionCard } from '../community/QuestionCard'
import { MarkdownRenderer } from '../community/MarkdownRenderer'
import { formatDate } from '../../lib/utils'

export function LearningStream() {
  const { currentUser, questions, dailyChallenges, quizHistory, completeDailyChallenge, getQuestionsByTag } = useApp()
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [challengeAnswer, setChallengeAnswer] = useState('')

  const recommendedQuestions = currentUser.followedTags
    .flatMap(tagId => getQuestionsByTag(tagId))
    .filter(q => q.authorId !== currentUser.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8)

  const todayChallenge = dailyChallenges.find(dc => {
    const today = new Date().toDateString()
    return new Date(dc.date).toDateString() === today
  })

  const wrongQuestions = quizHistory.filter(q => !q.isCorrect)

  const handleSubmitChallenge = () => {
    if (todayChallenge && challengeAnswer.trim()) {
      const isCorrect = Math.random() > 0.5
      completeDailyChallenge(todayChallenge.id, isCorrect)
      setShowChallengeModal(false)
      setChallengeAnswer('')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Compass className="w-6 h-6" />
          <h1 className="text-2xl font-bold">个性化学习流</h1>
        </div>
        <p className="text-white/80">基于你的兴趣和水平，为你推荐最适合的学习内容</p>
      </div>

      {todayChallenge && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">今日挑战</h2>
            </div>
            <span className="text-sm text-gray-500">{formatDate(todayChallenge.date)}</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">每日一题</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {todayChallenge.question.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                {todayChallenge.question.difficulty === 'beginner' ? '入门' :
                  todayChallenge.question.difficulty === 'intermediate' ? '进阶' : '高级'}
              </span>
              <span>{todayChallenge.question.category}</span>
            </div>
          </div>

          {todayChallenge.isCompleted ? (
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              todayChallenge.isCorrect ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {todayChallenge.isCorrect ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700">回答正确！获得30积分</p>
                    <p className="text-sm text-green-600">继续保持，明天还有新挑战！</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-medium text-red-700">继续加油！获得5积分参与奖励</p>
                    <p className="text-sm text-red-600">可以在错题回顾中重新练习</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowChallengeModal(true)}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                开始挑战
              </button>
              <span className="text-sm text-gray-500">完成后可获得30积分</span>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-500" />
          为你推荐
          <span className="text-sm font-normal text-gray-500">基于你关注的标签</span>
        </h2>

        {recommendedQuestions.length > 0 ? (
          <div className="space-y-4">
            {recommendedQuestions.map(q => (
              <QuestionCard key={q.id} question={q} compact />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无推荐内容，去关注更多标签吧</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-orange-500" />
          错题回顾
          <span className="text-sm font-normal text-gray-500">({wrongQuestions.length}道)</span>
        </h2>

        {wrongQuestions.length > 0 ? (
          <div className="space-y-4">
            {wrongQuestions.map(quiz => (
              <div key={quiz.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{quiz.question.title}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500">
                        你的答案: <span className="text-red-600">{quiz.userAnswer}</span>
                      </span>
                    </div>
                    {quiz.correctAnswer && (
                      <p className="text-sm text-green-600 mt-2">
                        正确答案: {quiz.correctAnswer}
                      </p>
                    )}
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    再试一次
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p className="text-gray-500">太棒了！没有错题需要复习</p>
          </div>
        )}
      </div>

      {showChallengeModal && todayChallenge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">每日挑战</h3>
                <button
                  onClick={() => setShowChallengeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">{todayChallenge.question.title}</h4>
                <div className="text-sm text-gray-600">
                  <MarkdownRenderer content={todayChallenge.question.content.slice(0, 300) + '...'} />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  你的答案
                </label>
                <textarea
                  value={challengeAnswer}
                  onChange={(e) => setChallengeAnswer(e.target.value)}
                  placeholder="输入你的答案..."
                  className="w-full min-h-[100px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  提交后将立即评分
                </p>
                <button
                  onClick={handleSubmitChallenge}
                  disabled={!challengeAnswer.trim()}
                  className="px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  提交答案
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
