
import { useState, useEffect } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import type { HistoryEvent } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Users,
  MapPin,
  ArrowRight
} from 'lucide-react';

const Timeline = () => {
  const {
    worldSetting,
    historyEvents,
    mapMarkers,
    addHistoryEvent,
    updateHistoryEvent,
    deleteHistoryEvent
  } = useWorldStore();

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HistoryEvent | null>(null);

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  const sortedEvents = [...historyEvents].sort((a, b) => {
    return a.date.localeCompare(b.date);
  });

  const getLocationName = (locationId: string | null) => {
    if (!locationId) return null;
    return mapMarkers.find(m => m.id === locationId)?.name || '未知地点';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            历史时间线
          </h1>
          <p className="text-gray-400">记录世界历史上的重要事件</p>
        </div>
        <Button
          onClick={() => {
            setEditingEvent(null);
            setShowModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          添加事件
        </Button>
      </div>

      {sortedEvents.length > 0 ? (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold via-magic-cyan to-tech-purple" />
          
          <div className="space-y-6">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative pl-20 fade-in">
                <div className="absolute left-6 top-4 w-5 h-5 rounded-full bg-gold border-4 border-dark-bg shadow-lg shadow-gold/30" />
                
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium">
                          {event.date}
                        </span>
                        <h3 className="font-display text-xl font-bold text-white">
                          {event.title}
                        </h3>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-300 mb-4 leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        {event.participants.length > 0 && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>参与者: {event.participants.join(', ')}</span>
                          </div>
                        )}
                        {event.locationId && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>地点: {getLocationName(event.locationId)}</span>
                          </div>
                        )}
                      </div>

                      {event.consequences && (
                        <div className="mt-4 p-3 bg-dark-bg/50 rounded-lg border-l-4 border-magic-cyan">
                          <div className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-magic-cyan mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400 mb-1">后果与影响</p>
                              <p className="text-gray-300 text-sm">{event.consequences}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gold hover:bg-dark-bg rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteHistoryEvent(event.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-bg rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            暂无历史事件
          </h2>
          <p className="text-gray-400 mb-6">
            记录世界历史上的重要事件，构建完整的时间线
          </p>
          <Button
            onClick={() => {
              setEditingEvent(null);
              setShowModal(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            添加第一个事件
          </Button>
        </div>
      )}

      <HistoryEventModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        mapMarkers={mapMarkers}
        onSave={(data) => {
          if (editingEvent) {
            updateHistoryEvent(editingEvent.id, data);
          } else {
            addHistoryEvent(data);
          }
          setShowModal(false);
          setEditingEvent(null);
        }}
      />
    </div>
  );
};

const HistoryEventModal = ({
  isOpen,
  onClose,
  event,
  mapMarkers,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  event: HistoryEvent | null;
  mapMarkers: Array<{ id: string; name: string }>;
  onSave: (data: Omit<HistoryEvent, 'id'>) => void;
}) => {
  const [date, setDate] = useState(event?.date || '');
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [participantsText, setParticipantsText] = useState(event?.participants.join(', ') || '');
  const [consequences, setConsequences] = useState(event?.consequences || '');
  const [locationId, setLocationId] = useState(event?.locationId || '');

  useEffect(() => {
    if (isOpen) {
      setDate(event?.date || '');
      setTitle(event?.title || '');
      setDescription(event?.description || '');
      setParticipantsText(event?.participants.join(', ') || '');
      setConsequences(event?.consequences || '');
      setLocationId(event?.locationId || '');
    }
  }, [isOpen, event]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? '编辑事件' : '添加事件'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({
              date,
              title,
              description,
              participants: participantsText.split(',').map(p => p.trim()).filter(p => p),
              consequences,
              locationId: locationId || null
            })}
            disabled={!date.trim() || !title.trim()}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">时间 *</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="例如：纪元前300年"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">事件名称 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="例如：大灾变"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">事件描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="详细描述这个事件..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">参与者（用逗号分隔）</label>
            <input
              type="text"
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="例如：英雄A, 国王B"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">发生地点</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            >
              <option value="">无特定地点</option>
              {mapMarkers.map((marker) => (
                <option key={marker.id} value={marker.id}>{marker.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">后果与影响</label>
          <textarea
            value={consequences}
            onChange={(e) => setConsequences(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述这个事件的后果和对世界的影响..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default Timeline;
