/**
 * Hazard calculation utilities for rainfall monitoring
 */

export type HazardLevel = "low" | "medium" | "high" | "critical"

export interface HazardAssessment {
  level: HazardLevel
  color: string
  description: string
  recommendations: string[]
}

/**
 * Calculate hazard level based on rainfall intensity
 * @param intensity - Rainfall intensity in mm/hr
 * @returns Hazard level classification
 */
export function calculateHazardLevel(intensity: number): HazardLevel {
  if (intensity >= 50) return "critical"
  if (intensity >= 10) return "high"
  if (intensity >= 2.5) return "medium"
  return "low"
}

/**
 * Get detailed hazard assessment
 * @param intensity - Rainfall intensity in mm/hr
 * @param rainfall - Total rainfall in mm
 * @returns Complete hazard assessment with recommendations
 */
export function getHazardAssessment(intensity: number, rainfall: number): HazardAssessment {
  const level = calculateHazardLevel(intensity)

  const assessments: Record<HazardLevel, HazardAssessment> = {
    low: {
      level: "low",
      color: "hsl(var(--chart-2))", // Green
      description: "Light rainfall - Normal conditions",
      recommendations: ["No immediate action required", "Continue normal operations", "Monitor weather updates"],
    },
    medium: {
      level: "medium",
      color: "hsl(var(--chart-4))", // Yellow
      description: "Moderate rainfall - Stay alert",
      recommendations: [
        "Monitor drainage systems",
        "Prepare emergency equipment",
        "Stay informed of weather updates",
        "Avoid low-lying areas if possible",
      ],
    },
    high: {
      level: "high",
      color: "hsl(var(--chart-3))", // Orange
      description: "Heavy rainfall - Take precautions",
      recommendations: [
        "Activate emergency response teams",
        "Evacuate low-lying areas",
        "Close flood-prone roads",
        "Prepare shelters and supplies",
        "Issue public warnings",
      ],
    },
    critical: {
      level: "critical",
      color: "hsl(var(--destructive))", // Red
      description: "Extreme rainfall - Emergency situation",
      recommendations: [
        "IMMEDIATE EVACUATION of danger zones",
        "Deploy all emergency services",
        "Close all affected roads and bridges",
        "Open emergency shelters",
        "Issue emergency broadcast alerts",
        "Coordinate with disaster management",
      ],
    },
  }

  return assessments[level]
}

/**
 * Calculate city status based on rainfall amount
 * @param rainfall - Rainfall amount in mm
 * @returns City status classification
 */
export function calculateCityStatus(rainfall: number): "safe" | "warning" | "danger" | "critical" {
  if (rainfall >= 100) return "critical"
  if (rainfall >= 50) return "danger"
  if (rainfall >= 25) return "warning"
  return "safe"
}
