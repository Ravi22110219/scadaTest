import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Activity,
  CloudRain,
  Settings2,
  Database,
  Cloud,
  Zap,
  AlertTriangle,
  MapPin,
  Gauge,
  BarChart3,
} from "lucide-react"
import { ConfigCheck } from "@/components/config-check"

export default function Home() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CloudRain className="h-12 w-12 text-primary" />
          <h1 className="text-5xl font-bold">Rainfall Monitoring System</h1>
        </div>
        <p className="text-xl text-muted-foreground">Real-time rainfall monitoring with 6 interlinked displays</p>
      </div>

      {/* Configuration Status */}
      {/* <div className="mb-8">
        <ConfigCheck />
      </div> */}

      {/* Controller Display */}
      <Card className="p-8 mb-8 border-border/50 bg-gradient-to-br from-primary/10 to-chart-1/10 backdrop-blur border-primary/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/20">
            <Settings2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Controller Display</h2>
        </div>
        <p className="text-muted-foreground mb-6 text-lg">
          Upload and manage rainfall data. All changes broadcast to all 5 viewer displays in real-time.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 text-sm">
          <li className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-chart-2" />
            <span>Upload rainfall measurements</span>
          </li>
          <li className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-chart-2" />
            <span>Add affected cities data</span>
          </li>
          <li className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-chart-2" />
            <span>Real-time broadcast to all displays</span>
          </li>
        </ul>
        <Link href="/controller">
          <Button size="lg" className="w-full md:w-auto px-12">
            Open Controller Display
          </Button>
        </Link>
      </Card>

      {/* Viewer Displays */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6">Viewer Displays (Auto-refresh every 5 seconds)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Display 1: Rainfall Chart */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur hover:border-chart-1/50 transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-chart-1/10">
                <CloudRain className="h-8 w-8 text-chart-1" />
              </div>
              <h3 className="text-xl font-bold">Display 1</h3>
            </div>
            <h4 className="font-semibold mb-2">Rainfall Chart</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Real-time charts showing rainfall accumulation and intensity trends over time
            </p>
            <Link href="/display-1">
              <Button variant="outline" className="w-full bg-transparent">
                Open Display 1
              </Button>
            </Link>
          </Card>

          {/* Display 2: Warning & Alerts */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur hover:border-chart-2/50 transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-chart-2/10">
                <AlertTriangle className="h-8 w-8 text-chart-2" />
              </div>
              <h3 className="text-xl font-bold">Display 2</h3>
            </div>
            <h4 className="font-semibold mb-2">Warning & Alerts</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Hazard warnings and safety recommendations based on current rainfall intensity
            </p>
            <Link href="/display-2">
              <Button variant="outline" className="w-full bg-transparent">
                Open Display 2
              </Button>
            </Link>
          </Card>

          {/* Display 3: Affected Cities */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur hover:border-chart-3/50 transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-chart-3/10">
                <MapPin className="h-8 w-8 text-chart-3" />
              </div>
              <h3 className="text-xl font-bold">Display 3</h3>
            </div>
            <h4 className="font-semibold mb-2">Affected Cities</h4>
            <p className="text-sm text-muted-foreground mb-4">
              List of cities impacted by rainfall with status indicators and population data
            </p>
            <Link href="/display-3">
              <Button variant="outline" className="w-full bg-transparent">
                Open Display 3
              </Button>
            </Link>
          </Card>

          {/* Display 4: Hazard Scale */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur hover:border-chart-4/50 transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-chart-4/10">
                <Gauge className="h-8 w-8 text-chart-4" />
              </div>
              <h3 className="text-xl font-bold">Display 4</h3>
            </div>
            <h4 className="font-semibold mb-2">Hazard Scale</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Risk assessment showing current hazard level (Low/Medium/High/Critical)
            </p>
            <Link href="/display-4">
              <Button variant="outline" className="w-full bg-transparent">
                Open Display 4
              </Button>
            </Link>
          </Card>

          {/* Display 5: Statistics */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Display 5</h3>
            </div>
            <h4 className="font-semibold mb-2">Statistics & Analysis</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive data analysis, forecasts, and weather condition monitoring
            </p>
            <Link href="/display-5">
              <Button variant="outline" className="w-full bg-transparent">
                Open Display 5
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* System Architecture */}
      <Card className="p-8 mb-6 border-border/50 bg-card/50 backdrop-blur">
        <h2 className="text-2xl font-bold mb-6">System Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 rounded-lg bg-primary/10 inline-block mb-3">
              <Cloud className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">AWS Lambda</h3>
            <p className="text-sm text-muted-foreground">
              Serverless functions handle data updates and retrieval with Node.js 22.x runtime
            </p>
          </div>
          <div className="text-center">
            <div className="p-4 rounded-lg bg-chart-2/10 inline-block mb-3">
              <Database className="h-8 w-8 text-chart-2" />
            </div>
            <h3 className="font-semibold mb-2">DynamoDB</h3>
            <p className="text-sm text-muted-foreground">
              NoSQL database stores rainfall data with timestamps for real-time access
            </p>
          </div>
          <div className="text-center">
            <div className="p-4 rounded-lg bg-chart-4/10 inline-block mb-3">
              <Activity className="h-8 w-8 text-chart-4" />
            </div>
            <h3 className="font-semibold mb-2">API Gateway</h3>
            <p className="text-sm text-muted-foreground">
              RESTful API endpoints for PUT/GET operations with CORS support
            </p>
          </div>
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-8 border-border/50 bg-card/50 backdrop-blur">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-bold text-primary">1</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Controller uploads rainfall data</h3>
              <p className="text-muted-foreground">
                Use the Controller Display to input rainfall measurements, duration, affected cities, and weather
                conditions. Data is sent to AWS Lambda via API Gateway.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-bold text-primary">2</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Data stored in DynamoDB</h3>
              <p className="text-muted-foreground">
                Lambda function processes the data and stores it in DynamoDB with a timestamp. The hazard level is
                automatically calculated based on rainfall intensity.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-bold text-primary">3</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">All displays update automatically</h3>
              <p className="text-muted-foreground">
                Each viewer display polls the API every 5 seconds to fetch the latest data. All 5 displays show
                different aspects of the same rainfall data in real-time.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-bold text-primary">4</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Interlinked information</h3>
              <p className="text-muted-foreground">
                Display 1 shows charts, Display 2 shows warnings, Display 3 shows affected cities, Display 4 shows
                hazard scale, and Display 5 shows statistics - all from the same data source.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
