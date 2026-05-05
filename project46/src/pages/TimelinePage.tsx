import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { timelineService, paperService, noteService } from '@/services/paperService';
import { useToast } from '@/context/ToastContext';
import type { TimelineEvent, Paper, Note } from '@/types';

function EventIcon({ type }: { type: TimelineEvent['type'] }) {
  const icons: Record<TimelineEvent['type'], { icon: React.ReactNode; color: string; bg: string }> = {
    milestone: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    'paper-added': {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    'note-created': {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    'annotation-added': {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    'review-completed': {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
  };

  const config = icons[type];

  return (
    <div className={`p-2 rounded-full ${config.bg}`}>
      <div className={config.color}>{config.icon}</div>
    </div>
  );
}

function EventTypeLabel({ type }: { type: TimelineEvent['type'] }) {
  const labels: Record<TimelineEvent['type'], string> = {
    milestone: '里程碑',
    'paper-added': '添加文献',
    'note-created': '创建笔记',
    'annotation-added': '添加标注',
    'review-completed': '完成综述',
  };

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
      {labels[type]}
    </span>
  );
}

function TimelineEventItem({
  event,
  onViewPaper,
  onViewNote,
}: {
  event: TimelineEvent;
  onViewPaper: (id: string) => void;
  onViewNote: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative pl-8 pb-8">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="absolute left-[-12px] top-0">
        <EventIcon type={event.type} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <EventTypeLabel type={event.type} />
              <span className="text-sm text-gray-500">
                {dayjs(event.date).format('YYYY年MM月DD日')}
              </span>
            </div>

            <h4 className="font-semibold text-gray-900">{event.title}</h4>

            {event.description && (
              <p className="text-sm text-gray-600 mt-2">{event.description}</p>
            )}

            {event.paperId && (
              <button
                onClick={() => onViewPaper(event.paperId!)}
                className="mt-3 text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                查看关联文献
              </button>
            )}

            {event.noteId && (
              <button
                onClick={() => onViewNote(event.noteId!)}
                className="mt-3 text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                查看关联笔记
              </button>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddEventModal({
  isOpen,
  onClose,
  onAdd,
  papers,
  notes,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (event: Partial<TimelineEvent>) => void;
  papers: Paper[];
  notes: Note[];
}) {
  const [eventType, setEventType] = useState<TimelineEvent['type']>('milestone');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedPaper, setSelectedPaper] = useState('');
  const [selectedNote, setSelectedNote] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newEvent: Partial<TimelineEvent> = {
      type: eventType,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      paperId: selectedPaper || undefined,
      noteId: selectedNote || undefined,
      userId: 1,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    };

    onAdd(newEvent);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="添加时间线事件"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">事件类型</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as TimelineEvent['type'])}
          >
            <option value="milestone">里程碑</option>
            <option value="paper-added">添加文献</option>
            <option value="note-created">创建笔记</option>
            <option value="annotation-added">添加标注</option>
            <option value="review-completed">完成综述</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标题 <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="输入事件标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="输入事件描述..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签（用逗号分隔）</label>
            <Input
              placeholder="例如: 重要, 待跟进"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关联文献</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedPaper}
              onChange={(e) => setSelectedPaper(e.target.value)}
            >
              <option value="">无</option>
              {papers.map((paper) => (
                <option key={paper.id} value={paper.id}>
                  {paper.title.length > 40 ? paper.title.slice(0, 40) + '...' : paper.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关联笔记</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedNote}
              onChange={(e) => setSelectedNote(e.target.value)}
            >
              <option value="">无</option>
              {notes.map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title.length > 40 ? note.title.slice(0, 40) + '...' : note.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!title.trim()}>
            添加
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function TimelinePage() {
  const [selectedTimeline, setSelectedTimeline] = useState<string>('');
  const [filterType, setFilterType] = useState<TimelineEvent['type'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const { data: timelines = [], isLoading: isLoadingTimelines } = useQuery({
    queryKey: ['timelines'],
    queryFn: timelineService.getTimelines,
  });

  const { data: papersResponse, isLoading: isLoadingPapers } = useQuery({
    queryKey: ['papers', { pageSize: 100 }],
    queryFn: () => paperService.getPapers({ pageSize: 100 }),
  });

  const { data: notesResponse, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes', { pageSize: 100 }],
    queryFn: () => noteService.getNotes({ pageSize: 100 }),
  });

  const addEventMutation = useMutation({
    mutationFn: ({ timelineId, event }: { timelineId: string; event: Partial<TimelineEvent> }) =>
      timelineService.addEvent(timelineId, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timelines'] });
      showSuccess('事件添加成功！');
      setShowAddModal(false);
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : '添加事件失败');
    },
  });

  const currentTimeline = useMemo(() => {
    if (selectedTimeline) {
      return timelines.find((t) => t.id === selectedTimeline);
    }
    return timelines[0] || null;
  }, [timelines, selectedTimeline]);

  const filteredEvents = useMemo(() => {
    if (!currentTimeline) return [];

    let events = [...currentTimeline.events] as TimelineEvent[];

    if (filterType !== 'all') {
      events = events.filter((e) => e.type === filterType);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(searchLower) ||
          e.description?.toLowerCase().includes(searchLower)
      );
    }

    events.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

    return events;
  }, [currentTimeline, filterType, search]);

  const eventStats = useMemo(() => {
    if (!currentTimeline) return null;

    const stats: Record<TimelineEvent['type'], number> = {
      milestone: 0,
      'paper-added': 0,
      'note-created': 0,
      'annotation-added': 0,
      'review-completed': 0,
    };

    (currentTimeline.events as TimelineEvent[]).forEach((e: TimelineEvent) => {
      stats[e.type]++;
    });

    return stats;
  }, [currentTimeline]);

  const handleViewPaper = (id: string) => {
    window.location.href = `/papers/${id}`;
  };

  const handleViewNote = (id: string) => {
    window.location.href = `/notes/${id}`;
  };

  const handleAddEvent = (event: Partial<TimelineEvent>) => {
    if (!currentTimeline) {
      showError('请先选择一个时间线');
      return;
    }
    addEventMutation.mutate({ timelineId: currentTimeline.id, event });
  };

  const isLoading = isLoadingTimelines || isLoadingPapers || isLoadingNotes || addEventMutation.isPending;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">研究进展时间线</h1>
            <p className="text-gray-500 mt-1">记录研究项目的里程碑和文献阅读记录</p>
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加事件
            </span>
          </Button>
        </div>

        {eventStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="p-2 bg-amber-100 rounded-lg w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">{eventStats.milestone}</p>
              <p className="text-xs text-gray-500">里程碑</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="p-2 bg-blue-100 rounded-lg w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">{eventStats['paper-added']}</p>
              <p className="text-xs text-gray-500">添加文献</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="p-2 bg-purple-100 rounded-lg w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">{eventStats['note-created']}</p>
              <p className="text-xs text-gray-500">创建笔记</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="p-2 bg-yellow-100 rounded-lg w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">{eventStats['annotation-added']}</p>
              <p className="text-xs text-gray-500">添加标注</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="p-2 bg-green-100 rounded-lg w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">{eventStats['review-completed']}</p>
              <p className="text-xs text-gray-500">完成综述</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索事件标题或描述..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            >
              <option value="all">全部类型</option>
              <option value="milestone">里程碑</option>
              <option value="paper-added">添加文献</option>
              <option value="note-created">创建笔记</option>
              <option value="annotation-added">添加标注</option>
              <option value="review-completed">完成综述</option>
            </select>

            {timelines.length > 1 && (
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedTimeline}
                onChange={(e) => setSelectedTimeline(e.target.value)}
              >
                {timelines.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.projectName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <Loading text="加载时间线..." />
          </div>
        ) : !currentTimeline ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无时间线</h3>
            <p className="text-gray-500 mb-4">创建您的第一个研究时间线</p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              添加第一个事件
            </Button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的事件</h3>
            <p className="text-gray-500">尝试调整搜索条件或筛选器</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {currentTimeline.projectName} - 研究进展
              <span className="text-sm font-normal text-gray-500 ml-2">
                共 {filteredEvents.length} 个事件
              </span>
            </h3>

            {filteredEvents.map((event) => (
              <TimelineEventItem
                key={event.id}
                event={event}
                onViewPaper={handleViewPaper}
                onViewNote={handleViewNote}
              />
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">时间线功能说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">记录研究进度</p>
                <p className="text-gray-500">添加里程碑事件，标记重要的研究节点</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">关联文献和笔记</p>
                <p className="text-gray-500">将事件与具体的文献或笔记关联起来</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddEvent}
        papers={papersResponse?.items || []}
        notes={notesResponse?.items || []}
      />
    </Layout>
  );
}

export default TimelinePage;
