import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Button from '@/components/Button';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  buttonText: string;
  color: string;
}

function QuickActionCard({ title, description, icon, link, buttonText, color }: QuickActionCardProps) {
  return (
    <div className={`${color} rounded-xl p-6 text-white shadow-sm hover:shadow-md transition-all`}>
      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white text-opacity-80 mb-4">{description}</p>
      <Link to={link}>
        <Button variant="ghost" size="sm" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0">
          {buttonText} →
        </Button>
      </Link>
    </div>
  );
}

interface MatchPreviewCardProps {
  name: string;
  languages: string;
  interests: string[];
  matchScore: number;
  avatar: string;
}

function MatchPreviewCard({ name, languages, interests, matchScore, avatar }: MatchPreviewCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
          {avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              {matchScore}% 匹配
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{languages}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {interests.map((interest, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecentActivityItemProps {
  type: string;
  title: string;
  time: string;
}

function RecentActivityItem({ type, title, time }: RecentActivityItemProps) {
  const typeIcons: Record<string, React.ReactNode> = {
    chat: (
      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    match: (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    vocabulary: (
      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    correction: (
      <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
        {typeIcons[type] || typeIcons.chat}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{title}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const mockStats = {
    matchedPartners: 12,
    todayChatMinutes: 45,
    vocabularyWords: 256,
    pendingMatches: 3,
    weeklyProgress: 78,
  };

  const recentMatches = [
    {
      name: '山田花子',
      languages: '日语母语者 | 学习中文',
      interests: ['旅行', '美食', '动漫'],
      matchScore: 92,
      avatar: '花',
    },
    {
      name: 'Emma Wilson',
      languages: '英语母语者 | 学习中文',
      interests: ['阅读', '音乐', '旅行'],
      matchScore: 85,
      avatar: 'E',
    },
    {
      name: 'Pierre Dupont',
      languages: '法语母语者 | 学习英语',
      interests: ['电影', '艺术', '文化'],
      matchScore: 78,
      avatar: 'P',
    },
  ];

  const recentActivities = [
    { type: 'chat', title: '与 山田花子 进行了 30分钟的语音通话', time: '2小时前' },
    { type: 'vocabulary', title: '添加了 5 个新单词到生词本', time: '4小时前' },
    { type: 'match', title: '与 Emma Wilson 建立了匹配', time: '昨天' },
    { type: 'correction', title: '收到了 3 条语法纠正建议', time: '昨天' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来！</h1>
          <p className="text-gray-500 mt-1">今天也是学习语言的好日子，继续加油！</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="已匹配语言伙伴"
            value={mockStats.matchedPartners}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="今日聊天时长"
            value={`${mockStats.todayChatMinutes} 分`}
            subtitle="本周目标: 150分钟"
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="生词本单词"
            value={mockStats.vocabularyWords}
            subtitle="已掌握: 189个"
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <StatCard
            title="待处理匹配"
            value={mockStats.pendingMatches}
            subtitle="等待您的回应"
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
          />
          <StatCard
            title="本周学习进度"
            value={`${mockStats.weeklyProgress}%`}
            subtitle="目标完成度"
            color="pink"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">今日匹配推荐</h3>
              <Link to="/matching">
                <Button variant="ghost" size="sm">
                  查看全部 →
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentMatches.map((match, idx) => (
                <MatchPreviewCard key={idx} {...match} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">最近活动</h3>
            <div>
              {recentActivities.map((activity, idx) => (
                <RecentActivityItem key={idx} {...activity} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              title="寻找语言伙伴"
              description="发现与您语言互补的学习者，开始交流学习"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              link="/matching"
              buttonText="开始匹配"
              color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            />
            <QuickActionCard
              title="开始聊天"
              description="与您的语言伙伴进行文字或语音交流"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              link="/chat"
              buttonText="打开聊天"
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <QuickActionCard
              title="复习生词"
              description="复习您在聊天中标记的生词，巩固学习成果"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              link="/vocabulary"
              buttonText="打开生词本"
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <QuickActionCard
              title="加入社区"
              description="参与语言学习讨论，参与口语挑战活动"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              link="/community"
              buttonText="浏览社区"
              color="bg-gradient-to-br from-pink-500 to-rose-600"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;
