import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { languageExchangeApi } from '@/services/languageExchangeService';
import {
  Match,
  MatchScore,
  MatchBreakdown,
  LanguageLearner,
} from '@/types';
import {
  LANGUAGES,
  LANGUAGE_LEVELS,
  LEARNING_GOALS,
  INTEREST_TAGS,
} from '@/constants/languages';
import Button from '@/components/Button';
import Loading from '@/components/Loading';
import Layout from '@/components/Layout';

function ScoreProgressBar({
  score,
  label,
  color,
}: {
  score: number;
  label: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function MatchCard({
  match,
  isCurrentUserSender,
  onAccept,
  onReject,
  onSendRequest,
}: {
  match: Match;
  isCurrentUserSender: boolean;
  onAccept?: (matchId: string) => void;
  onReject?: (matchId: string) => void;
  onSendRequest?: (receiverId: number) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const otherUser = isCurrentUserSender ? match.receiver : match.sender;

  if (!otherUser) return null;

  const getStatusBadge = () => {
    switch (match.status) {
      case 'accepted':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            ✓ 已匹配
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            ✗ 已拒绝
          </span>
        );
      case 'expired':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            ⏰ 已过期
          </span>
        );
      case 'pending':
        return isCurrentUserSender ? (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            ⏳ 等待回复
          </span>
        ) : (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            📨 收到请求
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.username}`}
            alt={otherUser.username}
            className="w-20 h-20 rounded-full bg-gray-100"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-800">{otherUser.username}</h3>
              {getStatusBadge()}
              <div
                className={`w-3 h-3 rounded-full ${
                  otherUser.onlineStatus === 'online'
                    ? 'bg-green-500'
                    : otherUser.onlineStatus === 'idle'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
                }`}
                title={otherUser.onlineStatus}
              />
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {otherUser.location || '未知位置'} • 评分: {otherUser.rating || 'N/A'}
            </p>
            {otherUser.bio && (
              <p className="text-sm text-gray-600 line-clamp-2">{otherUser.bio}</p>
            )}
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600">
              {match.score.totalScore}
            </div>
            <div className="text-xs text-gray-500">匹配度</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-500 mr-1">母语:</span>
              {otherUser.nativeLanguages.map((lang, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800"
                >
                  {LANGUAGES[lang.language]?.nativeName || lang.language}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-500 mr-1">学习:</span>
              {otherUser.learningLanguages.map((lang, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                >
                  {LANGUAGES[lang.language]?.nativeName || lang.language}
                  <span className="ml-1 text-blue-600">
                    ({LANGUAGE_LEVELS[lang.level]?.label})
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {otherUser.interests.slice(0, 5).map((interest, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
            >
              {INTEREST_TAGS[interest]?.icon} {INTEREST_TAGS[interest]?.label}
            </span>
          ))}
          {otherUser.interests.length > 5 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
              +{otherUser.interests.length - 5}
            </span>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {showDetails ? '隐藏匹配详情 ▲' : '查看匹配详情 ▼'}
          </button>
        </div>

        {showDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-800 mb-4">匹配度详细分析</h4>

            <ScoreProgressBar
              score={match.score.languageComplementarity}
              label="语言互补度"
              color="blue"
            />
            <p className="text-xs text-gray-600 mb-3">
              {match.breakdown.languageComplementarity.explanation}
            </p>

            <ScoreProgressBar
              score={match.score.interestSimilarity}
              label="兴趣相似度"
              color="green"
            />
            <p className="text-xs text-gray-600 mb-3">
              {match.breakdown.interestSimilarity.explanation}
            </p>
            {match.breakdown.interestSimilarity.commonInterests.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-xs text-gray-500">共同兴趣:</span>
                {match.breakdown.interestSimilarity.commonInterests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800"
                  >
                    {INTEREST_TAGS[interest]?.label}
                  </span>
                ))}
              </div>
            )}

            <ScoreProgressBar
              score={match.score.timezoneOverlap}
              label="时区重叠度"
              color="purple"
            />
            <p className="text-xs text-gray-600 mb-3">
              {match.breakdown.timezoneOverlap.explanation}
            </p>
            {match.breakdown.timezoneOverlap.overlappingHours.length > 0 && (
              <div className="mb-3">
                <span className="text-xs text-gray-500">推荐聊天时间:</span>
                <span className="text-xs text-purple-700 ml-1">
                  {match.breakdown.timezoneOverlap.overlappingHours.slice(0, 3).join(', ')}
                  {match.breakdown.timezoneOverlap.overlappingHours.length > 3 && '...'}
                </span>
              </div>
            )}

            <ScoreProgressBar
              score={match.score.levelCompatibility}
              label="水平匹配度"
              color="orange"
            />
            <p className="text-xs text-gray-600">
              {match.breakdown.levelCompatibility.explanation}
            </p>

            {match.message && (
              <div className="mt-4 p-3 bg-white rounded border">
                <p className="text-xs text-gray-500 mb-1">对方留言:</p>
                <p className="text-sm text-gray-700 italic">"{match.message}"</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          {match.status === 'pending' && !isCurrentUserSender && onAccept && onReject && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => onReject(match.id)}
                className="flex-1"
              >
                拒绝
              </Button>
              <Button onClick={() => onAccept(match.id)} className="flex-1">
                接受匹配
              </Button>
            </div>
          )}
          {match.status === 'pending' && isCurrentUserSender && (
            <p className="text-sm text-gray-500 text-center">
              已发送匹配请求，等待对方回复...
            </p>
          )}
          {match.status === 'accepted' && (
            <Button fullWidth variant="secondary">
              开始聊天
            </Button>
          )}
          {match.status !== 'pending' && match.status !== 'accepted' && (
            <Button
              fullWidth
              variant="secondary"
              onClick={() => onSendRequest?.(otherUser.id)}
            >
              重新发送请求
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'pending' | 'matches'>('recommendations');

  const {
    data: recommendations,
    isLoading: isLoadingRecommendations,
    refetch: refetchRecommendations,
  } = useQuery({
    queryKey: ['dailyRecommendations'],
    queryFn: async () => {
      const learnerId = 1;
      return languageExchangeApi.getRecommendedMatches(learnerId);
    },
  });

  const {
    data: pendingMatches,
    isLoading: isLoadingPending,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ['pendingMatches'],
    queryFn: () => languageExchangeApi.getMatches('pending'),
  });

  const {
    data: acceptedMatches,
    isLoading: isLoadingMatches,
    refetch: refetchMatches,
  } = useQuery({
    queryKey: ['acceptedMatches'],
    queryFn: () => languageExchangeApi.getMatches('accepted'),
  });

  const respondMutation = useMutation({
    mutationFn: ({
      matchId,
      action,
    }: {
      matchId: string;
      action: 'accept' | 'reject';
    }) => languageExchangeApi.respondToMatch(matchId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingMatches'] });
      queryClient.invalidateQueries({ queryKey: ['acceptedMatches'] });
      showSuccess('匹配状态已更新');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '操作失败';
      showError(message);
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: (receiverId: number) =>
      languageExchangeApi.sendMatchRequest(receiverId, '很高兴认识你！'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingMatches'] });
      showSuccess('匹配请求已发送');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '发送失败';
      showError(message);
    },
  });

  const handleAccept = (matchId: string) => {
    respondMutation.mutate({ matchId, action: 'accept' });
  };

  const handleReject = (matchId: string) => {
    respondMutation.mutate({ matchId, action: 'reject' });
  };

  const handleSendRequest = (receiverId: number) => {
    sendRequestMutation.mutate(receiverId);
  };

  const tabs = [
    { key: 'recommendations' as const, label: '今日推荐', count: recommendations?.length || 0 },
    { key: 'pending' as const, label: '待处理', count: pendingMatches?.length || 0 },
    { key: 'matches' as const, label: '已匹配', count: acceptedMatches?.length || 0 },
  ];

  const isLoading = isLoadingRecommendations || isLoadingPending || isLoadingMatches;

  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'recommendations':
        return recommendations || [];
      case 'pending':
        return pendingMatches || [];
      case 'matches':
        return acceptedMatches || [];
      default:
        return [];
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">匹配中心</h1>
          <p className="text-gray-600">
            找到与您语言互补、兴趣相投的语言交换伙伴
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === tab.key
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <Loading isLoading={isLoading}>
          {getCurrentTabData().length > 0 ? (
            <div className="space-y-6">
              {getCurrentTabData().map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isCurrentUserSender={match.senderId === 1}
                  onAccept={activeTab === 'pending' ? handleAccept : undefined}
                  onReject={activeTab === 'pending' ? handleReject : undefined}
                  onSendRequest={handleSendRequest}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              {activeTab === 'recommendations' && (
                <>
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    今日推荐已用完
                  </h3>
                  <p className="text-gray-500 mb-6">
                    免费用户每天可以获得3个匹配推荐。明天再来看看吧！
                  </p>
                  <Button
                    onClick={() =>
                      navigate('/settings', { state: { tab: 'subscription' } })
                    }
                  >
                    升级获取无限匹配
                  </Button>
                </>
              )}
              {activeTab === 'pending' && (
                <>
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    暂无待处理的匹配请求
                  </h3>
                  <p className="text-gray-500">
                    去"今日推荐"看看有没有合适的语言伙伴吧！
                  </p>
                </>
              )}
              {activeTab === 'matches' && (
                <>
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    还没有匹配成功
                  </h3>
                  <p className="text-gray-500 mb-6">
                    接受匹配请求或等待对方接受您的请求
                  </p>
                  <Button onClick={() => setActiveTab('recommendations')}>
                    查看今日推荐
                  </Button>
                </>
              )}
            </div>
          )}
        </Loading>

        {activeTab === 'recommendations' && (
          <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              💡 如何提高匹配成功率
            </h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• 完善您的个人简介，让对方更好地了解您</li>
              <li>• 选择更多的兴趣标签，增加兴趣相似度</li>
              <li>• 主动发送匹配请求时，附上友好的开场白</li>
              <li>• 及时回复收到的匹配请求</li>
              <li>• 升级到 Premium 会员，获得无限匹配机会</li>
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MatchingPage;
