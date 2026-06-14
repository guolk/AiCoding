import React from 'react';
import { MapContainer, TileLayer, ScaleControl, LayersControl, useMapEvents } from 'react-leaflet';
import { Recording } from '@/types';
import { RecordingMarker } from './RecordingMarker';
import { HeatmapLayer } from './HeatmapLayer';
import { HeatmapPoint } from '@/types';
import { useMapStore } from '@/store/useMapStore';
import { Layers, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const { BaseLayer, Overlay } = LayersControl;

const MapEventsHandler: React.FC<{
  onMoveEnd?: (center: [number, number], zoom: number) => void;
}> = ({ onMoveEnd }) => {
  const map = useMapEvents({
    moveend: () => {
      onMoveEnd?.(
        [map.getCenter().lat, map.getCenter().lng],
        map.getZoom()
      );
    },
  });
  return null;
};

interface MapViewProps {
  recordings?: Recording[];
  heatmapPoints?: HeatmapPoint[];
  showHeatmap?: boolean;
  showMarkers?: boolean;
  height?: string;
  className?: string;
  onMarkerClick?: (recording: Recording) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  recordings = [],
  heatmapPoints = [],
  showHeatmap: externalShowHeatmap,
  showMarkers: externalShowMarkers,
  height = '500px',
  className,
  onMarkerClick,
}) => {
  const {
    center,
    zoom,
    showHeatmap: storeShowHeatmap,
    showMarkers: storeShowMarkers,
    setCenter,
    setZoom,
  } = useMapStore();

  const showHeatmap = externalShowHeatmap ?? storeShowHeatmap;
  const showMarkers = externalShowMarkers ?? storeShowMarkers;

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        zoomControl={false}
        attributionControl={true}
      >
        <MapEventsHandler
          onMoveEnd={(newCenter, newZoom) => {
            setCenter(newCenter);
            setZoom(newZoom);
          }}
        />
        <LayersControl position="topright">
          <BaseLayer checked name="标准地图">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="卫星地图">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>
          <BaseLayer name="地形地图">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          {showHeatmap && heatmapPoints.length > 0 && (
            <Overlay checked name="热力图">
              <HeatmapLayer points={heatmapPoints} />
            </Overlay>
          )}

          {showMarkers && (
            <Overlay checked name="录音标记">
              <div></div>
            </Overlay>
          )}
        </LayersControl>

        <ScaleControl position="bottomleft" imperial={false} />

        {showMarkers && recordings.map((recording) => (
          recording.gpsLocation && (
            <RecordingMarker
              key={recording.id}
              recording={recording}
              onPlay={onMarkerClick}
            />
          )
        ))}

        {showHeatmap && heatmapPoints.length > 0 && (
          <HeatmapLayer points={heatmapPoints} />
        )}
      </MapContainer>
    </div>
  );
};

interface MapLegendProps {
  className?: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({ className }) => {
  return (
    <div className={`absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-forest-900/95 backdrop-blur-sm rounded-lg p-3 shadow-lg ${className}`}>
      <h4 className="text-sm font-semibold text-earth-900 dark:text-earth-100 mb-2 flex items-center gap-2">
        <Layers size={14} />
        图例
      </h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-forest-600" />
          <span className="text-earth-600 dark:text-earth-400">录音地点</span>
        </div>
        <div>
          <p className="text-earth-600 dark:text-earth-400 mb-1">声音丰富度</p>
          <div className="h-3 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" />
          <div className="flex justify-between text-[10px] text-earth-500 mt-0.5">
            <span>低</span>
            <span>高</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MapStatsProps {
  recordings: Recording[];
  className?: string;
}

export const MapStats: React.FC<MapStatsProps> = ({ recordings, className }) => {
  const uniqueLocations = new Set(
    recordings
      .filter(r => r.gpsLocation)
      .map(r => `${r.gpsLocation!.latitude.toFixed(2)},${r.gpsLocation!.longitude.toFixed(2)}`)
  ).size;

  const totalTags = new Set(
    recordings.flatMap(r => r.tags.map(t => t.id))
  ).size;

  return (
    <div className={`absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-forest-900/95 backdrop-blur-sm rounded-lg p-3 shadow-lg ${className}`}>
      <h4 className="text-sm font-semibold text-earth-900 dark:text-earth-100 mb-2 flex items-center gap-2">
        <MapPin size={14} />
        统计信息
      </h4>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-earth-500 dark:text-earth-400">录音数量</span>
          <span className="font-semibold text-earth-900 dark:text-earth-100">{recordings.length}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-earth-500 dark:text-earth-400">地点数量</span>
          <span className="font-semibold text-earth-900 dark:text-earth-100">{uniqueLocations}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-earth-500 dark:text-earth-400">声音种类</span>
          <span className="font-semibold text-earth-900 dark:text-earth-100">{totalTags}</span>
        </div>
      </div>
    </div>
  );
};
