import { useTreeStore } from '@/store/treeStore';
import { Link } from 'react-router-dom';
import { Trees, FilePlus, AlertTriangle, ClipboardCheck, ArrowRight, TreePine, HeartPulse, Clock } from 'lucide-react';
import { HEALTH_STATUS_LABELS, HEALTH_STATUS_COLORS } from '@/types';

export default function Dashboard() {
  const { trees, healthAssessments, auditRecords } = useTreeStore();

  const totalTrees = trees.length;
  const thisMonth = trees.filter((t) => {
    const d = new Date(t.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const pendingAudits = auditRecords.filter((a) => a.result === 'pending').length;
  const healthWarnings = trees.filter((t) => t.healthStatus === 'poor' || t.healthStatus === 'critical').length;

  const recentAssessments = healthAssessments.slice().sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate)).slice(0, 5);
  const recentTrees = trees.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const stats = [
    { label: '古树总数', value: totalTrees, icon: Trees, color: 'from-forest-500 to-forest-700', link: '/archives' },
    { label: '本月新增', value: thisMonth, icon: FilePlus, color: 'from-forest-400 to-forest-600', link: '/archives/new' },
    { label: '待审核', value: pendingAudits, icon: ClipboardCheck, color: 'from-amber-400 to-amber-500', link: '/survey/review' },
    { label: '健康预警', value: healthWarnings, icon: AlertTriangle, color: 'from-red-400 to-red-600', link: '/health' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-forest-600">系统总览</h1>
        <p className="text-brown-700/70 mt-1">古树名木普查记录管理平台</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <Link
            key={stat.label}
            to={stat.link}
            className={`animate-fade-in-up stagger-${i + 1} bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{stat.label}</p>
                <p className="text-4xl font-bold mt-2 animate-count-up">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                <stat.icon className="w-7 h-7" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-forest-600">最新古树档案</h2>
            <Link to="/archives" className="text-sm text-forest-500 hover:text-forest-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTrees.map((tree) => (
              <Link
                key={tree.id}
                to={`/archives/${tree.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-forest-50 transition-colors"
              >
                <img src={tree.coverImage} alt={tree.species} className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-brown-700">{tree.species}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${HEALTH_STATUS_COLORS[tree.healthStatus]}`}>
                      {HEALTH_STATUS_LABELS[tree.healthStatus]}
                    </span>
                  </div>
                  <p className="text-sm text-brown-700/60 truncate">{tree.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-forest-600">{tree.estimatedAge}年</p>
                  <p className="text-xs text-brown-700/50">推测树龄</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-forest-600">待办事项</h2>
          </div>
          <div className="space-y-3">
            {pendingAudits > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="w-8 h-8 rounded-full bg-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ClipboardCheck className="w-4 h-4 text-amber-800" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-700">数据审核</p>
                  <p className="text-xs text-brown-700/60">{pendingAudits}条记录待审核</p>
                </div>
              </div>
            )}
            {healthWarnings > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="w-8 h-8 rounded-full bg-red-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-red-800" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-700">健康预警</p>
                  <p className="text-xs text-brown-700/60">{healthWarnings}棵古树健康状况堪忧</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-forest-50 border border-forest-200">
              <div className="w-8 h-8 rounded-full bg-forest-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-forest-800" />
              </div>
              <div>
                <p className="text-sm font-medium text-brown-700">定期评估</p>
                <p className="text-xs text-brown-700/60">3棵古树超过6个月未评估</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold text-forest-600">最近健康评估</h2>
          <Link to="/health" className="text-sm text-forest-500 hover:text-forest-700 flex items-center gap-1">
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-forest-100">
                <th className="text-left text-sm font-medium text-brown-700/60 pb-3">树种</th>
                <th className="text-left text-sm font-medium text-brown-700/60 pb-3">评估日期</th>
                <th className="text-left text-sm font-medium text-brown-700/60 pb-3">综合评分</th>
                <th className="text-left text-sm font-medium text-brown-700/60 pb-3">评估员</th>
                <th className="text-left text-sm font-medium text-brown-700/60 pb-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {recentAssessments.map((a) => (
                <tr key={a.id} className="border-b border-forest-50 hover:bg-forest-50/50 transition-colors">
                  <td className="py-3">
                    <Link to={`/health/${a.id}`} className="flex items-center gap-2">
                      <TreePine className="w-4 h-4 text-forest-500" />
                      <span className="font-medium text-brown-700">{a.treeSpecies}</span>
                    </Link>
                  </td>
                  <td className="py-3 text-sm text-brown-700/70">{a.assessmentDate}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-forest-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            a.overallScore >= 80 ? 'bg-forest-400' : a.overallScore >= 60 ? 'bg-amber-300' : 'bg-red-400'
                          }`}
                          style={{ width: `${a.overallScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{a.overallScore}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-brown-700/70">{a.assessor}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      a.overallScore >= 80 ? 'bg-forest-100 text-forest-700' : a.overallScore >= 60 ? 'bg-amber-100 text-amber-500' : 'bg-red-100 text-red-700'
                    }`}>
                      <HeartPulse className="w-3 h-3" />
                      {a.overallScore >= 80 ? '良好' : a.overallScore >= 60 ? '一般' : '堪忧'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
