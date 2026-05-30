import { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Lightbulb, TrendingUp } from 'lucide-react';
import { useMaterials } from '../../context/MaterialContext';
import { Material, MATERIAL_CATEGORIES, MaterialCategory } from '../../types';
import StarRating from '../../components/UI/StarRating';
import Modal from '../../components/UI/Modal';
import { formatDate } from '../../utils/duration';

const categoryLabels: Record<MaterialCategory, string> = {
  family: '家庭',
  workplace: '职场',
  society: '社会现象',
  personal: '个人经历',
  other: '其他',
};

interface MaterialFormData {
  content: string;
  category: MaterialCategory;
  tags: string;
  potential: number;
  note: string;
}

const initialFormData: MaterialFormData = {
  content: '',
  category: 'personal',
  tags: '',
  potential: 5,
  note: '',
};

export default function MaterialsPage() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<MaterialCategory | 'all'>('all');
  const [filterPotential, setFilterPotential] = useState<number | 'all'>('all');

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    const matchesPotential = filterPotential === 'all' || m.potential >= filterPotential;
    return matchesSearch && matchesCategory && matchesPotential;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    if (a.potential !== b.potential) {
      return b.potential - a.potential;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleOpenModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        content: material.content,
        category: material.category,
        tags: material.tags.join(', '),
        potential: material.potential,
        note: material.note || '',
      });
    } else {
      setEditingMaterial(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    setFormData(initialFormData);
    setSaveError('');
  };

  const [saveError, setSaveError] = useState<string>('');

  const handleSubmit = () => {
    setSaveError('');
    
    if (!formData.content.trim()) {
      setSaveError('请填写素材内容');
      return;
    }

    try {
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      if (editingMaterial) {
        updateMaterial(editingMaterial.id, {
          content: formData.content,
          category: formData.category,
          tags,
          potential: formData.potential,
          note: formData.note || undefined,
        });
      } else {
        addMaterial({
          content: formData.content,
          category: formData.category,
          tags,
          potential: formData.potential,
          note: formData.note || undefined,
        });
      }
      handleCloseModal();
      setSaveError('');
    } catch (error) {
      console.error('保存素材失败:', error);
      setSaveError('保存失败，请重试');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个素材吗？')) {
      deleteMaterial(id);
    }
  };

  const highPotentialCount = materials.filter(m => m.potential >= 7).length;
  const totalPotential = materials.length > 0 
    ? (materials.reduce((sum, m) => sum + m.potential, 0) / materials.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-ivory mb-2">
              素材收集
            </h1>
            <p className="text-ivory/60">捕捉生活中的每一个笑点</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>快速记录</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-stage-red/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-coral" />
              </div>
              <span className="text-ivory/60 text-sm">总素材数</span>
            </div>
            <p className="font-display text-3xl font-bold">{materials.length}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-spotlight-gold/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-spotlight-gold" />
              </div>
              <span className="text-ivory/60 text-sm">高潜力素材</span>
            </div>
            <p className="font-display text-3xl font-bold text-spotlight-gold">
              {highPotentialCount}
            </p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <StarRating rating={parseFloat(totalPotential)} maxRating={10} readOnly size="sm" />
              </div>
              <span className="text-ivory/60 text-sm">平均潜力值</span>
            </div>
            <p className="font-display text-3xl font-bold">{totalPotential}</p>
          </div>
        </div>

        <div className="card p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory/40" />
              <input
                type="text"
                placeholder="搜索素材内容或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory/40" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as MaterialCategory | 'all')}
                  className="input pl-10 pr-8 appearance-none bg-theater-darker"
                >
                  <option value="all">全部分类</option>
                  {MATERIAL_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <select
                  value={filterPotential}
                  onChange={(e) => setFilterPotential(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="input pl-4 pr-8 appearance-none bg-theater-darker"
                >
                  <option value="all">全部潜力</option>
                  <option value={7}>7分以上</option>
                  <option value={8}>8分以上</option>
                  <option value={9}>9分以上</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {sortedMaterials.length === 0 ? (
          <div className="card p-12 text-center">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-ivory/20" />
            <h3 className="font-display text-xl font-bold text-ivory/60 mb-2">
              还没有素材
            </h3>
            <p className="text-ivory/40 mb-6">点击上方"快速记录"开始捕捉灵感</p>
            <button onClick={() => handleOpenModal()} className="btn-primary">
              创建第一个素材
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedMaterials.map((material) => (
              <div
                key={material.id}
                className={`card p-5 group hover:scale-[1.02] transition-transform ${
                  material.potential >= 8 ? 'border-spotlight-gold/30 spotlight' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${MATERIAL_CATEGORIES.find(c => c.value === material.category)?.color}`}>
                    {categoryLabels[material.category]}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(material)}
                      className="p-2 rounded-lg hover:bg-white/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-ivory/90 mb-3 line-clamp-4">
                  {material.content}
                </p>

                {material.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {material.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-ivory/60"
                      >
                        #{tag}
                      </span>
                    ))}
                    {material.tags.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-ivory/40">
                        +{material.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <StarRating rating={material.potential} maxRating={10} readOnly size="sm" />
                  <span className="text-xs text-ivory/40">
                    {formatDate(material.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMaterial ? '编辑素材' : '快速记录灵感'}
        size="lg"
      >
        <div className="space-y-5">
          <div>
            <label className="label">素材内容 *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="记录这个有趣的观察或想法..."
              rows={4}
              className="input resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">分类</label>
              <div className="flex flex-wrap gap-2">
                {MATERIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.category === cat.value
                        ? `${cat.color} text-white`
                        : 'bg-white/5 text-ivory/60 hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">潜力评估 (1-10)</label>
              <div className="py-2">
                <StarRating
                  rating={formData.potential}
                  maxRating={10}
                  onChange={(r) => setFormData(prev => ({ ...prev, potential: r }))}
                  size="lg"
                />
              </div>
              <p className="text-xs text-ivory/40 mt-1">
                {formData.potential >= 8 ? '🔥 非常有潜力' :
                 formData.potential >= 6 ? '💡 有一定潜力' :
                 formData.potential >= 4 ? '🤔 有待打磨' : '📝 记录一下'}
              </p>
            </div>
          </div>

          <div>
            <label className="label">标签（用逗号分隔）</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="例如: 地铁, 尴尬, 搞笑"
              className="input"
            />
          </div>

          <div>
            <label className="label">备注（可选）</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="关于这个素材的额外想法或发展方向..."
              rows={2}
              className="input resize-y"
            />
          </div>

          {saveError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400">{saveError}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2.5 rounded-xl text-ivory/60 hover:bg-white/5 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary"
            >
              {editingMaterial ? '保存修改' : '保存素材'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
