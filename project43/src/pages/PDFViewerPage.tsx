import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { paperService } from '@/services/paperService';
import type { Paper, Annotation } from '@/types';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const COLORS = [
  '#ffeb3b',
  '#4caf50',
  '#2196f3',
  '#f44336',
  '#9c27b0',
  '#ff9800',
];

function AnnotationSidebar({
  annotations,
  selectedAnnotation,
  onSelect,
  onDelete,
  onAddToNote,
}: {
  annotations: Annotation[];
  selectedAnnotation: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddToNote: (annotation: Annotation) => void;
}) {
  const groupedAnnotations = useMemo(() => {
    const groups: Record<number, Annotation[]> = {};
    annotations.forEach((a) => {
      if (!groups[a.pageNumber]) {
        groups[a.pageNumber] = [];
      }
      groups[a.pageNumber].push(a);
    });
    return groups;
  }, [annotations]);

  const sortedPages = Object.keys(groupedAnnotations)
    .map(Number)
    .sort((a, b) => a - b);

  const getTypeIcon = (type: Annotation['type']) => {
    switch (type) {
      case 'highlight':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 1.624l3.898 3.9-.503 2.678a.5.5 0 01-.656.656l-2.677-.504-3.902 3.898a1 1 0 101.414 1.414l3.898-3.9.502 2.678a.5.5 0 00.656.656l2.678-.504 3.898 3.898a1 1 0 101.414-1.414l-3.898-3.898.504-2.678a.5.5 0 00-.656-.656l-2.678.502-3.898-3.898a1 1 0 00-.624-.214z" />
          </svg>
        );
      case 'note':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
          </svg>
        );
      case 'question':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: Annotation['type']) => {
    switch (type) {
      case 'highlight':
        return 'text-yellow-600 bg-yellow-50';
      case 'note':
        return 'text-green-600 bg-green-50';
      case 'question':
        return 'text-red-600 bg-red-50';
    }
  };

  const getTypeLabel = (type: Annotation['type']) => {
    switch (type) {
      case 'highlight':
        return '高亮';
      case 'note':
        return '笔记';
      case 'question':
        return '问题';
    }
  };

  return (
    <div className="bg-white border-l border-gray-200 w-80 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">标注 ({annotations.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedPages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <p className="text-sm">暂无标注</p>
            <p className="text-xs text-gray-400 mt-1">选中文本后添加高亮或笔记</p>
          </div>
        ) : (
          sortedPages.map((page) => (
            <div key={page} className="border-b border-gray-100">
              <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                第 {page} 页
              </div>
              {groupedAnnotations[page].map((anno) => (
                <div
                  key={anno.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                    selectedAnnotation === anno.id ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => onSelect(anno.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${getTypeColor(anno.type)}`}>
                      {getTypeIcon(anno.type)}
                      <span>{getTypeLabel(anno.type)}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToNote(anno);
                        }}
                        className="p-1 text-gray-400 hover:text-indigo-500"
                        title="添加到笔记"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定要删除这个标注吗？')) {
                            onDelete(anno.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="删除"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">{anno.content}</p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AnnotationToolbar({
  tool,
  color,
  onToolChange,
  onColorChange,
  onAddNote,
  onAddQuestion,
}: {
  tool: 'select' | 'highlight';
  color: string;
  onToolChange: (tool: 'select' | 'highlight') => void;
  onColorChange: (color: string) => void;
  onAddNote: () => void;
  onAddQuestion: () => void;
}) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
      <Button
        variant={tool === 'select' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onToolChange('select')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span className="ml-1">选择</span>
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <Button
        variant={tool === 'highlight' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onToolChange('highlight')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <span className="ml-1">高亮</span>
      </Button>

      <div className="flex items-center gap-1">
        {COLORS.map((c) => (
          <button
            key={c}
            className={`w-6 h-6 rounded-full border-2 ${
              color === c ? 'border-gray-900' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
            onClick={() => onColorChange(c)}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <Button variant="ghost" size="sm" onClick={onAddNote}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <span className="ml-1">笔记</span>
      </Button>

      <Button variant="ghost" size="sm" onClick={onAddQuestion}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="ml-1">问题</span>
      </Button>

      <div className="flex-1" />

      <Link to="/papers">
        <Button variant="ghost" size="sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="ml-1">返回</span>
        </Button>
      </Link>
    </div>
  );
}

export function PDFViewerPage() {
  const queryClient = useQueryClient();
  const params = useParams<{ paperId: string }>();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [tool, setTool] = useState<'select' | 'highlight'>('select');
  const [color, setColor] = useState(COLORS[0]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteType, setNoteType] = useState<'note' | 'question'>('note');
  const [noteContent, setNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { data: paper } = useQuery({
    queryKey: ['paper', params.paperId],
    queryFn: () => paperService.getPaper(params.paperId!),
    enabled: !!params.paperId,
  });

  const { data: annotations = [], refetch: refetchAnnotations } = useQuery({
    queryKey: ['annotations', params.paperId],
    queryFn: () => paperService.getAnnotations(params.paperId!),
    enabled: !!params.paperId,
  });

  const addAnnotationMutation = useMutation({
    mutationFn: (data: Omit<Annotation, 'id' | 'authorId' | 'createdAt'>) =>
      paperService.addAnnotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
      refetchAnnotations();
    },
  });

  const deleteAnnotationMutation = useMutation({
    mutationFn: (id: string) => paperService.deleteAnnotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
      refetchAnnotations();
    },
  });

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const handleLoadError = () => {
    setIsLoading(false);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  const openNoteModal = (type: 'note' | 'question') => {
    setNoteType(type);
    setNoteContent('');
    setShowNoteModal(true);
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;

    addAnnotationMutation.mutate({
      paperId: params.paperId!,
      pageNumber,
      type: noteType,
      color: noteType === 'note' ? COLORS[1] : COLORS[3],
      content: noteContent,
    });

    setShowNoteModal(false);
    setNoteContent('');
  };

  const handleAddToNote = (annotation: Annotation) => {
    alert(`将标注添加到笔记: ${annotation.content.slice(0, 50)}...`);
  };

  const handleTextSelection = async () => {
    if (tool !== 'highlight') return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();

    if (!text) return;

    addAnnotationMutation.mutate({
      paperId: params.paperId!,
      pageNumber,
      type: 'highlight',
      color,
      content: text,
    });

    selection.removeAllRanges();
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (tool === 'highlight') {
        handleTextSelection();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [tool, color, pageNumber, params.paperId]);

  if (!paper) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loading text="加载文献信息..." />
        </div>
      </Layout>
    );
  }

  const samplePdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  const pdfUrl = paper.pdfLocalPath || paper.pdfUrl || samplePdfUrl;

  return (
    <Layout>
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <Link to="/papers" className="text-sm text-indigo-600 hover:underline mb-1 block">
                ← 返回文献列表
              </Link>
              <h1 className="text-xl font-bold text-gray-900">{paper.title}</h1>
              <p className="text-gray-500 mt-1">
                {paper.authors.map((a) => a.name).join(', ')}
                {paper.year && ` (${paper.year})`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                >
                  -
                </Button>
                <span className="text-sm text-gray-600 w-16 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScale((s) => Math.min(3, s + 0.25))}
                >
                  +
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <span className="text-sm text-gray-600">
                  {pageNumber} / {numPages || '-'}
                </span>
                <Button variant="ghost" size="sm" onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= numPages}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <AnnotationToolbar
            tool={tool}
            color={color}
            onToolChange={setTool}
            onColorChange={setColor}
            onAddNote={() => openNoteModal('note')}
            onAddQuestion={() => openNoteModal('question')}
          />

          <div className="flex" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loading text="加载PDF..." />
                </div>
              )}

              {!isLoading && !paper.pdfUrl && !paper.pdfLocalPath && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-4"
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无PDF文件</h3>
                    <p className="text-gray-500 mb-4">该文献暂未关联PDF文件</p>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-auto text-left">
                      <h4 className="font-medium text-gray-900 mb-2">文献信息</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex">
                          <dt className="text-gray-500 w-20">标题:</dt>
                          <dd className="text-gray-900 flex-1">{paper.title}</dd>
                        </div>
                        <div className="flex">
                          <dt className="text-gray-500 w-20">作者:</dt>
                          <dd className="text-gray-900 flex-1">
                            {paper.authors.map((a) => a.name).join(', ')}
                          </dd>
                        </div>
                        {paper.year && (
                          <div className="flex">
                            <dt className="text-gray-500 w-20">年份:</dt>
                            <dd className="text-gray-900 flex-1">{paper.year}</dd>
                          </div>
                        )}
                        {paper.journal && (
                          <div className="flex">
                            <dt className="text-gray-500 w-20">期刊:</dt>
                            <dd className="text-gray-900 flex-1">{paper.journal}</dd>
                          </div>
                        )}
                        {paper.doi && (
                          <div className="flex">
                            <dt className="text-gray-500 w-20">DOI:</dt>
                            <dd className="text-gray-900 flex-1">
                              <a
                                href={`https://doi.org/${paper.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline"
                              >
                                {paper.doi}
                              </a>
                            </dd>
                          </div>
                        )}
                        {paper.url && (
                          <div className="flex">
                            <dt className="text-gray-500 w-20">链接:</dt>
                            <dd className="text-gray-900 flex-1">
                              <a
                                href={paper.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline"
                              >
                                访问原文
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>

                      {paper.abstract && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <dt className="text-gray-500 text-sm mb-1">摘要:</dt>
                          <p className="text-sm text-gray-700">{paper.abstract}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isLoading && (paper.pdfUrl || paper.pdfLocalPath) && (
                <div className="flex justify-center">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={handleDocumentLoadSuccess}
                    onLoadError={handleLoadError}
                    loading={
                      <div className="text-center py-8">
                        <Loading text="加载PDF..." />
                      </div>
                    }
                    error={
                      <div className="text-center py-8">
                        <svg
                          className="w-12 h-12 mx-auto text-red-400 mb-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <p className="text-gray-500">无法加载PDF</p>
                        <p className="text-sm text-gray-400 mt-1">请检查PDF链接是否有效</p>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={tool === 'highlight'}
                      renderAnnotationLayer={true}
                      className="shadow-lg"
                    />
                  </Document>
                </div>
              )}
            </div>

            <AnnotationSidebar
              annotations={annotations}
              selectedAnnotation={selectedAnnotation}
              onSelect={setSelectedAnnotation}
              onDelete={(id) => deleteAnnotationMutation.mutate(id)}
              onAddToNote={handleAddToNote}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title={noteType === 'note' ? '添加笔记' : '添加问题'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              当前页码: 第 {pageNumber} 页
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={5}
              placeholder={noteType === 'note' ? '输入笔记内容...' : '输入问题...'}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="ghost" onClick={() => setShowNoteModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleAddNote} disabled={!noteContent.trim()}>
              添加
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default PDFViewerPage;
