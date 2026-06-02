import { useState } from 'react';
import { useAppStore } from '../store';
import { formatDate, getStatusLabel, getStatusColor, getGearCategoryLabel } from '../utils/formatters';
import { 
  Shirt, 
  HardHat, 
  Hand, 
  Footprints, 
  ShieldCheck,
  Plus,
  Calendar,
  Settings,
  X,
  MoreVertical
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  helmet: HardHat,
  jacket: Shirt,
  gloves: Hand,
  pants: Shirt,
  boots: Footprints,
  protection: ShieldCheck,
  other: Settings
};

export default function Gear() {
  const { gears, addGear, updateGear, deleteGear } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newGear, setNewGear] = useState({
    category: 'helmet' as const,
    brand: '',
    model: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'new' as const,
    notes: ''
  });

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'helmet', label: '头盔' },
    { id: 'jacket', label: '骑行服' },
    { id: 'gloves', label: '手套' },
    { id: 'pants', label: '骑行裤' },
    { id: 'boots', label: '骑行靴' },
    { id: 'protection', label: '护具' },
    { id: 'other', label: '其他' },
  ];

  const filteredGears = selectedCategory === 'all' 
    ? gears 
    : gears.filter(g => g.category === selectedCategory);

  const handleAddGear = () => {
    if (newGear.brand && newGear.model) {
      addGear(newGear);
      setShowAddForm(false);
      setNewGear({
        category: 'helmet',
        brand: '',
        model: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'new',
        notes: ''
      });
    }
  };

  const handleStatusChange = (id: string, status: 'new' | 'good' | 'worn' | 'replace') => {
    updateGear(id, { status });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">装备管理</h1>
          <p className="text-dark-300 mt-1">追踪你的骑行装备状态</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加装备
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              console.log('点击分类:', cat.id, cat.label);
              setSelectedCategory(cat.id);
            }}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer relative z-10 ${
              selectedCategory === cat.id
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <Shirt className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{gears.length}</p>
              <p className="text-sm text-dark-400">装备总数</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{gears.filter(g => g.status === 'new' || g.status === 'good').length}</p>
              <p className="text-sm text-dark-400">状态良好</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{gears.filter(g => g.status === 'worn').length}</p>
              <p className="text-sm text-dark-400">有磨损</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{gears.filter(g => g.status === 'replace').length}</p>
              <p className="text-sm text-dark-400">需更换</p>
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4">添加新装备</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">装备分类</label>
              <select
                value={newGear.category}
                onChange={(e) => setNewGear({ ...newGear, category: e.target.value as any })}
                className="input-field"
              >
                <option value="helmet">头盔</option>
                <option value="jacket">骑行服</option>
                <option value="gloves">手套</option>
                <option value="pants">骑行裤</option>
                <option value="boots">骑行靴</option>
                <option value="protection">护具</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="label">品牌</label>
              <input
                type="text"
                value={newGear.brand}
                onChange={(e) => setNewGear({ ...newGear, brand: e.target.value })}
                placeholder="如：SHOEI"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">型号</label>
              <input
                type="text"
                value={newGear.model}
                onChange={(e) => setNewGear({ ...newGear, model: e.target.value })}
                placeholder="如：Z-8"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">购入日期</label>
              <input
                type="date"
                value={newGear.purchaseDate}
                onChange={(e) => setNewGear({ ...newGear, purchaseDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">使用状态</label>
              <select
                value={newGear.status}
                onChange={(e) => setNewGear({ ...newGear, status: e.target.value as any })}
                className="input-field"
              >
                <option value="new">全新</option>
                <option value="good">良好</option>
                <option value="worn">磨损</option>
                <option value="replace">需更换</option>
              </select>
            </div>
            <div>
              <label className="label">备注</label>
              <input
                type="text"
                value={newGear.notes}
                onChange={(e) => setNewGear({ ...newGear, notes: e.target.value })}
                placeholder="可选备注"
                className="input-field"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAddGear} className="btn-primary">
              添加装备
            </button>
            <button 
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {filteredGears.length === 0 ? (
          <div className="col-span-3 card p-12 text-center">
            <Shirt className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">暂无装备记录</p>
            <p className="text-dark-500 text-sm mt-2">添加你的骑行装备开始管理</p>
          </div>
        ) : (
          filteredGears.map((gear, index) => {
            const Icon = categoryIcons[gear.category] || Shirt;
            return (
              <div
                key={gear.id}
                className="card card-hover p-6"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-dark-700 to-dark-800 rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-brand-400" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(gear.status)}`}>
                    {getStatusLabel(gear.status)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">
                  {gear.brand} {gear.model}
                </h3>
                <p className="text-dark-400 text-sm mb-4">
                  {getGearCategoryLabel(gear.category)}
                </p>

                <div className="flex items-center gap-4 text-sm text-dark-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    购入：{formatDate(gear.purchaseDate)}
                  </span>
                </div>

                {gear.notes && (
                  <p className="text-dark-300 text-sm mb-4">{gear.notes}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                  <select
                    value={gear.status}
                    onChange={(e) => handleStatusChange(gear.id, e.target.value as any)}
                    className="input-field text-sm py-1.5 w-32"
                  >
                    <option value="new">全新</option>
                    <option value="good">良好</option>
                    <option value="worn">磨损</option>
                    <option value="replace">需更换</option>
                  </select>
                  <button 
                    onClick={() => deleteGear(gear.id)}
                    className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
