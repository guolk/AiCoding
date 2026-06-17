import { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Plus,
  Edit2,
  Trash2,
  Microscope,
  Beaker,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Target,
  ListChecks,
} from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

interface Instrument {
  id: string;
  name: string;
  model: string;
  purpose: string;
  calibrationCycle: string;
  lastCalibrationDate: string;
}

interface CalibrationRecord {
  id: string;
  method: string;
  date: string;
  operator: string;
  instrument: string;
  result: string;
}

const initialInstruments: Instrument[] = [
  {
    id: 'ins-1',
    name: 'Hydra Probe II',
    model: 'Stevens Hydra Probe II',
    purpose: '土壤温度、土壤湿度多参数同步测量',
    calibrationCycle: '每3个月',
    lastCalibrationDate: '2025-03-10',
  },
  {
    id: 'ins-2',
    name: 'YSI ProDSS',
    model: 'YSI ProDSS Multiparameter',
    purpose: '水体pH、水温、透明度、溶解氧等水质参数测量',
    calibrationCycle: '每2个月',
    lastCalibrationDate: '2025-04-05',
  },
  {
    id: 'ins-3',
    name: '赛氏透明度盘',
    model: 'Secchi Disk 30cm',
    purpose: '水体透明度测量',
    calibrationCycle: '每年检查1次',
    lastCalibrationDate: '2025-01-15',
  },
];

const calibrationSteps = [
  {
    step: 1,
    title: '准备工作',
    description: '检查仪器外观，准备标准溶液、去离子水、擦拭纸等耗材',
    icon: Beaker,
    color: 'from-forest-50 to-forest-100 text-forest-600',
  },
  {
    step: 2,
    title: '零点校准',
    description: '使用去离子水或标准液进行零点校准，等待读数稳定后确认',
    icon: Target,
    color: 'from-lake-50 to-lake-100 text-lake-600',
  },
  {
    step: 3,
    title: '中间点校准',
    description: '使用中间浓度标准溶液校准，重复测量2-3次取平均值',
    icon: Microscope,
    color: 'from-sun-50 to-sun-100 text-sun-600',
  },
  {
    step: 4,
    title: '满量程校准',
    description: '使用最高浓度标准溶液校准，验证仪器线性响应范围',
    icon: CheckCircle2,
    color: 'from-earth-50 to-earth-100 text-earth-600',
  },
  {
    step: 5,
    title: '验证与记录',
    description: '回测标准溶液确认误差在允许范围内，填写校准记录并存档',
    icon: ListChecks,
    color: 'from-forest-50 to-forest-100 text-forest-600',
  },
];

const measurementStandards = [
  {
    icon: Clock,
    title: '测量时间一致性',
    items: [
      '所有监测点应在同一时段完成测量（建议上午8:00-10:00）',
      '避免正午高温时段测量土壤温度',
      '水体测量应在日出后2小时进行，避免光合作用干扰',
      '每次测量时间点偏差不超过±30分钟',
    ],
  },
  {
    icon: Target,
    title: '采样点选择规范',
    items: [
      '土壤测量：在监测点内按5点采样法布点，取5cm深度土壤',
      '水体测量：在水面下30cm处取样，避免岸边浅水区',
      '每个监测点重复测量3次，取算术平均值',
      '记录采样点GPS坐标，偏差不超过10米',
    ],
  },
  {
    icon: AlertCircle,
    title: '操作步骤要点',
    items: [
      '测量前仪器需在现场环境中静置5分钟适应温度',
      '土壤探针插入时避免压实土壤，保持自然结构',
      'pH电极使用前需甩干残留液体，防止交叉污染',
      '透明度盘测量需背对阳光，避免水面反光干扰',
      '所有读数需待仪器显示稳定后（跳动≤0.02）再记录',
    ],
  },
];

const initialCalibrationRecords: CalibrationRecord[] = [
  {
    id: 'cal-1',
    method: '三点校准法',
    date: '2025-03-10',
    operator: '张研究员',
    instrument: 'Hydra Probe II',
    result: '合格',
  },
  {
    id: 'cal-2',
    method: '标准溶液校准',
    date: '2025-04-05',
    operator: '李助理',
    instrument: 'YSI ProDSS',
    result: '合格',
  },
];

