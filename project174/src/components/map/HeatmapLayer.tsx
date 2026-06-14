import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { HeatmapPoint } from '@/types';

interface HeatmapLayerProps {
  points: HeatmapPoint[];
  radius?: number;
  maxOpacity?: number;
  blur?: number;
  gradient?: string[];
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
  points,
  radius = 50,
  maxOpacity = 0.8,
  blur = 30,
  gradient = [
    'rgba(34, 197, 94, 0)',
    'rgba(34, 197, 94, 0.4)',
    'rgba(234, 179, 8, 0.6)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(239, 68, 68, 1)',
  ],
}) => {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!map || points.length === 0) return;

    const canvas = document.createElement('canvas');

    const updateHeatmap = () => {
      try {
        const size = map.getSize();
        if (size.x <= 0 || size.y <= 0) return;

        canvas.width = size.x;
        canvas.height = size.y;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        points.forEach(point => {
          const containerPoint = map.latLngToContainerPoint([point.lat, point.lng]);
          
          const x = containerPoint.x;
          const y = containerPoint.y;
          
          const r = Math.max(1, radius);
          const gradientObj = ctx.createRadialGradient(x, y, 0, x, y, r);
          gradientObj.addColorStop(0, `rgba(255, 255, 255, ${point.intensity / 100 * maxOpacity})`);
          gradientObj.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = gradientObj;
          ctx.beginPath();
          ctx.arc(x, y, r + blur, 0, Math.PI * 2);
          ctx.fill();
        });

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 0) {
            const gradientIndex = Math.min(
              Math.floor((alpha / 255) * (gradient.length - 1) * (255 / maxOpacity / 255)),
              gradient.length - 1
            );
            const color = gradient[gradientIndex];
            
            const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
            if (rgbaMatch) {
              data[i] = parseInt(rgbaMatch[1]);
              data[i + 1] = parseInt(rgbaMatch[2]);
              data[i + 2] = parseInt(rgbaMatch[3]);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
      } catch (e) {
        console.warn('HeatmapLayer update failed:', e);
      }
    };

    const CustomLayer = L.Layer.extend({
      onAdd: function (map: L.Map) {
        const pane = map.getPane('overlayPane');
        if (pane) {
          pane.appendChild(canvas);
        }
        try {
          updateHeatmap();
        } catch (e) {
          console.warn('HeatmapLayer onAdd failed:', e);
        }
      },
      onRemove: function () {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      },
    });

    const layer = new CustomLayer();
    layer.addTo(map);
    layerRef.current = layer;

    map.on('moveend zoomend resize', updateHeatmap);

    return () => {
      map.off('moveend zoomend resize', updateHeatmap);
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points, radius, maxOpacity, blur, gradient.join(',')]);

  return null;
};

interface TimeAnimationProps {
  points: HeatmapPoint[];
  isPlaying: boolean;
  currentTime: number;
  totalTime: number;
  season?: string;
}

export const TimeAnimationHeatmap: React.FC<TimeAnimationProps> = ({
  points,
  isPlaying,
  currentTime,
  totalTime,
  season,
}) => {
  const filteredPoints = React.useMemo(() => {
    if (!season) return points;
    
    return points.map(p => ({
      ...p,
      intensity: Math.max(10, p.intensity * (0.3 + Math.random() * 0.7)),
    }));
  }, [points, season]);

  return (
    <HeatmapLayer 
      points={filteredPoints} 
      radius={60 + currentTime * 20}
      maxOpacity={0.6 + currentTime * 0.2}
    />
  );
};
