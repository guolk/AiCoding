import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/context/ToastContext';
import { languageExchangeApi } from '@/services/languageExchangeService';
import { VocabularyItem, LanguageCode, AnkiCardFormat } from '@/types';
import { LANGUAGES } from '@/constants/languages';
import Button from '@/components/Button';
import Loading from '@/components/Loading';
import Layout from '@/components/Layout';

function VocabularyCard({
  item,
  onEdit,
  onDelete,
  onExport,
}: {
  item: VocabularyItem;
  onEdit: (item: VocabularyItem) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTags, setEditTags] = useState<string[]>(item.tags);

  const language = LANGUAGES[item.language];

  const getPartOfSpeechColor = (pos: string) => {
    const colors: Record<string, string> = {
      noun: 'bg-blue-100 text-blue-800',
      verb: 'bg-green-100 text-green-800',
      adjective: 'bg-purple-100 text-purple-800',
      adverb: 'bg-orange-100 text-orange-800',
      preposition: 'bg-pink-100 text-pink-800',
      conjunction: 'bg-teal-100 text-teal-800',
      pronoun: 'bg-indigo-100 text-indigo-800',
      interjection: 'bg-red-100 text-red-800',
    };
    return colors[pos.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getMasteredStatus = () => {
    if (item.mastered) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ 已掌握
        </span>
      );
    }
    if (item.reviewCount > 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          📖 复习中 ({item.reviewCount}次)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        🆕 新单词
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-800">{item.word}</h3>
              {getMasteredStatus()}
            </div>
            {item.pronunciation && (
              <p className="text-sm text-gray-500 mb-2">{item.pronunciation}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>
                {language?.nativeName || item.language}
              </span>
              <span>•</span>
              <span>
                添加于 {new Date(item.createdAt).toLocaleDateString('zh-CN')}
              </span>
              {item.sourceMessageId && (
                <>
                  <span>•</span>
                  <span className="text-indigo-600">来自聊天</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="查看详情"
            >
              {showDetails ? '▲' : '▼'}
            </button>
            <button
              onClick={() => onExport(item.id)}
              className="p-2 text-blue-400 hover:text-blue-600"
              title="导出到Anki"
            >
              📤
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-yellow-400 hover:text-yellow-600"
              title="编辑"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 text-red-400 hover:text-red-600"
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>

        {!showDetails && item.definitions.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">
                {item.definitions[0].partOfSpeech}.
              </span>{' '}
              {item.definitions[0].definition}
              {item.definitions[0].translation && (
                <span className="text-gray-500 ml-2">
                  ({item.definitions[0].translation})
                </span>
              )}
            </p>
          </div>
        )}

        {item.tags.length > 0 && !isEditing && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {isEditing && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">编辑标签</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {editTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700"
                >
                  #{tag}
                  <button
                    onClick={() =>
                      setEditTags(editTags.filter((_, i) => i !== idx))
                    }
                    className="ml-1 text-indigo-500 hover:text-indigo-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="输入新标签，按回车添加"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value && !editTags.includes(value)) {
                      setEditTags([...editTags, value]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                }}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="border-t border-gray-100 bg-gray-50 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">详细释义</h4>
          <div className="space-y-4">
            {item.definitions.map((def, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPartOfSpeechColor(def.partOfSpeech)}`}
                  >
                    {def.partOfSpeech}
                  </span>
                </div>
                <p className="text-sm text-gray-800 mb-1">{def.definition}</p>
                {def.translation && (
                  <p className="text-sm text-gray-500">{def.translation}</p>
                )}
              </div>
            ))}
          </div>

          {item.examples.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">例句</h4>
              <div className="space-y-2">
                {item.examples.map((example, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-800 mb-1">"{example.text}"</p>
                    {example.translation && (
                      <p className="text-sm text-gray-500">{example.translation}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">来源: {example.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">复习次数</p>
              <p className="text-lg font-semibold text-gray-800">{item.reviewCount}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">下次复习</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(item.nextReviewAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">掌握状态</p>
              <p className="text-sm font-semibold text-gray-800">
                {item.mastered ? '已掌握' : '学习中'}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">添加时间</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(item.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddWordModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (word: string, language: LanguageCode, tags: string[]) => void;
}) {
  const [word, setWord] = useState('');
  const [language, setLanguage] = useState<LanguageCode>('en-US');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const languageOptions = Object.values(LANGUAGES).map((lang) => ({
    value: lang.code,
    label: `${lang.nativeName} (${lang.name})`,
  }));

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              添加新单词
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                单词 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="输入要添加的单词或短语"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                语言 <span className="text-red-500">*</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签（可选）
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-indigo-500 hover:text-indigo-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="输入标签"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddTag}
                >
                  添加
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={() => word.trim() && onAdd(word.trim(), language, tags)}
            disabled={!word.trim()}
            className="flex-1"
          >
            添加单词
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExportModal({
  onClose,
  onExport,
}: {
  onClose: () => void;
  onExport: (config: {
    format: AnkiCardFormat;
    deckName: string;
    includeAudio: boolean;
    includeExamples: boolean;
    language: LanguageCode;
  }) => void;
}) {
  const [format, setFormat] = useState<AnkiCardFormat>('basic');
  const [deckName, setDeckName] = useState('LanguageExchange_Vocabulary');
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [language, setLanguage] = useState<LanguageCode>('en-US');

  const formatOptions: { value: AnkiCardFormat; label: string; description: string }[] = [
    {
      value: 'basic',
      label: '基础卡片',
      description: '正面：单词，背面：释义',
    },
    {
      value: 'basic_reverse',
      label: '基础+反向',
      description: '同时创建正向和反向卡片',
    },
    {
      value: 'cloze',
      label: '填空卡片',
      description: '用 {{c1::}} 标记填空内容',
    },
  ];

  const languageOptions = Object.values(LANGUAGES).map((lang) => ({
    value: lang.code,
    label: `${lang.nativeName} (${lang.name})`,
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              导出到 Anki
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                卡组名称
              </label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                卡片格式
              </label>
              <div className="space-y-2">
                {formatOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      format === opt.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={opt.value}
                      checked={format === opt.value}
                      onChange={() => setFormat(opt.value)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{opt.label}</div>
                      <div className="text-sm text-gray-500">{opt.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                默认语言
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeAudio}
                  onChange={(e) => setIncludeAudio(e.target.checked)}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">
                  包含发音音频（如果有）
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeExamples}
                  onChange={(e) => setIncludeExamples(e.target.checked)}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">
                  包含例句
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={() =>
              onExport({
                format,
                deckName,
                includeAudio,
                includeExamples,
                language,
              })
            }
            disabled={!deckName.trim()}
            className="flex-1"
          >
            导出
          </Button>
        </div>
      </div>
    </div>
  );
}

function VocabularyPage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [filterLanguage, setFilterLanguage] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    data: vocabulary,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['vocabulary'],
    queryFn: () => languageExchangeApi.getVocabularyItems(),
  });

  const addWordMutation = useMutation({
    mutationFn: ({
      word,
      language,
      tags,
    }: {
      word: string;
      language: LanguageCode;
      tags: string[];
    }) =>
      languageExchangeApi.addVocabularyItem({
        word,
        language,
        tags,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      showSuccess('单词已添加');
      setShowAddModal(false);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '添加失败';
      showError(message);
    },
  });

  const deleteWordMutation = useMutation({
    mutationFn: (id: string) => languageExchangeApi.deleteVocabularyItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      showSuccess('单词已删除');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '删除失败';
      showError(message);
    },
  });

  const exportMutation = useMutation({
    mutationFn: (config: {
      format: AnkiCardFormat;
      deckName: string;
      includeAudio: boolean;
      includeExamples: boolean;
      language: LanguageCode;
    }) => languageExchangeApi.exportToAnki(config),
    onSuccess: (result) => {
      const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess(`已导出 ${result.filename}`);
      setShowExportModal(false);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '导出失败';
      showError(message);
    },
  });

  const filteredVocabulary = vocabulary?.filter((item) => {
    if (filterLanguage && item.language !== filterLanguage) {
      return false;
    }
    if (filterTag && !item.tags.includes(filterTag)) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.word.toLowerCase().includes(query) ||
        item.definitions.some((def) =>
          def.definition.toLowerCase().includes(query)
        ) ||
        (item.definitions.some((def) =>
          def.translation?.includes(query)
        ))
      );
    }
    return true;
  });

  const allLanguages = vocabulary
    ? [...new Set(vocabulary.map((item) => item.language))]
    : [];

  const allTags = vocabulary
    ? [...new Set(vocabulary.flatMap((item) => item.tags))]
    : [];

  const handleAddWord = (word: string, language: LanguageCode, tags: string[]) => {
    addWordMutation.mutate({ word, language, tags });
  };

  const handleDeleteWord = (id: string) => {
    if (window.confirm('确定要删除这个单词吗？')) {
      deleteWordMutation.mutate(id);
    }
  };

  const handleExport = (config: {
    format: AnkiCardFormat;
    deckName: string;
    includeAudio: boolean;
    includeExamples: boolean;
    language: LanguageCode;
  }) => {
    exportMutation.mutate(config);
  };

  const stats = {
    total: vocabulary?.length || 0,
    mastered: vocabulary?.filter((item) => item.mastered).length || 0,
    newToday: vocabulary?.filter(
      (item) =>
        new Date(item.createdAt).toDateString() === new Date().toDateString()
    ).length || 0,
    reviewing: vocabulary?.filter(
      (item) => !item.mastered && item.reviewCount > 0
    ).length || 0,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">生词本</h1>
            <p className="text-gray-600">
              收集聊天中的生词，自动获取释义和例句，支持导出到 Anki
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowExportModal(true)}>
              📤 导出 Anki
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              ➕ 添加单词
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总单词数</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已掌握</p>
                <p className="text-3xl font-bold text-green-600">{stats.mastered}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">复习中</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.reviewing}</p>
              </div>
              <div className="text-4xl">📖</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">今日新增</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.newToday}</p>
              </div>
              <div className="text-4xl">🆕</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索单词、释义或翻译..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">所有语言</option>
              {allLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {LANGUAGES[lang]?.nativeName || lang}
                </option>
              ))}
            </select>

            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">所有标签</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>

            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
                title="网格视图"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${
                  viewMode === 'list'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
                title="列表视图"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        <Loading isLoading={isLoading}>
          {filteredVocabulary && filteredVocabulary.length > 0 ? (
            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {filteredVocabulary.map((item) => (
                <VocabularyCard
                  key={item.id}
                  item={item}
                  onEdit={() => {}}
                  onDelete={handleDeleteWord}
                  onExport={() => setShowExportModal(true)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {vocabulary && vocabulary.length > 0
                  ? '没有找到匹配的单词'
                  : '生词本还是空的'}
              </h3>
              <p className="text-gray-500 mb-6">
                {vocabulary && vocabulary.length > 0
                  ? '尝试调整搜索条件或筛选器'
                  : '聊天时标记生词，或手动添加单词到生词本'}
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                添加第一个单词
              </Button>
            </div>
          )}
        </Loading>

        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            💡 使用提示
          </h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>
              <strong>• 在聊天中标记生词：</strong>
              选中聊天中的单词，点击"加入生词本"按钮
            </li>
            <li>
              <strong>• 自动获取释义：</strong>
              系统会自动从词典 API 获取单词的释义、发音和例句
            </li>
            <li>
              <strong>• 导出到 Anki：</strong>
              选择单词后点击"导出"，生成 Anki 支持的导入格式
            </li>
            <li>
              <strong>• 使用标签管理：</strong>
              给单词添加标签，方便按主题或来源筛选复习
            </li>
            <li>
              <strong>• 定期复习：</strong>
              根据艾宾浩斯遗忘曲线安排复习时间，提高记忆效果
            </li>
          </ul>
        </div>
      </div>

      {showAddModal && (
        <AddWordModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddWord}
        />
      )}

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}
    </Layout>
  );
}

export default VocabularyPage;
