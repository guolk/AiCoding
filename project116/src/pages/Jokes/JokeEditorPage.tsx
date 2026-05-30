import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Clock, History, GitCompare, Trash2, Check } from 'lucide-react';
import { useJokes } from '../../context/JokeContext';
import { useMaterials } from '../../context/MaterialContext';
import { Joke, JokeVersion, MATERIAL_CATEGORIES, MaterialCategory } from '../../types';
import { formatDateTime, formatDuration } from '../../utils/duration';

interface JokeFormData {
  title: string;
  setup: string;
  punchline: string;
  tag: string;
  category: MaterialCategory;
  tags: string;
  estimatedDuration: number;
}

const initialFormData: JokeFormData = {
  title: '',
  setup: '',
  punchline: '',
  tag: '',
  category: 'personal',
  tags: '',
  estimatedDuration: 60,
};

export default function JokeEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { jokes, addJoke, updateJoke, getJokeVersions, deleteJoke } = useJokes();
  const { materials } = useMaterials();

  const [formData, setFormData] = useState<JokeFormData>(initialFormData);
  const [changeReason, setChangeReason] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'versions' | 'compare'>('editor');
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const isEdit = id && id !== 'new';
  const joke = isEdit ? jokes.find(j => j.id === id) : null;
  const versions = isEdit ? getJokeVersions(id!) : [];

  useEffect(() => {
    if (joke) {
      setFormData({
        title: joke.title,
        setup: joke.setup,
        punchline: joke.punchline,
        tag: joke.tag,
        category: joke.category,
        tags: joke.tags.join(', '),
        estimatedDuration: joke.estimatedDuration,
      });
    }
  }, [joke]);

  useEffect(() => {
    const fromMaterial = (location.state as any)?.fromMaterial;
    if (fromMaterial && !isEdit) {
      setFormData(prev => ({
        ...prev,
        title: fromMaterial.content.slice(0, 30) + '...',
        setup: fromMaterial.content,
        category: fromMaterial.category,
        tags: fromMaterial.tags.join(', '),
      }));
    }
  }, [location.state, isEdit]);

  const [saveError, setSaveError] = useState<string>('');

  const handleSave = () => {
    setSaveError('');
    setSaved(false);
    
    if (!formData.title.trim()) {
      setSaveError('请填写段子标题');
      return;
    }
    if (!formData.setup.trim()) {
      setSaveError('请填写 Setup（铺垫）');
      return;
    }
    if (!formData.punchline.trim()) {
      setSaveError('请填写 Punchline（包袱）');
      return;
    }

    try {
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      if (isEdit && joke) {
        const hasContentChanged = 
          joke.setup !== formData.setup ||
          joke.punchline !== formData.punchline ||
          joke.tag !== formData.tag;

        updateJoke(
          joke.id,
          {
            title: formData.title,
            setup: formData.setup,
            punchline: formData.punchline,
            tag: formData.tag,
            category: formData.category,
            tags,
            estimatedDuration: formData.estimatedDuration,
          },
          hasContentChanged && changeReason.trim() ? changeReason.trim() : undefined
        );
        
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setSaveError('');
      } else {
        const newId = addJoke({
          title: formData.title,
          setup: formData.setup,
          punchline: formData.punchline,
          tag: formData.tag,
          category: formData.category,
          tags,
          estimatedDuration: formData.estimatedDuration,
        });
        
        setSaved(true);
        setSaveError('');
        navigate(`/jokes/${newId}`);
      }
    } catch (error) {
      console.error('保存段子失败:', error);
      setSaveError('保存失败，请重试');
      setSaved(false);
    }
  };

  const handleDelete = () => {
    if (joke) {
      deleteJoke(joke.id);
      navigate('/jokes');
    }
  };

  const currentTotalLength = formData.setup.length + formData.punchline.length + formData.tag.length;
  const estimatedSeconds = Math.ceil(currentTotalLength / 8);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/jokes')}
            className="flex items-center gap-2 text-ivory/60 hover:text-ivory transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回段子库</span>
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-green-400 animate-bounce-in">
              <Check className="w-5 h-5" />
              <span>已保存</span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-ivory mb-2">
              {isEdit ? '编辑段子' : '创作新段子'}
            </h1>
            <p className="text-ivory/60">Setup → Punchline → Tag，经典三段式结构</p>
          </div>
          <div className="flex items-center gap-3">
            {saveError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                {saveError}
              </div>
            )}
            {isEdit && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>保存段子</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'editor'
                ? 'bg-stage-red text-white'
                : 'bg-white/5 text-ivory/60 hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>编辑器</span>
          </button>
          {isEdit && (
            <>
              <button
                onClick={() => setActiveTab('versions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'versions'
                    ? 'bg-stage-red text-white'
                    : 'bg-white/5 text-ivory/60 hover:bg-white/10'
                }`}
              >
                <History className="w-4 h-4" />
                <span>版本历史 ({versions.length})</span>
              </button>
              {versions.length >= 2 && (
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === 'compare'
                      ? 'bg-stage-red text-white'
                      : 'bg-white/5 text-ivory/60 hover:bg-white/10'
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                  <span>版本对比</span>
                </button>
              )}
            </>
          )}
        </div>

        {activeTab === 'editor' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <label className="label">段子标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="给你的段子起个名字"
                  className="input"
                />
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="label mb-0">分类</label>
                  <div className="flex items-center gap-2 text-sm text-ivory/40">
                    <Clock className="w-4 h-4" />
                    <span>预计 {formatDuration(formData.estimatedDuration)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MATERIAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.category === cat.value
                          ? `${cat.color} text-white`
                          : 'bg-white/5 text-ivory/60 hover:bg-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-blue-500/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-blue-400">Setup</h3>
                </div>
                <span className="text-xs text-ivory/40">{formData.setup.length} 字</span>
              </div>
              <p className="text-sm text-ivory/40 mb-3">
                设置场景和前提，建立观众的预期
              </p>
              <textarea
                value={formData.setup}
                onChange={(e) => setFormData(prev => ({ ...prev, setup: e.target.value }))}
                placeholder="例如：我妈最近学会了用微信，她现在最大的爱好就是每天给我发各种养生文章。我跟她说：妈，我还年轻，不需要养生。你们猜她怎么说？"
                rows={4}
                className="input resize-y font-mono text-base"
              />
            </div>

            <div className="card p-6 border-l-4 border-spotlight-gold/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-spotlight-gold/20 flex items-center justify-center">
                    <span className="text-lg">⭐</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-spotlight-gold">Punchline</h3>
                </div>
                <span className="text-xs text-ivory/40">{formData.punchline.length} 字</span>
              </div>
              <p className="text-sm text-ivory/40 mb-3">
                打破预期，抖出包袱，这是笑点的核心
              </p>
              <textarea
                value={formData.punchline}
                onChange={(e) => setFormData(prev => ({ ...prev, punchline: e.target.value }))}
                placeholder="例如：她看了我一眼说：那你每天熬夜到三点是什么意思？修仙啊？"
                rows={3}
                className="input resize-y font-mono text-base text-spotlight-gold/90"
              />
            </div>

            <div className="card p-6 border-l-4 border-gray-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
                    <span className="text-lg">💭</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-ivory/70">Tag</h3>
                </div>
                <span className="text-xs text-ivory/40">{formData.tag.length} 字</span>
              </div>
              <p className="text-sm text-ivory/40 mb-3">
                追加一句，延伸笑点或加深印象（可选）
              </p>
              <textarea
                value={formData.tag}
                onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                placeholder="例如：所以现在我开始怀疑，我妈可能比我更懂我自己的身体。"
                rows={2}
                className="input resize-y font-mono text-base"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <label className="label">标签（用逗号分隔）</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="例如: 妈妈, 微信, 代沟"
                  className="input"
                />
              </div>

              <div className="card p-6">
                <label className="label">预计时长（秒）</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="15"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="font-mono text-lg text-spotlight-gold min-w-[80px] text-right">
                    {formatDuration(formData.estimatedDuration)}
                  </span>
                </div>
                <p className="text-xs text-ivory/40 mt-2">
                  根据字数估算约 {formatDuration(estimatedSeconds)}
                </p>
              </div>
            </div>

            {isEdit && (
              <div className="card p-6 border-dashed border-2 border-spotlight-gold/30">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-5 h-5 text-spotlight-gold" />
                  <h3 className="font-display text-lg font-bold text-ivory">保存新版本</h3>
                </div>
                <p className="text-sm text-ivory/40 mb-3">
                  填写修改原因可以创建新版本快照，方便后续对比
                </p>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="例如：调整了Punchline的节奏，增加了停顿；修改了Setup，让铺垫更自然..."
                  rows={2}
                  className="input resize-y"
                />
              </div>
            )}

            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-ivory mb-4">预览</h3>
              <div className="bg-theater-darker rounded-xl p-6 font-body">
                <h4 className="font-display text-xl font-bold text-ivory mb-4">
                  {formData.title || '（未命名段子）'}
                </h4>
                <div className="space-y-4 text-ivory/90 leading-relaxed">
                  {formData.setup && (
                    <p className="text-lg">{formData.setup}</p>
                  )}
                  {formData.punchline && (
                    <p className="text-lg text-spotlight-gold font-semibold">
                      {formData.punchline}
                    </p>
                  )}
                  {formData.tag && (
                    <p className="text-base text-ivory/60 italic">
                      {formData.tag}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'versions' && versions.length > 0 && (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div key={version.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stage-red/20 flex items-center justify-center">
                      <span className="font-display font-bold text-stage-red">
                        v{version.versionNumber}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-ivory">
                        {index === 0 ? '当前版本' : `版本 ${version.versionNumber}`}
                      </p>
                      <p className="text-sm text-ivory/40">
                        {formatDateTime(version.createdAt)}
                      </p>
                    </div>
                  </div>
                  {versions.length >= 2 && (
                    <button
                      onClick={() => {
                        setCompareVersionId(version.id);
                        setActiveTab('compare');
                      }}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      对比当前版本
                    </button>
                  )}
                </div>

                {version.changeReason && (
                  <div className="mb-4 p-3 bg-spotlight-gold/10 rounded-lg border border-spotlight-gold/20">
                    <p className="text-sm text-spotlight-gold/90">
                      <span className="font-semibold">改动原因：</span>
                      {version.changeReason}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-xs text-blue-400/60">Setup</p>
                    <p className="text-sm text-ivory/80 bg-white/5 p-3 rounded-lg">
                      {version.setup}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-spotlight-gold/80">Punchline</p>
                    <p className="text-sm text-spotlight-gold/90 bg-white/5 p-3 rounded-lg">
                      {version.punchline}
                    </p>
                  </div>
                </div>

                {version.tag && (
                  <div className="mt-3">
                    <p className="text-xs text-ivory/40 mb-2">Tag</p>
                    <p className="text-sm text-ivory/60 bg-white/5 p-3 rounded-lg">
                      {version.tag}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'versions' && versions.length === 0 && (
          <div className="card p-12 text-center">
            <History className="w-16 h-16 mx-auto mb-4 text-ivory/20" />
            <h3 className="font-display text-xl font-bold text-ivory/60 mb-2">
              还没有版本历史
            </h3>
            <p className="text-ivory/40">保存时填写改动原因即可创建版本快照</p>
          </div>
        )}

        {activeTab === 'compare' && joke && (
          <div className="space-y-6">
            <div className="card p-4">
              <label className="label">选择对比版本</label>
              <select
                value={compareVersionId || ''}
                onChange={(e) => setCompareVersionId(e.target.value || null)}
                className="input"
              >
                <option value="">请选择版本...</option>
                {versions.filter(v => v.versionNumber > 1).map(v => (
                  <option key={v.id} value={v.id}>
                    版本 {v.versionNumber} - {formatDateTime(v.createdAt)}
                  </option>
                ))}
              </select>
            </div>

            {compareVersionId && (() => {
              const compareVersion = versions.find(v => v.id === compareVersionId);
              if (!compareVersion) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-center text-ivory/60 mb-4 font-display">
                        版本 {compareVersion.versionNumber}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-blue-400/60 mb-2">Setup</p>
                          <p className="text-sm text-ivory/80 bg-white/5 p-4 rounded-lg whitespace-pre-wrap">
                            {compareVersion.setup}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-spotlight-gold/80 mb-2">Punchline</p>
                          <p className="text-sm text-spotlight-gold/90 bg-white/5 p-4 rounded-lg whitespace-pre-wrap">
                            {compareVersion.punchline}
                          </p>
                        </div>
                        {compareVersion.tag && (
                          <div>
                            <p className="text-xs text-ivory/40 mb-2">Tag</p>
                            <p className="text-sm text-ivory/60 bg-white/5 p-4 rounded-lg whitespace-pre-wrap">
                              {compareVersion.tag}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-center text-spotlight-gold mb-4 font-display">
                        当前版本
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-blue-400/60 mb-2">Setup</p>
                          <p className="text-sm text-ivory/80 bg-spotlight-gold/5 p-4 rounded-lg border border-spotlight-gold/20 whitespace-pre-wrap">
                            {joke.setup}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-spotlight-gold/80 mb-2">Punchline</p>
                          <p className="text-sm text-spotlight-gold/90 bg-spotlight-gold/5 p-4 rounded-lg border border-spotlight-gold/20 whitespace-pre-wrap">
                            {joke.punchline}
                          </p>
                        </div>
                        {joke.tag && (
                          <div>
                            <p className="text-xs text-ivory/40 mb-2">Tag</p>
                            <p className="text-sm text-ivory/60 bg-spotlight-gold/5 p-4 rounded-lg border border-spotlight-gold/20 whitespace-pre-wrap">
                              {joke.tag}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {!compareVersionId && (
              <div className="card p-12 text-center">
                <GitCompare className="w-16 h-16 mx-auto mb-4 text-ivory/20" />
                <h3 className="font-display text-xl font-bold text-ivory/60 mb-2">
                  选择版本进行对比
                </h3>
                <p className="text-ivory/40">从上方下拉框选择要对比的历史版本</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-md bg-theater-dark rounded-2xl p-6 border border-white/10">
            <h3 className="font-display text-xl font-bold text-ivory mb-4">
              确认删除？
            </h3>
            <p className="text-ivory/60 mb-6">
              删除这个段子将同时删除其所有版本历史，此操作无法撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2.5 rounded-xl text-ivory/60 hover:bg-white/5 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
