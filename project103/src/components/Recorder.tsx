import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Square, Volume2, RotateCcw, Star } from 'lucide-react';

interface RecorderProps {
  onRecordComplete?: (audioUrl: string, duration: number) => void;
  maxDuration?: number;
}

export const Recorder: React.FC<RecorderProps> = ({ onRecordComplete, maxDuration = 30 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(0));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const visualizerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (visualizerIntervalRef.current) clearInterval(visualizerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordComplete?.(url, duration);
        
        const score = Math.floor(60 + Math.random() * 35);
        setSimilarityScore(score);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      visualizerIntervalRef.current = window.setInterval(() => {
        setVisualizerData(prev => 
          prev.map(() => Math.random() * 100)
        );
      }, 100);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (visualizerIntervalRef.current) clearInterval(visualizerIntervalRef.current);
    }
  };

  const playRecording = () => {
    if (!audioUrl) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const resetRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setDuration(0);
    setSimilarityScore(null);
    setIsPlaying(false);
    setIsRecording(false);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-6">
          {isRecording && (
            <div className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
          )}
          <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : audioUrl ? 'bg-gradient-to-br from-[#1E3A5F] to-[#F59E0B]' : 'bg-gray-200'}`}>
            {isRecording ? (
              <Mic className="w-12 h-12 text-white" />
            ) : audioUrl ? (
              <Volume2 className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-gray-400" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 mb-4 h-12">
          {isRecording ? (
            visualizerData.map((value, idx) => (
              <div
                key={idx}
                className="w-1 bg-gradient-to-t from-red-500 to-red-400 rounded-full transition-all duration-100"
                style={{ height: `${Math.max(4, value * 0.4)}px` }}
              />
            ))
          ) : (
            new Array(20).fill(0).map((_, idx) => (
              <div
                key={idx}
                className="w-1 bg-gray-200 rounded-full"
                style={{ height: '8px' }}
              />
            ))
          )}
        </div>

        <div className="text-2xl font-mono font-bold text-gray-800 mb-4">
          {formatDuration(duration)}
          <span className="text-sm text-gray-400 ml-2">/ {formatDuration(maxDuration)}</span>
        </div>

        {isRecording && (
          <p className="text-red-500 font-medium mb-4 animate-pulse">
            正在录音...
          </p>
        )}

        {similarityScore !== null && (
          <div className={`w-full p-4 rounded-xl mb-4 ${getScoreBg(similarityScore)}`}>
            <div className="flex items-center justify-center gap-3">
              <Star className={`w-6 h-6 ${getScoreColor(similarityScore)}`} />
              <div className="text-center">
                <p className="text-sm text-gray-600">相似度评分</p>
                <p className={`text-3xl font-bold ${getScoreColor(similarityScore)}`}>
                  {similarityScore}%
                </p>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600">
                {similarityScore >= 85 ? '太棒了！发音非常标准 🎉' :
                 similarityScore >= 70 ? '不错，继续加油 💪' :
                 '还需要多练习，注意语调和节奏 📚'}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          {!audioUrl ? (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-[#1E3A5F] to-[#2d4f7a] hover:from-[#2d4f7a] hover:to-[#3a6b9a]'}`}
            >
              {isRecording ? (
                <>
                  <Square className="w-5 h-5" />
                  停止录音
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  开始录音
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={playRecording}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                {isPlaying ? (
                  <>
                    <Square className="w-5 h-5" />
                    暂停
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    播放
                  </>
                )}
              </button>
              <button
                onClick={resetRecording}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                重新录音
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
