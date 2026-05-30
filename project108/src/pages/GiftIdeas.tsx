
import { useState } from 'react';
import {
  Plus,
  Search,
  Tag,
  ShoppingCart,
  Link,
  Heart,
  X,
  Edit2,
  Trash2,
  Bookmark,
  Lightbulb,
  DollarSign,
  Users,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { GiftIdea } from '../types';

export default function GiftIdeas() {
  const {
    giftIdeas,
    contacts,
    addGiftIdea,
    updateGiftIdea,
    deleteGiftIdea,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState<GiftIdea | null>(null);
  const [priceFilter, setPriceFilter] = useState<{ min: number; max: number } | null>(null);

  const allTags = Array.from(new Set(giftIdeas.flatMap((gi) => gi.tags)));

  const filteredIdeas = giftIdeas.filter((gi) => {
    const matchesSearch =
      gi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gi.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || gi.tags.includes(selectedTag);
    const matchesPrice =
      !priceFilter ||
      (gi.priceMax >= priceFilter.min && gi.priceMin <= priceFilter.max);
    return matchesSearch && matchesTag && matchesPrice;
  });

  const getContactNames = (contactIds: string[]) => {
    return contactIds
      .map((id) => contacts.find((c) => c.id === id)?.name)
      .filter(Boolean);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idea':
        return 'bg-ink-100 text-ink-600';
      case 'saved':
        return 'bg-secondary-100 text-secondary-700';
      case 'purchased':
        return 'bg-primary-100 text-primary-700';
      default:
        return 'bg-ink-100 text-ink-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idea':
        return '灵感';
      case 'saved':
        return '已收藏';
      case 'purchased':
        return '已购买';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">
            礼物创意库
          </h1>
          <p className="text-ink-500 mt-1">
            共 {giftIdeas.length} 个创意 · {allTags.length} 个标签
          </p>
        </div>
        <button
          onClick={() => {
            setEditingIdea(null);
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          添加创意
        </button>
      </div>

      <div className="flex gap-4">
        <div className="w-64 flex-shrink-0">
          <div className="card space-y-6">
            <div>
              <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2">
                <Tag size={18} className="text-primary-500" />
                标签筛选
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedTag
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'hover:bg-ink-50 text-ink-600'
                  }`}
                >
                  全部标签
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedTag === tag
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'hover:bg-ink-50 text-ink-600'
                    }`}
                  >
                    <span className="tag mr-2 px-2 py-0.5 text-xs">#{tag}</span>
                    {giftIdeas.filter((gi) => gi.tags.includes(tag)).length}
                  </button>
                ))}
              </div>
            </div>

            <div className="divider" />

            <div>
              <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2">
                <DollarSign size={18} className="text-primary-500" />
                价格区间
              </h3>
              <div className="space-y-2">
                {[
                  { label: '全部价格', filter: null },
                  { label: '¥100以下', filter: { min: 0, max: 100 } },
                  { label: '¥100-500', filter: { min: 100, max: 500 } },
                  { label: '¥500-1000', filter: { min: 500, max: 1000 } },
                  { label: '¥1000以上', filter: { min: 1000, max: 999999 } },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setPriceFilter(option.filter)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      JSON.stringify(priceFilter) === JSON.stringify(option.filter)
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'hover:bg-ink-50 text-ink-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" size={20} />
            <input
              type="text"
              placeholder="搜索礼物名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          {filteredIdeas.length === 0 ? (
            <div className="card text-center py-12">
              <Lightbulb className="w-16 h-16 text-ink-300 mx-auto mb-4" />
              <p className="text-ink-500">
                {searchTerm || selectedTag || priceFilter
                  ? '没有找到匹配的创意'
                  : '还没有添加任何礼物创意'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {filteredIdeas.map((idea) => {
                const suggestedNames = getContactNames(idea.suggestedFor);
                return (
                  <div
                    key={idea.id}
                    className="card card-hover overflow-hidden group"
                  >
                    {idea.imageUrl && (
                      <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl">
                        <img
                          src={idea.imageUrl}
                          alt={idea.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(idea.status)}`}>
                            {getStatusText(idea.status)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-ink-900 truncate">
                            {idea.name}
                          </h3>
                          {!idea.imageUrl && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(idea.status)}`}>
                              {getStatusText(idea.status)}
                            </span>
                          )}
                        </div>
                        {idea.description && (
                          <p className="text-sm text-ink-500 mt-1 line-clamp-2">
                            {idea.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingIdea(idea);
                            setShowAddModal(true);
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-ink-100 flex items-center justify-center"
                        >
                          <Edit2 size={16} className="text-ink-500" />
                        </button>
                        <button
                          onClick={() => deleteGiftIdea(idea.id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <DollarSign size={14} className="text-ink-400" />
                      <span className="text-sm text-ink-600">
                        ¥{idea.priceMin} - ¥{idea.priceMax}
                      </span>
                    </div>

                    {idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {idea.tags.map((tag, i) => (
                          <span key={i} className="tag text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {idea.purchaseChannels.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-ink-100">
                        <p className="text-xs text-ink-500 mb-2 flex items-center gap-1">
                          <ShoppingCart size={12} />
                          购买渠道
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {idea.purchaseChannels.map((channel, i) => (
                            <a
                              key={i}
                              href={channel.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-ink-50 hover:bg-ink-100 rounded-lg text-xs text-ink-600 transition-colors"
                            >
                              <Link size={10} />
                              {channel.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestedNames.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-ink-100">
                        <p className="text-xs text-ink-500 mb-2 flex items-center gap-1">
                          <Users size={12} />
                          适合送给
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestedNames.map((name, i) => (
                            <span key={i} className="tag tag-secondary text-xs">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddIdeaModal
          idea={editingIdea}
          contacts={contacts}
          onClose={() => {
            setShowAddModal(false);
            setEditingIdea(null);
          }}
          onSave={(idea) => {
            if (editingIdea) {
              updateGiftIdea(editingIdea.id, idea);
            } else {
              addGiftIdea(idea);
            }
            setShowAddModal(false);
            setEditingIdea(null);
          }}
        />
      )}
    </div>
  );
}

function AddIdeaModal({
  idea,
  contacts,
  onClose,
  onSave,
}: {
  idea: GiftIdea | null;
  contacts: any[];
  onClose: () => void;
  onSave: (
    idea: Omit<GiftIdea, 'id' | 'userId' | 'createdAt' | 'status'>
  ) => void;
}) {
  const [formData, setFormData] = useState({
    name: idea?.name || '',
    description: idea?.description || '',
    tags: idea?.tags || [],
    priceMin: idea?.priceMin || 0,
    priceMax: idea?.priceMax || 0,
    purchaseChannels: idea?.purchaseChannels || [],
    imageUrl: idea?.imageUrl || '',
    suggestedFor: idea?.suggestedFor || [],
  });
  const [tagInput, setTagInput] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
  };

  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    if (!formData.tags.includes(tag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const addChannel = () => {
    if (!channelName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      purchaseChannels: [
        ...prev.purchaseChannels,
        { name: channelName.trim(), url: channelUrl.trim() || undefined },
      ],
    }));
    setChannelName('');
    setChannelUrl('');
  };

  const removeChannel = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      purchaseChannels: prev.purchaseChannels.filter((_, i) => i !== index),
    }));
  };

  const toggleContact = (contactId: string) => {
    setFormData((prev) => ({
      ...prev,
      suggestedFor: prev.suggestedFor.includes(contactId)
        ? prev.suggestedFor.filter((id) => id !== contactId)
        : [...prev.suggestedFor, contactId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-ink-100 p-6 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-ink-900">
            {idea ? '编辑创意' : '添加礼物创意'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-ink-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              礼物名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-field"
              placeholder="如：高级钢笔礼盒"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="input-field h-20 resize-none"
              placeholder="描述一下这个礼物的特点..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                最低价格 (¥)
              </label>
              <input
                type="number"
                value={formData.priceMin}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priceMin: parseFloat(e.target.value),
                  }))
                }
                className="input-field"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                最高价格 (¥)
              </label>
              <input
                type="number"
                value={formData.priceMax}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priceMax: parseFloat(e.target.value),
                  }))
                }
                className="input-field"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              图片链接
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
              className="input-field"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              标签
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput);
                    setTagInput('');
                  }
                }}
                className="input-field"
                placeholder="输入标签后按回车"
              />
              <button
                type="button"
                onClick={() => {
                  addTag(tagInput);
                  setTagInput('');
                }}
                className="btn-secondary"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, i) => (
                <span key={i} className="tag">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(i)}
                    className="ml-1 hover:text-primary-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              购买渠道
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="input-field flex-1"
                placeholder="渠道名称"
              />
              <input
                type="url"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                className="input-field flex-1"
                placeholder="链接 (可选)"
              />
              <button
                type="button"
                onClick={addChannel}
                className="btn-secondary"
              >
                添加
              </button>
            </div>
            <div className="space-y-2">
              {formData.purchaseChannels.map((channel, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-ink-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={14} className="text-ink-500" />
                    <span className="text-sm">{channel.name}</span>
                    {channel.url && (
                      <a
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-xs"
                      >
                        (链接)
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeChannel(i)}
                    className="text-ink-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              适合送给
            </label>
            <div className="grid grid-cols-2 gap-2">
              {contacts.map((contact) => (
                <label
                  key={contact.id}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    formData.suggestedFor.includes(contact.id)
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-ink-200 hover:border-ink-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.suggestedFor.includes(contact.id)}
                    onChange={() => toggleContact(contact.id)}
                    className="hidden"
                  />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center overflow-hidden">
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-ink-600">
                        {contact.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs text-ink-500 truncate">
                      {contact.relation}
                    </p>
                  </div>
                  {formData.suggestedFor.includes(contact.id) && (
                    <Heart size={16} className="text-primary-500 fill-primary-500" />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {idea ? '保存修改' : '添加创意'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
