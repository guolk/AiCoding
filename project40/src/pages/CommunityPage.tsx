import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CommunityPost, CheckInRecord, LeaderboardEntry, CheckInStreak, Comment, Rating } from '@/types';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { checkInStreakData, leaderboardData } from '@/data/exercises';
import { formatDate, formatTime, generateUniqueId } from '@/utils/music';
import { queryKeys } from '@/services/queryClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post-001',
    userId: 1,
    userName: '音乐爱好者',
    type: 'performance',
    title: '第一次弹完C大调音阶，求各位指点！',
    content: '练习了一周，终于能完整弹完C大调音阶了！请各位大佬听听看有什么问题，特别是换指的时候感觉不太顺畅。',
    audioUrl: '',
    audioDuration: 45,
    exerciseId: 'exercise-beginner-001',
    likes: 24,
    comments: [
      {
        id: 'comment-001',
        userId: 2,
        userName: '张老师',
        content: '整体不错！建议第2小节换指的时候稍微慢一点，保持手腕放松。继续加油！',
        createdAt: '2024-05-01T12:00:00Z',
        isTeacher: true,
      },
      {
        id: 'comment-002',
        userId: 3,
        userName: '钢琴新手',
        content: '弹得真好！我也在练这个，请问你每天练习多久？',
        createdAt: '2024-05-01T14:30:00Z',
        isTeacher: false,
      },
    ],
    ratings: [
      {
        id: 'rating-001',
        userId: 2,
        score: 4,
        comment: '音准不错，节奏还可以更稳',
        isTeacher: true,
        createdAt: '2024-05-01T12:00:00Z',
      },
    ],
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z',
  },
  {
    id: 'post-002',
    userId: 4,
    userName: '小提琴手',
    type: 'question',
    title: '关于揉弦的技巧请教',
    content: '最近在练习揉弦，但是总是感觉声音不够自然，有没有什么好的练习方法？特别是手腕和手指的配合方面。',
    likes: 18,
    comments: [
      {
        id: 'comment-003',
        userId: 5,
        userName: '李教授',
        content: '揉弦的关键是放松。建议先在空弦上练习手腕的摆动，慢慢找感觉。不要急于求成，每天练习10分钟就好。',
        createdAt: '2024-04-30T09:00:00Z',
        isTeacher: true,
      },
    ],
    ratings: [],
    createdAt: '2024-04-30T08:00:00Z',
    updatedAt: '2024-04-30T08:00:00Z',
  },
  {
    id: 'post-003',
    userId: 6,
    userName: '古典音乐迷',
    type: 'discussion',
    title: '分享一下我的每日练习计划',
    content: '想和大家分享一下我的每日练习计划：1. 热身练习15分钟（音阶、琶音）；2. 技巧练习20分钟；3. 曲目练习30分钟。大家觉得这个安排怎么样？',
    likes: 42,
    comments: [
      {
        id: 'comment-004',
        userId: 7,
        userName: '吉他达人',
        content: '这个安排很合理！我也是类似的结构，不过我会在技巧练习后加10分钟的视奏训练。',
        createdAt: '2024-04-28T20:00:00Z',
        isTeacher: false,
      },
    ],
    ratings: [],
    createdAt: '2024-04-28T18:00:00Z',
    updatedAt: '2024-04-28T18:00:00Z',
  },
];

const mockCheckInRecords: CheckInRecord[] = [
  {
    id: 'checkin-001',
    userId: 1,
    date: '2024-05-05',
    practiceDuration: 60,
    exercisesCompleted: ['exercise-beginner-001', 'exercise-beginner-002'],
    notes: '今天练习了音阶和琶音，感觉手型比昨天好一些了。',
    createdAt: '2024-05-05T21:00:00Z',
  },
  {
    id: 'checkin-002',
    userId: 1,
    date: '2024-05-04',
    practiceDuration: 45,
    exercisesCompleted: ['exercise-beginner-001'],
    createdAt: '2024-05-04T20:30:00Z',
  },
  {
    id: 'checkin-003',
    userId: 1,
    date: '2024-05-03',
    practiceDuration: 90,
    exercisesCompleted: ['exercise-beginner-001', 'exercise-beginner-002', 'exercise-beginner-003'],
    notes: '周末多练了一会儿，感觉进步很大！',
    createdAt: '2024-05-03T19:00:00Z',
  },
];

