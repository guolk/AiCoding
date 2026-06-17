import OverviewCards from '@/components/dashboard/OverviewCards'
import OKRProgress from '@/components/dashboard/OKRProgress'
import KnowledgeCoverage from '@/components/dashboard/KnowledgeCoverage'
import WeeklyHeatmap from '@/components/dashboard/WeeklyHeatmap'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">仪表盘</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">知识体系与OKR进展总览</p>
        </div>

        <OverviewCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OKRProgress />
          <KnowledgeCoverage />
        </div>

        <WeeklyHeatmap />
      </div>
    </div>
  )
}
