import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import type { StudentProgress, RevenueReport, DifficultyLevel } from '@/types';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, StatusBadge } from '@/components/Table';
import { getDifficultyLabel, formatDate } from '@/utils/music';
import { queryKeys } from '@/services/queryClient';
import { videoCoursesData } from '@/data/exercises';

const mockStudents: StudentProgress[] = [
  {
    id: 'student-001',
    studentId: 101,
    studentName: '张三',
    studentEmail: 'zhangsan@example.com',
    coursesEnrolled: ['video-course-001', 'video-course-002'],
    lastActive: '2024-05-05T10:30:00Z',
    totalPracticeMinutes: 480,
    averageAccuracy: 78,
    currentLevel: 'beginner',
    checkInStreak: 15,
  },
  {
    id: 'student-002',
    studentId: 102,
    studentName: '李四',
    studentEmail: 'lisi@example.com',
    coursesEnrolled: ['video-course-001'],
    lastActive: '2024-05-04T18:00:00Z',
    totalPracticeMinutes: 320,
    averageAccuracy: 85,
    currentLevel: 'beginner',
    checkInStreak: 8,
  },
  {
    id: 'student-003',
    studentId: 103,
    studentName: '王五',
    studentEmail: 'wangwu@example.com',
    coursesEnrolled: ['video-course-001', 'video-course-002', 'video-course-003'],
    lastActive: '2024-05-05T09:15:00Z',
    totalPracticeMinutes: 960,
    averageAccuracy: 92,
    currentLevel: 'intermediate',
    checkInStreak: 25,
  },
  {
    id: 'student-004',
    studentId: 104,
    studentName: '赵六',
    studentEmail: 'zhaoliu@example.com',
    coursesEnrolled: ['video-course-002'],
    lastActive: '2024-05-03T14:00:00Z',
    totalPracticeMinutes: 180,
    averageAccuracy: 65,
    currentLevel: 'beginner',
    checkInStreak: 3,
  },
  {
    id: 'student-005',
    studentId: 105,
    studentName: '钱七',
    studentEmail: 'qianqi@example.com',
    coursesEnrolled: ['video-course-003'],
    lastActive: '2024-05-05T15:45:00Z',
    totalPracticeMinutes: 1200,
    averageAccuracy: 88,
    currentLevel: 'advanced',
    checkInStreak: 30,
  },
];

const mockRevenueData = [
  { month: '1月', 课程销售: 5800, 订阅收入: 3200 },
  { month: '2月', 课程销售: 6200, 订阅收入: 3800 },
  { month: '3月', 课程销售: 4900, 订阅收入: 4200 },
  { month: '4月', 课程销售: 7300, 订阅收入: 5100 },
  { month: '5月', 课程销售: 8500, 订阅收入: 6200 },
];

const levelDistribution = [
  { name: '基础', value: 3, color: '#10B981' },
  { name: '进阶', value: 1, color: '#3B82F6' },
  { name: '高级', value: 1, color: '#EF4444' },
];

