import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Mic,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const { reviews, matches, teams, listenerFeedback, getFeedbackByReviewId } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const review = useMemo(() => reviews.find(r => r.id === id), [reviews, id]);
  const feedbacks = useMemo(() => review ? getFeedbackByReviewId(review.id) : [], [review, getFeedbackByReviewId]);

  const match = useMemo(() => review ? matches.find(m => m.id === review.matchId) : null, [review, matches]);
  const homeTeam = useMemo(() => match ? teams.find(t => t.id === match.homeTeamId) : null, [match, teams]);
  const awayTeam = useMemo(() => match ? teams.find(t => t.id === match.awayTeamId) : null, [match, teams]);

  if (!review) {
    return (
      <div className="text-center py-16">
        <Mic size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500">复盘记录不存在</p>
        <Link to="/reviews">
          <Button className="mt-4">返回复盘列表</Button>
        </Link>
      </div>
    );
  }

  const positiveFeedbacks = feedbacks.filter(f => f.sentiment === 'positive');
  const negativeFeedbacks = feedbacks.filter(f => f.sentiment === 'negative');
  const neutralFeedbacks = feedbacks.filter(f => f.sentiment === 'neutral');

  const allKeywords = feedbacks.flatMap(f => f.keywords);
  const keywordCounts = allKeywords.reduce((acc, keyword) => {
    acc[keyword] = (acc[keyword] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topKeywords = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/reviews">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={18} />
            返回
          </Button>
        </Link>
      </div>

      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <Card.Content className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 text-white border-0">{match?.league}</Badge>
                {match?.homeScore !== undefined && (
                  <Badge className="bg-orange-500 text-white border-0">
                    {match.homeScore} - {match.awayScore}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold font-serif">
                {homeTeam?.name} vs {awayTeam?.name}
              </h1>
              <p className="text-slate-300 mt-1">
                复盘于 {new Date(review.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{positiveFeedbacks.length}</p>
                <p className="text-xs text-slate-400">好评</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{negativeFeedbacks.length}</p>
                <p className="text-xs text-slate-400">差评</p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>录音回放</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            <div className="flex-1">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
                  style={{ width: `${currentTime}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-slate-500">
                <span>{Math.floor(currentTime * 0.6)}:00</span>
                <span>90:00</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <SkipBack size={20} className="text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <SkipForward size={20} className="text-slate-600" />
              </button>
            </div>
          </div>
        </Card.Content>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <ThumbsUp size={20} className="text-emerald-500" />
              <Card.Title>发挥亮点</Card.Title>
            </div>
          </Card.Header>
          <Card.Content>
            <p className="text-slate-600 leading-relaxed">{review.highlights}</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <ThumbsDown size={20} className="text-amber-500" />
              <Card.Title>改进方向</Card.Title>
            </div>
          </Card.Header>
          <Card.Content>
            <p className="text-slate-600 leading-relaxed">{review.improvements}</p>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <Card.Header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-blue-500" />
                <Card.Title>听众反馈</Card.Title>
                <Badge variant="info">{feedbacks.length}条</Badge>
              </div>
              <Button size="sm" variant="outline">
                <Plus size={14} />
                添加反馈
              </Button>
            </Card.Header>
            <Card.Content className="space-y-3 max-h-96 overflow-y-auto">
              {feedbacks.map(feedback => (
                <div key={feedback.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        feedback.sentiment === 'positive' ? 'success' :
                        feedback.sentiment === 'negative' ? 'danger' : 'default'
                      }>
                        {feedback.sentiment === 'positive' ? '正面' :
                         feedback.sentiment === 'negative' ? '负面' : '中性'}
                      </Badge>
                      <span className="text-xs text-slate-500">来自{feedback.source}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">{feedback.content}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {feedback.keywords.map(keyword => (
                      <span key={keyword} className="px-2 py-0.5 bg-white rounded text-xs text-slate-600">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </Card.Content>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>关键词云</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-wrap gap-2">
                {topKeywords.map(([keyword, count]) => (
                  <span
                    key={keyword}
                    className="px-3 py-1.5 rounded-full text-sm"
                    style={{
                      backgroundColor: `hsl(${30 + count * 10}, 90%, ${90 - count * 5}%)`,
                      color: count > 2 ? '#c2410c' : '#78350f'
                    }}
                  >
                    {keyword} ({count})
                  </span>
                ))}
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>反馈统计</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  正面反馈
                </span>
                <span className="font-semibold text-emerald-600">{positiveFeedbacks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  中性反馈
                </span>
                <span className="font-semibold text-slate-600">{neutralFeedbacks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  负面反馈
                </span>
                <span className="font-semibold text-red-600">{negativeFeedbacks.length}</span>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
