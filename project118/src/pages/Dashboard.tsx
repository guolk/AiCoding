import { Grid3X3, FolderKanban, Package, BookOpen, Plus, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePatternStore } from '@/stores/patternStore';
import { useProjectStore } from '@/stores/projectStore';
import { useMaterialStore } from '@/stores/materialStore';
import { Card, CardHeader, CardContent } from '@/components/common/Card';
import ProgressBar from '@/components/common/ProgressBar';

export default function Dashboard() {
  const patterns = usePatternStore((s) => s.patterns);
  const projects = useProjectStore((s) => s.projects);
  const yarns = useMaterialStore((s) => s.yarns);

  const inProgressProjects = projects.filter((p) => p.status === 'in_progress');
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);
  const recentPatterns = [...patterns]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);
  const lowStockYarns = yarns.filter((y) => (y.remainingWeight / y.weight) < 0.3);

  const stats = [
    { label: '图案设计', value: patterns.length, icon: Grid3X3, color: 'bg-emerald-500', link: '/patterns' },
    { label: '进行中项目', value: inProgressProjects.length, icon: FolderKanban, color: 'bg-orange-500', link: '/projects' },
    { label: '线材库存', value: yarns.length, icon: Package, color: 'bg-blue-500', link: '/materials' },
    { label: '学习笔记', value: 0, icon: BookOpen, color: 'bg-purple-500', link: '/learning' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
          <p className="text-gray-500 mt-1">开始你的创作之旅</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/patterns/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建图案
          </Link>
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建项目
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">最近项目</h3>
            <Link to="/projects" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">还没有创建项目</p>
                <Link to="/projects/new" className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block">
                  创建第一个项目
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      project.status === 'completed' ? 'bg-emerald-100' :
                      project.status === 'in_progress' ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      {project.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{project.name}</p>
                      <ProgressBar progress={project.progress} size="sm" />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {project.progress}%
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">最近图案</h3>
            <Link to="/patterns" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentPatterns.length === 0 ? (
              <div className="text-center py-8">
                <Grid3X3 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">还没有创建图案</p>
                <Link to="/patterns/new" className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block">
                  创建第一个图案
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {recentPatterns.map((pattern) => (
                  <Link key={pattern.id} to={`/patterns/${pattern.id}`}>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-500 transition-colors">
                      <div className="w-full h-full relative">
                        {pattern.pixels.slice(0, 100).map((pixel, i) => (
                          <div
                            key={i}
                            className="absolute"
                            style={{
                              left: `${(pixel.x / pattern.gridWidth) * 100}%`,
                              top: `${(pixel.y / pattern.gridHeight) * 100}%`,
                              width: `${100 / pattern.gridWidth}%`,
                              height: `${100 / pattern.gridHeight}%`,
                              backgroundColor: pixel.color
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-center truncate">{pattern.name}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStockYarns.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <h3 className="font-semibold text-orange-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              需要补充的线材
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {lowStockYarns.map((yarn) => (
                <div key={yarn.id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <div
                    className="w-8 h-8 rounded-lg border border-gray-200"
                    style={{ backgroundColor: yarn.colorHex }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{yarn.colorName}</p>
                    <p className="text-xs text-orange-600">剩余 {yarn.remainingWeight}g</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
