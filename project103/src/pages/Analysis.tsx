import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  BookOpen, 
  Lightbulb,
  Target,
  Brain,
  Volume2
} from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { AnnotationViewer } from '../components/AnnotationViewer';
import { useMaterialStore } from '../stores';
import { pronunciationRules } from '../data/materials';
import { AnnotationTypeLabels, DifficultyTypeLabels } from '../types';

const difficultyAnalysis = [
  {
    type: 'vocabulary' as const,
    icon: BookOpen,
    title: '词汇问题',
    description: '听不懂的原因可能是词汇量不足，建议先学习材料中的核心词汇。',
    tips: [
      '先浏览材料中的核心词汇',
      '将不熟悉的词加入错词本',
      '通过上下文猜测词义',
    ],
  },
  {
    type: 'pronunciation' as const,
    icon: Volume2,
    title: '发音问题',
    description: '对连读、弱读、吞音等发音现象不熟悉，导致无法准确识别单词。',
    tips: [
      '重点学习连读和弱读规则',
      '多听标准发音并模仿',
      '注意句子中的重音位置',
    ],
  },
  {
    type: 'speed' as const,
    icon: Target,
    title: '语速问题',
    description: '说话速度太快，来不及反应。建议先从慢速开始练习。',
    tips: [
      '先使用0.5x慢速播放',
      '逐句精听，逐渐提高速度',
      '多听同一材料直到熟悉',
    ],
  },
];

export const Analysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { materials } = useMaterialStore();

  const material = materials.find(m => m.id === id);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'annotations' | 'rules' | 'analysis'>('annotations');
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const currentSegment = material?.segments[currentSegmentIndex];
  const totalSegments = material?.segments.length || 0;

  const filteredRules = pronunciationRules;

  if (!material || !currentSegment) {
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

  const tabs = [
    { id: 'annotations' as const, label: '发音标注', icon: Volume2 },
    { id: 'rules' as const, label: '规则学习', icon: Lightbulb },
    { id: 'analysis' as const, label: '难点分析', icon: Brain },
  ];

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/materials')}
        className="flex items-center gap-2 text-gray-600 hover:text-[#1E3A5F] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回
      </button>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">精听分析</h1>
        <p className="text-gray-500">深入分析发音特点，掌握英语听力技巧</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            句子 {currentSegmentIndex + 1} / {totalSegments}
          </span>
          <div className="flex gap-2">
            {material.segments.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSegmentIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${index === currentSegmentIndex 
                  ? 'bg-[#1E3A5F] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AudioPlayer 
        duration={material.duration}
        currentSegment={currentSegment}
        playbackRate={playbackRate}
        onPlaybackRateChange={setPlaybackRate}
      />

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-colors ${activeTab === tab.id 
                  ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F] bg-[#1E3A5F]/5' 
                  : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'annotations' && (
            <AnnotationViewer 
              segment={currentSegment}
            />
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="w-6 h-6 text-[#F59E0B]" />
                <h3 className="text-lg font-semibold text-gray-800">发音规则学习</h3>
              </div>
              
              <div className="grid gap-4">
                {filteredRules.map(rule => (
                  <div 
                    key={rule.id}
                    className="p-4 border border-gray-200 rounded-xl hover:border-[#1E3A5F] hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-[#1E3A5F]/10 text-[#1E3A5F]`}>
                        {AnnotationTypeLabels[rule.type]}
                      </span>
                      <h4 className="font-semibold text-gray-800">{rule.name}</h4>
                    </div>
                    <p className="text-gray-600 mb-3">{rule.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-500 mb-2">示例：</p>
                      <div className="space-y-1">
                        {rule.examples.map((example, idx) => (
                          <p key={idx} className="text-sm text-gray-700 font-mono">
                            {example}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-800">听力难点分析</h3>
              </div>
              <p className="text-gray-600 mb-6">
                如果你在听这段材料时遇到困难，可以参考以下分析，找出问题所在并针对性练习。
              </p>

              <div className="grid gap-4">
                {difficultyAnalysis.map(item => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.type}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-[#1E3A5F]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase">建议：</p>
                            {item.tips.map((tip, idx) => (
                              <p key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                                {tip}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentSegmentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentSegmentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          上一句
        </button>
        
        {currentSegmentIndex < totalSegments - 1 ? (
          <button
            onClick={() => setCurrentSegmentIndex(prev => prev + 1)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1E3A5F] to-[#2d4f7a] text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            下一句
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => navigate(`/dictation/${material.id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            开始听写练习
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
