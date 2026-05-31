import { Link } from 'react-router-dom';
import {
  Calculator,
  Target,
  Dumbbell,
  BarChart2,
  TrendingUp,
  ArrowRight,
  Timer,
  MapPin,
  Heart,
  Zap
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getPerformanceLevel } from '@/utils/formatters';

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  bgGradient: string;
}

const features: FeatureCard[] = [
  {
    title: '配速计算',
    description: '目标完赛时间配速分解、坡度调整、环境影响分析',
    icon: Calculator,
    path: '/pace-calculator',
    color: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-white'
  },
  {
    title: '比赛策略',
    description: '分段配速计划、补给站规划、应急预案制定',
    icon: Target,
    path: '/race-strategy',
    color: 'from-primary-500 to-primary-600',
    bgGradient: 'from-primary-50 to-white'
  },
  {
    title: '训练管理',
    description: '训练配速区间、训练对比、季节性调整建议',
    icon: Dumbbell,
    path: '/training',
    color: 'from-emerald-500 to-emerald-600',
    bgGradient: 'from-emerald-50 to-white'
  },
  {
    title: '比赛复盘',
    description: '配速数据导入、可视化分析、策略执行评估',
    icon: BarChart2,
    path: '/race-review',
    color: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-white'
  },
  {
    title: '成绩预测',
    description: '基于Jack Daniels公式的比赛目标成绩预测',
    icon: TrendingUp,
    path: '/prediction',
    color: 'from-amber-500 to-amber-600',
    bgGradient: 'from-amber-50 to-white'
  }
];

export default function Home() {
  const { userProfile, trainingRecords, raceReviews, racePlans } = useAppStore();
  const performanceLevel = getPerformanceLevel(userProfile.vdot);

  const recentTraining = trainingRecords.slice(0, 3);
  const upcomingPlans = racePlans
    .filter(p => new Date(p.date) > new Date())
    .slice(0, 2);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-800 via-secondary-900 to-secondary-800 text-white py-16 lg:py-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center px-4 py-2 bg-primary-500/20 rounded-full text-primary-300 text-sm mb-6">
                <Zap className="w-4 h-4 mr-2" />
                专业跑步规划工具
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                科学规划，
                <br />
                <span className="text-primary-400">跑出更好的自己</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                从配速计算到比赛策略，从训练管理到成绩预测，
                一站式跑步规划工具助你实现目标。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/pace-calculator"
                  className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  开始计算
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/prediction"
                  className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all duration-200 backdrop-blur"
                >
                  预测成绩
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center space-x-2 text-primary-400 mb-3">
                  <Timer className="w-5 h-5" />
                  <span className="text-sm font-medium">当前VDOT</span>
                </div>
                <div className="text-4xl font-bold">{userProfile.vdot}</div>
                <div className={`text-sm mt-2 ${performanceLevel.color}`}>{performanceLevel.level}</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center space-x-2 text-emerald-400 mb-3">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">最高心率</span>
                </div>
                <div className="text-4xl font-bold">{userProfile.maxHeartRate}</div>
                <div className="text-sm text-gray-400 mt-2">静息 {userProfile.restingHeartRate} bpm</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center space-x-2 text-blue-400 mb-3">
                  <Dumbbell className="w-5 h-5" />
                  <span className="text-sm font-medium">训练记录</span>
                </div>
                <div className="text-4xl font-bold">{trainingRecords.length}</div>
                <div className="text-sm text-gray-400 mt-2">次训练</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center space-x-2 text-amber-400 mb-3">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm font-medium">比赛计划</span>
                </div>
                <div className="text-4xl font-bold">{upcomingPlans.length}</div>
                <div className="text-sm text-gray-400 mt-2">场待参赛</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary-800 mb-4">功能模块</h2>
          <p className="text-secondary-500 max-w-2xl mx-auto">
            五大功能模块，覆盖跑步训练和比赛的各个环节
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.path}
                to={feature.path}
                className="group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-full bg-gradient-to-br ${feature.bgGradient} rounded-2xl p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-500 text-sm mb-4">{feature.description}</p>
                  <div className="flex items-center text-primary-500 text-sm font-medium">
                    立即使用
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-secondary-800 mb-6">最近训练</h3>
              {recentTraining.length > 0 ? (
                <div className="space-y-4">
                  {recentTraining.map((record) => (
                    <div
                      key={record.id}
                      className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Dumbbell className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-secondary-800">{record.typeName}</div>
                          <div className="text-sm text-secondary-500">{record.distance}km · {record.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary-600">{record.actualPace}</div>
                        <div className="text-xs text-secondary-400">配速/km</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-400">
                  <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无训练记录</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-secondary-800 mb-6">即将到来的比赛</h3>
              {upcomingPlans.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-gradient-to-r from-primary-50 to-white rounded-xl p-4 border border-primary-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-secondary-800">{plan.raceName}</div>
                        <span className="badge bg-primary-100 text-primary-600">
                          {plan.distanceName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-secondary-500">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {plan.date}
                        </span>
                        <span className="flex items-center">
                          <Timer className="w-4 h-4 mr-1" />
                          目标 {plan.targetFinishTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-400">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无比赛计划</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
