import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Literature } from '../types';

export default function LiteratureForm() {
  const navigate = useNavigate();
  const { addLiterature, showToast, currentUser } = useStore();

  const [formData, setFormData] = useState<Omit<Literature, 'id' | 'created_at'>>({
    title: '',
    authors: '',
    journal: '',
    year: new Date().getFullYear(),
    doi: '',
    url: '',
    added_by: currentUser?.id || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('请输入文献标题', 'error');
      return;
    }

    addLiterature(formData);
    showToast('文献添加成功', 'success');
    navigate('/literature');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/literature')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">添加文献</h1>
          <p className="text-sm text-neutral-500">将新文献添加到课题组文献库</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">文献标题 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="请输入文献标题"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">作者</label>
          <input
            type="text"
            value={formData.authors}
            onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
            className="input-field"
            placeholder="请输入作者信息"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">期刊</label>
            <input
              type="text"
              value={formData.journal}
              onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
              className="input-field"
              placeholder="请输入期刊名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">年份</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
              className="input-field"
              placeholder="请输入年份"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">DOI</label>
          <input
            type="text"
            value={formData.doi}
            onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
            className="input-field"
            placeholder="请输入DOI编号"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">链接</label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="input-field"
            placeholder="请输入文献链接"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
          <button type="button" onClick={() => navigate('/literature')} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            添加文献
          </button>
        </div>
      </form>
    </div>
  );
}