type TabType = 'posts' | 'checkin' | 'leaderboard' | 'accompaniment';

function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [postFilter, setPostFilter] = useState<'all' | 'performance' | 'question' | 'discussion'>('all');
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const { user } = useAuth();
  const { showSuccess } = useToast();

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: queryKeys.community.posts,
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { items: posts, total: posts.length };
    },
  });

  const { data: checkInData, isLoading: checkInLoading } = useQuery({
    queryKey: queryKeys.community.checkIns,
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { items: mockCheckInRecords, total: mockCheckInRecords.length };
    },
  });

  useEffect(() => {
    if (postsData?.items) {
      setPosts(postsData.items);
    }
  }, [postsData?.items]);

  const filteredPosts = posts.filter(post => {
    if (postFilter === 'all') return true;
    return post.type === postFilter;
  });

  const handleCreatePost = (newPost: Omit<CommunityPost, 'id' | 'userId' | 'userName' | 'likes' | 'comments' | 'ratings' | 'createdAt' | 'updatedAt'>) => {
    const post: CommunityPost = {
      id: generateUniqueId(),
      userId: user?.id || 0,
      userName: user?.username || '匿名用户',
      likes: 0,
      comments: [],
      ratings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newPost,
    };
    setPosts([post, ...posts]);
    setShowCreatePostModal(false);
    showSuccess('帖子发布成功！');
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'posts', label: '社区帖子', icon: '💬' },
    { key: 'checkin', label: '练琴打卡', icon: '📅' },
    { key: 'leaderboard', label: '排行榜', icon: '🏆' },
    { key: 'accompaniment', label: 'AI伴奏', icon: '🎹' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">社区</h1>
          <p className="text-gray-500 mt-1">与其他学习者交流，分享进步</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'posts' && (
              <PostsView
                posts={filteredPosts}
                postFilter={postFilter}
                setPostFilter={setPostFilter}
                isLoading={postsLoading}
                onPostClick={() => setShowCreatePostModal(true)}
              />
            )}
            {activeTab === 'checkin' && (
              <CheckInView
                checkIns={checkInData?.items || []}
                streak={checkInStreakData[0]}
                isLoading={checkInLoading}
              />
            )}
            {activeTab === 'leaderboard' && (
              <LeaderboardView leaderboard={leaderboardData} />
            )}
            {activeTab === 'accompaniment' && (
              <AIAccompanimentView />
            )}
          </div>
        </div>
      </div>

      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </Layout>
  );
}

