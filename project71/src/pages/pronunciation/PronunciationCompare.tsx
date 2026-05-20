import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Volume2, RefreshCw, Info } from 'lucide-react'
import { Waveform } from '../../components/common/Waveform'
import { ScoreDisplay } from '../../components/common/ScoreDisplay'
import { AudioRecorder } from '../../components/common/AudioRecorder'
import { pronunciationWords, generateWaveformData, evaluatePronunciation } from '../../data/mockData'

export const PronunciationCompare: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [standardWaveform] = useState(() => generateWaveformData(50))
  const [userWaveform, setUserWaveform] = useState<number[]>([])
  const [showDetails, setShowDetails] = useState(false)

  const currentWord = pronunciationWords[currentWordIndex]

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.7
    speechSynthesis.speak(utterance)
  }

  const handleRecordingComplete = () => {
    setHasRecorded(true)
    setUserWaveform(generateWaveformData(50))
    const newScore = evaluatePronunciation()
    setScore(newScore)
    setShowDetails(true)
  }

  const handleNext = () => {
    if (currentWordIndex < pronunciationWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1)
      setHasRecorded(false)
      setScore(null)
      setUserWaveform([])
      setShowDetails(false)
    }
  }

  const handleReset = () => {
    setHasRecorded(false)
    setScore(null)
    setUserWaveform([])
    setShowDetails(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/pronunciation" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">发音对比练习</h1>
          <p className="text-gray-500">录制你的发音，与标准发音波形对比</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary">
                  {currentWordIndex + 1} / {pronunciationWords.length}
                </span>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentWordIndex + 1) / pronunciationWords.length) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                重新开始
              </button>
            </div>

            <div className="text-center py-8">
              <div className="inline-block mb-4">
                <button
                  onClick={speakWord}
                  className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-50 to-blue-50 hover:from-primary-100 hover:to-blue-100 rounded-2xl transition-all border-2 border-primary-200"
                >
                  <Volume2 className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="text-3xl font-bold text-gray-800">{currentWord.word}</p>
                    <p className="text-sm text-gray-500">{currentWord.phonetic}</p>
                  </div>
                </button>
              </div>
              <p className="text-gray-600 text-lg">
                释义：<span className="text-gray-800 font-medium">{currentWord.meaning}</span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    标准发音波形
                  </h4>
                  <button
                    onClick={speakWord}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    重新播放
                  </button>
                </div>
                <Waveform data={standardWaveform} color="primary" height={80} animated={false} />
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">🎤</span>
                  你的发音波形
                </h4>
                {hasRecorded ? (
                  <Waveform data={userWaveform} color="success" height={80} animated={false} />
                ) : (
                  <div className="h-20 flex items-center justify-center text-gray-400">
                    <p>录制你的发音后，这里会显示你的波形图</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDuration={10}
              />
            </div>
          </div>

          {showDetails && score !== null && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-gray-800">AI 分析详情</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">{score}</p>
                  <p className="text-sm text-gray-500">整体相似度</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">{score + Math.floor(Math.random() * 10) - 5}</p>
                  <p className="text-sm text-gray-500">元音准确度</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{score + Math.floor(Math.random() * 10) - 5}</p>
                  <p className="text-sm text-gray-500">辅音准确度</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600">{score + Math.floor(Math.random() * 10) - 5}</p>
                  <p className="text-sm text-gray-500">重音准确度</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-amber-800">
                  <strong>💡 建议：</strong>
                  {score >= 80
                    ? '太棒了！你的发音非常标准，可以尝试更难的单词。'
                    : score >= 60
                    ? '不错！注意重音位置，多听标准发音模仿。'
                    : '继续加油！建议逐音节拆分练习，注意每个音的发音位置。'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">本次得分</h3>
            <div className="flex justify-center">
              {score !== null ? (
                <ScoreDisplay score={score} label="发音相似度" />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400 text-center text-sm">
                    完成录音后<br />查看得分
                  </p>
                </div>
              )}
            </div>
            {score !== null && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleNext}
                  disabled={currentWordIndex >= pronunciationWords.length - 1}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentWordIndex >= pronunciationWords.length - 1 ? '已完成' : '下一个单词'}
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">单词列表</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
              {pronunciationWords.map((word, idx) => (
                <button
                  key={word.id}
                  onClick={() => {
                    setCurrentWordIndex(idx)
                    setHasRecorded(false)
                    setScore(null)
                    setUserWaveform([])
                    setShowDetails(false)
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    idx === currentWordIndex
                      ? 'bg-primary-50 border-2 border-primary-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{word.word}</p>
                      <p className="text-xs text-gray-500">{word.phonetic}</p>
                    </div>
                    {idx < currentWordIndex && (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
