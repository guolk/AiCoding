import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TableEmpty } from '@/components/Table';
import { paperService, citationService } from '@/services/paperService';
import type { Paper, Author, CitationStyle, PaginatedResponse } from '@/types';

function ReadStatusBadge({ status }: { status: Paper['readStatus'] }) {
  const styles = {
    unread: 'bg-gray-100 text-gray-700',
    reading: 'bg-blue-100 text-blue-700',
    read: 'bg-green-100 text-green-700',
  };

  const labels = {
    unread: '未读',
    reading: '阅读中',
    read: '已读',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function RatingStars({ rating }: { rating?: number }) {
  if (!rating) return null;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ImportPaperModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paper: Paper) => void;
}) {
  const [importType, setImportType] = useState<'id' | 'search' | 'manual'>('id');
  const [idType, setIdType] = useState<'doi' | 'pmid' | 'arxiv'>('doi');
  const [idValue, setIdValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  const [manualPaper, setManualPaper] = useState({
    title: '',
    authors: '',
    year: '',
    journal: '',
    doi: '',
    abstract: '',
    tags: '',
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError('');
    try {
      const results = await paperService.searchExternal(searchQuery, 'semantic');
      setSearchResults(results);
    } catch {
      setError('搜索失败，请重试');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportById = async () => {
    if (!idValue.trim()) return;
    setIsImporting(true);
    setError('');
    try {
      const paper = await paperService.fetchByExternalId(idValue.trim(), idType);
      if (paper) {
        const savedPaper = await paperService.addPaper({
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          keywords: paper.keywords,
          doi: paper.doi,
          pmid: paper.pmid,
          arxivId: paper.arxivId,
          url: paper.url,
          pdfUrl: paper.pdfUrl,
          journal: paper.journal,
          volume: paper.volume,
          issue: paper.issue,
          pages: paper.pages,
          year: paper.year,
          publisher: paper.publisher,
          isbn: paper.isbn,
          issn: paper.issn,
          tags: paper.tags,
        });
        onSuccess(savedPaper);
        handleClose();
      } else {
        setError('未找到该文献');
      }
    } catch {
      setError('导入失败，请重试');
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFromSearch = async (paper: Paper) => {
    setIsImporting(true);
    try {
      const savedPaper = await paperService.addPaper({
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        keywords: paper.keywords,
        doi: paper.doi,
        pmid: paper.pmid,
        arxivId: paper.arxivId,
        url: paper.url,
        pdfUrl: paper.pdfUrl,
        journal: paper.journal,
        volume: paper.volume,
        issue: paper.issue,
        pages: paper.pages,
        year: paper.year,
        publisher: paper.publisher,
        isbn: paper.isbn,
        issn: paper.issn,
        tags: paper.tags,
      });
      onSuccess(savedPaper);
      handleClose();
    } catch {
      setError('导入失败，请重试');
    } finally {
      setIsImporting(false);
    }
  };

  const handleManualImport = async () => {
    if (!manualPaper.title.trim()) {
      setError('请输入文献标题');
      return;
    }

    setIsImporting(true);
    try {
      const authors: Author[] = manualPaper.authors
        .split(',')
        .filter((name) => name.trim())
        .map((name, i) => ({
          id: `author-${i}`,
          name: name.trim(),
        }));

      const tags = manualPaper.tags
        .split(',')
        .filter((tag) => tag.trim())
        .map((tag) => tag.trim());

      const savedPaper = await paperService.addPaper({
        title: manualPaper.title.trim(),
        authors,
        abstract: manualPaper.abstract.trim() || undefined,
        doi: manualPaper.doi.trim() || undefined,
        journal: manualPaper.journal.trim() || undefined,
        year: manualPaper.year ? parseInt(manualPaper.year, 10) : undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      onSuccess(savedPaper);
      handleClose();
    } catch {
      setError('导入失败，请重试');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setImportType('id');
    setIdType('doi');
    setIdValue('');
    setSearchQuery('');
    setSearchResults([]);
    setError('');
    setManualPaper({
      title: '',
      authors: '',
      year: '',
      journal: '',
      doi: '',
      abstract: '',
      tags: '',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="导入文献"
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button
            variant={importType === 'id' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setImportType('id')}
          >
            通过ID导入
          </Button>
          <Button
            variant={importType === 'search' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setImportType('search')}
          >
            搜索导入
          </Button>
          <Button
            variant={importType === 'manual' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setImportType('manual')}
          >
            手动录入
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {importType === 'id' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={idType === 'doi' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setIdType('doi')}
              >
                DOI
              </Button>
              <Button
                variant={idType === 'pmid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setIdType('pmid')}
              >
                PMID
              </Button>
              <Button
                variant={idType === 'arxiv' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setIdType('arxiv')}
              >
                arXiv ID
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={
                  idType === 'doi'
                    ? '例如: 10.48550/arXiv.1706.03762'
                    : idType === 'pmid'
                    ? '例如: 29120423'
                    : '例如: 1706.03762'
                }
                value={idValue}
                onChange={(e) => setIdValue(e.target.value)}
              />
              <Button
                variant="primary"
                onClick={handleImportById}
                disabled={!idValue.trim() || isImporting}
              >
                {isImporting ? '导入中...' : '导入'}
              </Button>
            </div>
          </div>
        )}

        {importType === 'search' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="输入关键词搜索文献..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? '搜索中...' : '搜索'}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-80 overflow-y-auto space-y-2">
                {searchResults.map((paper, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 flex justify-between items-start gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{paper.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {paper.authors.map((a) => a.name).join(', ')}
                        {paper.year && ` (${paper.year})`}
                      </p>
                      {paper.journal && (
                        <p className="text-sm text-gray-400 mt-1">{paper.journal}</p>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleImportFromSearch(paper)}
                      disabled={isImporting}
                    >
                      导入
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <p className="text-gray-500 text-center py-8">未找到相关文献</p>
            )}
          </div>
        )}

        {importType === 'manual' && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标题 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="文献标题"
                value={manualPaper.title}
                onChange={(e) => setManualPaper({ ...manualPaper, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                作者（用逗号分隔）
              </label>
              <Input
                placeholder="张三, 李四, Wang Wu"
                value={manualPaper.authors}
                onChange={(e) => setManualPaper({ ...manualPaper, authors: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
                <Input
                  placeholder="2024"
                  value={manualPaper.year}
                  onChange={(e) => setManualPaper({ ...manualPaper, year: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">期刊</label>
                <Input
                  placeholder="Nature"
                  value={manualPaper.journal}
                  onChange={(e) => setManualPaper({ ...manualPaper, journal: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DOI</label>
              <Input
                placeholder="10.1038/s41586-024-00000-0"
                value={manualPaper.doi}
                onChange={(e) => setManualPaper({ ...manualPaper, doi: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="文献摘要..."
                value={manualPaper.abstract}
                onChange={(e) => setManualPaper({ ...manualPaper, abstract: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标签（用逗号分隔）
              </label>
              <Input
                placeholder="机器学习, 深度学习, NLP"
                value={manualPaper.tags}
                onChange={(e) => setManualPaper({ ...manualPaper, tags: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={handleClose}>
            取消
          </Button>
          {importType === 'manual' && (
            <Button
              variant="primary"
              onClick={handleManualImport}
              disabled={isImporting}
            >
              {isImporting ? '导入中...' : '导入'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function CitationModal({
  paper,
  isOpen,
  onClose,
}: {
  paper: Paper | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [style, setStyle] = useState<CitationStyle>('apa');
  const [copied, setCopied] = useState(false);

  const citation = useMemo(() => {
    if (!paper) return '';
    return citationService.formatBibliography([paper], style);
  }, [paper, style]);

  const inTextCitation = useMemo(() => {
    if (!paper) return '';
    return citationService.formatInTextAPA(paper);
  }, [paper]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 忽略复制错误
    }
  };

  if (!paper) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="引用格式"
      size="lg"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">选择引用格式</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'apa', label: 'APA' },
              { value: 'mla', label: 'MLA' },
              { value: 'chicago', label: 'Chicago' },
              { value: 'gb7714', label: 'GB7714' },
              { value: 'ieee', label: 'IEEE' },
            ].map((s) => (
              <Button
                key={s.value}
                variant={style === s.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStyle(s.value as CitationStyle)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">文内引用</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(inTextCitation)}
            >
              {copied ? '已复制!' : '复制'}
            </Button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 font-mono text-sm">
            {inTextCitation}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">参考文献</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(citation)}
            >
              {copied ? '已复制!' : '复制'}
            </Button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 font-mono text-sm whitespace-pre-wrap">
            {citation}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PaperDetailModal({
  paper,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: {
  paper: Paper | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Paper>) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Paper>>({});
  const [showCitation, setShowCitation] = useState(false);

  if (!paper) return null;

  const handleSave = () => {
    onUpdate(paper.id, editData);
    setIsEditing(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="文献详情"
        size="xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <input
                  className="text-xl font-bold text-gray-900 w-full px-2 py-1 border border-gray-300 rounded"
                  value={editData.title || paper.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-900">{paper.title}</h2>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <ReadStatusBadge status={paper.readStatus} />
              <RatingStars rating={paper.rating} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">作者</h3>
            <p className="text-gray-900">
              {paper.authors.map((a) => a.name).join(', ')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {paper.year && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">年份</h3>
                <p className="text-gray-900">{paper.year}</p>
              </div>
            )}
            {paper.journal && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">期刊</h3>
                <p className="text-gray-900">{paper.journal}</p>
              </div>
            )}
            {paper.volume && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">卷</h3>
                <p className="text-gray-900">{paper.volume}</p>
              </div>
            )}
            {paper.pages && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">页码</h3>
                <p className="text-gray-900">{paper.pages}</p>
              </div>
            )}
          </div>

          {paper.abstract && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">摘要</h3>
              <p className="text-gray-900 text-sm leading-relaxed">{paper.abstract}</p>
            </div>
          )}

          {paper.keywords && paper.keywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">关键词</h3>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {paper.tags && paper.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">标签</h3>
              <div className="flex flex-wrap gap-2">
                {paper.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {paper.doi && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">DOI</h3>
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {paper.doi}
                </a>
              </div>
            )}
            {paper.url && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">链接</h3>
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm truncate block"
                >
                  访问原文
                </a>
              </div>
            )}
          </div>

          {paper.references && paper.references.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                参考文献 ({paper.references.length})
              </h3>
            </div>
          )}

          {paper.citations && paper.citations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                被引用 ({paper.citations.length})
              </h3>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-200 mt-6">
          <div className="flex gap-2">
            <Link to={`/papers/${paper.id}`}>
              <Button variant="primary" size="sm">
                打开PDF
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => setShowCitation(true)}>
              引用
            </Button>
            <Link to={`/papers/${paper.id}/graph`}>
              <Button variant="secondary" size="sm">
                引用关系图
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  取消
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  保存
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  编辑
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm('确定要删除这篇文献吗？')) {
                      onDelete(paper.id);
                      onClose();
                    }
                  }}
                >
                  删除
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>

      <CitationModal
        paper={paper}
        isOpen={showCitation}
        onClose={() => setShowCitation(false)}
      />
    </>
  );
}

export function PapersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [readStatus, setReadStatus] = useState<Paper['readStatus'] | 'all'>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['papers', { page, search, readStatus }],
    queryFn: () =>
      paperService.getPapers({
        page,
        pageSize: 10,
        search: search || undefined,
        readStatus: readStatus === 'all' ? undefined : readStatus,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Paper> }) =>
      paperService.updatePaper(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paperService.deletePaper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
    },
  });

  const papersData: PaginatedResponse<Paper> = data || {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    papersData.items.forEach((p) => {
      p.tags?.forEach((t) => tags.add(t));
    });
    return Array.from(tags);
  }, [papersData.items]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">文献管理</h1>
            <p className="text-gray-500 mt-1">管理您的学术文献库</p>
          </div>
          <Button variant="primary" onClick={() => setIsImportModalOpen(true)}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              导入文献
            </span>
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索文献标题、作者、摘要..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={readStatus}
                onChange={(e) => setReadStatus(e.target.value as Paper['readStatus'] | 'all')}
              >
                <option value="all">全部状态</option>
                <option value="unread">未读</option>
                <option value="reading">阅读中</option>
                <option value="read">已读</option>
              </select>
              <Button variant="secondary" onClick={() => refetch()}>
                刷新
              </Button>
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 mr-2">标签:</span>
              <div className="inline-flex flex-wrap gap-1">
                {allTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200"
                    onClick={() => setSearch(search === tag ? '' : tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <Loading text="加载中..." />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableHeaderCell>标题</TableHeaderCell>
                <TableHeaderCell>作者</TableHeaderCell>
                <TableHeaderCell>年份</TableHeaderCell>
                <TableHeaderCell>期刊</TableHeaderCell>
                <TableHeaderCell>状态</TableHeaderCell>
                <TableHeaderCell>评分</TableHeaderCell>
                <TableHeaderCell>操作</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {papersData.items.length === 0 ? (
                  <TableEmpty colSpan={7} message="暂无文献，请点击上方按钮导入" />
                ) : (
                  papersData.items.map((paper) => (
                    <TableRow key={paper.id} row={paper}>
                      <TableCell className="max-w-xs">
                        <button
                          onClick={() => setSelectedPaper(paper)}
                          className="text-left hover:text-indigo-600 font-medium truncate block w-full"
                        >
                          {paper.title}
                        </button>
                        {paper.tags && paper.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {paper.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {paper.tags.length > 2 && (
                              <span className="text-xs text-gray-400">+{paper.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {paper.authors.length > 0
                            ? paper.authors[0].name + (paper.authors.length > 1 ? ' 等' : '')
                            : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{paper.year || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 truncate max-w-32 block">
                          {paper.journal || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ReadStatusBadge status={paper.readStatus} />
                      </TableCell>
                      <TableCell>
                        <RatingStars rating={paper.rating} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link to={`/papers/${paper.id}`}>
                            <Button variant="ghost" size="sm">
                              打开
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPaper(paper)}>
                            详情
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {papersData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  共 {papersData.total} 篇文献，第 {papersData.page} / {papersData.totalPages} 页
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={papersData.page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={papersData.page === papersData.totalPages}
                    onClick={() => setPage((p) => Math.min(papersData.totalPages, p + 1))}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总文献数</p>
                <p className="text-2xl font-bold text-gray-900">{papersData.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已读</p>
                <p className="text-2xl font-bold text-green-600">
                  {papersData.items.filter((p) => p.readStatus === 'read').length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待读</p>
                <p className="text-2xl font-bold text-orange-600">
                  {papersData.items.filter((p) => p.readStatus === 'unread' || p.readStatus === 'reading').length}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImportPaperModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['papers'] });
        }}
      />

      <PaperDetailModal
        paper={selectedPaper}
        isOpen={!!selectedPaper}
        onClose={() => setSelectedPaper(null)}
        onUpdate={(id, data) => updateMutation.mutate({ id, data })}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </Layout>
  );
}

export default PapersPage;
