import { useState, useEffect } from 'react';
import { papersAPI, insightsAPI, relationsAPI } from '../services/api';

const statusOptions = [
  { value: 'unread', label: '未读' },
  { value: 'reading', label: '阅读中' },
  { value: 'completed', label: '已完成' },
  { value: 'mastered', label: '精读完成' },
];

const PaperDetailModal = ({ paper, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    abstract: '',
    year: '',
    doi: '',
    arxiv_id: '',
    journal: '',
    status: 'unread',
    rating: 0,
    notes: '',
  });
  const [insights, setInsights] = useState({
    research_question: '',
    methods: '',
    conclusions: '',
    limitations: '',
  });
  const [relations, setRelations] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [newRelation, setNewRelation] = useState({ paper_id2: '', relation_type: 'related', description: '' });

  useEffect(() => {
    setFormData({
      title: paper.title || '',
      authors: paper.authors || '',
      abstract: paper.abstract || '',
      year: paper.year || '',
      doi: paper.doi || '',
      arxiv_id: paper.arxiv_id || '',
      journal: paper.journal || '',
      status: paper.status || 'unread',
      rating: paper.rating || 0,
      notes: paper.notes || '',
    });
    loadInsights();
    loadRelations();
    loadAllPapers();
  }, [paper]);

  const loadInsights = async () => {
    try {
      const response = await insightsAPI.get(paper.id);
      if (response.data) {
        setInsights(response.data);
      }
    } catch (error) {
      console.error('加载关键发现失败:', error);
    }
  };

  const loadRelations = async () => {
    try {
      const response = await relationsAPI.getAll({ paper_id: paper.id });
      setRelations(response.data);
    } catch (error) {
      console.error('加载关联文献失败:', error);
    }
  };

  const loadAllPapers = async () => {
    try {
      const response = await papersAPI.getAll({});
      setAllPapers(response.data.filter((p) => p.id !== paper.id));
    } catch (error) {
      console.error('加载文献列表失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('正在更新文献:', paper.id, formData);
      await papersAPI.update(paper.id, formData);
      console.log('正在更新知识提炼:', insights);
      await insightsAPI.update(paper.id, insights);
      onSuccess();
    } catch (error) {
      console.error('保存失败详细错误:', error);
      alert('保存失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddRelation = async () => {
    if (!newRelation.paper_id2) {
      alert('请选择要关联的文献');
      return;
    }
    try {
      await relationsAPI.create({
        paper_id1: paper.id,
        ...newRelation,
      });
      setNewRelation({ paper_id2: '', relation_type: 'related', description: '' });
      loadRelations();
    } catch (error) {
      alert('添加关联失败');
    }
  };

  const handleDeleteRelation = async (id) => {
    if (window.confirm('确定要删除这个关联吗？')) {
      try {
        await relationsAPI.delete(id);
        loadRelations();
      } catch (error) {
        console.error('删除关联失败:', error);
      }
    }
  };

  const relationTypeLabels = {
    support: { label: '相互支持', class: 'relation-support' },
    contradict: { label: '相互矛盾', class: 'relation-contradict' },
    related: { label: '相关工作', class: 'relation-related' },
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2 className="modal-title">文献详情</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="sidebar-tabs" style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
              {['basic', 'insights', 'relations'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`sidebar-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ border: 'none', background: 'none', paddingBottom: '12px', cursor: 'pointer' }}
                >
                  {tab === 'basic' && '基本信息'}
                  {tab === 'insights' && '知识提炼'}
                  {tab === 'relations' && '文献关联'}
                </button>
              ))}
            </div>

            {activeTab === 'basic' && (
              <>
                <div className="form-group">
                  <label className="form-label">标题</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">作者</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">摘要</label>
                  <textarea
                    className="textarea"
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">年份</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">期刊/会议</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.journal}
                      onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">阅读状态</label>
                    <select
                      className="select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">评分 (1-5)</label>
                    <select
                      className="select"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    >
                      <option value={0}>未评分</option>
                      {[1, 2, 3, 4, 5].map((r) => (
                        <option key={r} value={r}>
                          {'⭐'.repeat(r)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">阅读心得</label>
                  <textarea
                    className="textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder="记录你的阅读心得和思考..."
                  />
                </div>
              </>
            )}

            {activeTab === 'insights' && (
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-title">🔍 研究问题</div>
                  <textarea
                    className="textarea"
                    value={insights.research_question}
                    onChange={(e) => setInsights({ ...insights, research_question: e.target.value })}
                    rows={4}
                    placeholder="这篇论文要解决什么问题？"
                    style={{ marginTop: '8px' }}
                  />
                </div>
                <div className="insight-card">
                  <div className="insight-title">🛠️ 研究方法</div>
                  <textarea
                    className="textarea"
                    value={insights.methods}
                    onChange={(e) => setInsights({ ...insights, methods: e.target.value })}
                    rows={4}
                    placeholder="采用了什么方法和技术？"
                    style={{ marginTop: '8px' }}
                  />
                </div>
                <div className="insight-card">
                  <div className="insight-title">📝 主要结论</div>
                  <textarea
                    className="textarea"
                    value={insights.conclusions}
                    onChange={(e) => setInsights({ ...insights, conclusions: e.target.value })}
                    rows={4}
                    placeholder="论文得出了什么结论？"
                    style={{ marginTop: '8px' }}
                  />
                </div>
                <div className="insight-card">
                  <div className="insight-title">⚠️ 局限性</div>
                  <textarea
                    className="textarea"
                    value={insights.limitations}
                    onChange={(e) => setInsights({ ...insights, limitations: e.target.value })}
                    rows={4}
                    placeholder="论文有什么不足和局限性？"
                    style={{ marginTop: '8px' }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'relations' && (
              <>
                <div className="card" style={{ marginBottom: '20px' }}>
                  <div className="card-body" style={{ padding: '16px' }}>
                    <h4 style={{ marginBottom: '12px' }}>添加文献关联</h4>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">选择文献</label>
                        <select
                          className="select"
                          value={newRelation.paper_id2}
                          onChange={(e) => setNewRelation({ ...newRelation, paper_id2: e.target.value })}
                        >
                          <option value="">请选择...</option>
                          {allPapers.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">关联类型</label>
                        <select
                          className="select"
                          value={newRelation.relation_type}
                          onChange={(e) => setNewRelation({ ...newRelation, relation_type: e.target.value })}
                        >
                          <option value="related">相关工作</option>
                          <option value="support">相互支持</option>
                          <option value="contradict">相互矛盾</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">说明</label>
                      <input
                        type="text"
                        className="input"
                        value={newRelation.description}
                        onChange={(e) => setNewRelation({ ...newRelation, description: e.target.value })}
                        placeholder="简要说明关联原因..."
                      />
                    </div>
                    <button type="button" className="btn btn-primary" onClick={handleAddRelation}>
                      添加关联
                    </button>
                  </div>
                </div>

                <h4 style={{ marginBottom: '12px' }}>已关联的文献</h4>
                {relations.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <div className="empty-icon">🔗</div>
                    <div className="empty-description">还没有关联文献</div>
                  </div>
                ) : (
                  relations.map((rel) => {
                    const isPaper1 = rel.paper_id1 === paper.id;
                    const relatedTitle = isPaper1 ? rel.paper2_title : rel.paper1_title;
                    return (
                      <div key={rel.id} className="relation-item">
                        <div>
                          <span className={`relation-type ${relationTypeLabels[rel.relation_type]?.class}`}>
                            {relationTypeLabels[rel.relation_type]?.label}
                          </span>
                          <span style={{ marginLeft: '12px', fontSize: '14px' }}>{relatedTitle}</span>
                          {rel.description && (
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>{rel.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteRelation(rel.id)}
                        >
                          删除
                        </button>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaperDetailModal;
