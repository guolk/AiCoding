import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Plus,
  GalleryHorizontalEnd,
  BookOpen,
  Heart,
  Landmark,
  Globe,
  Award,
} from 'lucide-react';
import { useMuseumStore } from '@/store/useMuseumStore';
import { MUSEUM_TYPE_LABELS, MUSEUM_TYPE_COLORS } from '@/types';
import type { MuseumType } from '@/types';
import StarRating from '@/components/StarRating';
import TypeBadge from '@/components/TypeBadge';

function useAnimatedNumber(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return current;
}

const QUICK_ACTIONS = [
  { label: '新增参观', icon: Plus, to: '/visits' },
  { label: '展览追踪', icon: GalleryHorizontalEnd, to: '/exhibitions' },
  { label: '学习笔记', icon: BookOpen, to: '/notes' },
  { label: '愿望清单', icon: Heart, to: '/wishlist' },
];

const MUSEUM_TYPES: MuseumType[] = ['art', 'history', 'science', 'nature', 'other'];

export default function Home() {
  const visits = useMuseumStore((s) => s.visits);
  const navigate = useNavigate();
  const animatedCount = useAnimatedNumber(visits.length);

  const recentVisits = useMemo(() => visits.slice(0, 5), [visits]);

  const typeDistribution = useMemo(() => {
    const counts: Record<MuseumType, number> = {
      art: 0,
      history: 0,
      science: 0,
      nature: 0,
      other: 0,
    };
    visits.forEach((v) => {
      counts[v.type]++;
    });
    return MUSEUM_TYPES.filter((t) => counts[t] > 0).map((t) => ({
      name: MUSEUM_TYPE_LABELS[t],
      value: counts[t],
      color: MUSEUM_TYPE_COLORS[t],
    }));
  }, [visits]);

  const uniqueCountries = useMemo(
    () => new Set(visits.map((v) => v.country)).size,
    [visits]
  );

  const mostVisitedType = useMemo(() => {
    if (visits.length === 0) return null;
    const counts: Record<MuseumType, number> = {
      art: 0,
      history: 0,
      science: 0,
      nature: 0,
      other: 0,
    };
    visits.forEach((v) => {
      counts[v.type]++;
    });
    const top = MUSEUM_TYPES.reduce((a, b) => (counts[a] >= counts[b] ? a : b));
    return {
      type: top,
      label: MUSEUM_TYPE_LABELS[top],
      count: counts[top],
      color: MUSEUM_TYPE_COLORS[top],
    };
  }, [visits]);

  return (
    <div className="min-h-screen space-y-8 p-8">
      <section className="ink-gradient relative overflow-hidden rounded-2xl px-10 py-12">
        <div className="absolute left-0 top-0 h-full w-1 gold-gradient" />
        <div className="absolute right-0 top-0 h-full w-1 gold-gradient" />
        <div className="absolute left-4 right-4 top-0 h-px gold-gradient" />
        <div className="absolute bottom-0 left-4 right-4 h-px gold-gradient" />
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gold-500/5 blur-3xl" />

        <div className="relative z-10">
          <h1 className="font-serif text-5xl font-bold text-gold-gradient">
            博物志
          </h1>
          <p className="mt-2 text-lg text-ink-200">你的文化探索档案</p>
          <div className="mt-8 flex items-end gap-3">
            <span className="font-serif text-7xl font-bold text-gold-400 transition-all duration-300">
              {animatedCount}
            </span>
            <span className="mb-3 text-lg text-ink-300">次参观记录</span>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-ink-50">
            近期参观
          </h2>
          {visits.length > 5 && (
            <Link
              to="/visits"
              className="text-sm text-gold-500 transition-colors hover:text-gold-400"
            >
              查看全部 →
            </Link>
          )}
        </div>
        {recentVisits.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {recentVisits.map((visit) => (
              <Link
                key={visit.id}
                to={`/visits/${visit.id}`}
                className="card-shine group w-72 flex-shrink-0 rounded-xl border border-gold-500/10 p-5 transition-all duration-300 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate font-serif text-lg font-semibold text-ink-50 transition-colors group-hover:text-gold-400">
                    {visit.name}
                  </h3>
                  <TypeBadge type={visit.type} />
                </div>
                <p className="mt-1 truncate text-sm text-ink-300">
                  {visit.location}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <StarRating rating={visit.rating} readonly size={14} />
                  <span className="text-xs text-ink-400">{visit.date}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-shine rounded-xl border border-gold-500/10 p-8 text-center">
            <p className="text-ink-300">还没有参观记录</p>
            <button
              onClick={() => navigate('/visits')}
              className="mt-3 text-sm text-gold-500 transition-colors hover:text-gold-400"
            >
              开始记录 →
            </button>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-semibold text-ink-50">
          快捷操作
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="group flex flex-col items-center gap-3 rounded-xl border border-gold-500/30 bg-transparent px-4 py-6 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/10 hover:shadow-lg hover:shadow-gold-500/5"
            >
              <action.icon className="h-8 w-8 text-gold-500 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-sm font-medium text-ink-100 transition-colors group-hover:text-gold-400">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-semibold text-ink-50">
          数据概览
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="card-shine rounded-xl border border-gold-500/10 p-5">
            <div className="flex items-center gap-2 text-ink-300">
              <Landmark className="h-4 w-4" />
              <span className="text-sm">总参观次数</span>
            </div>
            <p className="mt-2 font-serif text-3xl font-bold text-gold-400">
              {visits.length}
            </p>
          </div>
          <div className="card-shine rounded-xl border border-gold-500/10 p-5">
            <div className="flex items-center gap-2 text-ink-300">
              <Globe className="h-4 w-4" />
              <span className="text-sm">涉足国家</span>
            </div>
            <p className="mt-2 font-serif text-3xl font-bold text-gold-400">
              {uniqueCountries}
            </p>
          </div>
          <div className="card-shine rounded-xl border border-gold-500/10 p-5">
            <div className="flex items-center gap-2 text-ink-300">
              <Award className="h-4 w-4" />
              <span className="text-sm">最常参观</span>
            </div>
            {mostVisitedType ? (
              <>
                <p className="mt-2 font-serif text-3xl font-bold text-gold-400">
                  {mostVisitedType.label}
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  {mostVisitedType.count} 次参观
                </p>
              </>
            ) : (
              <p className="mt-2 font-serif text-3xl font-bold text-ink-600">—</p>
            )}
          </div>
          <div className="card-shine rounded-xl border border-gold-500/10 p-4">
            <p className="mb-2 text-sm text-ink-300">类型分布</p>
            {typeDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={100}>
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2a2a40',
                        border: '1px solid #c9a96e40',
                        borderRadius: '8px',
                        color: '#f5f0e8',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {typeDistribution.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-ink-300">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[100px] items-center justify-center text-sm text-ink-400">
                暂无数据
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
