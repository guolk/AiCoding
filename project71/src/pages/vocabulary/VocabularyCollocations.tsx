import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy, ChevronRight } from 'lucide-react'
import { collocationExercises } from '../../data/mockData'
import { CollocationExercise } from '../../types'
import clsx from 'clsx'

export const VocabularyCollocations: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [state, setState] = useState<'practicing' | 'completed'>('practicing')

  const currentExercise = collocationExercises[currentIndex]

  const handleSelect = (option: string) => {
    if (showResult) return
    setSelectedOption(option)
  }

  const handleSubmit = () => {
    if (!selectedOption) return

    const isCorrect = selectedOption === currentExercise.answer
    const score = isCorrect ? 100 : 0
    setScores(prev => [...prev, score])
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentIndex < collocationExercises.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowResult(false)
    } else {
      setState('completed')
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setShowResult(false)
    setScores([])
    setState('practicing')
  }

  const correctCount = scores.filter(s => s === 100).length
  const totalScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  if (state === 'completed') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/vocabulary" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">搭配练习</h1>
            <p className="text-gray-500">练习完成！</p>
          </div>
        </div>

        <div className="card text-center py-12">
          <Trophy className="w-24 h-24 text-amber-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">练习完成！</h2>
          <p className="text-gray-500 mb-8">
            你完成了 {collocationExercises.length} 道搭配练习
          </p>

          <div className="flex justify-center gap-8 mb-8">
            <div className="p-6 bg-green-50 rounded-2xl">
              <p className="text-4xl font-bold text-green-600">{correctCount}</p>
              <p className="text-sm text-gray-500">正确</p>
            </div>
            <div className="p-6 bg-red-50 rounded-2xl">
              <p className="text-4xl font-bold text-red-600">{scores.length - correctCount}</p>
              <p className="text-sm text-gray-500">错误</p>
            </div>
            <div className="p-6 bg-primary-50 rounded-2xl">
              <p className="text-4xl font-bold text-primary-600">{totalScore}%</p>
              <p className="text-sm text-gray-500">正确率</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={handleRestart} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              再来一次
            </button>
            <Link to="/vocabulary" className="btn-primary flex items-center gap-2">
              返回词汇模块
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">答题详情</h3>
          <div className="space-y-3">
            {collocationExercises.map((ex, idx) => {
              const userAnswer = scores[idx] === 100 ? ex.answer : 'wrong'
              const isCorrect = scores[idx] === 100
              return (
                <div
                  key={ex.id}
                  className={clsx(
                    'p-4 rounded-xl border-2',
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-gray-800">
                        {ex.sentence.replace('___', '______')}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="text-gray-500">正确答案：</span>
                        <span className="font-semibold text-green-600">{ex.answer}</span>
                        {!isCorrect && (
                          <>
                            <span className="text-gray-400 mx-2">|</span>
                            <span className="text-gray-500">你的答案：</span>
                            <span className="font-semibold text-red-600">
                              {idx < scores.length ? collocationExercises[idx].options.find((_, i) => i === 0) : ''}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <span className="badge bg-gray-100 text-gray-600">{ex.category}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vocabulary" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">搭配练习</h1>
          <p className="text-gray-500">填空练习常用搭配的使用</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="badge badge-primary">
                  {currentIndex + 1} / {collocationExercises.length}
                </span>
                <span className="badge bg-gray-100 text-gray-600">
                  {currentExercise.category}
                </span>
              </div>
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentIndex + 1) / collocationExercises.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-6">
              <p className="text-2xl font-medium text-gray-800 leading-relaxed">
                {currentExercise.sentence.split('___').map((part, idx, arr) => (
                  <React.Fragment key={idx}>
                    {part}
                    {idx < arr.length - 1 && (
                      <span className="inline-block min-w-[80px] h-10 border-b-4 border-indigo-400 mx-2 relative">
                        {showResult && (
                          <span className={clsx(
                            'absolute -top-8 left-1/2 -translate-x-1/2 text-lg font-bold',
                            selectedOption === currentExercise.answer ? 'text-green-600' : 'text-red-600'
                          )}>
                            {selectedOption}
                          </span>
                        )}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {currentExercise.options.map((option, idx) => {
                const isSelected = selectedOption === option
                const isCorrect = option === currentExercise.answer

                let buttonClass = 'p-4 rounded-xl border-2 text-lg font-medium transition-all'
                if (showResult) {
                  if (isCorrect) {
                    buttonClass += ' border-green-500 bg-green-50 text-green-700'
                  } else if (isSelected && !isCorrect) {
                    buttonClass += ' border-red-500 bg-red-50 text-red-700'
                  } else {
                    buttonClass += ' border-gray-200 bg-gray-50 text-gray-400'
                  }
                } else {
                  if (isSelected) {
                    buttonClass += ' border-primary-500 bg-primary-50 text-primary-700'
                  } else {
                    buttonClass += ' border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(option)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {showResult && (
              <div className={clsx(
                'p-4 rounded-xl mb-6 flex items-start gap-3',
                selectedOption === currentExercise.answer
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              )}>
                {selectedOption === currentExercise.answer ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <p className={clsx(
                    'font-semibold',
                    selectedOption === currentExercise.answer ? 'text-green-700' : 'text-red-700'
                  )}>
                    {selectedOption === currentExercise.answer ? '回答正确！' : '回答错误'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    正确搭配是 <span className="font-semibold">"{currentExercise.answer}"</span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              {!showResult ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  提交答案
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2"
                >
                  {currentIndex < collocationExercises.length - 1 ? (
                    <>
                      下一题 <ChevronRight className="w-5 h-5" />
                    </>
                  ) : (
                    '查看结果'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">练习进度</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">当前题数</span>
                <span className="font-medium text-primary-600">{currentIndex + 1} / {collocationExercises.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">正确数</span>
                <span className="font-medium text-green-600">{correctCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">正确率</span>
                <span className="font-bold text-primary-600">{totalScore}%</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">答题记录</h3>
            <div className="grid grid-cols-4 gap-2">
              {collocationExercises.map((_, idx) => {
                let bgClass = 'bg-gray-100'
                if (idx < scores.length) {
                  bgClass = scores[idx] === 100 ? 'bg-green-500' : 'bg-red-500'
                } else if (idx === currentIndex) {
                  bgClass = 'bg-primary-500'
                }
                return (
                  <div
                    key={idx}
                    className={clsx(
                      'aspect-square rounded-lg flex items-center justify-center text-sm font-medium text-white',
                      bgClass
                    )}
                  >
                    {idx + 1}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">小贴士</h3>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-800">
                💡 固定搭配是英语学习的重点，多做练习可以帮助你在实际对话中更自然地使用这些表达。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