function PostsView({
  posts,
  postFilter,
  setPostFilter,
  isLoading,
  onPostClick,
}: {
  posts: CommunityPost[];
  postFilter: 'all' | 'performance' | 'question' | 'discussion';
  setPostFilter: (filter: typeof postFilter) => void;
  isLoading: boolean;
  onPostClick: () => void;
}) {
  if (isLoading) {
    return <Loading isLoading={true} text="加载帖子..." />;
  }

  const typeLabels: Record<string, string> = {
    all: '全部',
    performance: '演奏分享',
    question: '问题求助',
    discussion: '讨论交流',
  };

  const typeColors: Record<string, string> = {
    performance: 'bg-purple-100 text-purple-800',
    question: 'bg-orange-100 text-orange-800',
    discussion: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'performance', 'question', 'discussion'] as const).map((filter) => (
            <Button
              key={filter}
              variant={postFilter === filter ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPostFilter(filter)}
            >
              {typeLabels[filter]}
            </Button>
          ))}
        </div>
        <Button onClick={onPostClick}>
          ✏️ 发布帖子
        </Button>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">暂无帖子</h3>
            <p className="mt-2 text-gray-500">快来发布第一篇帖子吧！</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[post.type]}`}>
                      {typeLabels[post.type]}
                    </span>
                    <h3 className="font-semibold text-gray-900">{post.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.content}</p>
                  {post.audioUrl !== undefined && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      <span>音频附件 ({formatTime(post.audioDuration || 0)})</span>
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs">
                        {post.userName.charAt(0)}
                      </div>
                      {post.userName}
                    </span>
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comments.length}
                    </span>
                    {post.ratings.length > 0 && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {post.ratings.reduce((acc, r) => acc + r.score, 0) / post.ratings.length}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  查看详情
                </Button>
              </div>

              {post.comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {post.comments.slice(0, 2).map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">
                        {comment.userName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                          {comment.isTeacher && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs">教师</span>
                          )}
                          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {post.comments.length > 2 && (
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      查看全部 {post.comments.length} 条评论
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CheckInView({
  checkIns,
  streak,
  isLoading,
}: {
  checkIns: CheckInRecord[];
  streak: CheckInStreak | undefined;
  isLoading: boolean;
}) {
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  if (isLoading) {
    return <Loading isLoading={true} text="加载打卡记录..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-80">当前连续打卡</p>
          <p className="text-4xl font-bold mt-1">{streak?.currentStreak || 0}</p>
          <p className="text-sm opacity-80 mt-1">天</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-80">最长连续打卡</p>
          <p className="text-4xl font-bold mt-1">{streak?.longestStreak || 0}</p>
          <p className="text-sm opacity-80 mt-1">天</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-80">总打卡次数</p>
          <p className="text-4xl font-bold mt-1">{streak?.totalCheckIns || 0}</p>
          <p className="text-sm opacity-80 mt-1">次</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-80">累计练习时长</p>
          <p className="text-4xl font-bold mt-1">
            {checkIns.reduce((acc, c) => acc + c.practiceDuration, 0)}
          </p>
          <p className="text-sm opacity-80 mt-1">分钟</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={() => setShowCheckInModal(true)} className="px-8 py-3 text-lg">
          📅 今日打卡
        </Button>
      </div>

      {showCheckInModal && (
        <CheckInModal onClose={() => setShowCheckInModal(false)} />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">打卡记录</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {checkIns.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">暂无打卡记录</h3>
              <p className="mt-2 text-gray-500">开始练习后，记得来打卡记录进度哦！</p>
            </div>
          ) : (
            checkIns.map((checkIn) => (
              <div key={checkIn.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-xl">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{checkIn.date}</p>
                      <p className="text-sm text-gray-500">
                        练习了 {checkIn.practiceDuration} 分钟，完成 {checkIn.exercisesCompleted.length} 首练习曲
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {checkIn.practiceDuration >= 60 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                        勤奋标兵
                      </span>
                    )}
                    {checkIn.exercisesCompleted.length >= 3 && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        高效率
                      </span>
                    )}
                  </div>
                </div>
                {checkIn.notes && (
                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                    💬 {checkIn.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CheckInModal({ onClose }: { onClose: () => void }) {
  const [practiceDuration, setPracticeDuration] = useState('60');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">今日练琴打卡</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              练习时长（分钟）
            </label>
            <Input
              type="number"
              value={practiceDuration}
              onChange={(e) => setPracticeDuration(e.target.value)}
              min={1}
              max={480}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              练习心得（选填）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录今天的练习感受..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button className="flex-1">
            确认打卡
          </Button>
        </div>
      </div>
    </div>
  );
}

function LeaderboardView({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-8 mb-8">
        {leaderboard.slice(0, 3).map((entry, index) => (
          <div
            key={entry.userId}
            className={`text-center ${
              index === 1 ? 'order-first mt-8' : index === 0 ? 'order-none' : 'order-last mt-4'
            }`}
          >
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold ${
              index === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900' :
              index === 0 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900' :
              'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900'
            }`}>
              {entry.userName.charAt(0)}
            </div>
            <div className={`text-4xl font-bold mt-2 ${
              index === 1 ? 'text-yellow-500' :
              index === 0 ? 'text-gray-400' :
              'text-orange-400'
            }`}>
              {index === 1 ? '🥇' : index === 0 ? '🥈' : '🥉'}
            </div>
            <p className="font-medium text-gray-900 mt-1">{entry.userName}</p>
            <p className="text-sm text-gray-500">{entry.streakDays} 天连续打卡</p>
            <p className="text-sm text-blue-600">{entry.totalPracticeMinutes} 分钟总练习</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">完整排行榜</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {leaderboard.map((entry) => (
            <div key={entry.userId} className="px-6 py-4 flex items-center gap-4">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                entry.rank <= 3
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {entry.rank}
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                {entry.userName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{entry.userName}</p>
                <p className="text-sm text-gray-500">
                  连续打卡 {entry.streakDays} 天 · 总练习 {entry.totalPracticeMinutes} 分钟
                </p>
              </div>
              <div className="text-right">
                {entry.rank === 1 && <span className="text-2xl">🏆</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AIAccompanimentView() {
  const [key, setKey] = useState('C');
  const [tempo, setTempo] = useState('100');
  const [style, setStyle] = useState<'classical' | 'jazz' | 'pop' | 'rock' | 'folk'>('pop');
  const [complexity, setComplexity] = useState<'simple' | 'medium' | 'complex'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 3000);
  };

  const styleLabels: Record<string, string> = {
    classical: '古典',
    jazz: '爵士',
    pop: '流行',
    rock: '摇滚',
    folk: '民谣',
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <span className="text-3xl">🎹</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI 智能伴奏</h2>
            <p className="text-purple-100 mt-1">
              上传您的旋律音频，AI 将自动生成和声伴奏并混音
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">上传旋律音频</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-4 text-gray-600">点击或拖拽上传音频文件</p>
            <p className="text-sm text-gray-400 mt-1">支持 MP3、WAV、M4A 格式，最大 50MB</p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">调式</label>
                <Select
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  options={[
                    { value: 'C', label: 'C大调' },
                    { value: 'G', label: 'G大调' },
                    { value: 'D', label: 'D大调' },
                    { value: 'F', label: 'F大调' },
                    { value: 'Bb', label: 'Bb大调' },
                    { value: 'A', label: 'A小调' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">速度 (BPM)</label>
                <Input
                  type="number"
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                  min={40}
                  max={240}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">风格</label>
                <Select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as typeof style)}
                  options={Object.entries(styleLabels).map(([value, label]) => ({ value, label }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">复杂度</label>
                <Select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value as typeof complexity)}
                  options={[
                    { value: 'simple', label: '简单' },
                    { value: 'medium', label: '中等' },
                    { value: 'complex', label: '复杂' },
                  ]}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-6"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">🔄</span>
                  正在生成伴奏...
                </>
              ) : (
                <>
                  <span className="mr-2">🎵</span>
                  生成智能伴奏
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">生成结果</h3>
          
          {!generated ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <p className="mt-4">上传音频并点击生成按钮</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">伴奏生成成功！</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">原旋律音频</span>
                  <Button variant="secondary" size="sm">
                    ▶ 播放
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">AI生成伴奏</span>
                  <Button variant="secondary" size="sm">
                    ▶ 播放
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-700 font-medium">混音后音频</span>
                  <Button size="sm">
                    ▶ 播放
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">生成的和弦进行:</h4>
                <div className="flex flex-wrap gap-2">
                  {['C', 'F', 'G', 'C', 'Am', 'Dm', 'G', 'C'].map((chord, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium"
                    >
                      {chord}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1">
                  💾 下载伴奏
                </Button>
                <Button variant="secondary" className="flex-1">
                  💾 下载混音
                </Button>
                <Button className="flex-1">
                  📤 分享到社区
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreatePostModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (post: Omit<CommunityPost, 'id' | 'userId' | 'userName' | 'likes' | 'comments' | 'ratings' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [type, setType] = useState<'performance' | 'question' | 'discussion'>('discussion');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audioDuration, setAudioDuration] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    
    onSubmit({
      type,
      title: title.trim(),
      content: content.trim(),
      audioUrl: '',
      audioDuration: audioDuration ? parseInt(audioDuration) : undefined,
      exerciseId: undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">发布新帖子</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">帖子类型</label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              options={[
                { value: 'discussion', label: '讨论交流' },
                { value: 'performance', label: '演奏分享' },
                { value: 'question', label: '问题求助' },
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入帖子标题"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入帖子内容..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">音频时长（秒，选填）</label>
            <Input
              type="number"
              value={audioDuration}
              onChange={(e) => setAudioDuration(e.target.value)}
              placeholder="例如：60"
              className="w-full"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim()}>
            发布帖子
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CommunityPage;