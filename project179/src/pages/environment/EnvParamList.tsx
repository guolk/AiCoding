import { useState, useMemo } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Ruler,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Header } from '@/components/Layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { EnvironmentalParam } from '@/types';

const PAGE_SIZE = 8;

export default function EnvParamList() {
  const { envParams, sites, addEnvParam, updateEnvParam, deleteEnvParam } = useAppStore();
  const [filterSiteId, setFilterSiteId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EnvironmentalParam | null>(null);
  const [formData, setFormData] = useState({
    siteId: '',
    date: new Date().toISOString().split('T')[0],
    soilTemperature: '',
    soilMoisture: '',
    waterPH: '',
    waterTemperature: '',
    waterTransparency: '',
    instrument: 'Hydra Probe II',
    calibrationMethod: '三点校准法',
    measureTime: '09:00',
    isAbnormal: false,
    abnormalNote: '',
  });

  const filteredData = useMemo(() => {
    return envParams.filter((item) => {
      if (filterSiteId && item.siteId !== filterSiteId) return false;
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [envParams, filterSiteId, startDate, endDate]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const getSiteName = (siteId: string) => {
    return sites.find((s) => s.id === siteId)?.name || '未知监测点';
  };

  const resetForm = () => {
    setFormData({
      siteId: '',
      date: new Date().toISOString().split('T')[0],
      soilTemperature: '',
      soilMoisture: '',
      waterPH: '',
      waterTemperature: '',
      waterTransparency: '',
      instrument: 'Hydra Probe II',
      calibrationMethod: '三点校准法',
      measureTime: '09:00',
      isAbnormal: false,
      abnormalNote: '',
    });
    setEditingRecord(null);
  };

  const handleOpenModal = (record?: EnvironmentalParam) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        siteId: record.siteId,
        date: record.date,
        soilTemperature: String(record.soilTemperature),
        soilMoisture: String(record.soilMoisture),
        waterPH: String(record.waterPH),
        waterTemperature: String(record.waterTemperature),
        waterTransparency: String(record.waterTransparency),
        instrument: record.instrument,
        calibrationMethod: record.calibrationMethod,
        measureTime: record.measureTime,
        isAbnormal: record.isAbnormal,
        abnormalNote: record.abnormalNote,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.siteId) {
      alert('请选择监测点');
      return;
    }
    const paramData = {
      siteId: formData.siteId,
      date: formData.date,
      soilTemperature: parseFloat(formData.soilTemperature) || 0,
      soilMoisture: parseFloat(formData.soilMoisture) || 0,
      waterPH: parseFloat(formData.waterPH) || 0,
      waterTemperature: parseFloat(formData.waterTemperature) || 0,
      waterTransparency: parseInt(formData.waterTransparency) || 0,
      instrument: formData.instrument,
      calibrationMethod: formData.calibrationMethod,
      measureTime: formData.measureTime,
      isAbnormal: formData.isAbnormal,
      abnormalNote: formData.abnormalNote,
    };
    if (editingRecord) {
      updateEnvParam(editingRecord.id, paramData);
    } else {
      addEnvParam(paramData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      deleteEnvParam(id);
    }
  };

  const inputClass = cn(
    'w-full px-3 py-2 rounded-xl border border-forest-200',
    'text-sm text-forest-800 bg-white',
    'focus:outline-none focus:ring-2 focus:ring-forest-200 focus:border-forest-300',
    'transition-all duration-200'
  );

  const labelClass = 'block text-sm font-medium text-forest-700 mb-1.5';

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50/50 via-white to-lake-50/30">
      <Header title="测量记录列表" subtitle="环境参数测量数据管理" />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 rounded-2xl border border-forest-100 bg-white p-5 shadow-card animate-fade-in">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-1 flex-wrap items-end gap-4">
              <div className="flex items-center gap-2 text-forest-700">
                <Filter className="h-5 w-5" />
                <span className="font-medium">筛选条件</span>
              </div>

              <div className="min-w-[180px]">
                <label className={labelClass}>监测点</label>
                <select
                  value={filterSiteId}
                  onChange={(e) => {
                    setFilterSiteId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={inputClass}
                >
                  <option value="">全部监测点</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>开始日期</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={cn(inputClass, 'pl-9')}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>结束日期</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={cn(inputClass, 'pl-9')}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2.5',
                'bg-forest-500 text-white text-sm font-medium',
                'hover:bg-forest-600 active:bg-forest-700',
                'transition-colors duration-200 shadow-sm'
              )}
            >
              <Plus className="h-4 w-4" />
              新增测量记录
            </button>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <EmptyState
            icon={<Thermometer className="h-8 w-8" />}
            title="暂无测量记录"
            description="请调整筛选条件或新增一条测量记录"
            actionText="新增记录"
            onAction={() => handleOpenModal()}
          />
        ) : (
          <>
            <div className="hidden md:block rounded-2xl border border-forest-100 bg-white shadow-card overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-forest-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">日期</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">监测点</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-forest-700 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <Thermometer className="h-3.5 w-3.5" />
                          土壤温度(℃)
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-forest-700 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <Droplets className="h-3.5 w-3.5" />
                          土壤湿度(%)
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-forest-700 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <Wind className="h-3.5 w-3.5" />
                          水体pH
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-forest-700 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <Thermometer className="h-3.5 w-3.5" />
                          水温(℃)
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-forest-700 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <Ruler className="h-3.5 w-3.5" />
                          透明度(cm)
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-forest-700 uppercase tracking-wider">测量时间</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-forest-700 uppercase tracking-wider">状态</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-forest-700 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={cn(
                          'border-t border-forest-50 transition-colors hover:bg-forest-50/50',
                          item.isAbnormal ? 'bg-red-50/60 hover:bg-red-50/80' : '',
                          idx % 2 === 1 && !item.isAbnormal ? 'bg-forest-50/30' : ''
                        )}
                      >
                        <td className="px-4 py-3 text-sm text-forest-800 font-medium">{item.date}</td>
                        <td className="px-4 py-3 text-sm text-forest-700">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-forest-500" />
                            {getSiteName(item.siteId)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-forest-700 tabular-nums">{item.soilTemperature.toFixed(1)}</td>
                        <td className="px-4 py-3 text-sm text-center text-forest-700 tabular-nums">{item.soilMoisture.toFixed(1)}</td>
                        <td className="px-4 py-3 text-sm text-center text-forest-700 tabular-nums">{item.waterPH.toFixed(1)}</td>
                        <td className="px-4 py-3 text-sm text-center text-forest-700 tabular-nums">{item.waterTemperature.toFixed(1)}</td>
                        <td className="px-4 py-3 text-sm text-center text-forest-700 tabular-nums">{item.waterTransparency}</td>
                        <td className="px-4 py-3 text-sm text-center text-forest-600">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {item.measureTime}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            text={item.isAbnormal ? '异常' : '正常'}
                            variant={item.isAbnormal ? 'danger' : 'success'}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className={cn(
                                'p-1.5 rounded-lg text-forest-500',
                                'hover:bg-forest-100 hover:text-forest-700',
                                'transition-colors duration-200'
                              )}
                              title="编辑"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className={cn(
                                'p-1.5 rounded-lg text-red-500',
                                'hover:bg-red-100 hover:text-red-700',
                                'transition-colors duration-200'
                              )}
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden space-y-4 animate-fade-in">
              {paginatedData.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-2xl border p-5 shadow-card transition-all',
                    item.isAbnormal
                      ? 'bg-red-50/60 border-red-200'
                      : 'bg-white border-forest-100 hover:shadow-card-hover'
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-forest-500" />
                        <span className="font-semibold text-forest-800">{getSiteName(item.siteId)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-forest-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.date}
                        <Clock className="h-3.5 w-3.5 ml-2" />
                        {item.measureTime}
                      </div>
                    </div>
                    <Badge
                      text={item.isAbnormal ? '异常' : '正常'}
                      variant={item.isAbnormal ? 'danger' : 'success'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-forest-50/50 p-3">
                      <div className="flex items-center gap-1 text-xs text-forest-500 mb-1">
                        <Thermometer className="h-3 w-3" />
                        土壤温度
                      </div>
                      <div className="text-lg font-bold text-forest-800 tabular-nums">{item.soilTemperature.toFixed(1)}<span className="text-sm font-normal text-forest-500">℃</span></div>
                    </div>
                    <div className="rounded-xl bg-lake-50/50 p-3">
                      <div className="flex items-center gap-1 text-xs text-lake-600 mb-1">
                        <Droplets className="h-3 w-3" />
                        土壤湿度
                      </div>
                      <div className="text-lg font-bold text-lake-700 tabular-nums">{item.soilMoisture.toFixed(1)}<span className="text-sm font-normal text-lake-500">%</span></div>
                    </div>
                    <div className="rounded-xl bg-sun-50/50 p-3">
                      <div className="flex items-center gap-1 text-xs text-sun-600 mb-1">
                        <Wind className="h-3 w-3" />
                        水体pH
                      </div>
                      <div className="text-lg font-bold text-sun-700 tabular-nums">{item.waterPH.toFixed(1)}</div>
                    </div>
                    <div className="rounded-xl bg-earth-50/50 p-3">
                      <div className="flex items-center gap-1 text-xs text-earth-600 mb-1">
                        <Ruler className="h-3 w-3" />
                        透明度
                      </div>
                      <div className="text-lg font-bold text-earth-700 tabular-nums">{item.waterTransparency}<span className="text-sm font-normal text-earth-500">cm</span></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-forest-100">
                    <div className="text-sm text-forest-600">
                      <span className="text-forest-500">水温：</span>
                      {item.waterTemperature.toFixed(1)}℃
                      {item.isAbnormal && item.abnormalNote && (
                        <div className="mt-1 text-xs text-red-600 line-clamp-1">
                          ⚠ {item.abnormalNote}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className={cn(
                          'p-2 rounded-lg text-forest-500',
                          'hover:bg-forest-100 hover:text-forest-700',
                          'transition-colors duration-200'
                        )}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className={cn(
                          'p-2 rounded-lg text-red-500',
                          'hover:bg-red-100 hover:text-red-700',
                          'transition-colors duration-200'
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between flex-wrap gap-4 animate-fade-in">
              <div className="text-sm text-forest-600">
                共 <span className="font-semibold text-forest-800">{filteredData.length}</span> 条记录，
                当前第 <span className="font-semibold text-forest-800">{currentPage}</span> / {totalPages} 页
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    'p-2 rounded-lg border transition-all',
                    currentPage === 1
                      ? 'border-forest-100 text-forest-300 cursor-not-allowed'
                      : 'border-forest-200 text-forest-600 hover:bg-forest-50 hover:border-forest-300'
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all',
                      page === currentPage
                        ? 'bg-forest-500 text-white shadow-sm'
                        : 'text-forest-600 hover:bg-forest-50'
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    'p-2 rounded-lg border transition-all',
                    currentPage === totalPages
                      ? 'border-forest-100 text-forest-300 cursor-not-allowed'
                      : 'border-forest-200 text-forest-600 hover:bg-forest-50 hover:border-forest-300'
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingRecord ? '编辑测量记录' : '新增测量记录'}
        footer={
          <>
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium',
                'border border-forest-200 text-forest-600',
                'hover:bg-forest-50 transition-colors duration-200'
              )}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium',
                'bg-forest-500 text-white',
                'hover:bg-forest-600 active:bg-forest-700',
                'transition-colors duration-200 shadow-sm'
              )}
            >
              {editingRecord ? '保存修改' : '确认提交'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>监测点 <span className="text-red-500">*</span></label>
            <select
              value={formData.siteId}
              onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              className={inputClass}
            >
              <option value="">请选择监测点</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>测量日期</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>测量时间</label>
              <input
                type="time"
                value={formData.measureTime}
                onChange={(e) => setFormData({ ...formData, measureTime: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>土壤温度 (℃)</label>
              <input
                type="number"
                step="0.1"
                value={formData.soilTemperature}
                onChange={(e) => setFormData({ ...formData, soilTemperature: e.target.value })}
                placeholder="例如：15.2"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>土壤湿度 (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.soilMoisture}
                onChange={(e) => setFormData({ ...formData, soilMoisture: e.target.value })}
                placeholder="例如：68.5"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>水体pH</label>
              <input
                type="number"
                step="0.1"
                value={formData.waterPH}
                onChange={(e) => setFormData({ ...formData, waterPH: e.target.value })}
                placeholder="例如：6.8"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>水温 (℃)</label>
              <input
                type="number"
                step="0.1"
                value={formData.waterTemperature}
                onChange={(e) => setFormData({ ...formData, waterTemperature: e.target.value })}
                placeholder="例如：12.5"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>透明度 (cm)</label>
              <input
                type="number"
                value={formData.waterTransparency}
                onChange={(e) => setFormData({ ...formData, waterTransparency: e.target.value })}
                placeholder="例如：85"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>使用仪器</label>
              <select
                value={formData.instrument}
                onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                className={inputClass}
              >
                <option>Hydra Probe II</option>
                <option>YSI ProDSS</option>
                <option>其他</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>校准方法</label>
              <select
                value={formData.calibrationMethod}
                onChange={(e) => setFormData({ ...formData, calibrationMethod: e.target.value })}
                className={inputClass}
              >
                <option>三点校准法</option>
                <option>标准溶液校准</option>
                <option>其他</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAbnormal}
                onChange={(e) => setFormData({ ...formData, isAbnormal: e.target.checked })}
                className="w-4 h-4 rounded border-forest-300 text-forest-500 focus:ring-forest-200"
              />
              <span className="text-sm font-medium text-forest-700">标记为异常数据</span>
            </label>
          </div>

          {formData.isAbnormal && (
            <div>
              <label className={labelClass}>异常说明</label>
              <textarea
                value={formData.abnormalNote}
                onChange={(e) => setFormData({ ...formData, abnormalNote: e.target.value })}
                placeholder="请描述异常情况和可能原因..."
                rows={3}
                className={cn(inputClass, 'resize-none')}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
