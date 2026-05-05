import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { noteService, exportService, paperService } from '@/services/paperService';
import type { Note, PaginatedResponse, Paper, Annotation } from '@/types';

function NoteCard({
  note,
  onClick,
  onDelete,
}: {
  note: Note;
  onClick: () => void;
  onDelete: () => void;
}) {
  const preview = note.content.length > 150 ? note.content.slice(0, 150) + '...' : note.content;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 truncate flex-1">{note.title}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('确定要删除这条笔记吗？')) {
                onDelete();
              }
            }}
            className="ml-2 text-gray-400 hover:text-red-500"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3 whitespace-pre-wrap">{preview}</p>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            更新于 {new Date(note.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex gap-2 text-xs text-gray-400">
            {note.incomingLinks && note.incomingLinks.length > 0 && (
              <span>被引用: {note.incomingLinks.length}</span>
            )}
            {note.outgoingLinks && note.outgoingLinks.length > 0 && (
              <span>引用: {note.outgoingLinks.length}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteEditor({
  note,
  onSave,
  onCancel,
}: {
  note: Note | null;
  onSave: (data: Partial<Note>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');
  const [showPreview, setShowPreview] = useState(false);

  const linkedNotes = useMemo(() => {
    const matches = content.match(/\[\[([^\]]+)\]\]/g) || [];
    return matches.map((m) => m.slice(2, -2));
  }, [content]);

  const handleSave = () => {
    onSave({
      title,
      content,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="笔记标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold"
        />
        <div className="flex gap-2">
          <Button
            variant={showPreview ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '编辑' : '预览'}
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标签（用逗号分隔）</label>
        <Input
          placeholder="例如: 机器学习, 深度学习, 笔记"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      {linkedNotes.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">检测到 {linkedNotes.length} 个链接引用:</span>
            {linkedNotes.map((link, i) => (
              <span key={i} className="ml-2 px-2 py-0.5 bg-blue-100 rounded text-xs">
                [[{link}]]
              </span>
            ))}
          </p>
        </div>
      )}

      {showPreview ? (
        <div className="border border-gray-200 rounded-lg p-4 min-h-96 prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm min-h-96 resize-y"
          placeholder="使用 Markdown 语法编写笔记...

使用 [[笔记标题]] 或 [[笔记ID]] 来链接其他笔记。

例如:
# 这是一个标题

这是一段普通的文本，包含**粗体**和*斜体*。

[[另一篇笔记]] 是一个双向链接。

- 列表项1
- 列表项2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onCancel}>
          取消
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!title.trim()}>
          保存
        </Button>
      </div>
    </div>
  );
}

function BacklinksSection({ noteId }: { noteId: string }) {
  const { data: backlinks, isLoading } = useQuery({
    queryKey: ['notes', 'backlinks', noteId],
    queryFn: () => noteService.getBacklinks(noteId),
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <Loading text="加载中..." />
      </div>
    );
  }

  if (!backlinks || backlinks.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">被引用的笔记</h4>
      <div className="space-y-2">
        {backlinks.map((note) => (
          <div
            key={note.id}
            className="text-sm text-gray-600 hover:text-indigo-600 cursor-pointer"
          >
            <span className="font-medium">{note.title}</span>
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImportAnnotationsModal({
  isOpen,
  onClose,
  onImport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (annotations: Annotation[]) => void;
}) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotations, setSelectedAnnotations] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const loadPapers = async () => {
    setIsLoading(true);
    try {
      const result = await paperService.getPapers({ pageSize: 100 });
      setPapers(result.items);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnnotations = async (paperId: string) => {
    setIsLoading(true);
    try {
      const result = await paperService.getAnnotations(paperId);
      setAnnotations(result);
      setSelectedAnnotations(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedAnnotations);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedAnnotations(newSelection);
  };

  const toggleAll = () => {
    if (selectedAnnotations.size === annotations.length) {
      setSelectedAnnotations(new Set());
    } else {
      setSelectedAnnotations(new Set(annotations.map((a) => a.id)));
    }
  };

  const handleImport = () => {
    const selected = annotations.filter((a) => selectedAnnotations.has(a.id));
    onImport(selected);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="从PDF标注导入"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">选择文献</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedPaper}
            onChange={(e) => {
              setSelectedPaper(e.target.value);
              if (e.target.value) {
                loadAnnotations(e.target.value);
              }
            }}
            onClick={loadPapers}
          >
            <option value="">请选择文献...</option>
            {papers.map((paper) => (
              <option key={paper.id} value={paper.id}>
                {paper.title}
              </option>
            ))}
          </select>
        </div>

        {selectedPaper && annotations.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                选择标注 ({selectedAnnotations.size}/{annotations.length})
              </label>
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {selectedAnnotations.size === annotations.length ? '取消全选' : '全选'}
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {annotations.map((anno) => (
                <div
                  key={anno.id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedAnnotations.has(anno.id) ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => toggleSelection(anno.id)}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAnnotations.has(anno.id)}
                      onChange={() => toggleSelection(anno.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            anno.type === 'highlight'
                              ? 'bg-yellow-100 text-yellow-800'
                              : anno.type === 'note'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {anno.type === 'highlight' ? '高亮' : anno.type === 'note' ? '笔记' : '问题'}
                        </span>
                        <span className="text-xs text-gray-400">第 {anno.pageNumber} 页</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{anno.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPaper && annotations.length === 0 && !isLoading && (
          <p className="text-gray-500 text-center py-4">该文献暂无标注</p>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={selectedAnnotations.size === 0}
          >
            导入选中 ({selectedAnnotations.size})
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function NotesPage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showImportAnnotations, setShowImportAnnotations] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'latex' | 'word'>('markdown');
  const [exportOptions, setExportOptions] = useState({
    includeAnnotations: true,
    includeCitations: true,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notes', { search, tag: selectedTag }],
    queryFn: () =>
      noteService.getNotes({
        pageSize: 100,
        search: search || undefined,
        tags: selectedTag ? [selectedTag] : undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Note>) =>
      noteService.createNote({
        title: data.title || '未命名笔记',
        content: data.content || '',
        authorId: 1,
        tags: data.tags,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) =>
      noteService.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditingNote(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => noteService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const notesData: PaginatedResponse<Note> = data || {
    items: [],
    total: 0,
    page: 1,
    pageSize: 100,
    totalPages: 0,
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notesData.items.forEach((n) => {
      n.tags?.forEach((t) => tags.add(t));
    });
    return Array.from(tags);
  }, [notesData.items]);

  const currentNote = params.noteId
    ? notesData.items.find((n) => n.id === params.noteId)
    : null;

  const handleExport = () => {
    if (!currentNote) return;

    switch (exportFormat) {
      case 'markdown':
        const mdContent = exportService.exportToMarkdown(currentNote, exportOptions);
        exportService.downloadFile(mdContent, `${currentNote.title}.md`, 'text/markdown');
        break;
      case 'latex':
        const texContent = exportService.exportToLaTeX(currentNote, exportOptions);
        exportService.downloadFile(texContent, `${currentNote.title}.tex`, 'text/plain');
        break;
      case 'word':
        const htmlContent = exportService.exportNotesToWord([currentNote]);
        exportService.downloadFile(htmlContent, `${currentNote.title}.doc`, 'application/msword');
        break;
    }
    setShowExport(false);
  };

  const handleImportAnnotations = (annotations: Annotation[]) => {
    if (!currentNote) return;

    let newContent = currentNote.content;
    newContent += '\n\n---\n\n## 导入的标注\n\n';

    annotations.forEach((anno) => {
      newContent += `> **[${anno.type === 'highlight' ? '高亮' : anno.type === 'note' ? '笔记' : '问题'} - 第${anno.pageNumber}页]**\n`;
      newContent += `> ${anno.content}\n\n`;
    });

    updateMutation.mutate({
      id: currentNote.id,
      data: {
        content: newContent,
        linkedAnnotations: [...(currentNote.linkedAnnotations || []), ...annotations.map((a) => a.id)],
      },
    });
  };

  if (currentNote && !isCreating && !editingNote) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/notes" className="text-sm text-indigo-600 hover:underline">
                ← 返回笔记列表
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{currentNote.title}</h1>
              {currentNote.tags && currentNote.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {currentNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full cursor-pointer"
                      onClick={() => {
                        setSelectedTag(tag);
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowImportAnnotations(true)}>
                导入标注
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowExport(true)}>
                导出
              </Button>
              <Button variant="primary" size="sm" onClick={() => setEditingNote(currentNote)}>
                编辑
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <article className="prose prose-indigo prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentNote.content}
                </ReactMarkdown>
              </article>
              <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-400">
                <p>创建于: {new Date(currentNote.createdAt).toLocaleString()}</p>
                <p>更新于: {new Date(currentNote.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-6">
              {currentNote.outgoingLinks && currentNote.outgoingLinks.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">引用的笔记</h3>
                  <div className="space-y-2">
                    {currentNote.outgoingLinks.map((linkId) => {
                      const linkedNote = notesData.items.find((n) => n.id === linkId);
                      if (!linkedNote) return null;
                      return (
                        <div
                          key={linkId}
                          className="text-sm text-indigo-600 hover:underline cursor-pointer p-2 rounded hover:bg-indigo-50"
                        >
                          {linkedNote.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentNote.incomingLinks && currentNote.incomingLinks.length > 0 && (
                <BacklinksSection noteId={currentNote.id} />
              )}

              {currentNote.linkedPapers && currentNote.linkedPapers.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">关联的文献</h3>
                  <div className="space-y-2">
                    {currentNote.linkedPapers.map((paperId) => (
                      <div key={paperId} className="text-sm text-gray-600">
                        <Link
                          to={`/papers/${paperId}`}
                          className="text-indigo-600 hover:underline"
                        >
                          查看文献 #{paperId.slice(0, 8)}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <ImportAnnotationsModal
          isOpen={showImportAnnotations}
          onClose={() => setShowImportAnnotations(false)}
          onImport={handleImportAnnotations}
        />

        <Modal
          isOpen={showExport}
          onClose={() => setShowExport(false)}
          title="导出笔记"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">导出格式</label>
              <div className="flex gap-2">
                {[
                  { value: 'markdown', label: 'Markdown' },
                  { value: 'latex', label: 'LaTeX' },
                  { value: 'word', label: 'Word' },
                ].map((format) => (
                  <Button
                    key={format.value}
                    variant={exportFormat === format.value ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setExportFormat(format.value as typeof exportFormat)}
                  >
                    {format.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAnnotations}
                  onChange={(e) =>
                    setExportOptions({ ...exportOptions, includeAnnotations: e.target.checked })
                  }
                />
                <span className="text-sm text-gray-700">包含标注</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCitations}
                  onChange={(e) =>
                    setExportOptions({ ...exportOptions, includeCitations: e.target.checked })
                  }
                />
                <span className="text-sm text-gray-700">包含引用</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="ghost" onClick={() => setShowExport(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={handleExport}>
                导出
              </Button>
            </div>
          </div>
        </Modal>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">笔记管理</h1>
            <p className="text-gray-500 mt-1">使用 [[笔记标题]] 创建双向链接</p>
          </div>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建笔记
            </span>
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索笔记标题或内容..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="secondary" onClick={() => refetch()}>
              刷新
            </Button>
          </div>

          {allTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 mr-2">标签筛选:</span>
              <Button
                variant={selectedTag === '' ? 'primary' : 'ghost'}
                size="sm"
                className="mr-1"
                onClick={() => setSelectedTag('')}
              >
                全部
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'primary' : 'ghost'}
                  size="sm"
                  className="mr-1"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <Loading text="加载中..." />
          </div>
        ) : notesData.items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无笔记</h3>
            <p className="text-gray-500 mb-4">点击上方按钮创建您的第一篇笔记</p>
            <Button variant="primary" onClick={() => setIsCreating(true)}>
              新建笔记
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notesData.items.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => setEditingNote(note)}
                onDelete={() => deleteMutation.mutate(note.id)}
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总笔记数</p>
                <p className="text-2xl font-bold text-gray-900">{notesData.total}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">标签数量</p>
                <p className="text-2xl font-bold text-blue-600">{allTags.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">链接数量</p>
                <p className="text-2xl font-bold text-green-600">
                  {notesData.items.reduce((acc, n) => {
                    return acc + (n.incomingLinks?.length || 0) + (n.outgoingLinks?.length || 0);
                  }, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCreating || !!editingNote}
        onClose={() => {
          setIsCreating(false);
          setEditingNote(null);
        }}
        title={isCreating ? '新建笔记' : '编辑笔记'}
        size="xl"
      >
        <NoteEditor
          note={editingNote}
          onSave={(data) => {
            if (editingNote) {
              updateMutation.mutate({ id: editingNote.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setIsCreating(false);
            setEditingNote(null);
          }}
        />
      </Modal>
    </Layout>
  );
}

export default NotesPage;
