"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Activity, Droplets, Gauge, Thermometer, Waves, AlertCircle, Wifi, WifiOff, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getScadaData } from "@/lib/api"
import { ConfigCheck } from "@/components/config-check"

interface ScadaData {
  pumpStatus: string
  tankLevel: number
  pressure: number
  temperature: number
  flowRate: number
}

interface ScadaResponse {
  id: string
  data: ScadaData
  timestamp: number
}

const POLL_INTERVAL = Number.parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL || "5000")

export default function ViewerDisplay() {
  const [scadaData, setScadaData] = useState<ScadaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const fetchData = async () => {
    try {
      const data = await getScadaData()
      setScadaData(data)
      setLastUpdate(new Date())
      setError(null)
      setIsConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchData()

    // Set up polling interval
    const interval = setInterval(fetchData, POLL_INTERVAL)

    // Cleanup
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ON":
        return "text-chart-2"
      case "OFF":
        return "text-muted-foreground"
      case "STANDBY":
        return "text-chart-4"
      case "MAINTENANCE":
        return "text-chart-3"
      default:
        return "text-foreground"
    }
  }

  const getTankLevelColor = (level: number) => {
    if (level >= 70) return "text-chart-2"
    if (level >= 30) return "text-chart-4"
    return "text-destructive"
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Activity className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading SCADA data...</p>
          </div>
        </div>
      </div>
    )
  }

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
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">SCADA Monitor</h1>
            </div>
            <p className="text-muted-foreground">Real-time system monitoring display</p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-5 w-5 text-chart-2" />
                <span className="text-sm text-chart-2 font-medium">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-destructive" />
                <span className="text-sm text-destructive font-medium">Disconnected</span>
              </>
            )}
          </div>
        </div>

        {lastUpdate && (
          <p className="text-sm text-muted-foreground mt-2">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="mb-6 p-4 border-l-4 border-l-destructive bg-destructive/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Connection Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Data Display */}
      {scadaData && (
        <>
          {/* Main Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Pump Status */}
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Pump Status</h3>
                </div>
              </div>
              <p className={`text-4xl font-bold font-mono ${getStatusColor(scadaData.data.pumpStatus)}`}>
                {scadaData.data.pumpStatus}
              </p>
            </Card>

            {/* Tank Level */}
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/10">
                    <Droplets className="h-6 w-6 text-chart-1" />
                  </div>
                  <h3 className="text-lg font-semibold">Tank Level</h3>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className={`text-4xl font-bold font-mono ${getTankLevelColor(scadaData.data.tankLevel)}`}>
                  {scadaData.data.tankLevel.toFixed(1)}
                </p>
                <span className="text-2xl text-muted-foreground">%</span>
              </div>
              {/* Tank Level Bar */}
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-1 transition-all duration-500"
                  style={{ width: `${Math.min(scadaData.data.tankLevel, 100)}%` }}
                />
              </div>
            </Card>

            {/* Pressure */}
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/10">
                    <Gauge className="h-6 w-6 text-chart-2" />
                  </div>
                  <h3 className="text-lg font-semibold">Pressure</h3>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold font-mono text-chart-2">{scadaData.data.pressure.toFixed(1)}</p>
                <span className="text-2xl text-muted-foreground">bar</span>
              </div>
            </Card>

            {/* Temperature */}
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/10">
                    <Thermometer className="h-6 w-6 text-chart-3" />
                  </div>
                  <h3 className="text-lg font-semibold">Temperature</h3>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold font-mono text-chart-3">{scadaData.data.temperature.toFixed(1)}</p>
                <span className="text-2xl text-muted-foreground">°C</span>
              </div>
            </Card>

            {/* Flow Rate */}
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-4/10">
                    <Waves className="h-6 w-6 text-chart-4" />
                  </div>
                  <h3 className="text-lg font-semibold">Flow Rate</h3>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold font-mono text-chart-4">{scadaData.data.flowRate.toFixed(1)}</p>
                <span className="text-2xl text-muted-foreground">L/min</span>
              </div>
            </Card>
          </div>

          {/* System Info */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">System ID</p>
                <p className="text-lg font-mono font-semibold">{scadaData.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Timestamp</p>
                <p className="text-lg font-mono font-semibold">{new Date(scadaData.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Refresh Rate</p>
                <p className="text-lg font-mono font-semibold">{POLL_INTERVAL / 1000}s</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
