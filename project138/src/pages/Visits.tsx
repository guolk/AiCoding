import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, Clock, Ticket, Landmark } from 'lucide-react';
import type { Visit, MuseumType } from '@/types';
import { MUSEUM_TYPE_LABELS } from '@/types';
import { useMuseumStore } from '@/store/useMuseumStore';
import StarRating from '@/components/StarRating';
import TypeBadge from '@/components/TypeBadge';
import Modal from '@/components/Modal';

const TYPES: MuseumType[] = ['art', 'history', 'science', 'nature', 'other'];

const emptyForm = (): Omit<Visit, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  location: '',
  country: '',
  date: '',
  duration: 0,
  ticketPrice: 0,
  rating: 0,
  recommendation: '',
  type: 'art',
  photos: [],
});

export default function Visits() {
  const navigate = useNavigate();
  const { visits, addVisit } = useMuseumStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MuseumType | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [photoCaption, setPhotoCaption] = useState('');

  const filtered = visits.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || v.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    addVisit({
      ...form,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
    setForm(emptyForm());
    setPhotoCaption('');
    setModalOpen(false);
  };

  const addPhoto = () => {
    if (!photoCaption.trim()) return;
    setForm((prev) => ({
      ...prev,
      photos: [
        ...prev.photos,
        { id: crypto.randomUUID(), url: '', caption: photoCaption.trim(), type: 'photo' as const },
      ],
    }));
    setPhotoCaption('');
  };

  const removePhoto = (id: string) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }));
  };

  return (
    <div className="min-h-screen bg-ink-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-serif text-2xl font-bold text-ink-50 sm:text-3xl">
            参观记录
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-gold-500 px-4 py-2 font-medium text-gold-400 transition-colors hover:bg-gold-500/10"
          >
            <Plus size={18} />
            新增参观
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              type="text"
              placeholder="搜索博物馆名称或地点..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gold-500/20 bg-ink-950 py-2.5 pl-10 pr-4 text-sm text-ink-50 placeholder-ink-500 outline-none transition-colors focus:border-gold-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                typeFilter === 'all'
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                  : 'border border-ink-700 text-ink-400 hover:text-ink-50'
              }`}
            >
              全部
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  typeFilter === t
                    ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                    : 'border border-ink-700 text-ink-400 hover:text-ink-50'
                }`}
              >
                {MUSEUM_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ink-500">
            <Landmark size={48} className="mb-4 opacity-40" />
            <p className="text-lg">暂无参观记录</p>
            <p className="mt-1 text-sm">点击"新增参观"添加您的第一条记录</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((visit) => (
              <div
                key={visit.id}
                onClick={() => navigate(`/visits/${visit.id}`)}
                className="card-shine group cursor-pointer overflow-hidden rounded-xl border border-gold-500/10 transition-all duration-300 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/5"
              >
                <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950">
                  <Landmark
                    size={48}
                    className="text-gold-500/30 transition-colors group-hover:text-gold-500/50"
                  />
                  <div className="absolute right-3 top-3">
                    <TypeBadge type={visit.type} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 truncate font-serif text-lg font-semibold text-ink-50 group-hover:text-gold-400">
                    {visit.name}
                  </h3>
                  <div className="mb-3 flex items-center gap-1.5 text-sm text-ink-300">
                    <MapPin size={14} className="shrink-0 text-gold-500/60" />
                    <span className="truncate">{visit.location}</span>
                  </div>
                  <div className="mb-3 flex items-center gap-4 text-xs text-ink-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {visit.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ticket size={12} />
                      ¥{visit.ticketPrice}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <StarRating rating={visit.rating} readonly size={14} />
                    <span className="text-xs text-ink-500">
                      {visit.duration}h
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setForm(emptyForm());
          setPhotoCaption('');
        }}
        title="新增参观记录"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-ink-300">博物馆名称</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-ink-300">地点</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink-300">国家</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm text-ink-300">日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink-300">时长(小时)</label>
              <input
                type="number"
                min={0}
                value={form.duration || ''}
                onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink-300">票价(¥)</label>
              <input
                type="number"
                min={0}
                value={form.ticketPrice || ''}
                onChange={(e) => setForm((p) => ({ ...p, ticketPrice: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-ink-300">评分</label>
              <StarRating
                rating={form.rating}
                onChange={(r) => setForm((p) => ({ ...p, rating: r }))}
                size={22}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink-300">类型</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as MuseumType }))}
                className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {MUSEUM_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-300">推荐语</label>
            <textarea
              rows={3}
              value={form.recommendation}
              onChange={(e) => setForm((p) => ({ ...p, recommendation: e.target.value }))}
              className="w-full resize-none rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-300">照片/速写</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="输入照片说明..."
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                className="flex-1 rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
              />
              <button
                type="button"
                onClick={addPhoto}
                className="rounded-lg border border-gold-500/30 px-3 py-2 text-sm text-gold-400 transition-colors hover:bg-gold-500/10"
              >
                <Plus size={16} />
              </button>
            </div>
            {form.photos.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {form.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex items-center justify-between rounded-lg border border-gold-500/10 bg-ink-950/50 px-3 py-1.5 text-sm"
                  >
                    <span className="text-ink-300">{photo.caption}</span>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="text-ink-500 transition-colors hover:text-crimson-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setForm(emptyForm());
                setPhotoCaption('');
              }}
              className="rounded-lg px-4 py-2 text-sm text-ink-400 transition-colors hover:text-ink-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-gold-500/20 px-4 py-2 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/30"
            >
              添加
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
