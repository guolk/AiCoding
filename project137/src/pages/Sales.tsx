import { useStore } from '@/store/useStore'
import { TrendingUp, PieChart as PieChartIcon, Megaphone } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'

const CHANNEL_COLORS: Record<string, string> = {
  '京东': '#1A3C34',
  '当当': '#D4A853',
  '淘宝': '#8B2D2D',
  '独立网站': '#598D81',
}

const CAMP_TYPE_LABEL: Record<string, string> = { discount: '折扣', launch: '发布', media: '媒体', other: '其他' }
const CAMP_TYPE_BADGE: Record<string, string> = { discount: 'bg-gold-50 text-gold-700', launch: 'bg-ink-50 text-ink-500', media: 'bg-sand text-ink-400', other: 'bg-ivory text-ink-300' }

const renderPieLabel = ({ name, percent }: { name: string; percent: number }) =>
  `${name} ${(percent * 100).toFixed(0)}%`

export default function Sales() {
  const { salesRecords, marketingCampaigns } = useStore()

  const channelData = Object.values(
    salesRecords.reduce<Record<string, { channel: string; quantity: number; revenue: number }>>((acc, r) => {
      if (!acc[r.channel]) acc[r.channel] = { channel: r.channel, quantity: 0, revenue: 0 }
      acc[r.channel].quantity += r.quantity
      acc[r.channel].revenue += r.revenue
      return acc
    }, {})
  )
  const totalRevenue = channelData.reduce((s, c) => s + c.revenue, 0)

  const months = [...new Set(salesRecords.map(r => r.date))].sort()
  const channels = [...new Set(salesRecords.map(r => r.channel))]
  const trendData = months.map(month => {
    const entry: Record<string, string | number> = { month }
    channels.forEach(ch => {
      entry[ch] = salesRecords
        .filter(r => r.date === month && r.channel === ch)
        .reduce((s, r) => s + r.quantity, 0)
    })
    return entry
  })

  return (
    <div className="p-8 space-y-8">
      <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-gold" />销售数据
      </h1>

      {/* Section 1 - 渠道销售汇总 */}
      <section>
        <h2 className="font-display text-xl font-semibold text-ink mb-4 flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-gold" />渠道销售汇总
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={channelData} dataKey="revenue" nameKey="channel" cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100} label={renderPieLabel} strokeWidth={1} stroke="#fff">
                  {channelData.map(d => <Cell key={d.channel} fill={CHANNEL_COLORS[d.channel] || '#999'} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand text-ink-300">
                  <th className="text-left py-2 font-medium">渠道</th>
                  <th className="text-right py-2 font-medium">销售量</th>
                  <th className="text-right py-2 font-medium">收入(¥)</th>
                  <th className="text-right py-2 font-medium">占比</th>
                </tr>
              </thead>
              <tbody>
                {channelData.map((c, i) => (
                  <tr key={c.channel} className={`border-b border-sand/50 ${i % 2 === 0 ? 'bg-ivory' : 'bg-white'}`}>
                    <td className="py-2 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ background: CHANNEL_COLORS[c.channel] }} />
                      {c.channel}
                    </td>
                    <td className="text-right py-2">{c.quantity}</td>
                    <td className="text-right py-2 text-gold-700">¥{c.revenue.toLocaleString()}</td>
                    <td className="text-right py-2">{((c.revenue / totalRevenue) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 2 - 销售趋势 */}
      <section>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-display text-xl font-semibold text-ink mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold" />月度销售趋势
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {channels.map(ch => (
                <Line key={ch} type="monotone" dataKey={ch} stroke={CHANNEL_COLORS[ch] || '#999'}
                  strokeWidth={2} dot={{ r: 3 }} fill={CHANNEL_COLORS[ch] || '#999'} fillOpacity={0.08} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Section 3 - 营销效果追踪 */}
      <section>
        <h2 className="font-display text-xl font-semibold text-ink mb-4 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-gold" />营销效果追踪
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {marketingCampaigns.map(camp => {
            const roi = camp.impact.before > 0
              ? ((camp.impact.after - camp.impact.before) / camp.impact.before * 100).toFixed(1)
              : '—'
            const isPositive = camp.impact.before > 0 && camp.impact.after > camp.impact.before
            const barData = [{ name: '活动前', value: camp.impact.before }, { name: '活动后', value: camp.impact.after }]
            return (
              <div key={camp.id} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-ink">{camp.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CAMP_TYPE_BADGE[camp.type]}`}>
                    {CAMP_TYPE_LABEL[camp.type]}
                  </span>
                </div>
                <p className="text-xs text-ink-300">{camp.startDate} ~ {camp.endDate}</p>
                <p className="text-sm text-ink-400">{camp.description}</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={barData} barSize={40}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1A3C34" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className={`rounded-lg p-3 text-center text-sm font-semibold ${
                  isPositive ? 'bg-green-50 text-green-700' : roi === '—' ? 'bg-gold-50 text-gold-700' : 'bg-crimson/10 text-crimson'
                }`}>
                  ROI: {roi === '—' ? '新活动' : `${roi}%`}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
