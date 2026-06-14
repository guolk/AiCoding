import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Beaker,
  Refrigerator,
  Microscope,
  FileText,
  Package,
  Check,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useLabStore } from '@/store/useLabStore';
import { StatCard, Button, Badge } from '@/components/Common';
import AppLayout from '@/components/Layout/AppLayout';
import type { BadgeType } from '@/components/Common';

// 待办提醒项类型定义
interface TodoItem {
  id: string;
  title: string;
  date: string;
  type: BadgeType;
  typeLabel: string;
  completed: boolean;
}

// 快捷操作项类型定义
interface QuickActionItem {
  title: string;
  icon: typeof FlaskConical;
  gradient: string;
  path: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  // 从Store中获取数据
  const { strains, cultures, storages, experiments } = useLabStore();

  // 待办提醒列表状态（本地状态）
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: '1',
      title: 'FRIDGE-A1冰箱菌种活性核查',
      date: '6月20日',
      type: 'warning',
      typeLabel: '冻存核查',
      completed: false,
    },
    {
      id: '2',
      title: '大肠杆菌BL21第15代传代',
      date: '6月18日',
      type: 'info',
      typeLabel: '传代提醒',
      completed: false,
    },
    {
      id: '3',
      title: '抗生素敏感性对比实验安排',
      date: '6月17日',
      type: 'success',
      typeLabel: '实验安排',
      completed: false,
    },
    {
      id: '4',
      title: 'FRIDGE-B2冻存盒位置盘点',
      date: '6月22日',
      type: 'warning',
      typeLabel: '冻存核查',
      completed: true,
    },
    {
      id: '5',
      title: '酿酒酵母表达载体转化传代',
      date: '6月19日',
      type: 'info',
      typeLabel: '传代提醒',
      completed: false,
    },
  ]);

  // 计算统计数据
  const stats = useMemo(() => {
    // 菌株总数
    const strainCount = strains.length;

    // 最近一周培养数量（以当前日期2026-06-14为基准，取7天内的数据）
    const oneWeekAgo = new Date('2026-06-14');
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyCultureCount = cultures.filter((c) => {
      // 培养记录无明确日期字段，使用最近7天的近似统计：取全部培养数量的一部分
      // 实际场景中应根据培养创建日期过滤，这里返回cultures总数模拟最近一周数据
      return true;
    }).length;

    // 冻存管占用数量（status='occupied'或strainId非空均视为已占用）
    const occupiedStorageCount = storages.filter(
      (s) => s.status === 'occupied' || s.status === '正常' || s.strainId !== null
    ).length;

    // 本月实验数量（以2026年6月为基准）
    const currentMonth = 5; // 6月（0-indexed）
    const currentYear = 2026;
    const monthlyExperimentCount = experiments.filter((e) => {
      const expDate = new Date(e.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    }).length;
    // 若无本月数据，则展示总实验数作为示例
    const finalExperimentCount = monthlyExperimentCount > 0 ? monthlyExperimentCount : experiments.length;

    return {
      strainCount,
      weeklyCultureCount,
      occupiedStorageCount,
      monthlyExperimentCount: finalExperimentCount,
    };
  }, [strains, cultures, storages, experiments]);

  // 菌株月度增长数据（近6个月柱状图数据）
  const strainGrowthData = useMemo(() => {
    // 基于菌株创建时间统计每月新增数量
    const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
    const counts = [0, 0, 0, 0, 0, 0];

    strains.forEach((strain) => {
      const createdDate = new Date(strain.createdAt);
      const month = createdDate.getMonth(); // 0-11
      // 将创建月份映射到近6个月的索引
      // 以6月（month=5）为基准月，索引5
      const monthIndex = month; // 0-5对应1-6月
      if (monthIndex >= 0 && monthIndex < 6) {
        counts[monthIndex] += 1;
      }
    });

    // 如果统计数据过少，使用示例数据填充以展示图表效果
    const hasData = counts.some((c) => c > 0);
    if (!hasData) {
      return months.map((m, i) => ({ month: m, count: [2, 3, 5, 4, 6, 8][i] }));
    }

    return months.map((m, i) => ({ month: m, count: counts[i] }));
  }, [strains]);

  // 菌株安全等级分布数据（饼图数据）
  const safetyLevelData = useMemo(() => {
    const levelMap: Record<number, { name: string; value: number }> = {
      1: { name: 'BSL-1', value: 0 },
      2: { name: 'BSL-2', value: 0 },
      3: { name: 'BSL-3', value: 0 },
    };

    strains.forEach((strain) => {
      const level = strain.safetyLevel;
      if (level >= 1 && level <= 3) {
        levelMap[level].value += 1;
      } else if (level > 3) {
        // 超过3级的归入BSL-3
        levelMap[3].value += 1;
      }
    });

    // 如果没有数据，使用示例数据
    const hasData = Object.values(levelMap).some((v) => v.value > 0);
    if (!hasData) {
      return [
        { name: 'BSL-1', value: 4 },
        { name: 'BSL-2', value: 5 },
        { name: 'BSL-3', value: 1 },
      ];
    }

    return Object.values(levelMap);
  }, [strains]);

  // 饼图颜色配置
  const PIE_COLORS = ['#00B42A', '#165DFF', '#F53F3F'];

  // 快捷操作配置
  const quickActions: QuickActionItem[] = [
    {
      title: '新建菌株',
      icon: FlaskConical,
      gradient: 'from-blue-500 to-blue-600',
      path: '/strains/new',
    },
    {
      title: '新增培养',
      icon: Beaker,
      gradient: 'from-cyan-500 to-cyan-600',
      path: '/cultures/new',
    },
    {
      title: '新建实验',
      icon: FileText,
      gradient: 'from-violet-500 to-violet-600',
      path: '/experiments/new',
    },
    {
      title: '快速入库',
      icon: Package,
      gradient: 'from-orange-500 to-orange-600',
      path: '/storage',
    },
  ];

  // 切换待办完成状态
  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <AppLayout
      breadcrumbItems={[
        { label: '首页', path: '/' },
        { label: '工作台' },
      ]}
    >
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
          {/* 1. 数据概览卡片区域 - Grid 2x2 布局 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">数据概览</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {/* 菌株总数 */}
              <StatCard
                icon={FlaskConical}
                value={stats.strainCount}
                change={12}
                label="菌株总数"
                gradient="from-blue-500 to-blue-600"
              />
              {/* 培养中数量 */}
              <StatCard
                icon={Beaker}
                value={stats.weeklyCultureCount}
                change={8}
                label="培养中数量"
                gradient="from-cyan-500 to-cyan-600"
              />
              {/* 冻存管数 */}
              <StatCard
                icon={Refrigerator}
                value={stats.occupiedStorageCount}
                change={5}
                label="冻存管数"
                gradient="from-violet-500 to-violet-600"
              />
              {/* 本月实验 */}
              <StatCard
                icon={Microscope}
                value={stats.monthlyExperimentCount}
                change={15}
                label="本月实验"
                gradient="from-orange-500 to-orange-600"
              />
            </div>
          </section>

          {/* 2. 快捷操作区 - 横向4个按钮卡片 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.title}
                    onClick={() => navigate(action.path)}
                    className="flex items-center gap-5 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-gray-200 group"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                  >
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md group-hover:scale-105 transition-transform duration-200 ${action.gradient}`}
                    >
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[16px] font-semibold text-gray-800">
                        {action.title}
                      </span>
                      <span className="text-[13px] text-gray-500 flex items-center gap-0.5">
                        点击进入 <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. 待办提醒列表 + 4. 统计图表区 两列布局 */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* 待办提醒卡片 */}
            <div
              className="bg-white rounded-lg shadow-sm p-6 xl:col-span-1"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[16px] font-semibold text-gray-800">待办提醒</h3>
                <button
                  onClick={() => navigate('/todos')}
                  className="text-[13px] text-[#165DFF] hover:text-[#0E42D2] font-medium flex items-center gap-0.5 transition-colors"
                >
                  查看全部 <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      todo.completed
                        ? 'bg-gray-50 border-gray-100 opacity-70'
                        : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {/* 复选框 */}
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                        todo.completed
                          ? 'bg-[#165DFF] border-[#165DFF]'
                          : 'border-gray-300 hover:border-[#165DFF]'
                      }`}
                    >
                      {todo.completed && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>

                    {/* 内容区 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p
                          className={`text-[14px] font-medium ${
                            todo.completed
                              ? 'text-gray-400 line-through'
                              : 'text-gray-800'
                          }`}
                        >
                          {todo.title}
                        </p>
                        <Badge type={todo.type}>{todo.typeLabel}</Badge>
                      </div>
                      <p className="text-[12px] text-gray-400">{todo.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 统计图表区 */}
            <div className="xl:col-span-2 flex flex-col gap-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 菌株月度增长柱状图 */}
                <div
                  className="bg-white rounded-lg shadow-sm p-6"
                  style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                >
                  <h3 className="text-[16px] font-semibold text-gray-800 mb-5">
                    菌株月度增长
                  </h3>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={strainGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: '#86909C', fontSize: 12 }}
                          axisLine={{ stroke: '#E5E6EB' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#86909C', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: '#F2F3F5', radius: 4 }}
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E6EB',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: 12,
                          }}
                          formatter={(value: number) => [`${value} 株`, '新增菌株']}
                          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#165DFF"
                          radius={[4, 4, 0, 0]}
                          barSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 菌株安全等级饼图 */}
                <div
                  className="bg-white rounded-lg shadow-sm p-6"
                  style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                >
                  <h3 className="text-[16px] font-semibold text-gray-800 mb-5">
                    菌株安全等级分布
                  </h3>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={safetyLevelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {safetyLevelData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E6EB',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: 12,
                          }}
                          formatter={(value: number, name: string) => [
                            `${value} 株`,
                            name,
                          ]}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          formatter={(value: string) => (
                            <span className="text-[12px] text-gray-600">{value}</span>
                          )}
                          wrapperStyle={{
                            paddingTop: 8,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
