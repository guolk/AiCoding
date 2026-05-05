import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { PracticeSession, PracticeReport, CommonError, AccuracyDataPoint } from '@/types';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import { formatDate, calculateAccuracyPercentage } from '@/utils/music';
import { queryKeys } from '@/services/queryClient';

const mockPracticeSessions: PracticeSession[] = [
  {
    id: 'session-001',
    userId: 1,
    exerciseId: 'exercise-beginner-001',
    startTime: '2024-05-01T10:00:00Z',
    endTime: '2024-05-01T10:05:00Z',
    duration: 300,
    pitchAccuracy: 85,
    rhythmAccuracy: 78,
    overallAccuracy: 82,
    detectedNotes: [],
    rhythmResults: [],
    incorrectMeasures: [1, 3],
    createdAt: '2024-05-01T10:05:00Z',
  },
  {
    id: 'session-002',
    userId: 1,
    exerciseId: 'exercise-beginner-002',
    startTime: '2024-05-02T14:30:00Z',
    endTime: '2024-05-02T14:38:00Z',
    duration: 480,
    pitchAccuracy: 92,
    rhythmAccuracy: 88,
    overallAccuracy: 90,
    detectedNotes: [],
    rhythmResults: [],
    incorrectMeasures: [2],
    createdAt: '2024-05-02T14:38:00Z',
  },
  {
    id: 'session-003',
    userId: 1,
    exerciseId: 'exercise-beginner-001',
    startTime: '2024-05-03T09:15:00Z',
    endTime: '2024-05-03T09:20:00Z',
    duration: 300,
    pitchAccuracy: 95,
    rhythmAccuracy: 91,
    overallAccuracy: 93,
    detectedNotes: [],
    rhythmResults: [],
    incorrectMeasures: [],
    createdAt: '2024-05-03T09:20:00Z',
  },
];

const generateMockAccuracyData = (): AccuracyDataPoint[] => {
  const data: AccuracyDataPoint[] = [];
  for (let i = 0; i < 30; i++) {
    data.push({
      timestamp: i * 10,
      accuracy: 60 + Math.random() * 40,
      measureIndex: Math.floor(i / 5),
    });
  }
  return data;
};

const generateMockCommonErrors = (): CommonError[] => [
  {
    type: 'pitch',
    measureIndex: 1,
    noteIndex: 2,
    description: 'F音经常偏高，注意音准控制',
    frequency: 5,
  },
  {
    type: 'rhythm',
    measureIndex: 3,
    description: '第4小节节奏不稳定，建议使用节拍器练习',
    frequency: 3,
  },
  {
    type: 'both',
    measureIndex: 2,
    noteIndex: 0,
    description: '换把位时音准和节奏都有偏差',
    frequency: 2,
  },
];

