import React from 'react';
import {
  Star,
  Sparkles,
  Sword,
  Zap,
  Shield,
  Brain,
  Crown,
  Medal,
  Award,
} from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { useTaskStore } from '../stores/useTaskStore';
import { calculateLevel } from '../data/mockData';
import ProgressBar from '../components/ProgressBar';

const titles = [
  { minLevel: 1, title: '新手管家', icon: '🏠' },
  { minLevel: 3, title: '家务学徒', icon: '🧹' },
  { minLevel: 5, title: '清洁达人', icon: '✨' },
  { minLevel: 8, title: '家务专家', icon: '👑' },
  { minLevel: 12, title: '家庭英雄', icon: '🦸' },
];

export default function Character() {
  const { currentUser, familyMembers } = useUserStore();
  const { tasks } = useTaskStore();

  const { level, currentExp, nextLevelExp } = calculateLevel(currentUser.expPoints);
  const expProgress = (currentExp / nextLevelExp) * 100;

  const userTasks = tasks.filter((t) => t.assignedTo === currentUser.id);
  const completedTasks = userTasks.filter((t) => t.status === 'completed').length;

  const getCurrentTitle = () => {
    const validTitles = titles.filter((t) => t.minLevel <= level);
    return validTitles[validTitles.length - 1] || titles[0];
  };

  const currentTitle = getCurrentTitle();

  const attributes = [
    { name: '力量', value: currentUser.attributes.strength, icon: Sword, desc: '完成困难任务能力', color: 'primary' },
    { name: '敏捷', value: currentUser.attributes.agility, icon: Zap, desc: '限时任务效率', color: 'secondary' },
    { name: '耐力', value: currentUser.attributes.endurance, icon: Shield, desc: '连续完成任务', color: 'accent' },
    { name: '智慧', value: currentUser.attributes.wisdom, icon: Brain, desc: '团队协作能力', color: 'primary' },
  ];

  const stats = [
    { label: '总金币', value: currentUser.coins, icon: Star, color: 'text-primary-600' },
    { label: '完成任务', value: completedTasks, icon: Award, color: 'text-secondary-600' },
    { label: '当前等级', value: level, icon: Medal, color: 'text-accent-600' },
    { label: '家庭成员', value: familyMembers.length, icon: Crown, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="font-display text-3xl text-neutral-800 mb-1">🎭 角色中心</h1>
        <p className="text-neutral-500">查看你的角色信息和成长进度</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-primary-50 via-white to-secondary-50">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <div className="w-40 h-40 mx-auto rounded-full bg-gradient-warm flex items-center justify-center shadow-glow animate-pulse-glow">
                <span className="text-7xl">{currentUser.avatarUrl}</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-white rounded-full shadow-lg border-2 border-primary-200">
                <span className="font-display text-xl text-primary-600">Lv.{level}</span>
              </div>
            </div>

            <h2 className="font-display text-2xl text-neutral-800 mb-1">
              {currentUser.roleName}
            </h2>
            <div className="flex items-center justify-center gap-2 text-lg text-secondary-600 mb-4">
              <span>{currentTitle.icon}</span>
              <span className="font-semibold">{currentTitle.title}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/60">
              <ProgressBar
                progress={expProgress}
                color="primary"
                showLabel
                height="lg"
                label="经验值进度"
              />
              <p className="text-sm text-neutral-500 mt-2">
                {currentExp} / {nextLevelExp} EXP
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-display text-lg text-neutral-800 mb-4">📊 角色属性</h3>
            <div className="grid grid-cols-2 gap-4">
              {attributes.map((attr) => {
                const Icon = attr.icon;
                return (
                  <div
                    key={attr.name}
                    className={`p-4 rounded-2xl ${
                      attr.color === 'primary'
                        ? 'bg-primary-50'
                        : attr.color === 'secondary'
                        ? 'bg-secondary-50'
                        : 'bg-accent-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-2 rounded-xl ${
                          attr.color === 'primary'
                            ? 'bg-primary-100 text-primary-600'
                            : attr.color === 'secondary'
                            ? 'bg-secondary-100 text-secondary-600'
                            : 'bg-accent-100 text-accent-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-800">{attr.name}</p>
                        <p className="text-xs text-neutral-500">{attr.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            attr.color === 'primary'
                              ? 'bg-primary-500'
                              : attr.color === 'secondary'
                              ? 'bg-secondary-500'
                              : 'bg-accent-500'
                          }`}
                          style={{ width: `${attr.value}%` }}
                        />
                      </div>
                      <span className="font-bold text-neutral-700">{attr.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="font-display text-lg text-neutral-800 mb-4">🏆 成就统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="text-center p-4 rounded-2xl bg-neutral-50"
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-2xl font-display text-neutral-800">{stat.value}</p>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-display text-lg text-neutral-800 mb-4">🎮 称号进度</h3>
        <div className="relative">
          <div className="absolute top-6 left-0 right-0 h-2 bg-neutral-200 rounded-full" />
          <div className="relative flex justify-between">
            {titles.map((title, index) => {
              const isUnlocked = level >= title.minLevel;
              const isCurrent = title.minLevel <= level && (index === titles.length - 1 || level < titles[index + 1].minLevel);
              
              return (
                <div
                  key={title.minLevel}
                  className={`relative z-10 text-center ${
                    isUnlocked ? '' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 ${
                      isCurrent
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-200 animate-pulse-glow'
                        : isUnlocked
                        ? 'bg-secondary-100'
                        : 'bg-neutral-200'
                    }`}
                  >
                    {title.icon}
                  </div>
                  <p className={`text-sm font-semibold ${
                    isCurrent ? 'text-primary-600' : 'text-neutral-600'
                  }`}>
                    {title.title}
                  </p>
                  <p className="text-xs text-neutral-400">Lv.{title.minLevel}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary-600" />
          <h3 className="font-display text-lg text-neutral-800">升级提示</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/70">
            <div className="text-2xl mb-2">📈</div>
            <p className="font-semibold text-neutral-800 mb-1">完成更多任务</p>
            <p className="text-sm text-neutral-500">
              还需 {nextLevelExp - currentExp} EXP 升至 Lv.{level + 1}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70">
            <div className="text-2xl mb-2">🎯</div>
            <p className="font-semibold text-neutral-800 mb-1">挑战困难任务</p>
            <p className="text-sm text-neutral-500">
              困难任务获得 3 倍经验值奖励
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70">
            <div className="text-2xl mb-2">🔥</div>
            <p className="font-semibold text-neutral-800 mb-1">保持连续完成</p>
            <p className="text-sm text-neutral-500">
              连续完成任务可解锁特殊成就
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
