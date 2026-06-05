import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, RefreshCw, Grid3X3, Settings, X, Info } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStudentStore } from '../../store/useStudentStore';
import { cn } from '../../utils/helpers';

interface SortableSeatProps {
  id: string;
  name: string;
  photoUrl: string;
  gender: string;
  isDragging?: boolean;
}

const SortableSeat: React.FC<SortableSeatProps> = ({ id, name, photoUrl, gender }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'w-full aspect-[4/5] rounded-xl flex flex-col items-center justify-center p-2 cursor-grab active:cursor-grabbing transition-all',
        isDragging ? 'opacity-50 scale-105' : 'opacity-100 hover:scale-102',
        gender === '男' ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200' : 'bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200'
      )}
      whileHover={{ y: -2 }}
    >
      <img
        src={photoUrl}
        alt={name}
        className="w-12 h-12 rounded-lg object-cover mb-1 shadow-sm"
        draggable={false}
      />
      <span className="text-xs font-medium text-slate-700 text-center truncate w-full">{name}</span>
    </motion.div>
  );
};

const SeatingChart: React.FC = () => {
  const { students, swapSeats, updateSeatPosition } = useStudentStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
      distance: 5,
    },
    }),
    useSensor(KeyboardSensor)
  );

  const sortedStudents = [...students].sort((a, b) => {
    if (a.seatRow !== b.seatRow) return a.seatRow - b.seatRow;
    return a.seatCol - b.seatCol;
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      swapSeats(active.id as string, over.id as string);
    }
  };

  const activeStudent = students.find(s => s.id === activeId);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm('确定要重置所有座位吗？')) {
      students.forEach((student, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        updateSeatPosition(student.id, row, col);
      });
    }
  };

  const activeItem = activeStudent ? (
    <div className={cn(
      'w-24 aspect-[4/5] rounded-xl flex flex-col items-center justify-center p-2',
      activeStudent.gender === '男' 
        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300' 
        : 'bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-300',
      'shadow-2xl opacity-80'
    )}>
      <img
        src={activeStudent.photoUrl}
        alt={activeStudent.name}
        className="w-12 h-12 rounded-lg object-cover mb-1"
      />
      <span className="text-xs font-medium text-slate-700 text-center">{activeStudent.name}</span>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">座位表</h1>
          <p className="text-slate-500 mt-1 text-sm">拖拽学生卡片调整座位，支持打印输出</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            <RefreshCw size={16} />
            重置座位
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            <Settings size={16} />
            设置
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
          >
            <Printer size={16} />
            打印座位表
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Grid3X3 size={18} className="text-slate-500" />
              <span className="text-sm text-slate-600">座位布局</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">行数:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={rows}
                onChange={(e) => setRows(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">列数:</label>
              <input
                type="number"
                min="1"
                max="12"
                value={cols}
                onChange={(e) => setCols(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center"
              />
            </div>
            <div className="flex items-center gap-2 text-amber-600 text-sm ml-auto">
              <Info size={14} />
              <span>拖动学生卡片可调整座位</span>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
      >
        <div className="mb-8">
          <div className="h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg mx-auto max-w-2xl">
            讲 台
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedStudents.map(s => s.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className="grid gap-4 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                maxWidth: `${cols * 120}px`
              }}
            >
              {sortedStudents.map((student, index) => (
                <SortableSeat
                  key={student.id}
                  id={student.id}
                  name={student.name}
                  photoUrl={student.photoUrl}
                  gender={student.gender}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeItem}
          </DragOverlay>
        </DndContext>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300"></div>
            <span>男生</span>
          </div>
          <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-pink-100 to-pink-200 border border-pink-300"></div>
            <span>女生</span>
          </div>
        </div>
      </motion.div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: landscape;
            margin: 20mm;
          }
        }
      `}</style>
    </div>
  );
};

export default SeatingChart;
