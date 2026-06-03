import { useState } from 'react';
import { Baby, MapPin, Plus, Search, Pencil, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react';
import type { Medicine } from '@/types';
import { MEDICINE_TYPE_LABELS } from '@/types';
import { useAppStore } from '@/store';
import { getExpiryStatus, getDaysUntilExpiry, getExpiryStatusBgColor, getExpiryStatusLabel, generateId } from '@/utils/helpers';

type TabKey = 'list' | 'children' | 'location';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'list', label: '药品清单' },
  { key: 'children', label: '儿童药品' },
  { key: 'location', label: '存放位置' },
];

type TypeFilter = 'all' | 'prescription' | 'otc';

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'prescription', label: '处方药' },
  { key: 'otc', label: 'OTC' },
];

interface MedicineFormData {
  name: string;
  type: Medicine['type'];
  isChildren: boolean;
  dosage: string;
  expiryDate: string;
  location: string;
  locationDetail: string;
  purpose: string;
  quantity: number;
  safeQuantity: number;
}

const initialFormData: MedicineFormData = {
  name: '',
  type: 'otc',
  isChildren: false,
  dosage: '',
  expiryDate: '',
  location: '',
  locationDetail: '',
  purpose: '',
  quantity: 0,
  safeQuantity: 0,
};

function ExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const status = getExpiryStatus(expiryDate);
  const days = getDaysUntilExpiry(expiryDate);
  const label = getExpiryStatusLabel(status);
  const bg = getExpiryStatusBgColor(status);
  const textColor: Record<string, string> = {
    expired: 'text-red-700',
    urgent: 'text-red-600',
    warning: 'text-amber-700',
    normal: 'text-emerald-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${bg} ${textColor[status]}`}>
      {label}
      {status !== 'normal' && <span className="opacity-75">({days}天)</span>}
    </span>
  );
}

function MedicineModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Medicine | null;
}) {
  const { addMedicine, updateMedicine } = useAppStore();
  const [form, setForm] = useState<MedicineFormData>(() =>
    editing
      ? {
          name: editing.name,
          type: editing.type,
          isChildren: editing.isChildren,
          dosage: editing.dosage,
          expiryDate: editing.expiryDate,
          location: editing.location,
          locationDetail: editing.locationDetail,
          purpose: editing.purpose,
          quantity: editing.quantity,
          safeQuantity: editing.safeQuantity,
        }
      : initialFormData
  );

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMedicine(editing.id, { ...form });
    } else {
      addMedicine({ ...form });
    }
    onClose();
  };

  const set = <K extends keyof MedicineFormData>(key: K, value: MedicineFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{editing ? '编辑药品' : '添加药品'}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">名称</label>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-600">类型</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value as Medicine['type'])}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="prescription">处方药</option>
                <option value="otc">非处方药(OTC)</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.isChildren}
                  onChange={(e) => set('isChildren', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Baby size={16} className="text-pink-500" />
                儿童药
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">剂量</label>
            <input
              required
              value={form.dosage}
              onChange={(e) => set('dosage', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-600">存放位置</label>
              <input
                required
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-600">位置详情</label>
              <input
                value={form.locationDetail}
                onChange={(e) => set('locationDetail', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">用途</label>
            <input
              value={form.purpose}
              onChange={(e) => set('purpose', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-600">有效期</label>
              <input
                type="date"
                required
                value={form.expiryDate}
                onChange={(e) => set('expiryDate', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-sm font-medium text-gray-600">数量</label>
              <input
                type="number"
                min={0}
                required
                value={form.quantity}
                onChange={(e) => set('quantity', Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-sm font-medium text-gray-600">安全量</label>
              <input
                type="number"
                min={0}
                required
                value={form.safeQuantity}
                onChange={(e) => set('safeQuantity', Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              {editing ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MedicineListTab() {
  const { medicines, deleteMedicine } = useAppStore();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);

  const filtered = medicines.filter((m) => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleEdit = (m: Medicine) => {
    setEditing(m);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                typeFilter === f.key ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索药品名称..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus size={16} />
          添加药品
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">类型</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">儿童药</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">剂量</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">有效期</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">存放位置</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">数量/安全量</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      m.type === 'prescription' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {MEDICINE_TYPE_LABELS[m.type]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {m.isChildren ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                      <Baby size={12} />
                      儿童
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{m.dosage}</td>
                <td className="px-4 py-3 text-gray-600">{m.expiryDate}</td>
                <td className="px-4 py-3">
                  <div className="text-gray-700">{m.location}</div>
                  {m.locationDetail && <div className="text-xs text-gray-400">{m.locationDetail}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={m.quantity < m.safeQuantity ? 'font-medium text-red-600' : 'text-gray-700'}>
                    {m.quantity}
                  </span>
                  <span className="text-gray-400"> / {m.safeQuantity}</span>
                </td>
                <td className="px-4 py-3">
                  <ExpiryBadge expiryDate={m.expiryDate} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(m)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => deleteMedicine(m.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-400">
                  暂无药品数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MedicineModal open={modalOpen} onClose={handleClose} editing={editing} />
    </div>
  );
}

function ChildrenMedicineTab() {
  const { medicines } = useAppStore();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const childrenMedicines = medicines.filter((m) => {
    if (!m.isChildren) return false;
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              typeFilter === f.key ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {childrenMedicines.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-pink-200 bg-gradient-to-br from-white to-pink-50/30 p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between">
              <h4 className="font-semibold text-gray-800">{m.name}</h4>
              <Baby size={18} className="mt-0.5 shrink-0 text-pink-500" />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  m.type === 'prescription' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {MEDICINE_TYPE_LABELS[m.type]}
              </span>
              <span className="inline-block rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                儿童药
              </span>
            </div>
            <div className="space-y-1.5 text-sm text-gray-600">
              <div>剂量：{m.dosage}</div>
              <div>有效期：{m.expiryDate}</div>
              <div>
                <ExpiryBadge expiryDate={m.expiryDate} />
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={13} className="text-gray-400" />
                {m.location}
                {m.locationDetail && <span className="text-gray-400"> · {m.locationDetail}</span>}
              </div>
            </div>
          </div>
        ))}
        {childrenMedicines.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400">暂无儿童药品</div>
        )}
      </div>
    </div>
  );
}

function LocationTab() {
  const { medicines } = useAppStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const grouped: Record<string, Record<string, Medicine[]>> = {};
  medicines.forEach((m) => {
    if (!grouped[m.location]) grouped[m.location] = {};
    const detail = m.locationDetail || '未分类';
    if (!grouped[m.location][detail]) grouped[m.location][detail] = [];
    grouped[m.location][detail].push(m);
  });

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([location, details]) => {
        const total = Object.values(details).flat().length;
        const locKey = location;
        const isOpen = expanded[locKey] !== false;

        return (
          <div key={locKey} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              onClick={() => toggle(locKey)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
            >
              {isOpen ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
              <MapPin size={18} className="text-primary" />
              <span className="font-semibold text-gray-800">{location}</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {total}
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                {Object.entries(details).map(([detail, items]) => (
                  <div key={detail} className="border-b border-gray-100 last:border-b-0">
                    <div className="px-5 py-2 text-sm font-medium text-gray-500 bg-gray-50">
                      └ {detail}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {items.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/80">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{m.name}</span>
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  m.type === 'prescription' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {MEDICINE_TYPE_LABELS[m.type]}
                              </span>
                              {m.isChildren && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                                  <Baby size={10} />
                                  儿童
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 text-xs text-gray-400">
                              {m.dosage} · 数量 {m.quantity}/{m.safeQuantity}
                            </div>
                          </div>
                          <ExpiryBadge expiryDate={m.expiryDate} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {Object.keys(grouped).length === 0 && (
        <div className="py-12 text-center text-gray-400">暂无药品数据</div>
      )}
    </div>
  );
}

export default function MedicinePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('list');

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">药品分类管理</h1>

      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'list' && <MedicineListTab />}
      {activeTab === 'children' && <ChildrenMedicineTab />}
      {activeTab === 'location' && <LocationTab />}
    </div>
  );
}
