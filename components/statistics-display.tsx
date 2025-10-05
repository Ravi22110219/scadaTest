"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, Activity, TrendingUp, TrendingDown, Wind, Droplets, Thermometer } from "lucide-react"
import { getScadaData, type ScadaData } from "@/lib/api"
import { calculateHazardLevel } from "@/lib/hazard-calculator"
import { ConfigCheck } from "@/components/config-check"

const POLL_INTERVAL = Number.parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL || "5000")

export default function StatisticsDisplay() {
  const [data, setData] = useState<ScadaData | null>(null)
  const [stats, setStats] = useState({
    avgRainfall: 0,
    maxRainfall: 0,
    minRainfall: Infinity,
    totalReadings: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      const response = await getScadaData()
      setData(response.data)
      setLastUpdate(new Date(response.timestamp))
      setError(null)

      const currentRainfall = response.data.rainfall
      if (typeof currentRainfall !== "number" || !isFinite(currentRainfall)) {
        console.warn("Received invalid rainfall data:", currentRainfall)
        return
      }

      setStats((prev) => {
        const newTotal = prev.totalReadings + 1
        const newAvg = (prev.avgRainfall * prev.totalReadings + currentRainfall) / newTotal
        const newMax = Math.max(prev.maxRainfall, currentRainfall)
        const newMin = Math.min(prev.minRainfall, currentRainfall)

        return {
          avgRainfall: newAvg,
          maxRainfall: newMax,
          minRainfall: newMin,
          totalReadings: newTotal,
        }
      })
    } catch (err) {
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

  const hazardLevel = data ? calculateHazardLevel(data.intensity) : "low"
  const riskPercentage = data ? Math.min((data.intensity / 50) * 100, 100) : 0

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
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Display 5: Statistics & Analysis</h1>
              <p className="text-muted-foreground">Comprehensive data analysis and forecasting</p>
            </div>
          </div>
          {lastUpdate && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last Update</p>
              <p className="text-lg font-mono font-semibold">{lastUpdate.toLocaleTimeString()}</p>
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
          {/* Statistical Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6 text-chart-1" />
                <p className="text-sm text-muted-foreground">Average Rainfall</p>
              </div>
              <p className="text-3xl font-bold font-mono">{stats.avgRainfall.toFixed(2)} mm</p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6 text-chart-2" />
                <p className="text-sm text-muted-foreground">Maximum Rainfall</p>
              </div>
              <p className="text-3xl font-bold font-mono">{stats.maxRainfall.toFixed(2)} mm</p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="h-6 w-6 text-chart-3" />
                <p className="text-sm text-muted-foreground">Minimum Rainfall</p>
              </div>
              <p className="text-3xl font-bold font-mono">
                {isFinite(stats.minRainfall) ? stats.minRainfall.toFixed(2) : "--"} mm
              </p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-6 w-6 text-chart-4" />
                <p className="text-sm text-muted-foreground">Total Readings</p>
              </div>
              <p className="text-3xl font-bold font-mono">{stats.totalReadings}</p>
            </Card>
          </div>

          {/* Risk Assessment */}
          <Card className="p-6 mb-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Flood Risk Level</p>
                  <p className="text-sm font-mono">{riskPercentage.toFixed(1)}%</p>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${riskPercentage}%`,
                      backgroundColor:
                        hazardLevel === "critical"
                          ? "hsl(var(--destructive))"
                          : hazardLevel === "high"
                            ? "hsl(var(--chart-3))"
                            : hazardLevel === "medium"
                              ? "hsl(var(--chart-4))"
                              : "hsl(var(--chart-2))",
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                  <p className="text-lg font-bold uppercase">{hazardLevel}</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cities Affected</p>
                  {/* FIX: Safely access length, defaulting to 0 */}
                  <p className="text-lg font-bold">{data.cities?.length ?? 0}</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Critical Cities</p>
                  {/* FIX: Safely filter and get length, defaulting to 0 */}
                  <p className="text-lg font-bold">
                    {data.cities?.filter((c) => c.status === "critical").length ?? 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Population</p>
                  <p className="text-lg font-bold">
                    {/* FIX: Safely reduce and format, defaulting to '0' */}
                    {(data.cities?.reduce((sum, c) => sum + c.population, 0) ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Weather Conditions */}
          <Card className="p-6 mb-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4">Current Weather Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                <div className="p-3 rounded-lg bg-chart-1/10">
                  <Wind className="h-8 w-8 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                  <p className="text-2xl font-bold font-mono">{data.windSpeed} km/h</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                <div className="p-3 rounded-lg bg-chart-2/10">
                  <Droplets className="h-8 w-8 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="text-2xl font-bold font-mono">{data.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                <div className="p-3 rounded-lg bg-chart-3/10">
                  <Thermometer className="h-8 w-8 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-2xl font-bold font-mono">{data.temperature}°C</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Forecast & Predictions */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4">Analysis & Predictions</h2>
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="font-semibold mb-2">Rainfall Trend</h3>
                <p className="text-muted-foreground">
                  {data.intensity > 10
                    ? "Heavy rainfall detected. Expect continued high intensity for the next few hours."
                    : data.intensity > 2.5
                      ? "Moderate rainfall ongoing. Monitor conditions closely for any changes."
                      : "Light rainfall conditions. Situation is stable with low risk."}
                </p>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="font-semibold mb-2">Duration Analysis</h3>
                <p className="text-muted-foreground">
                  {data.duration > 6
                    ? `Prolonged rainfall event (${data.duration} hours). Soil saturation levels are high, increasing flood risk.`
                    : data.duration > 3
                      ? `Moderate duration rainfall (${data.duration} hours). Continue monitoring drainage systems.`
                      : `Short duration event (${data.duration} hours). Risk levels remain manageable.`}
                </p>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="font-semibold mb-2">Regional Impact</h3>
                <p className="text-muted-foreground">
                  {/* FIX: Apply safe access here as well */}
                  Region: {data.region || "N/A"}. {data.cities?.length ?? 0} cities are currently being monitored.
                  {(data.cities?.filter((c) => c.status === "critical" || c.status === "danger").length ?? 0) > 0 &&
                    ` ${(
                      data.cities?.filter((c) => c.status === "critical" || c.status === "danger").length ?? 0
                    )} cities require immediate attention.`}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}