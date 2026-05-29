import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  SkipBack, 
  SkipForward, 
  Check, 
  RotateCcw,
  BookOpen,
  ChevronRight,
  Trophy
} from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { DiffViewer } from '../components/DiffViewer';
import { useMaterialStore, usePracticeStore, useProgressStore } from '../stores';
import { compareTexts, calculateAccuracy, getWrongWords } from '../utils';
import type { DiffWord, WrongWord } from '../types';

export const Dictation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { materials } = useMaterialStore();
  const { addWrongWord, addPracticeRecord } = usePracticeStore();
  const { startSession, endSession, addToCompleted } = useProgressStore();

  const material = materials.find(m => m.id === id);
  
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [diff, setDiff] = useState<DiffWord[]>([]);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [segmentResults, setSegmentResults] = useState<{ segmentId: string; accuracy: number }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [collectedWrongWords, setCollectedWrongWords] = useState<WrongWord[]>([]);

  useEffect(() => {
    if (material) {
      startSession(material.id);
    }
    return () => endSession();
  }, [material, startSession, endSession]);

  useEffect(() => {
    setUserInput('');
    setShowResult(false);
    setDiff([]);
  }, [currentSegmentIndex]);

  const currentSegment = material?.segments[currentSegmentIndex];
  const totalSegments = material?.segments.length || 0;
  const progress = totalSegments > 0 ? ((currentSegmentIndex + 1) / totalSegments) * 100 : 0;

  const handleSubmit = useCallback(() => {
    if (!currentSegment || !material) return;

    const diffResult = compareTexts(currentSegment.text, userInput);
    const accuracy = calculateAccuracy(diffResult);
    
    setDiff(diffResult);
    setShowResult(true);
    setSegmentResults(prev => [...prev, { segmentId: currentSegment.id, accuracy }]);

    const wrongWords = getWrongWords(diffResult, currentSegment.text, currentSegment.id, material.id);
    wrongWords.forEach(w => addWrongWord(w));
    setCollectedWrongWords(prev => [...prev, ...wrongWords]);
  }, [currentSegment, userInput, material, addWrongWord]);

  const handleNext = useCallback(() => {
    if (!material) return;
    
    if (currentSegmentIndex < material.segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
      addToCompleted(material.id);
      
      const avgAccuracy = segmentResults.length > 0
        ? Math.round(segmentResults.reduce((sum, r) => sum + r.accuracy, 0) / segmentResults.length)
        : 0;
      
      addPracticeRecord({
        materialId: material.id,
        type: 'dictation',
        duration: 0,
        accuracy: avgAccuracy,
        difficulties: [],
      });
      
      endSession(avgAccuracy);
    }
  }, [material, currentSegmentIndex, segmentResults, addToCompleted, addPracticeRecord, endSession]);

  const handleRetry = useCallback(() => {
    setUserInput('');
    setShowResult(false);
    setDiff([]);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentSegmentIndex(0);
    setUserInput('');
    setShowResult(false);
    setDiff([]);
    setSegmentResults([]);
    setIsComplete(false);
    setCollectedWrongWords([]);
    if (material) startSession(material.id);
  }, [material, startSession]);

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

  if (isComplete) {
    const avgAccuracy = segmentResults.length > 0
      ? Math.round(segmentResults.reduce((sum, r) => sum + r.accuracy, 0) / segmentResults.length)
      : 0;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-[#1E3A5F] to-[#F59E0B] flex items-center justify-center text-white">
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-2" />
              <h1 className="text-2xl font-bold">练习完成！🎉</h1>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-center mb-8">
              <p className="text-gray-500 mb-2">平均正确率</p>
              <p className="text-6xl font-bold text-[#1E3A5F]">{avgAccuracy}%</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {segmentResults.map((result, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">句子 {index + 1}</p>
                  <p className={`text-2xl font-bold ${result.accuracy >= 80 ? 'text-green-600' : result.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {result.accuracy}%
                  </p>
                </div>
              ))}
            </div>

            {collectedWrongWords.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-800 mb-3">本次错词</h3>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(collectedWrongWords.map(w => w.word))].map((word, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                重新练习
              </button>
              <button
                onClick={() => navigate('/materials')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1E3A5F] to-[#2d4f7a] text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                选择新材料
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/materials')}
        className="flex items-center gap-2 text-gray-600 hover:text-[#1E3A5F] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回
      </button>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            句子 {currentSegmentIndex + 1} / {totalSegments}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% 完成
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#1E3A5F] to-[#F59E0B] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{material.title}</h2>
        <p className="text-sm text-gray-500">{material.description}</p>
      </div>

      <AudioPlayer 
        duration={material.duration}
        currentSegment={currentSegment}
        playbackRate={playbackRate}
        onPlaybackRateChange={setPlaybackRate}
      />

      {!showResult ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setPlaybackRate(0.5)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${playbackRate === 0.5 ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              慢速 (0.5x)
            </button>
            <button
              onClick={() => setPlaybackRate(0.75)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${playbackRate === 0.75 ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              中速 (0.75x)
            </button>
            <button
              onClick={() => setPlaybackRate(1.0)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${playbackRate === 1.0 ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              正常 (1.0x)
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            请仔细听音频，然后在下方输入你听到的内容：
          </p>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <SkipBack className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">提示：可以多次播放同一句，先慢速再正常速度</span>
            </div>
          </div>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="在这里输入你听到的内容..."
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 resize-none text-lg"
            autoFocus
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              清空
            </button>
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1E3A5F] to-[#2d4f7a] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              提交答案
            </button>
          </div>
        </div>
      ) : (
        <>
          <DiffViewer diff={diff} standardText={currentSegment.text} />
          
          <div className="flex justify-between gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              再试一次
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1E3A5F] to-[#2d4f7a] text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              {currentSegmentIndex < material.segments.length - 1 ? (
                <>
                  下一句
                  <SkipForward className="w-5 h-5" />
                </>
              ) : (
                <>
                  查看结果
                  <Trophy className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
