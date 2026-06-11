import { Link } from 'react-router-dom';
import { useTreeStore } from '@/store/treeStore';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, User, Trees } from 'lucide-react';

export default function SurveyProgress() {
  const { surveyGrids } = useTreeStore();

  const totalTrees = surveyGrids.reduce((sum, g) => sum + g.totalTrees, 0);
  const surveyedTrees = surveyGrids.reduce((sum, g) => sum + g.surveyedTrees, 0);
  const overallProgress = totalTrees > 0 ? Math.round((surveyedTrees / totalTrees) * 100) : 0;

  const pendingGrids = surveyGrids.filter((g) => g.status === 'pending');
  const inProgressGrids = surveyGrids.filter((g) => g.status === 'in_progress');
  const completedGrids = surveyGrids.filter((g) => g.status === 'completed');

  const renderSection = (title: string, grids: typeof surveyGrids, icon: React.ReactNode, colorClass: string) => (
    <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
      <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
        {icon} {title} ({grids.length})
      </h2>
      {grids.length > 0 ? (
        <div className="space-y-3">
          {grids.map((grid) => {
            const progress = grid.totalTrees > 0 ? Math.round((grid.surveyedTrees / grid.totalTrees) * 100) : 0;
            return (
              <div key={grid.id} className="border border-forest-100 rounded-lg p-4 hover:bg-forest-50/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-brown-700">{grid.name}</h3>
                    <p className="text-xs text-brown-700/60 flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />{grid.assignee}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${colorClass}`}>{progress}%</span>
                    <p className="text-xs text-brown-700/50 flex items-center gap-1">
                      <Trees className="w-3 h-3" />{grid.surveyedTrees}/{grid.totalTrees}
                    </p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-forest-100 rounded-full overflow-hidden">
                  <div className="h-full bg-forest-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-brown-700/50 text-center py-4">暂无</p>
      )}
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/survey" className="p-2 rounded-lg hover:bg-forest-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-forest-600" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest-600">普查进度追踪</h1>
          <p className="text-brown-700/70 mt-1">已调查 {surveyedTrees}/{totalTrees} 棵，总体进度 {overallProgress}%</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-forest-500 to-forest-700 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-forest-200 text-sm">总体普查进度</p>
            <p className="text-5xl font-bold mt-2">{overallProgress}%</p>
          </div>
          <div className="w-48">
            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
            <div className="flex justify-between text-xs mt-2 text-forest-200">
              <span>{surveyedTrees} 已调查</span>
              <span>{totalTrees - surveyedTrees} 待调查</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {renderSection('待调查', pendingGrids, <AlertCircle className="w-5 h-5 text-gray-400" />, 'text-gray-500')}
        {renderSection('调查中', inProgressGrids, <Clock className="w-5 h-5 text-amber-400" />, 'text-amber-500')}
        {renderSection('已完成', completedGrids, <CheckCircle className="w-5 h-5 text-forest-500" />, 'text-forest-600')}
      </div>
    </div>
  );
}
