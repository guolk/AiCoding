import { useState, useMemo } from 'react';
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  Plus,
  X,
  ExternalLink,
  MapPin,
  Ship,
  Plane,
  Train,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { useAppStore } from '@/store/appStore';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  shipmentStatusLabels,
  shipmentStatusColors,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ShipmentStatus, Shipment as ShipmentType } from '@/../shared/types';

const statusFlow: { status: ShipmentStatus; label: string; icon: typeof Clock }[] = [
  { status: 'pending', label: '待发货', icon: Clock },
  { status: 'shipping', label: '运输中', icon: Truck },
  { status: 'arrived', label: '已到港', icon: Ship },
  { status: 'warehoused', label: '已入库', icon: CheckCircle },
];

const shippingIcons: Record<string, typeof Ship> = {
  '海运': Ship,
  '空运': Plane,
  '铁路': Train,
  '陆运': Truck,
};

export default function Logistics() {
  const { shipments } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedShipment, setExpandedShipment] = useState<string | null>(null);
  const [shipmentForm, setShipmentForm] = useState({
    batchNo: '',
    origin: '',
    destination: '',
    shippingMethod: '海运',
    departureDate: '',
    estimatedArrival: '',
    cost: '',
    trackingNo: '',
    items: [{ productName: '', sku: '', quantity: '', unitCost: '' }],
  });

  const summaryData = useMemo(() => {
    const inTransit = shipments.filter((s) => s.status === 'shipping').length;
    const pending = shipments.filter((s) => s.status === 'pending').length;
    const totalCost = shipments.reduce((sum, s) => sum + s.cost, 0);
    const delivered = shipments.filter((s) => s.status === 'warehoused').length;

    return { inTransit, pending, totalCost, delivered };
  }, [shipments]);

  const getStatusProgress = (status: ShipmentStatus) => {
    const index = statusFlow.findIndex((s) => s.status === status);
    return ((index + 1) / statusFlow.length) * 100;
  };

  const getTimelinePosition = (shipment: ShipmentType) => {
    const start = new Date(shipment.departureDate).getTime();
    const end = new Date(shipment.estimatedArrival).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const getTimelineRange = () => {
    if (shipments.length === 0) return { min: Date.now(), max: Date.now() };
    const allDates = shipments.flatMap((s) => [
      new Date(s.departureDate).getTime(),
      new Date(s.estimatedArrival).getTime(),
    ]);
    return { min: Math.min(...allDates), max: Math.max(...allDates) };
  };

  const timelineRange = getTimelineRange();

  const getPositionInRange = (date: string) => {
    const time = new Date(date).getTime();
    const range = timelineRange.max - timelineRange.min;
    return range > 0 ? ((time - timelineRange.min) / range) * 100 : 0;
  };

  const formatTimelineDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const addShipmentItem = () => {
    setShipmentForm({
      ...shipmentForm,
      items: [...shipmentForm.items, { productName: '', sku: '', quantity: '', unitCost: '' }],
    });
  };

  const removeShipmentItem = (index: number) => {
    if (shipmentForm.items.length > 1) {
      setShipmentForm({
        ...shipmentForm,
        items: shipmentForm.items.filter((_, i) => i !== index),
      });
    }
  };

  const updateShipmentItem = (index: number, field: string, value: string) => {
    const newItems = [...shipmentForm.items];
    (newItems[index] as Record<string, string>)[field] = value;
    setShipmentForm({ ...shipmentForm, items: newItems });
  };

  const handleSubmit = () => {
    setShowAddModal(false);
    setShipmentForm({
      batchNo: '',
      origin: '',
      destination: '',
      shippingMethod: '海运',
      departureDate: '',
      estimatedArrival: '',
      cost: '',
      trackingNo: '',
      items: [{ productName: '', sku: '', quantity: '', unitCost: '' }],
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="运输中批次"
          value={formatNumber(summaryData.inTransit)}
          icon={Truck}
          color="blue"
          delay={0}
        />
        <StatCard
          title="待发货批次"
          value={formatNumber(summaryData.pending)}
          icon={Clock}
          color="yellow"
          delay={100}
        />
        <StatCard
          title="已入库批次"
          value={formatNumber(summaryData.delivered)}
          change={15}
          icon={CheckCircle}
          color="green"
          delay={200}
        />
        <StatCard
          title="总物流成本"
          value={formatCurrency(summaryData.totalCost)}
          change={-3.2}
          icon={Package}
          color="blue"
          delay={300}
        />
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">物流甘特图</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            新增发货
          </button>
        </div>

        <div className="relative overflow-x-auto scrollbar-thin pb-4">
          <div className="min-w-[800px]">
            <div className="flex border-b border-dark-700 pb-3 mb-4">
              <div className="w-48 flex-shrink-0">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">批次</span>
              </div>
              <div className="flex-1 relative">
                <div className="flex justify-between px-2">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const date = new Date(timelineRange.min + (timelineRange.max - timelineRange.min) * (i / 7));
                    return (
                      <span key={i} className="text-xs text-gray-500">
                        {date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {shipments.map((shipment, index) => {
              const startPos = getPositionInRange(shipment.departureDate);
              const endPos = getPositionInRange(shipment.estimatedArrival);
              const width = endPos - startPos;
              const ShippingIcon = shippingIcons[shipment.shippingMethod] || Ship;
              const progress = getTimelinePosition(shipment);

              return (
                <div
                  key={shipment.id}
                  className="flex items-center mb-3"
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 0.4s ease-out ${index * 50}ms forwards`,
                  }}
                >
                  <div className="w-48 flex-shrink-0 pr-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'p-1.5 rounded-lg',
                        shipment.status === 'warehoused' ? 'bg-success-600/20' :
                        shipment.status === 'shipping' ? 'bg-primary-600/20' :
                        shipment.status === 'arrived' ? 'bg-success-600/20' : 'bg-warning-600/20'
                      )}>
                        <ShippingIcon size={14} className={cn(
                          shipment.status === 'warehoused' ? 'text-success-500' :
                          shipment.status === 'shipping' ? 'text-primary-400' :
                          shipment.status === 'arrived' ? 'text-success-500' : 'text-warning-500'
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{shipment.batchNo}</p>
                        <p className="text-xs text-gray-500">{shipment.origin} → {shipment.destination}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 relative h-10">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-2 bg-dark-700 rounded-full relative">
                        <div
                          className={cn(
                            'absolute h-full rounded-full transition-all duration-500',
                            shipment.status === 'warehoused' ? 'bg-success-500' :
                            shipment.status === 'arrived' ? 'bg-success-500' : 'bg-primary-500'
                          )}
                          style={{
                            left: `${startPos}%`,
                            width: `${width}%`,
                          }}
                        />
                        {shipment.status === 'shipping' && (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-primary-500 transition-all duration-500"
                            style={{ left: `calc(${startPos}% + ${width * progress / 100}% - 8px)` }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-gray-500 px-1">
                      <span>{formatTimelineDate(shipment.departureDate)}</span>
                      <span>{formatTimelineDate(shipment.estimatedArrival)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {shipments.map((shipment, index) => {
          const isExpanded = expandedShipment === shipment.id;
          const currentStatusIndex = statusFlow.findIndex((s) => s.status === shipment.status);
          const ShippingIcon = shippingIcons[shipment.shippingMethod] || Ship;

          return (
            <div
              key={shipment.id}
              className="glass-card rounded-xl overflow-hidden"
              style={{
                opacity: 0,
                animation: `fadeInUp 0.4s ease-out ${(index + shipments.length) * 50}ms forwards`,
              }}
            >
              <div
                className="p-6 cursor-pointer hover:bg-dark-700/30 transition-colors"
                onClick={() => setExpandedShipment(isExpanded ? null : shipment.id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'p-3 rounded-xl',
                      shipment.status === 'warehoused' ? 'bg-success-600/20' :
                      shipment.status === 'shipping' ? 'bg-primary-600/20' :
                      shipment.status === 'arrived' ? 'bg-success-600/20' : 'bg-warning-600/20'
                    )}>
                      <ShippingIcon size={24} className={cn(
                        shipment.status === 'warehoused' ? 'text-success-500' :
                        shipment.status === 'shipping' ? 'text-primary-400' :
                        shipment.status === 'arrived' ? 'text-success-500' : 'text-warning-500'
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-white">{shipment.batchNo}</h4>
                        <span className={cn('badge', shipmentStatusColors[shipment.status])}>
                          {shipmentStatusLabels[shipment.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {shipment.origin} → {shipment.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck size={12} />
                          {shipment.shippingMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">发货日期</p>
                      <p className="text-sm font-medium text-white">{formatDate(shipment.departureDate)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">预计到港</p>
                      <p className="text-sm font-medium text-white">{formatDate(shipment.estimatedArrival)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">物流费用</p>
                      <p className="text-sm font-mono font-medium text-white">{formatCurrency(shipment.cost)}</p>
                    </div>
                    {shipment.trackingNo && (
                      <a
                        href="#"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm transition-colors"
                      >
                        <ExternalLink size={14} />
                        追踪号: {shipment.trackingNo}
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="relative">
                    <div className="flex justify-between mb-2">
                      {statusFlow.map((step, i) => {
                        const StepIcon = step.icon;
                        const isCompleted = i <= currentStatusIndex;
                        const isCurrent = i === currentStatusIndex;

                        return (
                          <div
                            key={step.status}
                            className={cn(
                              'flex items-center gap-2 z-10 relative',
                              i === 0 ? '' : 'justify-center',
                              i === statusFlow.length - 1 ? 'justify-end' : ''
                            )}
                          >
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                              isCompleted ? (
                                isCurrent ? 'bg-primary-500 ring-4 ring-primary-500/20' : 'bg-success-500'
                              ) : 'bg-dark-700'
                            )}>
                              <StepIcon
                                size={14}
                                className={isCompleted ? 'text-white' : 'text-gray-500'}
                              />
                            </div>
                            <span className={cn(
                              'text-xs font-medium hidden sm:block',
                              isCompleted ? 'text-white' : 'text-gray-500'
                            )}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-dark-700 -translate-y-1/2">
                      <div
                        className="h-full bg-gradient-to-r from-success-500 to-primary-500 transition-all duration-500"
                        style={{ width: `${getStatusProgress(shipment.status)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-dark-700 p-6 bg-dark-800/50">
                  <h5 className="font-medium text-white mb-4 flex items-center gap-2">
                    <Package size={16} className="text-gray-400" />
                    发货商品明细
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>商品名称</th>
                          <th>SKU</th>
                          <th>数量</th>
                          <th>单位成本</th>
                          <th>总成本</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipment.items.map((item) => (
                          <tr key={item.id}>
                            <td className="text-white">{item.productName}</td>
                            <td className="font-mono text-gray-300">{item.sku}</td>
                            <td className="font-mono text-white">{formatNumber(item.quantity)}</td>
                            <td className="font-mono text-gray-300">{formatCurrency(item.unitCost)}</td>
                            <td className="font-mono text-white">{formatCurrency(item.quantity * item.unitCost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {shipment.notes && (
                    <div className="mt-4 p-4 bg-dark-700/50 rounded-lg">
                      <p className="text-sm text-gray-400">
                        <span className="font-medium text-gray-300">备注：</span>
                        {shipment.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-fadeIn">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-dark-800/90 backdrop-blur-sm -mx-6 -mt-6 px-6 py-4 border-b border-dark-700 z-10">
              <h3 className="text-lg font-semibold text-white">新增发货</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">批次号</label>
                  <input
                    type="text"
                    value={shipmentForm.batchNo}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, batchNo: e.target.value })}
                    placeholder="如: BATCH-2024-001"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">运输方式</label>
                  <select
                    value={shipmentForm.shippingMethod}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, shippingMethod: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="海运">海运</option>
                    <option value="空运">空运</option>
                    <option value="铁路">铁路</option>
                    <option value="陆运">陆运</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">起运地</label>
                  <input
                    type="text"
                    value={shipmentForm.origin}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, origin: e.target.value })}
                    placeholder="如: 深圳"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">目的地</label>
                  <input
                    type="text"
                    value={shipmentForm.destination}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, destination: e.target.value })}
                    placeholder="如: LA"
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">发货日期</label>
                  <input
                    type="date"
                    value={shipmentForm.departureDate}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, departureDate: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">预计到港</label>
                  <input
                    type="date"
                    value={shipmentForm.estimatedArrival}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, estimatedArrival: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">物流费用</label>
                  <input
                    type="number"
                    value={shipmentForm.cost}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, cost: e.target.value })}
                    placeholder="0.00"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">追踪号</label>
                  <input
                    type="text"
                    value={shipmentForm.trackingNo}
                    onChange={(e) => setShipmentForm({ ...shipmentForm, trackingNo: e.target.value })}
                    placeholder="可选"
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">商品明细</label>
                  <button
                    onClick={addShipmentItem}
                    className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus size={14} />
                    添加商品
                  </button>
                </div>
                <div className="space-y-3">
                  {shipmentForm.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => updateShipmentItem(index, 'productName', e.target.value)}
                          placeholder="商品名称"
                          className="input-field text-sm"
                        />
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => updateShipmentItem(index, 'sku', e.target.value)}
                          placeholder="SKU"
                          className="input-field text-sm"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateShipmentItem(index, 'quantity', e.target.value)}
                          placeholder="数量"
                          className="input-field text-sm"
                        />
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => updateShipmentItem(index, 'unitCost', e.target.value)}
                          placeholder="单位成本"
                          className="input-field text-sm"
                        />
                      </div>
                      <button
                        onClick={() => removeShipmentItem(index)}
                        className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-danger-500"
                        disabled={shipmentForm.items.length === 1}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-dark-800/90 backdrop-blur-sm -mx-6 -mb-6 px-6 py-4 border-t border-dark-700">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  创建发货单
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
