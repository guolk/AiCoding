import { Link } from 'react-router-dom';
import { Calendar, MapPin, Edit2, Trash2, Eye } from 'lucide-react';
import type { Project } from '../../shared/types';

interface ProjectCardProps {
  project: Project;
  observationCount: number;
  analysisCount: number;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  index: number;
}

export default function ProjectCard({
  project,
  observationCount,
  analysisCount,
  onEdit,
  onDelete,
  index,
}: ProjectCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const gradientColors = [
    'from-slate-800 to-slate-600',
    'from-clay-600 to-clay-500',
    'from-teal-600 to-teal-500',
    'from-amber-600 to-amber-500',
  ];

  const gradient = gradientColors[index % gradientColors.length];

  return (
    <div
      className={`card card-hover overflow-hidden animate-fade-in-up stagger-${(index % 6) + 1}`}
    >
      <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-slate-800 mb-1 line-clamp-1">
              {project.title}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-2">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-slate-500 font-sans">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(project.updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {observationCount} 条观察
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="chip">
            <Eye className="w-3 h-3 mr-1" />
            {observationCount} 观察记录
          </span>
          <span className="chip">
            <MapPin className="w-3 h-3 mr-1" />
            {analysisCount} 空间分析
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/observations?project=${project.id}`}
            className="flex-1 btn-primary text-sm py-2"
          >
            <Eye className="w-4 h-4" />
            查看详情
          </Link>
          <button
            onClick={() => onEdit(project)}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
