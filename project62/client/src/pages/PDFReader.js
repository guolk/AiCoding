import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { papersAPI, annotationsAPI, notesAPI } from '../services/api';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const highlightColors = [
  { value: 'yellow', color: 'rgba(250, 204, 21, 0.4)', label: '黄色' },
  { value: 'green', color: 'rgba(34, 197, 94, 0.3)', label: '绿色' },
  { value: 'blue', color: 'rgba(59, 130, 246, 0.3)', label: '蓝色' },
  { value: 'pink', color: 'rgba(236, 72, 153, 0.3)', label: '粉色' },
];

const PDFReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [viewMode, setViewMode] = useState('single');
  const [annotations, setAnnotations] = useState([]);
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [showSelectionToolbar, setShowSelectionToolbar] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [sidebarTab, setSidebarTab] = useState('annotations');
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [loadingProgress, setLoadingProgress] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    loadPaper();
    loadAnnotations();
  }, [id]);

  const loadPaper = async () => {
    try {
      const response = await papersAPI.get(id);
      setPaper(response.data);
      if (response.data.last_read_page) {
        setPageNumber(response.data.last_read_page);
      }
    } catch (error) {
      console.error('加载文献失败:', error);
    }
  };

  const loadAnnotations = async () => {
    try {
      const response = await annotationsAPI.getAll({ paper_id: id });
      setAnnotations(response.data);
    } catch (error) {
      console.error('加载批注失败:', error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const saveReadingProgress = useCallback(async () => {
    if (!paper || loadingProgress) return;
    setLoadingProgress(true);
    try {
      const progress = Math.round((pageNumber / numPages) * 100);
      await papersAPI.updateProgress(id, {
        reading_progress: progress,
        last_read_page: pageNumber,
      });
    } catch (error) {
      console.error('保存进度失败:', error);
    }
    setTimeout(() => setLoadingProgress(false), 500);
  }, [id, pageNumber, numPages, paper, loadingProgress]);

  useEffect(() => {
    const timer = setTimeout(saveReadingProgress, 2000);
    return () => clearTimeout(timer);
  }, [pageNumber, saveReadingProgress]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionPosition({ x: rect.left + rect.width / 2, y: rect.top - 45 });
      setSelectedText(selection.toString());
      setShowSelectionToolbar(true);
    } else {
      setShowSelectionToolbar(false);
    }
  };

  const handleHighlight = async () => {
    const selection = window.getSelection();
    if (!selection || !selectedText) return;

    try {
      await annotationsAPI.create({
        paper_id: id,
        type: 'highlight',
        content: '',
        page: pageNumber,
        color: selectedColor,
        selected_text: selectedText,
      });
      loadAnnotations();
      setShowSelectionToolbar(false);
      window.getSelection().removeAllRanges();
    } catch (error) {
      console.error('添加高亮失败:', error);
    }
  };

  const handleAddNote = async () => {
    const selection = window.getSelection();
    if (!selection || !selectedText) return;

    try {
      const annotation = await annotationsAPI.create({
        paper_id: id,
        type: 'note',
        content: newNote.content,
        page: pageNumber,
        color: selectedColor,
        selected_text: selectedText,
      });

      if (newNote.title || newNote.content) {
        await notesAPI.create({
          paper_id: id,
          annotation_id: annotation.data.id,
          title: newNote.title || selectedText.substring(0, 50),
          content: newNote.content,
        });
      }

      loadAnnotations();
      setShowSelectionToolbar(false);
      setNewNote({ title: '', content: '' });
      window.getSelection().removeAllRanges();
    } catch (error) {
      console.error('添加笔记失败:', error);
    }
  };

  const handleCopyCitation = () => {
    const citation = `${paper?.authors || 'Unknown'}. (${paper?.year || 'n.d.'}). ${paper?.title || 'Untitled'}.`;
    navigator.clipboard.writeText(citation);
    setShowSelectionToolbar(false);
    alert('引用格式已复制到剪贴板');
  };

  const handleDeleteAnnotation = async (annotationId) => {
    if (window.confirm('确定要删除这个批注吗？')) {
      try {
        await annotationsAPI.delete(annotationId);
        loadAnnotations();
      } catch (error) {
        console.error('删除批注失败:', error);
      }
    }
  };

  const exportAnnotationsMarkdown = async () => {
    try {
      const response = await annotationsAPI.export(id);
      const anns = response.data;

      let markdown = `# ${paper?.title || 'Untitled'}\n\n`;
      markdown += `**作者**: ${paper?.authors || 'Unknown'}\n`;
      markdown += `**年份**: ${paper?.year || 'n.d.'}\n\n`;
      markdown += `---\n\n## 批注汇总\n\n`;

      const groupedByPage = {};
      anns.forEach((ann) => {
        if (!groupedByPage[ann.page]) groupedByPage[ann.page] = [];
        groupedByPage[ann.page].push(ann);
      });

      Object.keys(groupedByPage)
        .sort((a, b) => a - b)
        .forEach((page) => {
          markdown += `### 第 ${page} 页\n\n`;
          groupedByPage[page].forEach((ann) => {
            if (ann.selected_text) {
              markdown += `> ${ann.selected_text}\n\n`;
            }
            if (ann.content) {
              markdown += `📝 ${ann.content}\n\n`;
            }
          });
        });

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper?.title || 'annotations'}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出批注失败:', error);
    }
  };

  if (!paper) {
    return (
      <div className="empty-state" style={{ height: '100vh' }}>
        <div className="empty-icon">⏳</div>
        <div className="empty-title">加载中...</div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer" onMouseUp={handleTextSelection}>
      <div className="pdf-toolbar">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
          ← 返回
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-sm"
            style={{ background: viewMode === 'single' ? '#3b82f6' : '#e2e8f0', color: viewMode === 'single' ? 'white' : 'inherit' }}
            onClick={() => setViewMode('single')}
          >
            单页
          </button>
          <button
            className="btn btn-sm"
            style={{ background: viewMode === 'double' ? '#3b82f6' : '#e2e8f0', color: viewMode === 'double' ? 'white' : 'inherit' }}
            onClick={() => setViewMode('double')}
          >
            双页
          </button>
          <button
            className="btn btn-sm"
            style={{ background: viewMode === 'continuous' ? '#3b82f6' : '#e2e8f0', color: viewMode === 'continuous' ? 'white' : 'inherit' }}
            onClick={() => setViewMode('continuous')}
          >
            连续
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-sm btn-secondary" onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
            -
          </button>
          <span style={{ fontSize: '14px', minWidth: '50px', textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
          <button className="btn btn-sm btn-secondary" onClick={() => setScale(Math.min(2, scale + 0.1))}>
            +
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-sm btn-secondary"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            上一页
          </button>
          <span style={{ fontSize: '14px' }}>
            {pageNumber} / {numPages}
          </span>
          <button
            className="btn btn-sm btn-secondary"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            下一页
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <div className="color-picker">
            {highlightColors.map((c) => (
              <button
                key={c.value}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: c.color,
                  border: selectedColor === c.value ? '2px solid #1e293b' : '2px solid transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedColor(c.value)}
                title={c.label}
              />
            ))}
          </div>
          <button className="btn btn-sm btn-primary" onClick={exportAnnotationsMarkdown}>
            导出批注
          </button>
        </div>
      </div>

      <div className="pdf-container" ref={containerRef}>
        <Document
          file={`/api/uploads/${paper.file_path}`}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div style={{ padding: '40px', color: 'white' }}>
              <div className="empty-icon">📄</div>
              <div>加载PDF文件中...</div>
            </div>
          }
          error={
            <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>
              <div className="empty-icon">❌</div>
              <div>PDF文件加载失败</div>
            </div>
          }
        >
          {viewMode === 'continuous' ? (
            Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`} style={{ marginBottom: '10px' }}>
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
              </div>
            ))
          ) : viewMode === 'double' ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Page pageNumber={pageNumber} scale={scale} renderTextLayer={true} renderAnnotationLayer={false} />
              {pageNumber < numPages && (
                <Page
                  pageNumber={pageNumber + 1}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
              )}
            </div>
          ) : (
            <Page pageNumber={pageNumber} scale={scale} renderTextLayer={true} renderAnnotationLayer={false} />
          )}
        </Document>
      </div>

      <div className="pdf-sidebar">
        <div className="sidebar-tabs">
          <button className={`sidebar-tab ${sidebarTab === 'annotations' ? 'active' : ''}`} onClick={() => setSidebarTab('annotations')}>
            批注 ({annotations.length})
          </button>
          <button className={`sidebar-tab ${sidebarTab === 'info' ? 'active' : ''}`} onClick={() => setSidebarTab('info')}>
            文献信息
          </button>
        </div>
        <div className="sidebar-content">
          {sidebarTab === 'annotations' && (
            <>
              {annotations.filter((a) => a.page === pageNumber).length === 0 ? (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <div className="empty-icon">✏️</div>
                  <div className="empty-description">本页暂无批注</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                    选中文本后添加高亮或笔记
                  </div>
                </div>
              ) : (
                annotations
                  .filter((a) => a.page === pageNumber)
                  .map((ann) => (
                    <div key={ann.id} className="annotation-item" style={{ borderLeftColor: highlightColors.find((c) => c.value === ann.color)?.color }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        {ann.type === 'highlight' ? '高亮' : '笔记'}
                      </div>
                      <div className="annotation-text" style={{ background: highlightColors.find((c) => c.value === ann.color)?.color, padding: '4px 8px', borderRadius: '4px' }}>
                        {ann.selected_text}
                      </div>
                      {ann.content && <div className="annotation-note">{ann.content}</div>}
                      <button
                        className="btn btn-sm btn-danger"
                        style={{ marginTop: '8px' }}
                        onClick={() => handleDeleteAnnotation(ann.id)}
                      >
                        删除
                      </button>
                    </div>
                  ))
              )}

              {annotations.filter((a) => a.page !== pageNumber).length > 0 && (
                <>
                  <h4 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '14px' }}>其他页面的批注</h4>
                  {annotations
                    .filter((a) => a.page !== pageNumber)
                    .map((ann) => (
                      <div
                        key={ann.id}
                        className="annotation-item"
                        style={{ borderLeftColor: highlightColors.find((c) => c.value === ann.color)?.color, cursor: 'pointer' }}
                        onClick={() => setPageNumber(ann.page)}
                      >
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          第 {ann.page} 页 · {ann.type === 'highlight' ? '高亮' : '笔记'}
                        </div>
                        <div className="annotation-text">{ann.selected_text?.substring(0, 100)}...</div>
                      </div>
                    ))}
                </>
              )}
            </>
          )}

          {sidebarTab === 'info' && (
            <>
              <h4 style={{ marginBottom: '12px' }}>{paper.title}</h4>
              <p style={{ fontSize: '14px', marginBottom: '12px', color: '#64748b' }}>
                <strong>作者:</strong> {paper.authors || '未知'}
              </p>
              {paper.year && (
                <p style={{ fontSize: '14px', marginBottom: '12px', color: '#64748b' }}>
                  <strong>年份:</strong> {paper.year}
                </p>
              )}
              {paper.journal && (
                <p style={{ fontSize: '14px', marginBottom: '12px', color: '#64748b' }}>
                  <strong>期刊:</strong> {paper.journal}
                </p>
              )}
              <div style={{ marginTop: '20px' }}>
                <strong>阅读进度</strong>
                <div className="progress-bar" style={{ marginTop: '8px' }}>
                  <div className="progress-fill" style={{ width: `${paper.reading_progress || 0}%` }} />
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  已读 {paper.reading_progress || 0}% · 上次读到第 {paper.last_read_page || 1} 页
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {showSelectionToolbar && (
        <div
          className="selection-toolbar"
          style={{
            position: 'fixed',
            left: Math.max(10, Math.min(selectionPosition.x - 150, window.innerWidth - 320)),
            top: Math.max(70, selectionPosition.y),
          }}
        >
          <button className="selection-btn" onClick={handleHighlight}>
            🖍️ 高亮
          </button>
          <button
            className="selection-btn"
            onClick={() => {
              const note = prompt('输入笔记内容:');
              if (note) {
                setNewNote({ content: note });
                handleAddNote();
              }
            }}
          >
            📝 笔记
          </button>
          <button className="selection-btn" onClick={handleCopyCitation}>
            📋 复制引用
          </button>
          <button className="selection-btn" onClick={() => setShowSelectionToolbar(false)}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFReader;