function PracticeReportPage() {
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);
  const [report, setReport] = useState<PracticeReport | null>(null);

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: queryKeys.practiceSessions.list(),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { items: mockPracticeSessions, total: mockPracticeSessions.length };
    },
  });

  const sessions = sessionsData?.items || [];

  useEffect(() => {
    if (selectedSession) {
      const mockReport: PracticeReport = {
        id: `report-${selectedSession.id}`,
        userId: selectedSession.userId,
        exerciseId: selectedSession.exerciseId,
        sessionId: selectedSession.id,
        accuracyCurve: generateMockAccuracyData(),
        commonErrors: generateMockCommonErrors(),
        suggestions: [
          '建议使用节拍器先慢练第4小节',
          '注意第2小节F音的音准，可以用钢琴对照练习',
          '整体节奏不错，但换把位时需要更稳定',
          '建议每天练习30分钟，分段练习难点',
        ],
        overallScore: selectedSession.overallAccuracy,
        createdAt: selectedSession.createdAt,
      };
      setReport(mockReport);
    }
  }, [selectedSession]);

  if (isLoading) {
    return (
      <Layout>
        <Loading isLoading={true} text="加载练习报告..." />
      </Layout>
    );
  }

  if (selectedSession && report) {
    return (
      <Layout>
        <ReportDetail
          session={selectedSession}
          report={report}
          onBack={() => {
            setSelectedSession(null);
            setReport(null);
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">练习报告</h1>
          <p className="text-gray-500 mt-1">查看您的练习记录和详细分析</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="总练习次数"
            value={sessions.length}
            color="blue"
          />
          <StatCard
            title="平均准确率"
            value={`${sessions.length > 0 
              ? Math.round(sessions.reduce((acc, s) => acc + s.overallAccuracy, 0) / sessions.length) 
              : 0}%`}
            color="green"
          />
          <StatCard
            title="最佳成绩"
            value={`${sessions.length > 0 ? Math.max(...sessions.map(s => s.overallAccuracy)) : 0}%`}
            color="purple"
          />
          <StatCard
            title="总练习时长"
            value={`${Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60)}分钟`}
            color="orange"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">准确率趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessions.map((s, i) => ({
                name: `练习${i + 1}`,
                音准: s.pitchAccuracy,
                节奏: s.rhythmAccuracy,
                综合: s.overallAccuracy,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="音准" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                <Line type="monotone" dataKey="节奏" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                <Line type="monotone" dataKey="综合" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">练习记录</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {sessions.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">暂无练习记录</h3>
                <p className="mt-2 text-gray-500">开始练习后，这里会显示您的练习报告</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            练习 - {formatDate(session.createdAt)}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            时长: {Math.round(session.duration / 60)}分钟
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">音准</p>
                        <p className={`text-lg font-bold ${
                          session.pitchAccuracy >= 80 ? 'text-green-600' :
                          session.pitchAccuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {session.pitchAccuracy}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">节奏</p>
                        <p className={`text-lg font-bold ${
                          session.rhythmAccuracy >= 80 ? 'text-green-600' :
                          session.rhythmAccuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {session.rhythmAccuracy}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">综合</p>
                        <p className={`text-xl font-bold ${
                          session.overallAccuracy >= 80 ? 'text-green-600' :
                          session.overallAccuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {session.overallAccuracy}%
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  {session.incorrectMeasures.length > 0 && (
                    <div className="mt-3 ml-20 flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm text-orange-600">
                        需注意小节: {session.incorrectMeasures.map(m => `第${m + 1}小节`).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: 'blue' | 'green' | 'purple' | 'orange' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function ReportDetail({
  session,
  report,
  onBack,
}: {
  session: PracticeSession;
  report: PracticeReport;
  onBack: () => void;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={onBack}>
          ← 返回列表
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">练习报告详情</h1>
          <p className="text-gray-500 mt-1">{formatDate(session.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-xl p-6 border-2 ${getScoreBgColor(session.pitchAccuracy)}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">音准准确率</p>
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <p className={`text-4xl font-bold mt-3 ${getScoreColor(session.pitchAccuracy)}`}>
            {session.pitchAccuracy}%
          </p>
          <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                session.pitchAccuracy >= 90 ? 'bg-green-500' :
                session.pitchAccuracy >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${session.pitchAccuracy}%` }}
            />
          </div>
        </div>

        <div className={`rounded-xl p-6 border-2 ${getScoreBgColor(session.rhythmAccuracy)}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">节奏准确率</p>
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={`text-4xl font-bold mt-3 ${getScoreColor(session.rhythmAccuracy)}`}>
            {session.rhythmAccuracy}%
          </p>
          <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                session.rhythmAccuracy >= 90 ? 'bg-green-500' :
                session.rhythmAccuracy >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${session.rhythmAccuracy}%` }}
            />
          </div>
        </div>

        <div className={`rounded-xl p-6 border-2 ${getScoreBgColor(session.overallAccuracy)}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">综合得分</p>
            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className={`text-4xl font-bold mt-3 ${getScoreColor(session.overallAccuracy)}`}>
            {session.overallAccuracy}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {session.overallAccuracy >= 90 ? '优秀！继续保持！' :
             session.overallAccuracy >= 70 ? '不错，还有提升空间' :
             '需要多加练习'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">练习过程准确率曲线</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.accuracyCurve}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" label={{ value: '时间(秒)', position: 'bottom' }} />
                <YAxis domain={[0, 100]} label={{ value: '准确率%', angle: -90, position: 'left' }} />
                <Tooltip
                  formatter={(value: number) => [`${Math.round(value)}%`, '准确率']}
                  labelFormatter={(label) => `时间: ${label}秒`}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  fill="url(#colorAccuracy)"
                />
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">常见错误分析</h3>
          {report.commonErrors.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-gray-500">太棒了！这次练习没有明显错误</p>
            </div>
          ) : (
            <div className="space-y-4">
              {report.commonErrors.map((error, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    error.type === 'pitch' ? 'bg-blue-50 border-blue-200' :
                    error.type === 'rhythm' ? 'bg-green-50 border-green-200' :
                    'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          error.type === 'pitch' ? 'bg-blue-200 text-blue-800' :
                          error.type === 'rhythm' ? 'bg-green-200 text-green-800' :
                          'bg-orange-200 text-orange-800'
                        }`}>
                          {error.type === 'pitch' ? '音准问题' :
                           error.type === 'rhythm' ? '节奏问题' : '综合问题'}
                        </span>
                        <span className="text-sm text-gray-600">
                          第{error.measureIndex + 1}小节
                          {error.noteIndex !== undefined && ` 第${error.noteIndex + 1}个音`}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{error.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">出现次数</p>
                      <p className="text-xl font-bold text-red-500">{error.frequency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">练习建议</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 font-medium">
                {index + 1}
              </div>
              <p className="text-sm text-gray-700">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button>
          🎵 再次练习
        </Button>
        <Button variant="secondary">
          📤 分享到社区
        </Button>
      </div>
    </div>
  );
}

export default PracticeReportPage;
