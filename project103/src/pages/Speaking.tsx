import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  Mic,
  Flag,
  Globe,
  CheckCircle
} from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { Recorder } from '../components/Recorder';
import { useMaterialStore } from '../stores';
import { accentFeatures } from '../data/materials';
import { AccentTypeLabels } from '../types';

export const Speaking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { materials } = useMaterialStore();

  const material = materials.find(m => m.id === id);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'practice' | 'rhythm' | 'accent'>('practice');
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const currentSegment = material?.segments[currentSegmentIndex];
  const totalSegments = material?.segments.length || 0;

  if (!material || !currentSegment) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Mic className="w-8 h-8 text-gray-300" />
        </div>
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
    { id: 'practice' as const, label: '跟读练习', icon: Mic },
    { id: 'rhythm' as const, label: '语调节奏', icon: Flag },
    { id: 'accent' as const, label: '口音分析', icon: Globe },
  ];

  const rhythmTips = [
    {
      title: '重音位置',
      description: '英语句子中，名词、动词、形容词通常重读，冠词、介词、连词通常弱读。',
      example: 'I WANT to GO to the STORE.',
    },
    {
      title: '语调变化',
      description: '陈述句用降调，一般疑问句用升调，选择疑问句前升后降。',
      example: 'Do you like ↗APPLES or ↘ORANGES?',
    },
    {
      title: '停顿节奏',
      description: '根据意群停顿，不要在词组中间停顿，保持自然的节奏感。',
      example: 'In the morning / I usually / drink coffee.',
    },
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">跟读模仿</h1>
        <p className="text-gray-500">录制跟读，对比原音频，提升口语发音</p>
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

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-[#1E3A5F]" />
          </div>
          <div>
            <p className="text-sm text-gray-500">原文</p>
            <p className="text-xl font-medium text-gray-800">{currentSegment.text}</p>
          </div>
        </div>
      </div>

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
          {activeTab === 'practice' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">录制跟读</h3>
                <p className="text-gray-500">点击录音按钮，跟读上面的句子</p>
              </div>
              
              <Recorder maxDuration={Math.ceil(currentSegment.endTime - currentSegment.startTime) + 5} />
            </div>
          )}

          {activeTab === 'rhythm' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">语调节奏练习</h3>
                <p className="text-gray-500">掌握英语的重音、语调和停顿规律</p>
              </div>

              <div className="grid gap-4">
                {rhythmTips.map((tip, index) => (
                  <div 
                    key={index}
                    className="p-4 border border-gray-200 rounded-xl hover:border-[#1E3A5F] transition-all"
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">{tip.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
                    <div className="bg-[#1E3A5F]/5 rounded-lg p-3">
                      <p className="text-sm font-mono text-[#1E3A5F]">{tip.example}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h4 className="font-medium text-yellow-800 mb-2">💡 练习建议</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 先听几遍原音频，熟悉语调和节奏</li>
                  <li>• 标记句子中的重音位置</li>
                  <li>• 先慢速模仿，再逐渐提高速度</li>
                  <li>• 录音后对比原音频，找出差异</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'accent' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">口音特征分析</h3>
                <p className="text-gray-500">
                  当前材料口音：<span className="font-semibold text-[#1E3A5F]">{AccentTypeLabels[material.accent]}</span>
                </p>
              </div>

              <div className="p-4 border border-[#1E3A5F] rounded-xl bg-[#1E3A5F]/5">
                <h4 className="font-semibold text-[#1E3A5F] mb-3">
                  {accentFeatures[material.accent].name} 特点
                </h4>
                <ul className="space-y-2">
                  {accentFeatures[material.accent].features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] mt-1.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <h4 className="font-medium text-green-800 mb-2">🎯 练习技巧</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {accentFeatures[material.accent].tips.map((tip, idx) => (
                    <li key={idx}>• {tip}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['american', 'british', 'australian'] as const).map(accent => (
                  <button
                    key={accent}
                    className={`p-3 rounded-xl text-center transition-all ${accent === material.accent 
                      ? 'bg-[#1E3A5F] text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Globe className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">{AccentTypeLabels[accent]}</span>
                  </button>
                ))}
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
        
        <button
          onClick={() => setCurrentSegmentIndex(prev => Math.min(totalSegments - 1, prev + 1))}
          disabled={currentSegmentIndex >= totalSegments - 1}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1E3A5F] to-[#2d4f7a] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一句
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
