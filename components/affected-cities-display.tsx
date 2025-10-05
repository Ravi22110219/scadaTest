"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Home, Activity, Users, CloudRain, AlertCircle } from "lucide-react"
import { getScadaData, type ScadaData, type City } from "@/lib/api"
import { ConfigCheck } from "@/components/config-check"

const POLL_INTERVAL = Number.parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL || "5000")

export default function AffectedCitiesDisplay() {
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

  const getStatusColor = (status: City["status"]) => {
    switch (status) {
      case "safe":
        return "hsl(var(--chart-2))"
      case "warning":
        return "hsl(var(--chart-4))"
      case "danger":
        return "hsl(var(--chart-3))"
      case "critical":
        return "hsl(var(--destructive))"
    }
  }

  const getStatusIcon = (status: City["status"]) => {
    switch (status) {
      case "safe":
        return "✓"
      case "warning":
        return "⚠"
      case "danger":
        return "⚠"
      case "critical":
        return "✕"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-screen">
          <Activity className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // FIX: Chain the optional operator `?.` to the method calls (`reduce`, `filter`)
  const totalPopulation = data?.cities?.reduce((sum, city) => sum + city.population, 0) || 0
  const criticalCities = data?.cities?.filter((c) => c.status === "critical").length || 0
  const dangerCities = data?.cities?.filter((c) => c.status === "danger").length || 0

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
            <MapPin className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Display 3: Affected Cities</h1>
              <p className="text-muted-foreground">Cities impacted by rainfall and their status</p>
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
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-6 w-6 text-chart-1" />
                <p className="text-sm text-muted-foreground">Total Cities</p>
              </div>
              {/* FIX: Add nullish coalescing for safety */}
              <p className="text-3xl font-bold font-mono">{data.cities?.length ?? 0}</p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-6 w-6 text-chart-2" />
                <p className="text-sm text-muted-foreground">Total Population</p>
              </div>
              <p className="text-3xl font-bold font-mono">{totalPopulation.toLocaleString()}</p>
            </Card>

            <Card
              className="p-6 border-border/50 bg-card/50 backdrop-blur border-l-4"
              style={{ borderLeftColor: "hsl(var(--destructive))" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <p className="text-sm text-muted-foreground">Critical Status</p>
              </div>
              <p className="text-3xl font-bold font-mono">{criticalCities}</p>
            </Card>

            <Card
              className="p-6 border-border/50 bg-card/50 backdrop-blur border-l-4"
              style={{ borderLeftColor: "hsl(var(--chart-3))" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-6 w-6 text-chart-3" />
                <p className="text-sm text-muted-foreground">Danger Status</p>
              </div>
              <p className="text-3xl font-bold font-mono">{dangerCities}</p>
            </Card>
          </div>

          {/* Cities List */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4">City Status Overview</h2>
            {/* FIX: Add optional chaining for safety */}
            {(data.cities?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {/* FIX: Add optional chaining before sort and map */}
                {data.cities
                  ?.sort((a, b) => {
                    const statusOrder = { critical: 0, danger: 1, warning: 2, safe: 3 }
                    return statusOrder[a.status] - statusOrder[b.status]
                  })
                  .map((city, index) => (
                    <div
                      key={index}
                      className="p-4 bg-background rounded-lg border-l-4"
                      style={{ borderLeftColor: getStatusColor(city.status) }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">City Name</p>
                          </div>
                          <p className="text-xl font-bold">{city.name}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CloudRain className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Rainfall</p>
                          </div>
                          <p className="text-xl font-mono font-semibold">{city.rainfall} mm</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Population</p>
                          </div>
                          <p className="text-xl font-mono font-semibold">{city.population.toLocaleString()}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Status</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl" style={{ color: getStatusColor(city.status) }}>
                              {getStatusIcon(city.status)}
                            </span>
                            <p className="text-xl font-bold uppercase" style={{ color: getStatusColor(city.status) }}>
                              {city.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl text-muted-foreground">No cities data available</p>
                <p className="text-sm text-muted-foreground mt-2">Add cities in the controller to see affected areas</p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}