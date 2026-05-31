
import { useState } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import type { Language, Word } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  Languages,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Type,
  MessageCircle
} from 'lucide-react';

const LanguagesPage = () => {
  const {
    worldSetting,
    languages,
    words,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    addWord,
    updateWord,
    deleteWord
  } = useWorldStore();

  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showWordModal, setShowWordModal] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Languages className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  const languageWords = selectedLanguage
    ? words.filter(w => w.languageId === selectedLanguage.id)
    : [];

  const filteredWords = languageWords.filter(w =>
    w.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            语言设计
          </h1>
          <p className="text-gray-400">创造和管理你的虚构语言和词汇</p>
        </div>
        <Button
          onClick={() => {
            setEditingLanguage(null);
            setShowLanguageModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          创建语言
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        <div className="col-span-4 bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-dark-border">
            <h3 className="font-display font-semibold text-gold flex items-center gap-2">
              <Type className="w-5 h-5" />
              语言列表
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {languages.length > 0 ? (
              languages.map((language) => (
                <div key={language.id}>
                  <button
                    onClick={() => {
                      setSelectedLanguage(language);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-dark-bg/50 transition-colors flex items-center justify-between ${
                      selectedLanguage?.id === language.id
                        ? 'bg-gold/10 border-r-2 border-gold'
                        : ''
                    }`}
                  >
                    <div>
                      <p className="text-white font-medium">{language.name}</p>
                      <p className="text-xs text-gray-500">
                        {words.filter(w => w.languageId === language.id).length} 个词汇
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingLanguage(language);
                          setShowLanguageModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gold"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLanguage(language.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无语言</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-8 bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            {selectedLanguage ? (
              <>
                <div>
                  <h3 className="font-display font-semibold text-gold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {selectedLanguage.name}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  {languageWords.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="搜索词汇..."
                        className="pl-9 pr-8 py-1.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gold w-48"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingWord(null);
                      setShowWordModal(true);
                    }}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    添加词汇
                  </Button>
                </div>
              </>
            ) : (
              <h3 className="font-display font-semibold text-gray-500">
                选择语言查看词汇
              </h3>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedLanguage ? (
              <div className="p-4">
                {(selectedLanguage.family || selectedLanguage.speakers) && (
                  <div className="mb-4 p-3 bg-dark-bg/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">语系</p>
                        <p className="text-white">{selectedLanguage.family || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">使用者</p>
                        <p className="text-white">{selectedLanguage.speakers || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
                {selectedLanguage.grammarRules && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">语法规则</p>
                    <p className="text-gray-300 whitespace-pre-wrap text-sm">
                      {selectedLanguage.grammarRules}
                    </p>
                  </div>
                )}
                {selectedLanguage.writingSystem && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">书写系统</p>
                    <p className="text-gray-300 text-sm">
                      {selectedLanguage.writingSystem}
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <h4 className="text-gold font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    词汇表 ({filteredWords.length} 个词汇)
                  </h4>
                  {filteredWords.length > 0 ? (
                    <div className="space-y-2">
                      {filteredWords.map((word) => (
                        <div
                          key={word.id}
                          className="p-3 bg-dark-bg/50 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-display text-lg text-white">
                                {word.original}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="text-gold">{word.translation}</span>
                              {word.partOfSpeech && (
                                <span className="px-2 py-0.5 bg-tech-purple/20 text-tech-purple text-xs rounded">
                                  {word.partOfSpeech}
                                </span>
                              )}
                            </div>
                            {word.pronunciation && (
                              <p className="text-xs text-gray-400 mt-1">
                                [{word.pronunciation}]
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingWord(word);
                                setShowWordModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-gold"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteWord(word.id)}
                              className="p-1 text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {searchTerm ? '没有找到匹配的词汇' : '暂无词汇，请添加'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Languages className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>选择左侧的语言</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <LanguageModal
        isOpen={showLanguageModal}
        onClose={() => {
          setShowLanguageModal(false);
          setEditingLanguage(null);
        }}
        language={editingLanguage}
        onSave={(data) => {
          if (editingLanguage) {
            updateLanguage(editingLanguage.id, data);
          } else {
            addLanguage(data);
          }
          setShowLanguageModal(false);
          setEditingLanguage(null);
        }}
      />

      <WordModal
        isOpen={showWordModal}
        onClose={() => {
          setShowWordModal(false);
          setEditingWord(null);
        }}
        word={editingWord}
        languageId={selectedLanguage?.id}
        onSave={(data) => {
          if (editingWord) {
            updateWord(editingWord.id, data);
          } else {
            addWord(data);
          }
          setShowWordModal(false);
          setEditingWord(null);
        }}
      />
    </div>
  );
};

const LanguageModal = ({
  isOpen,
  onClose,
  language,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  language: Language | null;
  onSave: (data: Omit<Language, 'id'>) => void;
}) => {
  const [name, setName] = useState(language?.name || '');
  const [family, setFamily] = useState(language?.family || '');
  const [speakers, setSpeakers] = useState(language?.speakers || '');
  const [grammarRules, setGrammarRules] = useState(language?.grammarRules || '');
  const [writingSystem, setWritingSystem] = useState(language?.writingSystem || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language ? '编辑语言' : '创建语言'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({ name, family, speakers, grammarRules, writingSystem })}
            disabled={!name.trim()}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">语言名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：精灵语、龙语"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">语系</label>
            <input
              type="text"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="例如：印欧语系"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">主要使用者</label>
            <input
              type="text"
              value={speakers}
              onChange={(e) => setSpeakers(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="例如：高等精灵"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">语法规则</label>
          <textarea
            value={grammarRules}
            onChange={(e) => setGrammarRules(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述这种语言的语法特点..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">书写系统</label>
          <input
            type="text"
            value={writingSystem}
            onChange={(e) => setWritingSystem(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：象形文字、拼音文字"
          />
        </div>
      </div>
    </Modal>
  );
};

const WordModal = ({
  isOpen,
  onClose,
  word,
  languageId,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  word: Word | null;
  languageId?: string;
  onSave: (data: Omit<Word, 'id'>) => void;
}) => {
  const [original, setOriginal] = useState(word?.original || '');
  const [translation, setTranslation] = useState(word?.translation || '');
  const [pronunciation, setPronunciation] = useState(word?.pronunciation || '');
  const [partOfSpeech, setPartOfSpeech] = useState(word?.partOfSpeech || '');

  const posOptions = ['名词', '动词', '形容词', '副词', '代词', '介词', '连词', '感叹词', '其他'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={word ? '编辑词汇' : '添加词汇'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({
              languageId: word?.languageId || languageId || '',
              original,
              translation,
              pronunciation,
              partOfSpeech
            })}
            disabled={!original.trim() || !translation.trim() || !languageId}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">原词 *</label>
          <input
            type="text"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="原语言词汇"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">翻译 *</label>
          <input
            type="text"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="中文翻译"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">发音</label>
          <input
            type="text"
            value={pronunciation}
            onChange={(e) => setPronunciation(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：ah-lah-ree"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">词性</label>
          <div className="flex flex-wrap gap-2">
            {posOptions.map((pos) => (
              <button
                key={pos}
                onClick={() => setPartOfSpeech(pos)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  partOfSpeech === pos
                    ? 'bg-gold text-dark-bg font-medium'
                    : 'bg-dark-bg text-gray-300 hover:bg-dark-border'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LanguagesPage;
