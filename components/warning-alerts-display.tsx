"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, Activity, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { getScadaData, type ScadaData } from "@/lib/api"
import { getHazardAssessment } from "@/lib/hazard-calculator"
import { ConfigCheck } from "@/components/config-check"

const POLL_INTERVAL = Number.parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL || "5000")

export default function WarningAlertsDisplay() {
  const [data, setData] = useState<ScadaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      const response = await getScadaData()
      setData(response.data)
      setLastUpdate(new Date(response.timestamp))
      setError(null)
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

  // FIX 1: Extract the numeric rainfall amount before passing it to the calculator.
  const rainfallAmount =
    typeof data?.rainfall === "object" && data.rainfall !== null
      ? data.rainfall.amount ?? 0
      : data?.rainfall ?? 0

  const hazard = data ? getHazardAssessment(data.intensity ?? 0, rainfallAmount) : null

  const getAlertIcon = () => {
    if (!hazard) return <AlertCircle className="h-12 w-12" />
    switch (hazard.level) {
      case "low":
        return <CheckCircle2 className="h-12 w-12" />
      case "medium":
        return <AlertCircle className="h-12 w-12" />
      case "high":
        return <AlertTriangle className="h-12 w-12" />
      case "critical":
        return <XCircle className="h-12 w-12" />
    }
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

      {/* Configuration Check 
      <div className="mb-6">
        <ConfigCheck />
      </div>*/}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Display 2: Warning & Alerts</h1>
              <p className="text-muted-foreground">Real-time hazard warnings and safety recommendations</p>
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

      {data && hazard && (
        <>
          {/* Main Alert Banner */}
          <Card
            className="p-8 mb-6 border-l-8"
            style={{
              borderLeftColor: hazard.color,
              backgroundColor: `${hazard.color}15`,
            }}
          >
            <div className="flex items-center gap-6">
              <div style={{ color: hazard.color }}>{getAlertIcon()}</div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2 uppercase" style={{ color: hazard.color }}>
                  {hazard.level} HAZARD LEVEL
                </h2>
                <p className="text-xl font-semibold">{hazard.description}</p>
              </div>
            </div>
          </Card>

          {/* Current Conditions */}
          <Card className="p-6 mb-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4">Current Conditions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Rainfall</p>
                {/* FIX 2: Render the `amount` property from the rainfall object. */}
                <p className="text-2xl font-bold font-mono">{rainfallAmount} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Intensity</p>
                <p className="text-2xl font-bold font-mono">{(data.intensity ?? 0).toFixed(2)} mm/hr</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold font-mono">{(data.duration ?? 0)} hrs</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="text-2xl font-bold">{data.region || "N/A"}</p>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4">Safety Recommendations</h2>
            <div className="space-y-3">
              {hazard.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                  <div
                    className="mt-1 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${hazard.color}30` }}
                  >
                    <span className="text-sm font-bold" style={{ color: hazard.color }}>
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-lg">{recommendation}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}