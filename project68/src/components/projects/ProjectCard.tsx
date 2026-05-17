import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PROJECT_STATUSES, type Project } from '@/types';
import { getRelativeTime } from '@/lib/utils';
import { MoreHorizontal, ArrowRight, Trash2, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const deleteProject = useAppStore(state => state.deleteProject);
  
  const status = PROJECT_STATUSES.find(s => s.value === project.status);
  
  const statusColorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  };

  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      {project.coverImage && (
        <div className="h-40 overflow-hidden">
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <CardContent className={`p-5 ${project.coverImage ? '' : 'pt-5'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-lg truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              {project.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {getRelativeTime(project.createdAt)}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}`)}>
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (confirm('确定要删除这个项目吗？')) {
                    deleteProject(project.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {project.description || '暂无描述'}
        </p>

        <div className="space-y-3">
          {totalMilestones > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">项目进度</span>
                <span className="font-medium text-gray-700">{completedMilestones}/{totalMilestones}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{project.tags.length - 2}
                </Badge>
              )}
            </div>
            {status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorMap[status.color]}`}>
                {status.label}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
