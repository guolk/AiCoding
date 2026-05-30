import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Clock, Trash2, GripVertical,
  ChevronDown, ChevronUp, MessageSquare, Mic, Search, Users
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePerformances } from '../../context/PerformanceContext';
import { useJokes } from '../../context/JokeContext';
import { OCCASION_TYPES, OccasionType, JokeSlot, MATERIAL_CATEGORIES } from '../../types';
import { formatDuration, generateId } from '../../utils/duration';
import StarRating from '../../components/UI/StarRating';

interface SortableJokeSlotProps {
  slot: JokeSlot;
  jokeTitle: string;
  jokeDuration: number;
  transition: string;
  onUpdateTransition: (value: string) => void;
  onRemove: () => void;
  order: number;
}

function SortableJokeSlot({
  slot,
  jokeTitle,
  jokeDuration,
  transition,
  onUpdateTransition,
  onRemove,
  order,
}: SortableJokeSlotProps) {
  const [showTransition, setShowTransition] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition: transitionAnim,
    isDragging,
  } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transitionAnim,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-4 ${isDragging ? 'shadow-2xl border-spotlight-gold/50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded-lg"
        >
          <GripVertical className="w-5 h-5 text-ivory/40" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-6 h-6 rounded-full bg-stage-red/20 flex items-center justify-center text-sm font-bold text-stage-red">
              {order + 1}
            </span>
            <h4 className="font-medium text-ivory flex-1">{jokeTitle}</h4>
            <span className="text-sm text-ivory/50 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(jokeDuration)}
            </span>
            <button
              onClick={onRemove}
              className="p-1 rounded-lg hover:bg-red-500/20 text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div>
            <button
              onClick={() => setShowTransition(!showTransition)}
              className="flex items-center gap-2 text-sm text-ivory/50 hover:text-ivory/70 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{transition ? '编辑过渡语' : '添加过渡语'}</span>
              {showTransition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTransition && (
              <div className="mt-2">
                <textarea
                  value={transition}
                  onChange={(e) => onUpdateTransition(e.target.value)}
                  placeholder="例如：说到这里，让我想起一个关于家人的故事..."
                  rows={2}
                  className="input resize-y text-sm"
                />
              </div>
            )}

            {transition && !showTransition && (
              <p className="mt-1 text-sm text-ivory/40 italic line-clamp-1">
                "{transition}"
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormData {
  name: string;
  occasion: OccasionType;
  targetDuration: number;
  date: string;
  venue: string;
}

const initialFormData: FormData = {
  name: '',
  occasion: 'open_mic',
  targetDuration: 10,
  date: '',
  venue: '',
};

export default function PerformanceEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { performances, addPerformance, updatePerformance, reorderJokeSlots, addJokeToPerformance, removeJokeFromPerformance, updateJokeSlot } = usePerformances();
  const { jokes } = useJokes();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [jokeSlots, setJokeSlots] = useState<JokeSlot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showJokeSelector, setShowJokeSelector] = useState(false);
  const [saved, setSaved] = useState(false);

  const isEdit = id && id !== 'new';
  const performance = isEdit ? performances.find(p => p.id === id) : null;

  useEffect(() => {
    if (performance) {
      setFormData({
        name: performance.name,
        occasion: performance.occasion,
        targetDuration: performance.targetDuration,
        date: performance.date || '',
        venue: performance.venue || '',
      });
      setJokeSlots([...performance.jokeSlots].sort((a, b) => a.order - b.order));
    }
  }, [performance]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalDuration = jokeSlots.reduce((sum, slot) => {
    const joke = jokes.find(j => j.id === slot.jokeId);
    return sum + (joke?.estimatedDuration || 0);
  }, 0);

  const targetSeconds = formData.targetDuration * 60;
  const durationPercent = targetSeconds > 0 ? Math.min((totalDuration / targetSeconds) * 100, 100) : 0;
  const isOverTime = totalDuration > targetSeconds;
  const timeDiff = totalDuration - targetSeconds;

  const availableJokes = useMemo(() => {
    const selectedJokeIds = new Set(jokeSlots.map(s => s.jokeId));
    return jokes.filter(j => 
      !selectedJokeIds.has(j.id) &&
      (searchQuery === '' ||
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [jokes, jokeSlots, searchQuery]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = jokeSlots.findIndex(s => s.id === active.id);
      const newIndex = jokeSlots.findIndex(s => s.id === over.id);
      const newSlots = arrayMove(jokeSlots, oldIndex, newIndex).map((slot, i) => ({
        ...slot,
        order: i,
      }));
      setJokeSlots(newSlots);
      if (isEdit && performance) {
        reorderJokeSlots(performance.id, newSlots);
      }
    }
  };

  const handleAddJoke = (jokeId: string) => {
    const newSlot: JokeSlot = {
      id: generateId(),
      jokeId,
      order: jokeSlots.length,
    };
    const newSlots = [...jokeSlots, newSlot];
    setJokeSlots(newSlots);
    setShowJokeSelector(false);
    setSearchQuery('');

    if (isEdit && performance) {
      addJokeToPerformance(performance.id, jokeId);
    }
  };

  const handleRemoveJoke = (slotId: string) => {
    const slot = jokeSlots.find(s => s.id === slotId);
    if (!slot) return;

    const newSlots = jokeSlots
      .filter(s => s.id !== slotId)
      .map((s, i) => ({ ...s, order: i }));
    setJokeSlots(newSlots);

    if (isEdit && performance) {
      removeJokeFromPerformance(performance.id, slotId);
    }
  };

  const handleUpdateTransition = (slotId: string, transition: string) => {
    setJokeSlots(prev => prev.map(s => s.id === slotId ? { ...s, transition } : s));
    if (isEdit && performance) {
      updateJokeSlot(performance.id, slotId, { transition });
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请输入节目单名称');
      return;
    }

    if (isEdit && performance) {
      updatePerformance(performance.id, {
        ...formData,
        jokeSlots,
      });
    } else {
      addPerformance({
        ...formData,
        jokeSlots,
      });
      navigate('/performances');
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/performances')}
            className="flex items-center gap-2 text-ivory/60 hover:text-ivory transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回演出列表</span>
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-green-400 animate-bounce-in">
              <span>✓ 已保存</span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-ivory mb-2">
              {isEdit ? '编辑节目单' : '新建节目单'}
            </h1>
            <p className="text-ivory/60">拖拽排序你的段子，掌控演出节奏</p>
          </div>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            <span>保存节目单</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-5">
            <label className="label">节目单名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="例如：开放麦首秀"
              className="input"
            />
          </div>

          <div className="card p-5">
            <label className="label">演出场合</label>
            <select
              value={formData.occasion}
              onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value as OccasionType }))}
              className="input"
            >
              {OCCASION_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="card p-5">
            <label className="label">目标时长（分钟）</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={formData.targetDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDuration: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="font-mono text-lg text-spotlight-gold min-w-[60px] text-right">
                {formData.targetDuration}分
              </span>
            </div>
          </div>

          <div className="card p-5">
            <label className="label">演出日期</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="input"
            />
          </div>

          <div className="card p-5 lg:col-span-2">
            <label className="label">演出地点</label>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-ivory/40" />
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="例如：本地喜剧俱乐部"
                className="input flex-1"
              />
            </div>
          </div>
        </div>

        <div className={`card p-6 mb-6 ${isOverTime ? 'border-red-500/30' : 'border-spotlight-gold/30'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-ivory mb-1">时长概览</h3>
              <p className="text-ivory/60 text-sm">
                {jokeSlots.length} 个段子 · 目标 {formData.targetDuration} 分钟
              </p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-display font-bold ${isOverTime ? 'text-red-400' : 'text-spotlight-gold'}`}>
                {formatDuration(totalDuration)}
              </p>
              <p className={`text-sm ${isOverTime ? 'text-red-400/70' : 'text-ivory/50'}`}>
                {isOverTime ? `超时 ${formatDuration(Math.abs(timeDiff))}` : `还剩 ${formatDuration(Math.abs(timeDiff))}`}
              </p>
            </div>
          </div>

          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverTime ? 'bg-red-500' : 'bg-spotlight-gold'
              }`}
              style={{ width: `${durationPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ivory">节目单</h3>
            <button
              onClick={() => setShowJokeSelector(!showJokeSelector)}
              className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>添加段子</span>
            </button>
          </div>

          {showJokeSelector && (
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-ivory/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索段子..."
                  className="input flex-1"
                  autoFocus
                />
              </div>

              {availableJokes.length === 0 ? (
                <p className="text-center text-ivory/40 py-8">
                  {jokes.length === 0 ? '还没有段子，先去创作一些吧' : '所有段子都已添加到节目单'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto scrollbar-thin">
                  {availableJokes.map(joke => (
                    <button
                      key={joke.id}
                      onClick={() => handleAddJoke(joke.id)}
                      className="text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-spotlight-gold/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-ivory">{joke.title}</h4>
                        <span className="text-xs text-ivory/40">
                          {formatDuration(joke.estimatedDuration)}
                        </span>
                      </div>
                      <p className="text-sm text-ivory/50 line-clamp-1">
                        {joke.punchline}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {jokeSlots.length === 0 ? (
            <div className="card p-12 text-center">
              <Mic className="w-16 h-16 mx-auto mb-4 text-ivory/20" />
              <h3 className="font-display text-xl font-bold text-ivory/60 mb-2">
                还没有段子
              </h3>
              <p className="text-ivory/40">点击上方"添加段子"开始组织你的节目单</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={jokeSlots.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {jokeSlots.map((slot, index) => {
                    const joke = jokes.find(j => j.id === slot.jokeId);
                    return joke ? (
                      <SortableJokeSlot
                        key={slot.id}
                        slot={slot}
                        jokeTitle={joke.title}
                        jokeDuration={joke.estimatedDuration}
                        transition={slot.transition || ''}
                        onUpdateTransition={(value) => handleUpdateTransition(slot.id, value)}
                        onRemove={() => handleRemoveJoke(slot.id)}
                        order={index}
                      />
                    ) : null;
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
