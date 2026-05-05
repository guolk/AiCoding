import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryClient';
import { languageExchangeApi } from '@/services/languageExchangeService';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import { CommunityPost, SpeakingChallenge } from '@/types';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
        active
          ? 'text-indigo-600 border-indigo-600'
          : 'text-gray-500 border-transparent hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function PostCard({ post }: { post: CommunityPost }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={post.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={post.author?.username}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">{post.author?.username || 'Anonymous'}</span>
              <span className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                {post.topic}
              </span>
              {post.tags?.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-3 whitespace-pre-line">
              {post.content}
            </p>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 bg-gray-50 flex items-center gap-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
          <span>{likeCount}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-500 transition-colors">
          <span className="text-lg">💬</span>
          <span>{post.commentsCount} 评论</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-500 transition-colors ml-auto">
          <span className="text-lg">↗️</span>
          <span>分享</span>
        </button>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: SpeakingChallenge }) {
  const [joined, setJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState(challenge.participantCount);

  const handleJoin = () => {
    if (!joined) {
      setParticipantCount(participantCount + 1);
    }
    setJoined(true);
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  };

  const difficultyLabels: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  };

  const endDate = new Date(challenge.endDate);
  const now = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  difficultyColors[challenge.difficulty] || difficultyColors.intermediate
                }`}
              >
                {difficultyLabels[challenge.difficulty] || '中级'}
              </span>
              <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                {challenge.topic}
              </span>
              <span className="text-xs text-gray-400">
                ⏱️ {challenge.duration}秒
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">剩余</p>
            <p className="text-2xl font-bold text-indigo-600">{daysLeft}</p>
            <p className="text-xs text-gray-400">天</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=challenge${i}`}
                  alt="participant"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {participantCount} 人参与
            </span>
          </div>
          {joined ? (
            <Button size="sm" variant="ghost" className="bg-green-50 text-green-600 border-0">
              ✅ 已参与
            </Button>
          ) : (
            <Button size="sm" onClick={handleJoin}>
              🎤 参与挑战
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'challenges'>('posts');

  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: queryKeys.community.posts,
    queryFn: () => languageExchangeApi.getCommunityPosts(),
  });

  const { data: challenges, isLoading: isLoadingChallenges } = useQuery({
    queryKey: queryKeys.community.challenges,
    queryFn: () => languageExchangeApi.getSpeakingChallenges(),
  });

  const isLoading = isLoadingPosts || isLoadingChallenges;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">社区</h1>
          <p className="text-gray-500 mt-1">分享学习心得，参与口语挑战</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100">
            <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')}>
              📝 学习帖子
            </TabButton>
            <TabButton active={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')}>
              🎤 口语挑战
            </TabButton>
            <div className="ml-auto flex items-center gap-2 px-4">
              <Button size="sm">
                ✍️ 发布帖子
              </Button>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <Loading text="加载中..." />
            ) : activeTab === 'posts' ? (
              <div className="space-y-6">
                {posts && posts.items && posts.items.length > 0 ? (
                  posts.items.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-4">📝</p>
                    <p className="text-gray-500">暂无帖子，快来发布第一篇吧！</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {challenges && challenges.length > 0 ? (
                  challenges
                    .filter((c) => c.status === 'active')
                    .map((challenge) => (
                      <ChallengeCard key={challenge.id} challenge={challenge} />
                    ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-4">🎤</p>
                    <p className="text-gray-500">暂无活跃的口语挑战</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CommunityPage;
