import { useState, useMemo } from 'react';
import {
  Coffee,
  Building2,
  Library,
  MoreHorizontal,
  Zap,
  Volume2,
  DollarSign,
  Briefcase,
  MapPin,
  Laptop,
  Wifi,
  Wrench,
  FileText,
  Check,
  Plus,
  X,
  Filter,
} from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useCityStore } from '@/store/cityStore';
import { getCityById } from '@/data/cities';
import { cn } from '@/lib/utils';
import type { WorkspaceType, ChecklistItem } from '@/types';

type TabKey = 'workspaces' | 'checklist';
type TypeFilter = 'all' | WorkspaceType;

const TYPE_OPTIONS: { key: TypeFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: '全部', icon: <Filter className="h-4 w-4" /> },
  { key: 'cafe', label: '咖啡馆', icon: <Coffee className="h-4 w-4" /> },
  { key: 'coworking', label: '共享办公', icon: <Building2 className="h-4 w-4" /> },
  { key: 'library', label: '图书馆', icon: <Library className="h-4 w-4" /> },
];

const TYPE_META: Record<WorkspaceType, { label: string; icon: React.ReactNode; color: string }> = {
  cafe: {
    label: '咖啡馆',
    icon: <Coffee className="h-5 w-5" />,
    color: 'bg-amber-100 text-amber-700',
  },
  coworking: {
    label: '共享办公',
    icon: <Building2 className="h-5 w-5" />,
    color: 'bg-teal-100 text-teal-700',
  },
  library: {
    label: '图书馆',
    icon: <Library className="h-5 w-5" />,
    color: 'bg-indigo-100 text-indigo-700',
  },
  other: {
    label: '其他',
    icon: <MoreHorizontal className="h-5 w-5" />,
    color: 'bg-slate-100 text-slate-700',
  },
};

const CHECKLIST_CATEGORIES: {
  key: ChecklistItem['category'];
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: 'hardware', label: '硬件设备', icon: <Laptop className="h-5 w-5" /> },
  { key: 'network', label: '网络连接', icon: <Wifi className="h-5 w-5" /> },
  { key: 'software', label: '软件工具', icon: <Wrench className="h-5 w-5" /> },
  { key: 'documents', label: '证件文件', icon: <FileText className="h-5 w-5" /> },
];

const CATEGORY_COLORS: Record<ChecklistItem['category'], string> = {
  hardware: 'bg-blue-500',
  network: 'bg-emerald-500',
  software: 'bg-purple-500',
  documents: 'bg-amber-500',
  other: 'bg-slate-500',
};

