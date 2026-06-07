import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useSpaceStore } from '@/store/useSpaceStore';
import type { Room, FunctionArea } from '@/types';
import Toolbar, { ToolType } from './Toolbar';

interface Point {
  x: number;
  y: number;
}

interface CanvasState {
  scale: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  dragStart: Point;
  lastOffset: Point;
}

interface DrawingState {
  isDrawing: boolean;
  startPoint: Point | null;
  currentPoint: Point | null;
}

const GRID_SIZE = 20;
const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const SCALE_STEP = 0.1;
const WALL_THICKNESS = 15;
const DOOR_WIDTH = 90;
const WINDOW_WIDTH = 120;

const AREA_COLORS: Record<string, string> = {
  bed: '#D4A574',
  work: '#4ECDC4',
  rest: '#9B59B6',
  bath: '#3498DB',
  storage: '#F39C12',
  other: '#95A5A6',
};

const AREA_ICONS: Record<string, string> = {
  bed: '🛏️',
  work: '💻',
  rest: '🛋️',
  bath: '🚿',
  storage: '📦',
  other: '📄',
};

const FloorPlanCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { rooms, functionAreas } = useSpaceStore();

  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    lastOffset: { x: 0, y: 0 },
  });

  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startPoint: null,
    currentPoint: null,
  });

  const currentRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  }, [rooms, selectedRoomId]);

  const currentFunctionAreas = useMemo(() => {
    if (!currentRoom) return [];
    return functionAreas.filter((fa) => fa.roomId === currentRoom.id);
  }, [currentRoom, functionAreas]);

  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const x = (screenX - rect.left - canvasState.offsetX) / canvasState.scale;
      const y = (screenY - rect.top - canvasState.offsetY) / canvasState.scale;
      return { x, y };
    },
    [canvasState.offsetX, canvasState.offsetY, canvasState.scale]
  );

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const { scale, offsetX, offsetY } = canvasState;
      const scaledGridSize = GRID_SIZE * scale;

      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;

      const startX = Math.floor(-offsetX / scaledGridSize) * scaledGridSize;
      const startY = Math.floor(-offsetY / scaledGridSize) * scaledGridSize;

      for (let x = startX; x < width - offsetX; x += scaledGridSize) {
        ctx.beginPath();
        ctx.moveTo(x + offsetX, 0);
        ctx.lineTo(x + offsetX, height);
        ctx.stroke();
      }

      for (let y = startY; y < height - offsetY; y += scaledGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + offsetY);
        ctx.lineTo(width, y + offsetY);
        ctx.stroke();
      }

      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      const majorGridSize = scaledGridSize * 5;
      const majorStartX = Math.floor(-offsetX / majorGridSize) * majorGridSize;
      const majorStartY = Math.floor(-offsetY / majorGridSize) * majorGridSize;

      for (let x = majorStartX; x < width - offsetX; x += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x + offsetX, 0);
        ctx.lineTo(x + offsetX, height);
        ctx.stroke();
      }

      for (let y = majorStartY; y < height - offsetY; y += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + offsetY);
        ctx.lineTo(width, y + offsetY);
        ctx.stroke();
      }
    },
    [canvasState]
  );

  const drawRoomOutline = useCallback(
    (ctx: CanvasRenderingContext2D, room: Room) => {
      const { scale, offsetX, offsetY } = canvasState;
      const roomWidth = (room.width || 600) * scale;
      const roomHeight = (room.height || 500) * scale;
      const x = offsetX + 100 * scale;
      const y = offsetY + 100 * scale;
      const wallThickness = WALL_THICKNESS * scale;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x, y, roomWidth, roomHeight);

      ctx.strokeStyle = '#374151';
      ctx.lineWidth = wallThickness;
      ctx.strokeRect(
        x + wallThickness / 2,
        y + wallThickness / 2,
        roomWidth - wallThickness,
        roomHeight - wallThickness
      );

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        x + wallThickness,
        y + wallThickness,
        roomWidth - wallThickness * 2,
        roomHeight - wallThickness * 2
      );

      const doorWidth = DOOR_WIDTH * scale;
      const doorX = x + roomWidth * 0.3;
      const doorY = y;
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(doorX, doorY, doorWidth, wallThickness * 0.6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(doorX + 2, doorY + 2, doorWidth - 4, wallThickness * 0.6 - 4);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(doorX + doorWidth, doorY + wallThickness * 0.6);
      ctx.arc(
        doorX + doorWidth,
        doorY + wallThickness * 0.6,
        doorWidth,
        Math.PI,
        Math.PI * 1.5
      );
      ctx.stroke();

      const windowWidth = WINDOW_WIDTH * scale;
      const windowPositions = [
        { x: x + roomWidth * 0.1, y: y, horizontal: true },
        { x: x + roomWidth * 0.6, y: y, horizontal: true },
        { x: x, y: y + roomHeight * 0.4, horizontal: false },
      ];

      ctx.fillStyle = '#93c5fd';
      windowPositions.forEach((pos) => {
        if (pos.horizontal) {
          ctx.fillRect(pos.x, pos.y - wallThickness * 0.3, windowWidth, wallThickness * 0.3);
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.moveTo(pos.x + windowWidth / 2, pos.y - wallThickness * 0.3);
          ctx.lineTo(pos.x + windowWidth / 2, pos.y);
          ctx.stroke();
        } else {
          ctx.fillRect(pos.x - wallThickness * 0.3, pos.y, wallThickness * 0.3, windowWidth);
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.moveTo(pos.x - wallThickness * 0.3, pos.y + windowWidth / 2);
          ctx.lineTo(pos.x, pos.y + windowWidth / 2);
          ctx.stroke();
        }
      });

      if (currentRoom?.id === room.id) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3 * scale;
        ctx.setLineDash([10 * scale, 5 * scale]);
        ctx.strokeRect(
          x - 5 * scale,
          y - 5 * scale,
          roomWidth + 10 * scale,
          roomHeight + 10 * scale
        );
        ctx.setLineDash([]);
      }

      return { x, y, roomWidth, roomHeight, wallThickness };
    },
    [canvasState, currentRoom]
  );

  const drawFunctionAreas = useCallback(
    (ctx: CanvasRenderingContext2D, areas: FunctionArea[], roomBounds: { x: number; y: number; wallThickness: number }) => {
      const { scale, offsetX, offsetY } = canvasState;
      const { x: roomX, y: roomY, wallThickness } = roomBounds;

      areas.forEach((area) => {
        const areaX = roomX + wallThickness + area.x * scale;
        const areaY = roomY + wallThickness + area.y * scale;
        const areaWidth = area.width * scale;
        const areaHeight = area.height * scale;

        const color = AREA_COLORS[area.type] || area.color || '#95A5A6';

        ctx.fillStyle = color + '40';
        ctx.fillRect(areaX, areaY, areaWidth, areaHeight);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(areaX, areaY, areaWidth, areaHeight);

        ctx.fillStyle = color + '80';
        ctx.fillRect(areaX, areaY, areaWidth, 30 * scale);

        ctx.fillStyle = '#ffffff';
        ctx.font = `${12 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        const icon = AREA_ICONS[area.type] || '📄';
        ctx.fillText(`${icon} ${area.name}`, areaX + 8 * scale, areaY + 15 * scale);

        if (selectedAreaId === area.id) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3 * scale;
          ctx.setLineDash([8 * scale, 4 * scale]);
          ctx.strokeRect(
            areaX - 3 * scale,
            areaY - 3 * scale,
            areaWidth + 6 * scale,
            areaHeight + 6 * scale
          );
          ctx.setLineDash([]);
        }

        if (area.efficiencyScore !== undefined) {
          ctx.fillStyle = '#065f46';
          ctx.font = `bold ${11 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
          ctx.textAlign = 'right';
          ctx.fillText(
            `效率: ${area.efficiencyScore}%`,
            areaX + areaWidth - 8 * scale,
            areaY + areaHeight - 12 * scale
          );
        }

        ctx.fillStyle = '#374151';
        ctx.font = `${11 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(
          `${Math.round(area.width / 10)}m × ${Math.round(area.height / 10)}m`,
          areaX + 8 * scale,
          areaY + areaHeight - 12 * scale
        );
      });

      return { offsetX, offsetY };
    },
    [canvasState, selectedAreaId]
  );

  const drawDimensionMarkers = useCallback(
    (ctx: CanvasRenderingContext2D, roomBounds: { x: number; y: number; roomWidth: number; roomHeight: number; wallThickness: number }) => {
      const { scale } = canvasState;
      const { x, y, roomWidth, roomHeight, wallThickness } = roomBounds;
      const offset = 50 * scale;
      const markerSize = 8 * scale;

      ctx.strokeStyle = '#6b7280';
      ctx.fillStyle = '#6b7280';
      ctx.lineWidth = 1.5 * scale;
      ctx.font = `${12 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.beginPath();
      ctx.moveTo(x, y - offset);
      ctx.lineTo(x + roomWidth, y - offset);
      ctx.moveTo(x, y - offset - markerSize);
      ctx.lineTo(x, y - offset + markerSize);
      ctx.moveTo(x + roomWidth, y - offset - markerSize);
      ctx.lineTo(x + roomWidth, y - offset + markerSize);
      ctx.stroke();

      const widthMeters = Math.round((roomWidth - wallThickness * 2) / scale / 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        x + roomWidth / 2 - 35 * scale,
        y - offset - 12 * scale,
        70 * scale,
        24 * scale
      );
      ctx.fillStyle = '#374151';
      ctx.fillText(`${widthMeters}m`, x + roomWidth / 2, y - offset);

      ctx.beginPath();
      ctx.moveTo(x - offset, y);
      ctx.lineTo(x - offset, y + roomHeight);
      ctx.moveTo(x - offset - markerSize, y);
      ctx.lineTo(x - offset + markerSize, y);
      ctx.moveTo(x - offset - markerSize, y + roomHeight);
      ctx.lineTo(x - offset + markerSize, y + roomHeight);
      ctx.stroke();

      const heightMeters = Math.round((roomHeight - wallThickness * 2) / scale / 10);
      ctx.save();
      ctx.translate(x - offset, y + roomHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-35 * scale, -12 * scale, 70 * scale, 24 * scale);
      ctx.fillStyle = '#374151';
      ctx.fillText(`${heightMeters}m`, 0, 0);
      ctx.restore();

      currentFunctionAreas.forEach((area) => {
        const areaX = x + wallThickness + area.x * scale;
        const areaY = y + wallThickness + area.y * scale;
        const areaWidth = area.width * scale;
        const areaHeight = area.height * scale;
        const areaOffset = 25 * scale;

        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1 * scale;

        ctx.beginPath();
        ctx.moveTo(areaX, areaY + areaHeight + areaOffset);
        ctx.lineTo(areaX + areaWidth, areaY + areaHeight + areaOffset);
        ctx.moveTo(areaX, areaY + areaHeight + areaOffset - 4 * scale);
        ctx.lineTo(areaX, areaY + areaHeight + areaOffset + 4 * scale);
        ctx.moveTo(areaX + areaWidth, areaY + areaHeight + areaOffset - 4 * scale);
        ctx.lineTo(areaX + areaWidth, areaY + areaHeight + areaOffset + 4 * scale);
        ctx.stroke();

        ctx.fillStyle = '#6b7280';
        ctx.font = `${10 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        ctx.fillText(
          `${Math.round(area.width / 10)}m`,
          areaX + areaWidth / 2,
          areaY + areaHeight + areaOffset
        );
      });
    },
    [canvasState, currentFunctionAreas]
  );

  const drawRoomLabel = useCallback(
    (ctx: CanvasRenderingContext2D, room: Room, roomBounds: { x: number; y: number; roomWidth: number }) => {
      const { scale } = canvasState;
      const { x, y, roomWidth } = roomBounds;

      ctx.fillStyle = '#1f2937';
      ctx.font = `bold ${16 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(room.name, x + roomWidth / 2, y + 30 * scale);

      const area = ((room.width || 600) * (room.height || 500)) / 100;
      ctx.font = `${12 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      ctx.fillStyle = '#6b7280';
      ctx.fillText(
        `面积: ${Math.round(area)}㎡ · 类型: ${room.type}`,
        x + roomWidth / 2,
        y + 55 * scale
      );
    },
    [canvasState]
  );

  const drawPreviewShape = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!drawingState.isDrawing || !drawingState.startPoint || !drawingState.currentPoint) {
        return;
      }

      const { scale, offsetX, offsetY } = canvasState;
      const { startPoint, currentPoint } = drawingState;

      const x1 = Math.min(startPoint.x, currentPoint.x) * scale + offsetX;
      const y1 = Math.min(startPoint.y, currentPoint.y) * scale + offsetY;
      const width = Math.abs(currentPoint.x - startPoint.x) * scale;
      const height = Math.abs(currentPoint.y - startPoint.y) * scale;

      if (activeTool === 'wall') {
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = WALL_THICKNESS * scale;
        ctx.setLineDash([5 * scale, 5 * scale]);
        ctx.beginPath();
        ctx.moveTo(startPoint.x * scale + offsetX, startPoint.y * scale + offsetY);
        ctx.lineTo(currentPoint.x * scale + offsetX, currentPoint.y * scale + offsetY);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (activeTool === 'area') {
        ctx.fillStyle = '#4ECDC440';
        ctx.fillRect(x1, y1, width, height);
        ctx.strokeStyle = '#4ECDC4';
        ctx.lineWidth = 2 * scale;
        ctx.setLineDash([5 * scale, 5 * scale]);
        ctx.strokeRect(x1, y1, width, height);
        ctx.setLineDash([]);
      } else if (activeTool === 'dimension') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(startPoint.x * scale + offsetX, startPoint.y * scale + offsetY);
        ctx.lineTo(currentPoint.x * scale + offsetX, currentPoint.y * scale + offsetY);
        ctx.stroke();

        const distance = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2)
        );
        const meters = Math.round(distance / 10);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
          ((startPoint.x + currentPoint.x) / 2) * scale + offsetX - 25 * scale,
          ((startPoint.y + currentPoint.y) / 2) * scale + offsetY - 10 * scale,
          50 * scale,
          20 * scale
        );
        ctx.fillStyle = '#ef4444';
        ctx.font = `bold ${12 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `${meters}m`,
          ((startPoint.x + currentPoint.x) / 2) * scale + offsetX,
          ((startPoint.y + currentPoint.y) / 2) * scale + offsetY
        );
      }
    },
    [activeTool, canvasState, drawingState]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, width, height);

    drawGrid(ctx, width, height);

    if (currentRoom) {
      const roomBounds = drawRoomOutline(ctx, currentRoom);
      drawRoomLabel(ctx, currentRoom, roomBounds);
      drawFunctionAreas(ctx, currentFunctionAreas, roomBounds);
      drawDimensionMarkers(ctx, roomBounds);
    }

    drawPreviewShape(ctx);
  }, [
    currentRoom,
    currentFunctionAreas,
    drawGrid,
    drawRoomOutline,
    drawRoomLabel,
    drawFunctionAreas,
    drawDimensionMarkers,
    drawPreviewShape,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      render();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const worldPoint = screenToWorld(e.clientX, e.clientY);

      if (activeTool === 'select') {
        setCanvasState((prev) => ({
          ...prev,
          isDragging: true,
          dragStart: { x: e.clientX, y: e.clientY },
          lastOffset: { x: prev.offsetX, y: prev.offsetY },
        }));

        let clickedArea = null;
        if (currentRoom) {
          for (const area of currentFunctionAreas) {
            const areaX = 100 + WALL_THICKNESS + area.x;
            const areaY = 100 + WALL_THICKNESS + area.y;
            if (
              worldPoint.x >= areaX &&
              worldPoint.x <= areaX + area.width &&
              worldPoint.y >= areaY &&
              worldPoint.y <= areaY + area.height
            ) {
              clickedArea = area;
              break;
            }
          }
        }
        setSelectedAreaId(clickedArea?.id || null);
      } else if (['wall', 'area', 'dimension'].includes(activeTool)) {
        setDrawingState({
          isDrawing: true,
          startPoint: worldPoint,
          currentPoint: worldPoint,
        });
      } else if (activeTool === 'delete') {
        if (selectedAreaId) {
          useSpaceStore.getState().deleteFunctionArea(selectedAreaId);
          setSelectedAreaId(null);
        }
      }
    },
    [activeTool, screenToWorld, currentRoom, currentFunctionAreas, selectedAreaId]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (canvasState.isDragging && activeTool === 'select') {
        const dx = e.clientX - canvasState.dragStart.x;
        const dy = e.clientY - canvasState.dragStart.y;
        setCanvasState((prev) => ({
          ...prev,
          offsetX: prev.lastOffset.x + dx,
          offsetY: prev.lastOffset.y + dy,
        }));
      } else if (drawingState.isDrawing) {
        const worldPoint = screenToWorld(e.clientX, e.clientY);
        setDrawingState((prev) => ({
          ...prev,
          currentPoint: worldPoint,
        }));
      }
    },
    [canvasState.isDragging, canvasState.dragStart, activeTool, drawingState.isDrawing, screenToWorld]
  );

  const handleMouseUp = useCallback(() => {
    if (canvasState.isDragging) {
      setCanvasState((prev) => ({
        ...prev,
        isDragging: false,
      }));
    }

    if (drawingState.isDrawing && drawingState.startPoint && drawingState.currentPoint) {
      const { startPoint, currentPoint } = drawingState;

      if (activeTool === 'area' && currentRoom) {
        const x = Math.min(startPoint.x, currentPoint.x) - 100 - WALL_THICKNESS;
        const y = Math.min(startPoint.y, currentPoint.y) - 100 - WALL_THICKNESS;
        const width = Math.abs(currentPoint.x - startPoint.x);
        const height = Math.abs(currentPoint.y - startPoint.y);

        if (width > 20 && height > 20) {
          useSpaceStore.getState().addFunctionArea({
            roomId: currentRoom.id,
            type: 'other',
            name: '新区域',
            x: Math.max(0, x),
            y: Math.max(0, y),
            width,
            height,
            color: AREA_COLORS.other,
          });
        }
      }

      setDrawingState({
        isDrawing: false,
        startPoint: null,
        currentPoint: null,
      });
    }
  }, [canvasState.isDragging, drawingState, activeTool, currentRoom]);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
      const newScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, canvasState.scale + delta)
      );

      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaleRatio = newScale / canvasState.scale;
      const newOffsetX = mouseX - (mouseX - canvasState.offsetX) * scaleRatio;
      const newOffsetY = mouseY - (mouseY - canvasState.offsetY) * scaleRatio;

      setCanvasState((prev) => ({
        ...prev,
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      }));
    },
    [canvasState.scale, canvasState.offsetX, canvasState.offsetY]
  );

  const handleZoomIn = useCallback(() => {
    setCanvasState((prev) => ({
      ...prev,
      scale: Math.min(MAX_SCALE, prev.scale + SCALE_STEP),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCanvasState((prev) => ({
      ...prev,
      scale: Math.max(MIN_SCALE, prev.scale - SCALE_STEP),
    }));
  }, []);

  const handleReset = useCallback(() => {
    setCanvasState({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      lastOffset: { x: 0, y: 0 },
    });
    setSelectedAreaId(null);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <Toolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        scale={canvasState.scale}
      />

      {rooms.length > 1 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">选择房间:</span>
          <div className="flex gap-2 flex-wrap">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  setSelectedRoomId(room.id);
                  setSelectedAreaId(null);
                }}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  currentRoom?.id === room.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {room.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ minHeight: '500px' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`w-full h-full ${
            activeTool === 'select'
              ? canvasState.isDragging
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : activeTool === 'delete'
              ? 'cursor-not-allowed'
              : 'cursor-crosshair'
          }`}
        />

        {selectedAreaId && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 min-w-[200px]">
            <h4 className="font-medium text-gray-900 mb-2">选中区域</h4>
            {currentFunctionAreas.find((fa) => fa.id === selectedAreaId) && (
              <>
                <p className="text-sm text-gray-600">
                  名称: {currentFunctionAreas.find((fa) => fa.id === selectedAreaId)?.name}
                </p>
                <p className="text-sm text-gray-600">
                  类型: {currentFunctionAreas.find((fa) => fa.id === selectedAreaId)?.type}
                </p>
                <p className="text-sm text-gray-600">
                  尺寸:{' '}
                  {Math.round(
                    (currentFunctionAreas.find((fa) => fa.id === selectedAreaId)?.width || 0) / 10
                  )}
                  m ×{' '}
                  {Math.round(
                    (currentFunctionAreas.find((fa) => fa.id === selectedAreaId)?.height || 0) / 10
                  )}
                  m
                </p>
                <p className="text-sm text-gray-600">
                  面积:{' '}
                  {Math.round(
                    ((currentFunctionAreas.find((fa) => fa.id === selectedAreaId)?.width || 0) *
                      (currentFunctionAreas.find((fa) => fa.id === selectedAreaId)?.height ||
                        0)) /
                      100
                  )}
                  ㎡
                </p>
              </>
            )}
          </div>
        )}

        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow px-3 py-2 text-xs text-gray-600">
          <p>提示: 滚轮缩放 | 拖拽平移 | 选择区域可查看详情</p>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
