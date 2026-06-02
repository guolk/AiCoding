import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Mic, ThumbsUp, ThumbsDown, Calendar, TrendingUp, ChevronRight, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';

export default function ReviewList() {
  const { reviews, matches, teams, listenerFeedback } = useAppStore();

  const getMatchInfo = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return { title: '未知比赛', league: '' };

    const homeTeam = teams.find(t => t.id === match.homeTeamId);
    const awayTeam = teams.find(t => t.id === match.awayTeamId);

    return {
      title: `${homeTeam?.name || '未知'} vs ${awayTeam?.name || '未知'}`,
      league: match.league,
      score: match.homeScore !== undefined ? `${match.homeScore} - ${match.awayScore}` : ''
    };
  };

  const getFeedbackStats = (reviewId: string) => {
    const feedbacks = listenerFeedback.filter(f => f.reviewId === reviewId);
    const positive = feedbacks.filter(f => f.sentiment === 'positive').length;
    const negative = feedbacks.filter(f => f.sentiment === 'negative').length;
    return { total: feedbacks.length, positive, negative };
  };

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reviews]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-serif">解说复盘</h1>
          <p className="text-slate-500 mt-1">共 {reviews.length} 条复盘记录</p>
        </div>
        <Link to="/reviews/skills">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 transition-all">
            <TrendingUp size={20} />
            技巧改进
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {sortedReviews.map((review, index) => {
          const matchInfo = getMatchInfo(review.matchId);
          const feedbackStats = getFeedbackStats(review.id);
          return (
            <Link key={review.id} to={`/reviews/${review.id}`}>
              <Card hover className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <Card.Content className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="info">{matchInfo.league}</Badge>
                        {matchInfo.score && <Badge variant="default">{matchInfo.score}</Badge>}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">{matchInfo.title}</h3>
                    </div>
                    <ChevronRight size={24} className="text-slate-300" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <ThumbsUp size={14} className="text-emerald-500" />
                        <span className="text-slate-600">发挥亮点</span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{review.highlights}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <ThumbsDown size={14} className="text-amber-500" />
                        <span className="text-slate-600">改进方向</span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{review.improvements}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-emerald-600">
                        <ThumbsUp size={14} />
                        {feedbackStats.positive}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-red-500">
                        <ThumbsDown size={14} />
                        {feedbackStats.negative}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Calendar size={14} />
                      {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </Link>
          );
        })}
      </div>

      {sortedReviews.length === 0 && (
        <div className="text-center py-16">
          <Mic size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">暂无复盘记录</p>
        </div>
      )}
    </div>
  );
}
