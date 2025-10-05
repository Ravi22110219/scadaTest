/**
 * API client for SCADA monitoring system
 * Handles communication with AWS Lambda backend via API Gateway
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL
const SCADA_ID = process.env.NEXT_PUBLIC_SCADA_ID || "scada001"

if (!API_URL) {
  console.error("NEXT_PUBLIC_API_URL is not defined in environment variables")
}

interface City {
  name: string
  rainfall: number // mm
  population: number
  status: "safe" | "warning" | "danger" | "critical"
}

interface ScadaData {
  rainfall: number // mm
  duration: number // hours
  intensity: number // mm/hr
  region: string
  cities: City[]
  windSpeed: number // km/h
  humidity: number // %
  temperature: number // °C
}

interface ScadaResponse {
  id: string
  data: ScadaData
  timestamp: number
}

interface UpdateResponse {
  message: string
  id: string
  timestamp: number
}

/**
 * Update SCADA data in DynamoDB
 * @param data - SCADA parameters to update
 * @returns Promise with update confirmation
 */
export async function updateScadaData(data: ScadaData): Promise<UpdateResponse> {
  if (!API_URL) {
    throw new Error("API URL is not configured. Please set NEXT_PUBLIC_API_URL in .env.local")
  }

  try {
    const response = await fetch(`${API_URL}/data/${SCADA_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result: UpdateResponse = await response.json()
    return result
  } catch (error) {
    console.error("Error updating SCADA data:", error)
    throw error
  }
}

/**
 * Get SCADA data from DynamoDB
 * @returns Promise with current SCADA data
 */
export async function getScadaData(): Promise<ScadaResponse> {
  if (!API_URL) {
    throw new Error("API URL is not configured. Please set NEXT_PUBLIC_API_URL in .env.local")
  }

  try {
    const response = await fetch(`${API_URL}/data/${SCADA_ID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Disable caching to ensure fresh data on every poll
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result: ScadaResponse = await response.json()
    return result
  } catch (error) {
    console.error("Error fetching SCADA data:", error)
    throw error
  }
}

export type { ScadaData, ScadaResponse, City }
