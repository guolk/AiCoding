import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { RatingStars } from '../components/RatingStars';
import type { Concert, ConcertProgramItem } from '../../shared/types';

export function ConcertForm() {
  const navigate = useNavigate();
  const { addConcert } = useAppStore();

  const [formData, setFormData] = useState<Omit<Concert, 'id' | 'createdAt'>>({
    title: '',
    date: '',
    time: '',
    venue: '',
    city: '',
    type: 'attended',
    programItems: [{ order: 1, composer: '', workTitle: '' }],
    performers: '',
    notes: '',
    rating: 0
  });

  const [saving, setSaving] = useState(false);

  const addProgramItem = () => {
    setFormData(prev => ({
      ...prev,
      programItems: [
        ...prev.programItems,
        { order: prev.programItems.length + 1, composer: '', workTitle: '' }
      ]
    }));
  };

  const removeProgramItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      programItems: prev.programItems
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, order: i + 1 }))
    }));
  };

  const updateProgramItem = (index: number, field: keyof ConcertProgramItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      programItems: prev.programItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const validProgramItems = formData.programItems.filter(
        item => item.composer.trim() || item.workTitle.trim()
      );
      await addConcert({
        ...formData,
        programItems: validProgramItems.length > 0 ? validProgramItems : [{ order: 1, composer: '', workTitle: '' }]
      });
      navigate('/concerts');
    } catch (error) {
      console.error('Failed to save concert:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-parchment-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-display text-3xl font-semibold text-burgundy-800">
          记录音乐会
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="font-display text-xl font-medium">基本信息</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                音乐会标题 *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="例如：贝多芬第九交响曲特别音乐会"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期 *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  时间
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  类型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'attended' | 'planned' }))}
                  className="input-field"
                >
                  <option value="attended">已观看</option>
                  <option value="planned">计划观看</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  场馆 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  className="input-field"
                  placeholder="例如：柏林爱乐音乐厅"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  城市
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="input-field"
                  placeholder="例如：柏林"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                表演者
              </label>
              <input
                type="text"
                value={formData.performers || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, performers: e.target.value }))}
                className="input-field"
                placeholder="例如：柏林爱乐乐团, 西蒙·拉特（指挥）"
              />
            </div>

            {formData.type === 'attended' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  个人评分
                </label>
                <div className="flex items-center gap-3">
                  <RatingStars
                    rating={formData.rating || 0}
                    onChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
                    size="lg"
                  />
                  <span className="text-sm text-gray-500">
                    {formData.rating ? `${formData.rating} 星` : '点击评分'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-xl font-medium">演出曲目</h2>
            <button
              type="button"
              onClick={addProgramItem}
              className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              添加曲目
            </button>
          </div>
          <div className="p-6 space-y-4">
            {formData.programItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-burgundy-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-burgundy-700">
                    {item.order}
                  </span>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={item.composer}
                    onChange={(e) => updateProgramItem(index, 'composer', e.target.value)}
                    className="input-field"
                    placeholder="作曲家"
                  />
                  <input
                    type="text"
                    value={item.workTitle}
                    onChange={(e) => updateProgramItem(index, 'workTitle', e.target.value)}
                    className="input-field"
                    placeholder="作品名称"
                  />
                </div>
                {formData.programItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProgramItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {formData.type === 'attended' && (
          <div className="card">
            <div className="card-header">
              <h2 className="font-display text-xl font-medium">演出感受</h2>
            </div>
            <div className="p-6">
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="input-field min-h-[120px]"
                placeholder="记录您对这场音乐会的感受和印象..."
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