function RatingBar({ value, icon, label, color }: { value: number; icon: React.ReactNode; label: string; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-xs font-semibold text-slate-700">{value}/10</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

function WorkspaceCard({ ws }: { ws: import('@/types').Workspace }) {
  const city = getCityById(ws.cityId);
  const meta = TYPE_META[ws.type];
  const avgScore = Math.round(
    ((ws.internetSpeed + ws.noiseLevel + ws.priceLevel + ws.workFriendly) / 4) * 10
  ) / 10;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2.5 rounded-xl', meta.color)}>
            {meta.icon}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{ws.name}</h4>
            <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
              <span>{city?.flag}</span>
              <span>{city?.name}</span>
              <span>·</span>
              <span>{meta.label}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">{avgScore}</div>
          <div className="text-xs text-slate-500">综合评分</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <RatingBar
          value={ws.internetSpeed}
          icon={<Zap className="h-3.5 w-3.5" />}
          label="网速"
          color="bg-teal-500"
        />
        <RatingBar
          value={11 - ws.noiseLevel}
          icon={<Volume2 className="h-3.5 w-3.5" />}
          label="安静度"
          color="bg-indigo-500"
        />
        <RatingBar
          value={11 - ws.priceLevel}
          icon={<DollarSign className="h-3.5 w-3.5" />}
          label="性价比"
          color="bg-amber-500"
        />
        <RatingBar
          value={ws.workFriendly}
          icon={<Briefcase className="h-3.5 w-3.5" />}
          label="工作友好度"
          color="bg-rose-500"
        />
      </div>

      {ws.address && (
        <div className="flex items-start gap-1.5 text-sm text-slate-600 mb-2">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
          <span>{ws.address}</span>
        </div>
      )}
      {ws.notes && (
        <p className="text-sm text-slate-500 italic mt-2 pt-2 border-t border-slate-100">
          "{ws.notes}"
        </p>
      )}
    </div>
  );
}

function WorkspacesTab() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const cities = useCityStore((s) => s.cities);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  const availableCities = useMemo(() => {
    const cityIds = new Set(workspaces.map((w) => w.cityId));
    return cities.filter((c) => cityIds.has(c.id));
  }, [workspaces, cities]);

  const filtered = useMemo(() => {
    return workspaces.filter((w) => {
      if (typeFilter !== 'all' && w.type !== typeFilter) return false;
      if (cityFilter !== 'all' && w.cityId !== cityFilter) return false;
      return true;
    });
  }, [workspaces, typeFilter, cityFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTypeFilter(opt.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                typeFilter === opt.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">全部城市</option>
          {availableCities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Coffee className="h-12 w-12 mb-4 opacity-30" />
          <p>暂无符合条件的工作空间</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ws) => (
            <WorkspaceCard key={ws.id} ws={ws} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryProgress({
  category,
  items,
}: {
  category: (typeof CHECKLIST_CATEGORIES)[number];
  items: ChecklistItem[];
}) {
  const toggleChecklist = useWorkspaceStore((s) => s.toggleChecklist);
  const total = items.length;
  const checked = items.filter((i) => i.checked).length;
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'p-2 rounded-lg text-white',
                CATEGORY_COLORS[category.key]
              )}
            >
              {category.icon}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">{category.label}</h4>
              <p className="text-xs text-slate-500">
                {checked}/{total} 已完成
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-900">{percent}%</span>
          </div>
        </div>
        <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', CATEGORY_COLORS[category.key])}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <button
              type="button"
              onClick={() => toggleChecklist(item.id)}
              className={cn(
                'h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                item.checked
                  ? 'bg-teal-500 border-teal-500 text-white'
                  : 'border-slate-300 hover:border-teal-400'
              )}
            >
              {item.checked && <Check className="h-3.5 w-3.5" />}
            </button>
            <span
              className={cn(
                'text-sm transition-all',
                item.checked ? 'text-slate-400 line-through' : 'text-slate-700'
              )}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ChecklistTab() {
  const checklist = useWorkspaceStore((s) => s.checklist);
  const addChecklist = useWorkspaceStore((s) => s.addChecklist);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    label: '',
    category: 'hardware' as ChecklistItem['category'],
  });

  const grouped = useMemo(() => {
    const g: Record<string, ChecklistItem[]> = {};
    checklist.forEach((item) => {
      if (!g[item.category]) g[item.category] = [];
      g[item.category].push(item);
    });
    return g;
  }, [checklist]);

  const total = checklist.length;
  const checked = checklist.filter((i) => i.checked).length;
  const overallPercent = total === 0 ? 0 : Math.round((checked / total) * 100);

  const handleSubmit = () => {
    if (!form.label.trim()) return;
    addChecklist({ ...form, checked: false });
    setShowModal(false);
    setForm({ label: '', category: 'hardware' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-semibold">准备进度总览</h3>
            <p className="text-teal-100 mt-1">
              已完成 {checked} / {total} 项
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{overallPercent}%</div>
            <div className="text-teal-100 text-sm">总完成度</div>
          </div>
        </div>
        <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-teal-700 rounded-xl hover:bg-teal-50 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            添加新项
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CHECKLIST_CATEGORIES.map((cat) => (
          <CategoryProgress
            key={cat.key}
            category={cat}
            items={grouped[cat.key] ?? []}
          />
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">添加清单项</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  项目名称
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="例如：便携键盘"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">分类</label>
                <div className="grid grid-cols-2 gap-2">
                  {CHECKLIST_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.key })}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors text-left',
                        form.category === cat.key
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      )}
                    >
                      <div
                        className={cn(
                          'p-1.5 rounded-lg text-white',
                          CATEGORY_COLORS[cat.key]
                        )}
                      >
                        {cat.icon}
                      </div>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.label.trim()}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'workspaces', label: '工作空间评测', icon: <Coffee className="h-4 w-4" /> },
  { key: 'checklist', label: '基础设施清单', icon: <Check className="h-4 w-4" /> },
];

export default function Workspace() {
  const [activeTab, setActiveTab] = useState<TabKey>('workspaces');

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">工作环境管理</h1>
          <p className="text-slate-600 mt-1">评测城市工作空间，管理你的装备清单</p>
        </div>

        <div className="mb-6 flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'workspaces' && <WorkspacesTab />}
        {activeTab === 'checklist' && <ChecklistTab />}
      </div>
    </div>
  );
}
