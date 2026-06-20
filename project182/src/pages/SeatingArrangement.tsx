import { useState, useRef, useMemo } from 'react';
import {
  Edit2, Trash2, Users, Circle, Square as SquareIcon,
  Move, X, UserPlus, ChevronRight, Table, Settings
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { Table as TableType, TableShape } from '@/types';
import { cn } from '@/lib/utils';

export default function SeatingArrangement() {
  const {
    guests, tables, currentEventId,
    addTable, updateTable, deleteTable, updateGuest
  } = useAppStore();

  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Partial<TableType> | null>(null);
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '', capacity: 10, shape: 'round' as TableShape, notes: ''
  });

  const unassignedGuests = useMemo(() =>
    guests.filter(g => !g.tableId && g.rsvpStatus !== 'declined'),
  [guests]);

  const getTableGuests = (tableId: string) =>
    guests.filter(g => g.tableId === tableId);

  const openAddTableModal = () => {
    setEditingTable(null);
    setFormData({ name: '', capacity: 10, shape: 'round', notes: '' });
    setIsTableModalOpen(true);
  };

  const openEditTableModal = (table: TableType) => {
    setEditingTable(table);
    setFormData({ name: table.name, capacity: table.capacity, shape: table.shape, notes: table.notes });
    setIsTableModalOpen(true);
  };

  const handleTableSubmit = () => {
    if (!formData.name.trim()) return;
    if (editingTable?.id) {
      updateTable(editingTable.id, formData);
    } else {
      addTable({ ...formData, eventId: currentEventId, x: 300, y: 200 });
    }
    setIsTableModalOpen(false);
  };

  const handleDragStart = (e: React.MouseEvent, tableId: string) => {
    e.preventDefault();
    const table = tables.find(t => t.id === tableId);
    if (!table || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingTable(tableId);
    setDragOffset({ x: e.clientX - rect.left - table.x, y: e.clientY - rect.top - table.y });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!draggingTable || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 120));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 120));
    updateTable(draggingTable, { x, y });
  };

  const handleDragEnd = () => setDraggingTable(null);

  const assignGuestToTable = (guestId: string, tableId: string) => {
    updateGuest(guestId, { tableId, seatNumber: null });
  };

  const removeGuestFromTable = (guestId: string) => {
    updateGuest(guestId, { tableId: null, seatNumber: null });
  };

  const handleDrop = (e: React.DragEvent, tableId: string) => {
    e.preventDefault();
    const guestId = e.dataTransfer.getData('guestId');
    if (guestId) assignGuestToTable(guestId, tableId);
  };

  const renderTableShape = (table: TableType, isSelected: boolean) => {
    const tableGuests = getTableGuests(table.id);
    const baseClass = cn(
      'absolute cursor-move transition-all duration-200 flex flex-col items-center justify-center',
      draggingTable === table.id ? 'scale-105 z-20' : 'hover:scale-105 z-10',
      isSelected && 'ring-4 ring-primary-400 ring-opacity-50'
    );

    if (table.shape === 'round') {
      return (
        <div
          className={cn(baseClass, 'rounded-full bg-gradient-to-br from-primary-100 to-primary-200 border-2 border-primary-300 shadow-lg')}
          style={{ left: table.x, top: table.y, width: 100, height: 100 }}
          onMouseDown={(e) => handleDragStart(e, table.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, table.id)}
          onClick={() => setSelectedTable(table)}
        >
          <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="text-xs font-semibold text-primary-700">{table.name}</div>
          <div className="text-xs text-primary-600">{tableGuests.length}/{table.capacity}</div>
        </div>
      );
    }

    return (
      <div
        className={cn(baseClass, 'rounded-xl bg-gradient-to-br from-champagne-100 to-champagne-200 border-2 border-champagne-300 shadow-lg')}
        style={{ left: table.x, top: table.y, width: 140, height: 90 }}
        onMouseDown={(e) => handleDragStart(e, table.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, table.id)}
        onClick={() => setSelectedTable(table)}
      >
        <div className="w-8 h-8 rounded-lg bg-champagne-400 flex items-center justify-center mb-1">
          <Table className="w-4 h-4 text-white" />
        </div>
        <div className="text-xs font-semibold text-champagne-700">{table.name}</div>
        <div className="text-xs text-champagne-600">{tableGuests.length}/{table.capacity}</div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-accent-500">桌位安排</h1>
          <p className="text-warmGray-500 mt-1">拖拽调整桌子位置，分配宾客座位</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={<Settings className="w-4 h-4" />} onClick={openAddTableModal}>
            添加桌子
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="lg:w-72 shrink-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-accent-500 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              未分配宾客
            </h3>
            <Badge variant="primary">{unassignedGuests.length}</Badge>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {unassignedGuests.length === 0 ? (
              <p className="text-sm text-warmGray-400 text-center py-8">所有宾客已分配座位</p>
            ) : (
              unassignedGuests.map((guest) => (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('guestId', guest.id)}
                  className="flex items-center gap-3 p-3 bg-warmGray-50 rounded-xl hover:bg-primary-50 cursor-grab active:cursor-grabbing transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-primary-600">{guest.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-warmGray-800 truncate">{guest.name}</div>
                    <div className="text-xs text-warmGray-500 truncate">{guest.relation}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-warmGray-400 group-hover:text-primary-500 transition-colors" />
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-accent-500 flex items-center gap-2">
              <Move className="w-4 h-4" />
              座位图
            </h3>
            <div className="flex items-center gap-4 text-xs text-warmGray-500">
              <div className="flex items-center gap-1"><Circle className="w-3 h-3 text-primary-400 fill-primary-400" /> 圆桌</div>
              <div className="flex items-center gap-1"><SquareIcon className="w-3 h-3 text-champagne-400 fill-champagne-400" /> 方桌</div>
              <div className="flex items-center gap-1"><Move className="w-3 h-3" /> 拖拽移动</div>
            </div>
          </div>
          <div
            ref={canvasRef}
            className="relative w-full h-[500px] bg-ivory rounded-xl border-2 border-dashed border-warmGray-200 overflow-hidden"
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'radial-gradient(circle, #D3CCC3 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
            {tables.map((table) => renderTableShape(table, selectedTable?.id === table.id))}
            {tables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-warmGray-400">
                <div className="text-center">
                  <Table className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>点击"添加桌子"开始规划座位</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {selectedTable && (
          <Card className="lg:w-80 shrink-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-accent-500">{selectedTable.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => openEditTableModal(selectedTable)}
                  className="p-1.5 hover:bg-primary-100 rounded-lg text-primary-500 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => { deleteTable(selectedTable.id); setSelectedTable(null); }}
                  className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedTable(null)}
                  className="p-1.5 hover:bg-warmGray-100 rounded-lg text-warmGray-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-warmGray-500">桌子形状</span>
                <Badge variant="champagne">{selectedTable.shape === 'round' ? '圆桌' : '方桌'}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-warmGray-500">座位容量</span>
                <span className="font-medium text-warmGray-700">{selectedTable.capacity} 人</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-warmGray-500">已入座</span>
                <span className="font-medium text-primary-600">{getTableGuests(selectedTable.id).length} 人</span>
              </div>
              {selectedTable.notes && (
                <div className="p-3 bg-warmGray-50 rounded-xl text-sm text-warmGray-600">
                  {selectedTable.notes}
                </div>
              )}
            </div>
            <div className="border-t border-warmGray-100 pt-4">
              <h4 className="text-sm font-medium text-warmGray-700 mb-3">已分配宾客</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getTableGuests(selectedTable.id).length === 0 ? (
                  <p className="text-sm text-warmGray-400 text-center py-4">暂无宾客</p>
                ) : (
                  getTableGuests(selectedTable.id).map((guest) => (
                    <div key={guest.id} className="flex items-center gap-3 p-2 bg-warmGray-50 rounded-lg group">
                      <div className="w-7 h-7 rounded-full bg-accent-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-accent-600">{guest.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-warmGray-800 truncate">{guest.name}</div>
                      </div>
                      <button onClick={() => removeGuestFromTable(guest.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title={editingTable ? '编辑桌子' : '添加桌子'}
        description="设置桌子信息"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsTableModalOpen(false)}>取消</Button>
            <Button onClick={handleTableSubmit}>{editingTable ? '保存' : '添加'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="桌号名称" required value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="如：主桌、1号桌" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="桌子形状" value={formData.shape}
              onChange={(e) => setFormData({ ...formData, shape: e.target.value as TableShape })}
              options={[
                { value: 'round', label: '圆桌' },
                { value: 'square', label: '方桌' },
              ]} />
            <Input label="座位容量" type="number" min={2} max={30}
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 10 })} />
          </div>
          <div className="flex gap-4">
            {(['round', 'square'] as TableShape[]).map((shape) => (
              <button
                key={shape}
                onClick={() => setFormData({ ...formData, shape })}
                className={cn(
                  'flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                  formData.shape === shape
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-warmGray-200 hover:border-warmGray-300'
                )}
              >
                {shape === 'round' ? (
                  <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center">
                    <Circle className="w-6 h-6 text-primary-600" />
                  </div>
                ) : (
                  <div className="w-14 h-10 rounded-lg bg-champagne-200 flex items-center justify-center">
                    <SquareIcon className="w-6 h-6 text-champagne-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-warmGray-700">{shape === 'round' ? '圆桌' : '方桌'}</span>
              </button>
            ))}
          </div>
          <Input label="备注" value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="如：男方亲属、VIP桌等" />
        </div>
      </Modal>
    </div>
  );
}
