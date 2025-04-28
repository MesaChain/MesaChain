import { Suspense } from "react"
import MetricsDashboard from "@/components/metric-dashboard"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="grid gap-4">
          <h1 className="text-3xl font-bold">MesaChain Analytics</h1>
          <p className="text-muted-foreground">Comprehensive metrics and business intelligence dashboard</p>
        </div>
        <Suspense fallback={<DashboardSkeleton />}>
          <MetricsDashboard />
        </Suspense>
      </div>
    </main>
  )
}
