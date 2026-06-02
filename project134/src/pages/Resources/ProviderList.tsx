import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Scale, Calculator, Palette, Code, Filter } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Textarea from '../../components/ui/Textarea';
import { useResourceStore } from '../../store/useResourceStore';
import { PROVIDER_CATEGORY_OPTIONS } from '../../utils/constants';
import { cn } from '../../utils/helpers';
import type { ServiceProvider, ProviderCategory } from '../../types';

const categoryIcons: Record<ProviderCategory, typeof Scale> = {
  legal: Scale,
  finance: Calculator,
  brand: Palette,
  technology: Code,
};

const categoryColors: Record<ProviderCategory, string> = {
  legal: 'from-blue-500 to-indigo-500',
  finance: 'from-green-500 to-emerald-500',
  brand: 'from-purple-500 to-pink-500',
  technology: 'from-orange-500 to-amber-500',
};

export default function ProviderList() {
  const providers = useResourceStore((s) => s.providers);
  const addProvider = useResourceStore((s) => s.addProvider);
  const updateProvider = useResourceStore((s) => s.updateProvider);
  const deleteProvider = useResourceStore((s) => s.deleteProvider);

  const [filterCategory, setFilterCategory] = useState<ProviderCategory | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editProviderId, setEditProviderId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: 'legal' as ProviderCategory,
    name: '',
    contact: '',
    description: '',
  });

  const filteredProviders = useMemo(() => {
    if (filterCategory === 'all') return providers;
    return providers.filter((p) => p.category === filterCategory);
  }, [providers, filterCategory]);

  const groupedProviders = useMemo(() => {
    const groups: Record<ProviderCategory, ServiceProvider[]> = {
      legal: [],
      finance: [],
      brand: [],
      technology: [],
    };
    filteredProviders.forEach((p) => {
      groups[p.category].push(p);
    });
    return groups;
  }, [filteredProviders]);

  const getCategoryLabel = (value: string) => {
    return PROVIDER_CATEGORY_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  const resetForm = () => {
    setFormData({ category: 'legal', name: '', contact: '', description: '' });
    setIsEditing(false);
    setEditProviderId(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (isEditing && editProviderId) {
      updateProvider(editProviderId, formData);
    } else {
      addProvider(formData);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = (provider: ServiceProvider) => {
    setFormData({
      category: provider.category,
      name: provider.name,
      contact: provider.contact,
      description: provider.description,
    });
    setEditProviderId(provider.id);
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">服务商管理</h1>
          <p className="text-slate-500 mt-1">管理外部服务商资源</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增服务商
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-all',
                  filterCategory === 'all'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                )}
              >
                全部
              </button>
              {PROVIDER_CATEGORY_OPTIONS.map((cat) => {
                const Icon = categoryIcons[cat.value as ProviderCategory];
                return (
                  <button
                    key={cat.value}
                    onClick={() => setFilterCategory(cat.value as ProviderCategory)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-all inline-flex items-center gap-1.5',
                      filterCategory === cat.value
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.entries(groupedProviders).map(([category, categoryProviders]) => {
        if (categoryProviders.length === 0) return null;
        const cat = category as ProviderCategory;
        const Icon = categoryIcons[cat];
        const categoryOption = PROVIDER_CATEGORY_OPTIONS.find((o) => o.value === cat);

        return (
          <div key={cat} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white', categoryColors[cat])}>
                <Icon className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{categoryOption?.label}</h2>
              <Badge variant="info" className="text-xs">{categoryProviders.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProviders.map((provider) => {
                const ProviderIcon = categoryIcons[provider.category];
                return (
                  <Card key={provider.id} hover>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', categoryColors[provider.category])}>
                            <ProviderIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{provider.name}</h3>
                            <Badge variant="info" className="text-xs mt-1">
                              {getCategoryLabel(provider.category)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(provider)}>
                            <Edit2 className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(provider.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-slate-500 mb-1">联系方式</p>
                        <p className="text-sm text-slate-700">{provider.contact}</p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 mb-1">服务描述</p>
                        <p className="text-sm text-slate-600 line-clamp-3">{provider.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {filteredProviders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-slate-400 mb-2">
              <Scale className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-slate-500">暂无服务商资源</p>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={isEditing ? '编辑服务商' : '新增服务商'}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmit}>{isEditing ? '保存修改' : '确认添加'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="服务分类"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProviderCategory })}
            options={PROVIDER_CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <Input
            label="服务商名称"
            placeholder="请输入服务商名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="联系方式"
            placeholder="请输入邮箱或电话"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />
          <Textarea
            label="服务描述"
            placeholder="请详细描述服务内容..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteConfirm) {
                  deleteProvider(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <p className="text-slate-600">确定要删除该服务商吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
}
