import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IDEA_SOURCES, IDEA_EMOTIONS, IDEA_STATUSES, type Idea } from '@/types';
import { getRelativeTime } from '@/lib/utils';
import { Clock, MoreHorizontal, ArrowRight, BookOpen, Target } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';

interface IdeaCardProps {
  idea: Idea;
  onView?: (idea: Idea) => void;
  onEdit?: (idea: Idea) => void;
  onDelete?: (idea: Idea) => void;
  onConvert?: (idea: Idea) => void;
}

export function IdeaCard({ idea, onView, onDelete, onConvert }: IdeaCardProps) {
  const navigate = useNavigate();
  const deleteIdea = useAppStore(state => state.deleteIdea);
  
  const source = IDEA_SOURCES.find(s => s.value === idea.source);
  const emotion = IDEA_EMOTIONS.find(e => e.value === idea.emotion);
  const status = IDEA_STATUSES.find(s => s.value === idea.status);

  const statusColorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-lg truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate(`/ideas/${idea.id}`)}
            >
              {idea.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {getRelativeTime(idea.createdAt)}
              <span className="mx-1">·</span>
              <span>{source?.icon} {source?.label}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/ideas/${idea.id}`)}>
                <BookOpen className="w-4 h-4 mr-2" />
                查看详情
              </DropdownMenuItem>
              {idea.status !== 'project' && (
                <DropdownMenuItem onClick={() => navigate(`/convert/${idea.id}`)}>
                  <Target className="w-4 h-4 mr-2" />
                  转化为项目
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (confirm('确定要删除这个灵感吗？')) {
                    deleteIdea(idea.id);
                  }
                }}
              >
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {idea.description || '暂无描述'}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {idea.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {idea.tags.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{idea.tags.length - 4}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <span className="text-lg" title={emotion?.label}>
              {emotion?.emoji}
            </span>
            {status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorMap[status.color]}`}>
                {status.label}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => navigate(`/ideas/${idea.id}`)}
          >
            查看
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
