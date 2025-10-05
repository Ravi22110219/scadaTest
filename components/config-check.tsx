"use client"

import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Settings } from "lucide-react"

interface ConfigStatus {
  isConfigured: boolean
  missing: string[]
}

export function ConfigCheck() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const scadaId = process.env.NEXT_PUBLIC_SCADA_ID
  const pollInterval = process.env.NEXT_PUBLIC_POLL_INTERVAL

  const missing: string[] = []
  if (!apiUrl) missing.push("NEXT_PUBLIC_API_URL")
  if (!scadaId) missing.push("NEXT_PUBLIC_SCADA_ID (optional, defaults to 'scada001')")
  if (!pollInterval) missing.push("NEXT_PUBLIC_POLL_INTERVAL (optional, defaults to 5000ms)")

  const isConfigured = !missing.some((item) => item.includes("NEXT_PUBLIC_API_URL"))

  if (isConfigured) {
    return (
      <Card className="p-6 border-l-4 border-l-chart-2 bg-chart-2/5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-chart-2 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Configuration Complete</h3>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                <span className="font-mono text-foreground">NEXT_PUBLIC_API_URL:</span> {apiUrl}
              </p>
              <p className="text-muted-foreground">
                <span className="font-mono text-foreground">NEXT_PUBLIC_SCADA_ID:</span>{" "}
                {scadaId || "scada001 (default)"}
              </p>
              <p className="text-muted-foreground">
                <span className="font-mono text-foreground">NEXT_PUBLIC_POLL_INTERVAL:</span>{" "}
                {pollInterval || "5000ms (default)"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-l-4 border-l-destructive bg-destructive/5">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-6 w-6 text-destructive mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-destructive">Configuration Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please configure the following environment variables to use the SCADA monitoring system:
          </p>
          <div className="space-y-2">
            {missing.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{item}</code>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-2">Setup Instructions:</p>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Click the gear icon in the top right corner</li>
              <li>Select "Environment Variables"</li>
              <li>Add the required environment variables</li>
              <li>Refresh the page</li>
            </ol>
          </div>
        </div>
      </div>
    </Card>
  )
}
