"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

type CombinedChartProps = {
  data: {
    lcp: number[]
    inp: number[]
    ttfb: number[]
  }
}

const chartConfig = {
  lcp: {
    label: "LCP",
    color: "hsl(var(--chart-1))",
  },
  inp: {
    label: "INP",
    color: "hsl(var(--chart-2))",
  },
  ttfb: {
    label: "TTFB",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function CombinedChart({ data }: CombinedChartProps) {
  const series = useMemo(() => {
    const maxLength = Math.max(data.lcp.length, data.inp.length, data.ttfb.length)
    return Array.from({ length: maxLength }, (_, i) => ({
      day: (i + 1).toString(),
      lcp: data.lcp[i] ?? null,
      inp: data.inp[i] ?? null,
      ttfb: data.ttfb[i] ?? null,
    }))
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Combined Vitals Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={series}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `Day ${value}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value} ms`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="lcp"
              type="natural"
              fill="var(--color-lcp)"
              fillOpacity={0.4}
              stroke="var(--color-lcp)"
              stackId="a"
            />
            <Area
              dataKey="inp"
              type="natural"
              fill="var(--color-inp)"
              fillOpacity={0.4}
              stroke="var(--color-inp)"
              stackId="a"
            />
            <Area
              dataKey="ttfb"
              type="natural"
              fill="var(--color-ttfb)"
              fillOpacity={0.4}
              stroke="var(--color-ttfb)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
