import { useState } from 'react';
import { Calendar, Clock, Activity, Heart, Info, StickyNote, Save, Check } from 'lucide-react';
import type { TimeOfDay, MeasurementCondition, MeasurementDevice } from '@/types';
import { useHealthStore } from '@/store';
import { cn, formatDate, getTimePeriod, isBloodPressureNormal } from '@/utils';

const timeOptions: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: '清晨' },
  { value: 'evening', label: '睡前' },
  { value: 'other', label: '其他' },
];

const conditionOptions: { value: MeasurementCondition; label: string }[] = [
  { value: 'resting', label: '静息状态' },
  { value: 'after-exercise', label: '运动后' },
  { value: 'after-meal', label: '饭后' },
  { value: 'before-medication', label: '服药前' },
  { value: 'after-medication', label: '服药后' },
  { value: 'other', label: '其他' },
];

const deviceOptions: { value: MeasurementDevice; label: string }[] = [
  { value: 'upper-arm', label: '上臂式' },
  { value: 'wrist', label: '腕式' },
  { value: 'hospital', label: '医院设备' },
  { value: 'other', label: '其他' },
];

export default function BloodPressureForm() {
  const addBloodPressure = useHealthStore((s) => s.addBloodPressure);

  const today = formatDate(new Date());
  const currentPeriod = getTimePeriod();

  const [date, setDate] = useState(today);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(currentPeriod);
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [condition, setCondition] = useState<MeasurementCondition>('resting');
  const [device, setDevice] = useState<MeasurementDevice>('upper-arm');
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const systolicNum = Number(systolic);
  const diastolicNum = Number(diastolic);
  const pulseNum = Number(pulse);

  const isValid =
    systolicNum > 0 &&
    diastolicNum > 0 &&
    pulseNum > 0 &&
    systolicNum > diastolicNum;

  const previewStatus =
    isValid && isBloodPressureNormal(systolicNum, diastolicNum) ? 'normal' :
    isValid && (systolicNum >= 140 || diastolicNum >= 90) ? 'high' :
    isValid && (systolicNum < 90 || diastolicNum < 60) ? 'low' : null;

  const handleSubmit = () => {
    if (!isValid) return;

    addBloodPressure({
      date,
      timeOfDay,
      systolic: systolicNum,
      diastolic: diastolicNum,
      pulse: pulseNum,
      condition,
      device,
      note: note || undefined,
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    setSystolic('');
    setDiastolic('');
    setPulse('');
    setNote('');
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200">
          <Check className="w-5 h-5" />
          <span className="font-medium">记录已保存成功！</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            测量日期
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4" />
            测量时段
          </label>
          <div className="flex gap-2">
            {timeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeOfDay(opt.value)}
                className={cn(
                  'flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all',
                  timeOfDay === opt.value
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-gray-800">血压与心率</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="text-xs text-gray-500 font-medium">收缩压</label>
            <div className="flex items-baseline gap-1 mt-1">
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="--"
                className="w-full text-3xl font-bold text-gray-800 bg-transparent outline-none tabular-nums"
              />
            </div>
            <span className="text-xs text-gray-400">mmHg</span>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="text-xs text-gray-500 font-medium">舒张压</label>
            <div className="flex items-baseline gap-1 mt-1">
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="--"
                className="w-full text-3xl font-bold text-gray-800 bg-transparent outline-none tabular-nums"
              />
            </div>
            <span className="text-xs text-gray-400">mmHg</span>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <Heart className="w-3 h-3" />
              心率
            </label>
            <div className="flex items-baseline gap-1 mt-1">
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="--"
                className="w-full text-3xl font-bold text-gray-800 bg-transparent outline-none tabular-nums"
              />
            </div>
            <span className="text-xs text-gray-400">次/分</span>
          </div>
        </div>

        {previewStatus && (
          <div
            className={cn(
              'mt-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2',
              previewStatus === 'normal' && 'bg-green-100 text-green-700',
              previewStatus === 'high' && 'bg-red-100 text-red-700',
              previewStatus === 'low' && 'bg-blue-100 text-blue-700'
            )}
          >
            <Info className="w-4 h-4" />
            {previewStatus === 'normal' && '血压正常，继续保持！'}
            {previewStatus === 'high' && '血压偏高，请关注'}
            {previewStatus === 'low' && '血压偏低，请关注'}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Activity className="w-4 h-4" />
            测量条件
          </label>
          <div className="grid grid-cols-3 gap-2">
            {conditionOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCondition(opt.value)}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-medium transition-all',
                  condition === opt.value
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Activity className="w-4 h-4" />
            测量设备
          </label>
          <div className="grid grid-cols-4 gap-2">
            {deviceOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDevice(opt.value)}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-medium transition-all',
                  device === opt.value
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <StickyNote className="w-4 h-4" />
            备注（选填）
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="记录身体状况、饮食、运动等情况..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-colors resize-none text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className={cn(
          'w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all',
          isValid
            ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl active:scale-[0.99]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        )}
      >
        <Save className="w-5 h-5" />
        保存记录
      </button>
    </div>
  );
}
