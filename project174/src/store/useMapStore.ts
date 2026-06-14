import { create } from 'zustand';
import { HeatmapPoint } from '@/types';
import { generateHeatmapData, mockRecordings } from '@/data/recordings';

interface MapState {
  center: [number, number];
  zoom: number;
  heatmapPoints: HeatmapPoint[];
  selectedSeason: string | null;
  selectedTagCategory: string | null;
  showHeatmap: boolean;
  showMarkers: boolean;
  timeRange: [number, number];
  
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setSelectedSeason: (season: string | null) => void;
  setSelectedTagCategory: (category: string | null) => void;
  toggleHeatmap: () => void;
  toggleMarkers: () => void;
  setTimeRange: (range: [number, number]) => void;
  getFilteredHeatmapPoints: () => HeatmapPoint[];
  flyToLocation: (lat: number, lng: number, zoom?: number) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  center: [35.8617, 104.1954],
  zoom: 4,
  heatmapPoints: generateHeatmapData(mockRecordings),
  selectedSeason: null,
  selectedTagCategory: null,
  showHeatmap: true,
  showMarkers: true,
  timeRange: [0, 24],

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),

  setSelectedSeason: (season) => set({ selectedSeason: season }),
  setSelectedTagCategory: (category) => set({ selectedTagCategory: category }),

  toggleHeatmap: () => set((state) => ({ showHeatmap: !state.showHeatmap })),
  toggleMarkers: () => set((state) => ({ showMarkers: !state.showMarkers })),

  setTimeRange: (timeRange) => set({ timeRange }),

  getFilteredHeatmapPoints: () => {
    const { heatmapPoints, selectedSeason, selectedTagCategory, timeRange } = get();
    
    if (!selectedSeason && !selectedTagCategory && timeRange[0] === 0 && timeRange[1] === 24) {
      return heatmapPoints;
    }
    
    return heatmapPoints.map(point => ({
      ...point,
      intensity: Math.max(10, point.intensity * (0.5 + Math.random() * 0.5)),
    }));
  },

  flyToLocation: (lat, lng, zoom = 12) => {
    set({ center: [lat, lng], zoom });
  },
}));
