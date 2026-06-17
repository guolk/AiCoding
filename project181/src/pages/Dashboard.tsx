import { useNavigate } from 'react-router-dom'
import { Key, Monitor, Activity, AlertTriangle, RefreshCw, Shield, ChevronRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useCyberStore } from '@/store'
import {
  calculateAccountScore,
  calculateDeviceScore,
  calculateHabitScore,
  calculateIncidentScore,
  calculateOverallScore,
  getScoreLevel,
  formatDate,
} from '@/utils/score'

const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ScoreGauge({ score }: { score: number }) {
  const level = getScoreLevel(score)
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="#1e293b"
          strokeWidth="12"
        />
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke={level.color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-mono text-5xl font-bold ${level.className}`}>
          {score}
        </span>
        <span className={`font-mono text-sm mt-1 ${level.className}`}>
          {level.label}
        </span>
      </div>
    </div>
  )
}

interface ModuleCardProps {
  icon: React.ReactNode
  name: string
  score: number
  accentColor: string
  glowClass: string
  onClick: () => void
}

function ModuleCard({ icon, name, score, accentColor, glowClass, onClick }: ModuleCardProps) {
  const level = getScoreLevel(score)

  return (
    <button
      onClick={onClick}
      className={`cyber-card cyber-card-glow flex flex-col gap-3 p-5 text-left transition-all hover:scale-[1.02] ${glowClass}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-cyber-surface`} style={{ color: accentColor }}>
          {icon}
        </div>
        <span className="font-mono text-sm text-slate-400">{name}</span>
      </div>
      <span className={`font-mono text-3xl font-bold ${level.className}`}>{score}</span>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${score}%`, backgroundColor: level.color }}
        />
      </div>
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    accounts,
    devices,
    securityHabits,
    vulnerabilities,
    securityIncidents,
    scoreHistory,
    addScoreRecord,
  } = useCyberStore()

  const accountScore = calculateAccountScore(accounts)
  const deviceScore = calculateDeviceScore(devices)
  const habitScore = calculateHabitScore(securityHabits, vulnerabilities)
  const incidentScore = calculateIncidentScore(securityIncidents)
  const overallScore = calculateOverallScore(accountScore, deviceScore, habitScore, incidentScore)

  const noTwoFA = accounts.filter((a) => !a.twoFactorEnabled).length
  const weakPasswords = accounts.filter((a) => a.passwordStrength === 'weak').length
  const failedDevices = devices.filter(
    (d) => !d.osUpdated || !d.antivirusActive || !d.screenLockEnabled || !d.diskEncrypted
  ).length
  const incompleteHabits = securityHabits.filter((h) => !h.isCompleted).length
  const unfixedVulns = vulnerabilities.filter((v) => v.status !== 'fixed').length
  const ongoingIncidents = securityIncidents.filter((i) => i.status === 'ongoing').length
  const criticalIncidents = securityIncidents.filter((i) => i.severity === 'critical').length

  const riskItems = [
    { module: '账号安全', count: noTwoFA + weakPasswords, icon: Key, color: '#00d4ff' },
    { module: '设备安全', count: failedDevices, icon: Monitor, color: '#ffb800' },
    { module: '安全习惯', count: incompleteHabits + unfixedVulns, icon: Activity, color: '#00ff88' },
    { module: '事件管理', count: ongoingIncidents + criticalIncidents, icon: AlertTriangle, color: '#ff3366' },
  ]

  const urgentItems: { text: string; color: string }[] = []

  criticalIncidents > 0 &&
    urgentItems.push({ text: `${criticalIncidents} 个严重安全事件待处理`, color: '#ff3366' })
  ongoingIncidents > 0 &&
    urgentItems.push({ text: `${ongoingIncidents} 个安全事件进行中`, color: '#ff3366' })
  unfixedVulns > 0 &&
    urgentItems.push({ text: `${unfixedVulns} 个漏洞未修复`, color: '#ffb800' })
  weakPasswords > 0 &&
    urgentItems.push({ text: `${weakPasswords} 个账号密码过弱`, color: '#00d4ff' })
  noTwoFA > 0 &&
    urgentItems.push({ text: `${noTwoFA} 个账号未开启双重认证`, color: '#00d4ff' })
  failedDevices > 0 &&
    urgentItems.push({ text: `${failedDevices} 台设备安全检查未通过`, color: '#ffb800' })
  incompleteHabits > 0 &&
    urgentItems.push({ text: `${incompleteHabits} 项安全习惯未完成`, color: '#00ff88' })

  const topUrgent = urgentItems.slice(0, 5)

  const handleRefresh = () => {
    addScoreRecord({
      date: new Date().toISOString(),
      overall: overallScore,
      accounts: accountScore,
      devices: deviceScore,
      habits: habitScore,
    })
  }

  const modules = [
    {
      icon: <Key size={20} />,
      name: '账号安全',
      score: accountScore,
      accentColor: '#00d4ff',
      glowClass: 'shadow-glow-blue',
      path: '/accounts',
    },
    {
      icon: <Monitor size={20} />,
      name: '设备安全',
      score: deviceScore,
      accentColor: '#ffb800',
      glowClass: 'shadow-glow-amber',
      path: '/devices',
    },
    {
      icon: <Activity size={20} />,
      name: '安全习惯',
      score: habitScore,
      accentColor: '#00ff88',
      glowClass: 'shadow-glow-green',
      path: '/habits',
    },
    {
      icon: <AlertTriangle size={20} />,
      name: '事件管理',
      score: incidentScore,
      accentColor: '#ff3366',
      glowClass: 'shadow-glow-red',
      path: '/incidents',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 py-8">
        <ScoreGauge score={overallScore} />
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyber-surface border border-cyber-border font-mono text-sm text-cyber-green hover:bg-cyber-card transition-colors"
        >
          <RefreshCw size={14} />
          刷新评分
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((m) => (
          <ModuleCard
            key={m.name}
            icon={m.icon}
            name={m.name}
            score={m.score}
            accentColor={m.accentColor}
            glowClass={m.glowClass}
            onClick={() => navigate(m.path)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-cyber-amber" />
            <h2 className="font-mono text-base text-slate-300">风险概览</h2>
          </div>

          <div className="flex flex-col gap-2">
            {riskItems.map((item) => (
              <div
                key={item.module}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-cyber-surface"
              >
                <div className="flex items-center gap-2">
                  <item.icon size={16} style={{ color: item.color }} />
                  <span className="font-mono text-sm text-slate-400">{item.module}</span>
                </div>
                <span className="font-mono text-sm font-bold" style={{ color: item.count > 0 ? item.color : '#00ff88' }}>
                  {item.count > 0 ? `${item.count} 项风险` : '无风险'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2">
            <h3 className="font-mono text-sm text-slate-400 mb-3">待处理事项</h3>
            {topUrgent.length === 0 ? (
              <div className="px-3 py-4 text-center font-mono text-sm text-cyber-green">
                暂无待处理事项
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {topUrgent.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyber-surface"
                  >
                    <ChevronRight size={14} style={{ color: item.color }} />
                    <span className="font-mono text-sm text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="cyber-card p-5 flex flex-col gap-4">
          <h2 className="font-mono text-base text-slate-300">评分趋势</h2>
          {scoreHistory.length === 0 ? (
            <div className="flex items-center justify-center h-64 font-mono text-sm text-slate-500">
              暂无历史数据，点击刷新评分开始记录
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={scoreHistory} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => formatDate(v)}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                  labelFormatter={(v: string) => formatDate(v)}
                />
                <Legend
                  wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="overall" name="总评" stroke="#00ff88" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="accounts" name="账号" stroke="#00d4ff" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="devices" name="设备" stroke="#ffb800" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="habits" name="习惯" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
