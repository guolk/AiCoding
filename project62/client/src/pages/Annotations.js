import { useState, useEffect } from 'react';
import { annotationsAPI } from '../services/api';

const highlightColors = [
  { value: 'yellow', color: 'rgba(250, 204, 21, 0.4)', label: '黄色' },
  { value: 'green', color: 'rgba(34, 197, 94, 0.3)', label: '绿色' },
  { value: 'blue', color: 'rgba(59, 130, 246, 0.3)', label: '蓝色' },
  { value: 'pink', color: 'rgba(236, 72, 153, 0.3)', label: '粉色' },
];

const Annotations = () => {
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ color: '', search: '' });

  useEffect(() => {
    loadAnnotations();
  }, [filters]);

  const loadAnnotations = async () => {
    try {
      const response = await annotationsAPI.getAll(filters);
      setAnnotations(response.data);
    } catch (error) {
      console.error('加载批注失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnnotation = async (id, content) => {
    try {
      await annotationsAPI.update(id, { content });
      loadAnnotations();
    } catch (error) {
      console.error('更新批注失败:', error);
    }
  };

  const handleDeleteAnnotation = async (id) => {
    if (window.confirm('确定要删除这个批注吗？')) {
      try {
        await annotationsAPI.delete(id);
        loadAnnotations();
      } catch (error) {
        console.error('删除批注失败:', error);
      }
    }
  };

  const getColorLabel = (colorValue) => {
    const color = highlightColors.find((c) => c.value === colorValue);
    return color ? color.label : colorValue;
  };

  const getColorStyle = (colorValue) => {
    const color = highlightColors.find((c) => c.value === colorValue);
    return color ? color.color : 'transparent';
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>批注管理</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>共 {annotations.length} 条批注</span>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-item search-box" style={{ flex: 2 }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="input search-input"
            placeholder="搜索批注内容..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="filter-item" style={{ maxWidth: '150px' }}>
          <select
            className="select"
            value={filters.color}
            onChange={(e) => setFilters({ ...filters, color: e.target.value })}
          >
            <option value="">全部颜色</option>
            {highlightColors.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state" style={{ padding: '60px' }}>
              <div className="empty-icon">⏳</div>
              <div className="empty-title">加载中...</div>
            </div>
          ) : annotations.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px' }}>
              <div className="empty-icon">✏️</div>
              <div className="empty-title">暂无批注</div>
              <div className="empty-description">打开文献并选中文本添加批注</div>
            </div>
          ) : (
            <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
              {annotations.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    borderLeft: `4px solid ${getColorStyle(ann.color)}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span
                          className="badge"
                          style={{
                            background: getColorStyle(ann.color),
                            color: '#1e293b',
                          }}
                        >
                          {getColorLabel(ann.color)}
                        </span>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                          📄 {ann.paper_title || '未知文献'}
                        </span>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                          📖 第 {ann.page} 页
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {ann.type === 'highlight' ? '高亮' : '笔记'}
                        </span>
                      </div>
                      {ann.selected_text && (
                        <div
                          style={{
                            background: getColorStyle(ann.color),
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            marginBottom: ann.content ? '8px' : '0',
                          }}
                        >
                          {ann.selected_text}
                        </div>
                      )}
                      {ann.content && (
                        <div
                          style={{
                            background: '#fef9c3',
                            border: '1px solid #fde047',
                            borderRadius: '6px',
                            padding: '10px 12px',
                            fontSize: '13px',
                          }}
                        >
                          <strong>📝 笔记:</strong> {ann.content}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          const newContent = prompt('编辑笔记内容:', ann.content || '');
                          if (newContent !== null) {
                            handleUpdateAnnotation(ann.id, newContent);
                          }
                        }}
                      >
                        编辑
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteAnnotation(ann.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Annotations;
