import { useState } from 'react'
import { ThumbsUp, ThumbsDown, CheckCircle, Share2, Flag, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { MarkdownRenderer } from '../community/MarkdownRenderer'
import { formatDate } from '../../lib/utils'
import { cn } from '../../lib/utils'
import type { Answer } from '../../types'

interface AnswerCardProps {
  answer: Answer
  isQuestionAuthor: boolean
  onAccept: () => void
}

export function AnswerCard({ answer, isQuestionAuthor, onAccept }: AnswerCardProps) {
  const { voteAnswer } = useApp()
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0)

  const handleVote = (value: 1 | -1) => {
    if (userVote === value) {
      voteAnswer(answer.id, -value as 1 | -1)
      setUserVote(0)
    } else {
      if (userVote !== 0) {
        voteAnswer(answer.id, -userVote as 1 | -1)
      }
      voteAnswer(answer.id, value)
      setUserVote(value)
    }
  }

  return (
    <div className={cn(
      "bg-white rounded-xl border p-6 transition-all",
      answer.isBestAnswer ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
    )}>
      {answer.isBestAnswer && (
        <div className="flex items-center gap-2 mb-4 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">最佳回答</span>
        </div>
      )}

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
            {answer.voteCount + userVote}
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
          <MarkdownRenderer content={answer.content} />

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={answer.author.avatar}
                alt={answer.author.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <Link to={`/profile/${answer.authorId}`} className="text-sm font-medium text-gray-900 hover:text-primary-500">
                  {answer.author.username}
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">
                    Lv.{answer.author.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(answer.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isQuestionAuthor && !answer.isAccepted && (
                <button
                  onClick={onAccept}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  采纳
                </button>
              )}
              {answer.isAccepted && (
                <span className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  已采纳
                </span>
              )}
              <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-500">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500">
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
