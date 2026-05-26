import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle, Share2, Flag, Clock, Eye, MessageCircle, User } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MarkdownRenderer } from '../community/MarkdownRenderer'
import { TagBadge } from '../community/TagBadge'
import { AnswerForm } from './AnswerForm'
import { AnswerCard } from './AnswerCard'
import { formatDate, formatNumber } from '../../lib/utils'
import { cn } from '../../lib/utils'

export function QuestionDetail() {
  const { id } = useParams<{ id: string }>()
  const { questions, getAnswersByQuestion, getTagById, voteQuestion, currentUser, acceptAnswer } = useApp()
  const [showAnswerForm, setShowAnswerForm] = useState(false)
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0)

  const question = questions.find(q => q.id === id)
  const answers = question ? getAnswersByQuestion(question.id) : []

  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">问题不存在</p>
        <Link to="/questions" className="text-primary-500 hover:underline">
          返回问题列表
        </Link>
      </div>
    )
  }

  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.isBestAnswer) return -1
    if (b.isBestAnswer) return 1
    return b.voteCount - a.voteCount
  })

  const handleVote = (value: 1 | -1) => {
    if (userVote === value) {
      voteQuestion(question.id, -value as 1 | -1)
      setUserVote(0)
    } else {
      if (userVote !== 0) {
        voteQuestion(question.id, -userVote as 1 | -1)
      }
      voteQuestion(question.id, value)
      setUserVote(value)
    }
  }

  const isQuestionAuthor = question.authorId === currentUser.id

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/questions"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回问题列表
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleVote(1)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                userVote === 1 ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-400'
              )}
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
            <span className="text-lg font-bold text-gray-700">
              {question.voteCount + userVote}
            </span>
            <button
              onClick={() => handleVote(-1)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                userVote === -1 ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
              )}
            >
              <ThumbsDown className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                question.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                question.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              )}>
                {question.difficulty === 'beginner' ? '入门' : question.difficulty === 'intermediate' ? '进阶' : '高级'}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {question.category}
              </span>
              {question.hasAcceptedAnswer && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  已解决
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>

            <MarkdownRenderer content={question.content} />

            <div className="flex items-center gap-2 mt-6 flex-wrap">
              {question.tags.map(tagId => {
                const tag = getTagById(tagId)
                return tag ? <TagBadge key={tagId} tag={tag} size="sm" /> : null
              })}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={question.author.avatar}
                  alt={question.author.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <Link to={`/profile/${question.authorId}`} className="text-sm font-medium text-gray-900 hover:text-primary-500">
                    {question.author.username}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">
                      Lv.{question.author.level}
                    </span>
                    <span>{formatDate(question.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatNumber(question.viewCount)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {answers.length} 回答
                </span>
                <button className="flex items-center gap-1 hover:text-primary-500">
                  <Share2 className="w-4 h-4" />
                  分享
                </button>
                <button className="flex items-center gap-1 hover:text-red-500">
                  <Flag className="w-4 h-4" />
                  举报
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        {!showAnswerForm ? (
          <button
            onClick={() => setShowAnswerForm(true)}
            className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            撰写回答
          </button>
        ) : (
          <AnswerForm
            questionId={question.id}
            onCancel={() => setShowAnswerForm(false)}
            onSubmit={() => setShowAnswerForm(false)}
          />
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {answers.length} 个回答
        </h2>
        {sortedAnswers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无回答，成为第一个回答的人吧！</p>
          </div>
        ) : (
          sortedAnswers.map(answer => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              isQuestionAuthor={isQuestionAuthor}
              onAccept={() => acceptAnswer(question.id, answer.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
