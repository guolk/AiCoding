import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, User, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ResearchNote } from '../types';

export const Research: React.FC = () => {
  const { data, addResearchNote, updateResearchNote, deleteResearchNote } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ResearchNote | null>(null);
  const [formData, setFormData] = useState<Partial<ResearchNote>>({});
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingItem ? editingItem.id : Date.now().toString();
    
    if (editingItem) {
      updateResearchNote(id, formData);
    } else {
      addResearchNote({ ...formData, id, confirmed: false } as ResearchNote);
    }
    
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleEdit = (item: ResearchNote) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条考证记录吗？')) {
      deleteResearchNote(id);
    }
  };

  const toggleConfirm = (item: ResearchNote) => {
    updateResearchNote(item.id, { confirmed: !item.confirmed });
  };

  const getInfoTitle = (infoId: string) => {
    const member = data.members.find(m => m.id === infoId);
    if (member) return `成员：${member.name}`;
    
    const event = data.events.find(e => e.id === infoId);
    if (event) return `事件：${event.title}`;
    
    const oralHistory = data.oralHistories.find(o => o.id === infoId);
    if (oralHistory) return `口述历史：${oralHistory.title}`;
    
    const photo = data.photos.find(p => p.id === infoId);
    if (photo) return `照片：${photo.title}`;
    
    const bio = data.biographies.find(b => b.id === infoId);
    if (bio) return `传记：${bio.title}`;
    
    return `信息 ID：${infoId}`;
  };

  const filteredNotes = data.researchNotes.filter(note => {
    if (filter === 'confirmed') return note.confirmed;
    if (filter === 'pending') return !note.confirmed;
    return true;
  });

  const sourceTypeLabels = {
    elder: '老人讲述',
    document: '文献记载'
  };

  return (
    <div className="min-h-screen bg-warm-beige py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-song text-brown-800 mb-2">数据考证</h1>
            <p className="text-brown-600">记录信息来源，标注待确认信息</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-brown-200 rounded-lg bg-white focus:ring-2 focus:ring-brown-500 focus:border-transparent"
            >
              <option value="all">全部</option>
              <option value="confirmed">已确认</option>
              <option value="pending">待确认</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="bg-brown-600 text-white px-4 py-2 rounded-lg shadow hover:bg-brown-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加记录
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-6 h-6 text-brown-500" />
              <h3 className="text-lg font-semibold text-brown-800">总记录</h3>
            </div>
            <p className="text-3xl font-bold text-brown-600">{data.researchNotes.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-brown-800">已确认</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {data.researchNotes.filter(n => n.confirmed).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-semibold text-brown-800">待确认</h3>
            </div>
            <p className="text-3xl font-bold text-amber-600">
              {data.researchNotes.filter(n => !n.confirmed).length}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-brown-800">{getInfoTitle(note.infoId)}</h3>
                    {note.confirmed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        已确认
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        待确认
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-brown-500">信息来源</span>
                      <p className="text-brown-700 flex items-center gap-2">
                        {note.sourceType === 'elder' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        {sourceTypeLabels[note.sourceType]}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-brown-500">来源说明</span>
                      <p className="text-brown-700">{note.source}</p>
                    </div>
                  </div>
                  {note.historicalSource && (
                    <div>
                      <span className="text-sm text-brown-500">史料关联</span>
                      <p className="text-brown-700">{note.historicalSource}</p>
                    </div>
                  )}
                </div>
                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => toggleConfirm(note)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      note.confirmed
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {note.confirmed ? (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        标记待确认
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        确认信息
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(note)}
                    className="px-4 py-2 rounded-lg bg-brown-100 text-brown-700 hover:bg-brown-200 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div className="text-center py-12 text-brown-500 bg-white rounded-xl shadow-md">
              暂无考证记录
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-brown-100">
              <h2 className="text-2xl font-bold font-song text-brown-800">
                {editingItem ? '编辑考证记录' : '添加考证记录'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">关联信息 *</label>
                <select
                  required
                  value={formData.infoId || ''}
                  onChange={(e) => setFormData({ ...formData, infoId: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                >
                  <option value="">选择关联信息</option>
                  <optgroup label="家族成员">
                    {data.members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="历史事件">
                    {data.events.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="口述历史">
                    {data.oralHistories.map((o) => (
                      <option key={o.id} value={o.id}>{o.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="照片">
                    {data.photos.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="传记">
                    {data.biographies.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">来源类型 *</label>
                <select
                  required
                  value={formData.sourceType || ''}
                  onChange={(e) => setFormData({ ...formData, sourceType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                >
                  <option value="">选择来源类型</option>
                  <option value="elder">老人讲述</option>
                  <option value="document">文献记载</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">来源说明 *</label>
                <input
                  type="text"
                  required
                  value={formData.source || ''}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="例如：爷爷口述、王氏宗谱等"
                  className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">史料关联</label>
                <input
                  type="text"
                  value={formData.historicalSource || ''}
                  onChange={(e) => setFormData({ ...formData, historicalSource: e.target.value })}
                  placeholder="例如：XX地方志、XX史料等"
                  className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                />
              </div>
              {editingItem && (
                <div>
                  <label className="flex items-center gap-2 text-brown-700">
                    <input
                      type="checkbox"
                      checked={formData.confirmed || false}
                      onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
                      className="rounded border-brown-300 text-brown-600 focus:ring-brown-500"
                    />
                    已确认信息
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-brown-600 text-white py-2 px-4 rounded-lg hover:bg-brown-700 transition-colors"
                >
                  {editingItem ? '保存修改' : '添加记录'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
