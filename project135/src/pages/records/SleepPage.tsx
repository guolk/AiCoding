import { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle, Moon, Sun, Sunrise, Sunset, Star, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Card from '@/components/Card';
import { useAppStore } from '@/store';
import { formatDate, formatDateCN, getDaysAgo } from '@/utils/date';
import type { DailyRecord, SleepRecord, EnergyRecord } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SleepPage() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [duration, setDuration] = useState(7);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(3);
  const [morningEnergy, setMorningEnergy] = useState(5);
  const [afternoonEnergy, setAfternoonEnergy] = useState(5);
  const [eveningEnergy, setEveningEnergy] = useState(5);
  const [saved, setSaved] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const addDailyRecord = useAppStore((state) => state.addDailyRecord);
  const updateDailyRecord = useAppStore((state) => state.updateDailyRecord);
  const getDailyRecordByDate = useAppStore((state) => state.getDailyRecordByDate);

  useEffect(() => {
    const record = getDailyRecordByDate(selectedDate);
    if (record) {
      setDuration(record.sleep.duration);
      setBedtime(record.sleep.bedtime);
      setWakeTime(record.sleep.wakeTime);
      setQuality(record.sleep.quality);
      setMorningEnergy(record.energy.morning);
      setAfternoonEnergy(record.energy.afternoon);
      setEveningEnergy(record.energy.evening);
    } else {
      setDuration(7);
      setBedtime('23:00');
      setWakeTime('07:00');
      setQuality(3);
      setMorningEnergy(5);
      setAfternoonEnergy(5);
      setEveningEnergy(5);
    }
    setSaved(false);
  }, [selectedDate, getDailyRecordByDate]);

  const handleSave = () => {
    const existingRecord = getDailyRecordByDate(selectedDate);
    const sleepData: SleepRecord = {
      quality,
      duration,
      bedtime,
      wakeTime,
    };
    const energyData: EnergyRecord = {
      morning: morningEnergy,
      afternoon: afternoonEnergy,
      evening: eveningEnergy,
    };

    if (existingRecord) {
      updateDailyRecord(existingRecord.id, { sleep: sleepData, energy: energyData });
    } else {
      const newRecord: DailyRecord = {
        id: String(Date.now()),
        date: selectedDate,
        diet: { breakfast: '', lunch: '', dinner: '', snacks: '', compliance: 0 },
        sleep: sleepData,
        energy: energyData,
        symptoms: [],
      };
      addDailyRecord(newRecord);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(formatDate(date));
  };

  const getLast7DaysRecords = () => {
    const records: { date: string; record?: DailyRecord }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = getDaysAgo(i);
      const record = getDailyRecordByDate(date);
      records.push({ date, record });
    }
    return records;
  };

  const last7Days = getLast7DaysRecords();

  const sleepChartData = {
    labels: last7Days.map((d) => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: '睡眠时长(小时)',
        data: last7Days.map((d) => d.record?.sleep.duration || 0),
        borderColor: '#2C5F2D',
        backgroundColor: 'rgba(44, 95, 45, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#2C5F2D',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#2C5F2D',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true,
      },
      {
        label: '睡眠质量(分)',
        data: last7Days.map((d) => (d.record?.sleep.quality || 0) * 2),
        borderColor: '#B5651D',
        backgroundColor: 'rgba(181, 101, 29, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#B5651D',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#B5651D',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const energyChartData = {
    labels: last7Days.map((d) => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: '上午精力',
        data: last7Days.map((d) => d.record?.energy.morning || 0),
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
      },
      {
        label: '下午精力',
        data: last7Days.map((d) => d.record?.energy.afternoon || 0),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
      },
      {
        label: '晚上精力',
        data: last7Days.map((d) => d.record?.energy.evening || 0),
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          stepSize: 2,
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            family: '"Noto Sans SC", "PingFang SC", sans-serif',
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(44, 95, 45, 0.9)',
        titleFont: {
          size: 14,
          family: '"Noto Sans SC", "PingFang SC", sans-serif',
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  const getQualityLabel = (q: number) => {
    const labels = ['很差', '较差', '一般', '良好', '优秀'];
    return labels[q - 1] || '一般';
  };

  const getQualityColor = (q: number) => {
    if (q >= 4) return '#22c55e';
    if (q >= 3) return '#f59e0b';
    return '#ef4444';
  };

  const getAverageSleep = (): string => {
    const validRecords = last7Days.filter((d) => d.record);
    if (validRecords.length === 0) return '0';
    const total = validRecords.reduce((sum, d) => sum + (d.record?.sleep.duration || 0), 0);
    return (total / validRecords.length).toFixed(1);
  };

  const getAverageQuality = (): string => {
    const validRecords = last7Days.filter((d) => d.record);
    if (validRecords.length === 0) return '0';
    const total = validRecords.reduce((sum, d) => sum + (d.record?.sleep.quality || 0), 0);
    return (total / validRecords.length).toFixed(1);
  };

  const getSleepAnalysis = () => {
    const avgDuration = parseFloat(getAverageSleep());
    const avgQuality = parseFloat(getAverageQuality());
    const tips: { icon: typeof TrendingUp; text: string; type: 'good' | 'bad' | 'neutral' }[] = [];

    if (avgDuration >= 7 && avgDuration <= 9) {
      tips.push({ icon: TrendingUp, text: '睡眠时长理想，保持良好作息', type: 'good' });
    } else if (avgDuration < 7) {
      tips.push({ icon: TrendingDown, text: '睡眠不足，建议每晚睡够7-9小时', type: 'bad' });
    } else {
      tips.push({ icon: Minus, text: '睡眠时间偏长，注意睡眠质量', type: 'neutral' });
    }

    if (avgQuality >= 4) {
      tips.push({ icon: TrendingUp, text: '睡眠质量良好，继续保持', type: 'good' });
    } else if (avgQuality <= 2) {
      tips.push({ icon: TrendingDown, text: '睡眠质量较差，建议睡前放松', type: 'bad' });
    }

    if (bedtime > '23:00') {
      tips.push({ icon: Minus, text: '建议23点前入睡，养肝补血', type: 'bad' });
    }

    if (wakeTime < '06:00') {
      tips.push({ icon: Minus, text: '早起注意保暖，避免受凉', type: 'neutral' });
    }

    return tips;
  };

  const getEnergyColor = (value: number) => {
    if (value >= 8) return '#22c55e';
    if (value >= 5) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">睡眠精力记录</h1>
            <p className="text-gray-600">记录睡眠质量，追踪每日精力变化</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDateChange(-1)}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-800">{formatDateCN(new Date(selectedDate))}</span>
            </div>
            <button
              onClick={() => handleDateChange(1)}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Moon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">平均睡眠时长</p>
                <p className="text-2xl font-bold text-gray-800">{getAverageSleep()}<span className="text-sm font-normal text-gray-500"> 小时</span></p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">平均睡眠质量</p>
                <p className="text-2xl font-bold text-gray-800">{getAverageQuality()}<span className="text-sm font-normal text-gray-500"> / 5</span></p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Sunrise className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-500">今日精力指数</p>
                <p className="text-2xl font-bold text-gray-800">{Math.round((morningEnergy + afternoonEnergy + eveningEnergy) / 3)}<span className="text-sm font-normal text-gray-500"> / 10</span></p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="睡眠记录">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">入睡时间</label>
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-secondary" />
                    <input
                      type="time"
                      value={bedtime}
                      onChange={(e) => setBedtime(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">起床时间</label>
                  <div className="flex items-center gap-2">
                    <Sunrise className="w-5 h-5 text-orange-500" />
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">睡眠时长：{duration} 小时</label>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0h</span>
                  <span>6h</span>
                  <span>12h</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">睡眠质量评分</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setQuality(star)}
                      className="p-2 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= quality ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center mt-2 text-sm font-medium" style={{ color: getQualityColor(quality) }}>
                  {getQualityLabel(quality)}
                </p>
              </div>
            </div>
          </Card>

          <Card title="精力记录">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">上午精力</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: getEnergyColor(morningEnergy) }}>
                    {morningEnergy}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={morningEnergy}
                  onChange={(e) => setMorningEnergy(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: getEnergyColor(morningEnergy) }}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sunset className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium text-gray-700">下午精力</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: getEnergyColor(afternoonEnergy) }}>
                    {afternoonEnergy}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={afternoonEnergy}
                  onChange={(e) => setAfternoonEnergy(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: getEnergyColor(afternoonEnergy) }}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">晚上精力</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: getEnergyColor(eveningEnergy) }}>
                    {eveningEnergy}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={eveningEnergy}
                  onChange={(e) => setEveningEnergy(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: getEnergyColor(eveningEnergy) }}
                />
              </div>
              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
                >
                  <Save className="w-5 h-5" />
                  保存记录
                </button>
                {saved && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">保存成功！</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <Card title="最近7天睡眠趋势">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'line' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              折线图
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'bar' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              柱状图
            </button>
          </div>
          <div className="h-64">
            {chartType === 'line' ? (
              <Line data={sleepChartData} options={chartOptions} />
            ) : (
              <Bar data={energyChartData} options={chartOptions} />
            )}
          </div>
        </Card>

        <Card title="睡眠质量分析与建议">
          <div className="space-y-3">
            {getSleepAnalysis().map((tip, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-xl ${
                  tip.type === 'good'
                    ? 'bg-green-50 border border-green-100'
                    : tip.type === 'bad'
                    ? 'bg-red-50 border border-red-100'
                    : 'bg-amber-50 border border-amber-100'
                }`}
              >
                <tip.icon
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    tip.type === 'good'
                      ? 'text-green-500'
                      : tip.type === 'bad'
                      ? 'text-red-500'
                      : 'text-amber-500'
                  }`}
                />
                <p
                  className={`text-sm ${
                    tip.type === 'good'
                      ? 'text-green-700'
                      : tip.type === 'bad'
                      ? 'text-red-700'
                      : 'text-amber-700'
                  }`}
                >
                  {tip.text}
                </p>
              </div>
            ))}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <h4 className="font-medium text-primary mb-2">养生小贴士</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 睡前1小时避免使用电子设备，可泡脚放松</li>
                <li>• 子午觉很重要，午时（11-13点）小憩20-30分钟</li>
                <li>• 卧室保持安静、黑暗、温度适宜（18-22℃）</li>
                <li>• 晚餐避免过饱、过油，睡前不喝浓茶咖啡</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
