import { useState, useMemo, useRef, useCallback } from 'react';
import { parseISO, format, addMinutes, differenceInMinutes, isBefore, isAfter } from 'date-fns';
import { Clock, AlertTriangle, GripVertical, Bell, ChefHat, Flame } from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../../components/ui/Badge';
import type { TimelineItem } from '../../types';
import { formatDate, calculateTimeline } from '../../utils/date';
import { dishes } from '../../data/dishes';

interface TimelineProps {
  timeline: TimelineItem[];
  serviceDate: string;
  serviceTime: string;
  onUpdate: (timeline: TimelineItem[]) => void;
}

const dishColors = [
  'bg-primary-500',
  'bg-gold-500',
  'bg-coral-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-amber-500',
];

const statusConfig: Record<string, { label: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gold' }> = {
  pending: { label: '待处理', variant: 'secondary' },
  preparing: { label: '准备中', variant: 'primary' },
  cooking: { label: '烹饪中', variant: 'gold' },
  ready: { label: '已就绪', variant: 'success' },
  served: { label: '已上菜', variant: 'success' },
};

interface TimelineTask {
  id: string;
  dishId: string;
  dishName: string;
  type: 'prep' | 'cook';
  startTime: Date;
  endTime: Date;
  duration: number;
  color: string;
  servingOrder: number;
  status: string;
}

