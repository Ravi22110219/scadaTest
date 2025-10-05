"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { CloudRain, Home, Activity, TrendingUp } from "lucide-react"
import { getScadaData, type ScadaData } from "@/lib/api"
import { ConfigCheck } from "@/components/config-check"

const POLL_INTERVAL = Number.parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL || "5000")
const HISTORY_LENGTH = 20 // Increased history length for better charts

export default function RainfallChartDisplay() {
  const [data, setData] = useState<ScadaData | null>(null)
  const [history, setHistory] = useState<
    Array<{ time: string; rainfall: number; intensity: number }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      const response = await getScadaData()
      const responseData = response.data
      setData(responseData)
      setLastUpdate(new Date(response.timestamp))
      setError(null)

      // Robustly parse rainfall and intensity to handle multiple data structures
      const currentRainfall =
        typeof responseData.rainfall === "object" && responseData.rainfall !== null
          ? responseData.rainfall.amount ?? 0
          : typeof responseData.rainfall === "number"
          ? responseData.rainfall
          : 0

      const currentIntensity =
        (typeof responseData.rainfall === "object" && responseData.rainfall !== null
          ? responseData.rainfall.intensity
          : responseData.intensity) ?? 0

      const timeStr = new Date(response.timestamp).toLocaleTimeString()
      setHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            time: timeStr,
            rainfall: currentRainfall,
            intensity: currentIntensity,
          },
        ]
        return newHistory.slice(-HISTORY_LENGTH)
      })
    } catch (err)
      {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-screen">
          <Activity className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }
  
  // Create safe, derived variables to use in the JSX
  const displayRainfallAmount =
    (typeof data?.rainfall === 'object' && data.rainfall !== null
      ? data.rainfall.amount
      : typeof data?.rainfall === 'number'
      ? data.rainfall
      : 0) ?? 0

  const displayRainfallUnit =
    (typeof data?.rainfall === 'object' && data.rainfall !== null
      ? data.rainfall.unit
      : 'mm') || 'mm'

  const displayIntensity =
    (typeof data?.rainfall === 'object' && data.rainfall !== null
      ? data.rainfall.intensity
      : data?.intensity) ?? 0

  const displayDuration =
    (typeof data?.rainfall === 'object' && data.rainfall !== null
      ? data.rainfall.duration
      : data?.duration) ?? 0

  const displayRegion = data?.location?.region || data?.region || "N/A"

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Navigation */}
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Configuration Check */}
      {/* <div className="mb-6">
        <ConfigCheck />
      </div> */}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CloudRain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Display 1: Rainfall Chart</h1>
              <p className="text-muted-foreground">
                Real-time rainfall monitoring and trends
              </p>
            </div>
          </div>
          {lastUpdate && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last Update</p>
              <p className="text-lg font-mono font-semibold">
                {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Card className="mb-6 p-4 border-l-4 border-destructive bg-destructive/10">
          <p className="text-destructive font-medium">{error}</p>
        </Card>
      )}

      {data && (
        <>
          {/* Current Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <CloudRain className="h-6 w-6 text-chart-1" />
                <p className="text-sm text-muted-foreground">Total Rainfall</p>
              </div>
              <p className="text-3xl font-bold font-mono">
                {displayRainfallAmount} {displayRainfallUnit}
              </p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6 text-chart-2" />
                <p className="text-sm text-muted-foreground">Intensity</p>
              </div>
              <p className="text-3xl font-bold font-mono">
                {displayIntensity.toFixed(2)} mm/hr
              </p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-6 w-6 text-chart-3" />
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
              <p className="text-3xl font-bold font-mono">
                {displayDuration} hrs
              </p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <CloudRain className="h-6 w-6 text-chart-4" />
                <p className="text-sm text-muted-foreground">Region</p>
              </div>
              <p className="text-2xl font-bold">
                {displayRegion}
              </p>
            </Card>
          </div>

          {/* Rainfall History Chart */}
          <Card className="p-6 mb-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4">
              Rainfall Accumulation Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={history}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="time" stroke="hsl(var(--foreground))" tick={{ fillOpacity: 0.7 }} />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  tick={{ fillOpacity: 0.7 }}
                  label={{
                    value: "Rainfall (mm)",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: 'middle', fillOpacity: 0.7 },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="rainfall"
                  fill="hsl(var(--chart-1))"
                  name="Rainfall (mm)"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Intensity Trend Chart */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4">
              Rainfall Intensity Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="time" stroke="hsl(var(--foreground))" tick={{ fillOpacity: 0.7 }} />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  tick={{ fillOpacity: 0.7 }}
                  label={{
                    value: "Intensity (mm/hr)",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: 'middle', fillOpacity: 0.7 },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="intensity"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Intensity (mm/hr)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  )
}