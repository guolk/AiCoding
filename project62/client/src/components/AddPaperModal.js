import { useState } from 'react';
import { papersAPI, uploadFile } from '../services/api';

const AddPaperModal = ({ onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('file');
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    abstract: '',
    year: '',
    doi: '',
    arxiv_id: '',
    journal: '',
  });
  const [file, setFile] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFetchMetadata = async () => {
    if (!formData.doi && !formData.arxiv_id) {
      alert('请输入DOI或ArXiv ID');
      return;
    }

    setFetching(true);
    try {
      const response = await papersAPI.fetchMetadata({
        doi: formData.doi,
        arxiv_id: formData.arxiv_id,
      });
      setFormData({
        ...formData,
        title: response.data.title || '',
        authors: response.data.authors || '',
        abstract: response.data.abstract || '',
        year: response.data.year || '',
        journal: response.data.journal || '',
      });
    } catch (error) {
      alert('获取元数据失败，请手动输入');
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      alert('只支持PDF文件');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let filePath = null;
    if (file) {
      setUploading(true);
      try {
        const uploadResponse = await uploadFile(file);
        filePath = uploadResponse.data.file_path;
      } catch (error) {
        alert('文件上传失败');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      console.log('正在创建文献:', formData, filePath);
      await papersAPI.create({
        ...formData,
        file_path: filePath,
        status: 'unread',
      });
      onSuccess();
    } catch (error) {
      console.error('创建文献失败详细错误:', error);
      alert('创建文献失败: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">添加文献</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                type="button"
                className={`btn ${activeTab === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('file')}
              >
                上传PDF
              </button>
              <button
                type="button"
                className={`btn ${activeTab === 'metadata' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('metadata')}
              >
                元数据抓取
              </button>
              <button
                type="button"
                className={`btn ${activeTab === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('manual')}
              >
                手动输入
              </button>
            </div>

            {activeTab === 'file' && (
              <div className="form-group">
                <label className="form-label">选择PDF文件</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  style={{ width: '100%', padding: '10px' }}
                />
                {file && <p style={{ marginTop: '8px', fontSize: '14px', color: '#10b981' }}>✓ 已选择: {file.name}</p>}
              </div>
            )}

            {activeTab === 'metadata' && (
              <div className="form-group">
                <label className="form-label">通过DOI或ArXiv ID自动抓取</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="输入DOI"
                    value={formData.doi}
                    onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="输入ArXiv ID"
                    value={formData.arxiv_id}
                    onChange={(e) => setFormData({ ...formData, arxiv_id: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleFetchMetadata}
                    disabled={fetching}
                  >
                    {fetching ? '抓取中...' : '抓取'}
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">标题 *</label>
              <input
                type="text"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
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
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? '上传中...' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaperModal;
