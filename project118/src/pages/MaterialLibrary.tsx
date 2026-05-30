import { useState } from 'react';
import { Plus, Package, Edit2, Trash2, List, Grid3X3, History } from 'lucide-react';
import { useMaterialStore } from '@/stores/materialStore';
import { useProjectStore } from '@/stores/projectStore';
import { Card, CardHeader, CardContent } from '@/components/common/Card';
import SearchBar from '@/components/common/SearchBar';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import MaterialCard from '@/components/materials/MaterialCard';
import ColorWheel from '@/components/materials/ColorWheel';
import type { Yarn } from '@/types';

export default function MaterialLibrary() {
  const yarns = useMaterialStore((s) => s.yarns);
  const addYarn = useMaterialStore((s) => s.addYarn);
  const updateYarn = useMaterialStore((s) => s.updateYarn);
  const deleteYarn = useMaterialStore((s) => s.deleteYarn);
  const yarnUsageHistory = useMaterialStore((s) => s.yarnUsageHistory);
  const projects = useProjectStore((s) => s.projects);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'color'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedYarn, setSelectedYarn] = useState<Yarn | null>(null);
  const [editingYarn, setEditingYarn] = useState<Yarn | null>(null);

  const [newYarn, setNewYarn] = useState({
    brand: '',
    colorCode: '',
    colorName: '',
    colorHex: '#6B7280',
    weight: 50,
    remainingWeight: 50
  });

  const filteredYarns = yarns.filter((y) => {
    const matchesSearch =
      y.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      y.colorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      y.colorCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || y.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getUsageHistoryForYarn = (yarnId: string) => {
    const usages = yarnUsageHistory.filter((u) => u.yarnId === yarnId);
    return usages.map((u) => {
      const project = projects.find((p) => p.id === u.projectId);
      return {
        ...u,
        projectName: project?.name || '未知项目'
      };
    });
  };

  const handleSaveYarn = () => {
    if (!newYarn.brand || !newYarn.colorCode || !newYarn.colorName) return;

    if (editingYarn) {
      updateYarn(editingYarn.id, {
        brand: newYarn.brand,
        colorCode: newYarn.colorCode,
        colorName: newYarn.colorName,
        colorHex: newYarn.colorHex,
        weight: newYarn.weight,
        remainingWeight: Math.min(newYarn.remainingWeight, newYarn.weight)
      });
    } else {
      addYarn({
        brand: newYarn.brand,
        colorCode: newYarn.colorCode,
        colorName: newYarn.colorName,
        colorHex: newYarn.colorHex,
        weight: newYarn.weight,
        remainingWeight: newYarn.remainingWeight
      });
    }

    setShowAddModal(false);
    setEditingYarn(null);
    setNewYarn({
      brand: '',
      colorCode: '',
      colorName: '',
      colorHex: '#6B7280',
      weight: 50,
      remainingWeight: 50
    });
  };

  const handleEditYarn = (yarn: Yarn) => {
    setEditingYarn(yarn);
    setNewYarn({
      brand: yarn.brand,
      colorCode: yarn.colorCode,
      colorName: yarn.colorName,
      colorHex: yarn.colorHex,
      weight: yarn.weight,
      remainingWeight: yarn.remainingWeight
    });
    setShowAddModal(true);
  };

  const totalWeight = yarns.reduce((sum, y) => sum + y.weight, 0);
  const totalRemaining = yarns.reduce((sum, y) => sum + y.remainingWeight, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">材料库</h1>
          <p className="text-gray-500 mt-1">管理你的线材库存</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowHistoryModal(true)}>
            <History className="w-4 h-4 mr-2" />
            使用历史
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加线材
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{yarns.length}</p>
              <p className="text-sm text-gray-500">线材种类</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalWeight}g</p>
              <p className="text-sm text-gray-500">总购入</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalRemaining}g</p>
              <p className="text-sm text-gray-500">剩余量</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {yarns.filter((y) => (y.remainingWeight / y.weight) < 0.3).length}
              </p>
              <p className="text-sm text-gray-500">库存不足</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索品牌、颜色名称或色号..."
          className="flex-1 max-w-md"
        />
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
            列表
          </button>
          <button
            onClick={() => setViewMode('color')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'color' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            色系
          </button>
        </div>
      </div>

      {viewMode === 'color' && (
        <ColorWheel
          yarns={yarns}
          selectedCategory={selectedCategory || undefined}
          onCategorySelect={(cat) => setSelectedCategory(cat)}
        />
      )}

      {filteredYarns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedCategory ? '没有找到匹配的线材' : '还没有添加线材'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory ? '尝试其他搜索条件' : '添加你的第一卷线材'}
            </p>
            {!searchQuery && !selectedCategory && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                添加线材
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredYarns.map((yarn) => (
            <MaterialCard
              key={yarn.id}
              yarn={yarn}
              onEdit={handleEditYarn}
              onDelete={(id) => {
                if (confirm('确定要删除这个线材吗？')) {
                  deleteYarn(id);
                }
              }}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingYarn(null);
        }}
        title={editingYarn ? '编辑线材' : '添加线材'}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="品牌"
              value={newYarn.brand}
              onChange={(e) => setNewYarn({ ...newYarn, brand: e.target.value })}
              placeholder="例如：DMC"
            />
            <Input
              label="色号"
              value={newYarn.colorCode}
              onChange={(e) => setNewYarn({ ...newYarn, colorCode: e.target.value })}
              placeholder="例如：310"
            />
          </div>
          <Input
            label="颜色名称"
            value={newYarn.colorName}
            onChange={(e) => setNewYarn({ ...newYarn, colorName: e.target.value })}
            placeholder="例如：黑色"
          />
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">颜色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newYarn.colorHex}
                  onChange={(e) => setNewYarn({ ...newYarn, colorHex: e.target.value })}
                  className="w-12 h-10 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={newYarn.colorHex}
                  onChange={(e) => setNewYarn({ ...newYarn, colorHex: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <Input
              label="总重量(g)"
              type="number"
              min="1"
              value={newYarn.weight}
              onChange={(e) => setNewYarn({ ...newYarn, weight: Number(e.target.value) })}
            />
            <Input
              label="剩余量(g)"
              type="number"
              min="0"
              value={newYarn.remainingWeight}
              onChange={(e) => setNewYarn({ ...newYarn, remainingWeight: Number(e.target.value) })}
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingYarn(null);
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleSaveYarn}
              disabled={!newYarn.brand || !newYarn.colorCode || !newYarn.colorName}
            >
              <Plus className="w-4 h-4 mr-2" />
              {editingYarn ? '保存' : '添加'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="线材使用历史"
        size="lg"
      >
        {yarnUsageHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">还没有使用记录</p>
            <p className="text-sm text-gray-400 mt-1">在项目中使用线材后会显示在这里</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[...yarnUsageHistory]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((usage) => {
                const yarn = yarns.find((y) => y.id === usage.yarnId);
                const project = projects.find((p) => p.id === usage.projectId);
                return (
                  <div key={usage.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: yarn?.colorHex || '#ccc' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {yarn?.colorName || usage.yarnId}
                      </p>
                      <p className="text-xs text-gray-500">
                        用于：{project?.name || '未知项目'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">-{usage.weightUsed}g</p>
                      <p className="text-xs text-gray-400">
                        {new Date(usage.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </Modal>
    </div>
  );
}
