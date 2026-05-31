import { useState } from 'react';
import {
  Target,
  Plus,
  ChevronRight,
  Mountain,
  Footprints,
  Waves,
  Lock,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  X,
  Edit2,
} from 'lucide-react';
import { useProgressStore } from '@/stores/useProgressStore';
import { Skill, SportType } from '@/types';
import { formatDateShort, daysBetween } from '@/utils/dateUtils';
import { useForm } from 'react-hook-form';

interface SkillFormData {
  sportType: string;
  category: string;
  skillName: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  trainingSessions: number;
  prerequisites: string;
  isUnlocked: boolean;
}

export default function SkillsPage() {
  const { skills, addSkill, updateSkill } = useProgressStore();
  const [activeSport, setActiveSport] = useState<SportType>('climbing');
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const filteredSkills = skills.filter((s) => s.sportType === activeSport);
  const categories = [...new Set(filteredSkills.map((s) => s.category))];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SkillFormData>({
    defaultValues: {
      sportType: activeSport,
      category: '',
      skillName: '',
      description: '',
      currentLevel: 1,
      maxLevel: 5,
      trainingSessions: 0,
      prerequisites: '',
      isUnlocked: true,
    },
  });

  const openEditForm = (skill: Skill) => {
    setEditingSkill(skill);
    setValue('sportType', skill.sportType);
    setValue('category', skill.category);
    setValue('skillName', skill.skillName);
    setValue('description', skill.description);
    setValue('currentLevel', skill.currentLevel);
    setValue('maxLevel', skill.maxLevel);
    setValue('trainingSessions', skill.trainingSessions);
    setValue('prerequisites', skill.prerequisites.join(', '));
    setValue('isUnlocked', skill.isUnlocked);
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingSkill(null);
    reset({
      sportType: activeSport,
      category: categories[0] || '',
      skillName: '',
      description: '',
      currentLevel: 1,
      maxLevel: 5,
      trainingSessions: 0,
      prerequisites: '',
      isUnlocked: true,
    });
    setShowForm(true);
  };

  const onSubmit = (data: SkillFormData) => {
    const skillData = {
      sportType: data.sportType as SportType,
      category: data.category,
      skillName: data.skillName,
      description: data.description,
      currentLevel: data.currentLevel,
      maxLevel: data.maxLevel,
      progressPercent: Math.round((data.currentLevel / data.maxLevel) * 100),
      trainingSessions: data.trainingSessions,
      prerequisites: data.prerequisites.split(',').map((p) => p.trim()).filter(Boolean),
      isUnlocked: data.isUnlocked,
    };

    if (editingSkill) {
      updateSkill(editingSkill.id, skillData);
    } else {
      addSkill(skillData);
    }

    setShowForm(false);
    setEditingSkill(null);
  };

  const sportTabs: { type: SportType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'climbing', label: '攀岩', icon: <Mountain size={18} />, color: 'primary' },
    { type: 'skateboarding', label: '滑板', icon: <Footprints size={18} />, color: 'skate' },
    { type: 'surfing', label: '冲浪', icon: <Waves size={18} />, color: 'surfing' },
  ];

  const masteredCount = filteredSkills.filter((s) => s.progressPercent === 100).length;
  const totalProgress = filteredSkills.length > 0
    ? Math.round(filteredSkills.reduce((sum, s) => sum + s.progressPercent, 0) / filteredSkills.length)
    : 0;

  const SkillCard = ({ skill }: { skill: Skill }) => (
    <div
      className={`bg-dark-700/50 rounded-xl p-5 hover:bg-dark-700 transition-colors ${
        !skill.isUnlocked ? 'opacity-60' : ''
      }`}
      onClick={() => skill.isUnlocked && setSelectedSkill(skill)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              skill.progressPercent === 100
                ? 'bg-success-500/20'
                : skill.isUnlocked
                ? `bg-${sportTabs.find((t) => t.type === skill.sportType)?.color}-500/20`
                : 'bg-dark-600'
            }`}
          >
            {skill.progressPercent === 100 ? (
              <CheckCircle className="text-success-400" size={20} />
            ) : skill.isUnlocked ? (
              <Star className="text-primary-400" size={20} />
            ) : (
              <Lock className="text-dark-400" size={20} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              {skill.skillName}
              {!skill.isUnlocked && <Lock size={14} className="text-dark-500" />}
            </h3>
            <span className="text-sm text-dark-400">{skill.category}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openEditForm(skill);
          }}
          className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
        >
          <Edit2 size={14} className="text-dark-400" />
        </button>
      </div>

      <p className="text-sm text-dark-300 mb-3 line-clamp-2">{skill.description}</p>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-dark-400">进度</span>
          <span className="text-white font-medium">
            {skill.currentLevel}/{skill.maxLevel} ({skill.progressPercent}%)
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${
              skill.progressPercent === 100
                ? 'bg-gradient-to-r from-success-600 to-success-400'
                : ''
            }`}
            style={{ width: `${skill.progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-dark-400">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {skill.trainingSessions} 次训练
        </span>
        {skill.masteryDate && (
          <span className="text-success-400">
            已掌握 ({formatDateShort(skill.masteryDate)})
          </span>
        )}
        {skill.firstAttemptDate && !skill.masteryDate && (
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />
            学习中 ({daysBetween(skill.firstAttemptDate, new Date().toISOString())}天)
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-secondary-400">进阶追踪</span>
            <ChevronRight size={14} />
            <span className="text-white">技能等级</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="text-secondary-500" size={28} />
            技能等级追踪
          </h1>
          <p className="text-dark-400 mt-1">追踪你的技能提升历程</p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          添加技能
        </button>
      </div>

      <div className="flex gap-2">
        {sportTabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveSport(tab.type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeSport === tab.type
                ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center">
              <Target className="text-secondary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{filteredSkills.length}</p>
          <p className="text-sm text-dark-400">总技能数</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{masteredCount}</p>
          <p className="text-sm text-dark-400">已掌握</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalProgress}%</p>
          <p className="text-sm text-dark-400">平均进度</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-skate-500/20 rounded-xl flex items-center justify-center">
              <Clock className="text-skate-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {filteredSkills.reduce((sum, s) => sum + s.trainingSessions, 0)}
          </p>
          <p className="text-sm text-dark-400">总训练次数</p>
        </div>
      </div>

      {categories.map((category) => {
        const categorySkills = filteredSkills.filter((s) => s.category === category);
        if (categorySkills.length === 0) return null;

        return (
          <div key={category} className="card">
            <h2 className="text-lg font-semibold text-white mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        );
      })}

      {filteredSkills.length === 0 && (
        <div className="card text-center py-12">
          <Target className="mx-auto text-dark-600 mb-4" size={48} />
          <p className="text-dark-400 mb-4">还没有技能记录</p>
          <button onClick={openAddForm} className="btn-primary">
            添加第一个技能
          </button>
        </div>
      )}

      {selectedSkill && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSkill(null)}
        >
          <div
            className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{selectedSkill.skillName}</h2>
              <button
                onClick={() => setSelectedSkill(null)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className="badge badge-secondary">{selectedSkill.category}</span>
                {selectedSkill.progressPercent === 100 && (
                  <span className="badge badge-success">已掌握</span>
                )}
                {!selectedSkill.isUnlocked && (
                  <span className="badge bg-dark-600 text-dark-400">未解锁</span>
                )}
              </div>

              <p className="text-dark-300">{selectedSkill.description}</p>

              <div>
                <p className="text-sm text-dark-400 mb-2">技能进度</p>
                <div className="progress-bar h-3">
                  <div
                    className={`progress-fill ${
                      selectedSkill.progressPercent === 100
                        ? 'bg-gradient-to-r from-success-600 to-success-400'
                        : ''
                    }`}
                    style={{ width: `${selectedSkill.progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-right text-white font-semibold mt-1">
                  等级 {selectedSkill.currentLevel} / {selectedSkill.maxLevel}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1">训练次数</p>
                  <p className="text-white font-medium">{selectedSkill.trainingSessions} 次</p>
                </div>
                {selectedSkill.firstAttemptDate && (
                  <div className="bg-dark-700/50 rounded-xl p-4">
                    <p className="text-xs text-dark-400 mb-1">首次尝试</p>
                    <p className="text-white font-medium">
                      {formatDateShort(selectedSkill.firstAttemptDate)}
                    </p>
                  </div>
                )}
              </div>

              {selectedSkill.prerequisites.length > 0 && (
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-2">前置技能</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.prerequisites.map((prereq, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-dark-600 rounded-lg text-sm text-dark-200"
                      >
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingSkill ? '编辑技能' : '添加技能'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingSkill(null);
                }}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">运动类型</label>
                  <select {...register('sportType')} className="input-field">
                    <option value="climbing">攀岩</option>
                    <option value="skateboarding">滑板</option>
                    <option value="surfing">冲浪</option>
                  </select>
                </div>
                <div>
                  <label className="label">分类</label>
                  <input
                    {...register('category', { required: '请输入分类' })}
                    type="text"
                    className="input-field"
                    placeholder="例如：基础技术、进阶技术"
                  />
                  {errors.category && (
                    <p className="text-danger-400 text-sm mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">技能名称</label>
                <input
                  {...register('skillName', { required: '请输入技能名称' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：动态移动、Ollie、Cutback"
                />
                {errors.skillName && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.skillName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">描述</label>
                <textarea
                  {...register('description', { required: '请输入描述' })}
                  className="input-field h-20 resize-none"
                  placeholder="描述这个技能的内容..."
                />
                {errors.description && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    当前等级:{' '}
                    <span className="text-primary-400">{getValues('currentLevel')}</span>
                  </label>
                  <input
                    {...register('currentLevel', { min: 0, max: getValues('maxLevel') })}
                    type="range"
                    min="0"
                    max={getValues('maxLevel') || 5}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="label">最高等级</label>
                  <select {...register('maxLevel')} className="input-field">
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                  </select>
                </div>
                <div>
                  <label className="label">训练次数</label>
                  <input
                    {...register('trainingSessions', { min: 0 })}
                    type="number"
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="label">前置技能 (逗号分隔)</label>
                <input
                  {...register('prerequisites')}
                  type="text"
                  className="input-field"
                  placeholder="例如：脚法控制, 平衡技巧"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  {...register('isUnlocked')}
                  type="checkbox"
                  id="isUnlocked"
                  className="w-4 h-4 rounded bg-dark-700 border-dark-600"
                />
                <label htmlFor="isUnlocked" className="text-dark-300 text-sm">
                  已解锁此技能
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSkill(null);
                  }}
                  className="btn-outline flex-1"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingSkill ? '保存修改' : '添加技能'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
