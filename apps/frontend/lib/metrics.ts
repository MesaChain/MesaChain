// Mock data generation for the metrics system
// In a real application, this would fetch data from your database or API

// Helper to generate random data points
function generateDataPoints(count: number, min: number, max: number, trend: "up" | "down" | "stable" = "stable") {
    return Array.from({ length: count }).map((_, i) => {
      let value: number
  
      if (trend === "up") {
        // Upward trend with some randomness
        value = min + (max - min) * (i / count) + Math.random() * (max - min) * 0.2
      } else if (trend === "down") {
        // Downward trend with some randomness
        value = max - (max - min) * (i / count) + Math.random() * (max - min) * 0.2
      } else {
        // Stable with randomness
        value = min + Math.random() * (max - min)
      }
  
      return { value: Math.round(value) }
    })
  }
  
  // Generate time-based data points
  function generateTimeSeriesData(count: number, min: number, max: number, trend: "up" | "down" | "stable" = "stable") {
    const now = new Date()
  
    return Array.from({ length: count }).map((_, i) => {
      const time = new Date(now.getTime() - (count - i - 1) * 60000)
      let value: number
  
      if (trend === "up") {
        value = min + (max - min) * (i / count) + Math.random() * (max - min) * 0.2
      } else if (trend === "down") {
        value = max - (max - min) * (i / count) + Math.random() * (max - min) * 0.2
      } else {
        value = min + Math.random() * (max - min)
      }
  
      return {
        time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        value: Math.round(value),
      }
    })
  }
  
  // Generate transaction volume data
  function generateTransactionVolumeData(days: number) {
    const data = []
    const now = new Date()
  
    for (let i = 0; i < days; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - (days - i - 1))
  
      const completed = Math.floor(Math.random() * 500) + 500
      const pending = Math.floor(Math.random() * 200) + 100
      const failed = Math.floor(Math.random() * 50) + 10
  
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        completed,
        pending,
        failed,
      })
    }
  
    return data
  }
  
  export function fetchMetrics(timeRange: string) {
    // Determine data points based on time range
    let dataPoints: number
  
    switch (timeRange) {
      case "24h":
        dataPoints = 24
        break
      case "7d":
        dataPoints = 7
        break
      case "30d":
        dataPoints = 30
        break
      case "90d":
        dataPoints = 90
        break
      default:
        dataPoints = 7
    }
  
    // Generate metrics based on the selected time range
    const totalTransactions = 125000 + Math.floor(Math.random() * 10000)
    const transactionGrowth = Math.floor(Math.random() * 10) + 15
    const activeUsers = 45000 + Math.floor(Math.random() * 5000)
    const userGrowth = Math.floor(Math.random() * 8) + 12
    const revenue = 1250000 + Math.floor(Math.random() * 100000)
    const revenueGrowth = Math.floor(Math.random() * 12) + 18
    const responseTime = Math.floor(Math.random() * 20) + 80
    const responseImprovement = Math.floor(Math.random() * 5) + 10
  
    return {
      totalTransactions,
      transactionGrowth,
      activeUsers,
      userGrowth,
      revenue,
      revenueGrowth,
      responseTime,
      responseImprovement,
      transactionTrend: generateDataPoints(dataPoints, 1000, 2000, "up"),
      userTrend: generateDataPoints(dataPoints, 500, 1000, "up"),
      revenueTrend: generateDataPoints(dataPoints, 10000, 20000, "up"),
      responseTrend: generateDataPoints(dataPoints, 70, 120, "down"),
      transactionVolume: generateTransactionVolumeData(dataPoints),
    }
  }
  
  export function fetchRealtimeMetrics() {
    // Generate realtime metrics data
    return {
      transactions: generateTimeSeriesData(20, 50, 150, "stable"),
      systemLoad: Array.from({ length: 20 }).map((_, i) => {
        const time = new Date(Date.now() - (20 - i - 1) * 60000)
        return {
          time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          cpu: Math.floor(Math.random() * 30) + 40,
          memory: Math.floor(Math.random() * 20) + 60,
        }
      }),
      usersByRegion: [
        {
          name: "North America",
          count: Math.floor(Math.random() * 1000) + 2000,
          change: Math.floor(Math.random() * 10) + 5,
        },
        { name: "Europe", count: Math.floor(Math.random() * 800) + 1500, change: Math.floor(Math.random() * 8) + 3 },
        { name: "Asia", count: Math.floor(Math.random() * 1200) + 1800, change: Math.floor(Math.random() * 12) + 8 },
        { name: "Other", count: Math.floor(Math.random() * 500) + 700, change: Math.floor(Math.random() * 6) + 2 },
      ],
    }
  }
  