export default function MeasurementMethods() {
  const [instruments, setInstruments] = useState<Instrument[]>(initialInstruments);
  const [calibrationRecords, setCalibrationRecords] = useState<CalibrationRecord[]>(initialCalibrationRecords);
  const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const [editingCalibration, setEditingCalibration] = useState<CalibrationRecord | null>(null);

  const [instrumentForm, setInstrumentForm] = useState({
    name: '',
    model: '',
    purpose: '',
    calibrationCycle: '',
    lastCalibrationDate: '',
  });

  const [calibrationForm, setCalibrationForm] = useState({
    method: '三点校准法',
    date: new Date().toISOString().split('T')[0],
    operator: '',
    instrument: '',
    result: '合格',
  });

  const resetInstrumentForm = () => {
    setInstrumentForm({
      name: '',
      model: '',
      purpose: '',
      calibrationCycle: '',
      lastCalibrationDate: '',
    });
    setEditingInstrument(null);
  };

  const resetCalibrationForm = () => {
    setCalibrationForm({
      method: '三点校准法',
      date: new Date().toISOString().split('T')[0],
      operator: '',
      instrument: '',
      result: '合格',
    });
    setEditingCalibration(null);
  };

  const handleOpenInstrumentModal = (ins?: Instrument) => {
    if (ins) {
      setEditingInstrument(ins);
      setInstrumentForm({
        name: ins.name,
        model: ins.model,
        purpose: ins.purpose,
        calibrationCycle: ins.calibrationCycle,
        lastCalibrationDate: ins.lastCalibrationDate,
      });
    } else {
      resetInstrumentForm();
    }
    setIsInstrumentModalOpen(true);
  };

  const handleSubmitInstrument = () => {
    if (!instrumentForm.name || !instrumentForm.model) {
      alert('请填写仪器名称和型号');
      return;
    }
    if (editingInstrument) {
      setInstruments((prev) =>
        prev.map((i) => (i.id === editingInstrument.id ? { ...i, ...instrumentForm } : i))
      );
    } else {
      setInstruments((prev) => [
        ...prev,
        { ...instrumentForm, id: `ins-${Date.now()}` },
      ]);
    }
    setIsInstrumentModalOpen(false);
    resetInstrumentForm();
  };

  const handleDeleteInstrument = (id: string) => {
    if (confirm('确定要删除该仪器吗？')) {
      setInstruments((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleOpenCalibrationModal = (rec?: CalibrationRecord) => {
    if (rec) {
      setEditingCalibration(rec);
      setCalibrationForm({
        method: rec.method,
        date: rec.date,
        operator: rec.operator,
        instrument: rec.instrument,
        result: rec.result,
      });
    } else {
      resetCalibrationForm();
    }
    setIsCalibrationModalOpen(true);
  };

  const handleSubmitCalibration = () => {
    if (!calibrationForm.operator || !calibrationForm.instrument) {
      alert('请填写操作人和仪器');
      return;
    }
    if (editingCalibration) {
      setCalibrationRecords((prev) =>
        prev.map((r) => (r.id === editingCalibration.id ? { ...r, ...calibrationForm } : r))
      );
    } else {
      setCalibrationRecords((prev) => [
        { ...calibrationForm, id: `cal-${Date.now()}` },
        ...prev,
      ]);
    }
    setIsCalibrationModalOpen(false);
    resetCalibrationForm();
  };

  const handleDeleteCalibration = (id: string) => {
    if (confirm('确定要删除该校准记录吗？')) {
      setCalibrationRecords((prev) => prev.filter((r) => r.id !== id));
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
      <Header title="测量方法标准化" subtitle="仪器管理、校准流程与操作规范" />

      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-card animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest-500 to-lake-500 flex items-center justify-center flex-shrink-0">
              <Microscope className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-forest-800 mb-2">标准化测量流程说明</h2>
              <p className="text-sm text-forest-600 leading-relaxed">
                本模块为生态环境监测提供标准化的测量方法指导，确保数据可比性和可重复性。
                所有测量人员需严格按照操作规范执行，仪器须按期校准并记录在案。
                环境参数包括<span className="font-medium text-forest-700">土壤温度、土壤湿度、水体pH、水温、透明度</span>五大核心指标，
                每季度进行一次全参数测量，异常数据需在48小时内复核确认。
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-card animate-fade-in">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-forest-800">仪器信息管理</h2>
              <p className="mt-1 text-sm text-forest-600">记录测量所用仪器设备及其校准状态</p>
            </div>
            <button
              onClick={() => handleOpenInstrumentModal()}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2.5',
                'bg-forest-500 text-white text-sm font-medium',
                'hover:bg-forest-600 active:bg-forest-700',
                'transition-colors duration-200 shadow-sm'
              )}
            >
              <Plus className="h-4 w-4" />
              新增仪器
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {instruments.map((ins, idx) => {
              const IconComp = idx % 2 === 0 ? Thermometer : Droplets;
              return (
                <div
                  key={ins.id}
                  className={cn(
                    'rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover',
                    'bg-gradient-to-br from-white to-forest-50/30 border-forest-100'
                  )}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-forest-100 flex items-center justify-center text-forest-600">
                      <IconComp className="h-5.5 w-5.5" strokeWidth={2} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenInstrumentModal(ins)}
                        className={cn(
                          'p-1.5 rounded-lg text-forest-500',
                          'hover:bg-forest-100 hover:text-forest-700 transition-colors'
                        )}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInstrument(ins.id)}
                        className={cn(
                          'p-1.5 rounded-lg text-red-500',
                          'hover:bg-red-100 hover:text-red-700 transition-colors'
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-forest-800 mb-0.5">{ins.name}</h3>
                  <p className="text-xs text-forest-500 mb-3">{ins.model}</p>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-forest-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-forest-700 leading-relaxed">{ins.purpose}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-forest-100">
                      <Clock className="h-4 w-4 text-sun-500" />
                      <span className="text-sm text-forest-600">校准周期：</span>
                      <span className="text-sm font-medium text-forest-800">{ins.calibrationCycle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-lake-500" />
                      <span className="text-sm text-forest-600">最近校准：</span>
                      <span className="text-sm font-medium text-forest-800">{ins.lastCalibrationDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-card animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-forest-800">校准方式流程</h2>
            <p className="mt-1 text-sm text-forest-600">标准三点校准法 / 标准溶液校准的操作步骤</p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-[60px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-forest-300 via-lake-300 to-sun-300" />

            <div className="space-y-5">
              {calibrationSteps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.step} className="flex gap-4 lg:gap-6" style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="relative flex-shrink-0">
                      <div className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-br',
                        step.color,
                        'z-10 relative'
                      )}>
                        <StepIcon className="h-5.5 w-5.5" strokeWidth={2} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-forest-200 flex items-center justify-center text-xs font-bold text-forest-700 shadow-sm">
                        {step.step}
                      </div>
                    </div>

                    <div className={cn(
                      'flex-1 rounded-2xl border p-5',
                      'bg-gradient-to-r from-white to-forest-50/20 border-forest-100',
                      'transition-all duration-300 hover:shadow-card-hover'
                    )}>
                      <h3 className="text-base font-bold text-forest-800 mb-1.5">{step.title}</h3>
                      <p className="text-sm text-forest-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-card animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-forest-800">测量规范要点</h2>
            <p className="mt-1 text-sm text-forest-600">确保数据准确性和一致性的关键操作规范</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {measurementStandards.map((std, idx) => {
              const StdIcon = std.icon;
              const colorClasses = [
                'from-forest-500 to-forest-600',
                'from-lake-500 to-lake-600',
                'from-sun-500 to-sun-600',
              ];
              return (
                <div
                  key={idx}
                  className={cn(
                    'rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover',
                    'border-forest-100'
                  )}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className={cn(
                    'p-5 bg-gradient-to-r text-white',
                    colorClasses[idx]
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <StdIcon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold">{std.title}</h3>
                    </div>
                  </div>
                  <div className="p-5 bg-white">
                    <ul className="space-y-3">
                      {std.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4.5 w-4.5 text-forest-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-forest-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-card animate-fade-in">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-forest-800">校准记录档案</h2>
              <p className="mt-1 text-sm text-forest-600">历次仪器校准记录与结果</p>
            </div>
            <button
              onClick={() => handleOpenCalibrationModal()}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2.5',
                'bg-lake-500 text-white text-sm font-medium',
                'hover:bg-lake-600 active:bg-lake-700',
                'transition-colors duration-200 shadow-sm'
              )}
            >
              <Plus className="h-4 w-4" />
              新增校准记录
            </button>
          </div>

          {calibrationRecords.length === 0 ? (
            <div className="text-center py-10 text-forest-500">暂无校准记录</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-forest-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">日期</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">校准方法</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">使用仪器</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">操作人</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-forest-700 uppercase tracking-wider">结果</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-forest-700 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {calibrationRecords.map((rec, idx) => (
                    <tr
                      key={rec.id}
                      className={cn(
                        'border-t border-forest-50 transition-colors hover:bg-forest-50/50',
                        idx % 2 === 1 ? 'bg-forest-50/30' : ''
                      )}
                    >
                      <td className="px-4 py-3 text-sm text-forest-800 font-medium">{rec.date}</td>
                      <td className="px-4 py-3 text-sm text-forest-700">{rec.method}</td>
                      <td className="px-4 py-3 text-sm text-forest-700">{rec.instrument}</td>
                      <td className="px-4 py-3 text-sm text-forest-700">{rec.operator}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                          rec.result === '合格'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        )}>
                          {rec.result === '合格' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          {rec.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenCalibrationModal(rec)}
                            className={cn(
                              'p-1.5 rounded-lg text-forest-500',
                              'hover:bg-forest-100 hover:text-forest-700 transition-colors'
                            )}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCalibration(rec.id)}
                            className={cn(
                              'p-1.5 rounded-lg text-red-500',
                              'hover:bg-red-100 hover:text-red-700 transition-colors'
                            )}
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
          )}
        </div>
      </div>

      <Modal
        isOpen={isInstrumentModalOpen}
        onClose={() => {
          setIsInstrumentModalOpen(false);
          resetInstrumentForm();
        }}
        title={editingInstrument ? '编辑仪器信息' : '新增测量仪器'}
        footer={
          <>
            <button
              onClick={() => {
                setIsInstrumentModalOpen(false);
                resetInstrumentForm();
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
              onClick={handleSubmitInstrument}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium',
                'bg-forest-500 text-white',
                'hover:bg-forest-600 active:bg-forest-700',
                'transition-colors duration-200 shadow-sm'
              )}
            >
              {editingInstrument ? '保存修改' : '确认添加'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>仪器名称 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={instrumentForm.name}
                onChange={(e) => setInstrumentForm({ ...instrumentForm, name: e.target.value })}
                placeholder="例如：Hydra Probe II"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>型号规格 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={instrumentForm.model}
                onChange={(e) => setInstrumentForm({ ...instrumentForm, model: e.target.value })}
                placeholder="例如：Stevens Hydra Probe II"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>用途说明</label>
            <textarea
              value={instrumentForm.purpose}
              onChange={(e) => setInstrumentForm({ ...instrumentForm, purpose: e.target.value })}
              placeholder="描述该仪器的测量用途..."
              rows={3}
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>校准周期</label>
              <select
                value={instrumentForm.calibrationCycle}
                onChange={(e) => setInstrumentForm({ ...instrumentForm, calibrationCycle: e.target.value })}
                className={inputClass}
              >
                <option value="">请选择</option>
                <option>每月</option>
                <option>每2个月</option>
                <option>每3个月</option>
                <option>每半年</option>
                <option>每年</option>
                <option>每年检查1次</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>最近校准日期</label>
              <input
                type="date"
                value={instrumentForm.lastCalibrationDate}
                onChange={(e) => setInstrumentForm({ ...instrumentForm, lastCalibrationDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCalibrationModalOpen}
        onClose={() => {
          setIsCalibrationModalOpen(false);
          resetCalibrationForm();
        }}
        title={editingCalibration ? '编辑校准记录' : '新增校准记录'}
        footer={
          <>
            <button
              onClick={() => {
                setIsCalibrationModalOpen(false);
                resetCalibrationForm();
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
              onClick={handleSubmitCalibration}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium',
                'bg-lake-500 text-white',
                'hover:bg-lake-600 active:bg-lake-700',
                'transition-colors duration-200 shadow-sm'
              )}
            >
              {editingCalibration ? '保存修改' : '确认添加'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>校准日期</label>
              <input
                type="date"
                value={calibrationForm.date}
                onChange={(e) => setCalibrationForm({ ...calibrationForm, date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>校准方法</label>
              <select
                value={calibrationForm.method}
                onChange={(e) => setCalibrationForm({ ...calibrationForm, method: e.target.value })}
                className={inputClass}
              >
                <option>三点校准法</option>
                <option>标准溶液校准</option>
                <option>两点校准法</option>
                <option>其他</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>使用仪器 <span className="text-red-500">*</span></label>
              <select
                value={calibrationForm.instrument}
                onChange={(e) => setCalibrationForm({ ...calibrationForm, instrument: e.target.value })}
                className={inputClass}
              >
                <option value="">请选择仪器</option>
                {instruments.map((i) => (
                  <option key={i.id} value={i.name}>{i.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>操作人 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={calibrationForm.operator}
                onChange={(e) => setCalibrationForm({ ...calibrationForm, operator: e.target.value })}
                placeholder="操作人姓名"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>校准结果</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="result"
                  checked={calibrationForm.result === '合格'}
                  onChange={() => setCalibrationForm({ ...calibrationForm, result: '合格' })}
                  className="w-4 h-4 border-forest-300 text-forest-500 focus:ring-forest-200"
                />
                <span className="text-sm text-forest-700">合格</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="result"
                  checked={calibrationForm.result === '不合格'}
                  onChange={() => setCalibrationForm({ ...calibrationForm, result: '不合格' })}
                  className="w-4 h-4 border-forest-300 text-red-500 focus:ring-red-200"
                />
                <span className="text-sm text-forest-700">不合格</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="result"
                  checked={calibrationForm.result === '待复检'}
                  onChange={() => setCalibrationForm({ ...calibrationForm, result: '待复检' })}
                  className="w-4 h-4 border-forest-300 text-sun-500 focus:ring-sun-200"
                />
                <span className="text-sm text-forest-700">待复检</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
