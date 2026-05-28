import React, { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, Award, User, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Biography, FamilyTrait, ThemeStory } from '../types';

type TabType = 'biographies' | 'traits' | 'themes';

export const Stories: React.FC = () => {
  const { data, addBiography, updateBiography, deleteBiography, addFamilyTrait, updateFamilyTrait, deleteFamilyTrait, addThemeStory, updateThemeStory, deleteThemeStory } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('biographies');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingItem ? editingItem.id : Date.now().toString();
    
    if (activeTab === 'biographies') {
      if (editingItem) {
        updateBiography(id, formData);
      } else {
        addBiography({ ...formData, id } as Biography);
      }
    } else if (activeTab === 'traits') {
      if (editingItem) {
        updateFamilyTrait(id, formData);
      } else {
        addFamilyTrait({ ...formData, id } as FamilyTrait);
      }
    } else if (activeTab === 'themes') {
      if (editingItem) {
        updateThemeStory(id, formData);
      } else {
        addThemeStory({ ...formData, id } as ThemeStory);
      }
    }
    
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      if (activeTab === 'biographies') deleteBiography(id);
      else if (activeTab === 'traits') deleteFamilyTrait(id);
      else if (activeTab === 'themes') deleteThemeStory(id);
    }
  };

  const getMemberName = (memberId: string) => {
    const member = data.members.find(m => m.id === memberId);
    return member ? member.name : '未知';
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'struggle': return '💪';
      case 'migration': return '🚶';
      case 'war': return '⚔️';
      default: return '📖';
    }
  };

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case 'struggle': return '奋斗';
      case 'migration': return '迁徙';
      case 'war': return '战争年代';
      default: return '其他';
    }
  };

  const getTraitLabel = (type: string) => {
    switch (type) {
      case 'motto': return '家训';
      case 'value': return '价值观';
      case 'custom': return '传统习俗';
      default: return '其他';
    }
  };

  const renderBiographies = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.biographies.map((bio) => (
        <div
          key={bio.id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="bg-gradient-to-r from-brown-400 to-brown-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <User className="w-5 h-5 text-brown-600" />
              </div>
              <div className="text-white">
                <h3 className="font-semibold">{bio.title}</h3>
                <p className="text-sm text-brown-100">
                  {getMemberName(bio.memberId)}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-brown-700 mb-4 leading-relaxed line-clamp-4">{bio.content}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(bio)}
                className="flex-1 py-2 px-3 text-brown-600 hover:bg-brown-50 rounded-lg transition-colors"
              >
                编辑
              </button>
              <button
                onClick={() => handleDelete(bio.id)}
                className="flex-1 py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
      {data.biographies.length === 0 && (
        <div className="col-span-full text-center py-12 text-brown-500">
          暂无个人传记
        </div>
      )}
    </div>
  );

  const renderFamilyTraits = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.familyTraits.map((trait) => (
        <div
          key={trait.id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="bg-gradient-to-r from-brown-400 to-brown-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Award className="w-5 h-5 text-brown-600" />
              </div>
              <div className="text-white">
                <h3 className="font-semibold">{trait.title}</h3>
                <p className="text-sm text-brown-100">{getTraitLabel(trait.type)}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-brown-700 mb-4 leading-relaxed">{trait.content}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(trait)}
                className="flex-1 py-2 px-3 text-brown-600 hover:bg-brown-50 rounded-lg transition-colors"
              >
                编辑
              </button>
              <button
                onClick={() => handleDelete(trait.id)}
                className="flex-1 py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
      {data.familyTraits.length === 0 && (
        <div className="col-span-full text-center py-12 text-brown-500">
          暂无家族精神记录
        </div>
      )}
    </div>
  );

  const renderThemeStories = () => (
    <div className="space-y-6">
      {['struggle', 'migration', 'war'].map((theme) => {
        const stories = data.themeStories.filter(s => s.theme === theme);
        if (stories.length === 0) return null;
        return (
          <div key={theme} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-brown-400 to-brown-600 p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getThemeIcon(theme)}</span>
                <div className="text-white">
                  <h3 className="text-xl font-semibold">{getThemeLabel(theme)}</h3>
                  <p className="text-sm text-brown-100">{stories.length} 个故事</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stories.map((story) => (
                  <div key={story.id} className="bg-brown-50 rounded-lg p-4">
                    <h4 className="font-semibold text-brown-800 mb-2">{story.title}</h4>
                    <p className="text-brown-700 text-sm leading-relaxed line-clamp-3 mb-3">{story.content}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(story)}
                        className="text-sm text-brown-600 hover:underline"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      {data.themeStories.length === 0 && (
        <div className="text-center py-12 text-brown-500">
          暂无主题故事
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-beige py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-song text-brown-800 mb-2">故事整理</h1>
            <p className="text-brown-600">记录家族成员传记、家族精神和主题故事</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-brown-600 text-white px-4 py-2 rounded-lg shadow hover:bg-brown-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加记录
          </button>
        </div>

        <div className="flex bg-white rounded-lg shadow-sm p-1 mb-8">
          <button
            onClick={() => setActiveTab('biographies')}
            className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'biographies'
                ? 'bg-brown-600 text-white'
                : 'text-brown-600 hover:bg-brown-50'
            }`}
          >
            <User className="w-5 h-5" />
            个人传记
          </button>
          <button
            onClick={() => setActiveTab('traits')}
            className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'traits'
                ? 'bg-brown-600 text-white'
                : 'text-brown-600 hover:bg-brown-50'
            }`}
          >
            <Award className="w-5 h-5" />
            家族精神
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'themes'
                ? 'bg-brown-600 text-white'
                : 'text-brown-600 hover:bg-brown-50'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            主题故事
          </button>
        </div>

        {activeTab === 'biographies' && renderBiographies()}
        {activeTab === 'traits' && renderFamilyTraits()}
        {activeTab === 'themes' && renderThemeStories()}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-brown-100">
              <h2 className="text-2xl font-bold font-song text-brown-800">
                {editingItem ? '编辑记录' : '添加记录'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeTab === 'biographies' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">标题 *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">家族成员 *</label>
                    <select
                      required
                      value={formData.memberId || ''}
                      onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    >
                      <option value="">选择成员</option>
                      {data.members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">传记内容 *</label>
                    <textarea
                      required
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {activeTab === 'traits' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">标题 *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">类型 *</label>
                    <select
                      required
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    >
                      <option value="">选择类型</option>
                      <option value="motto">家训</option>
                      <option value="value">价值观</option>
                      <option value="custom">传统习俗</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">内容 *</label>
                    <textarea
                      required
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {activeTab === 'themes' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">标题 *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">主题 *</label>
                    <select
                      required
                      value={formData.theme || ''}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    >
                      <option value="">选择主题</option>
                      <option value="struggle">奋斗</option>
                      <option value="migration">迁徙</option>
                      <option value="war">战争年代</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">故事内容 *</label>
                    <textarea
                      required
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    />
                  </div>
                </>
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
