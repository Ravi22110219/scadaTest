"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CloudRain,
  MapPin,
  Clock,
  Wind,
  Droplets,
  Thermometer,
  AlertCircle,
  CheckCircle2,
  Home,
  Plus,
  Trash2,
} from "lucide-react"
import { updateScadaData, type ScadaData, type City } from "@/lib/api"
import { ConfigCheck } from "@/components/config-check"

export default function ControllerDisplay() {
  const [data, setData] = useState<ScadaData>({
    rainfall: 0,
    duration: 0,
    intensity: 0,
    region: "",
    cities: [],
    windSpeed: 0,
    humidity: 0,
    temperature: 0,
  })

  const [newCity, setNewCity] = useState<City>({
    name: "",
    rainfall: 0,
    population: 0,
    status: "safe",
  })

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleRainfallChange = (value: number) => {
    const newRainfall = value
    const intensity = data.duration > 0 ? newRainfall / data.duration : 0
    setData((prev) => ({ ...prev, rainfall: newRainfall, intensity }))
  }

  const handleDurationChange = (value: number) => {
    const newDuration = value
    const intensity = newDuration > 0 ? data.rainfall / newDuration : 0
    setData((prev) => ({ ...prev, duration: newDuration, intensity }))
  }

  const handleInputChange = (field: keyof Omit<ScadaData, "cities" | "intensity">, value: string | number) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addCity = () => {
    if (newCity.name && newCity.rainfall >= 0 && newCity.population > 0) {
      // Auto-calculate status based on rainfall
      const status =
        newCity.rainfall >= 100
          ? "critical"
          : newCity.rainfall >= 50
            ? "danger"
            : newCity.rainfall >= 25
              ? "warning"
              : "safe"

      setData((prev) => ({
        ...prev,
        cities: [...prev.cities, { ...newCity, status }],
      }))
      setNewCity({ name: "", rainfall: 0, population: 0, status: "safe" })
    }
  }

  const removeCity = (index: number) => {
    setData((prev) => ({
      ...prev,
      cities: prev.cities.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      await updateScadaData(data)
      setStatus({
        type: "success",
        message: "Rainfall data updated successfully - All displays will update automatically",
      })
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update data",
      })
    } finally {
      setLoading(false)
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

      {/* Configuration Check */}
      {/* <div className="mb-6">
        <ConfigCheck />
      </div> */}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CloudRain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Rainfall Data Controller</h1>
        </div>
        <p className="text-muted-foreground">Upload and manage rainfall monitoring data for all displays</p>
      </div>

      {/* Status Alert */}
      {status && (
        <Card
          className="mb-6 p-4 border-l-4"
          style={{
            borderLeftColor: status.type === "success" ? "hsl(var(--chart-2))" : "hsl(var(--destructive))",
          }}
        >
          <div className="flex items-center gap-3">
            {status.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-chart-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
            <p className="font-medium">{status.message}</p>
          </div>
        </Card>
      )}

      {/* Control Form */}
      <form onSubmit={handleSubmit}>
        {/* Primary Rainfall Data */}
        <Card className="p-6 mb-6 border-border/50 bg-card/50 backdrop-blur">
          <h2 className="text-xl font-semibold mb-4">Primary Rainfall Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Rainfall Amount */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CloudRain className="h-5 w-5 text-chart-1" />
                <Label htmlFor="rainfall" className="font-semibold">
                  Rainfall (mm)
                </Label>
              </div>
              <Input
                id="rainfall"
                type="number"
                min="0"
                step="0.1"
                value={data.rainfall}
                onChange={(e) => handleRainfallChange(Number.parseFloat(e.target.value) || 0)}
                className="text-lg h-12"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-chart-2" />
                <Label htmlFor="duration" className="font-semibold">
                  Duration (hours)
                </Label>
              </div>
              <Input
                id="duration"
                type="number"
                min="0"
                step="0.1"
                value={data.duration}
                onChange={(e) => handleDurationChange(Number.parseFloat(e.target.value) || 0)}
                className="text-lg h-12"
                required
              />
            </div>

            {/* Intensity (Auto-calculated) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-5 w-5 text-chart-3" />
                <Label className="font-semibold">Intensity (mm/hr)</Label>
              </div>
              <div className="h-12 px-4 rounded-lg bg-muted border border-border flex items-center">
                <span className="text-lg font-mono font-semibold">{data.intensity.toFixed(2)}</span>
              </div>
            </div>

            {/* Region */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-chart-4" />
                <Label htmlFor="region" className="font-semibold">
                  Region
                </Label>
              </div>
              <Input
                id="region"
                type="text"
                value={data.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                className="text-lg h-12"
                placeholder="e.g., Northern District"
                required
              />
            </div>
          </div>
        </Card>

        {/* Weather Conditions */}
        <Card className="p-6 mb-6 border-border/50 bg-card/50 backdrop-blur">
          <h2 className="text-xl font-semibold mb-4">Weather Conditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wind Speed */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wind className="h-5 w-5 text-chart-1" />
                <Label htmlFor="windSpeed" className="font-semibold">
                  Wind Speed (km/h)
                </Label>
              </div>
              <Input
                id="windSpeed"
                type="number"
                min="0"
                step="0.1"
                value={data.windSpeed}
                onChange={(e) => handleInputChange("windSpeed", Number.parseFloat(e.target.value) || 0)}
                className="text-lg h-12"
              />
            </div>

            {/* Humidity */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-5 w-5 text-chart-2" />
                <Label htmlFor="humidity" className="font-semibold">
                  Humidity (%)
                </Label>
              </div>
              <Input
                id="humidity"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={data.humidity}
                onChange={(e) => handleInputChange("humidity", Number.parseFloat(e.target.value) || 0)}
                className="text-lg h-12"
              />
            </div>

            {/* Temperature */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="h-5 w-5 text-chart-3" />
                <Label htmlFor="temperature" className="font-semibold">
                  Temperature (°C)
                </Label>
              </div>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={data.temperature}
                onChange={(e) => handleInputChange("temperature", Number.parseFloat(e.target.value) || 0)}
                className="text-lg h-12"
              />
            </div>
          </div>
        </Card>

        {/* Affected Cities */}
        <Card className="p-6 mb-6 border-border/50 bg-card/50 backdrop-blur">
          <h2 className="text-xl font-semibold mb-4">Affected Cities</h2>

          {/* Add New City */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="cityName" className="text-sm">
                City Name
              </Label>
              <Input
                id="cityName"
                type="text"
                value={newCity.name}
                onChange={(e) => setNewCity((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mumbai"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cityRainfall" className="text-sm">
                Rainfall (mm)
              </Label>
              <Input
                id="cityRainfall"
                type="number"
                min="0"
                step="0.1"
                value={newCity.rainfall}
                onChange={(e) => setNewCity((prev) => ({ ...prev, rainfall: Number.parseFloat(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cityPopulation" className="text-sm">
                Population
              </Label>
              <Input
                id="cityPopulation"
                type="number"
                min="0"
                value={newCity.population}
                onChange={(e) => setNewCity((prev) => ({ ...prev, population: Number.parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 1000000"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={addCity} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add City
              </Button>
            </div>
          </div>

          {/* Cities List */}
          {data.cities.length > 0 ? (
            <div className="space-y-2">
              {data.cities.map((city, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-semibold">{city.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rainfall</p>
                      <p className="font-mono">{city.rainfall} mm</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Population</p>
                      <p className="font-mono">{city.population.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold capitalize">{city.status}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCity(index)}
                    className="ml-4 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No cities added yet. Add cities to track affected areas.
            </p>
          )}
        </Card>

        {/* Submit Button */}
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
          <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={loading}>
            {loading ? "Updating..." : "Update Rainfall Data - Broadcast to All Displays"}
          </Button>
        </Card>
      </form>
    </div>
  )
}
