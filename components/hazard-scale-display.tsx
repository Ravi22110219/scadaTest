"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gauge, Home, Activity } from "lucide-react"
import { getScadaData, type ScadaData } from "@/lib/api"
import { getHazardAssessment, calculateHazardLevel } from "@/lib/hazard-calculator"
import { ConfigCheck } from "@/components/config-check"

const POLL_INTERVAL = Number.parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL || "5000")

export default function HazardScaleDisplay() {
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

  // ✅ Extract numeric values safely
  const rainfallAmount = typeof data?.rainfall === "object" ? data.rainfall.amount : data?.rainfall
  const rainfallUnit = typeof data?.rainfall === "object" ? data.rainfall.unit : "mm"

  const intensityValue = typeof data?.intensity === "object" ? data.intensity.amount : data?.intensity
  const intensityUnit = typeof data?.intensity === "object" ? data.intensity.unit : "mm/hr"

  const durationValue = typeof data?.duration === "object" ? data.duration.amount : data?.duration
  const durationUnit = typeof data?.duration === "object" ? data.duration.unit : "hours"

  const hazard = data ? getHazardAssessment(intensityValue, rainfallAmount) : null
  const currentLevel = data ? calculateHazardLevel(intensityValue) : "low"

  const hazardLevels = [
    { level: "low", label: "Low", range: "< 2.5 mm/hr", color: "hsl(var(--chart-2))", description: "Light rainfall" },
    { level: "medium", label: "Medium", range: "2.5-10 mm/hr", color: "hsl(var(--chart-4))", description: "Moderate rainfall" },
    { level: "high", label: "High", range: "10-50 mm/hr", color: "hsl(var(--chart-3))", description: "Heavy rainfall" },
    { level: "critical", label: "Critical", range: "> 50 mm/hr", color: "hsl(var(--destructive))", description: "Extreme rainfall" },
  ]

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
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gauge className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Display 4: Hazard Scale</h1>
            <p className="text-muted-foreground">Risk assessment and hazard level classification</p>
          </div>
        </div>
        {lastUpdate && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Last Update</p>
            <p className="text-lg font-mono font-semibold">{lastUpdate.toLocaleTimeString()}</p>
          </div>
        )}
      </div>

      {error && (
        <Card className="mb-6 p-4 border-l-4 border-destructive bg-destructive/10">
          <p className="text-destructive font-medium">{error}</p>
        </Card>
      )}

      {data && hazard && (
        <>
          {/* Current Hazard Level */}
          <Card className="p-12 mb-6 text-center border-border/50 bg-card/50 backdrop-blur">
            <p className="text-xl text-muted-foreground mb-4">CURRENT HAZARD LEVEL</p>
            <div className="mb-6">
              <div
                className="inline-block p-8 rounded-full mb-4"
                style={{ backgroundColor: `${hazard.color}20`, border: `4px solid ${hazard.color}` }}
              >
                <Gauge className="h-24 w-24" style={{ color: hazard.color }} />
              </div>
            </div>
            <h2 className="text-6xl font-bold mb-4 uppercase" style={{ color: hazard.color }}>
              {hazard.level}
            </h2>
            <p className="text-2xl font-semibold text-muted-foreground">{hazard.description}</p>
          </Card>

          {/* Hazard Scale Reference */}
          <Card className="p-6 mb-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-semibold mb-6">Hazard Scale Reference</h2>
            <div className="space-y-4">
              {hazardLevels.map((level) => (
                <div
                  key={level.level}
                  className={`p-6 rounded-lg border-l-8 transition-all ${
                    currentLevel === level.level ? "bg-background scale-105" : "bg-muted/30"
                  }`}
                  style={{
                    borderLeftColor: level.color,
                    boxShadow: currentLevel === level.level ? `0 0 20px ${level.color}40` : "none",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold uppercase" style={{ color: level.color }}>
                          {level.label}
                        </h3>
                        {currentLevel === level.level && (
                          <span
                            className="px-3 py-1 rounded-full text-sm font-semibold"
                            style={{ backgroundColor: `${level.color}30`, color: level.color }}
                          >
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-lg text-muted-foreground mb-1">{level.description}</p>
                      <p className="text-sm font-mono" style={{ color: level.color }}>
                        Intensity Range: {level.range}
                      </p>
                    </div>
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${level.color}20` }}
                    >
                      <Gauge className="h-8 w-8" style={{ color: level.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Current Measurements */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4">Current Measurements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Rainfall</p>
                <p className="text-3xl font-bold font-mono">{rainfallAmount}</p>
                <p className="text-sm text-muted-foreground">{rainfallUnit}</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Intensity</p>
                <p className="text-3xl font-bold font-mono">{intensityValue?.toFixed?.(2) ?? intensityValue}</p>
                <p className="text-sm text-muted-foreground">{intensityUnit}</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Duration</p>
                <p className="text-3xl font-bold font-mono">{durationValue}</p>
                <p className="text-sm text-muted-foreground">{durationUnit}</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Region</p>
                <p className="text-2xl font-bold">{data.region || "N/A"}</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
