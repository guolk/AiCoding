import { BookOpen, TrendingUp, FileText, Brain, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStore } from '../store';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const statCards = [
  { label: '学习笔记', icon: BookOpen, color: 'bg-blue-500', valueKey: 'totalNotes' },
  { label: '投资策略', icon: TrendingUp, color: 'bg-green-500', valueKey: 'totalStrategies' },
  { label: '交易记录', icon: FileText, color: 'bg-purple-500', valueKey: 'totalTrades' },
  { label: '情绪记录', icon: Brain, color: 'bg-orange-500', valueKey: 'totalEmotions' },
];

export default function Dashboard() {
  const { dashboardStats, investmentNotes, strategies, tradeRecords, emotionRecords } = useStore();

  const recentNotes = investmentNotes.slice(0, 3);
  const recentStrategies = strategies.slice(0, 3);
  const recentTrades = tradeRecords.slice(0, 3);

  const emotionData = {
    labels: ['恐惧', '贪婪', '平静'],
    datasets: [
      {
        data: [
          emotionRecords.filter((e) => e.emotion === 'fear').length,
          emotionRecords.filter((e) => e.emotion === 'greed').length,
          emotionRecords.filter((e) => e.emotion === 'calm').length,
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
      },
    ],
  };

  const tradeData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        label: '买入次数',
        data: [3, 5, 2, 4, 6, 3],
        backgroundColor: '#10b981',
      },
      {
        label: '卖出次数',
        data: [2, 3, 1, 3, 4, 2],
        backgroundColor: '#ef4444',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
          <p className="text-gray-500 mt-1">欢迎回来，查看您的投资学习概览</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">今日日期</p>
          <p className="text-lg font-medium text-gray-800">{new Date().toLocaleDateString('zh-CN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {dashboardStats[card.valueKey as keyof typeof dashboardStats]}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>较上周 +12%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">交易趋势</h2>
          <div className="h-64">
            <Bar data={tradeData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">情绪分布</h2>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={emotionData} options={{ responsive: true }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">最近学习笔记</h2>
          <div className="space-y-4">
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => (
                <div key={note.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    note.category === 'value' ? 'bg-blue-100 text-blue-600' :
                    note.category === 'growth' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {note.category === 'value' ? '价值投资' :
                     note.category === 'growth' ? '成长投资' : '量化投资'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{note.title}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{note.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">暂无学习笔记</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">最近交易记录</h2>
          <div className="space-y-4">
            {recentTrades.length > 0 ? (
              recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{trade.stock_name}</p>
                    <p className="text-sm text-gray-500">{trade.stock_code}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      trade.action === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {trade.action === 'buy' ? '买入' : '卖出'}
                    </span>
                    <p className="text-sm text-gray-800 mt-1">¥{trade.price.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">暂无交易记录</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
