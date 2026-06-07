import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, Lightbulb, Star, Award } from 'lucide-react';
import { useAppStore } from '../store';
import Tabs from '../components/ui/Tabs';
import RatingBar from '../components/ui/RatingBar';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { TabType } from '../types';

export default function TrackingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStudentById, getEvaluationsByStudentId, getArtworksByStudentId } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [student, setStudent] = useState(getStudentById(id || ''));
  const [evaluations, setEvaluations] = useState(getEvaluationsByStudentId(id || ''));
  const [artworks, setArtworks] = useState(getArtworksByStudentId(id || ''));

  useEffect(() => {
    if (id) {
      setStudent(getStudentById(id));
      setEvaluations(getEvaluationsByStudentId(id));
      setArtworks(getArtworksByStudentId(id));
    }
  }, [id, getStudentById, getEvaluationsByStudentId, getArtworksByStudentId]);

  if (!student) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-gray-500 mb-4">未找到该学员</p>
        <button onClick={() => navigate('/tracking')} className="btn-primary">
          返回追踪列表
        </button>
      </div>
    );
  }

  const latestEval = evaluations[0];
  const previousEval = evaluations[1];

  const radarData = latestEval ? [
    { subject: '构图', A: latestEval.composition, fullMark: 10 },
    { subject: '色彩', A: latestEval.color, fullMark: 10 },
    { subject: '线条', A: latestEval.line, fullMark: 10 },
    { subject: '创意', A: latestEval.creativity, fullMark: 10 },
    { subject: '表现力', A: latestEval.expression, fullMark: 10 },
  ] : [];

  const trendData = evaluations.slice().reverse().map((eval_, index) => ({
    name: `第${index + 1}次`,
    date: eval_.date,
    构图: eval_.composition,
    色彩: eval_.color,
    线条: eval_.line,
    创意: eval_.creativity,
    表现力: eval_.expression,
  }));

  const getAdvantages = () => {
    if (!latestEval) return [];
    const scores = [
      { name: '构图', value: latestEval.composition },
      { name: '色彩', value: latestEval.color },
      { name: '线条', value: latestEval.line },
      { name: '创意', value: latestEval.creativity },
      { name: '表现力', value: latestEval.expression },
    ];
    return scores.filter(s => s.value >= 8).sort((a, b) => b.value - a.value);
  };

  const getImprovements = () => {
    if (!latestEval) return [];
    const scores = [
      { name: '构图', value: latestEval.composition },
      { name: '色彩', value: latestEval.color },
      { name: '线条', value: latestEval.line },
      { name: '创意', value: latestEval.creativity },
      { name: '表现力', value: latestEval.expression },
    ];
    return scores.filter(s => s.value <= 6).sort((a, b) => a.value - b.value);
  };

  const tabs = [
    { id: 'profile', label: '能力评估', icon: <TrendingUp size={18} /> },
    { id: 'style', label: '作品时间轴', icon: <Calendar size={18} /> },
    { id: 'communication', label: '发展建议', icon: <Lightbulb size={18} /> },
  ];

  const avgScore = latestEval 
    ? Math.round((latestEval.composition + latestEval.color + latestEval.line + latestEval.creativity + latestEval.expression) / 5)
    : 0;

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/tracking')}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        返回追踪列表
      </button>

      <div className="card mb-6 bg-gradient-to-r from-green-50 to-secondary-50">
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-warm shadow-soft">
              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-display text-2xl shadow-lg">
              {avgScore}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-display text-gray-800 mb-2">
              {student.name} 的成长轨迹 <span className="text-2xl">📈</span>
            </h1>
            <div className="flex flex-wrap gap-3">
              <span className="tag bg-white text-secondary-700">
                {student.className}
              </span>
              <span className="tag bg-white text-green-700">
                <Star size={14} className="mr-1" />
                综合评分 {avgScore}/10
              </span>
              <span className="tag bg-white text-purple-700">
                {evaluations.length} 次评估
              </span>
              <span className="tag bg-white text-primary-700">
                {artworks.length} 幅作品
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabType)} />

      {activeTab === 'profile' && latestEval && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card animate-slide-up">
              <h2 className="text-xl font-display text-gray-800 mb-6">🎯 能力雷达图</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 14 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Radar
                      name="当前评分"
                      dataKey="A"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card animate-slide-up delay-100">
              <h2 className="text-xl font-display text-gray-800 mb-6">📊 分项评分</h2>
              <RatingBar label="构图" value={latestEval.composition} color="primary" />
              <RatingBar label="色彩" value={latestEval.color} color="pink" />
              <RatingBar label="线条" value={latestEval.line} color="secondary" />
              <RatingBar label="创意" value={latestEval.creativity} color="purple" />
              <RatingBar label="表现力" value={latestEval.expression} color="green" />
              
              {previousEval && (
                <div className="mt-4 p-4 rounded-2xl bg-green-50">
                  <h3 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                    <TrendingUp size={18} />
                    相比上次评估
                  </h3>
                  <div className="grid grid-cols-5 gap-2 text-center text-sm">
                    <div>
                      <p className={`font-bold ${latestEval.composition >= previousEval.composition ? 'text-green-600' : 'text-red-500'}`}>
                        {latestEval.composition >= previousEval.composition ? '↑' : '↓'}
                        {Math.abs(latestEval.composition - previousEval.composition)}
                      </p>
                      <p className="text-gray-500 text-xs">构图</p>
                    </div>
                    <div>
                      <p className={`font-bold ${latestEval.color >= previousEval.color ? 'text-green-600' : 'text-red-500'}`}>
                        {latestEval.color >= previousEval.color ? '↑' : '↓'}
                        {Math.abs(latestEval.color - previousEval.color)}
                      </p>
                      <p className="text-gray-500 text-xs">色彩</p>
                    </div>
                    <div>
                      <p className={`font-bold ${latestEval.line >= previousEval.line ? 'text-green-600' : 'text-red-500'}`}>
                        {latestEval.line >= previousEval.line ? '↑' : '↓'}
                        {Math.abs(latestEval.line - previousEval.line)}
                      </p>
                      <p className="text-gray-500 text-xs">线条</p>
                    </div>
                    <div>
                      <p className={`font-bold ${latestEval.creativity >= previousEval.creativity ? 'text-green-600' : 'text-red-500'}`}>
                        {latestEval.creativity >= previousEval.creativity ? '↑' : '↓'}
                        {Math.abs(latestEval.creativity - previousEval.creativity)}
                      </p>
                      <p className="text-gray-500 text-xs">创意</p>
                    </div>
                    <div>
                      <p className={`font-bold ${latestEval.expression >= previousEval.expression ? 'text-green-600' : 'text-red-500'}`}>
                        {latestEval.expression >= previousEval.expression ? '↑' : '↓'}
                        {Math.abs(latestEval.expression - previousEval.expression)}
                      </p>
                      <p className="text-gray-500 text-xs">表现力</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {trendData.length >= 2 && (
            <div className="card animate-slide-up delay-200">
              <h2 className="text-xl font-display text-gray-800 mb-6">📈 成长趋势图</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="构图" stroke="#FFB347" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="色彩" stroke="#FFB6C1" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="线条" stroke="#87CEEB" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="创意" stroke="#DDA0DD" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="表现力" stroke="#98FB98" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'style' && (
        <div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-200 via-secondary-200 to-green-200 transform -translate-x-1/2" />
            
            <div className="space-y-8">
              {artworks.map((artwork, index) => (
                <div 
                  key={artwork.id} 
                  className={`relative flex items-center gap-8 animate-slide-up ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex-1">
                    <div className={`card ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-500">{artwork.date}</span>
                        {artwork.isPortfolio && (
                          <span className="tag bg-yellow-100 text-yellow-700 text-xs flex items-center gap-1">
                            <Award size={12} />
                            作品集
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-display text-gray-800 mb-2">{artwork.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{artwork.comment}</p>
                    </div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center text-white font-bold shadow-lg z-10 flex-shrink-0">
                    {artworks.length - index}
                  </div>
                  
                  <div className="flex-1">
                    <div className="aspect-square max-w-xs rounded-3xl overflow-hidden shadow-card group mx-auto">
                      <img 
                        src={artwork.imageUrl} 
                        alt={artwork.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {artworks.length === 0 && (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-500">暂无作品记录</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'communication' && latestEval && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-green flex items-center justify-center">
                  <Star size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-display text-gray-800">🌟 擅长领域</h2>
              </div>
              {getAdvantages().length > 0 ? (
                <div className="space-y-3">
                  {getAdvantages().map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <span className="text-green-600 font-bold ml-auto">{item.value}/10</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">继续努力，各方面均衡发展中！</p>
              )}
            </div>

            <div className="card animate-slide-up delay-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-pink flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-display text-gray-800">💪 提升方向</h2>
              </div>
              {getImprovements().length > 0 ? (
                <div className="space-y-3">
                  {getImprovements().map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-pink-50">
                      <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <span className="text-pink-600 font-bold ml-auto">{item.value}/10</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">太棒了！各方面表现都很优秀！</p>
              )}
            </div>
          </div>

          <div className="card animate-slide-up delay-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center">
                <Lightbulb size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-display text-gray-800">💡 个性化发展建议</h2>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-50 via-secondary-50 to-green-50">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {latestEval.suggestion}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-gradient bg-gradient-warm text-white animate-slide-up">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-display mb-2">短期目标</h3>
              <p className="text-sm opacity-90">
                完成{getImprovements().length > 0 ? getImprovements()[0].name : '综合'}能力专项练习，争取在下次评估中提升1-2分。
              </p>
            </div>
            <div className="card-gradient bg-gradient-cool text-white animate-slide-up delay-100">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-lg font-display mb-2">推荐学习</h3>
              <p className="text-sm opacity-90">
                建议阅读{getAdvantages().length > 0 ? `${getAdvantages()[0].name}相关` : '艺术启蒙'}绘本，参观美术馆，拓宽艺术视野。
              </p>
            </div>
            <div className="card-gradient bg-gradient-green text-white animate-slide-up delay-200">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="text-lg font-display mb-2">发展方向</h3>
              <p className="text-sm opacity-90">
                {getAdvantages().length >= 2 
                  ? `可重点发展${getAdvantages().map(a => a.name).join('、')}方向，形成个人特色。` 
                  : '均衡发展各方面能力，探索兴趣所在。'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
