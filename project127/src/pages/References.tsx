
import { useState } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import type { Reference } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  Book,
  Film,
  Gamepad2,
  Music,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Star,
  Search
} from 'lucide-react';

const ReferencePage = () => {
  const {
    worldSetting,
    references,
    addReference,
    updateReference,
    deleteReference
  } = useWorldStore();

  const [showModal, setShowModal] = useState(false);
  const [editingReference, setEditingReference] = useState<Reference | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<Reference['type'] | 'all'>('all');

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Book className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  const filteredReferences = references.filter((ref) => {
    const matchesSearch = ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || ref.type === selectedType;
    return matchesSearch && matchesType;
  });

  const typeLabels: Array<{ type: Reference['type'] | 'all'; label: string; icon: React.ReactNode }> = [
    { type: 'all', label: '全部', icon: <Search className="w-4 h-4" /> },
    { type: 'book', label: '书籍', icon: <Book className="w-4 h-4" /> },
    { type: 'movie', label: '影视', icon: <Film className="w-4 h-4" /> },
    { type: 'game', label: '游戏', icon: <Gamepad2 className="w-4 h-4" /> },
    { type: 'music', label: '音乐', icon: <Music className="w-4 h-4" /> },
    { type: 'other', label: '其他', icon: <ExternalLink className="w-4 h-4" /> },
  ];

  const getTypeIcon = (type: Reference['type']) => {
    const icons = {
      book: <Book className="w-5 h-5" />,
      movie: <Film className="w-5 h-5" />,
      game: <Gamepad2 className="w-5 h-5" />,
      music: <Music className="w-5 h-5" />,
      other: <ExternalLink className="w-5 h-5" />
    };
    return icons[type];
  };

  const getTypeColor = (type: Reference['type']) => {
    const colors = {
      book: 'text-magic-cyan',
      movie: 'text-tech-purple',
      game: 'text-gold',
      music: 'text-red-400',
      other: 'text-gray-400'
    };
    return colors[type];
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            参考素材
          </h1>
          <p className="text-gray-400">收集和管理灵感来源</p>
        </div>
        <Button
          onClick={() => {
            setEditingReference(null);
            setShowModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          添加参考
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索参考..."
            className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2">
          {typeLabels.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedType === type
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'text-gray-400 hover:text-gray-200 bg-dark-card border border-dark-border hover:border-dark-border/50'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredReferences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReferences.map((ref) => (
            <Card key={ref.id} hover>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-dark-bg ${getTypeColor(ref.type)}`}>
                  {getTypeIcon(ref.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-medium">{ref.title}</h3>
                      <p className="text-sm text-gray-400">{ref.author}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingReference(ref);
                          setShowModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gold"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteReference(ref.id)}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {ref.notes && (
                    <p className="text-sm text-gray-300 mt-2">{ref.notes}</p>
                  )}

                  {ref.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < ref.rating! ? 'text-gold fill-gold' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-magic-cyan hover:text-magic-cyan/80"
                    >
                      <ExternalLink className="w-3 h-3" />
                      打开链接
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Book className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            暂无参考素材
          </h2>
          <p className="text-gray-400 mb-6">
            收集书籍、影视、游戏等灵感来源
          </p>
          <Button
            onClick={() => {
              setEditingReference(null);
              setShowModal(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            添加第一个参考
          </Button>
        </div>
      )}

      <ReferenceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingReference(null);
        }}
        reference={editingReference}
        onSave={(data) => {
          if (editingReference) {
            updateReference(editingReference.id, data);
          } else {
            addReference(data);
          }
          setShowModal(false);
          setEditingReference(null);
        }}
      />
    </div>
  );
};

const ReferenceModal = ({
  isOpen,
  onClose,
  reference,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  reference: Reference | null;
  onSave: (data: Omit<Reference, 'id'>) => void;
}) => {
  const [title, setTitle] = useState(reference?.title || '');
  const [type, setType] = useState<Reference['type']>(reference?.type || 'book');
  const [author, setAuthor] = useState(reference?.author || '');
  const [notes, setNotes] = useState(reference?.notes || '');
  const [url, setUrl] = useState(reference?.url || '');
  const [rating, setRating] = useState(reference?.rating || 0);

  const types: Array<{ value: Reference['type']; label: string; icon: React.ReactNode }> = [
    { value: 'book', label: '书籍', icon: <Book className="w-4 h-4" /> },
    { value: 'movie', label: '影视', icon: <Film className="w-4 h-4" /> },
    { value: 'game', label: '游戏', icon: <Gamepad2 className="w-4 h-4" /> },
    { value: 'music', label: '音乐', icon: <Music className="w-4 h-4" /> },
    { value: 'other', label: '其他', icon: <ExternalLink className="w-4 h-4" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reference ? '编辑参考' : '添加参考'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({
              title,
              type,
              author,
              notes,
              url,
              rating: rating || undefined
            })}
            disabled={!title.trim() || !author.trim()}
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
            placeholder="例如：指环王"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">类型</label>
          <div className="flex flex-wrap gap-2">
            {types.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  type === value
                    ? 'bg-gold/20 text-gold border border-gold/30'
                    : 'bg-dark-bg text-gray-300 border border-dark-border hover:bg-dark-border/50'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">作者/创作者 *</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：J.R.R.托尔金"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">链接</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">评分</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(rating === star ? 0 : star)}
                className="p-1"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= rating
                      ? 'text-gold fill-gold'
                      : 'text-gray-600 hover:text-gray-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">笔记</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="记录灵感点和参考价值..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default ReferencePage;
