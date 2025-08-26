"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CombinedChart from "@/components/web-vital/combined-chart"
import RangeButton from "@/components/web-vital/range-button"
import VitalCard from "@/components/web-vital/vital-card"
import { Activity, Info, LayoutDashboard } from "lucide-react"
import React, { useMemo, useState } from "react"

type RangeKey = "7d" | "30d" | "90d"

export default function WebVitalsPage() {
  const [range, setRange] = useState<RangeKey>("7d")

  const data = useMemo(() => {
    const lcp: Record<RangeKey, number[]> = {
      "7d": [2.8, 2.4, 2.3, 2.7, 2.1, 2.5, 2.3],
      "30d": [2.9, 2.6, 2.7, 2.5, 2.4, 2.6, 2.8, 2.3, 2.2, 2.4, 2.5, 2.9, 2.7, 2.6, 2.3, 2.2, 2.1, 2.5, 2.8, 2.9, 2.6, 2.5, 2.4, 2.7, 2.3, 2.4, 2.6, 2.5, 2.7, 2.3],
      "90d": Array.from({ length: 90 }, (_, i) => 2.4 + Math.sin(i / 7) * 0.3 + (i % 13 === 0 ? 0.3 : 0)),
    }
    const inp: Record<RangeKey, number[]> = {
      "7d": [190, 170, 210, 180, 160, 220, 185],
      "30d": [210, 180, 195, 205, 175, 165, 220, 190, 185, 170, 160, 230, 205, 198, 188, 176, 160, 215, 205, 198, 185, 175, 165, 230, 210, 190, 185, 175, 168, 182],
      "90d": Array.from({ length: 90 }, (_, i) => 180 + Math.cos(i / 6) * 25 + (i % 10 === 0 ? 35 : 0)),
    }
    const ttfb: Record<RangeKey, number[]> = {
      "7d": [650, 620, 590, 700, 610, 640, 620],
      "30d": [700, 680, 650, 640, 660, 670, 690, 720, 610, 590, 600, 630, 650, 675, 695, 710, 640, 620, 615, 605, 590, 750, 700, 680, 660, 640, 620, 610, 605, 595],
      "90d": Array.from({ length: 90 }, (_, i) => 630 + Math.sin(i / 9) * 60 + (i % 15 === 0 ? 100 : 0)),
    }
    return {
      lcp: lcp[range],
      inp: inp[range],
      ttfb: ttfb[range],
    }
  }, [range])

  return (
    <div className="min-h-screen bg-background/50">
      <div className="max-w-6xl px-4 py-8 mx-auto space-y-6">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Web Vitals Dashboard</CardTitle>
                <CardDescription>
                  Monitoring core web performance metrics at a glance.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <nav aria-label="Time range" className="flex items-center gap-2">
              <RangeButton label="7d" active={range === "7d"} onClick={() => setRange("7d")} />
              <RangeButton label="30d" active={range === "30d"} onClick={() => setRange("30d")} />
              <RangeButton label="90d" active={range === "90d"} onClick={() => setRange("90d")} />
            </nav>
          </CardContent>
        </Card>

        <main className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <CombinedChart data={data} />
          </div>
          <VitalCard
            title="LCP"
            description="Largest Contentful Paint"
            data={data.lcp}
            unit="s"
            thresholds={{ good: 2.5, needsImprovement: 4 }}
            chartType="area"
          />
          <VitalCard
            title="INP"
            description="Interaction to Next Paint"
            data={data.inp}
            unit="ms"
            thresholds={{ good: 200, needsImprovement: 500 }}
            chartType="line"
          />
          <VitalCard
            title="TTFB"
            description="Time to First Byte"
            data={data.ttfb}
            unit="ms"
            thresholds={{ good: 800, needsImprovement: 1800 }}
            chartType="bar"
          />
        </main>

        <footer className="pt-4">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-muted-foreground" />
                <CardTitle className="text-lg">About This Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                This dashboard provides a visualization of key Web Vitals metrics using mock data. In a real-world scenario, you would connect this to your analytics pipeline to get real-user measurements (RUM).
              </p>
              <p className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>The charts are interactive. Hover over them to see detailed values.</span>
              </p>
            </CardContent>
          </Card>
        </footer>
      </div>
    </div>
  )
}

