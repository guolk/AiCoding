import React, { useState, useMemo } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import FloorPlanCanvas from '@/components/canvas/FloorPlanCanvas';
import { useSpaceStore } from '@/store/useSpaceStore';
import type { Room, FunctionArea } from '@/types';
import { cn } from '@/lib/utils';

const ROOM_TYPE_LABELS: Record<string, string> = {
  bedroom: '卧室',
  living: '客厅',
  living_room: '客厅',
  kitchen: '厨房',
  bathroom: '卫生间',
  balcony: '阳台',
  other: '其他',
};

const AREA_TYPE_LABELS: Record<string, string> = {
  bed: '睡眠区',
  work: '工作区',
  rest: '休息区',
  bath: '卫浴区',
  storage: '储物区',
  other: '其他',
  sleeping: '睡眠区',
  relaxation: '休闲区',
  dressing: '更衣区',
  reception: '会客区',
  reading: '阅读区',
  entrance: '玄关区',
  washing: '洗漱区',
  toilet: '如厕区',
  shower: '淋浴区',
};

const AREA_TYPE_ICONS: Record<string, string> = {
  bed: '🛏️',
  work: '💻',
  rest: '🛋️',
  bath: '🚿',
  storage: '📦',
  other: '📄',
  sleeping: '🛏️',
  relaxation: '☕',
  dressing: '👗',
  reception: '🪑',
  reading: '📚',
  entrance: '🚪',
  washing: '🚰',
  toilet: '🚽',
  shower: '🚿',
};

