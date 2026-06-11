import { useParams, Link } from 'react-router-dom';
import { useTreeStore } from '@/store/treeStore';
import { ArrowLeft, Edit, TreePine, Ruler, Maximize, CalendarDays, MapPin, Building, BookOpen, Camera, Leaf } from 'lucide-react';
import { HEALTH_STATUS_LABELS, HEALTH_STATUS_COLORS, CULTURAL_TYPE_LABELS, MEDIA_CATEGORY_LABELS } from '@/types';
import { useState } from 'react';

export default function ArchiveDetail() {
  const { id } = useParams<{ id: string }>();
  const { getTreeById, getCulturalRecordsByTreeId, getMediaAssetsByTreeId } = useTreeStore();

  const tree = getTreeById(id || '');
  const culturalRecords = getCulturalRecordsByTreeId(id || '');
  const mediaAssets = getMediaAssetsByTreeId(id || '');
  const [activeMediaTab, setActiveMediaTab] = useState<string>('full');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!tree) {
    return (
      <div className="p-8 text-center">
        <p className="text-brown-700/60">未找到该古树档案</p>
        <Link to="/archives" className="text-forest-600 hover:underline mt-2 inline-block">返回列表</Link>
      </div>
    );
  }

  const filteredMedia = mediaAssets.filter((a) => a.category === activeMediaTab);
  const mediaCategories = ['full', 'trunk', 'leaf', 'fruit', 'video'] as const;

  const infoItems = [
    { icon: TreePine, label: '树种', value: tree.species },
    { icon: Leaf, label: '学名', value: tree.scientificName },
    { icon: Ruler, label: '胸径', value: `${tree.dbh} cm` },
    { icon: Maximize, label: '树高', value: `${tree.height} m` },
    { icon: Maximize, label: '冠幅', value: `${tree.crownWidth} m` },
    { icon: CalendarDays, label: '推测树龄', value: `${tree.estimatedAge} 年` },
    { icon: MapPin, label: 'GPS坐标', value: `${tree.gpsLatitude}N, ${tree.gpsLongitude}E` },
    { icon: Building, label: '权属单位', value: tree.ownership },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/archives" className="p-2 rounded-lg hover:bg-forest-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-forest-600" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold text-forest-600">{tree.species}</h1>
            <p className="text-brown-700/60 italic">{tree.scientificName}</p>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full ${HEALTH_STATUS_COLORS[tree.healthStatus]}`}>
            健康：{HEALTH_STATUS_LABELS[tree.healthStatus]}
          </span>
        </div>
        <Link
          to={`/archives/${tree.id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          编辑档案
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-forest-100 overflow-hidden mb-6">
            <img src={tree.coverImage} alt={tree.species} className="w-full h-56 object-cover" />
            <div className="p-4">
              <p className="text-sm text-brown-700/60 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                {tree.location}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-5">
            <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              专业档案
            </h2>
            <div className="space-y-3">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-forest-500" />
                  </div>
                  <div>
                    <p className="text-xs text-brown-700/50">{item.label}</p>
                    <p className="text-sm font-medium text-brown-700">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
            <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              历史文化记载
            </h2>
            {culturalRecords.length > 0 ? (
              <div className="space-y-4">
                {culturalRecords.map((record) => (
                  <div key={record.id} className="relative pl-6 border-l-2 border-forest-300">
                    <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-forest-400 -translate-x-[7px]" />
                    <div className="bg-forest-50/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          record.type === 'historical' ? 'bg-amber-200 text-amber-500' : record.type === 'celebrity' ? 'bg-forest-200 text-forest-700' : 'bg-purple-200 text-purple-700'
                        }`}>
                          {CULTURAL_TYPE_LABELS[record.type]}
                        </span>
                        <span className="text-xs text-brown-700/50">{record.period}</span>
                      </div>
                      <h3 className="font-serif font-semibold text-brown-700 mb-1">{record.title}</h3>
                      <p className="text-sm text-brown-700/70 leading-relaxed">{record.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brown-700/50 text-center py-4">暂无历史文化记载</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
            <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              多媒体存档
            </h2>
            <div className="flex gap-2 mb-4 border-b border-forest-100 pb-3">
              {mediaCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveMediaTab(cat)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    activeMediaTab === cat ? 'bg-forest-600 text-white' : 'text-brown-700/60 hover:bg-forest-50'
                  }`}
                >
                  {MEDIA_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {filteredMedia.map((asset) => (
                  <div
                    key={asset.id}
                    className="relative group cursor-pointer rounded-lg overflow-hidden"
                    onClick={() => setLightboxImage(asset.url)}
                  >
                    <img src={asset.url} alt={asset.description} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {asset.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brown-700/50 text-center py-4">暂无{MEDIA_CATEGORY_LABELS[activeMediaTab as keyof typeof MEDIA_CATEGORY_LABELS]}</p>
            )}
          </div>
        </div>
      </div>

      {lightboxImage && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="preview" className="max-w-[80vw] max-h-[80vh] object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}