export function Timeline({ timeline, serviceDate, serviceTime, onUpdate }: TimelineProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    taskId: string;
    taskStartTime: Date;
    offset: number;
  } | null>(null);
  const [remindersEnabled, setRemindersEnabled] = useState<Set<string>>(new Set());

  const serveDateTime = useMemo(() => {
    if (!serviceDate) return new Date();
    const date = parseISO(serviceDate);
    if (serviceTime) {
      const [hours, minutes] = serviceTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    }
    return date;
  }, [serviceDate, serviceTime]);

  const dishList = useMemo(() => {
    return timeline.map((item) => {
      const dish = dishes.find((d) => d.id === item.dishId);
      return {
        ...item,
        prepTime: dish?.prepTime || 15,
        cookTime: dish?.cookTime || 15,
      };
    });
  }, [timeline]);

  const timelineTasks = useMemo((): TimelineTask[] => {
    const tasks: TimelineTask[] = [];
    
    timeline.forEach((item, index) => {
      const color = dishColors[index % dishColors.length];
      const start = parseISO(item.startTime);
      const end = parseISO(item.endTime);
      const totalDuration = differenceInMinutes(end, start);
      
      const dish = dishes.find((d) => d.id === item.dishId);
      const prepDuration = dish?.prepTime || Math.floor(totalDuration * 0.4);
      const cookDuration = dish?.cookTime || totalDuration - prepDuration;
      
      const prepEnd = addMinutes(start, prepDuration);
      
      tasks.push({
        id: `${item.dishId}-prep`,
        dishId: item.dishId,
        dishName: item.dishName,
        type: 'prep',
        startTime: start,
        endTime: prepEnd,
        duration: prepDuration,
        color,
        servingOrder: item.servingOrder,
        status: item.status,
      });
      
      tasks.push({
        id: `${item.dishId}-cook`,
        dishId: item.dishId,
        dishName: item.dishName,
        type: 'cook',
        startTime: prepEnd,
        endTime: end,
        duration: cookDuration,
        color,
        servingOrder: item.servingOrder,
        status: item.status,
      });
    });

    return tasks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [timeline]);

  const timeRange = useMemo(() => {
    if (timelineTasks.length === 0) {
      return {
        start: addMinutes(serveDateTime, -180),
        end: serveDateTime,
      };
    }
    
    const allStartTimes = timelineTasks.map((t) => t.startTime);
    const allEndTimes = timelineTasks.map((t) => t.endTime);
    
    const minStart = new Date(Math.min(...allStartTimes.map((d) => d.getTime())));
    const maxEnd = new Date(Math.max(...allEndTimes.map((d) => d.getTime())));
    
    return {
      start: addMinutes(minStart, -30),
      end: addMinutes(maxEnd, 30),
    };
  }, [timelineTasks, serveDateTime]);

  const totalMinutes = useMemo(() => 
    differenceInMinutes(timeRange.end, timeRange.start)
  , [timeRange]);

  const timeMarkers = useMemo(() => {
    const markers: Date[] = [];
    const interval = totalMinutes > 180 ? 30 : 15;
    
    let current = new Date(timeRange.start);
    current.setMinutes(Math.floor(current.getMinutes() / interval) * interval, 0, 0);
    
    while (isBefore(current, timeRange.end) || current.getTime() === timeRange.end.getTime()) {
      markers.push(new Date(current));
      current = addMinutes(current, interval);
    }
    
    return markers;
  }, [timeRange, totalMinutes]);

  const getTaskPosition = useCallback((task: TimelineTask) => {
    const startOffset = differenceInMinutes(task.startTime, timeRange.start);
    const left = (startOffset / totalMinutes) * 100;
    const width = (task.duration / totalMinutes) * 100;
    return { left: `${left}%`, width: `${width}%` };
  }, [timeRange, totalMinutes]);

  const getMinutesFromPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = relativeX / rect.width;
    return Math.round(percentage * totalMinutes);
  }, [totalMinutes]);

  const handleDragStart = useCallback((e: React.MouseEvent, taskId: string, taskStartTime: Date) => {
    e.preventDefault();
    setDraggedItem(taskId);
    
    const startMinutes = differenceInMinutes(taskStartTime, timeRange.start);
    const currentMinutes = getMinutesFromPosition(e.clientX);
    
    dragStateRef.current = {
      taskId,
      taskStartTime,
      offset: currentMinutes - startMinutes,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current) return;
      
      const { taskId, offset } = dragStateRef.current;
      const newMinutes = getMinutesFromPosition(e.clientX) - offset;
      const newStartTime = addMinutes(timeRange.start, Math.max(0, newMinutes));
      
      const [dishId, type] = taskId.split('-');
      const dishIndex = timeline.findIndex((t) => t.dishId === dishId);
      if (dishIndex === -1) return;

      const updated = [...timeline];
      const item = { ...updated[dishIndex] };
      const duration = differenceInMinutes(parseISO(item.endTime), parseISO(item.startTime));
      
      if (type === 'prep') {
        const maxStart = addMinutes(parseISO(item.endTime), -duration);
        if (isAfter(newStartTime, maxStart)) return;
        item.startTime = newStartTime.toISOString();
        item.endTime = addMinutes(newStartTime, duration).toISOString();
      } else {
        const dish = dishes.find((d) => d.id === dishId);
        const totalDuration = dish ? dish.prepTime + dish.cookTime : duration;
        const newEndTime = addMinutes(newStartTime, totalDuration);
        if (isAfter(newEndTime, serveDateTime)) return;
        item.endTime = newEndTime.toISOString();
        item.startTime = addMinutes(newEndTime, -duration).toISOString();
      }
      
      updated[dishIndex] = item;
      onUpdate(updated);
    };

    const handleMouseUp = () => {
      setDraggedItem(null);
      dragStateRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [timeline, timeRange, getMinutesFromPosition, onUpdate, serveDateTime]);

  const toggleReminder = (dishId: string) => {
    setRemindersEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(dishId)) {
        next.delete(dishId);
      } else {
        next.add(dishId);
      }
      return next;
    });
  };

  const formatTimeLabel = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const getRelativeTime = (date: Date) => {
    const diff = differenceInMinutes(serveDateTime, date);
    if (diff === 0) return '上菜时间';
    if (diff > 0) return `上菜前${diff}分钟`;
    return `上菜后${Math.abs(diff)}分钟`;
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    return timelineTasks
      .filter((task) => {
        const diff = differenceInMinutes(task.startTime, now);
        return diff > 0 && diff <= 15 && remindersEnabled.has(task.dishId);
      })
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const upcomingReminders = getUpcomingReminders();

  return (
    <div className="space-y-6">
      {upcomingReminders.length > 0 && (
        <div className="bg-coral-50 border border-coral-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-coral-600" />
            <h4 className="font-semibold text-coral-700">即将开始的任务</h4>
          </div>
          <div className="space-y-2">
            {upcomingReminders.map((task) => (
              <div key={task.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className={clsx('w-3 h-3 rounded-full', task.color)} />
                  <span className="font-medium text-primary-700">{task.dishName}</span>
                  <span className="text-sm text-gray-500">
                    {task.type === 'prep' ? '备菜' : '烹饪'}
                  </span>
                </div>
                <Badge variant="danger" size="sm">
                  {Math.round(differenceInMinutes(task.startTime, new Date()))}分钟后
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            <span className="text-gray-600">
              服务时间：{formatDate(serveDateTime, 'yyyy年MM月dd日 HH:mm')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-200" />
            <span className="text-sm text-gray-500">备菜</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <span className="text-sm text-gray-500">烹饪</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <GripVertical className="w-4 h-4" />
          拖拽调整时间
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-100">
          <div className="w-48 flex-shrink-0 p-3 bg-cream border-r border-gray-100">
            <span className="text-sm font-medium text-gray-600">菜品</span>
          </div>
          <div className="flex-1 relative">
            <div className="flex h-full">
              {timeMarkers.map((marker, index) => {
                const left = (differenceInMinutes(marker, timeRange.start) / totalMinutes) * 100;
                const isServeTime = marker.getTime() === serveDateTime.getTime();
                return (
                  <div
                    key={index}
                    className={clsx(
                      'absolute top-0 bottom-0 border-l',
                      isServeTime ? 'border-coral-300' : 'border-gray-100'
                    )}
                    style={{ left: `${left}%` }}
                  >
                    <span className={clsx(
                      'absolute -top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap',
                      isServeTime ? 'text-coral-600 font-semibold' : 'text-gray-400'
                    )}>
                      {formatTimeLabel(marker)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div ref={containerRef} className="relative">
          {timeline.map((item, rowIndex) => {
            const dishTasks = timelineTasks.filter((t) => t.dishId === item.dishId);
            const color = dishColors[rowIndex % dishColors.length];
            const status = statusConfig[item.status];
            const hasReminder = remindersEnabled.has(item.dishId);

            return (
              <div
                key={item.dishId}
                className="flex border-b border-gray-50 last:border-b-0"
              >
                <div className="w-48 flex-shrink-0 p-3 bg-cream/50 border-r border-gray-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <div className={clsx('w-3 h-3 rounded-full flex-shrink-0', color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="gold" size="sm">
                          #{item.servingOrder}
                        </Badge>
                        <span className="font-medium text-primary-700 truncate text-sm">
                          {item.dishName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                        <button
                          onClick={() => toggleReminder(item.dishId)}
                          className={clsx(
                            'p-1 rounded transition-colors',
                            hasReminder
                              ? 'text-coral-500 bg-coral-50'
                              : 'text-gray-400 hover:text-coral-500 hover:bg-coral-50'
                          )}
                          title={hasReminder ? '取消提醒' : '设置提醒'}
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative h-20">
                  {dishTasks.map((task) => {
                    const position = getTaskPosition(task);
                    const isDragging = draggedItem === task.id;

                    return (
                      <div
                        key={task.id}
                        className={clsx(
                          'absolute top-1/2 -translate-y-1/2 h-8 rounded-lg cursor-move',
                          'flex items-center justify-between px-2 select-none',
                          'transition-all duration-100',
                          task.type === 'prep' ? 'opacity-60' : '',
                          isDragging ? 'shadow-lg scale-105 z-10' : 'hover:shadow-md',
                          task.color
                        )}
                        style={{
                          left: position.left,
                          width: position.width,
                          minWidth: '60px',
                        }}
                        onMouseDown={(e) => handleDragStart(e, task.id, task.startTime)}
                      >
                        <GripVertical className="w-4 h-4 text-white/80" />
                        <div className="flex-1 px-1 overflow-hidden">
                          <div className="flex items-center gap-1 text-xs text-white font-medium">
                            {task.type === 'prep' ? (
                              <ChefHat className="w-3 h-3 flex-shrink-0" />
                            ) : (
                              <Flame className="w-3 h-3 flex-shrink-0" />
                            )}
                            {task.duration >= 10 && (
                              <span className="truncate">
                                {task.type === 'prep' ? '备菜' : '烹饪'} {task.duration}分钟
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] text-white/80 whitespace-nowrap">
                          {formatTimeLabel(task.startTime)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex border-t border-gray-100">
          <div className="w-48 flex-shrink-0 p-3 bg-cream border-r border-gray-100">
            <span className="text-sm font-medium text-gray-600">时间线</span>
          </div>
          <div className="flex-1 relative h-8">
            {timeMarkers.map((marker, index) => {
              const left = (differenceInMinutes(marker, timeRange.start) / totalMinutes) * 100;
              const isServeTime = marker.getTime() === serveDateTime.getTime();
              return (
                <div
                  key={index}
                  className="absolute bottom-0 text-[10px] text-gray-500 whitespace-nowrap -translate-x-1/2"
                  style={{ left: `${left}%` }}
                >
                  {isServeTime ? (
                    <span className="text-coral-600 font-medium">{getRelativeTime(marker)}</span>
                  ) : (
                    getRelativeTime(marker)
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {timeline.map((item, index) => {
          const start = parseISO(item.startTime);
          const end = parseISO(item.endTime);
          const color = dishColors[index % dishColors.length];

          return (
            <div
              key={item.dishId}
              className="bg-cream/50 rounded-lg p-4 border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={clsx('w-3 h-3 rounded-full', color)} />
                <Badge variant="gold" size="sm">#{item.servingOrder}</Badge>
              </div>
              <h4 className="font-medium text-primary-700 mb-2">{item.dishName}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-primary-400" />
                  <span>备菜：{formatTimeLabel(start)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-gold-500" />
                  <span>上菜：{formatTimeLabel(end)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-coral-500" />
                  <span>总时长：{differenceInMinutes(end, start)}分钟</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {timeline.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-primary-700 mb-2">
            暂无时间安排
          </h3>
          <p className="text-gray-500">
            选择菜单后将自动生成备餐时间安排
          </p>
        </div>
      )}
    </div>
  );
}
