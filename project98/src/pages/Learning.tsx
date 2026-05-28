import { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Quote, User } from 'lucide-react';
import { useStore } from '../store';
import type { InvestmentNote, BookNote, MasterResearch } from '../types';

type TabType = 'notes' | 'books' | 'masters';

export default function Learning() {
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [selectedNote, setSelectedNote] = useState<InvestmentNote | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookNote | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<MasterResearch | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'value' as 'value' | 'growth' | 'quant',
    book_title: '',
    notes: '',
    quotes: '',
    status: 'reading' as 'reading' | 'completed',
    master_name: '',
    analysis: '',
    strategies: '',
  });

  const {
    investmentNotes,
    bookNotes,
    masterResearch,
    addInvestmentNote,
    updateInvestmentNote,
    deleteInvestmentNote,
    addBookNote,
    updateBookNote,
    deleteBookNote,
    addMasterResearch,
    updateMasterResearch,
    deleteMasterResearch,
  } = useStore();

  const handleSave = () => {
    if (activeTab === 'notes') {
      if (selectedNote) {
        updateInvestmentNote(selectedNote.id, {
          title: formData.title,
          content: formData.content,
          category: formData.category,
        });
      } else {
        addInvestmentNote({
          title: formData.title,
          content: formData.content,
          category: formData.category,
        });
      }
    } else if (activeTab === 'books') {
      if (selectedBook) {
        updateBookNote(selectedBook.id, {
          book_title: formData.book_title,
          notes: formData.notes,
          quotes: formData.quotes,
          status: formData.status,
        });
      } else {
        addBookNote({
          book_title: formData.book_title,
          notes: formData.notes,
          quotes: formData.quotes,
          status: formData.status,
        });
      }
    } else {
      if (selectedMaster) {
        updateMasterResearch(selectedMaster.id, {
          master_name: formData.master_name,
          analysis: formData.analysis,
          strategies: formData.strategies,
        });
      } else {
        addMasterResearch({
          master_name: formData.master_name,
          analysis: formData.analysis,
          strategies: formData.strategies,
        });
      }
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'value',
      book_title: '',
      notes: '',
      quotes: '',
      status: 'reading',
      master_name: '',
      analysis: '',
      strategies: '',
    });
    setSelectedNote(null);
    setSelectedBook(null);
    setSelectedMaster(null);
    setShowForm(false);
  };

  const handleEdit = (item: InvestmentNote | BookNote | MasterResearch) => {
    if ('category' in item) {
      setSelectedNote(item as InvestmentNote);
      setFormData({ ...formData, title: item.title, content: item.content, category: item.category });
    } else if ('book_title' in item) {
      setSelectedBook(item as BookNote);
      setFormData({ ...formData, book_title: item.book_title, notes: item.notes, quotes: item.quotes, status: item.status });
    } else {
      setSelectedMaster(item as MasterResearch);
      setFormData({ ...formData, master_name: item.master_name, analysis: item.analysis, strategies: item.strategies });
    }
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'notes') {
      deleteInvestmentNote(id);
    } else if (activeTab === 'books') {
      deleteBookNote(id);
    } else {
      deleteMasterResearch(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">投资学习</h1>
          <p className="text-gray-500 mt-1">记录投资知识、书籍笔记和大师研究</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg animate-pulse">
            <span className="text-green-600">✓</span>
            保存成功！
          </div>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'notes', label: '投资笔记', icon: BookOpen },
          { id: 'books', label: '书籍笔记', icon: Quote },
          { id: 'masters', label: '大师研究', icon: User },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as TabType);
              // 切换标签时保持表单状态不变，只重置选中项
              setSelectedNote(null);
              setSelectedBook(null);
              setSelectedMaster(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'notes' && (
            <>
              {investmentNotes.length > 0 ? (
                investmentNotes.map((note) => (
                  <div key={note.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          note.category === 'value' ? 'bg-blue-100 text-blue-600' :
                          note.category === 'growth' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {note.category === 'value' ? '价值投资' :
                           note.category === 'growth' ? '成长投资' : '量化投资'}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-800">{note.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{new Date(note.created_at).toLocaleDateString('zh-CN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(note)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-600">{note.content}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">暂无投资笔记</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'books' && (
            <>
              {bookNotes.length > 0 ? (
                bookNotes.map((book) => (
                  <div key={book.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          book.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {book.status === 'completed' ? '已完成' : '阅读中'}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-800">{book.book_title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{new Date(book.created_at).toLocaleDateString('zh-CN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">阅读笔记</p>
                        <p className="text-gray-600 mt-1">{book.notes}</p>
                      </div>
                      {book.quotes && (
                        <div className="border-l-4 border-primary-500 pl-4 bg-gray-50 rounded-r-lg py-2">
                          <p className="text-sm font-medium text-gray-700">金句摘录</p>
                          <p className="text-gray-600 mt-1 italic">{book.quotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                  <Quote className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">暂无书籍笔记</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'masters' && (
            <>
              {masterResearch.length > 0 ? (
                masterResearch.map((master) => (
                  <div key={master.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{master.master_name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{new Date(master.created_at).toLocaleDateString('zh-CN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(master)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(master.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">操作逻辑分析</p>
                        <p className="text-gray-600 mt-1">{master.analysis}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">核心策略</p>
                        <pre className="text-gray-600 mt-1 whitespace-pre-wrap">{master.strategies}</pre>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                  <User className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">暂无大师研究记录</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{showForm ? '编辑' : '添加'}</h3>
              {showForm && (
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  取消
                </button>
              )}
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                添加{activeTab === 'notes' ? '投资笔记' : activeTab === 'books' ? '书籍笔记' : '大师研究'}
              </button>
            ) : (
              <div className="space-y-4">
                {activeTab === 'notes' && (
                  <>
                    <input
                      type="text"
                      placeholder="标题"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as 'value' | 'growth' | 'quant' })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="value">价值投资</option>
                      <option value="growth">成长投资</option>
                      <option value="quant">量化投资</option>
                    </select>
                    <textarea
                      placeholder="内容"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </>
                )}

                {activeTab === 'books' && (
                  <>
                    <input
                      type="text"
                      placeholder="书名"
                      value={formData.book_title}
                      onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'reading' | 'completed' })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="reading">阅读中</option>
                      <option value="completed">已完成</option>
                    </select>
                    <textarea
                      placeholder="阅读笔记"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <textarea
                      placeholder="金句摘录"
                      value={formData.quotes}
                      onChange={(e) => setFormData({ ...formData, quotes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </>
                )}

                {activeTab === 'masters' && (
                  <>
                    <input
                      type="text"
                      placeholder="大师姓名"
                      value={formData.master_name}
                      onChange={(e) => setFormData({ ...formData, master_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <textarea
                      placeholder="操作逻辑分析"
                      value={formData.analysis}
                      onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <textarea
                      placeholder="核心策略"
                      value={formData.strategies}
                      onChange={(e) => setFormData({ ...formData, strategies: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </>
                )}

                <button
                  onClick={handleSave}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  保存
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
