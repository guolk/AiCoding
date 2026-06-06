import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Plus, Calendar, MapPin, Image, FileText, Edit2, Trash2, X, Check, Camera, PenTool, AlignLeft } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { useStore } from '../store/useStore';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { seasonLabels, generateId } from '../../shared/types';
import type { Observation, MapMarker, MediaItem, Season, MediaType } from '../../shared/types';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Observations() {
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('project');

  const { observations, projects, activeProjectId, createObservation, updateObservation, deleteObservation } = useStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingObservation, setEditingObservation] = useState<Observation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'timeline'>('list');
  const [isAddingMarker, setIsAddingMarker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    observationTime: new Date().toISOString().slice(0, 16),
    season: 'spring' as Season,
    markers: [] as MapMarker[],
    media: [] as MediaItem[],
    projectId: '',
  });

  const [newMedia, setNewMedia] = useState({
    type: 'photo' as MediaType,
    url: '',
    content: '',
    caption: '',
  });

  useEffect(() => {
    if (projectFilter) {
      setFormData((prev) => ({ ...prev, projectId: projectFilter }));
    } else if (activeProjectId) {
      setFormData((prev) => ({ ...prev, projectId: activeProjectId }));
    }
  }, [projectFilter, activeProjectId]);

  const filteredObservations = projectFilter
    ? observations.filter((o) => o.projectId === projectFilter)
    : activeProjectId
    ? observations.filter((o) => o.projectId === activeProjectId)
    : observations;

  const sortedObservations = [...filteredObservations].sort(
    (a, b) => new Date(b.observationTime).getTime() - new Date(a.observationTime).getTime()
  );

  const handleCreate = () => {
    setEditingObservation(null);
    setFormData({
      title: '',
      description: '',
      observationTime: new Date().toISOString().slice(0, 16),
      season: 'spring',
      markers: [],
      media: [],
      projectId: projectFilter || activeProjectId || (projects[0]?.id ?? ''),
    });
    setDialogOpen(true);
  };

  const handleEdit = (observation: Observation) => {
    setEditingObservation(observation);
    setFormData({
      title: observation.title,
      description: observation.description,
      observationTime: observation.observationTime.slice(0, 16),
      season: observation.season,
      markers: [...observation.markers],
      media: [...observation.media],
      projectId: observation.projectId,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!isAddingMarker) return;
    const newMarker: MapMarker = {
      id: generateId(),
      lat,
      lng,
      address: '',
      streetName: '',
    };
    setFormData((prev) => ({
      ...prev,
      markers: [...prev.markers, newMarker],
    }));
    setIsAddingMarker(false);
  };

  const handleRemoveMarker = (markerId: string) => {
    setFormData((prev) => ({
      ...prev,
      markers: prev.markers.filter((m) => m.id !== markerId),
    }));
  };

  const handleAddMedia = () => {
    if (!newMedia.caption.trim()) return;
    const media: MediaItem = {
      id: generateId(),
      type: newMedia.type,
      url: newMedia.type === 'text' ? undefined : newMedia.url,
      content: newMedia.type === 'text' ? newMedia.content : undefined,
      caption: newMedia.caption,
    };
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, media],
    }));
    setNewMedia({ type: 'photo', url: '', content: '', caption: '' });
  };

  const handleRemoveMedia = (mediaId: string) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((m) => m.id !== mediaId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.projectId) return;

    const observationData = {
      ...formData,
      observationTime: new Date(formData.observationTime).toISOString(),
    };

    if (editingObservation) {
      await updateObservation({
        ...editingObservation,
        ...observationData,
      });
    } else {
      await createObservation(observationData);
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteObservation(deleteId);
      setDeleteId(null);
    }
  };

  const mediaTypeIcons: Record<MediaType, React.ReactNode> = {
    photo: <Camera className="w-4 h-4" />,
    sketch: <PenTool className="w-4 h-4" />,
    text: <AlignLeft className="w-4 h-4" />,
  };

  const center: [number, number] =
    filteredObservations.length > 0 && filteredObservations[0].markers.length > 0
      ? [filteredObservations[0].markers[0].lat, filteredObservations[0].markers[0].lng]
      : [31.2304, 121.4737];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 mb-2">观察记录</h1>
          <p className="text-slate-500 font-sans">
            记录您在城市中的观察发现，关联地理位置和多媒体内容
          </p>
        </div>
        <button onClick={handleCreate} className="btn-secondary">
          <Plus className="w-5 h-5" />
          新建记录
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-1">
            <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <Tabs.List className="flex p-1 bg-slate-100 rounded-lg">
                <Tabs.Trigger
                  value="list"
                  className={`flex-1 px-4 py-2 rounded-md font-sans text-sm font-medium transition-all ${
                    activeTab === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  列表视图
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="timeline"
                  className={`flex-1 px-4 py-2 rounded-md font-sans text-sm font-medium transition-all ${
                    activeTab === 'timeline' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  时间轴
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </div>

          {sortedObservations.length === 0 ? (
            <EmptyState
              icon={<MapPin className="w-10 h-10 text-slate-400" />}
              title="还没有观察记录"
              description="开始记录您的城市观察，点击上方按钮创建第一条记录。"
              actionLabel="新建记录"
              onAction={handleCreate}
            />
          ) : activeTab === 'list' ? (
            <div className="space-y-4">
              {sortedObservations.map((observation, index) => (
                <div
                  key={observation.id}
                  className={`card p-5 animate-fade-in-up stagger-${(index % 6) + 1}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="chip chip-active">{seasonLabels[observation.season]}</span>
                        <span className="chip flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(observation.observationTime).toLocaleDateString('zh-CN')}
                        </span>
                        <span className="chip flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {observation.markers.length} 个地点
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-slate-800 mb-1">
                        {observation.title}
                      </h3>
                      <p className="text-slate-500 line-clamp-2">{observation.description}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => handleEdit(observation)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(observation.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {observation.markers.length > 0 && (
                    <div className="h-48 rounded-lg overflow-hidden mb-4">
                      <MapContainer
                        center={[observation.markers[0].lat, observation.markers[0].lng]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {observation.markers.map((marker) => (
                          <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={customIcon}>
                            <Popup>
                              <div className="font-medium">{marker.streetName || '观察点'}</div>
                              {marker.address && <div className="text-sm text-slate-500">{marker.address}</div>}
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  )}

                  {observation.media.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {observation.media.map((media) => (
                        <div
                          key={media.id}
                          className="flex-shrink-0 w-24 h-24 rounded-lg bg-slate-100 overflow-hidden relative group"
                        >
                          {media.type === 'photo' && media.url ? (
                            <img src={media.url} alt={media.caption} className="w-full h-full object-cover" />
                          ) : media.type === 'text' ? (
                            <div className="w-full h-full flex items-center justify-center p-2 text-xs text-slate-600 line-clamp-3">
                              {media.content}
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              {mediaTypeIcons[media.type]}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                            <p className="text-[10px] text-white line-clamp-2">{media.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-slate-400 font-sans">
                      项目：{projects.find((p) => p.id === observation.projectId)?.title || '未分类'}
                    </span>
                    <Link to={`/observations/${observation.id}`} className="text-sm text-clay-600 font-medium hover:text-clay-700 font-sans">
                      查看详情 →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200"></div>
              {sortedObservations.map((observation, index) => (
                <div
                  key={observation.id}
                  className={`relative pb-8 animate-fade-in-up stagger-${(index % 6) + 1}`}
                >
                  <div className="absolute left-[-24px] top-1 w-6 h-6 rounded-full bg-clay-500 border-4 border-white shadow-md"></div>
                  <div className="card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-sans text-slate-400">
                        {new Date(observation.observationTime).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="chip chip-active">{seasonLabels[observation.season]}</span>
                    </div>
                    <h3 className="font-display font-semibold text-slate-800 mb-1">{observation.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{observation.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="chip flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {observation.markers.length}
                      </span>
                      <span className="chip flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        {observation.media.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-slate-800 mb-4">观察地点分布</h3>
            <div className="h-80 rounded-lg overflow-hidden">
              <MapContainer
                center={center}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {sortedObservations.flatMap((obs) =>
                  obs.markers.map((marker) => (
                    <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={customIcon}>
                      <Popup>
                        <div className="font-medium">{obs.title}</div>
                        <div className="text-sm text-slate-500">{marker.streetName || marker.address}</div>
                      </Popup>
                    </Marker>
                  ))
                )}
              </MapContainer>
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-cream-50 to-white">
            <h3 className="font-display font-semibold text-slate-800 mb-3">时间维度对比</h3>
            <p className="text-sm text-slate-500 font-sans mb-4">
              同一地点在不同季节的对比分析，帮助发现城市空间的季节性变化特征。
            </p>
            <div className="space-y-3">
              {(['spring', 'summer', 'autumn', 'winter'] as Season[]).map((season) => {
                const count = sortedObservations.filter((o) => o.season === season).length;
                return (
                  <div key={season} className="flex items-center gap-3">
                    <span className="w-16 text-sm font-sans text-slate-600">{seasonLabels[season]}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-clay-500 to-clay-400 rounded-full transition-all duration-500"
                        style={{ width: `${sortedObservations.length > 0 ? (count / sortedObservations.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-sans text-slate-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display font-semibold text-slate-800 mb-4">快速操作</h3>
            <div className="space-y-2">
              <button onClick={handleCreate} className="w-full btn-outline text-sm justify-start">
                <Plus className="w-4 h-4" />
                添加新观察
              </button>
              <button className="w-full btn-ghost text-sm justify-start">
                <FileText className="w-4 h-4" />
                导出观察报告
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in z-[1000]" />
          <Dialog.Content className="fixed top-0 right-0 bottom-0 z-[1000] w-full max-w-xl overflow-y-auto">
            <div className="bg-white min-h-full shadow-2xl p-6 animate-slide-in-right">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="font-display text-xl font-semibold text-slate-800">
                  {editingObservation ? '编辑观察记录' : '新建观察记录'}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="label-text">所属项目</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">选择项目</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-text">观察标题</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：南京西路沿街立面观察"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="label-text">观察描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="详细描述您的观察发现..."
                    rows={4}
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">观察时间</label>
                    <input
                      type="datetime-local"
                      value={formData.observationTime}
                      onChange={(e) => setFormData({ ...formData, observationTime: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label-text">季节</label>
                    <select
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value as Season })}
                      className="input-field"
                    >
                      {(['spring', 'summer', 'autumn', 'winter'] as Season[]).map((s) => (
                        <option key={s} value={s}>
                          {seasonLabels[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label-text mb-0">地理位置标注</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingMarker(!isAddingMarker)}
                      className={`text-sm font-sans px-3 py-1 rounded-lg transition-colors ${
                        isAddingMarker ? 'bg-clay-100 text-clay-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isAddingMarker ? '点击地图添加' : '+ 添加标注点'}
                    </button>
                  </div>
                  <div className="h-64 rounded-lg overflow-hidden">
                    <MapContainer
                      center={center}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapClickHandler onMapClick={handleMapClick} />
                      {formData.markers.map((marker) => (
                        <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={customIcon}>
                          <Popup>
                            <div className="p-2">
                              <input
                                type="text"
                                placeholder="街道名称"
                                value={marker.streetName}
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    markers: prev.markers.map((m) =>
                                      m.id === marker.id ? { ...m, streetName: e.target.value } : m
                                    ),
                                  }));
                                }}
                                className="w-full px-2 py-1 border rounded text-sm mb-1"
                              />
                              <input
                                type="text"
                                placeholder="详细地址"
                                value={marker.address}
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    markers: prev.markers.map((m) =>
                                      m.id === marker.id ? { ...m, address: e.target.value } : m
                                    ),
                                  }));
                                }}
                                className="w-full px-2 py-1 border rounded text-sm mb-2"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveMarker(marker.id)}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                删除此标记
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                  {formData.markers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.markers.map((marker) => (
                        <div key={marker.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-600 font-sans">
                            {marker.streetName || `${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMarker(marker.id)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="label-text mb-3">多媒体记录</label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {(['photo', 'sketch', 'text'] as MediaType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewMedia({ ...newMedia, type })}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                            newMedia.type === type
                              ? 'border-clay-500 bg-clay-50 text-clay-700'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {mediaTypeIcons[type]}
                          <span className="text-sm font-sans">
                            {type === 'photo' ? '照片' : type === 'sketch' ? '手绘' : '文字'}
                          </span>
                        </button>
                      ))}
                    </div>
                    {newMedia.type !== 'text' && (
                      <input
                        type="text"
                        placeholder="图片URL"
                        value={newMedia.url}
                        onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
                        className="input-field"
                      />
                    )}
                    {newMedia.type === 'text' && (
                      <textarea
                        placeholder="输入观察笔记..."
                        value={newMedia.content}
                        onChange={(e) => setNewMedia({ ...newMedia, content: e.target.value })}
                        rows={3}
                        className="input-field resize-none"
                      />
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="说明文字"
                        value={newMedia.caption}
                        onChange={(e) => setNewMedia({ ...newMedia, caption: e.target.value })}
                        className="input-field flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddMedia}
                        className="btn-primary py-2"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {formData.media.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {formData.media.map((media) => (
                        <div
                          key={media.id}
                          className="relative group aspect-square rounded-lg bg-slate-100 overflow-hidden"
                        >
                          {media.type === 'photo' && media.url ? (
                            <img src={media.url} alt={media.caption} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              {mediaTypeIcons[media.type]}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(media.id)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="btn-outline text-sm py-2"
                  >
                    取消
                  </button>
                  <button type="submit" className="btn-primary text-sm py-2">
                    {editingObservation ? '保存修改' : '创建记录'}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除观察记录"
        description="删除此观察记录将同时删除关联的地理位置标注和多媒体内容。此操作无法撤销。"
        confirmLabel="删除记录"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  );
}
