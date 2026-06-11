import { Link } from 'react-router-dom';
import { useTreeStore } from '@/store/treeStore';
import { Grid3X3, ArrowRight, User, Trees, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { GRID_STATUS_LABELS } from '@/types';

export default function SurveyGridPage() {
  const { surveyGrids } = useTreeStore();

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-forest-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-amber-400" />;
      default: return <AlertCircle className="w-5 h-5 text-brown-700/40" />;
    }
  };

  const statusBg = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-forest-100 border-forest-300';
      case 'in_progress': return 'bg-amber-50 border-amber-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const totalGrids = surveyGrids.length;
  const completedGrids = surveyGrids.filter((g) => g.status === 'completed').length;
  const totalTrees = surveyGrids.reduce((sum, g) => sum + g.totalTrees, 0);
  const surveyedTrees = surveyGrids.reduce((sum, g) => sum + g.surveyedTrees, 0);
  const overallProgress = totalTrees > 0 ? Math.round((surveyedTrees / totalTrees) * 100) : 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest-600 flex items-center gap-3">
            <Grid3X3 className="w-8 h-8" />
            普查网格管理
          </h1>
          <p className="text-brown-700/70 mt-1">划分责任区域，分配调查人员</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/survey/progress"
            className="flex items-center gap-2 px-5 py-2.5 border border-forest-200 rounded-lg text-forest-600 hover:bg-forest-50 transition-colors"
          >
            进度追踪
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/survey/review"
            className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors shadow-md"
          >
            数据审核
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-5">
          <p className="text-sm text-brown-700/60">普查区域</p>
          <p className="text-3xl font-bold text-forest-600 mt-1">{totalGrids}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-5">
          <p className="text-sm text-brown-700/60">已完成区域</p>
          <p className="text-3xl font-bold text-forest-500 mt-1">{completedGrids}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-5">
          <p className="text-sm text-brown-700/60">古树总数</p>
          <p className="text-3xl font-bold text-brown-700 mt-1">{totalTrees}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-5">
          <p className="text-sm text-brown-700/60">总体进度</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{overallProgress}%</p>
          <div className="mt-2 w-full h-2 bg-forest-100 rounded-full overflow-hidden">
            <div className="h-full bg-forest-500 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6 mb-6">
        <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4">区域地图概览</h2>
        <div className="relative bg-forest-50 rounded-lg h-64 overflow-hidden">
          <svg viewBox="0 0 800 300" className="w-full h-full">
            <rect x="0" y="0" width="800" height="300" fill="#f0fdf4" />
            {surveyGrids.map((grid, i) => {
              const cols = 4;
              const rows = 2;
              const cellW = 800 / cols;
              const cellH = 300 / rows;
              const col = i % cols;
              const row = Math.floor(i / cols);
              const x = col * cellW;
              const y = row * cellH;
              const fill = grid.status === 'completed' ? '#95D5B2' : grid.status === 'in_progress' ? '#FDE68A' : '#E5E7EB';
              return (
                <g key={grid.id}>
                  <rect x={x + 4} y={y + 4} width={cellW - 8} height={cellH - 8} rx="8" fill={fill} stroke="#2D6A4F" strokeWidth="1" opacity="0.8" />
                  <text x={x + cellW / 2} y={y + cellH / 2 - 8} textAnchor="middle" fontSize="12" fontWeight="600" fill="#1B4332">{grid.name}</text>
                  <text x={x + cellW / 2} y={y + cellH / 2 + 10} textAnchor="middle" fontSize="10" fill="#5C4033">{grid.assignee}</text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-3 right-3 bg-white/90 rounded-lg px-3 py-2 flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-forest-300 inline-block" />已完成</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-200 inline-block" />调查中</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" />待调查</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {surveyGrids.map((grid) => {
          const progress = grid.totalTrees > 0 ? Math.round((grid.surveyedTrees / grid.totalTrees) * 100) : 0;
          return (
            <div key={grid.id} className={`rounded-xl border p-5 ${statusBg(grid.status)} transition-all hover:shadow-md`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {statusIcon(grid.status)}
                  <div>
                    <h3 className="font-serif font-semibold text-brown-700">{grid.name}</h3>
                    <p className="text-xs text-brown-700/60 flex items-center gap-1"><User className="w-3 h-3" />{grid.assignee}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${
                  grid.status === 'completed' ? 'bg-forest-200 text-forest-700' : grid.status === 'in_progress' ? 'bg-amber-200 text-amber-500' : 'bg-gray-200 text-gray-600'
                }`}>
                  {GRID_STATUS_LABELS[grid.status]}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-brown-700/70 mb-2">
                <span className="flex items-center gap-1"><Trees className="w-3.5 h-3.5" />{grid.surveyedTrees}/{grid.totalTrees} 棵</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${
                  grid.status === 'completed' ? 'bg-forest-400' : grid.status === 'in_progress' ? 'bg-amber-300' : 'bg-gray-300'
                }`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
