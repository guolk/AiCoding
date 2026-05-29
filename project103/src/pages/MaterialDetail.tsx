import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  BookOpen, 
  Mic, 
  Headphones,
  Clock,
  Star,
  Target,
  Volume2
} from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { useMaterialStore } from '../stores';
import { 
  MaterialTypeLabels, 
  DifficultyLabels, 
  PracticeTypeLabels,
  AccentTypeLabels 
} from '../types';
import { formatTime, getDifficultyColor, getMaterialTypeColor } from '../utils';

export const MaterialDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { materials, setCurrentMaterial, currentMaterial, toggleFavorite } = useMaterialStore();

  useEffect(() => {
    if (id) {
      const material = materials.find(m => m.id === id);
      setCurrentMaterial(material || null);
    }
    return () => setCurrentMaterial(null);
  }, [id, materials, setCurrentMaterial]);

  if (!currentMaterial) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">材料不存在</h3>
        <button 
          onClick={() => navigate('/materials')}
          className="text-[#1E3A5F] hover:underline"
        >
          返回材料库
        </button>
      </div>
    );
  }

  const material = currentMaterial;

  const practiceModes = [
    {
      icon: Headphones,
      title: '听写练习',
      description: '分句播放，输入听到的内容，系统自动对比和评分',
      path: `/dictation/${material.id}`,
      color: 'from-blue-500 to-blue-600',
      recommended: material.practiceType === 'intensive',
    },
    {
      icon: BookOpen,
      title: '精听分析',
      description: '深入分析发音特点，学习连读、弱读、语调等规则',
      path: `/analysis/${material.id}`,
      color: 'from-green-500 to-green-600',
      recommended: material.practiceType === 'intensive',
    },
    {
      icon: Mic,
      title: '跟读模仿',
      description: '录制自己的跟读，与原音频对比，提升口语发音',
      path: `/speaking/${material.id}`,
      color: 'from-purple-500 to-purple-600',
      recommended: false,
    },
  ];

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/materials')}
        className="flex items-center gap-2 text-gray-600 hover:text-[#1E3A5F] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回材料库
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-[#1E3A5F] to-[#2d4f7a] p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-4 border-white" />
            <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full border-4 border-white" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMaterialTypeColor(material.type)}`}>
                {MaterialTypeLabels[material.type]}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
                {DifficultyLabels[material.difficulty]}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                {PracticeTypeLabels[material.practiceType]}
              </span>
            </div>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{material.title}</h1>
              <p className="text-white/80">{material.description}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">{formatTime(material.duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">{AccentTypeLabels[material.accent]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">语速: {material.speed}x</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">主讲: {material.speaker}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">核心词汇</h3>
            <div className="flex flex-wrap gap-2">
              {material.vocabulary.map((word, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 bg-[#1E3A5F]/5 text-[#1E3A5F] rounded-full text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">完整文稿</h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-700 leading-relaxed">{material.transcript}</p>
            </div>
          </div>
        </div>
      </div>

      <AudioPlayer 
        duration={material.duration}
      />

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">选择练习模式</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {practiceModes.map((mode, index) => (
            <button
              key={index}
              onClick={() => navigate(mode.path)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                <mode.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-800">{mode.title}</h3>
                {mode.recommended && (
                  <span className="px-2 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium rounded-full">
                    推荐
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{mode.description}</p>
              <div className="mt-4 flex items-center text-[#1E3A5F] group-hover:gap-2 transition-all">
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">开始练习</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