function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'revenue' | 'courses'>('overview');

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: queryKeys.teacher.students,
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { items: mockStudents, total: mockStudents.length };
    },
  });

  const tabs = [
    { key: 'overview' as const, label: '数据概览', icon: '📊' },
    { key: 'students' as const, label: '学生管理', icon: '👥' },
    { key: 'revenue' as const, label: '收益报表', icon: '💰' },
    { key: 'courses' as const, label: '课程管理', icon: '📚' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">教师工作台</h1>
          <p className="text-gray-500 mt-1">管理学生、查看收益、发布课程</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="学生总数"
            value={students?.items.length || 0}
            color="blue"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
          <StatCard
            title="本月收入"
            value="¥14,700"
            color="green"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="在线课程"
            value={videoCoursesData.length}
            color="purple"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          />
          <StatCard
            title="本月新增学生"
            value={5}
            color="orange"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
          />
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
            {activeTab === 'overview' && (
              <OverviewView students={students?.items || []} />
            )}
            {activeTab === 'students' && (
              <StudentsView students={students?.items || []} isLoading={studentsLoading} />
            )}
            {activeTab === 'revenue' && (
              <RevenueView />
            )}
            {activeTab === 'courses' && (
              <CoursesView />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
  icon: React.ReactNode;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewView({ students }: { students: StudentProgress[] }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">收入趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="课程销售" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                <Line type="monotone" dataKey="订阅收入" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">学生水平分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={levelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {levelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活跃学生</h3>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableHeaderCell>学生姓名</TableHeaderCell>
              <TableHeaderCell>邮箱</TableHeaderCell>
              <TableHeaderCell>当前水平</TableHeaderCell>
              <TableHeaderCell>练习时长</TableHeaderCell>
              <TableHeaderCell>准确率</TableHeaderCell>
              <TableHeaderCell>打卡天数</TableHeaderCell>
              <TableHeaderCell>状态</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {students.slice(0, 5).map((student) => {
                const daysSinceActive = Math.floor(
                  (Date.now() - new Date(student.lastActive).getTime()) / (1000 * 60 * 60 * 24)
                );
                const isActive = daysSinceActive <= 1;

                return (
                  <TableRow key={student.id} row={student}>
                    <TableCell className="font-medium">{student.studentName}</TableCell>
                    <TableCell className="text-sm text-gray-500">{student.studentEmail}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        student.currentLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                        student.currentLevel === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getDifficultyLabel(student.currentLevel)}
                      </span>
                    </TableCell>
                    <TableCell>{Math.round(student.totalPracticeMinutes / 60)} 小时</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        student.averageAccuracy >= 80 ? 'text-green-600' :
                        student.averageAccuracy >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {student.averageAccuracy}%
                      </span>
                    </TableCell>
                    <TableCell>{student.checkInStreak} 天</TableCell>
                    <TableCell>
                      <StatusBadge status={isActive ? 'active' : 'inactive'} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function StudentsView({
  students,
  isLoading,
}: {
  students: StudentProgress[];
  isLoading: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | DifficultyLevel>('all');

  if (isLoading) {
    return <Loading isLoading={true} text="加载学生列表..." />;
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch = searchQuery === '' ||
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || student.currentLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="搜索学生姓名或邮箱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <Select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as typeof levelFilter)}
          options={[
            { value: 'all', label: '全部水平' },
            { value: 'beginner', label: '基础' },
            { value: 'intermediate', label: '进阶' },
            { value: 'advanced', label: '高级' },
          ]}
          className="w-40"
        />
        <Button>
          + 添加学生
        </Button>
      </div>

      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableHeaderCell>学生</TableHeaderCell>
            <TableHeaderCell>邮箱</TableHeaderCell>
            <TableHeaderCell>当前水平</TableHeaderCell>
            <TableHeaderCell>报名课程</TableHeaderCell>
            <TableHeaderCell>练习时长</TableHeaderCell>
            <TableHeaderCell>准确率</TableHeaderCell>
            <TableHeaderCell>打卡天数</TableHeaderCell>
            <TableHeaderCell>最后活跃</TableHeaderCell>
            <TableHeaderCell>操作</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const daysSinceActive = Math.floor(
                (Date.now() - new Date(student.lastActive).getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <TableRow key={student.id} row={student}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {student.studentName.charAt(0)}
                      </div>
                      <span className="font-medium">{student.studentName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{student.studentEmail}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      student.currentLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                      student.currentLevel === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getDifficultyLabel(student.currentLevel)}
                    </span>
                  </TableCell>
                  <TableCell>{student.coursesEnrolled.length} 门</TableCell>
                  <TableCell>{Math.round(student.totalPracticeMinutes / 60)} 小时</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      student.averageAccuracy >= 80 ? 'text-green-600' :
                      student.averageAccuracy >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {student.averageAccuracy}%
                    </span>
                  </TableCell>
                  <TableCell>{student.checkInStreak} 天</TableCell>
                  <TableCell>
                    <span className={`text-sm ${
                      daysSinceActive <= 1 ? 'text-green-600' :
                      daysSinceActive <= 3 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {daysSinceActive === 0 ? '今天' :
                       daysSinceActive === 1 ? '昨天' :
                       `${daysSinceActive} 天前`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm">
                        查看
                      </Button>
                      <Button variant="secondary" size="sm">
                        联系
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function RevenueView() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-6 text-white">
          <p className="text-green-100 text-sm">本月总收入</p>
          <p className="text-3xl font-bold mt-1">¥14,700</p>
          <p className="text-green-100 text-sm mt-2">较上月增长 +18.5%</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-6 text-white">
          <p className="text-blue-100 text-sm">课程销售收入</p>
          <p className="text-3xl font-bold mt-1">¥8,500</p>
          <p className="text-blue-100 text-sm mt-2">5 门课程售出</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-6 text-white">
          <p className="text-purple-100 text-sm">订阅收入</p>
          <p className="text-3xl font-bold mt-1">¥6,200</p>
          <p className="text-purple-100 text-sm mt-2">32 位活跃订阅者</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">月度收入趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="课程销售" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="订阅收入" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">课程销售详情</h3>
          <div className="space-y-4">
            {videoCoursesData.filter(c => c.price > 0).map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cover bg-center rounded-lg" style={{ backgroundImage: `url(${course.thumbnailUrl})` }} />
                  <div>
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-500">{course.instructor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">销量</p>
                  <p className="font-bold text-gray-900">{[15, 8, 12][index]}</p>
                  <p className="text-sm text-green-600">¥{course.price * [15, 8, 12][index]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">导出报表</h3>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              📊 导出 PDF
            </Button>
            <Button variant="secondary" size="sm">
              📈 导出 Excel
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          支持按日、周、月、年查看收益数据，并导出详细报表。
        </p>
      </div>
    </div>
  );
}

function CoursesView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">我的课程</h3>
        <Button>
          + 发布新课程
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoCoursesData.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div
              className="h-40 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${course.thumbnailUrl})` }}
            >
              <div className="absolute top-3 right-3 px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
                ¥{course.price}
              </div>
              {course.isSubscriptionOnly && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium">
                  会员专享
                </div>
              )}
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h4>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <span>{course.chapters.length} 章节</span>
                <span>{[15, 8, 12][parseInt(course.id.slice(-1)) - 1] || 0} 名学生</span>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="secondary" className="flex-1" size="sm">
                  编辑
                </Button>
                <Button variant="secondary" className="flex-1" size="sm">
                  数据
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-2">课程管理提示</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>上传视频后，系统会自动生成章节时间戳和字幕</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>可以选择单独售卖或仅会员可看的发布方式</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>实时查看课程的学习数据和学生反馈</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default TeacherDashboardPage;
