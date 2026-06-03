import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Ticket,
  Globe,
  Calendar,
  Pencil,
  Trash2,
  Landmark,
  Image as ImageIcon,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import type { MuseumType } from '@/types';
import { MUSEUM_TYPE_LABELS } from '@/types';
import { useMuseumStore } from '@/store/useMuseumStore';
import StarRating from '@/components/StarRating';
import TypeBadge from '@/components/TypeBadge';
import Modal from '@/components/Modal';

const TYPES: MuseumType[] = ['art', 'history', 'science', 'nature', 'other'];

export default function VisitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { visits, exhibitions, learningNotes, updateVisit, deleteVisit, updateLearningNote, deleteExhibition } = useMuseumStore();

  const visit = visits.find((v) => v.id === id);
  const relatedExhibitions = exhibitions.filter((e) => e.visitId === id);
  const relatedNotes = learningNotes.filter((n) => n.visitId === id);
  const hasAssociations = relatedExhibitions.length > 0 || relatedNotes.length > 0;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState(
    visit
      ? {
          name: visit.name,
          location: visit.location,
          country: visit.country,
          date: visit.date,
          duration: visit.duration,
          ticketPrice: visit.ticketPrice,
          rating: visit.rating,
          recommendation: visit.recommendation,
          type: visit.type,
          photos: [...visit.photos],
        }
      : null
  );

  const [photoCaption, setPhotoCaption] = useState('');

  if (!visit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-900">
        <div className="text-center">
          <Landmark size={48} className="mx-auto mb-4 text-ink-600" />
          <p className="text-lg text-ink-400">未找到该参观记录</p>
          <button
            onClick={() => navigate('/visits')}
            className="mt-4 text-sm text-gold-400 hover:underline"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const handleUpdate = () => {
    if (!form || !form.name.trim()) return;
    updateVisit(visit.id, form);
    setEditOpen(false);
    setPhotoCaption('');
  };

  const handleDelete = () => {
    if (hasAssociations) return;
    deleteVisit(visit.id);
    navigate('/visits');
  };

  const handleUnlinkNote = (noteId: string) => {
    updateLearningNote(noteId, { visitId: undefined });
  };

  const handleDeleteExhibition = (exhibitionId: string) => {
    deleteExhibition(exhibitionId);
  };

  const addPhoto = () => {
    if (!form || !photoCaption.trim()) return;
    setForm((prev) => ({
      ...prev!,
      photos: [
        ...prev!.photos,
        { id: crypto.randomUUID(), url: '', caption: photoCaption.trim(), type: 'photo' as const },
      ],
    }));
    setPhotoCaption('');
  };

  const removePhoto = (pid: string) => {
    setForm((prev) => ({
      ...prev!,
      photos: prev!.photos.filter((p) => p.id !== pid),
    }));
  };

  const openEdit = () => {
    setForm({
      name: visit.name,
      location: visit.location,
      country: visit.country,
      date: visit.date,
      duration: visit.duration,
      ticketPrice: visit.ticketPrice,
      rating: visit.rating,
      recommendation: visit.recommendation,
      type: visit.type,
      photos: [...visit.photos],
    });
    setPhotoCaption('');
    setEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-ink-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/visits')}
            className="inline-flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-gold-400"
          >
            <ArrowLeft size={18} />
            返回列表
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={openEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold-500/20 px-3 py-1.5 text-sm text-gold-400 transition-colors hover:bg-gold-500/10"
            >
              <Pencil size={14} />
              编辑
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-crimson-500/20 px-3 py-1.5 text-sm text-crimson-400 transition-colors hover:bg-crimson-500/10"
            >
              <Trash2 size={14} />
              删除
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950" style={{ minHeight: 360 }}>
            <Landmark size={80} className="text-gold-500/25" />
          </div>

          <div className="card-shine rounded-xl border border-gold-500/10 p-6">
            <div className="mb-4 flex items-start justify-between">
              <h1 className="font-serif text-2xl font-bold text-ink-50 sm:text-3xl">
                {visit.name}
              </h1>
              <TypeBadge type={visit.type} size="md" />
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2 text-ink-200">
                <MapPin size={16} className="shrink-0 text-gold-500/60" />
                <span>{visit.location}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-200">
                <Globe size={16} className="shrink-0 text-gold-500/60" />
                <span>{visit.country}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-200">
                <Calendar size={16} className="shrink-0 text-gold-500/60" />
                <span>{visit.date}</span>
              </div>
              <div className="flex items-center gap-6 text-ink-300">
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-gold-500/60" />
                  {visit.duration} 小时
                </span>
                <span className="flex items-center gap-2">
                  <Ticket size={16} className="text-gold-500/60" />
                  ¥{visit.ticketPrice}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-400">评分</span>
                <StarRating rating={visit.rating} readonly size={18} />
              </div>
            </div>

            {visit.recommendation && (
              <div className="border-t border-gold-500/10 pt-4">
                <h3 className="mb-2 text-sm font-medium text-gold-400">推荐语</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-200">
                  {visit.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>

        {visit.photos.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold text-ink-50">
              <ImageIcon size={20} className="text-gold-500/60" />
              照片/速写
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {visit.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group overflow-hidden rounded-lg border border-gold-500/10 transition-all hover:border-gold-500/25"
                >
                  <div className="flex h-32 items-center justify-center bg-gradient-to-br from-ink-800 to-ink-950">
                    <ImageIcon size={28} className="text-gold-500/20" />
                  </div>
                  <div className="bg-ink-950/60 px-3 py-2">
                    <p className="truncate text-xs text-ink-300">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedExhibitions.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-ink-50">
              相关展览
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedExhibitions.map((ex) => (
                <div
                  key={ex.id}
                  className="card-shine rounded-lg border border-gold-500/10 p-4 transition-all hover:border-gold-500/25"
                >
                  <h3 className="mb-1 font-serif font-semibold text-ink-50">
                    {ex.name}
                  </h3>
                  <p className="mb-2 text-sm text-ink-400">{ex.museum}</p>
                  <div className="flex items-center gap-3 text-xs text-ink-500">
                    <span>{ex.startDate}</span>
                    <span>→</span>
                    <span>{ex.endDate}</span>
                    {ex.isTemporary && (
                      <span className="rounded-full bg-crimson-500/20 px-2 py-0.5 text-crimson-400">
                        临时展览
                      </span>
                    )}
                  </div>
                  {ex.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-ink-400">
                      {ex.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Modal
          isOpen={editOpen}
          onClose={() => {
            setEditOpen(false);
            setPhotoCaption('');
          }}
          title="编辑参观记录"
          maxWidth="max-w-xl"
        >
          {form && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-ink-300">博物馆名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p!, name: e.target.value }))}
                  className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-ink-300">地点</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p!, location: e.target.value }))}
                    className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-ink-300">国家</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm((p) => ({ ...p!, country: e.target.value }))}
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
                    onChange={(e) => setForm((p) => ({ ...p!, date: e.target.value }))}
                    className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-ink-300">时长(小时)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.duration || ''}
                    onChange={(e) => setForm((p) => ({ ...p!, duration: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-ink-300">票价(¥)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.ticketPrice || ''}
                    onChange={(e) => setForm((p) => ({ ...p!, ticketPrice: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gold-500/20 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-gold-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-ink-300">评分</label>
                  <StarRating
                    rating={form.rating}
                    onChange={(r) => setForm((p) => ({ ...p!, rating: r }))}
                    size={22}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-ink-300">类型</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p!, type: e.target.value as MuseumType }))}
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
                  onChange={(e) => setForm((p) => ({ ...p!, recommendation: e.target.value }))}
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
                    +
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
                    setEditOpen(false);
                    setPhotoCaption('');
                  }}
                  className="rounded-lg px-4 py-2 text-sm text-ink-400 transition-colors hover:text-ink-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="rounded-lg bg-gold-500/20 px-4 py-2 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/30"
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          title={hasAssociations ? '无法删除' : '确认删除'}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            {hasAssociations ? (
              <>
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                  <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">
                      该参观记录存在关联数据，无法直接删除
                    </p>
                    <p className="mt-1 text-xs text-ink-400">
                      请先解除以下关联后再进行删除操作
                    </p>
                  </div>
                </div>

                {relatedNotes.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-ink-200">
                      关联的学习笔记（{relatedNotes.length} 条）
                    </h4>
                    <div className="space-y-2">
                      {relatedNotes.map((note) => (
                        <div
                          key={note.id}
                          className="flex items-center justify-between rounded-lg border border-gold-500/10 bg-ink-950/50 px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate text-sm text-ink-200">{note.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                handleUnlinkNote(note.id);
                              }}
                              className="rounded-md border border-gold-500/30 px-2 py-1 text-xs text-gold-400 transition-colors hover:bg-gold-500/10"
                            >
                              解除关联
                            </button>
                            <button
                              onClick={() => {
                                navigate('/notes');
                              }}
                              className="rounded-md p-1 text-ink-500 transition-colors hover:text-gold-400"
                              title="前往查看"
                            >
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {relatedExhibitions.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-ink-200">
                      关联的展览记录（{relatedExhibitions.length} 条）
                    </h4>
                    <div className="space-y-2">
                      {relatedExhibitions.map((ex) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between rounded-lg border border-gold-500/10 bg-ink-950/50 px-3 py-2"
                        >
                          <span className="truncate text-sm text-ink-200">{ex.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleDeleteExhibition(ex.id)}
                              className="rounded-md border border-crimson-500/30 px-2 py-1 text-xs text-crimson-400 transition-colors hover:bg-crimson-500/10"
                            >
                              删除展览
                            </button>
                            <button
                              onClick={() => navigate('/exhibitions')}
                              className="rounded-md p-1 text-ink-500 transition-colors hover:text-gold-400"
                              title="前往查看"
                            >
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm text-ink-400 transition-colors hover:text-ink-50"
                  >
                    知道了
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-ink-300">
                  确定要删除「{visit.name}」的参观记录吗？此操作不可撤销。
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm text-ink-400 transition-colors hover:text-ink-50"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg bg-crimson-500/20 px-4 py-2 text-sm font-medium text-crimson-400 transition-colors hover:bg-crimson-500/30"
                  >
                    删除
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
