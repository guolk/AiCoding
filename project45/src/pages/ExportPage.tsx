import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { paperService, noteService, citationService, exportService } from '@/services/paperService';
import type { Paper, Note, CitationStyle, PaginatedResponse } from '@/types';

function PaperSelector({
  papers,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: {
  papers: Paper[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-600">
          已选择 {selectedIds.size} 篇文献
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onSelectAll}>
            全选
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeselectAll}>
            取消全选
          </Button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
        {papers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            暂无可选择的文献
          </div>
        ) : (
          papers.map((paper) => (
            <div
              key={paper.id}
              className={`flex items-start gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                selectedIds.has(paper.id) ? 'bg-indigo-50' : ''
              }`}
              onClick={() => onToggle(paper.id)}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(paper.id)}
                onChange={() => onToggle(paper.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{paper.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {paper.authors.map((a) => a.name).join(', ')}
                  {paper.year && ` (${paper.year})`}
                </p>
                {paper.journal && (
                  <p className="text-xs text-gray-400 mt-0.5">{paper.journal}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function NoteSelector({
  notes,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: {
  notes: Note[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-600">
          已选择 {selectedIds.size} 条笔记
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onSelectAll}>
            全选
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeselectAll}>
            取消全选
          </Button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            暂无可选择的笔记
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`flex items-start gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                selectedIds.has(note.id) ? 'bg-indigo-50' : ''
              }`}
              onClick={() => onToggle(note.id)}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(note.id)}
                onChange={() => onToggle(note.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{note.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {note.content.slice(0, 100)}...
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CitationPreview({
  papers,
  style,
}: {
  papers: Paper[];
  style: CitationStyle;
}) {
  const preview = useMemo(() => {
    return citationService.formatBibliography(papers, style);
  }, [papers, style]);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
      {preview || '暂无预览'}
    </div>
  );
}

function ResearchReportBuilder({
  papers,
  notes,
  onGenerate,
}: {
  papers: Paper[];
  notes: Note[];
  onGenerate: (config: {
    title: string;
    introductionIds: string[];
    methodsIds: string[];
    resultsIds: string[];
    discussionIds: string[];
    paperIds: string[];
  }) => void;
}) {
  const [title, setTitle] = useState('研究报告');
  const [introductionIds, setIntroductionIds] = useState<string[]>([]);
  const [methodsIds, setMethodsIds] = useState<string[]>([]);
  const [resultsIds, setResultsIds] = useState<string[]>([]);
  const [discussionIds, setDiscussionIds] = useState<string[]>([]);

  const handleToggleNote = (section: 'intro' | 'methods' | 'results' | 'discussion', noteId: string) => {
    const setters = {
      intro: setIntroductionIds,
      methods: setMethodsIds,
      results: setResultsIds,
      discussion: setDiscussionIds,
    };

    const setter = setters[section];
    const current = {
      intro: introductionIds,
      methods: methodsIds,
      results: resultsIds,
      discussion: discussionIds,
    }[section];

    if (current.includes(noteId)) {
      setter(current.filter((id) => id !== noteId));
    } else {
      setter([...current, noteId]);
    }
  };

  const handleGenerate = () => {
    onGenerate({
      title,
      introductionIds,
      methodsIds,
      resultsIds,
      discussionIds,
      paperIds: papers.map((p) => p.id),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">报告标题</label>
        <Input
          placeholder="输入报告标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            1. 引言 (Introduction)
            <span className="text-xs text-gray-400 ml-2">选择相关笔记</span>
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
            {notes.map((note) => (
              <label
                key={note.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={introductionIds.includes(note.id)}
                  onChange={() => handleToggleNote('intro', note.id)}
                />
                <span className="text-sm truncate">{note.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            2. 方法 (Methods)
            <span className="text-xs text-gray-400 ml-2">选择相关笔记</span>
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
            {notes.map((note) => (
              <label
                key={note.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={methodsIds.includes(note.id)}
                  onChange={() => handleToggleNote('methods', note.id)}
                />
                <span className="text-sm truncate">{note.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            3. 结果 (Results)
            <span className="text-xs text-gray-400 ml-2">选择相关笔记</span>
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
            {notes.map((note) => (
              <label
                key={note.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={resultsIds.includes(note.id)}
                  onChange={() => handleToggleNote('results', note.id)}
                />
                <span className="text-sm truncate">{note.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            4. 讨论 (Discussion)
            <span className="text-xs text-gray-400 ml-2">选择相关笔记</span>
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
            {notes.map((note) => (
              <label
                key={note.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={discussionIds.includes(note.id)}
                  onChange={() => handleToggleNote('discussion', note.id)}
                />
                <span className="text-sm truncate">{note.title}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleGenerate}
          disabled={!title.trim()}
        >
          生成研究报告
        </Button>
      </div>
    </div>
  );
}

function PreviewModal({
  isOpen,
  onClose,
  title,
  content,
  format,
  onDownload,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  format: string;
  onDownload: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`预览 - ${title}`}
      size="xl"
    >
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
          {content}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={onClose}>
            关闭
          </Button>
          <Button variant="primary" onClick={onDownload}>
            下载 ({format.toUpperCase()})
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ExportPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'citations' | 'notes' | 'report'>('citations');

  const [citationStyle, setCitationStyle] = useState<CitationStyle>('apa');
  const [selectedPaperIds, setSelectedPaperIds] = useState<Set<string>>(new Set());

  const [noteFormat, setNoteFormat] = useState<'markdown' | 'latex' | 'word'>('markdown');
  const [noteOptions, setNoteOptions] = useState({
    includeAnnotations: true,
    includeCitations: true,
  });
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    format: string;
  } | null>(null);

  const { data: papersData, isLoading: isLoadingPapers } = useQuery({
    queryKey: ['papers', { pageSize: 100 }],
    queryFn: () => paperService.getPapers({ pageSize: 100 }),
  });

  const { data: notesData, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes', { pageSize: 100 }],
    queryFn: () => noteService.getNotes({ pageSize: 100 }),
  });

  const papers = papersData?.items || [];
  const notes = notesData?.items || [];

  const selectedPapers = useMemo(() => {
    return papers.filter((p) => selectedPaperIds.has(p.id));
  }, [papers, selectedPaperIds]);

  const selectedNotes = useMemo(() => {
    return notes.filter((n) => selectedNoteIds.has(n.id));
  }, [notes, selectedNoteIds]);

  const togglePaperId = (id: string) => {
    const newSet = new Set(selectedPaperIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPaperIds(newSet);
  };

  const toggleNoteId = (id: string) => {
    const newSet = new Set(selectedNoteIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedNoteIds(newSet);
  };

  const handleExportCitations = () => {
    if (selectedPapers.length === 0) return;

    const content = citationService.formatBibliography(selectedPapers, citationStyle);
    const filename = `references-${citationStyle}.txt`;

    setPreviewModal({
      isOpen: true,
      title: '参考文献列表',
      content,
      format: citationStyle,
    });
  };

  const handleExportNotes = () => {
    if (selectedNotes.length === 0) return;

    let content = '';
    let filename = '';

    switch (noteFormat) {
      case 'markdown':
        content = selectedNotes.map((note) => exportService.exportToMarkdown(note, noteOptions)).join('\n\n---\n\n');
        filename = 'notes.md';
        break;
      case 'latex':
        content = selectedNotes.map((note) => exportService.exportToLaTeX(note, noteOptions)).join('\n\n\\newpage\n\n');
        filename = 'notes.tex';
        break;
      case 'word':
        content = exportService.exportNotesToWord(selectedNotes);
        filename = 'notes.doc';
        break;
    }

    setPreviewModal({
      isOpen: true,
      title: '笔记导出',
      content,
      format: noteFormat,
    });
  };

  const handleGenerateReport = (config: {
    title: string;
    introductionIds: string[];
    methodsIds: string[];
    resultsIds: string[];
    discussionIds: string[];
    paperIds: string[];
  }) => {
    const introNotes = notes.filter((n) => config.introductionIds.includes(n.id));
    const methodsNotes = notes.filter((n) => config.methodsIds.includes(n.id));
    const resultsNotes = notes.filter((n) => config.resultsIds.includes(n.id));
    const discussionNotes = notes.filter((n) => config.discussionIds.includes(n.id));
    const reportPapers = papers.filter((p) => config.paperIds.includes(p.id));

    const content = exportService.generateResearchReport(
      config.title,
      {
        introduction: introNotes,
        methods: methodsNotes,
        results: resultsNotes,
        discussion: discussionNotes,
      },
      reportPapers
    );

    setPreviewModal({
      isOpen: true,
      title: config.title,
      content,
      format: 'markdown',
    });
  };

  const handleDownload = () => {
    if (!previewModal) return;

    let mimeType = 'text/plain';
    let filename = 'export.txt';

    switch (previewModal.format) {
      case 'markdown':
        mimeType = 'text/markdown';
        filename = 'export.md';
        break;
      case 'latex':
        mimeType = 'text/plain';
        filename = 'export.tex';
        break;
      case 'word':
        mimeType = 'application/msword';
        filename = 'export.doc';
        break;
      default:
        mimeType = 'text/plain';
        filename = `references-${previewModal.format}.txt`;
    }

    exportService.downloadFile(previewModal.content, filename, mimeType);
    setPreviewModal(null);
  };

  const isLoading = isLoadingPapers || isLoadingNotes;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">导出功能</h1>
          <p className="text-gray-500 mt-1">
            导出参考文献列表、笔记和研究报告
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { key: 'citations' as const, label: '参考文献' },
                { key: 'notes' as const, label: '笔记导出' },
                { key: 'report' as const, label: '研究报告' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="py-8">
                <Loading text="加载中..." />
              </div>
            ) : (
              <>
                {activeTab === 'citations' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          选择引用格式
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 'apa', label: 'APA' },
                            { value: 'mla', label: 'MLA' },
                            { value: 'chicago', label: 'Chicago' },
                            { value: 'gb7714', label: 'GB7714' },
                            { value: 'ieee', label: 'IEEE' },
                          ].map((style) => (
                            <Button
                              key={style.value}
                              variant={citationStyle === style.value ? 'primary' : 'ghost'}
                              size="sm"
                              onClick={() => setCitationStyle(style.value as CitationStyle)}
                            >
                              {style.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        选择要导出的文献
                      </label>
                      <PaperSelector
                        papers={papers}
                        selectedIds={selectedPaperIds}
                        onToggle={togglePaperId}
                        onSelectAll={() => setSelectedPaperIds(new Set(papers.map((p) => p.id)))}
                        onDeselectAll={() => setSelectedPaperIds(new Set())}
                      />
                    </div>

                    {selectedPapers.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          预览
                        </label>
                        <CitationPreview papers={selectedPapers} style={citationStyle} />
                      </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button
                        variant="primary"
                        onClick={handleExportCitations}
                        disabled={selectedPapers.length === 0}
                      >
                        导出参考文献 ({selectedPapers.length})
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          导出格式
                        </label>
                        <div className="flex gap-2">
                          {[
                            { value: 'markdown', label: 'Markdown' },
                            { value: 'latex', label: 'LaTeX' },
                            { value: 'word', label: 'Word' },
                          ].map((format) => (
                            <Button
                              key={format.value}
                              variant={noteFormat === format.value ? 'primary' : 'ghost'}
                              size="sm"
                              onClick={() => setNoteFormat(format.value as typeof noteFormat)}
                            >
                              {format.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          导出选项
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={noteOptions.includeAnnotations}
                              onChange={(e) =>
                                setNoteOptions({
                                  ...noteOptions,
                                  includeAnnotations: e.target.checked,
                                })
                              }
                            />
                            包含标注
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={noteOptions.includeCitations}
                              onChange={(e) =>
                                setNoteOptions({
                                  ...noteOptions,
                                  includeCitations: e.target.checked,
                                })
                              }
                            />
                            包含引用
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        选择要导出的笔记
                      </label>
                      <NoteSelector
                        notes={notes}
                        selectedIds={selectedNoteIds}
                        onToggle={toggleNoteId}
                        onSelectAll={() => setSelectedNoteIds(new Set(notes.map((n) => n.id)))}
                        onDeselectAll={() => setSelectedNoteIds(new Set())}
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button
                        variant="primary"
                        onClick={handleExportNotes}
                        disabled={selectedNotes.length === 0}
                      >
                        导出笔记 ({selectedNotes.length})
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'report' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900">研究报告生成器</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            选择笔记并分配到引言/方法/结果/讨论四个章节，系统将生成结构化的研究报告。
                            同时可以选择相关的文献作为参考文献。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        选择参考文献（可选）
                      </label>
                      <PaperSelector
                        papers={papers}
                        selectedIds={selectedPaperIds}
                        onToggle={togglePaperId}
                        onSelectAll={() => setSelectedPaperIds(new Set(papers.map((p) => p.id)))}
                        onDeselectAll={() => setSelectedPaperIds(new Set())}
                      />
                    </div>

                    {notes.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <svg className="w-12 h-12 mx-auto text-yellow-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-yellow-700">
                          暂无笔记，请先创建笔记后再生成研究报告
                        </p>
                      </div>
                    ) : (
                      <ResearchReportBuilder
                        papers={selectedPapers}
                        notes={notes}
                        onGenerate={handleGenerateReport}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">导出功能说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">参考文献导出</p>
                <p className="text-gray-500">支持 APA、MLA、Chicago、GB7714、IEEE 等多种引用格式</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">笔记导出</p>
                <p className="text-gray-500">支持 Markdown、LaTeX、Word 格式，可包含标注和引用</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">研究报告</p>
                <p className="text-gray-500">模板化生成引言/方法/结果/讨论四章节的结构化报告</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewModal && (
        <PreviewModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal(null)}
          title={previewModal.title}
          content={previewModal.content}
          format={previewModal.format}
          onDownload={handleDownload}
        />
      )}
    </Layout>
  );
}

export default ExportPage;
