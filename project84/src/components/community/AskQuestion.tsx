import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, X, Code, Bold, Italic, Image, Link2, List, ListOrdered, Quote, Tag as TagIcon, HelpCircle, ChevronDown } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MarkdownRenderer } from '../community/MarkdownRenderer'
import { TagBadge } from '../community/TagBadge'
import { categories } from '../../data/mockData'

export function AskQuestion() {
  const navigate = useNavigate()
  const { allTags, addQuestion, followTag, unfollowTag, currentUser } = useApp()
  const tagSelectorRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [showTagSelector, setShowTagSelector] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagSelectorRef.current && !tagSelectorRef.current.contains(event.target as Node)) {
        setShowTagSelector(false)
      }
    }
    if (showTagSelector) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTagSelector])

  const handleTagSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(prev => prev.filter(id => id !== tagId))
    } else if (selectedTags.length < 5) {
      setSelectedTags(prev => [...prev, tagId])
    }
  }

  const toolbarButtons = [
    { icon: Bold, label: '粗体', prefix: '**', suffix: '**' },
    { icon: Italic, label: '斜体', prefix: '*', suffix: '*' },
    { icon: Code, label: '代码', prefix: '```\n', suffix: '\n```' },
    { icon: Quote, label: '引用', prefix: '> ', suffix: '' },
    { icon: List, label: '无序列表', prefix: '- ', suffix: '' },
    { icon: ListOrdered, label: '有序列表', prefix: '1. ', suffix: '' },
    { icon: Link2, label: '链接', prefix: '[', suffix: '](url)' },
    { icon: Image, label: '图片', prefix: '![', suffix: '](url)' },
  ]

  const insertMarkdown = (prefix: string, suffix: string) => {
    setContent(prev => prev + prefix + suffix)
  }

  const handleSubmit = () => {
    if (title.trim() && content.trim() && category && selectedTags.length > 0) {
      addQuestion({
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        category,
        difficulty,
      })
      navigate('/questions')
    }
  }

  const filteredTags = category
    ? allTags.filter(t => t.category === category)
    : allTags

  const difficultyOptions = [
    { value: 'beginner', label: '入门', desc: '基础概念和入门问题' },
    { value: 'intermediate', label: '进阶', desc: '有一定深度的技术问题' },
    { value: 'advanced', label: '高级', desc: '复杂或深入的技术问题' },
  ] as const

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">发布问题</h1>
        <p className="text-gray-500">分享你的困惑，让社区帮你解答</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            问题标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="用一句话描述你的问题..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            maxLength={200}
          />
          <p className="text-xs text-gray-400 mt-1">{title.length}/200</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            问题详情 <span className="text-red-500">*</span>
          </label>

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
              placeholder="详细描述你的问题，包括：&#10;1. 你尝试过的方法&#10;2. 遇到的具体错误&#10;3. 相关的代码片段&#10;&#10;支持 Markdown 格式"
              className="w-full min-h-[200px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分类 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.name)
                  setSelectedTags([])
                }}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                  category === cat.name
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签 <span className="text-red-500">*</span>
            <span className="text-xs text-gray-400 ml-2">(最多选择5个)</span>
          </label>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map(tagId => {
                const tag = allTags.find(t => t.id === tagId)
                return tag ? (
                  <TagBadge
                    key={tagId}
                    tag={tag}
                    onFollow={() => handleTagSelect(tagId)}
                    isFollowed={true}
                    size="sm"
                  />
                ) : null
              })}
            </div>
          )}
          <div className="relative" ref={tagSelectorRef}>
            <button
              type="button"
              onClick={() => setShowTagSelector(!showTagSelector)}
              className={`w-full px-4 py-3 border rounded-lg text-left transition-all flex items-center justify-between ${
                showTagSelector
                  ? 'border-primary-500 ring-2 ring-primary-100 bg-primary-50/50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                !category ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'text-gray-700'
              }`}
              disabled={!category}
            >
              <span>
                {!category ? '请先选择分类' :
                 selectedTags.length > 0 ? `已选择 ${selectedTags.length} 个标签 (${filteredTags.length}个可用)` :
                 `点击选择标签 (${filteredTags.length}个可用)`}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                showTagSelector ? 'rotate-180' : ''
              }`} />
            </button>
            {showTagSelector && category && (
              <div className="absolute z-10 w-full mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-gray-500 mb-3">点击标签进行选择，再次点击取消选择</p>
                <div className="flex flex-wrap gap-2">
                  {filteredTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagSelect(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                        selectedTags.includes(tag.id)
                          ? 'ring-2 ring-primary-500 ring-offset-1'
                          : 'hover:opacity-80'
                      }`}
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    >
                      {selectedTags.includes(tag.id) && '✓ '}
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            难度等级
          </label>
          <div className="grid grid-cols-3 gap-3">
            {difficultyOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`px-4 py-3 rounded-lg border text-left transition-all ${
                  difficulty === opt.value
                    ? opt.value === 'beginner' ? 'border-green-500 bg-green-50' :
                      opt.value === 'intermediate' ? 'border-yellow-500 bg-yellow-50' :
                      'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`font-medium ${
                  opt.value === 'beginner' ? 'text-green-600' :
                  opt.value === 'intermediate' ? 'text-yellow-600' : 'text-red-600'
                }`}>{opt.label}</div>
                <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <HelpCircle className="w-4 h-4" />
            发布问题将帮助更多人解决类似问题
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || !category || selectedTags.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              发布问题
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
