
import { useState } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import type { Inspiration } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  Lightbulb,
  Plus,
  Trash2,
  Edit2,
  Search,
  Clock,
  Tag
} from 'lucide-react';

const InspirationPage = () => {
  const {
    worldSetting,
    inspirations,
    addInspiration,
    updateInspiration,
    deleteInspiration
  } = useWorldStore();

  const [showModal, setShowModal] = useState(false);
  const [editingInspiration, setEditingInspiration] = useState<Inspiration | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Inspiration['category'] | 'all'>('all');

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  const filteredInspirations = inspirations.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: Array<{ category: Inspiration['category'] | 'all'; label: string }> = [
    { category: 'all', label: '全部' },
    { category: 'character', label: '人物' },
    { category: 'plot', label: '情节' },
    { category: 'world', label: '世界' },
    { category: 'magic', label: '魔法' },
    { category: 'tech', label: '科技' },
    { category: 'culture', label: '文化' },
    { category: 'other', label: '其他' },
  ];

  const getCategoryColor = (category: Inspiration['category']) => {
    const colors = {
      character: 'bg-tech-purple/20 text-tech-purple',
      plot: 'bg-magic-cyan/20 text-magic-cyan',
      world: 'bg-gold/20 text-gold',
      magic: 'bg-purple-500/20 text-purple-400',
      tech: 'bg-blue-500/20 text-blue-400',
      culture: 'bg-green-500/20 text-green-400',
      other: 'bg-gray-500/20 text-gray-400'
    };
    return colors[category];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            灵感笔记
          </h1>
          <p className="text-gray-400">记录随时浮现的创意想法</p>
        </div>
        <Button
          onClick={() => {
            setEditingInspiration(null);
            setShowModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          添加灵感
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索灵感..."
            className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(({ category, label }) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'text-gray-400 hover:text-gray-200 bg-dark-card border border-dark-border hover:border-dark-border/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredInspirations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInspirations.map((item) => (
            <Card key={item.id} hover>
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(item.category)}`}>
                  {categories.find(c => c.category === item.category)?.label}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingInspiration(item);
                      setShowModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-gold"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteInspiration(item.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <h3 className="text-white font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-gray-300 line-clamp-3">{item.content}</p>

              <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(item.createdAt)}</span>
              </div>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-dark-bg text-gray-400 rounded text-xs"
                    >
                      <Tag className="w-2 h-2" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            暂无灵感笔记
          </h2>
          <p className="text-gray-400 mb-6">
            捕捉创意想法，随时记录灵感
          </p>
          <Button
            onClick={() => {
              setEditingInspiration(null);
              setShowModal(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            添加第一个灵感
          </Button>
        </div>
      )}

      <InspirationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingInspiration(null);
        }}
        inspiration={editingInspiration}
        onSave={(data) => {
          if (editingInspiration) {
            updateInspiration(editingInspiration.id, data);
          } else {
            addInspiration(data);
          }
          setShowModal(false);
          setEditingInspiration(null);
        }}
      />
    </div>
  );
};

const InspirationModal = ({
  isOpen,
  onClose,
  inspiration,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  inspiration: Inspiration | null;
  onSave: (data: Omit<Inspiration, 'id' | 'createdAt'>) => void;
}) => {
  const [title, setTitle] = useState(inspiration?.title || '');
  const [category, setCategory] = useState<Inspiration['category']>(inspiration?.category || 'other');
  const [content, setContent] = useState(inspiration?.content || '');
  const [tagsText, setTagsText] = useState(inspiration?.tags.join(', ') || '');

  const categories: Array<{ value: Inspiration['category']; label: string }> = [
    { value: 'character', label: '人物' },
    { value: 'plot', label: '情节' },
    { value: 'world', label: '世界' },
    { value: 'magic', label: '魔法' },
    { value: 'tech', label: '科技' },
    { value: 'culture', label: '文化' },
    { value: 'other', label: '其他' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={inspiration ? '编辑灵感' : '添加灵感'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({
              title,
              category,
              content,
              tags: tagsText.split(',').map(t => t.trim()).filter(t => t)
            })}
            disabled={!title.trim() || !content.trim()}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">标题 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="灵感标题"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">分类</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  category === value
                    ? 'bg-gold/20 text-gold border border-gold/30'
                    : 'bg-dark-bg text-gray-300 border border-dark-border hover:bg-dark-border/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">内容 *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="详细描述你的灵感..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">标签（用逗号分隔）</label>
          <input
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：创意, 人物, 魔法"
          />
        </div>
      </div>
    </Modal>
  );
};

export default InspirationPage;