const getEfficiencyColor = (score: number) => {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

const getEfficiencyBgColor = (score: number) => {
  if (score >= 85) return 'bg-green-100';
  if (score >= 70) return 'bg-blue-100';
  if (score >= 50) return 'bg-yellow-100';
  return 'bg-red-100';
};

const getEfficiencyLabel = (score: number) => {
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '中等';
  if (score >= 60) return '及格';
  return '待优化';
};

export default function SpacePlanning() {
  const { rooms, functionAreas } = useSpaceStore();
  const [activeTab, setActiveTab] = useState('floorplan');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const currentRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  }, [rooms, selectedRoomId]);

  const currentAreas = useMemo(() => {
    if (!currentRoom) return [];
    return functionAreas.filter((fa) => fa.roomId === currentRoom.id);
  }, [currentRoom, functionAreas]);

  const selectedArea = useMemo(() => {
    return functionAreas.find((fa) => fa.id === selectedAreaId);
  }, [functionAreas, selectedAreaId]);

  const roomEfficiencyData = useMemo(() => {
    return rooms.map((room) => {
      const areas = functionAreas.filter((fa) => fa.roomId === room.id);
      const totalArea = (room.width || 600) * (room.height || 500) / 100;
      const usedArea = areas.reduce((sum, fa) => sum + (fa.width * fa.height) / 100, 0);
      const utilizationRate = totalArea > 0 ? Math.round((usedArea / totalArea) * 100) : 0;
      const avgEfficiency = areas.length > 0
        ? Math.round(areas.reduce((sum, fa) => sum + (fa.efficiencyScore || 70), 0) / areas.length)
        : 0;
      const wastedArea = Math.max(0, totalArea - usedArea);

      return {
        roomId: room.id,
        roomName: room.name,
        totalArea: Math.round(totalArea),
        usedArea: Math.round(usedArea),
        wastedArea: Math.round(wastedArea),
        utilizationRate,
        avgEfficiency,
      };
    });
  }, [rooms, functionAreas]);

  const currentRoomEfficiency = useMemo(() => {
    return roomEfficiencyData.find((d) => d.roomId === currentRoom?.id) || roomEfficiencyData[0];
  }, [roomEfficiencyData, currentRoom]);

  const optimizationSuggestions = useMemo(() => {
    const suggestions = [];
    const data = currentRoomEfficiency;

    if (!data) return [];

    if (data.utilizationRate < 60) {
      suggestions.push({
        type: 'warning',
        title: '空间利用率偏低',
        description: `当前房间利用率仅为${data.utilizationRate}%，建议增加功能区域划分，充分利用${data.wastedArea}㎡的闲置空间。`,
      });
    }

    if (data.avgEfficiency < 70) {
      suggestions.push({
        type: 'info',
        title: '功能区域效率待提升',
        description: '部分功能区域的布局可以优化，建议调整区域位置和尺寸，减少动线交叉。',
      });
    }

    const lowEfficiencyAreas = currentAreas.filter((fa) => (fa.efficiencyScore || 70) < 60);
    lowEfficiencyAreas.forEach((area) => {
      suggestions.push({
        type: 'danger',
        title: `「${area.name}」区域效率低下`,
        description: `该区域效率评分仅为${area.efficiencyScore || 0}分，建议重新规划区域尺寸或调整家具布局。`,
      });
    });

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        title: '空间规划良好',
        description: '当前房间的空间利用率和功能区域效率都处于较好水平，继续保持！',
      });
    }

    return suggestions;
  }, [currentRoomEfficiency, currentAreas]);

  return (
    <PageLayout>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">空间规划</h1>
          <p className="text-gray-500">可视化平面图绘制、功能区域划分与空间利用效率评估</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="floorplan">平面图绘制</TabsTrigger>
            <TabsTrigger value="areas">功能区域</TabsTrigger>
            <TabsTrigger value="efficiency">效率评估</TabsTrigger>
          </TabsList>

          <TabsContent value="floorplan" className="flex-1 mt-4">
            <div className="h-full grid grid-cols-12 gap-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
              <div className="col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">房间列表</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {rooms.map((room) => {
                      const area = (room.width || 600) * (room.height || 500) / 100;
                      const isActive = currentRoom?.id === room.id;
                      return (
                        <button
                          key={room.id}
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            setSelectedAreaId(null);
                          }}
                          className={cn(
                            'w-full text-left p-4 rounded-lg border transition-all',
                            isActive
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{room.name}</span>
                            <Badge variant={isActive ? 'default' : 'outline'}>
                              {ROOM_TYPE_LABELS[room.type] || room.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            <span>面积: {Math.round(area)}㎡</span>
                            <span className="mx-2">·</span>
                            <span>{functionAreas.filter(fa => fa.roomId === room.id).length}个功能区</span>
                          </div>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-6">
                <div className="h-full">
                  <FloorPlanCanvas />
                </div>
              </div>

              <div className="col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">属性面板</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedArea ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: selectedArea.color + '30' }}>
                            {AREA_TYPE_ICONS[selectedArea.type] || '📄'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{selectedArea.name}</h3>
                            <Badge variant="outline">{AREA_TYPE_LABELS[selectedArea.type] || selectedArea.type}</Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">宽度</span>
                            <span className="font-medium">{Math.round(selectedArea.width / 10)}m</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">高度</span>
                            <span className="font-medium">{Math.round(selectedArea.height / 10)}m</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">面积</span>
                            <span className="font-medium">{Math.round(selectedArea.width * selectedArea.height / 100)}㎡</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">位置</span>
                            <span className="font-medium">({Math.round(selectedArea.x / 10)}, {Math.round(selectedArea.y / 10)})</span>
                          </div>
                          {selectedArea.efficiencyScore !== undefined && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-500">效率评分</span>
                              <span className={cn('font-bold text-lg', getEfficiencyColor(selectedArea.efficiencyScore))}>
                                {selectedArea.efficiencyScore}分
                              </span>
                            </div>
                          )}
                        </div>

                        {selectedArea.efficiencyScore !== undefined && (
                          <div className="mt-4 p-4 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">效率等级</span>
                              <Badge className={cn(getEfficiencyBgColor(selectedArea.efficiencyScore), getEfficiencyColor(selectedArea.efficiencyScore))}>
                                {getEfficiencyLabel(selectedArea.efficiencyScore)}
                              </Badge>
                            </div>
                            <Progress value={selectedArea.efficiencyScore} className="h-2" />
                          </div>
                        )}
                      </div>
                    ) : currentRoom ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">
                            🏠
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{currentRoom.name}</h3>
                            <Badge variant="outline">{ROOM_TYPE_LABELS[currentRoom.type] || currentRoom.type}</Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">房间宽度</span>
                            <span className="font-medium">{Math.round((currentRoom.width || 600) / 10)}m</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">房间高度</span>
                            <span className="font-medium">{Math.round((currentRoom.height || 500) / 10)}m</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">总面积</span>
                            <span className="font-medium">{Math.round((currentRoom.width || 600) * (currentRoom.height || 500) / 100)}㎡</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">功能区域</span>
                            <span className="font-medium">{currentAreas.length}个</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-500">已利用面积</span>
                            <span className="font-medium">{currentRoomEfficiency?.usedArea || 0}㎡</span>
                          </div>
                        </div>

                        <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                          <p className="text-sm text-blue-700">
                            💡 点击画布中的功能区域可查看详细属性和效率评分
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-4xl mb-3">📐</p>
                        <p>请从左侧选择一个房间</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="areas" className="flex-1 mt-4">
            <div className="h-full grid grid-cols-12 gap-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
              <div className="col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">房间列表</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {rooms.map((room) => {
                      const area = (room.width || 600) * (room.height || 500) / 100;
                      const isActive = currentRoom?.id === room.id;
                      return (
                        <button
                          key={room.id}
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            setSelectedAreaId(null);
                          }}
                          className={cn(
                            'w-full text-left p-4 rounded-lg border transition-all',
                            isActive
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{room.name}</span>
                            <Badge variant={isActive ? 'default' : 'outline'}>
                              {ROOM_TYPE_LABELS[room.type] || room.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            <span>面积: {Math.round(area)}㎡</span>
                            <span className="mx-2">·</span>
                            <span>{functionAreas.filter(fa => fa.roomId === room.id).length}个功能区</span>
                          </div>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-6">
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      {currentRoom?.name} - 功能区域列表
                    </CardTitle>
                    <Button size="sm">
                      + 添加区域
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentAreas.map((area) => {
                        const areaSize = Math.round(area.width * area.height / 100);
                        const isSelected = selectedAreaId === area.id;
                        return (
                          <div
                            key={area.id}
                            onClick={() => setSelectedAreaId(area.id)}
                            className={cn(
                              'p-4 rounded-lg border cursor-pointer transition-all',
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                                style={{ backgroundColor: area.color + '30' }}
                              >
                                {AREA_TYPE_ICONS[area.type] || '📄'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-gray-900">{area.name}</h4>
                                  <Badge variant="outline">{AREA_TYPE_LABELS[area.type] || area.type}</Badge>
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                  {Math.round(area.width / 10)}m × {Math.round(area.height / 10)}m · {areaSize}㎡
                                </div>
                                {area.efficiencyScore !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">效率:</span>
                                    <Progress value={area.efficiencyScore} className="h-1.5 flex-1 max-w-[120px]" />
                                    <span className={cn('text-xs font-medium', getEfficiencyColor(area.efficiencyScore))}>
                                      {area.efficiencyScore}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {currentAreas.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                          <p className="text-4xl mb-3">📋</p>
                          <p>该房间暂无功能区域</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">区域详情</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedArea ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: selectedArea.color + '30' }}>
                            {AREA_TYPE_ICONS[selectedArea.type] || '📄'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{selectedArea.name}</h3>
                            <Badge variant="outline">{AREA_TYPE_LABELS[selectedArea.type] || selectedArea.type}</Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">尺寸</span>
                            <span className="font-medium">{Math.round(selectedArea.width / 10)}m × {Math.round(selectedArea.height / 10)}m</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">面积</span>
                            <span className="font-medium">{Math.round(selectedArea.width * selectedArea.height / 100)}㎡</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500">位置坐标</span>
                            <span className="font-medium">({Math.round(selectedArea.x / 10)}, {Math.round(selectedArea.y / 10)})</span>
                          </div>
                          {selectedArea.efficiencyScore !== undefined && (
                            <div className="py-2">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-500">效率评分</span>
                                <span className={cn('font-bold text-lg', getEfficiencyColor(selectedArea.efficiencyScore))}>
                                  {selectedArea.efficiencyScore}分
                                </span>
                              </div>
                              <Progress value={selectedArea.efficiencyScore} className="h-2" />
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-400">低</span>
                                <span className="text-xs text-gray-400">高</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 space-y-2">
                          <Button variant="outline" className="w-full">编辑区域</Button>
                          <Button variant="danger" className="w-full">删除区域</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-4xl mb-3">📝</p>
                        <p>请从左侧选择一个功能区域</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="efficiency" className="flex-1 mt-4">
            <div className="grid grid-cols-12 gap-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
              <div className="col-span-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">空间利用率总览</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-5xl font-bold text-blue-600 mb-2">
                        {currentRoomEfficiency?.utilizationRate || 0}%
                      </div>
                      <div className="text-gray-600 mb-4">每平方米利用率</div>
                      <Badge className={cn(getEfficiencyBgColor(currentRoomEfficiency?.avgEfficiency || 0), getEfficiencyColor(currentRoomEfficiency?.avgEfficiency || 0))}>
                        {getEfficiencyLabel(currentRoomEfficiency?.avgEfficiency || 0)}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 mb-3">各房间利用率</h4>
                      {roomEfficiencyData.map((data) => (
                        <div
                          key={data.roomId}
                          onClick={() => setSelectedRoomId(data.roomId)}
                          className={cn(
                            'p-3 rounded-lg cursor-pointer transition-all',
                            currentRoom?.id === data.roomId ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          )}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">{data.roomName}</span>
                            <span className={cn('font-bold', getEfficiencyColor(data.utilizationRate))}>
                              {data.utilizationRate}%
                            </span>
                          </div>
                          <Progress value={data.utilizationRate} className="h-2" />
                          <div className="flex justify-between mt-1 text-xs text-gray-500">
                            <span>已用 {data.usedArea}㎡</span>
                            <span>闲置 {data.wastedArea}㎡</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">空间浪费区域高亮</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-500">⚠️</span>
                        <span className="font-medium text-red-700">闲置空间警告</span>
                      </div>
                      <p className="text-sm text-red-600">
                        {currentRoom?.name} 共有 {currentRoomEfficiency?.wastedArea || 0}㎡ 空间未充分利用
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">功能区域效率排行</h4>
                      {[...currentAreas]
                        .sort((a, b) => (b.efficiencyScore || 0) - (a.efficiencyScore || 0))
                        .map((area, index) => (
                          <div
                            key={area.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                          >
                            <span className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                              index === 0 ? 'bg-yellow-400 text-white' :
                              index === 1 ? 'bg-gray-300 text-white' :
                              index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'
                            )}>
                              {index + 1}
                            </span>
                            <div
                              className="w-8 h-8 rounded flex items-center justify-center text-sm"
                              style={{ backgroundColor: area.color + '30' }}
                            >
                              {AREA_TYPE_ICONS[area.type] || '📄'}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">{area.name}</div>
                              <div className="text-xs text-gray-500">{AREA_TYPE_LABELS[area.type] || area.type}</div>
                            </div>
                            <div className="text-right">
                              <span className={cn('font-bold', getEfficiencyColor(area.efficiencyScore || 0))}>
                                {area.efficiencyScore || 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>

                    {currentAreas.some((fa) => (fa.efficiencyScore || 0) < 60) && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-3">低效区域（{'<'}60分）</h4>
                        <div className="space-y-2">
                          {currentAreas
                            .filter((fa) => (fa.efficiencyScore || 0) < 60)
                            .map((area) => (
                              <div
                                key={area.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100"
                              >
                                <div
                                  className="w-8 h-8 rounded flex items-center justify-center text-sm"
                                  style={{ backgroundColor: area.color + '30' }}
                                >
                                  {AREA_TYPE_ICONS[area.type] || '📄'}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 text-sm">{area.name}</div>
                                  <div className="text-xs text-red-500">
                                    建议: 调整尺寸或重新规划布局
                                  </div>
                                </div>
                                <span className="font-bold text-red-600">
                                  {area.efficiencyScore || 0}%
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">优化建议</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">💡</span>
                        <span className="font-semibold text-green-700">智能优化建议</span>
                      </div>
                      <p className="text-sm text-green-600">
                        基于空间分析为您提供以下优化方案
                      </p>
                    </div>

                    <div className="space-y-3">
                      {optimizationSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={cn(
                            'p-4 rounded-lg border',
                            suggestion.type === 'danger' ? 'bg-red-50 border-red-200' :
                            suggestion.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                            suggestion.type === 'success' ? 'bg-green-50 border-green-200' :
                            'bg-blue-50 border-blue-200'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">
                              {suggestion.type === 'danger' ? '🔴' :
                               suggestion.type === 'warning' ? '🟡' :
                               suggestion.type === 'success' ? '🟢' : '🔵'}
                            </span>
                            <div>
                              <h4 className={cn(
                                'font-medium mb-1',
                                suggestion.type === 'danger' ? 'text-red-700' :
                                suggestion.type === 'warning' ? 'text-yellow-700' :
                                suggestion.type === 'success' ? 'text-green-700' :
                                'text-blue-700'
                              )}>
                                {suggestion.title}
                              </h4>
                              <p className={cn(
                                'text-sm',
                                suggestion.type === 'danger' ? 'text-red-600' :
                                suggestion.type === 'warning' ? 'text-yellow-600' :
                                suggestion.type === 'success' ? 'text-green-600' :
                                'text-blue-600'
                              )}>
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-gray-700 mb-3">预计优化效果</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">
                            +{Math.max(0, 85 - (currentRoomEfficiency?.utilizationRate || 0))}%
                          </div>
                          <div className="text-xs text-gray-500">利用率提升</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {currentRoomEfficiency?.wastedArea || 0}㎡
                          </div>
                          <div className="text-xs text-gray-500">可利用空间</div>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">
                      一键应用优化方案
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
