import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Discussion } from '../types';

export default function DiscussionForm() {
  const navigate = useNavigate();
  const { addDiscussion, showToast, currentUser } = useStore();

  const [formData, setFormData] = useState<Omit<Discussion, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    content: '',
    tags: [],
    created_by: currentUser?.id || 1,
    project_id: null,
    replies: [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('请输入讨论标题', 'error');
      return;
    }
    if (!formData.content.trim()) {
      showToast('请输入讨论内容', 'error');
      return;
    }

    addDiscussion(formData);
    showToast('讨论创建成功', 'success');
    navigate('/discussions');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/discussions')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">发起讨论</h1>
          <p className="text-sm text-neutral-500">与团队成员讨论技术问题</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">标题 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="请输入讨论标题"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">标签</label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field flex-1"
              placeholder="输入标签后按回车添加"
            />
            <button type="button" onClick={addTag} className="btn-secondary">
              添加标签
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 text-sm bg-accent-100 text-accent-700 px-3 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-accent-900">
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">内容 *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="input-textarea"
            rows={8}
            placeholder="详细描述你想讨论的技术问题..."
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
          <button type="button" onClick={() => navigate('/discussions')} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            发布讨论
          </button>
        </div>
      </form>
    </div>
  );
}
