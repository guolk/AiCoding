
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useWorldStore } from '@/store/useWorldStore';
import type { MapMarker } from '@/types';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Building2,
  Mountain,
  Swords,
  Sparkles
} from 'lucide-react';

const customIcon = (type: MapMarker['type']) => {
  const colors = {
    city: '#d4af37',
    landmark: '#4a8f9e',
    battlefield: '#ef4444',
    mystical: '#8b5cf6'
  };

  const icons = {
    city: '🏰',
    landmark: '🏔️',
    battlefield: '⚔️',
    mystical: '✨'
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 36px;
      height: 36px;
      background: ${colors[type]};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      border: 3px solid #2a2f4a;
    ">${icons[type]}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

interface MapClickHandlerProps {
  onMapClick: (latlng: { lat: number; lng: number }) => void;
}

const MapClickHandler = ({ onMapClick }: MapClickHandlerProps) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
};

const WorldMapPage = () => {
  const {
    worldSetting,
    mapMarkers,
    addMapMarker,
    updateMapMarker,
    deleteMapMarker
  } = useWorldStore();

  const [showModal, setShowModal] = useState(false);
  const [editingMarker, setEditingMarker] = useState<MapMarker | null>(null);
  const [newMarkerPos, setNewMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedType, setSelectedType] = useState<MapMarker['type'] | 'all'>('all');

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              世界地图
            </h1>
            <p className="text-gray-400">在地图上标注重要地点</p>
          </div>
        </div>
        <div className="text-center py-16">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  const filteredMarkers = selectedType === 'all' 
    ? mapMarkers
    : mapMarkers.filter(m => m.type === selectedType);

  const typeLabels: Array<{ type: MapMarker['type'] | 'all'; label: string; icon: React.ReactNode }> = [
    { type: 'all', label: '全部', icon: <MapPin className="w-4 h-4" /> },
    { type: 'city', label: '城市', icon: <Building2 className="w-4 h-4" /> },
    { type: 'landmark', label: '地标', icon: <Mountain className="w-4 h-4" /> },
    { type: 'battlefield', label: '战场', icon: <Swords className="w-4 h-4" /> },
    { type: 'mystical', label: '神秘地点', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              世界地图
            </h1>
            <p className="text-gray-400">点击地图添加标记重要地点</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {typeLabels.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedType === type
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'text-gray-400 hover:text-gray-200 bg-dark-card border border-dark-border hover:border-dark-border/50'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-6 pt-2">
        <div className="h-full bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <MapContainer
            center={[0, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler
              onMapClick={(latlng) => {
                setNewMarkerPos(latlng);
                setEditingMarker(null);
                setShowModal(true);
              }}
            />
            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.lat, marker.lng]}
                icon={customIcon(marker.type)}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-lg mb-1">
                      {marker.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {marker.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingMarker(marker);
                          setNewMarkerPos(null);
                          setShowModal(true);
                        }}
                        className="text-sm text-blue-600 hover:underline">
                        编辑
                      </button>
                      <button
                        onClick={() => deleteMapMarker(marker.id)}
                        className="text-sm text-red-600 hover:underline">
                        删除
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <MapMarkerModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setNewMarkerPos(null);
          setEditingMarker(null);
        }}
        marker={editingMarker}
        position={newMarkerPos}
        onSave={(data) => {
          if (editingMarker) {
            updateMapMarker(editingMarker.id, data);
          } else {
            addMapMarker(data);
          }
          setShowModal(false);
          setNewMarkerPos(null);
          setEditingMarker(null);
        }}
      />
    </div>
  );
};

const MapMarkerModal = ({
  isOpen,
  onClose,
  marker,
  position,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  marker: MapMarker | null;
  position: { lat: number; lng: number } | null;
  onSave: (data: Omit<MapMarker, 'id'>) => void;
}) => {
  const [name, setName] = useState(marker?.name || '');
  const [type, setType] = useState<MapMarker['type']>(marker?.type || 'city');
  const [description, setDescription] = useState(marker?.description || '');

  const types: Array<{ value: MapMarker['type']; label: string; icon: React.ReactNode }> = [
    { value: 'city', label: '城市', icon: <Building2 className="w-4 h-4" /> },
    { value: 'landmark', label: '地标', icon: <Mountain className="w-4 h-4" /> },
    { value: 'battlefield', label: '战场', icon: <Swords className="w-4 h-4" /> },
    { value: 'mystical', label: '神秘地点', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={marker ? '编辑标记' : '添加标记'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({
              name,
              type,
              description,
              lat: marker?.lat ?? position?.lat ?? 0,
              lng: marker?.lng ?? position?.lng ?? 0
            })}
            disabled={!name.trim() || (!marker && !position)}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">地点名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：暴风城"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">地点类型</label>
          <div className="grid grid-cols-2 gap-2">
            {types.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  type === value
                    ? 'bg-gold/20 text-gold border border-gold/30'
                    : 'bg-dark-bg text-gray-300 border border-dark-border hover:bg-dark-border/50'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述这个地点..."
          />
        </div>

        {marker && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">纬度</label>
              <p className="text-white">{marker.lat.toFixed(4)}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">经度</label>
              <p className="text-white">{marker.lng.toFixed(4)}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default WorldMapPage;
