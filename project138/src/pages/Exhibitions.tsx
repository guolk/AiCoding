import { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Landmark,
  Package,
  Sparkles,
  BookOpen,
  Gift,
} from 'lucide-react';
import type { Exhibition, ExhibitionItem, ExhibitionHighlight } from '@/types';
import { useMuseumStore } from '@/store/useMuseumStore';
import Modal from '@/components/Modal';

type FilterTab = 'all' | 'ongoing' | 'ended';

function isOngoing(endDate: string): boolean {
  return new Date(endDate) >= new Date();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function getYearMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

const emptyItem = (): ExhibitionItem => ({
  id: crypto.randomUUID(),
  name: '',
  price: 0,
  photoUrl: '',
  type: 'catalog',
});

const emptyHighlight = (): ExhibitionHighlight => ({
  id: crypto.randomUUID(),
  artifactName: '',
  note: '',
});

export default function Exhibitions() {
  const { exhibitions, addExhibition, deleteExhibition } = useMuseumStore();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    museum: '',
    startDate: '',
    endDate: '',
    isTemporary: false,
    description: '',
    visitId: '',
  });
  const [formItems, setFormItems] = useState<ExhibitionItem[]>([emptyItem()]);
  const [formHighlights, setFormHighlights] = useState<ExhibitionHighlight[]>([emptyHighlight()]);

  const filtered = exhibitions.filter((e) => {
    if (filter === 'ongoing') return isOngoing(e.endDate);
    if (filter === 'ended') return !isOngoing(e.endDate);
    return true;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const handleSubmit = () => {
    if (!form.name.trim() || !form.museum.trim()) return;
    const exhibition: Exhibition = {
      id: crypto.randomUUID(),
      visitId: form.visitId || crypto.randomUUID(),
      name: form.name.trim(),
      museum: form.museum.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      isTemporary: form.isTemporary,
      description: form.description.trim(),
      items: formItems.filter((i) => i.name.trim()),
      highlights: formHighlights.filter((h) => h.artifactName.trim()),
    };
    addExhibition(exhibition);
    closeModal();
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({
      name: '',
      museum: '',
      startDate: '',
      endDate: '',
      isTemporary: false,
      description: '',
      visitId: '',
    });
    setFormItems([emptyItem()]);
    setFormHighlights([emptyHighlight()]);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'ongoing', label: '进行中' },
    { key: 'ended', label: '已结束' },
  ];

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold text-gold-gradient">
            展览追踪
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border-2 border-gold-500/60 px-5 py-2.5 font-medium text-gold-400 transition-all hover:border-gold-400 hover:bg-gold-500/10"
          >
            <Plus size={18} />
            新增展览
          </button>
        </div>

        <div className="mb-8 flex gap-2 rounded-xl border border-gold-500/10 bg-ink-950/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-gold-500/20 text-gold-300 shadow-sm'
                  : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="py-20 text-center">
            <Landmark size={48} className="mx-auto mb-4 text-ink-600" />
            <p className="text-ink-400">暂无展览记录</p>
          </div>
        )}

        <div className="relative">
          {sorted.map((exhibition, idx) => {
            const ongoing = isOngoing(exhibition.endDate);
            const expanded = expandedId === exhibition.id;
            const isLast = idx === sorted.length - 1;

            return (
              <div key={exhibition.id} className="relative flex gap-6">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`z-10 mt-6 flex h-4 w-4 shrink-0 rounded-full border-2 ${
                      ongoing
                        ? 'border-emerald-400 bg-emerald-400/30 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                        : 'border-ink-500 bg-ink-700'
                    }`}
                  />
                  {!isLast && (
                    <div className="w-px flex-1 bg-gradient-to-b from-gold-500/60 to-gold-500/10" />
                  )}
                </div>

                <div className={`mb-8 flex-1 ${isLast ? '' : ''}`}>
                  <div className="mb-1 text-xs font-medium text-gold-500/70">
                    {getYearMonth(exhibition.startDate)}
                  </div>

                  <div
                    onClick={() => toggleExpand(exhibition.id)}
                    className={`card-shine cursor-pointer rounded-xl border transition-all ${
                      ongoing
                        ? 'border-emerald-500/30 hover:border-emerald-400/50'
                        : 'border-ink-600/40 hover:border-ink-500/60'
                    }`}
                  >
                    <div className="px-5 py-4">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="font-serif text-lg font-semibold text-ink-50">
                          {exhibition.name}
                        </h3>
                        <div className="flex shrink-0 items-center gap-2">
                          {exhibition.isTemporary && (
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                              临时
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              ongoing
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-ink-600/40 text-ink-400'
                            }`}
                          >
                            {ongoing ? '进行中' : '已结束'}
                          </span>
                        </div>
                      </div>

                      <div className="mb-2 flex items-center gap-4 text-sm text-ink-300">
                        <span className="flex items-center gap-1.5">
                          <Landmark size={14} className="text-gold-500/60" />
                          {exhibition.museum}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gold-500/60" />
                          {formatDate(exhibition.startDate)} — {formatDate(exhibition.endDate)}
                        </span>
                      </div>

                      {exhibition.description && (
                        <p className="line-clamp-2 text-sm text-ink-400">
                          {exhibition.description}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-3 text-xs text-ink-500">
                          {exhibition.items.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Package size={12} />
                              {exhibition.items.length} 件商品
                            </span>
                          )}
                          {exhibition.highlights.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Sparkles size={12} />
                              {exhibition.highlights.length} 个亮点
                            </span>
                          )}
                        </div>
                        {expanded ? (
                          <ChevronUp size={16} className="text-ink-500" />
                        ) : (
                          <ChevronDown size={16} className="text-ink-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-3 rounded-xl border border-gold-500/10 bg-ink-950/60 p-5">
                      {exhibition.description && (
                        <div className="mb-5">
                          <h4 className="mb-2 text-sm font-semibold text-gold-400">
                            展览简介
                          </h4>
                          <p className="text-sm leading-relaxed text-ink-300">
                            {exhibition.description}
                          </p>
                        </div>
                      )}

                      {exhibition.items.length > 0 && (
                        <div className="mb-5">
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gold-400">
                            <Package size={14} />
                            展览商品
                          </h4>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {exhibition.items.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg border border-gold-500/10 bg-ink-900/60 p-3"
                              >
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="text-sm font-medium text-ink-100">
                                    {item.name}
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                      item.type === 'catalog'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : 'bg-purple-500/20 text-purple-300'
                                    }`}
                                  >
                                    {item.type === 'catalog' ? '图录' : '纪念品'}
                                  </span>
                                </div>
                                <span className="text-sm text-gold-400">
                                  ¥{item.price.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {exhibition.highlights.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gold-400">
                            <Sparkles size={14} />
                            展览亮点
                          </h4>
                          <ul className="space-y-2">
                            {exhibition.highlights.map((hl) => (
                              <li
                                key={hl.id}
                                className="flex items-start gap-3 rounded-lg border border-gold-500/5 bg-ink-900/40 p-3"
                              >
                                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold-500/60" />
                                <div>
                                  <span className="text-sm font-medium text-ink-100">
                                    {hl.artifactName}
                                  </span>
                                  {hl.note && (
                                    <p className="mt-0.5 text-sm text-ink-400">{hl.note}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-end border-t border-gold-500/5 pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteExhibition(exhibition.id);
                            if (expandedId === exhibition.id) setExpandedId(null);
                          }}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                          删除展览
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="新增展览"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-200">
                展览名称 <span className="text-red-400">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-gold-500/20 bg-ink-900/60 px-3 py-2 text-sm text-ink-50 placeholder-ink-600 outline-none focus:border-gold-400/50"
                placeholder="输入展览名称"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-200">
                所属博物馆 <span className="text-red-400">*</span>
              </label>
              <input
                value={form.museum}
                onChange={(e) => setForm((f) => ({ ...f, museum: e.target.value }))}
                className="w-full rounded-lg border border-gold-500/20 bg-ink-900/60 px-3 py-2 text-sm text-ink-50 placeholder-ink-600 outline-none focus:border-gold-400/50"
                placeholder="输入博物馆名称"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-200">
                开始日期
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-lg border border-gold-500/20 bg-ink-900/60 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-400/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-200">
                结束日期
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full rounded-lg border border-gold-500/20 bg-ink-900/60 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-400/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={form.isTemporary}
                onChange={(e) => setForm((f) => ({ ...f, isTemporary: e.target.checked }))}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-ink-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-ink-300 after:transition-all peer-checked:bg-gold-500/60 peer-checked:after:translate-x-full peer-checked:after:bg-gold-300" />
            </label>
            <span className="text-sm text-ink-200">临时展览</span>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">
              展览描述
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-lg border border-gold-500/20 bg-ink-900/60 px-3 py-2 text-sm text-ink-50 placeholder-ink-600 outline-none focus:border-gold-400/50"
              placeholder="输入展览描述..."
            />
          </div>

          <div className="rounded-xl border border-gold-500/10 bg-ink-950/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gold-400">
                <Package size={14} />
                展览商品
              </h4>
              <button
                onClick={() => setFormItems([...formItems, emptyItem()])}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gold-400 transition-colors hover:bg-gold-500/10"
              >
                <Plus size={12} />
                添加商品
              </button>
            </div>
            <div className="space-y-3">
              {formItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-gold-500/5 bg-ink-900/40 p-3"
                >
                  <div className="flex-1 space-y-2">
                    <input
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...formItems];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        setFormItems(updated);
                      }}
                      className="w-full rounded-md border border-gold-500/15 bg-ink-900/60 px-2.5 py-1.5 text-sm text-ink-50 placeholder-ink-600 outline-none focus:border-gold-400/50"
                      placeholder="商品名称"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price || ''}
                        onChange={(e) => {
                          const updated = [...formItems];
                          updated[idx] = { ...updated[idx], price: parseFloat(e.target.value) || 0 };
                          setFormItems(updated);
                        }}
                        className="w-24 rounded-md border border-gold-500/15 bg-ink-900/60 px-2.5 py-1.5 text-sm text-ink-50 placeholder-ink-600 outline-none focus:border-gold-400/50"
                        placeholder="价格"
                      />
                      <select
                        value={item.type}
                        onChange={(e) => {
                          const updated = [...formItems];
                          updated[idx] = { ...updated[idx], type: e.target.value as 'catalog' | 'souvenir' };
                          setFormItems(updated);
                        }}
                        className="rounded-md border border-gold-500/15 bg-ink-900/60 px-2.5 py-1.5 text-sm text-ink-50 outline-none focus:border-gold-400/50"
                      >
                        <option value="catalog">图录</option>
                        <option value="souvenir">纪念品</option>
                      </select>
                    </div>
                  </div>
                  {formItems.length > 1 && (
                    <button
                      onClick={() => setFormItems(formItems.filter((_, i) => i !== idx))}
                      className="mt-1 rounded p-1 text-ink-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gold-500/10 bg-ink-950/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gold-400">
                <Sparkles size={14} />
                展览亮点
              </h4>
              <button
                onClick={() => setFormHighlights([...formHighlights, emptyHighlight()])}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gold-400 transition-colors hover:bg-gold-500/10"
              >
                <Plus size={12} />
                添加亮点
              </button>
            </div>
            <div className="space-y-3">
              {formHighlights.map((hl, idx) => (
                <div
                  key={hl.id}
                  className="flex items-start gap-3 rounded-lg border border-gold-500/5 bg-ink-900/40 p-3"
                >
                  <div className="flex-1 space-y-2">
                    <input
                      value={hl.artifactName}
                      onChange={(e) => {
                        const updated = [...formHighlights];
                        updated[idx] = { ...updated[idx], artifactName: e.target.value };
                        setFormHighlights(updated);
                      }}
                      className="w-full rounded-md border border-gold-500/15 bg-ink-900/60 px-2.5 py-1.5 text-sm text-ink-50 placeholder-ink-600 outline-none focus:border-gold-400/50"
                      placeholder="文物名称"
                    />
                    <input
                      value={hl.note}
                      onChange={(e) => {
                        const updated = [...formHighlights];
                        updated[idx] = { ...updated[idx], note: e.target.value };
                        setFormHighlights(updated);
                      }}
                      className="w-full rounded-md border border-gold-500/15 bg-ink-900/60 px-2.5 py-1.5 text-sm text-ink-50 placeholder-ink-600 outline-none focus:border-gold-400/50"
                      placeholder="备注"
                    />
                  </div>
                  {formHighlights.length > 1 && (
                    <button
                      onClick={() => setFormHighlights(formHighlights.filter((_, i) => i !== idx))}
                      className="mt-1 rounded p-1 text-ink-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gold-500/10 pt-4">
            <button
              onClick={closeModal}
              className="rounded-lg px-5 py-2 text-sm font-medium text-ink-300 transition-colors hover:text-ink-100"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim() || !form.museum.trim()}
              className="gold-gradient rounded-lg px-5 py-2 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              添加展览
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
