import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Recording } from '@/types';
import { formatDuration } from '@/utils/audio';
import { formatDateTime } from '@/utils/date';
import { Tag } from '@/components/ui/Tag';
import { Play, MapPin, Clock, Calendar } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Link } from 'react-router-dom';

interface RecordingMarkerProps {
  recording: Recording;
  onPlay?: (recording: Recording) => void;
}

const createCustomIcon = (color: string = '#1a4d2e') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: bounceIn 0.5s ease-out;
      ">
        <svg style="transform: rotate(45deg);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export const RecordingMarker: React.FC<RecordingMarkerProps> = ({ recording, onPlay }) => {
  const { playRecording } = usePlayerStore();

  if (!recording.gpsLocation) return null;

  const categoryColor = recording.tags[0]?.color || '#1a4d2e';
  const icon = createCustomIcon(categoryColor);

  const handlePlay = () => {
    if (onPlay) {
      onPlay(recording);
    } else {
      playRecording(recording);
    }
  };

  return (
    <Marker
      position={[recording.gpsLocation.latitude, recording.gpsLocation.longitude]}
      icon={icon}
    >
      <Popup className="p-0 min-w-[280px]">
        <div className="overflow-hidden">
          <div 
            className="h-2 bg-gradient-to-r"
            style={{ 
              background: `linear-gradient(to right, ${categoryColor}, ${categoryColor}aa)` 
            }}
          />
          
          <div className="p-4">
            <Link 
              to={`/archive/${recording.id}`}
              className="block hover:text-forest-600 dark:hover:text-forest-400 transition-colors"
            >
              <h4 className="font-semibold text-earth-900 dark:text-earth-100 text-lg mb-1 font-display">
                {recording.title}
              </h4>
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-earth-500 dark:text-earth-400 mb-2">
              <MapPin size={14} />
              <span>{recording.locationName}</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-earth-500 dark:text-earth-400 mb-3">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{formatDateTime(recording.recordTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{formatDuration(recording.audioMetadata?.duration || 0)}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {recording.tags.slice(0, 3).map(tag => (
                <Tag key={tag.id} tag={tag} size="sm" />
              ))}
            </div>
            
            <button
              onClick={handlePlay}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Play size={16} />
              播放录音
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

interface LocationCompareMarkerProps {
  recording: Recording;
  isSelected: boolean;
  onClick: () => void;
  side: 'left' | 'right';
}

export const LocationCompareMarker: React.FC<LocationCompareMarkerProps> = ({
  recording,
  isSelected,
  onClick,
  side,
}) => {
  if (!recording.gpsLocation) return null;

  const color = side === 'left' ? '#3b82f6' : '#ef4444';
  const icon = createCustomIcon(color);

  return (
    <Marker
      position={[recording.gpsLocation.latitude, recording.gpsLocation.longitude]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className={`p-3 border-l-4 ${isSelected ? 'border-forest-600' : 'border-transparent'}`}>
          <h4 className="font-semibold text-earth-900 dark:text-earth-100">
            {recording.title}
          </h4>
          <p className="text-sm text-earth-500 dark:text-earth-400">
            {formatDateTime(recording.recordTime)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
};
