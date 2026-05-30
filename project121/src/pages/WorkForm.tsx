import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Music
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { musicbrainzApi } from '../services/api';
import type { Work, Movement, MusicBrainzWorkResult } from '../../shared/types';

export function WorkForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { works, addWork, updateWork, fetchWorks } = useAppStore();
  const isEdit = !!id;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MusicBrainzWorkResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    composer: '',
    title: '',
    opus: '',
    catalogNumber: '',
    compositionYear: '',
    duration: '',
    instrumentation: '',
    form: '',
    movements: [] as Movement[]
  });

  useEffect(() => {
    if (isEdit && id) {
      const work = works.find((w) => w.id === id);
      if (work) {
        setFormData({
          composer: work.composer,
          title: work.title,
          opus: work.opus || '',
          catalogNumber: work.catalogNumber || '',
          compositionYear: work.compositionYear?.toString() || '',
          duration: work.duration?.toString() || '',
          instrumentation: work.instrumentation || '',
          form: work.form || '',
          movements: work.movements || []
        });
      }
    }
  }, [id, works, isEdit]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await musicbrainzApi.searchWorks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: MusicBrainzWorkResult) => {
    setFormData((prev) => ({
      ...prev,
      composer: result.composer || prev.composer,
      title: result.title,
      opus: result.opus || prev.opus,
      catalogNumber: result.catalogNumber || prev.catalogNumber,
      compositionYear: result.compositionYear?.toString() || prev.compositionYear,
      form: result.workType || prev.form
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAddMovement = () => {
    const newNumber = formData.movements.length + 1;
    setFormData((prev) => ({
      ...prev,
      movements: [
        ...prev.movements,
        { number: newNumber, title: '' }
      ]
    }));
  };

  const handleRemoveMovement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      movements: prev.movements
        .filter((_, i) => i !== index)
        .map((m, i) => ({ ...m, number: i + 1 }))
    }));
  };

  const handleUpdateMovement = (index: number, field: keyof Movement, value: string) => {
    setFormData((prev) => ({
      ...prev,
      movements: prev.movements.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const workData = {
      composer: formData.composer,
      title: formData.title,
      opus: formData.opus || undefined,
      catalogNumber: formData.catalogNumber || undefined,
      compositionYear: formData.compositionYear ? parseInt(formData.compositionYear) : undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      instrumentation: formData.instrumentation || undefined,
      form: formData.form || undefined,
      movements: formData.movements.length > 0 ? formData.movements : undefined
    };

    try {
      setIsSubmitting(true);
      setError(null);
      if (isEdit && id) {
        await updateWork(id, workData);
      } else {
        await addWork(workData);
      }
      navigate('/works');
    } catch (err) {
      console.error('Failed to save work:', err);
      setError('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/works"
          className="p-2 hover:bg-parchment-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-display text-2xl font-semibold text-burgundy-800">
          {isEdit ? '编辑作品' : '添加新作品'}
        </h1>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-display text-lg font-medium">
            从 MusicBrainz 搜索（可选）
          </h2>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索作品名称或作曲家..."
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="btn-primary"
            >
              {isSearching ? '搜索中...' : '搜索'}
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="border border-parchment-200 rounded-lg divide-y divide-parchment-100">
              {searchResults.slice(0, 5).map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full p-4 text-left hover:bg-parchment-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{result.title}</p>
                      <p className="text-sm text-gray-500">
                        {result.composer || '未知作曲家'}
                        {result.workType && ` • ${result.workType}`}
                        {result.opus && ` • ${result.opus}`}
                      </p>
                    </div>
                    <span className="text-sm text-burgundy-600">选择</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="card-header">
          <h2 className="font-display text-lg font-medium">作品信息</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label-field">作曲家 *</label>
              <input
                type="text"
                value={formData.composer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, composer: e.target.value }))
                }
                required
                className="input-field"
                placeholder="如: Ludwig van Beethoven"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-field">作品名称 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                className="input-field"
                placeholder="如: Symphony No. 9 in D minor"
              />
            </div>
            <div>
              <label className="label-field">作品编号 (Op.)</label>
              <input
                type="text"
                value={formData.opus}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, opus: e.target.value }))
                }
                className="input-field"
                placeholder="如: Op. 125"
              />
            </div>
            <div>
              <label className="label-field">目录编号</label>
              <input
                type="text"
                value={formData.catalogNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    catalogNumber: e.target.value
                  }))
                }
                className="input-field"
                placeholder="如: K. 467, BWV 1050"
              />
            </div>
            <div>
              <label className="label-field">创作年代</label>
              <input
                type="number"
                value={formData.compositionYear}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    compositionYear: e.target.value
                  }))
                }
                className="input-field"
                placeholder="如: 1824"
              />
            </div>
            <div>
              <label className="label-field">时长 (秒)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duration: e.target.value }))
                }
                className="input-field"
                placeholder="如: 4200"
              />
            </div>
            <div>
              <label className="label-field">曲式</label>
              <input
                type="text"
                value={formData.form}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, form: e.target.value }))
                }
                className="input-field"
                placeholder="如: 交响曲、协奏曲、奏鸣曲"
              />
            </div>
            <div>
              <label className="label-field">乐队编制</label>
              <input
                type="text"
                value={formData.instrumentation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instrumentation: e.target.value
                  }))
                }
                className="input-field"
                placeholder="如: 管弦乐队、钢琴独奏"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="label-field m-0">乐章结构</label>
              <button
                type="button"
                onClick={handleAddMovement}
                className="text-sm text-burgundy-600 hover:text-burgundy-800 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加乐章
              </button>
            </div>
            {formData.movements.length === 0 ? (
              <p className="text-gray-500 text-sm">尚未添加乐章</p>
            ) : (
              <div className="space-y-4">
                {formData.movements.map((movement, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start p-4 bg-parchment-50 rounded-lg"
                  >
                    <span className="w-8 h-8 bg-burgundy-100 text-burgundy-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {movement.number}
                    </span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">
                          乐章名称
                        </label>
                        <input
                          type="text"
                          value={movement.title}
                          onChange={(e) =>
                            handleUpdateMovement(index, 'title', e.target.value)
                          }
                          className="input-field"
                          placeholder="如: Allegro ma non troppo"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          速度/调性
                        </label>
                        <input
                          type="text"
                          value={movement.tempo || ''}
                          onChange={(e) =>
                            handleUpdateMovement(index, 'tempo', e.target.value)
                          }
                          className="input-field"
                          placeholder="如: Allegro • D minor"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMovement(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-parchment-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Link to="/works" className="btn-secondary">
              取消
            </Link>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : (isEdit ? '保存更改' : '添加作品')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
