import { useState } from 'react'
import { Send, X, Code, Bold, Italic, Image, Link2, List, ListOrdered, Quote } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MarkdownRenderer } from '../community/MarkdownRenderer'

interface AnswerFormProps {
  questionId: string
  onCancel: () => void
  onSubmit: () => void
}

export function AnswerForm({ questionId, onCancel, onSubmit }: AnswerFormProps) {
  const { addAnswer } = useApp()
  const [content, setContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = () => {
    if (content.trim()) {
      addAnswer(questionId, content)
      setContent('')
      onSubmit()
    }
  }

  const toolbarButtons = [
    { icon: Bold, label: '粗体', prefix: '**', suffix: '**' },
    { icon: Italic, label: '斜体', prefix: '*', suffix: '*' },
    { icon: Code, label: '代码', prefix: '`', suffix: '`' },
    { icon: Quote, label: '引用', prefix: '> ', suffix: '' },
    { icon: List, label: '无序列表', prefix: '- ', suffix: '' },
    { icon: ListOrdered, label: '有序列表', prefix: '1. ', suffix: '' },
    { icon: Link2, label: '链接', prefix: '[', suffix: '](url)' },
    { icon: Image, label: '图片', prefix: '![', suffix: '](url)' },
  ]

  const insertMarkdown = (prefix: string, suffix: string) => {
    setContent(prev => prev + prefix + suffix)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">撰写回答</h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex items-center gap-1 mb-3 pb-3 border-b border-gray-200">
        {toolbarButtons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => insertMarkdown(btn.prefix, btn.suffix)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={btn.label}
          >
            <btn.icon className="w-4 h-4 text-gray-600" />
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            showPreview ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {showPreview ? '编辑' : '预览'}
        </button>
      </div>

      {showPreview ? (
        <div className="min-h-[200px] p-4 bg-gray-50 rounded-lg">
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-gray-400">预览区域</p>
          )}
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的知识和经验... 支持Markdown格式"
          className="w-full min-h-[200px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-400">
          回答将获得 10 积分，被采纳可获得 50 积分奖励
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            发布回答
          </button>
        </div>
      </div>
    </div>
  )
}
