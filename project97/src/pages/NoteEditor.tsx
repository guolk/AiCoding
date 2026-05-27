import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { NoteTypeBadge } from '../components/common/TopicBadge';
import { useNoteStore } from '../stores/noteStore';
import type { NoteType, Topic } from '../types';

const noteTypes: { value: NoteType; label: string }[] = [
  { value: 'knowledge', label: '知识梳理' },
  { value: 'method', label: '方法归纳' },
  { value: 'experience', label: '参赛感悟' },
];

const topics: { value: Topic | ''; label: string }[] = [
  { value: '', label: '无' },
  { value: 'number_theory', label: '数论' },
  { value: 'combinatorics', label: '组合' },
  { value: 'algebra', label: '代数' },
  { value: 'geometry', label: '几何' },
];

export function NoteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getNote, addNote, updateNote } = useNoteStore();

  const isEditing = !!id;
  const existingNote = id ? getNote(id) : null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('knowledge');
  const [topic, setTopic] = useState<Topic | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      setType(existingNote.type);
      setTopic(existingNote.topic || '');
      setTags(existingNote.tags);
    }
  }, [existingNote]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('请输入笔记标题');
      return;
    }

    if (isEditing && existingNote) {
      updateNote(id!, {
        title: title.trim(),
        content: content.trim(),
        type,
        topic: topic || undefined,
        tags,
      });
    } else {
      addNote({
        title: title.trim(),
        content: content.trim(),
        type,
        topic: topic || undefined,
        tags,
      });
    }

    navigate('/notes');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/notes')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">
            {isEditing ? '编辑笔记' : '新建笔记'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? '编辑' : '预览'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      {showPreview ? (
        <Card>
          <CardHeader>
            <CardTitle>{title || '无标题'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <NoteTypeBadge type={type} />
              {topic && (
                <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded">
                  {topics.find((t) => t.value === topic)?.label}
                </span>
              )}
            </div>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-text-primary font-sans">
                {content}
              </pre>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <span key={tag} className="px-2 py-1 text-sm bg-background-hover rounded">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入笔记标题"
                  className="w-full px-4 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    笔记类型
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as NoteType)}
                    className="w-full px-4 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary"
                  >
                    {noteTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    所属专题
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as Topic | '')}
                    className="w-full px-4 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary"
                  >
                    {topics.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  标签
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="输入标签后按回车添加"
                    className="flex-1 px-4 py-2 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddTag}>
                    添加
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-danger"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>内容 (支持 Markdown 和 LaTeX)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="使用 Markdown 格式书写内容，例如：

## 标题
这是内容...

支持 LaTeX 公式: $E = mc^2$"
                rows={20}
                className="w-full px-4 py-3 bg-background-hover rounded-lg border border-transparent focus:border-primary focus:outline-none text-text-primary placeholder:text-text-muted font-mono text-sm"
              />
              <p className="mt-2 text-xs text-text-muted">
                使用 Markdown 格式化文本，使用 $...$ 或 $$...$$ 插入 LaTeX 公式
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
