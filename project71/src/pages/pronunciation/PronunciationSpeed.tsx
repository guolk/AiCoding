import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Play, Mic, Zap, Trophy, ChevronRight, RotateCcw, Volume2 } from 'lucide-react'
import { ScoreDisplay } from '../../components/common/ScoreDisplay'
import { practiceSentences, evaluateFluency, generateWaveformData } from '../../data/mockData'
import clsx from 'clsx'

const speedLevels = [
  { level: 1, name: '入门', speed: 0.6, wpm: 60, timeLimit: 30, color: 'green' },
  { level: 2, name: '初级', speed: 0.8, wpm: 80, timeLimit: 25, color: 'blue' },
  { level: 3, name: '中级', speed: 1.0, wpm: 100, timeLimit: 20, color: 'primary' },
  { level: 4, name: '高级', speed: 1.2, wpm: 120, timeLimit: 18, color: 'purple' },
  { level: 5, name: '专家', speed: 1.5, wpm: 150, timeLimit: 15, color: 'red' }
]

export const PronunciationSpeed: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'recording' | 'result' | 'completed'>('idle')
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft] = useState(30)
  const [score, setScore] = useState<number | null>(null)
  const [levelScores, setLevelScores] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [passedLevels, setPassedLevels] = useState<number[]>([])

  const timerRef = useRef<number | null>(null)
  const countdownRef = useRef<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const currentSpeed = speedLevels[currentLevel]
  const currentSentence = practiceSentences[currentSentenceIndex % practiceSentences.length]

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startLevel = () => {
    setGameState('countdown')
    setCountdown(3)
    setScore(null)
    setTimeLeft(currentSpeed.timeLimit)

    countdownRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          startPlaying()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startPlaying = () => {
    const utterance = new SpeechSynthesisUtterance(currentSentence.text)
    utterance.lang = 'en-US'
    utterance.rate = currentSpeed.speed

    utterance.onstart = () => {
      setIsPlaying(true)
      setGameState('playing')
    }

    utterance.onend = () => {
      setIsPlaying(false)
      startRecording()
    }

    speechSynthesis.speak(utterance)
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
        finishRecording()

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setGameState('recording')

      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const finishRecording = () => {
    const timeUsed = currentSpeed.timeLimit - timeLeft
    const wpmScore = Math.max(0, Math.min(100, (timeUsed / currentSpeed.timeLimit) * 100))
    const fluencyScore = evaluateFluency(currentSpeed.wpm)
    const finalScore = Math.round((wpmScore * 0.4) + (fluencyScore * 0.6))

    setScore(finalScore)
    setLevelScores(prev => [...prev, finalScore])
    setGameState('result')

    if (finalScore >= 60 && !passedLevels.includes(currentLevel)) {
      setPassedLevels(prev => [...prev, currentLevel])
    }
  }

  const handleNext = () => {
    if (currentLevel < speedLevels.length - 1 && (score ?? 0) >= 60) {
      setCurrentLevel(prev => prev + 1)
      setCurrentSentenceIndex(prev => prev + 1)
      setGameState('idle')
      setScore(null)
    } else {
      setGameState('completed')
    }
  }

  const handleRetry = () => {
    setCurrentSentenceIndex(prev => prev + 1)
    setGameState('idle')
    setScore(null)
    setTimeLeft(currentSpeed.timeLimit)
  }

  const handleRestart = () => {
    setCurrentLevel(0)
    setCurrentSentenceIndex(0)
    setGameState('idle')
    setScore(null)
    setLevelScores([])
    setPassedLevels([])
    setTimeLeft(speedLevels[0].timeLimit)
  }

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      primary: 'bg-primary-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500'
    }
    return colors[color] || 'bg-primary-500'
  }

  const getLightColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-50 text-green-700 border-green-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      primary: 'bg-primary-50 text-primary-700 border-primary-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    }
    return colors[color] || 'bg-primary-50 text-primary-700 border-primary-200'
  }

  const totalScore = levelScores.length > 0
    ? Math.round(levelScores.reduce((a, b) => a + b, 0) / levelScores.length)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/pronunciation" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">语速挑战</h1>
          <p className="text-gray-500">逐渐加快的跟读挑战，提升你的流利度</p>
        </div>
      </div>

      {gameState === 'completed' ? (
        <div className="card text-center py-12">
          <Trophy className="w-24 h-24 text-amber-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">挑战完成！</h2>
          <p className="text-xl text-gray-600 mb-6">
            你通过了 {passedLevels.length} / {speedLevels.length} 个等级
          </p>
          <div className="flex justify-center mb-8">
            <ScoreDisplay score={totalScore} label="总平均分" size={180} />
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={handleRestart} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              重新挑战
            </button>
            <Link to="/pronunciation" className="btn-primary flex items-center gap-2">
              返回口语练习
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {speedLevels.map((level, idx) => (
                    <div
                      key={level.level}
                      className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                        idx < currentLevel
                          ? 'bg-green-500 text-white'
                          : idx === currentLevel
                          ? `${getColorClass(level.color)} text-white ring-4 ring-offset-2 ${getColorClass(level.color).replace('bg-', 'ring-').replace('500', '200')}`
                          : 'bg-gray-200 text-gray-500'
                      )}
                    >
                      {idx < currentLevel ? '✓' : level.level}
                    </div>
                  ))}
                </div>
                <span className={`badge ${getLightColorClass(currentSpeed.color)} border`}>
                  {currentSpeed.name} - {currentSpeed.wpm} WPM
                </span>
              </div>

              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl p-8 mb-6 relative overflow-hidden">
                {gameState === 'playing' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent animate-pulse" />
                )}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center gap-2 text-amber-600 font-medium">
                      <Zap className="w-5 h-5" />
                      语速等级 {currentLevel + 1}
                    </span>
                    <span className="text-2xl font-mono font-bold text-gray-700">
                      {timeLeft}s
                    </span>
                  </div>
                  <p className="text-2xl font-medium text-gray-800 leading-relaxed mb-4">
                    "{currentSentence.text}"
                  </p>
                  <p className="text-gray-500">
                    {currentSentence.translation}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                {gameState === 'idle' && (
                  <button
                    onClick={startLevel}
                    className="btn-primary flex items-center gap-2 text-lg px-10 py-4"
                  >
                    <Play className="w-6 h-6" />
                    开始挑战
                  </button>
                )}

                {gameState === 'countdown' && (
                  <div className="text-center">
                    <div className="relative w-28 h-28 mb-4">
                      <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-30" />
                      <div className="relative w-28 h-28 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-5xl font-bold text-white">{countdown}</span>
                      </div>
                    </div>
                    <p className="text-xl text-gray-600">准备...</p>
                  </div>
                )}

                {gameState === 'playing' && (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <Volume2 className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-lg text-gray-600">仔细听标准发音...</p>
                  </div>
                )}

                {gameState === 'recording' && (
                  <div className="text-center">
                    <button
                      onClick={stopRecording}
                      className="w-28 h-28 bg-red-500 rounded-full flex items-center justify-center mb-4 recording-pulse hover:bg-red-600 transition-colors"
                    >
                      <Mic className="w-14 h-14 text-white" />
                    </button>
                    <p className="text-lg text-red-600 font-medium">跟读！点击完成</p>
                    <div className="flex items-center justify-center gap-[3px] h-12 mt-4">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-500 rounded-full wave-bar"
                          style={{
                            animationDelay: `${i * 0.03}s`,
                            height: `${generateWaveformData(30)[i]}%`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {gameState === 'result' && score !== null && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={handleRetry}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        重试本关
                      </button>
                      <button
                        onClick={handleNext}
                        className="btn-primary flex items-center gap-2"
                      >
                        {currentLevel < speedLevels.length - 1 && score >= 60 ? (
                          <>
                            下一关 <ChevronRight className="w-5 h-5" />
                          </>
                        ) : (
                          '查看结果'
                        )}
                      </button>
                    </div>
                    {score < 60 && (
                      <p className="text-sm text-amber-600">
                        得分低于60分，无法进入下一关
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">本关得分</h3>
              <div className="flex justify-center">
                {score !== null ? (
                  <ScoreDisplay score={score} label="综合评分" />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400 text-center text-sm">
                      完成挑战后<br />查看得分
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">等级说明</h3>
              <div className="space-y-3">
                {speedLevels.map((level) => (
                  <div
                    key={level.level}
                    className={clsx(
                      'p-3 rounded-xl border transition-all',
                      level.level === currentLevel + 1
                        ? getLightColorClass(level.color)
                        : passedLevels.includes(level.level - 1)
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{level.name}</span>
                      <span className="text-sm">{level.wpm} WPM</span>
                    </div>
                    <div className="text-xs mt-1 opacity-75">
                      语速 x{level.speed} | 限时 {level.timeLimit}秒
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {levelScores.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-800 mb-4">挑战记录</h3>
                <div className="space-y-2">
                  {levelScores.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">等级 {idx + 1}</span>
                      <span className={clsx(
                        'text-sm font-medium',
                        s >= 80 ? 'text-green-600' :
                        s >= 60 ? 'text-primary-600' :
                        s >= 40 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {s}分
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
