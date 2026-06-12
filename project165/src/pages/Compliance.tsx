import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Check, X, AlertTriangle } from 'lucide-react'
import { useDroneStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'

const tabs = [
  { key: 'zones', label: '飞行区域合规' },
  { key: 'certificates', label: '证书管理' },
  { key: 'incidents', label: '事故报告' },
] as const

type TabKey = (typeof tabs)[number]['key']

export default function Compliance() {
  const [activeTab, setActiveTab] = useState<TabKey>('zones')
  const complianceRecords = useDroneStore((s) => s.complianceRecords)
  const pilots = useDroneStore((s) => s.pilots)
  const incidentReports = useDroneStore((s) => s.incidentReports)
  const flightLogs = useDroneStore((s) => s.flightLogs)

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-accent-500" />
        <h1 className="font-display text-2xl font-bold text-white">法规合规</h1>
      </div>

      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-accent-500 bg-accent-500/20 text-accent-500'
                : 'bg-navy-700/50 text-navy-300 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'zones' && (
        <div className="card-glow rounded-xl bg-navy-700/30 p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-600/50 text-left text-navy-300">
                  <th className="pb-2 pr-4 font-medium">区域名称</th>
                  <th className="pb-2 pr-4 font-medium">是否禁飞区</th>
                  <th className="pb-2 pr-4 font-medium">许可状态</th>
                  <th className="pb-2 pr-4 font-medium">检查时间</th>
                  <th className="pb-2 font-medium">关联飞行</th>
                </tr>
              </thead>
              <tbody>
                {complianceRecords.map((record) => {
                  const flight = flightLogs.find((fl) => fl.id === record.flightLogId)
                  return (
                    <tr key={record.id} className="border-b border-navy-600/30">
                      <td className="py-2 pr-4 text-white">{record.areaName}</td>
                      <td className="py-2 pr-4">
                        {record.isInNoFlyZone ? (
                          <Check className="h-4 w-4 text-red-500" />
                        ) : (
                          <X className="h-4 w-4 text-emerald-500" />
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <StatusBadge status={record.permitStatus} />
                      </td>
                      <td className="py-2 pr-4 text-white">
                        {new Date(record.checkedAt).toLocaleString('zh-CN')}
                      </td>
                      <td className="py-2">
                        {flight ? (
                          <Link
                            to={`/flights/${flight.id}`}
                            className="text-accent-500 hover:underline"
                          >
                            {flight.location}
                          </Link>
                        ) : (
                          <span className="text-navy-400">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {pilots.map((pilot) => (
            <div key={pilot.id} className="card-glow rounded-xl bg-navy-700/30 p-5">
              <div className="mb-3">
                <h3 className="font-display text-lg font-bold text-white">{pilot.name}</h3>
                <p className="text-sm text-navy-300">{pilot.email}</p>
              </div>
              <div className="space-y-3">
                {pilot.certificates.map((cert) => {
                  const borderClass =
                    cert.status === 'expired'
                      ? 'border-red-500/50'
                      : cert.status === 'expiring_soon'
                        ? 'border-orange-500/50'
                        : 'border-navy-600/50'

                  return (
                    <div
                      key={cert.id}
                      className={`rounded-lg border ${borderClass} bg-navy-800/30 p-3`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{cert.type}</span>
                        <StatusBadge status={cert.status} />
                      </div>
                      <p className="mt-1 text-xs text-navy-300">{cert.certificateNumber}</p>
                      <p className="mt-1 text-xs text-navy-400">
                        签发: {cert.issueDate} | 到期: {cert.expiryDate}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {incidentReports.map((report) => {
            const flight = flightLogs.find((fl) => fl.id === report.flightLogId)
            return (
              <div
                key={report.id}
                className="card-glow rounded-xl bg-navy-700/30 p-5"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-bold text-white">
                        {report.incidentType}
                      </h3>
                      <span className="text-xs text-navy-300">{report.reportDate}</span>
                    </div>
                    <p className="text-sm text-navy-300">{report.description}</p>
                    <p className="text-sm text-navy-400">
                      原因分析: {report.causeAnalysis}
                    </p>
                    {flight && (
                      <Link
                        to={`/flights/${flight.id}`}
                        className="inline-block text-xs text-accent-500 hover:underline"
                      >
                        关联飞行: {flight.location} ({flight.flightDate})
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
