import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { IDEA_SOURCES, IDEA_EMOTIONS, PROJECT_STATUSES } from '@/types';
import {
  Share2,
  Download,
  ExternalLink,
  Calendar,
  Award,
  Clock,
  Sparkles,
  X,
  Copy,
  Check,
  Target,
  Flag,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import html2canvas from 'html2canvas';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const projects = useAppStore(state => state.projects);
  const ideas = useAppStore(state => state.ideas);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const completedProjects = projects.filter(p => p.status === 'completed');
  const selectedIdeaData = ideas.find(i => i.id === selectedIdea);
  const selectedProjectData = projects.find(p => p.id === selectedProject);

  const handleExportCard = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `idea-card-${selectedIdeaData?.title.slice(0, 20)}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleCopyShareLink = () => {
    const shareText = `💡 灵感: ${selectedIdeaData?.title}\n\n${selectedIdeaData?.description}\n\n来自 IdeaForge - 个人创意管理工具`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timelineData = [
    ...ideas.map(i => ({
      type: 'idea' as const,
      id: i.id,
      title: i.title,
      date: i.createdAt,
      description: i.description,
      data: i,
    })),
    ...projects.map(p => ({
      type: 'project' as const,
      id: p.id,
      title: p.title,
      date: p.createdAt,
      description: p.description,
      data: p,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const source = selectedIdeaData ? IDEA_SOURCES.find(s => s.value === selectedIdeaData.source) : null;
  const emotion = selectedIdeaData ? IDEA_EMOTIONS.find(e => e.value === selectedIdeaData.emotion) : null;

  const gradientClasses = [
    'gradient-aurora',
    'gradient-sunset',
    'gradient-ocean',
    'gradient-forest',
  ];

  const randomGradient = gradientClasses[Math.floor(Math.random() * gradientClasses.length)];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
          创意展示
        </h1>
        <p className="text-muted-foreground mt-1">展示你的创意历程和作品</p>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-semibold">作品集</h2>
          <Badge variant="secondary">{completedProjects.length} 个项目</Badge>
        </div>
        
        {completedProjects.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">还没有完成的项目</p>
              <p className="text-sm text-gray-400 mt-1">完成项目后将在这里展示</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedProjects.map(project => (
              <Card 
                key={project.id} 
                className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedProject(project.id)}
              >
                {project.coverImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardContent className={`p-5 ${!project.coverImage ? 'pt-5' : ''}`}>
                  <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {project.completionDate ? formatDate(project.completionDate) : formatDate(project.createdAt)}
                    </span>
                    <Button variant="link" size="sm" className="h-auto p-0 gap-1" onClick={(e) => { e.stopPropagation(); setSelectedProject(project.id); }}>
                      查看详情
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold">创意时间线</h2>
        </div>
        
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500" />
          
          <div className="space-y-6">
            {timelineData.map((item, index) => (
              <div key={`${item.type}-${item.id}`} className="relative pl-12 animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className={`absolute left-2 w-5 h-5 rounded-full border-4 border-white shadow ${
                  item.type === 'project' ? 'bg-green-500' : 'bg-purple-500'
                }`} />
                
                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => item.type === 'project' ? setSelectedProject(item.id) : setSelectedIdea(item.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.type === 'project' ? 'success' : 'purple'}>
                          {item.type === 'project' ? '项目' : '灵感'}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.type === 'idea' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={(e) => { e.stopPropagation(); setSelectedIdea(item.id); }}
                          >
                            <Share2 className="w-3 h-3" />
                            分享
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (item.type === 'project') {
                              navigate(`/projects/${item.id}`);
                            } else {
                              navigate(`/ideas/${item.id}`);
                            }
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                          打开
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedIdea} onOpenChange={(open) => !open && setSelectedIdea(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>分享灵感卡片</DialogTitle>
          </DialogHeader>
          
          {selectedIdeaData && (
            <>
              <div ref={cardRef} className={`${randomGradient} rounded-2xl p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">灵感卡片</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{selectedIdeaData.title}</h3>
                  <p className="text-sm opacity-90 line-clamp-3 mb-4">
                    {selectedIdeaData.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedIdeaData.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm opacity-80">
                    <span>{source?.icon} {source?.label}</span>
                    <span>{emotion?.emoji} {emotion?.label}</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={handleCopyShareLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制文案'}
                </Button>
                <Button className="w-full sm:w-auto gap-2" onClick={handleExportCard}>
                  <Download className="w-4 h-4" />
                  下载图片
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              项目详情
            </DialogTitle>
            <DialogDescription>查看项目的完整信息</DialogDescription>
          </DialogHeader>
          
          {selectedProjectData && (
            <div className="space-y-6">
              {selectedProjectData.coverImage && (
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={selectedProjectData.coverImage}
                    alt={selectedProjectData.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedProjectData.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="success">已完成</Badge>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {selectedProjectData.completionDate ? formatDate(selectedProjectData.completionDate) : formatDate(selectedProjectData.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {selectedProjectData.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedProjectData.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {selectedProjectData.goal && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-blue-500" />
                    项目目标
                  </h4>
                  <p className="text-sm text-gray-700 p-3 bg-blue-50 rounded-lg">
                    {selectedProjectData.goal}
                  </p>
                </div>
              )}

              {selectedProjectData.milestones && selectedProjectData.milestones.length > 0 && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Flag className="w-4 h-4 text-purple-500" />
                    里程碑
                  </h4>
                  <div className="space-y-3">
                    {selectedProjectData.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{milestone.title}</p>
                          {milestone.description && (
                            <p className="text-xs text-gray-500 mt-1">{milestone.description}</p>
                          )}
                          {milestone.completed && milestone.completedAt && (
                            <p className="text-xs text-green-600 mt-1">✓ 完成于 {formatDate(milestone.completedAt)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProjectData.poqEntries && selectedProjectData.poqEntries.length > 0 && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-orange-500" />
                    概念验证
                  </h4>
                  <div className="space-y-3">
                    {selectedProjectData.poqEntries.map((entry) => (
                      <div key={entry.id} className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full ${entry.success ? 'bg-green-500' : 'bg-red-500'}`} />
                          <p className="font-medium text-sm">{entry.hypothesis}</p>
                        </div>
                        <p className="text-xs text-gray-600 mb-1"><strong>方法:</strong> {entry.method}</p>
                        <p className="text-xs text-gray-600 mb-1"><strong>结果:</strong> {entry.result}</p>
                        <p className="text-xs text-gray-600"><strong>学到:</strong> {entry.learned}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProjectData.portfolioUrl && (
                <div>
                  <h4 className="font-semibold mb-2">项目链接</h4>
                  <a 
                    href={selectedProjectData.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    {selectedProjectData.portfolioUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => navigate(`/projects/${selectedProjectData.id}`)}>
                  打开完整页面
                </Button>
                <Button onClick={() => setSelectedProject(null)}>
                  关闭
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
