import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GpxPoint } from '../../utils/gpxParser';

interface MapViewProps {
  points: { lat: number; lng: number }[];
  height?: number;
}

const MapView: React.FC<MapViewProps> = ({ points, height = 400 }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  useEffect(() => {
    if (!mapRef.current || points.length === 0) return;
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }
    
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
    
    const map = L.map(mapRef.current).fitBounds(bounds, { padding: [50, 50] });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    const polyline = L.polyline(
      points.map(p => [p.lat, p.lng]),
      {
        color: '#2196F3',
        weight: 4,
        opacity: 0.8
      }
    ).addTo(map);
    
    if (points.length > 0) {
      L.marker([points[0].lat, points[0].lng], {
        icon: L.divIcon({
          className: 'start-marker',
          html: '<div style="background: #4CAF50; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map).bindPopup('起点');
      
      const lastPoint = points[points.length - 1];
      L.marker([lastPoint.lat, lastPoint.lng], {
        icon: L.divIcon({
          className: 'end-marker',
          html: '<div style="background: #F44336; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map).bindPopup('终点');
    }
    
    mapInstanceRef.current = map;
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [points]);
  
  if (points.length === 0) {
    return (
      <div className="map-container flex-center" style={{ height, background: '#f5f5f5' }}>
        <div className="text-secondary">暂无轨迹数据</div>
      </div>
    );
  }
  
  return (
    <div
      ref={mapRef}
      className="map-container"
      style={{ height }}
    />
  );
};

export default MapView;
