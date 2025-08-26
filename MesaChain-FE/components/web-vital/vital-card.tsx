"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
} from "recharts"
import { cn } from "@/lib/utils"

type Thresholds = {
  good: number
  needsImprovement: number
}

type Props = {
  title?: string
  description?: string
  data?: number[]
  unit?: "ms" | "s"
  thresholds?: Thresholds
  chartType?: "area" | "line" | "bar"
}

export default function VitalCard({
  title = "Metric",
  description = "Description",
  data = [1, 2, 1.5, 1.8, 1.2, 2, 1.7],
  unit = "ms",
  thresholds = { good: 100, needsImprovement: 200 },
  chartType = "area",
}: Props) {
  const series = useMemo(
    () =>
      data.map((v, i) => ({
        idx: i + 1,
        value: v,
      })),
    [data]
  )

  const latest = data[data.length - 1] ?? 0
  const { rating, color, label } = getRating(latest, thresholds)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <StatusPill label={label} color={color} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-between">
          <div className="text-2xl font-semibold tabular-nums">
            {formatValue(latest, unit)}
          </div>
          <small className="text-muted-foreground">latest</small>
        </div>

        <div className="mt-3">
          <ChartContainer
            config={{
              value: {
                label: title,
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[90px] w-full"
          >
            {chartType === "bar" ? (
              <BarChart
                accessibilityLayer
                data={series}
                margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
              >
                <XAxis dataKey="idx" hide />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      hideLabel
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            ) : chartType === "line" ? (
              <LineChart
                accessibilityLayer
                data={series}
                margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
              >
                <XAxis dataKey="idx" hide />
                <ChartTooltip
                  cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: 3 }}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      hideLabel
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            ) : (
              <AreaChart
                accessibilityLayer
                data={series}
                margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
              >
                <XAxis dataKey="idx" hide />
                <ChartTooltip
                  cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: 3 }}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      hideLabel
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  fill="var(--color-value)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            )}
          </ChartContainer>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>trend</span>
          <span className="tabular-nums">
            avg {formatValue(average(data), unit)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function average(arr: number[]) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function formatValue(value: number, unit: "ms" | "s") {
  if (unit === "ms") {
    return `${Math.round(value)}ms`
  }
  // seconds: keep one decimal
  return `${value.toFixed(1)}s`
}

function getRating(value: number, thresholds: Thresholds) {
  // For all metrics: lower is better.
  if (value <= thresholds.good) {
    return { rating: "good", color: "emerald", label: "Good" }
  }
  if (value <= thresholds.needsImprovement) {
    return { rating: "needs-improvement", color: "amber", label: "Needs improvement" }
  }
  return { rating: "poor", color: "rose", label: "Poor" }
}

function StatusPill({ label, color }: { label: string; color: "emerald" | "amber" | "rose" }) {
  const colors: Record<typeof color, { dot: string; bg: string; text: string }> = {
    emerald: { dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300" },
    amber: { dot: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300" },
    rose: { dot: "bg-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-700 dark:text-rose-300" },
  }
  const c = colors[color]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium",
        c.bg,
        c.text
      )}
      aria-label={`Status: ${label}`}
    >
      <span className={cn("h-2 w-2 rounded-full", c.dot)} aria-hidden="true" />
      {label}
    </span>
  )
}