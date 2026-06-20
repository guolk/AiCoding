import { useState, useMemo } from 'react';
import {
  Clock, MapPin, User, Plus, Edit2, Trash2, GripVertical,
  Calendar as CalendarIcon, Filter, X, FileText,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  formatTime, formatDate, getScheduleCategoryText,
} from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { ScheduleItem } from '@/types';

type ScheduleCategory = 'ceremony' | 'banquet' | 'performance' | 'preparation' | 'other';

const getBadgeVariant = (category: string): 'accent' | 'primary' | 'champagne' | 'gray' | 'secondary' => {
  const variants: Record<string, 'accent' | 'primary' | 'champagne' | 'gray' | 'secondary'> = {
    ceremony: 'accent',
    banquet: 'primary',
    performance: 'champagne',
    preparation: 'gray',
    other: 'secondary',
  };
  return variants[category] || 'gray';
};

const categoryOptions = [
  { value: 'all', label: '全部' },
  { value: 'ceremony', label: '典礼' },
  { value: 'banquet', label: '宴席' },
  { value: 'performance', label: '表演' },
  { value: 'preparation', label: '准备' },
  { value: 'other', label: '其他' },
];

const scheduleCategoryOptions = categoryOptions.filter(c => c.value !== 'all');

const emptyScheduleItem: Omit<ScheduleItem, 'id'> = {
  eventId: '',
  title: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  responsible: '',
  order: 0,
  category: 'preparation',
};

export default function EventSchedule() {
  const {
    getCurrentEvent, scheduleItems, addScheduleItem,
    updateScheduleItem, deleteScheduleItem, reorderScheduleItems,
    currentEventId,
  } = useAppStore();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState(emptyScheduleItem);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [timeError, setTimeError] = useState<string>('');

  const event = getCurrentEvent();

  const filteredItems = useMemo(() => {
    let items = [...scheduleItems]
      .filter(s => s.eventId === currentEventId)
      .sort((a, b) => a.order - b.order);
    
    if (activeFilter !== 'all') {
      items = items.filter(s => s.category === activeFilter);
    }
    return items;
  }, [scheduleItems, currentEventId, activeFilter]);

  const handleAdd = () => {
    setEditingItem(null);
    setTimeError('');
    setFormData({
      ...emptyScheduleItem,
      eventId: currentEventId,
      order: filteredItems.length,
    });
    setShowModal(true);
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setTimeError('');
    setFormData({
      ...item,
      startTime: item.startTime.slice(0, 16),
      endTime: item.endTime.slice(0, 16),
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个日程项吗？')) {
      deleteScheduleItem(id);
    }
  };

  const validateTime = (): boolean => {
    if (!formData.startTime || !formData.endTime) {
      setTimeError('');
      return false;
    }
    const start = new Date(formData.startTime).getTime();
    const end = new Date(formData.endTime).getTime();
    if (end <= start) {
      setTimeError('结束时间必须晚于开始时间');
      return false;
    }
    setTimeError('');
    return true;
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.startTime || !formData.endTime) return;
    if (!validateTime()) return;

    const data = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    };

    if (editingItem) {
      updateScheduleItem(editingItem.id, data);
    } else {
      addScheduleItem(data);
    }
    setShowModal(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...filteredItems];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    const reorderedItems = newItems.map((item, i) => ({ ...item, order: i }));
    reorderScheduleItems(reorderedItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getDuration = (start: string, end: string): string => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
    }
    return `${mins}分钟`;
  };

  if (!event) return null;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-slide-up">
        <div>
          <h2 className="text-2xl font-display font-semibold text-accent-500">
            日程排期
          </h2>
          <p className="text-warmGray-500 mt-1">
            精细化管理活动当天的每一分钟
          </p>
        </div>
        <Button onClick={handleAdd} leftIcon={<Plus className="w-4 h-4" />}>
          添加日程
        </Button>
      </div>

      <Card className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Filter className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-accent-500">筛选类别</h3>
            <p className="text-sm text-warmGray-500">按日程类型筛选查看</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeFilter === option.value
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-warmGray-100 text-warmGray-600 hover:bg-warmGray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-300 to-primary-200" />
        
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-warmGray-300 mx-auto mb-4" />
            <p className="text-warmGray-500">暂无日程安排</p>
            <Button variant="secondary" className="mt-4" onClick={handleAdd}>
              添加第一个日程
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative pl-20 transition-all duration-200 ${
                  draggedIndex === index ? 'opacity-50 scale-98' : ''
                }`}
              >
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-4 border-primary-400 shadow-md z-10" />
                
                <Card className="hover:shadow-cardHover transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div
                      className="cursor-grab active:cursor-grabbing p-2 -ml-2 rounded-lg hover:bg-warmGray-100 transition-colors text-warmGray-400"
                      title="拖拽排序"
                    >
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 text-primary-600 font-semibold">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                        </div>
                        <span className="text-sm text-warmGray-500">
                          （{getDuration(item.startTime, item.endTime)}）
                        </span>
                        <Badge variant={getBadgeVariant(item.category)}>
                          {getScheduleCategoryText(item.category)}
                        </Badge>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-warmGray-800 mb-2">
                        {item.title}
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-warmGray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span>{item.responsible}</span>
                        </div>
                      </div>
                      
                      {item.description && (
                        <div className="flex items-start gap-2 mt-2 text-sm text-warmGray-500">
                          <FileText className="w-4 h-4 text-warmGray-400 flex-shrink-0 mt-0.5" />
                          <p>{item.description}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="p-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? '编辑日程' : '添加日程'}
        description={editingItem ? '修改日程项的详细信息' : '添加一个新的日程项到排期表'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>取消</Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title.trim() || !formData.startTime || !formData.endTime}
            >
              {editingItem ? '保存修改' : '添加日程'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="日程标题"
              placeholder="例如：新娘化妆"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Select
              label="日程类别"
              value={formData.category}
              options={scheduleCategoryOptions}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ScheduleCategory })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="开始时间"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => {
                setFormData({ ...formData, startTime: e.target.value });
                if (formData.endTime) {
                  const start = new Date(e.target.value).getTime();
                  const end = new Date(formData.endTime).getTime();
                  if (end <= start) setTimeError('结束时间必须晚于开始时间');
                  else setTimeError('');
                }
              }}
              error={timeError ? ' ' : undefined}
              required
            />
            <Input
              label="结束时间"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => {
                setFormData({ ...formData, endTime: e.target.value });
                if (formData.startTime) {
                  const start = new Date(formData.startTime).getTime();
                  const end = new Date(e.target.value).getTime();
                  if (end <= start) setTimeError('结束时间必须晚于开始时间');
                  else setTimeError('');
                }
              }}
              error={timeError ? ' ' : undefined}
              required
            />
          </div>
          {timeError && (
            <p className="text-sm text-red-500 flex items-center gap-1 -mt-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {timeError}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="地点"
              placeholder="例如：新娘家"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              label="负责人"
              placeholder="例如：化妆师王老师"
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
            />
          </div>
          <Textarea
            label="日程描述"
            placeholder="详细描述这个日程项的内容..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
