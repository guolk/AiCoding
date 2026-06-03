import { useState } from 'react'
import { MessageSquare, HelpCircle, Users, Plus, ChevronDown, ChevronUp, Trash2, Edit3, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { ReaderFeedback, FAQ } from '@/types'

const tabs = [
  { key: 'feedback', label: '读者反馈', icon: MessageSquare },
  { key: 'faq', label: 'FAQ管理', icon: HelpCircle },
  { key: 'profiles', label: '读者档案', icon: Users },
] as const

type TabKey = (typeof tabs)[number]['key']

const feedbackCategories = [
  { key: 'all', label: '全部' },
  { key: 'praise', label: '好评' },
  { key: 'criticism', label: '批评' },
  { key: 'question', label: '问题' },
  { key: 'suggestion', label: '建议' },
]

const categoryBadge: Record<string, string> = {
  praise: 'bg-green-100 text-green-700',
  criticism: 'bg-red-100 text-red-700',
  question: 'bg-blue-100 text-blue-700',
  suggestion: 'bg-amber-100 text-amber-700',
}

const categoryLabel: Record<string, string> = {
  praise: '好评', criticism: '批评', question: '问题', suggestion: '建议',
}

const priorityDot: Record<string, string> = {
  high: 'bg-crimson', medium: 'bg-gold', low: 'bg-gray-400',
}

export default function Readers() {
  const { readerFeedbacks, faqs, readers, addFeedback, updateFeedback, deleteFeedback, deleteFAQ, addFAQ } = useStore()
  const [activeTab, setActiveTab] = useState<TabKey>('feedback')
  const [filterCat, setFilterCat] = useState('all')
  const [showAddFeedback, setShowAddFeedback] = useState(false)
  const [showAddFaq, setShowAddFaq] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [expandedReader, setExpandedReader] = useState<string | null>(null)
  const [faqSearch, setFaqSearch] = useState('')
  const [newFeedback, setNewFeedback] = useState({ content: '', category: 'praise' as ReaderFeedback['category'], priority: 'medium' as ReaderFeedback['priority'] })
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' })
  const [successMessage, setSuccessMessage] = useState('')

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const getReaderName = (id: string) => readers.find(r => r.id === id)?.name ?? '未知读者'

  const filteredFeedbacks = filterCat === 'all'
    ? readerFeedbacks
    : readerFeedbacks.filter(f => f.category === filterCat)

  const filteredFaqs = faqs.filter(f =>
    f.question.includes(faqSearch) || f.answer.includes(faqSearch) || f.category.includes(faqSearch)
  )

  const handleAddFeedback = () => {
    if (!newFeedback.content.trim()) return
    addFeedback({ id: String(Date.now()), ...newFeedback, readerId: readers[0]?.id ?? '', date: new Date().toISOString().slice(0, 10), resolved: false })
    setNewFeedback({ content: '', category: 'praise', priority: 'medium' })
    setShowAddFeedback(false)
    showSuccess('反馈添加成功！')
  }

  const handleDeleteFeedback = (id: string) => {
    deleteFeedback(id)
    showSuccess('反馈已删除')
  }

  const handleAddFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return
    addFAQ({ id: String(Date.now()), ...newFaq, order: faqs.length + 1 })
    setNewFaq({ question: '', answer: '', category: '' })
    setShowAddFaq(false)
    showSuccess('FAQ添加成功！')
  }

  return (
    <div className="p-8 space-y-6 relative">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow-lg animate-fade-in-up">
          <Check className="w-4 h-4" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}
      <h1 className="font-display text-3xl font-bold text-ink">读者互动</h1>

      <div className="flex gap-1 bg-ivory rounded-lg p-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-ink text-gold shadow-sm' : 'text-ink/60 hover:text-ink'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {feedbackCategories.map(c => (
                <button key={c.key} onClick={() => setFilterCat(c.key)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${filterCat === c.key ? 'bg-ink text-gold' : 'bg-sand text-ink/60 hover:text-ink'}`}>
                  {c.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAddFeedback(!showAddFeedback)}
              className="flex items-center gap-1 px-3 py-1.5 bg-ink text-gold rounded-lg text-sm hover:bg-ink/90 transition-colors">
              <Plus className="w-4 h-4" />添加反馈
            </button>
          </div>

          {showAddFeedback && (
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-sand">
              <textarea value={newFeedback.content} onChange={e => setNewFeedback(p => ({ ...p, content: e.target.value }))}
                className="w-full border border-sand rounded-lg p-2 text-sm focus:outline-none focus:border-gold" rows={3} placeholder="反馈内容..." />
              <div className="flex gap-3">
                <select value={newFeedback.category} onChange={e => setNewFeedback(p => ({ ...p, category: e.target.value as ReaderFeedback['category'] }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold">
                  {Object.entries(categoryLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={newFeedback.priority} onChange={e => setNewFeedback(p => ({ ...p, priority: e.target.value as ReaderFeedback['priority'] }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold">
                  <option value="high">高</option><option value="medium">中</option><option value="low">低</option>
                </select>
                <button onClick={handleAddFeedback} className="px-4 py-1 bg-gold text-ink rounded-lg text-sm font-medium hover:bg-gold/90">提交</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {filteredFeedbacks.map(fb => (
              <div key={fb.id} className="bg-white rounded-xl p-4 shadow-sm border border-sand/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryBadge[fb.category]}`}>{categoryLabel[fb.category]}</span>
                    <span className={`w-2 h-2 rounded-full ${priorityDot[fb.priority]}`} title={fb.priority} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDeleteFeedback(fb.id)} className="p-1 text-ink/40 hover:text-crimson transition-colors" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateFeedback(fb.id, { resolved: !fb.resolved })}
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors ${fb.resolved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      <Check className="w-3 h-3" />{fb.resolved ? '已解决' : '未解决'}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink/80">{fb.content}</p>
                <div className="mt-2 text-xs text-ink/40">{getReaderName(fb.readerId)} · {fb.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <input value={faqSearch} onChange={e => setFaqSearch(e.target.value)}
              className="border border-sand rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold w-64" placeholder="搜索FAQ..." />
            <button onClick={() => setShowAddFaq(!showAddFaq)}
              className="flex items-center gap-1 px-3 py-1.5 bg-ink text-gold rounded-lg text-sm hover:bg-ink/90 transition-colors">
              <Plus className="w-4 h-4" />添加FAQ
            </button>
          </div>

          {showAddFaq && (
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-sand">
              <input value={newFaq.question} onChange={e => setNewFaq(p => ({ ...p, question: e.target.value }))}
                className="w-full border border-sand rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold" placeholder="问题" />
              <textarea value={newFaq.answer} onChange={e => setNewFaq(p => ({ ...p, answer: e.target.value }))}
                className="w-full border border-sand rounded-lg p-2 text-sm focus:outline-none focus:border-gold" rows={3} placeholder="回答" />
              <div className="flex gap-3">
                <input value={newFaq.category} onChange={e => setNewFaq(p => ({ ...p, category: e.target.value }))}
                  className="border border-sand rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gold" placeholder="分类" />
                <button onClick={handleAddFaq} className="px-4 py-1 bg-gold text-ink rounded-lg text-sm font-medium hover:bg-gold/90">提交</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {filteredFaqs.map(faq => (
              <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-sand/50 overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-ivory/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{faq.question}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sand text-ink/60">{faq.category}</span>
                  </div>
                  {expandedFaq === faq.id ? <ChevronUp className="w-4 h-4 text-ink/40" /> : <ChevronDown className="w-4 h-4 text-ink/40" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 pb-3 border-t border-sand/50">
                    <p className="text-sm text-ink/70 pt-3">{faq.answer}</p>
                    <div className="flex gap-2 mt-3 justify-end">
                      <button className="p-1 text-ink/40 hover:text-ink transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => deleteFAQ(faq.id)} className="p-1 text-ink/40 hover:text-crimson transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profiles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {readers.map(reader => {
            const isExpanded = expandedReader === reader.id
            return (
              <div key={reader.id} className="bg-white rounded-xl p-5 shadow-sm border border-sand/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ink text-gold flex items-center justify-center font-display text-sm font-bold shrink-0">
                    {reader.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">{reader.name}</div>
                    <div className="text-xs text-ink/40 truncate">{reader.email}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {reader.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-sand text-ink">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-ink/40">
                  <span>互动 {reader.interactionCount} 次</span>
                  <span>最近联系 {reader.lastContactDate}</span>
                </div>
                <p className={`mt-2 text-xs text-ink/60 ${isExpanded ? '' : 'line-clamp-2'}`} onClick={() => setExpandedReader(isExpanded ? null : reader.id)}>
                  {reader.notes}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
