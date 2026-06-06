import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GpsPoint, Event } from '../../types';
import { formatDateTime, getEventType } from '../../utils';

import 'leaflet/dist/leaflet.css';

// 修复Leaflet的图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createEventIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-event-marker',
    html: `<div style="width: 24px; height: 24px; ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white;">●</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, map]);
  return null;
}

interface VoyageMapProps {
  gpsPoints?: GpsPoint[];
  events?: Event[];
  height?: string;
  showMarkers?: boolean;
}

export default function VoyageMap({ gpsPoints, events, height = '400px', showMarkers = true }: VoyageMapProps) {
  const mapRef = useRef<any>(null);

  if (!gpsPoints || gpsPoints.length === 0) {
    return (
      <div
        style={{ height }}
        className="bg-ocean-100 rounded-xl flex items-center justify-center"
      >
        <div className="text-center text-ocean-500">
          <div className="w-16 h-16 mx-auto mb-3 opacity-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="font-medium">暂无GPS轨迹数据</p>
        </div>
      </div>
    );
  }

  const positions: [number, number][] = gpsPoints.map((p) => [p.latitude, p.longitude]);
  const center: [number, number] = [
    gpsPoints.reduce((sum, p) => sum + p.latitude, 0) / gpsPoints.length,
    gpsPoints.reduce((sum, p) => sum + p.longitude, 0) / gpsPoints.length,
  ];

  const bounds = L.latLngBounds(positions);

  return (
    <div ref={mapRef} style={{ height }} className="rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} zoom={10} />
        <Polyline
          positions={positions}
          color="#0B3D91"
          weight={4}
          opacity={0.8}
          lineCap="round"
          lineJoin="round"
        />
        <Polyline
          positions={positions}
          color="#FF6B35"
          weight={2}
          opacity={1}
          dashArray="10, 10"
          className="animate-dash"
        />

        {showMarkers && (
          <>
            <Marker position={positions[0]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-ocean-800">起点</p>
                  <p className="text-gray-600">{formatDateTime(gpsPoints[0].timestamp)}</p>
                </div>
              </Popup>
            </Marker>
            <Marker position={positions[positions.length - 1]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-nautical-600">终点</p>
                  <p className="text-gray-600">
                    {formatDateTime(gpsPoints[gpsPoints.length - 1].timestamp)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {events?.map((event) => {
          const eventType = getEventType(event.type);
          return (
            <Marker
              key={event.id}
              position={[event.latitude, event.longitude]}
              icon={createEventIcon(eventType.color)}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{eventType.label}</p>
                  <p className="text-gray-600">{event.description}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatDateTime(event.timestamp)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
