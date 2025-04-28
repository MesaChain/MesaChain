"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { fetchRealtimeMetrics } from "@/lib/metrics"

export function RealtimeMetrics() {
  const [realtimeData, setRealtimeData] = useState(() => fetchRealtimeMetrics())
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(fetchRealtimeMetrics())
      setLastUpdated(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Realtime Metrics</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Badge className="bg-green-500 text-xs">Live</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Transactions</CardTitle>
            <CardDescription>Transactions processed in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  transactions: {
                    label: "Transactions",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <LineChart data={realtimeData.transactions}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-transactions)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Load</CardTitle>
            <CardDescription>Current system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  cpu: {
                    label: "CPU",
                    color: "hsl(var(--chart-2))",
                  },
                  memory: {
                    label: "Memory",
                    color: "hsl(var(--chart-3))",
                  },
                }}
              >
                <AreaChart data={realtimeData.systemLoad}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-cpu)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-cpu)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-memory)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-memory)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="var(--color-cpu)"
                    fillOpacity={1}
                    fill="url(#colorCpu)"
                    isAnimationActive={true}
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="var(--color-memory)"
                    fillOpacity={1}
                    fill="url(#colorMemory)"
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Users by Region</CardTitle>
            <CardDescription>Geographic distribution of current users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {realtimeData.usersByRegion.map((region) => (
                <div key={region.name} className="flex flex-col p-4 border rounded-lg">
                  <span className="text-sm text-muted-foreground">{region.name}</span>
                  <span className="text-2xl font-bold">{region.count}</span>
                  <div className="flex items-center mt-1 text-xs">
                    <span className={region.change > 0 ? "text-emerald-500" : "text-red-500"}>
                      {region.change > 0 ? "+" : ""}
                      {region.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
