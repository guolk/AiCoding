import { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Globe,
  MapPin,
  Clock,
  Bell,
} from 'lucide-react';
import { useMuseumStore } from '@/store/useMuseumStore';
import type { WishlistItem, TripPlan, ExhibitionReminder, MuseumType } from '@/types';
import TypeBadge from '@/components/TypeBadge';
import Modal from '@/components/Modal';

type Tab = 'wishlist' | 'trips' | 'reminders';

export default function Wishlist() {
  const [activeTab, setActiveTab] = useState<Tab>('wishlist');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'global' | 'domestic'>('all');

  const {
    wishlist,
    tripPlans,
    exhibitionReminders,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    addTripPlan,
    deleteTripPlan,
    addExhibitionReminder,
    deleteExhibitionReminder,
  } = useMuseumStore();

  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingWishlistItem, setEditingWishlistItem] = useState<WishlistItem | null>(null);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'wishlist', label: '博物馆清单', icon: <MapPin size={18} /> },
    { key: 'trips', label: '旅行规划', icon: <Calendar size={18} /> },
    { key: 'reminders', label: '特展提醒', icon: <Bell size={18} /> },
  ];

  const filteredWishlist = wishlist
    .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
    .sort((a, b) => a.priority - b.priority);

  const sortedReminders = [...exhibitionReminders].sort(
    (a, b) => new Date(a.openDate).getTime() - new Date(b.openDate).getTime()
  );

  return (
    <div className="min-h-screen bg-ink-900">
      <div className="border-b border-gold-500/10 bg-ink-900/50 px-8 py-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink-50">愿望清单</h1>
            <p className="mt-1 text-sm text-ink-300">规划你的文化探索之旅</p>
          </div>
          <button
            onClick={() => {
              setEditingWishlistItem(null);
              if (activeTab === 'wishlist') setShowWishlistModal(true);
              else if (activeTab === 'trips') setShowTripModal(true);
              else setShowReminderModal(true);
            }}
            className="flex items-center gap-2 rounded-lg border border-gold-500/40 px-4 py-2 text-sm font-medium text-gold-400 transition-all hover:bg-gold-500/10"
          >
            <Plus size={18} />
            {activeTab === 'wishlist' ? '添加博物馆' : activeTab === 'trips' ? '添加行程' : '添加提醒'}
          </button>
        </div>

        <div className="mt-6 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gold-500/15 text-gold-400 shadow-inner'
                  : 'text-ink-300 hover:bg-gold-500/5 hover:text-gold-500/80'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {activeTab === 'wishlist' && (
          <MuseumWishlistTab
            items={filteredWishlist}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            onEdit={(item) => {
              setEditingWishlistItem(item);
              setShowWishlistModal(true);
            }}
            onDelete={deleteWishlistItem}
          />
        )}
        {activeTab === 'trips' && (
          <TripsTab trips={tripPlans} wishlist={wishlist} onAdd={() => setShowTripModal(true)} onDelete={deleteTripPlan} />
        )}
        {activeTab === 'reminders' && (
          <RemindersTab reminders={sortedReminders} onDelete={deleteExhibitionReminder} />
        )}
      </div>

      <WishlistModal
        isOpen={showWishlistModal}
        onClose={() => {
          setShowWishlistModal(false);
          setEditingWishlistItem(null);
        }}
        item={editingWishlistItem}
        onSave={(item) => {
          if (editingWishlistItem) {
            updateWishlistItem(editingWishlistItem.id, item);
          } else {
            addWishlistItem({ ...item, id: crypto.randomUUID() } as WishlistItem);
          }
          setShowWishlistModal(false);
          setEditingWishlistItem(null);
        }}
      />

      <TripModal
        isOpen={showTripModal}
        onClose={() => setShowTripModal(false)}
        wishlist={wishlist}
        onSave={(trip) => {
          addTripPlan({ ...trip, id: crypto.randomUUID() } as TripPlan);
          setShowTripModal(false);
        }}
      />

      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSave={(reminder) => {
          addExhibitionReminder({ ...reminder, id: crypto.randomUUID() } as ExhibitionReminder);
          setShowReminderModal(false);
        }}
      />
    </div>
  );
}

