import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, ChevronLeft, ChevronRight, BookOpen, Mic, Check, Star } from 'lucide-react'
import { newsItems } from '../../data/mockData'
import clsx from 'clsx'

export const EnvironmentNews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [mode, setMode] = useState<'listening' | 'repeat' | 'vocabulary'>('listening')
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showTranslation, setShowTranslation] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [repeatedSentences, setRepeatedSentences] = useState<number[]>([])
  const [savedWords, setSavedWords] = useState<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentNews = newsItems[currentIndex]
  const sentences = currentNews.content.split(/[.!?]+/).filter(s => s.trim())
  const currentSentenceIndex = Math.min(Math.floor(currentTime / 5), sentences.length - 1)

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } else {
      setIsPlaying(true)
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 60) {
            setIsPlaying(false)
            if (intervalRef.current) clearInterval(intervalRef.current)
            return 60
          }
          return prev + 0.1
        })
      }, 100)
    }
  }

  const handleReset = () => {
    setCurrentTime(0)
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      handleReset()
      setRepeatedSentences([])
    }
  }

  const handleNext = () => {
    if (currentIndex < newsItems.length - 1) {
      setCurrentIndex(prev => prev + 1)
      handleReset()
      setRepeatedSentences([])
    }
  }

  const handleRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false)
        if (!repeatedSentences.includes(currentSentenceIndex)) {
          setRepeatedSentences(prev => [...prev, currentSentenceIndex])
        }
      }, 3000)
    }
  }

  const toggleSaveWord = (word: string) => {
    setSavedWords(prev =>
      prev.includes(word)
        ? prev.filter(w => w !== word)
        : [...prev, word]
    )
  }

  const progress = (currentTime / 60) * 100
  const repeatProgress = (repeatedSentences.length / sentences.length) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/environment" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">每日新闻精听</h1>
          <p className="text-gray-500">精听每日英语新闻，跟读练习地道表达</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {newsItems.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === newsItems.length - 1}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">精听进度</p>
            <p className="text-xl font-bold text-gray-800">{Math.round(progress)}%</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Mic className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">跟读完成</p>
            <p className="text-xl font-bold text-gray-800">{repeatedSentences.length} / {sentences.length} 句</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">收藏词汇</p>
            <p className="text-xl font-bold text-gray-800">{savedWords.length} 个</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-indigo-100 text-indigo-700">{currentNews.category}</span>
              <span className="text-sm text-gray-500">{currentNews.date}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{currentNews.title}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('listening')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-all',
                mode === 'listening'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              精听模式
            </button>
            <button
              onClick={() => setMode('repeat')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-all',
                mode === 'repeat'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              跟读模式
            </button>
            <button
              onClick={() => setMode('vocabulary')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-all',
                mode === 'vocabulary'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              词汇学习
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 mb-6">
          <div className="w-full bg-white/50 rounded-full h-2 mb-4">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleReset}
              className="p-3 hover:bg-white/50 rounded-xl transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 hover:bg-white/50 rounded-xl transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-gray-600" /> : <Volume2 className="w-5 h-5 text-gray-600" />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-gray-500">语速：</span>
            {[0.5, 0.75, 1, 1.25, 1.5].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-sm font-medium transition-all',
                  playbackSpeed === speed
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/50 text-gray-600 hover:bg-white'
                )}
              >
                {speed}x
              </button>
            ))}
          </div>

          <div className="text-center mt-4 text-sm text-gray-500">
            {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / 1:00
          </div>
        </div>

        {mode === 'listening' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">新闻原文</h3>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showTranslation ? '隐藏翻译' : '显示翻译'}
              </button>
            </div>
            <div className="space-y-3">
              {sentences.map((sentence, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    'p-4 rounded-xl transition-all',
                    currentSentenceIndex === idx
                      ? 'bg-primary-50 border-2 border-primary-300 shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <p className="text-lg text-gray-800">{sentence.trim()}.</p>
                  {showTranslation && (
                    <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">
                      {currentNews.translation.split(/[.!?]+/)[idx]?.trim() || ''}。
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'repeat' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800">跟读练习</h3>
                <span className="text-sm text-gray-500">
                  第 {currentSentenceIndex + 1} 句 / 共 {sentences.length} 句
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${repeatProgress}%` }}
                />
              </div>
            </div>

            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl text-center">
              <p className="text-2xl font-medium text-gray-800 mb-4">
                "{sentences[currentSentenceIndex]?.trim() || ''}."
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {currentNews.translation.split(/[.!?]+/)[currentSentenceIndex]?.trim() || ''}。
              </p>

              <button
                onClick={handleRecord}
                className={clsx(
                  'px-8 py-4 rounded-full font-bold text-white transition-all shadow-lg',
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-primary-500 hover:bg-primary-600'
                )}
              >
                {isRecording ? '🔴 录音中...（3秒）' : '🎤 开始跟读'}
              </button>

              {repeatedSentences.includes(currentSentenceIndex) && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">已完成跟读！</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {sentences.map((_, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    'h-2 rounded-full transition-all',
                    currentSentenceIndex === idx
                      ? 'bg-primary-500'
                      : repeatedSentences.includes(idx)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {mode === 'vocabulary' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800">重点词汇</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentNews.vocabulary.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xl font-bold text-gray-800">{item.word}</span>
                      <span className="text-sm text-gray-400 ml-2">{item.phonetic}</span>
                    </div>
                    <button
                      onClick={() => toggleSaveWord(item.word)}
                      className={clsx(
                        'p-2 rounded-lg transition-all',
                        savedWords.includes(item.word)
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500'
                      )}
                    >
                      <Star className={`w-5 h-5 ${savedWords.includes(item.word) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="text-gray-400">{item.partOfSpeech}</span> {item.meaning}
                  </p>
                  <p className="text-sm text-gray-500 italic">
                    "
                    {item.example}
                    "
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
