import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { papersAPI, uploadFile } from '../services/api';
import AddPaperModal from '../components/AddPaperModal';
import PaperDetailModal from '../components/PaperDetailModal';

const statusLabels = {
  unread: { label: '未读', class: 'badge-secondary' },
  reading: { label: '阅读中', class: 'badge-warning' },
  completed: { label: '已完成', class: 'badge-info' },
  mastered: { label: '精读完成', class: 'badge-success' },
};

const Papers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadPapers();
  }, [filters]);

  const loadPapers = async () => {
    try {
      const response = await papersAPI.getAll(filters);
      setPapers(response.data);
    } catch (error) {
      console.error('加载文献失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = (paper) => {
    if (paper.file_path) {
      navigate(`/reader/${paper.id}`);
    } else {
      setSelectedPaper(paper);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这篇文献吗？')) {
      try {
        await papersAPI.delete(id);
        loadPapers();
      } catch (error) {
        console.error('删除文献失败:', error);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>我的文献库</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + 添加文献
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-item search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="input search-input"
            placeholder="搜索文献标题、作者..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="filter-item" style={{ maxWidth: '200px' }}>
          <select
            className="select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">所有状态</option>
            <option value="unread">未读</option>
            <option value="reading">阅读中</option>
            <option value="completed">已完成</option>
            <option value="mastered">精读完成</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">加载中...</div>
        </div>
      ) : papers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <div className="empty-title">还没有文献</div>
          <div className="empty-description">点击右上角按钮添加你的第一篇文献</div>
        </div>
      ) : (
        <div className="paper-list">
          {papers.map((paper) => (
            <div key={paper.id} className="paper-item" onClick={() => handlePaperClick(paper)}>
              <div className="paper-title">{paper.title || '无标题'}</div>
              <div className="paper-meta">
                <span>👤 {paper.authors || '未知作者'}</span>
                {paper.year && <span>📅 {paper.year}</span>}
                {paper.journal && <span>📖 {paper.journal}</span>}
                <span className={`badge ${statusLabels[paper.status]?.class}`}>
                  {statusLabels[paper.status]?.label}
                </span>
              </div>
              {paper.reading_progress > 0 && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${paper.reading_progress}%` }} />
                </div>
              )}
              <div className="paper-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPaper(paper);
                  }}
                >
                  编辑详情
                </button>
                <button className="btn btn-sm btn-danger" onClick={(e) => handleDelete(paper.id, e)}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddPaperModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadPapers();
          }}
        />
      )}

      {selectedPaper && (
        <PaperDetailModal
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
          onSuccess={() => {
            setSelectedPaper(null);
            loadPapers();
          }}
        />
      )}
    </div>
  );
};

export default Papers;
