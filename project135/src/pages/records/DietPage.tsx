import { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Utensils } from 'lucide-react';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import { useAppStore } from '@/store';
import { HEALTH_ADVICE } from '@/data/healthAdvice';
import { getConstitutionName } from '@/utils/constitution';
import { formatDate, formatDateCN, getDaysAgo } from '@/utils/date';
import type { DailyRecord, DietRecord } from '@/types';

const CONSTITUTION_TYPES = ['平和质', '气虚质', '阳虚质', '阴虚质', '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质'];

export default function DietPage() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [snacks, setSnacks] = useState('');
  const [compliance, setCompliance] = useState(0);
  const [saved, setSaved] = useState(false);

  const addDailyRecord = useAppStore((state) => state.addDailyRecord);
  const updateDailyRecord = useAppStore((state) => state.updateDailyRecord);
  const getDailyRecordByDate = useAppStore((state) => state.getDailyRecordByDate);
  const dailyRecords = useAppStore((state) => state.dailyRecords);
  const latestResult = useAppStore((state) => state.getLatestConstitutionResult());

  const constitutionType = latestResult ? getConstitutionName(latestResult.mainType) : '平和质';
  const healthAdvice = HEALTH_ADVICE.find((h) => h.type === constitutionType);

  useEffect(() => {
    const record = getDailyRecordByDate(selectedDate);
    if (record) {
      setBreakfast(record.diet.breakfast);
      setLunch(record.diet.lunch);
      setDinner(record.diet.dinner);
      setSnacks(record.diet.snacks);
      setCompliance(record.diet.compliance);
    } else {
      setBreakfast('');
      setLunch('');
      setDinner('');
      setSnacks('');
      setCompliance(0);
    }
    setSaved(false);
  }, [selectedDate, getDailyRecordByDate]);

  const calculateCompliance = (): number => {
    if (!healthAdvice) return 0;
    const advice = healthAdvice.diet.join('');
    const allText = breakfast + lunch + dinner + snacks;
    let score = 50;
    const positiveKeywords = ['蔬菜', '水果', '小米', '燕麦', '豆类', '鱼', '蛋', '奶', '山药', '莲子', '枣', '银耳', '百合', '梨', '薏米', '红豆', '冬瓜', '苦瓜', '绿豆', '山楂', '核桃', '枸杞'];
    const negativeKeywords = ['油炸', '烧烤', '辣椒', '火锅', '肥肉', '奶油', '蛋糕', '可乐', '汽水', '薯片', '快餐', '外卖', '冰', '冷'];
    positiveKeywords.forEach((keyword) => {
      if (allText.includes(keyword)) score += 4;
    });
    negativeKeywords.forEach((keyword) => {
      if (allText.includes(keyword)) score -= 5;
    });
    if (breakfast) score += 10;
    if (lunch) score += 10;
    if (dinner) score += 10;
    return Math.min(Math.max(score, 0), 100);
  };

  const handleSave = () => {
    const newCompliance = calculateCompliance();
    setCompliance(newCompliance);
    
    const existingRecord = getDailyRecordByDate(selectedDate);
    const dietData: DietRecord = {
      breakfast,
      lunch,
      dinner,
      snacks,
      compliance: newCompliance,
    };
    
    if (existingRecord) {
      updateDailyRecord(existingRecord.id, { diet: dietData });
    } else {
      const newRecord: DailyRecord = {
        id: String(Date.now()),
        date: selectedDate,
        diet: dietData,
        sleep: { quality: 3, duration: 7, bedtime: '23:00', wakeTime: '07:00' },
        energy: { morning: 5, afternoon: 5, evening: 5 },
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

  const getComplianceColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getDoAdvice = () => {
    if (!healthAdvice) return [];
    return healthAdvice.diet.slice(0, 5);
  };

  const getDontAdvice = () => {
    const type = constitutionType;
    if (type === '气虚质') return ['避免过度劳累', '少吃生冷苦寒食物', '少吃油腻难消化食物'];
    if (type === '阳虚质') return ['少吃生冷寒凉食物', '避免喝冰镇饮料', '避免过度消耗阳气'];
    if (type === '阴虚质') return ['少吃辛辣燥热食物', '避免煎炸烧烤', '避免熬夜伤阴'];
    if (type === '痰湿质') return ['少吃肥甘厚味', '少吃甜腻食物', '控制油脂摄入'];
    if (type === '湿热质') return ['少吃辛辣油腻食物', '避免甜腻食物', '戒烟限酒'];
    if (type === '血瘀质') return ['少吃生冷寒凉食物', '少吃肥腻厚味', '避免久坐不动'];
    if (type === '气郁质') return ['少吃酸涩收敛食物', '避免生冷寒凉', '避免过度思虑'];
    if (type === '特禀质') return ['避免已知过敏食物', '少吃海鲜发物', '避免辛辣刺激'];
    return ['少吃油腻辛辣', '避免暴饮暴食', '少喝甜饮料'];
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">饮食日志</h1>
            <p className="text-gray-600">记录每日饮食，追踪饮食健康</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="今日饮食记录">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">早餐</label>
                  <textarea
                    value={breakfast}
                    onChange={(e) => setBreakfast(e.target.value)}
                    placeholder="例如：小米粥、包子、鸡蛋..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">午餐</label>
                  <textarea
                    value={lunch}
                    onChange={(e) => setLunch(e.target.value)}
                    placeholder="例如：米饭、炒青菜、清蒸鱼..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">晚餐</label>
                  <textarea
                    value={dinner}
                    onChange={(e) => setDinner(e.target.value)}
                    placeholder="例如：面条、凉拌黄瓜..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">加餐</label>
                  <textarea
                    value={snacks}
                    onChange={(e) => setSnacks(e.target.value)}
                    placeholder="例如：水果、坚果、酸奶..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all"
                    rows={2}
                  />
                </div>
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">饮食遵循度评分</span>
                    <span className="text-2xl font-bold" style={{ color: getComplianceColor(compliance) }}>
                      {compliance}分
                    </span>
                  </div>
                  <ProgressBar value={compliance} color={getComplianceColor(compliance)} height="lg" />
                  <p className="text-xs text-gray-500 mt-2">根据您的{constitutionType}饮食建议智能评估</p>
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

            <Card title="最近7天饮食记录">
              <div className="space-y-3">
                {last7Days.map(({ date, record }) => (
                  <div
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      date === selectedDate
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Utensils className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-gray-800">{formatDateCN(new Date(date))}</p>
                          {record ? (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {record.diet.breakfast || '未记录早餐'} · {record.diet.lunch || '未记录午餐'}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">暂无记录</p>
                          )}
                        </div>
                      </div>
                      {record && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">遵循度</span>
                          <div className="w-20">
                            <ProgressBar
                              value={record.diet.compliance}
                              color={getComplianceColor(record.diet.compliance)}
                              height="sm"
                            />
                          </div>
                          <span
                            className="text-sm font-bold"
                            style={{ color: getComplianceColor(record.diet.compliance) }}
                          >
                            {record.diet.compliance}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title={`${constitutionType}饮食宜忌`}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-800">宜</span>
                  </div>
                  <ul className="space-y-2">
                    {getDoAdvice().map((advice, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-green-100 text-green-600 text-xs font-bold rounded-full mt-0.5">
                          {idx + 1}
                        </span>
                        {advice}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-gray-800">忌</span>
                  </div>
                  <ul className="space-y-2">
                    {getDontAdvice().map((advice, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-red-100 text-red-600 text-xs font-bold rounded-full mt-0.5">
                          {idx + 1}
                        </span>
                        {advice}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            <Card title="您的体质">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                  <span className="text-2xl font-bold text-primary">{constitutionType.charAt(0)}</span>
                </div>
                <p className="font-medium text-gray-800 mb-2">{constitutionType}</p>
                <p className="text-sm text-gray-500">{healthAdvice?.description}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
