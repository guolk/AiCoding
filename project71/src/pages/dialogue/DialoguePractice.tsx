import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Lightbulb, Volume2, ChevronRight, Eye, EyeOff, Send, RotateCcw, Trophy, Award } from 'lucide-react'
import { dialogueScenarios, evaluatePronunciation } from '../../data/mockData'
import { ScoreDisplay } from '../../components/common/ScoreDisplay'
import clsx from 'clsx'

export const DialoguePractice: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const scenario = dialogueScenarios.find(s => s.id === id)

  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [hintUsedCount, setHintUsedCount] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [scores, setScores] = useState<number[]>([])
  const [state, setState] = useState<'select_role' | 'practicing' | 'user_turn' | 'completed'>('select_role')
  const [lineScore, setLineScore] = useState<number | null>(null)
  const [showTranslation, setShowTranslation] = useState(false)

  useEffect(() => {
    if (!scenario) {
      navigate('/dialogue')
    }
  }, [scenario, navigate])

  if (!scenario) return null

  const currentLine = scenario.lines[currentLineIndex]
  const isUserTurn = currentLine?.role !== scenario.roles.find(r => r !== selectedRole)

  const speakLine = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const startPractice = (role: string) => {
    setSelectedRole(role)
    setState('practicing')
    setCurrentLineIndex(0)
    setScores([])
    setHintUsedCount(0)

    setTimeout(() => {
      processNextLine(0, role)
    }, 500)
  }

  const processNextLine = (index: number, role: string | null = selectedRole) => {
    if (index >= scenario.lines.length) {
      setState('completed')
      return
    }

    const line = scenario.lines[index]
    const otherRole = scenario.roles.find(r => r !== role)

    if (line.role !== role) {
      setState('practicing')
      speakLine(line.text)
      setTimeout(() => {
        setCurrentLineIndex(index + 1)
        if (index + 1 < scenario.lines.length) {
          processNextLine(index + 1, role)
        } else {
          setState('completed')
        }
      }, 3000)
    } else {
      setState('user_turn')
      setShowHint(false)
      setUserInput('')
      setLineScore(null)
    }
  }

  const handleHint = () => {
    setShowHint(true)
    setHintUsedCount(prev => prev + 1)
  }

  const handleSubmit = () => {
    if (!userInput.trim()) return

    const baseScore = evaluatePronunciation()
    const hintPenalty = showHint ? 15 : 0
    const finalScore = Math.max(0, baseScore - hintPenalty)

    setLineScore(finalScore)
    setScores(prev => [...prev, finalScore])

    setTimeout(() => {
      setCurrentLineIndex(prev => prev + 1)
      if (currentLineIndex + 1 < scenario.lines.length) {
        processNextLine(currentLineIndex + 1)
      } else {
        setState('completed')
      }
    }, 2000)
  }

  const handleSkip = () => {
    setScores(prev => [...prev, 0])
    setCurrentLineIndex(prev => prev + 1)
    if (currentLineIndex + 1 < scenario.lines.length) {
      processNextLine(currentLineIndex + 1)
    } else {
      setState('completed')
    }
  }

  const handleRestart = () => {
    setSelectedRole(null)
    setCurrentLineIndex(0)
    setShowHint(false)
    setHintUsedCount(0)
    setUserInput('')
    setScores([])
    setState('select_role')
    setLineScore(null)
  }

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  const totalPenalty = hintUsedCount * 15
  const finalScore = Math.max(0, averageScore - Math.round(totalPenalty / Math.max(1, scores.length)))

  const getRoleColor = (role: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500']
    const index = scenario.roles.indexOf(role)
    return colors[index % colors.length]
  }

  if (state === 'completed') {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <Trophy className="w-20 h-20 text-amber-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">对话完成！</h2>
          <p className="text-gray-500 mb-8">
            你已完成"{scenario.title}"场景的对话练习
          </p>

          <div className="flex justify-center gap-8 mb-8">
            <ScoreDisplay score={finalScore} label="最终得分" />
            <div className="flex flex-col justify-center gap-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-gray-500">平均分</p>
                <p className="text-2xl font-bold text-green-600">{averageScore}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-gray-500">提示使用</p>
                <p className="text-2xl font-bold text-amber-600">{hintUsedCount}次</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-gray-500">扣分</p>
                <p className="text-2xl font-bold text-red-600">-{Math.round(totalPenalty / Math.max(1, scores.length))}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={handleRestart} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              重新练习
            </button>
            <Link to="/dialogue" className="btn-primary flex items-center gap-2">
              返回场景列表
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">每句得分</h3>
          <div className="space-y-2">
            {scores.map((score, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                  {idx + 1}
                </span>
                <span className="flex-1 text-gray-700 text-sm truncate">
                  {scenario.lines[idx]?.text}
                </span>
                <span className={clsx(
                  'font-bold',
                  score >= 80 ? 'text-green-600' :
                  score >= 60 ? 'text-primary-600' :
                  score >= 40 ? 'text-amber-600' : 'text-red-600'
                )}>
                  {score}
                </span>
                {score >= 80 && <Award className="w-5 h-5 text-amber-500" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dialogue" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{scenario.icon} {scenario.title}</h1>
          <p className="text-gray-500">{scenario.description}</p>
        </div>
      </div>

      {state === 'select_role' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-2">选择你的角色</h2>
          <p className="text-gray-500 mb-6">选择你想扮演的角色，开始对话练习</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenario.roles.map(role => (
              <button
                key={role}
                onClick={() => startPractice(role)}
                className="p-6 border-2 border-gray-200 rounded-2xl hover:border-primary-400 hover:bg-primary-50 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${getRoleColor(role)} rounded-2xl flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform`}>
                    {role[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{role}</h3>
                    <p className="text-sm text-gray-500">点击开始扮演这个角色</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-primary-500 ml-auto transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {(state === 'practicing' || state === 'user_turn') && selectedRole && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {scenario.roles.map((role, idx) => (
                      <div
                        key={role}
                        className={clsx(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 border-white',
                          role === selectedRole ? 'ring-4 ring-primary-200 ' + getRoleColor(role) : getRoleColor(role)
                        )}
                      >
                        {role[0]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">你扮演：{selectedRole}</p>
                    <p className="text-sm text-gray-500">对话进度 {currentLineIndex} / {scenario.lines.length}</p>
                  </div>
                </div>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentLineIndex / scenario.lines.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin pr-2">
                {scenario.lines.slice(0, currentLineIndex + 1).map((line, idx) => (
                  <div
                    key={line.id}
                    className={clsx(
                      'flex gap-3',
                      line.role === selectedRole ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {line.role !== selectedRole && (
                      <div className={`w-10 h-10 ${getRoleColor(line.role)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        {line.speaker[0]}
                      </div>
                    )}
                    <div
                      className={clsx(
                        'max-w-[70%] p-4 rounded-2xl',
                        line.role === selectedRole
                          ? 'bg-primary-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md',
                        idx === currentLineIndex && 'ring-2 ring-primary-300'
                      )}
                    >
                      <p className="text-xs font-medium opacity-75 mb-1">{line.speaker}</p>
                      <p className="text-base">{line.text}</p>
                      {showTranslation && line.hint && (
                        <p className="text-xs mt-2 opacity-75">{line.hint}</p>
                      )}
                    </div>
                    {line.role === selectedRole && (
                      <div className={`w-10 h-10 ${getRoleColor(line.role)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        {line.speaker[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {state === 'user_turn' && currentLine && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-500" />
                    轮到你说话了
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showTranslation ? '隐藏翻译' : '显示翻译'}
                    </button>
                    <button
                      onClick={() => speakLine(currentLine.text)}
                      className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                      听示范
                    </button>
                  </div>
                </div>

                {lineScore !== null ? (
                  <div className="flex items-center justify-center py-6">
                    <ScoreDisplay score={lineScore} label="本句得分" size={120} />
                  </div>
                ) : (
                  <>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="输入你想说的话..."
                      className="input-field min-h-32 resize-none mb-4"
                    />

                    {showHint && currentLine.hint && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                        <p className="text-amber-800 text-sm">
                          <Lightbulb className="w-4 h-4 inline mr-1" />
                          提示：{currentLine.hint}
                        </p>
                        <p className="text-amber-600 text-xs mt-1">使用提示将扣除15分</p>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <button
                        onClick={handleHint}
                        disabled={showHint}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Lightbulb className="w-5 h-5" />
                        查看提示
                      </button>
                      <div className="flex gap-3">
                        <button onClick={handleSkip} className="btn-secondary">
                          跳过
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={!userInput.trim()}
                          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                          提交
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {state === 'practicing' && (
              <div className="card text-center py-8">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Volume2 className="w-10 h-10 text-primary-500" />
                </div>
                <p className="text-lg text-gray-600">正在播放对方的台词...</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">对话角色</h3>
              <div className="space-y-3">
                {scenario.roles.map(role => (
                  <div
                    key={role}
                    className={clsx(
                      'flex items-center gap-3 p-3 rounded-xl transition-all',
                      role === selectedRole ? 'bg-primary-50 border-2 border-primary-200' : 'bg-gray-50'
                    )}
                  >
                    <div className={`w-12 h-12 ${getRoleColor(role)} rounded-xl flex items-center justify-center text-white font-bold`}>
                      {role[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{role}</p>
                      {role === selectedRole && (
                        <p className="text-xs text-primary-600">你扮演的角色</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">练习信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">已完成</span>
                  <span className="font-medium text-primary-600">{currentLineIndex} 句</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">剩余</span>
                  <span className="font-medium text-gray-600">{scenario.lines.length - currentLineIndex} 句</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">已用提示</span>
                  <span className="font-medium text-amber-600">{hintUsedCount} 次</span>
                </div>
                {scores.length > 0 && (
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-gray-500">当前平均分</span>
                    <span className="font-bold text-green-600">
                      {Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)} 分
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleRestart} className="w-full btn-secondary">
              <RotateCcw className="w-4 h-4 inline mr-2" />
              重新开始
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
