import { useState } from 'react';
import {
  Users,
  Plus,
  ChevronRight,
  Mountain,
  Footprints,
  Waves,
  Trophy,
  MessageCircle,
  Target,
  CheckCircle,
  Star,
  TrendingUp,
  X,
  Edit2,
  Trash2,
  Award,
  Flame,
  Zap,
} from 'lucide-react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Partner, SportType } from '@/types';
import { formatDateShort, getRelativeTime } from '@/utils/dateUtils';
import { useForm } from 'react-hook-form';

interface PartnerFormData {
  name: string;
  nickname: string;
  avatar: string;
  phone: string;
  email: string;
  primarySport: string;
  skillLevel: string;
  achievements: string;
  notes: string;
}

const avatarColors = [
  'bg-primary-500',
  'bg-skate-500',
  'bg-surfing-500',
  'bg-secondary-500',
  'bg-success-500',
  'bg-warning-500',
  'bg-info-500',
  'bg-danger-500',
];

export default function PartnersPage() {
  const {
    partners,
    addPartner,
    updatePartner,
    deletePartner,
    addPartnerProgress,
    sendMotivation,
  } = useCommunityStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [filter, setFilter] = useState<'all' | SportType>('all');

  const filteredPartners =
    filter === 'all'
      ? partners
      : partners.filter((p) => p.primarySport === filter);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PartnerFormData>({
    defaultValues: {
      name: '',
      nickname: '',
      avatar: '',
      phone: '',
      email: '',
      primarySport: 'climbing',
      skillLevel: 'intermediate',
      achievements: '',
      notes: '',
    },
  });

  const openEditForm = (partner: Partner) => {
    setEditingId(partner.id);
    setValue('name', partner.name);
    setValue('nickname', partner.nickname);
    setValue('avatar', partner.avatar || '');
    setValue('phone', partner.phone);
    setValue('email', partner.email || '');
    setValue('primarySport', partner.primarySport);
    setValue('skillLevel', partner.skillLevel);
    setValue('achievements', partner.achievements.join('\n'));
    setValue('notes', partner.notes || '');
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingId(null);
    reset({
      name: '',
      nickname: '',
      avatar: '',
      phone: '',
      email: '',
      primarySport: 'climbing',
      skillLevel: 'intermediate',
      achievements: '',
      notes: '',
    });
    setShowForm(true);
  };

  const onSubmit = (data: PartnerFormData) => {
    const achievements = data.achievements
      .split('\n')
      .filter((line) => line.trim());

    const partnerData = {
      name: data.name,
      nickname: data.nickname,
      avatar: data.avatar || undefined,
      phone: data.phone,
      email: data.email || undefined,
      primarySport: data.primarySport as SportType,
      skillLevel: data.skillLevel as Partner['skillLevel'],
      achievements,
      notes: data.notes || undefined,
    };

    if (editingId) {
      updatePartner(editingId, partnerData);
    } else {
      addPartner(partnerData);
    }

    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此伙伴吗？')) {
      deletePartner(id);
    }
  };

  const handleSendMotivation = (partnerId: string, partnerName: string) => {
    const messages = [
      `太棒了！${partnerName}，继续保持！`,
      `你是最棒的，下一次训练见！`,
      `加油！我们一起进步！`,
      `厉害！你的进步我都看在眼里！`,
      `一起挑战更高难度吧！`,
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    sendMotivation(partnerId, message);
    if (selectedPartner) {
      const updatedPartner = partners.find((p) => p.id === partnerId);
      if (updatedPartner) {
        setSelectedPartner(updatedPartner);
      }
    }
  };

  const sportIcons: Record<SportType, React.ReactNode> = {
    climbing: <Mountain size={18} />,
    skateboarding: <Footprints size={18} />,
    surfing: <Waves size={18} />,
  };

  const sportLabels: Record<SportType, string> = {
    climbing: '攀岩',
    skateboarding: '滑板',
    surfing: '冲浪',
  };

  const skillLevelLabels: Record<string, string> = {
    beginner: '新手',
    intermediate: '进阶',
    advanced: '高手',
    pro: '专业',
  };

  const skillLevelColors: Record<string, string> = {
    beginner: 'bg-success-500/20 text-success-400',
    intermediate: 'bg-primary-500/20 text-primary-400',
    advanced: 'bg-skate-500/20 text-skate-400',
    pro: 'bg-warning-500/20 text-warning-400',
  };

  const PartnerCard = ({ partner }: { partner: Partner }) => {
    const avatarColor = partner.avatar || avatarColors[Math.floor(Math.random() * avatarColors.length)];

    return (
      <div
        className="card hover:border-primary-500/30 transition-colors cursor-pointer"
        onClick={() => setSelectedPartner(partner)}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 ${avatarColor.replace(
              'bg-',
              'bg-'
            )}`}
          >
            {partner.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate">{partner.name}</h3>
              {partner.nickname && (
                <span className="text-sm text-dark-400">@{partner.nickname}</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`badge flex items-center gap-1 ${
                  partner.primarySport === 'climbing'
                    ? 'bg-primary-500/20 text-primary-400'
                    : partner.primarySport === 'skateboarding'
                    ? 'bg-skate-500/20 text-skate-400'
                    : 'bg-surfing-500/20 text-surfing-400'
                }`}
              >
                {sportIcons[partner.primarySport]}
                {sportLabels[partner.primarySport]}
              </span>
              <span
                className={`badge ${skillLevelColors[partner.skillLevel]}`}
              >
                {skillLevelLabels[partner.skillLevel]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSendMotivation(partner.id, partner.name);
              }}
              className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
              title="发送鼓励"
            >
              <MessageCircle size={16} className="text-primary-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditForm(partner);
              }}
              className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <Edit2 size={14} className="text-dark-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(partner.id);
              }}
              className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <Trash2 size={14} className="text-danger-400" />
            </button>
          </div>
        </div>

        {partner.achievements.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-700">
            <p className="text-xs text-dark-400 mb-2">近期成就</p>
            <div className="flex flex-wrap gap-2">
              {partner.achievements.slice(0, 3).map((achievement, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-dark-700 text-dark-300 px-2 py-1 rounded-lg flex items-center gap-1"
                >
                  <Trophy size={10} className="text-warning-400" />
                  {achievement}
                </span>
              ))}
              {partner.achievements.length > 3 && (
                <span className="text-xs text-dark-500 py-1">
                  +{partner.achievements.length - 3} 个更多
                </span>
              )}
            </div>
          </div>
        )}

        {partner.progressHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-dark-400">
                <TrendingUp size={14} />
                <span>训练次数</span>
              </div>
              <span className="text-white font-medium">
                {partner.progressHistory.length} 次
              </span>
            </div>
          </div>
        )}

        {partner.motivations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-700">
            <p className="text-xs text-dark-400 mb-2">最近互动</p>
            <p className="text-sm text-primary-300 italic">
              "{partner.motivations[partner.motivations.length - 1].message}"
            </p>
            <p className="text-xs text-dark-500 mt-1">
              {getRelativeTime(partner.motivations[partner.motivations.length - 1].sentAt)}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-skate-400">社群挑战</span>
            <ChevronRight size={14} />
            <span className="text-white">训练伙伴</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-skate-500" size={28} />
            训练伙伴
          </h1>
          <p className="text-dark-400 mt-1">与伙伴一起训练，互相激励，共同进步</p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          添加伙伴
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { type: 'all' as const, label: '全部', icon: <Users size={16} /> },
          { type: 'climbing' as const, label: '攀岩', icon: <Mountain size={16} /> },
          { type: 'skateboarding' as const, label: '滑板', icon: <Footprints size={16} /> },
          { type: 'surfing' as const, label: '冲浪', icon: <Waves size={16} /> },
        ].map((tab) => (
          <button
            key={tab.type}
            onClick={() => setFilter(tab.type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              filter === tab.type
                ? 'bg-skate-500/20 text-skate-400 border border-skate-500/30'
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
            <div className="w-10 h-10 bg-skate-500/20 rounded-xl flex items-center justify-center">
              <Users className="text-skate-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{partners.length}</p>
          <p className="text-sm text-dark-400">总伙伴数</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Mountain className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {partners.filter((p) => p.primarySport === 'climbing').length}
          </p>
          <p className="text-sm text-dark-400">攀岩伙伴</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-skate-500/20 rounded-xl flex items-center justify-center">
              <Footprints className="text-skate-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {partners.filter((p) => p.primarySport === 'skateboarding').length}
          </p>
          <p className="text-sm text-dark-400">滑板伙伴</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-surfing-500/20 rounded-xl flex items-center justify-center">
              <Waves className="text-surfing-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {partners.filter((p) => p.primarySport === 'surfing').length}
          </p>
          <p className="text-sm text-dark-400">冲浪伙伴</p>
        </div>
      </div>

      {filteredPartners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Users className="mx-auto text-dark-600 mb-4" size={48} />
          <p className="text-dark-400 mb-2">还没有添加训练伙伴</p>
          <p className="text-dark-500 text-sm mb-4">
            与伙伴一起训练会更有动力！
          </p>
          <button onClick={openAddForm} className="btn-primary">
            添加第一个伙伴
          </button>
        </div>
      )}

      {selectedPartner && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPartner(null)}
        >
          <div
            className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {selectedPartner.name}
              </h2>
              <button
                onClick={() => setSelectedPartner(null)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold ${
                    selectedPartner.avatar || avatarColors[0]
                  }`}
                >
                  {selectedPartner.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {selectedPartner.name}
                  </h3>
                  {selectedPartner.nickname && (
                    <p className="text-dark-400">@{selectedPartner.nickname}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`badge flex items-center gap-1 ${
                        selectedPartner.primarySport === 'climbing'
                          ? 'bg-primary-500/20 text-primary-400'
                          : selectedPartner.primarySport === 'skateboarding'
                          ? 'bg-skate-500/20 text-skate-400'
                          : 'bg-surfing-500/20 text-surfing-400'
                      }`}
                    >
                      {sportIcons[selectedPartner.primarySport]}
                      {sportLabels[selectedPartner.primarySport]}
                    </span>
                    <span
                      className={`badge ${skillLevelColors[selectedPartner.skillLevel]}`}
                    >
                      {skillLevelLabels[selectedPartner.skillLevel]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1">电话</p>
                  <p className="text-white font-medium">
                    {selectedPartner.phone || '-'}
                  </p>
                </div>
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1">邮箱</p>
                  <p className="text-white font-medium truncate">
                    {selectedPartner.email || '-'}
                  </p>
                </div>
              </div>

              {selectedPartner.achievements.length > 0 && (
                <div>
                  <p className="text-sm text-dark-400 mb-3 flex items-center gap-2">
                    <Trophy size={16} className="text-warning-400" />
                    成就记录
                  </p>
                  <div className="space-y-2">
                    {selectedPartner.achievements.map((achievement, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg"
                      >
                        <Star size={16} className="text-warning-400 shrink-0" />
                        <span className="text-white text-sm">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPartner.progressHistory.length > 0 && (
                <div>
                  <p className="text-sm text-dark-400 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-success-400" />
                    训练记录
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {[...selectedPartner.progressHistory]
                      .reverse()
                      .slice(0, 5)
                      .map((progress, idx) => (
                        <div
                          key={progress.id}
                          className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg"
                        >
                          <span className="text-white text-sm">{progress.activity}</span>
                          <span className="text-dark-400 text-xs">
                            {formatDateShort(progress.date)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedPartner.motivations.length > 0 && (
                <div>
                  <p className="text-sm text-dark-400 mb-3 flex items-center gap-2">
                    <MessageCircle size={16} className="text-primary-400" />
                    互动记录
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {[...selectedPartner.motivations]
                      .reverse()
                      .slice(0, 5)
                      .map((motivation, idx) => (
                        <div
                          key={motivation.id}
                          className="p-3 bg-primary-500/10 rounded-lg"
                        >
                          <p className="text-primary-300 text-sm italic">
                            "{motivation.message}"
                          </p>
                          <p className="text-dark-500 text-xs mt-1">
                            {getRelativeTime(motivation.sentAt)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedPartner.notes && (
                <div>
                  <p className="text-sm text-dark-400 mb-2">备注</p>
                  <p className="text-dark-300 text-sm bg-dark-700/50 p-3 rounded-lg">
                    {selectedPartner.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleSendMotivation(selectedPartner.id, selectedPartner.name)
                  }
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Zap size={16} />
                  发送鼓励
                </button>
                <button
                  onClick={() => {
                    setSelectedPartner(null);
                    openEditForm(selectedPartner);
                  }}
                  className="btn-outline flex-1"
                >
                  编辑信息
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingId ? '编辑伙伴' : '添加伙伴'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">姓名</label>
                  <input
                    {...register('name', { required: '请输入姓名' })}
                    type="text"
                    className="input-field"
                    placeholder="张三"
                  />
                  {errors.name && (
                    <p className="text-danger-400 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">昵称</label>
                  <input
                    {...register('nickname')}
                    type="text"
                    className="input-field"
                    placeholder="ClimberPro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">电话</label>
                  <input
                    {...register('phone', { required: '请输入电话' })}
                    type="tel"
                    className="input-field"
                    placeholder="138xxxx8888"
                  />
                  {errors.phone && (
                    <p className="text-danger-400 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">邮箱</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input-field"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">主要运动</label>
                  <select {...register('primarySport')} className="input-field">
                    <option value="climbing">攀岩</option>
                    <option value="skateboarding">滑板</option>
                    <option value="surfing">冲浪</option>
                  </select>
                </div>
                <div>
                  <label className="label">技能等级</label>
                  <select {...register('skillLevel')} className="input-field">
                    <option value="beginner">新手</option>
                    <option value="intermediate">进阶</option>
                    <option value="advanced">高手</option>
                    <option value="pro">专业</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">头像颜色</label>
                <div className="flex gap-2">
                  {avatarColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('avatar', color)}
                      className={`w-10 h-10 rounded-xl ${color} transition-transform ${
                        errors.avatar === undefined &&
                        (!errors || !errors.avatar) &&
                        !errors.avatar
                          ? 'ring-2 ring-offset-2 ring-offset-dark-900 ring-white'
                          : ''
                      }`}
                    ></button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">成就 (每行一个)</label>
                <textarea
                  {...register('achievements')}
                  className="input-field h-20 resize-none"
                  placeholder="完成5.11c路线\n获得城市滑板赛第三名\n挑战10米大浪"
                />
                <p className="text-xs text-dark-500 mt-1">
                  记录伙伴的重要成就，每行一个
                </p>
              </div>

              <div>
                <label className="label">备注</label>
                <textarea
                  {...register('notes')}
                  className="input-field h-16 resize-none"
                  placeholder="可选：添加一些备注信息..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="btn-outline flex-1"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? '保存修改' : '添加伙伴'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
