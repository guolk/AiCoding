import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  RotateCcw,
  NotebookPen,
  Target,
  ChevronRight,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  gradient: string;
  delay: number;
}

function FeatureCard({ title, description, icon, path, gradient, delay }: FeatureCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slideInUp",
        gradient
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => navigate(path)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            {icon}
          </div>
          <ChevronRight className="text-white/70 group-hover:translate-x-1 transition-transform duration-300" size={24} />
        </div>
        
        <h3 className="text-xl font-display font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm leading-relaxed">{description}</p>
      </div>
      
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
    </div>
  );
}

export default function Home() {
  const features: Omit<FeatureCardProps, 'delay'>[] = [
    {
      title: '开局库',
      description: '系统学习国际象棋经典开局，掌握西班牙开局、西西里防御、法兰西防御等主流开局体系及其变例。',
      icon: <BookOpen className="text-white" size={32} />,
      path: '/openings',
      gradient: 'bg-gradient-to-br from-wood-brown-600 to-wood-brown-800',
    },
    {
      title: '棋局复盘',
      description: '导入你的对局，通过走法分析和位置评估来深入理解每一步棋的优劣，提升中局和残局水平。',
      icon: <RotateCcw className="text-white" size={32} />,
      path: '/replay',
      gradient: 'bg-gradient-to-br from-amber-600 to-amber-800',
    },
    {
      title: '学习笔记',
      description: '记录你的学习心得、战术总结和对局反思，构建个人的国际象棋知识库。',
      icon: <NotebookPen className="text-white" size={32} />,
      path: '/notes',
      gradient: 'bg-gradient-to-br from-emerald-600 to-emerald-800',
    },
    {
      title: '训练管理',
      description: '制定训练计划，跟踪学习进度，通过 spaced repetition 系统巩固所学内容。',
      icon: <Target className="text-white" size={32} />,
      path: '/training',
      gradient: 'bg-gradient-to-br from-sky-600 to-sky-800',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-500 via-ivory-400 to-ivory-300">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-wood-brown-700 to-wood-brown-900" />
        
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 text-8xl">♔</div>
          <div className="absolute top-20 right-20 text-7xl">♕</div>
          <div className="absolute bottom-10 left-1/4 text-6xl">♖</div>
          <div className="absolute bottom-20 right-1/3 text-8xl">♗</div>
          <div className="absolute top-1/2 left-1/2 text-9xl opacity-10">♘</div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6 animate-fadeIn">
              <div className="p-3 bg-gold-500/20 rounded-xl backdrop-blur-sm">
                <Crown className="text-gold-400" size={32} />
              </div>
              <span className="text-gold-400 font-semibold tracking-wide">国际象棋学习平台</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 animate-slideInUp">
              提升你的
              <span className="block text-gold-400 mt-2">国际象棋技艺</span>
            </h1>
            
            <p className="text-lg md:text-xl text-ivory-100/90 leading-relaxed animate-slideInUp" style={{ animationDelay: '100ms' }}>
              专业的开局库、对局分析和训练系统，帮助你系统地学习国际象棋，
              从入门到精通，每一步都有迹可循。
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-ivory-500 to-transparent" />
      </header>

      <main className="container mx-auto px-6 py-12 md:py-16">
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-wood-brown-900 mb-2">
            开始你的学习之旅
          </h2>
          <p className="text-wood-brown-600 mb-8">
            选择一个功能模块，开始系统地学习国际象棋
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 100 + 150}
              />
            ))}
          </div>
        </section>

        <section className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-wood-brown-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-wood-brown-800">3+</div>
              <div className="text-wood-brown-600 mt-1">经典开局</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-wood-brown-800">10+</div>
              <div className="text-wood-brown-600 mt-1">开局变例</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-wood-brown-800">5+</div>
              <div className="text-wood-brown-600 mt-1">陷阱专题</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-wood-brown-800">∞</div>
              <div className="text-wood-brown-600 mt-1">学习可能</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-wood-brown-600 text-sm">
        <p>© 2024 国际象棋学习平台 - 用智慧征服棋盘</p>
      </footer>
    </div>
  );
}