function MuseumWishlistTab({
  items,
  categoryFilter,
  onCategoryFilterChange,
  onEdit,
  onDelete,
}: {
  items: WishlistItem[];
  categoryFilter: 'all' | 'global' | 'domestic';
  onCategoryFilterChange: (v: 'all' | 'global' | 'domestic') => void;
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(['all', 'global', 'domestic'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryFilterChange(cat)}
            className={`rounded-lg px-4 py-1.5 text-sm transition-all ${
              categoryFilter === cat
                ? 'bg-gold-500/15 text-gold-400'
                : 'bg-ink-800/50 text-ink-300 hover:bg-gold-500/5'
            }`}
          >
            {cat === 'all' ? '全部' : cat === 'global' ? '全球' : '国内'}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="card-shine flex flex-col items-center justify-center rounded-2xl border border-gold-500/10 py-16 text-center">
          <MapPin className="mb-4 h-16 w-16 text-ink-600" />
          <p className="font-serif text-xl text-ink-200">愿望清单还是空的</p>
          <p className="mt-2 text-ink-400">添加你想去的博物馆吧</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="card-shine group flex items-start gap-4 rounded-xl border border-gold-500/10 p-4 transition-all hover:border-gold-500/20"
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-lg font-bold text-gold-400"
              >
                {item.priority}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-serif text-lg font-semibold text-ink-50">{item.name}</h3>
                  <TypeBadge type={item.type} />
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      item.category === 'global' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                    }`}
                  >
                    {item.category === 'global' ? '全球' : '国内'}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-ink-400">
                  <Globe size={14} />
                  <span>{item.country}</span>
                  <span className="text-ink-600">·</span>
                  <MapPin size={14} />
                  <span>{item.location}</span>
                </div>
                {item.notes && (
                  <p className="mt-2 line-clamp-1 text-sm text-ink-300">{item.notes}</p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => onEdit(item)}
                  className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-gold-500/10 hover:text-gold-400"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-crimson-500/10 hover:text-crimson-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TripsTab({
  trips,
  wishlist,
  onDelete,
}: {
  trips: TripPlan[];
  wishlist: WishlistItem[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  const getMuseumName = (id: string) => wishlist.find((w) => w.id === id)?.name || '未知';

  return (
    <div>
      {trips.length === 0 ? (
        <div className="card-shine flex flex-col items-center justify-center rounded-2xl border border-gold-500/10 py-16 text-center">
          <Calendar className="mb-4 h-16 w-16 text-ink-600" />
          <p className="font-serif text-xl text-ink-200">还没有规划旅行</p>
          <p className="mt-2 text-ink-400">开始规划你的文化之旅吧</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-gold-500/40 via-gold-500/20 to-transparent" />
          <div className="space-y-6 pl-16">
            {trips.map((trip) => (
              <div key={trip.id} className="relative">
                <div className="absolute -left-[57px] top-4 h-5 w-5 rounded-full border-2 border-gold-500 bg-ink-900" />
                <div className="card-shine group rounded-xl border border-gold-500/10 p-5 transition-all hover:border-gold-500/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-ink-50">{trip.name}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-ink-400">
                        <Calendar size={14} />
                        <span>
                          {trip.startDate} - {trip.endDate}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(trip.id)}
                      className="rounded-lg p-2 text-ink-400 opacity-0 transition-all hover:bg-crimson-500/10 hover:text-crimson-400 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {trip.museumIds.map((mid) => (
                      <div
                        key={mid}
                        className="flex items-center gap-1 rounded-full bg-ink-800/50 px-3 py-1 text-xs text-ink-200"
                      >
                        <MapPin size={12} />
                        {getMuseumName(mid)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RemindersTab({
  reminders,
  onDelete,
}: {
  reminders: ExhibitionReminder[];
  onDelete: (id: string) => void;
}) {
  const getDaysRemaining = (openDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const open = new Date(openDate);
    open.setHours(0, 0, 0, 0);
    return Math.ceil((open.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reminders.length === 0 ? (
        <div className="card-shine col-span-full flex flex-col items-center justify-center rounded-2xl border border-gold-500/10 py-16 text-center">
          <Bell className="mb-4 h-16 w-16 text-ink-600" />
          <p className="font-serif text-xl text-ink-200">没有特展提醒</p>
          <p className="mt-2 text-ink-400">添加你关注的特别展览吧</p>
        </div>
      ) : (
        reminders.map((reminder) => {
          const days = getDaysRemaining(reminder.openDate);
          const isUrgent = days <= 30 && days >= 0;
          const isOpened = days < 0;

          return (
            <div
              key={reminder.id}
              className={`card-shine group relative rounded-xl border p-5 transition-all hover:scale-[1.02] ${
                isUrgent
                  ? 'border-gold-500/50 shadow-[0_0_30px_rgba(201,169,110,0.1)]'
                  : 'border-gold-500/10'
              } ${isOpened ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => onDelete(reminder.id)}
                className="absolute right-2 top-2 rounded-lg p-1.5 text-ink-500 opacity-0 transition-all hover:bg-crimson-500/10 hover:text-crimson-400 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>

              <div className="mb-4 text-center">
                <div
                  className={`text-5xl font-bold ${
                    isOpened ? 'text-ink-500' : isUrgent ? 'text-gold-gradient' : 'text-ink-200'
                  }`}
                >
                  {isOpened ? '已开放' : Math.abs(days)}
                </div>
                <div className="mt-1 text-sm text-ink-400">
                  {isOpened ? '' : days === 0 ? '今天开放' : '天后开放'}
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-serif text-lg font-semibold text-ink-50">{reminder.exhibitionName}</h3>
                <p className="mt-1 text-sm text-ink-400">@{reminder.museum}</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-ink-500">
                  <Calendar size={12} />
                  <span>{reminder.openDate}</span>
                </div>
                {reminder.notes && <p className="mt-2 line-clamp-2 text-xs text-ink-400">{reminder.notes}</p>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function WishlistModal({
  isOpen,
  onClose,
  item,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: WishlistItem | null;
  onSave: (item: Partial<WishlistItem>) => void;
}) {
  const [form, setForm] = useState<Partial<WishlistItem>>({
    name: '',
    location: '',
    country: '',
    priority: 5,
    type: 'art',
    category: 'global',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? '编辑博物馆' : '添加博物馆'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-200">博物馆名称 *</label>
          <input
            type="text"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
            placeholder="例如：大英博物馆"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-200">国家 *</label>
            <input
              type="text"
              value={form.country || ''}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
              placeholder="例如：英国"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-200">城市 *</label>
            <input
              type="text"
              value={form.location || ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
              placeholder="例如：伦敦"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-200">类型</label>
            <select
              value={form.type || 'art'}
              onChange={(e) => setForm({ ...form, type: e.target.value as MuseumType })}
              className="w-full rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
            >
              <option value="art">艺术</option>
              <option value="history">历史</option>
              <option value="science">科学</option>
              <option value="nature">自然</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-200">优先级 (1=最高)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={form.priority || 5}
              onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-200">分类</label>
          <div className="flex gap-2">
            {(['global', 'domestic'] as const).map((cat) => (
              <label
                key={cat}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-all ${
                  form.category === cat
                    ? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
                    : 'border-gold-500/10 bg-ink-800/30 text-ink-300 hover:border-gold-500/20'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={form.category === cat}
                  onChange={() => setForm({ ...form, category: cat })}
                  className="hidden"
                />
                {cat === 'global' ? '全球' : '国内'}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-200">备注</label>
          <textarea
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
            placeholder="为什么想去？有什么特别想看的？"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-ink-300 hover:bg-ink-800"
          >
            取消
          </button>
          <button
            type="submit"
            className="gold-gradient rounded-lg px-6 py-2 text-sm font-medium text-ink-950"
          >
            {item ? '保存' : '添加'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TripModal({
  isOpen,
  onClose,
  wishlist,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  wishlist: WishlistItem[];
  onSave: (trip: Partial<TripPlan>) => void;
}) {
  const [form, setForm] = useState<Partial<TripPlan>>({
    name: '',
    startDate: '',
    endDate: '',
    museumIds: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const toggleMuseum = (id: string) => {
    setForm({
      ...form,
      museumIds: form.museumIds?.includes(id)
        ? form.museumIds.filter((m) => m !== id)
        : [...(form.museumIds || []), id],
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="添加旅行规划">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-200">旅行名称 *</label>
          <input
            type="text"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
            placeholder="例如：意大利艺术之旅"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-200">开始日期 *</label>
            <input
              type="date"
              value={form.startDate || ''}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-200">结束日期 *</label>
            <input
              type="date"
              value={form.endDate || ''}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-200">选择博物馆</label>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gold-500/10 bg-ink-800/20 p-2">
            {wishlist.length === 0 ? (
              <p className="p-4 text-center text-sm text-ink-500">请先添加愿望清单</p>
            ) : (
              wishlist.map((item) => (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors ${
                    form.museumIds?.includes(item.id) ? 'bg-gold-500/10' : 'hover:bg-ink-800/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.museumIds?.includes(item.id)}
                    onChange={() => toggleMuseum(item.id)}
                    className="h-4 w-4 rounded border-gold-500/50 bg-ink-800 text-gold-500 focus:ring-gold-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-ink-200">{item.name}</div>
                    <div className="text-xs text-ink-500">{item.country} · {item.location}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-ink-300 hover:bg-ink-800"
          >
            取消
          </button>
          <button
            type="submit"
            className="gold-gradient rounded-lg px-6 py-2 text-sm font-medium text-ink-950"
          >
            添加
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ReminderModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Partial<ExhibitionReminder>) => void;
}) {
  const [form, setForm] = useState<Partial<ExhibitionReminder>>({
    exhibitionName: '',
    museum: '',
    openDate: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="添加特展提醒">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-200">展览名称 *</label>
          <input
            type="text"
            value={form.exhibitionName || ''}
            onChange={(e) => setForm({ ...form, exhibitionName: e.target.value })}
            className="w-full rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
            placeholder="例如：从波提切利到梵高"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-200">博物馆 *</label>
          <input
            type="text"
            value={form.museum || ''}
            onChange={(e) => setForm({ ...form, museum: e.target.value })}
            className="w-full rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
            placeholder="例如：上海博物馆"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-200">开放日期 *</label>
          <input
            type="date"
            value={form.openDate || ''}
            onChange={(e) => setForm({ ...form, openDate: e.target.value })}
            className="w-full rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-200">备注</label>
          <textarea
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full resize-none rounded-lg border border-gold-500/20 bg-ink-800/50 px-4 py-2.5 text-ink-100 focus:border-gold-500/50 focus:outline-none"
            placeholder="为什么想看这个展览？"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-ink-300 hover:bg-ink-800"
          >
            取消
          </button>
          <button
            type="submit"
            className="gold-gradient rounded-lg px-6 py-2 text-sm font-medium text-ink-950"
          >
            添加
          </button>
        </div>
      </form>
    </Modal>
  );
}
