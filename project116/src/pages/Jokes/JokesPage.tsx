import { Plus, Mic, Clock, TrendingUp, Edit2, Trash2, Copy, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJokes } from '../../context/JokeContext';
import { useMaterials } from '../../context/MaterialContext';
import { MATERIAL_CATEGORIES, MaterialCategory } from '../../types';
import StarRating from '../../components/UI/StarRating';
import { formatDate, formatDuration } from '../../utils/duration';
import { useState } from 'react';

const categoryLabels: Record<MaterialCategory, string> = {
  family: '家庭',
  workplace: '职场',
  society: '社会现象',
  personal: '个人经历',
  other: '其他',
};

export default function JokesPage() {
  const navigate = useNavigate();
  const { jokes, deleteJoke } = useJokes();
  const { materials } = useMaterials();
  const [filterCategory, setFilterCategory] = useState<MaterialCategory | 'all'>('all');

  const filteredJokes = jokes.filter(j => 
    filterCategory === 'all' || j.category === filterCategory
  );

  const totalDuration = jokes.reduce((sum, j) => sum + j.estimatedDuration, 0);
  const avgDuration = jokes.length > 0 ? Math.round(totalDuration / jokes.length) : 0;

  const handleCreateFromMaterial = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      navigate('/jokes/new', { state: { fromMaterial: material } });
    }
  };

  const handleCopy = (jokeId: string) => {
    const joke = jokes.find(j => j.id === jokeId);
    if (joke) {
      const text = `【${joke.title}】\n\nSetup: ${joke.setup}\n\nPunchline: ${joke.punchline}\n\nTag: ${joke.tag}`;
      navigator.clipboard.writeText(text);
      alert('段子已复制到剪贴板');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个段子吗？')) {
      deleteJoke(id);
    }
  };

  const highPotentialMaterials = materials.filter(m => m.potential >= 7).slice(0, 3);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-ivory mb-2">
              段子创作
            </h1>
            <p className="text-ivory/60">用Setup/Punchline/Tag的结构打磨你的笑点</p>
          </div>
          <button
            onClick={() => navigate('/jokes/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>创作新段子</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-stage-red/20 flex items-center justify-center">
                <Mic className="w-5 h-5 text-stage-red" />
              </div>
              <span className="text-ivory/60 text-sm">段子总数</span>
            </div>
            <p className="font-display text-3xl font-bold">{jokes.length}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-ivory/60 text-sm">平均时长</span>
            </div>
            <p className="font-display text-3xl font-bold">{formatDuration(avgDuration)}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-spotlight-gold/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-spotlight-gold" />
              </div>
              <span className="text-ivory/60 text-sm">高潜力素材待创作</span>
            </div>
            <p className="font-display text-3xl font-bold text-spotlight-gold">
              {highPotentialMaterials.length}
            </p>
          </div>
        </div>

        {highPotentialMaterials.length > 0 && (
          <div className="card p-5 mb-8 border-spotlight-gold/30 spotlight">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-spotlight-gold" />
              <h3 className="font-display text-lg font-bold">快速创作：高潜力素材</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {highPotentialMaterials.map(material => (
                <div
                  key={material.id}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group"
                  onClick={() => handleCreateFromMaterial(material.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-spotlight-gold">潜力 {material.potential}/10</span>
                    <Plus className="w-4 h-4 text-ivory/40 group-hover:text-spotlight-gold transition-colors" />
                  </div>
                  <p className="text-sm text-ivory/80 line-clamp-2 mb-2">
                    {material.content}
                  </p>
                  <span className="text-xs text-ivory/40">
                    {categoryLabels[material.category]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterCategory === 'all'
                ? 'bg-stage-red text-white'
                : 'bg-white/5 text-ivory/60 hover:bg-white/10'
            }`}
          >
            全部
          </button>
          {MATERIAL_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterCategory === cat.value
                  ? `${cat.color} text-white`
                  : 'bg-white/5 text-ivory/60 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredJokes.length === 0 ? (
          <div className="card p-12 text-center">
            <Mic className="w-16 h-16 mx-auto mb-4 text-ivory/20" />
            <h3 className="font-display text-xl font-bold text-ivory/60 mb-2">
              还没有段子
            </h3>
            <p className="text-ivory/40 mb-6">开始创作你的第一个段子吧</p>
            <button onClick={() => navigate('/jokes/new')} className="btn-primary">
              创作新段子
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJokes.map((joke) => (
              <div
                key={joke.id}
                className="card p-6 hover:scale-[1.01] transition-transform cursor-pointer"
                onClick={() => navigate(`/jokes/${joke.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`badge ${MATERIAL_CATEGORIES.find(c => c.value === joke.category)?.color}`}>
                      {categoryLabels[joke.category]}
                    </span>
                    <span className="text-sm text-ivory/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(joke.estimatedDuration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleCopy(joke.id)}
                      className="p-2 rounded-lg hover:bg-white/10"
                      title="复制段子"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/jokes/${joke.id}`)}
                      className="p-2 rounded-lg hover:bg-white/10"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(joke.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-ivory mb-4">
                  {joke.title}
                </h3>

                <div className="space-y-3">
                  <div className="border-l-2 border-blue-500/50 pl-4">
                    <p className="text-xs text-blue-400/60 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Setup
                    </p>
                    <p className="text-sm text-ivory/80 line-clamp-2">{joke.setup}</p>
                  </div>

                  <div className="border-l-2 border-spotlight-gold/50 pl-4">
                    <p className="text-xs text-spotlight-gold/80 mb-1 flex items-center gap-1">
                      ⭐ Punchline
                    </p>
                    <p className="text-sm text-spotlight-gold/90 line-clamp-2">{joke.punchline}</p>
                  </div>

                  {joke.tag && (
                    <div className="border-l-2 border-gray-500/50 pl-4">
                      <p className="text-xs text-ivory/40 mb-1">Tag</p>
                      <p className="text-sm text-ivory/60 line-clamp-1">{joke.tag}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                  <span className="text-xs text-ivory/40">
                    {formatDate(joke.updatedAt)}
                  </span>
                  {joke.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {joke.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-ivory/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
