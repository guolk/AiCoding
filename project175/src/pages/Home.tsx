import { useMemo } from 'react';
import {
  Activity,
  Pill,
  Heart,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Flame,
  Scale,
  Droplets,
  FileText,
  Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHealthStore } from '@/store';
import StatCard from '@/components/Cards/StatCard';
import {
  cn,
  formatDate,
  isBloodPressureNormal,
  calculateBloodPressureControlRate,
  getTimePeriod,
  getBMIStatus,
} from '@/utils';

export default function Home() {
  const {
    bloodPressureRecords,
    medications,
    adherenceRecords,
    saltIntakeRecords,
    exerciseRecords,
    bodyMeasurementRecords,
    appointments,
    examReports,
  } = useHealthStore();

  const today = formatDate(new Date());

  const latestBP = useMemo(() => {
    if (bloodPressureRecords.length === 0) return null;
    const sorted = [...bloodPressureRecords].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      const order = { morning: 0, other: 1, evening: 2 };
      return order[b.timeOfDay] - order[a.timeOfDay];
    });
    return sorted[0];
  }, [bloodPressureRecords]);

  const bpControlRate = useMemo(() => {
    const last30Days = bloodPressureRecords.filter((r) => {
      const diff = Math.abs(
        (new Date(r.date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
      );
      return diff <= 30;
    });
    return calculateBloodPressureControlRate(last30Days);
  }, [bloodPressureRecords, today]);

  const activeMeds = useMemo(
    () => medications.filter((m) => m.isActive),
    [medications]
  );

  const todayAdherence = useMemo(() => {
    const todayRecords = adherenceRecords.filter((r) => r.date === today);
    if (todayRecords.length === 0) return { taken: 0, total: activeMeds.length, rate: 0 };
    const taken = todayRecords.filter((r) => r.status === 'taken').length;
    return {
      taken,
      total: activeMeds.length,
      rate: activeMeds.length > 0 ? Math.round((taken / activeMeds.length) * 100) : 0,
    };
  }, [adherenceRecords, today, activeMeds]);

  const todayExercise = useMemo(() => {
    const todayExercises = exerciseRecords.filter((r) => r.date === today);
    const totalMinutes = todayExercises.reduce((sum, e) => sum + e.durationMinutes, 0);
    const totalCalories = todayExercises.reduce(
      (sum, e) => sum + (e.caloriesBurned || 0),
      0
    );
    return { count: todayExercises.length, totalMinutes, totalCalories };
  }, [exerciseRecords, today]);

  const todaySalt = useMemo(() => {
    const record = saltIntakeRecords.find((r) => r.date === today);
    return record?.amountGrams || 0;
  }, [saltIntakeRecords, today]);

  const latestWeight = useMemo(() => {
    if (bodyMeasurementRecords.length === 0) return null;
    const sorted = [...bodyMeasurementRecords].sort((a, b) =>
      a.date < b.date ? 1 : -1
    );
    return sorted[0];
  }, [bodyMeasurementRecords]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => !a.isCompleted && a.date >= today)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, 2);
  }, [appointments, today]);

  const latestExam = useMemo(() => {
    if (examReports.length === 0) return null;
    const sorted = [...examReports].sort((a, b) => (a.date < b.date ? 1 : -1));
    return sorted[0];
  }, [examReports]);

  const bpIsNormal = latestBP
    ? isBloodPressureNormal(latestBP.systolic, latestBP.diastolic)
    : false;

  const timePeriod = getTimePeriod();
  const greeting =
    timePeriod === 'morning'
      ? '早上好'
      : timePeriod === 'evening'
      ? '晚上好'
      : '下午好';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-blue-100 text-sm">{greeting}，欢迎回来</p>
          <h1 className="text-2xl lg:text-3xl font-bold mt-1">今天也要好好照顾自己 💙</h1>
          <p className="text-blue-100 mt-2 text-sm">
            {today} · 坚持记录，掌控健康
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="最近血压"
          value={latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}
          subtitle={latestBP ? `${latestBP.date} · 心率 ${latestBP.pulse}` : '暂无记录'}
          trend={bpIsNormal ? 'down' : 'up'}
          trendValue={bpIsNormal ? '正常' : '偏高'}
          icon={Activity}
          gradient="from-rose-500 to-red-600"
          iconGradient="from-rose-500 to-red-600"
        />
        <StatCard
          title="血压达标率"
          value={`${bpControlRate.rate}%`}
          subtitle={`${bpControlRate.inRange}/${bpControlRate.total} 次达标`}
          icon={Target}
          gradient="from-emerald-500 to-teal-600"
          iconGradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="今日服药"
          value={`${todayAdherence.taken}/${todayAdherence.total}`}
          subtitle={`依从率 ${todayAdherence.rate}%`}
          icon={Pill}
          gradient="from-blue-500 to-indigo-600"
          iconGradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="今日运动"
          value={`${todayExercise.totalMinutes} 分钟`}
          subtitle={todayExercise.totalCalories > 0 ? `消耗 ${todayExercise.totalCalories} 千卡` : '暂无记录'}
          icon={Flame}
          gradient="from-orange-500 to-amber-600"
          iconGradient="from-orange-500 to-amber-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg shadow-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">血压趋势</h3>
              </div>
              <Link
                to="/blood-pressure"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                查看详情
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {latestBP ? (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-rose-600 tabular-nums">
                    {latestBP.systolic}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">收缩压</div>
                </div>
                <div className="text-3xl font-light text-slate-300">/</div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 tabular-nums">
                    {latestBP.diastolic}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">舒张压</div>
                </div>
                <div className="ml-auto">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                      bpIsNormal
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {bpIsNormal ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {bpIsNormal ? '正常' : '偏高'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">暂无血压记录</p>
            )}
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg shadow-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">今日用药</h3>
              </div>
              <Link
                to="/medication"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                管理用药
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {activeMeds.length > 0 ? (
              <div className="space-y-3">
                {activeMeds.slice(0, 3).map((med) => {
                  const record = adherenceRecords.find(
                    (r) => r.date === today && r.medicationId === med.id
                  );
                  const isTaken = record?.status === 'taken';
                  return (
                    <div
                      key={med.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            isTaken ? 'bg-green-100' : 'bg-slate-200'
                          )}
                        >
                          {isTaken ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Pill className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{med.name}</p>
                          <p className="text-xs text-slate-500">{med.dosage}</p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium px-2.5 py-1 rounded-full',
                          isTaken
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {isTaken ? '已服用' : '待服用'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">暂无在服药物</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg shadow-slate-200/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">复诊提醒</h3>
            </div>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl bg-amber-50 border border-amber-100"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        {apt.date} {apt.time}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1">{apt.doctor} · {apt.department}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{apt.hospital}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-6 text-sm">暂无待复诊</p>
            )}
            <Link
              to="/medical"
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700"
            >
              查看全部预约
            </Link>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg shadow-slate-200/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">生活方式</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-slate-600">今日盐摄入</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {todaySalt > 0 ? `${todaySalt} g` : '未记录'}
                </span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-slate-600">今日运动</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {todayExercise.totalMinutes > 0 ? `${todayExercise.totalMinutes} 分钟` : '未记录'}
                </span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-slate-600">当前体重</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {latestWeight ? `${latestWeight.weightKg} kg` : '未记录'}
                </span>
              </div>
              {latestWeight?.bmi && (
                <>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">BMI 指数</span>
                    <span
                      className={cn(
                        'font-semibold',
                        getBMIStatus(latestWeight.bmi) === '正常'
                          ? 'text-green-600'
                          : 'text-amber-600'
                      )}
                    >
                      {latestWeight.bmi} · {getBMIStatus(latestWeight.bmi)}
                    </span>
                  </div>
                </>
              )}
            </div>
            <Link
              to="/lifestyle"
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700"
            >
              查看生活方式记录
            </Link>
          </div>

          {latestExam && (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg shadow-slate-200/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">最近检查</h3>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/80">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{latestExam.typeLabel}</span>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      latestExam.isNormal
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {latestExam.isNormal ? '正常' : '异常'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{latestExam.date}</p>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{latestExam.summary}</p>
              </div>
              <Link
                to="/medical"
                className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700"
              >
                查看全部报告
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
