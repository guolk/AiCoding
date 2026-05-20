import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Play, Pause, SkipForward, Mic, Volume2, CheckCircle, RefreshCw } from 'lucide-react'
import { Waveform } from '../../components/common/Waveform'
import { ScoreDisplay } from '../../components/common/ScoreDisplay'
import { practiceSentences, evaluatePronunciation, generateWaveformData } from '../../data/mockData'
import clsx from 'clsx'

export const PronunciationRepeat: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [state, setState] = useState<'idle' | 'playing' | 'waiting' | 'recording' | 'scored'>('idle')
  const [countdown, setCountdown] = useState(3)
  const [scores, setScores] = useState<number[]>([])
  const [userWaveform, setUserWaveform] = useState<number[]>([])
  const [showTranslation, setShowTranslation] = useState(false)

  const timerRef = useRef<number | null>(null)
  const countdownRef = useRef<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const currentSentence = practiceSentences[currentIndex]

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const speakSentence = (callback?: () => void) => {
    const utterance = new SpeechSynthesisUtterance(currentSentence.text)
    utterance.lang = 'en-US'
    utterance.rate = 0.8

    utterance.onstart = () => {
      setIsPlaying(true)
      setState('playing')
    }

    utterance.onend = () => {
      setIsPlaying(false)
      if (callback) callback()
    }

    speechSynthesis.speak(utterance)
  }

  const startPractice = () => {
    speakSentence(() => {
      setState('waiting')
      setCountdown(3)

      countdownRef.current = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current)
            startRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const audioChunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        setIsRecording(false)
        setUserWaveform(generateWaveformData(50))
        const newScore = evaluatePronunciation()
        setScore(newScore)
        setScores(prev => [...prev, newScore])
        setState('scored')

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setState('recording')

      timerRef.current = window.setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }, 15000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handleNext = () => {
    if (currentIndex < practiceSentences.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setScore(null)
      setState('idle')
      setUserWaveform([])
      setShowTranslation(false)
    }
  }

  const handleRetry = () => {
    setScore(null)
    setState('idle')
    setUserWaveform([])
    setShowTranslation(false)
  }

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/pronunciation" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">跟读练习</h1>
          <p className="text-gray-500">听标准发音，然后跟读，AI实时评分</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="badge badge-primary">
                  {currentIndex + 1} / {practiceSentences.length}
                </span>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentIndex + 1) / practiceSentences.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${
                  currentSentence.difficulty === 'easy' ? 'badge-success' :
                  currentSentence.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
                }`}>
                  {currentSentence.difficulty === 'easy' ? '简单' :
                   currentSentence.difficulty === 'medium' ? '中等' : '困难'}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 rounded-2xl p-8 mb-6 relative overflow-hidden">
              {state === 'playing' && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent animate-pulse" />
              )}
              <div className="relative z-10">
                <p className="text-2xl font-medium text-gray-800 leading-relaxed mb-4">
                  "{currentSentence.text}"
                </p>
                {showTranslation && (
                  <p className="text-gray-600 text-lg animate-fade-in">
                    {currentSentence.translation}
                  </p>
                )}
                {state !== 'idle' && state !== 'playing' && (
                  <div className="mt-4">
                    <Waveform
                      data={state === 'recording' ? generateWaveformData(50) : userWaveform}
                      color={state === 'scored' ? 'success' : 'primary'}
                      height={60}
                      animated={state === 'recording'}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              {state === 'idle' && (
                <button
                  onClick={startPractice}
                  className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                >
                  <Play className="w-6 h-6" />
                  开始练习
                </button>
              )}

              {state === 'playing' && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Volume2 className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-lg text-gray-600">正在播放标准发音...</p>
                </div>
              )}

              {state === 'waiting' && (
                <div className="text-center">
                  <div className="relative w-24 h-24 mb-4">
                    <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-30" />
                    <div className="relative w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">{countdown}</span>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600">准备跟读...</p>
                </div>
              )}

              {state === 'recording' && (
                <div className="text-center">
                  <button
                    onClick={stopRecording}
                    className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-4 recording-pulse hover:bg-red-600 transition-colors"
                  >
                    <Mic className="w-12 h-12 text-white" />
                  </button>
                  <p className="text-lg text-red-600 font-medium">正在录音，点击完成</p>
                </div>
              )}

              {state === 'scored' && score !== null && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={handleRetry}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      重试
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentIndex >= practiceSentences.length - 1}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipForward className="w-5 h-5" />
                      下一句
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {showTranslation ? '隐藏翻译' : '显示翻译'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">本次得分</h3>
            <div className="flex justify-center">
              {score !== null ? (
                <ScoreDisplay score={score} label="发音评分" />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400 text-center text-sm">
                    完成练习后<br />查看得分
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">练习进度</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">已完成</span>
                <span className="font-medium text-primary-600">{scores.length} 句</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">平均分</span>
                <span className="font-medium text-green-600">{averageScore} 分</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(scores.length / practiceSentences.length) * 100}%` }}
                />
              </div>
            </div>

            {scores.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                {scores.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-600">第 {idx + 1} 句</span>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'text-sm font-medium',
                        s >= 80 ? 'text-green-600' :
                        s >= 60 ? 'text-primary-600' :
                        s >= 40 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {s}分
                      </span>
                      {s >= 80 && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
