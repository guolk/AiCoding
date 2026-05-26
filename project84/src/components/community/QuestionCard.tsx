import { Tag, Star, CheckCircle, Clock, Eye, MessageCircle, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate, formatNumber } from '../../lib/utils'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'
import type { Question } from '../../types'

interface QuestionCardProps {
  question: Question
  compact?: boolean
}

export function QuestionCard({ question, compact = false }: QuestionCardProps) {
  const { getTagById } = useApp()

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  }

  const difficultyLabels = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200">
      <Link to={`/questions/${question.id}`} className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                difficultyColors[question.difficulty]
              )}>
                {difficultyLabels[question.difficulty]}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 line-clamp-2">
              {question.title}
            </h3>
            {!compact && (
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                {question.content.replace(/[#*`>\-]/g, '').slice(0, 150)}...
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {question.tags.slice(0, 3).map(tagId => {
                const tag = getTagById(tagId)
                return tag ? (
                  <span
                    key={tagId}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    <Tag className="w-3 h-3" />
                    {tag.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 text-center min-w-[60px]">
            <div className="flex flex-col items-center">
              <ThumbsUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">{formatNumber(question.voteCount)}</span>
            </div>
            <div className="w-full h-px bg-gray-200 my-1"></div>
            <div className="flex flex-col items-center">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">{question.answerCount}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src={question.author.avatar}
              alt={question.author.username}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm text-gray-600">{question.author.username}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(question.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(question.createdAt)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
