import React from 'react'
import { 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  CloudSnow, 
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  Waves
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeatherData {
  temperature: number
  windspeed: number
  weathercode: number
  is_day: number
}

interface WeatherWidgetProps {
  data: WeatherData
}

export function WeatherWidget({ data }: WeatherWidgetProps) {
  const getWeatherIcon = (code: number) => {
    if (code === 0) return Sun
    if (code >= 1 && code <= 3) return CloudSun
    if (code === 45 || code === 48) return CloudFog
    if (code >= 51 && code <= 55) return CloudDrizzle
    if (code >= 61 && code <= 65) return CloudRain
    if (code >= 71 && code <= 75) return CloudSnow
    if (code >= 80 && code <= 82) return CloudRain
    if (code >= 95) return CloudLightning
    return Cloud
  }

  const getWeatherLabel = (code: number) => {
    if (code === 0) return 'Clear'
    if (code >= 1 && code <= 3) return 'Partly Cloudy'
    if (code === 45 || code === 48) return 'Foggy'
    if (code >= 51 && code <= 55) return 'Drizzle'
    if (code >= 61 && code <= 65) return 'Rainy'
    if (code >= 71 && code <= 75) return 'Snowy'
    if (code >= 80 && code <= 82) return 'Showers'
    if (code >= 95) return 'Thunderstorm'
    return 'Cloudy'
  }

  // Simulate tide data based on time (12.4h cycle)
  const getTideInfo = () => {
    const now = new Date()
    const hours = now.getHours() + now.getMinutes() / 60
    const cycle = 12.42
    const phase = (hours % cycle) / cycle
    const tideLevel = Math.sin(phase * 2 * Math.PI)
    
    if (tideLevel > 0.8) return { label: 'High Tide', height: (1.5 + Math.random() * 0.5).toFixed(1) + 'm' }
    if (tideLevel < -0.8) return { label: 'Low Tide', height: (0.2 + Math.random() * 0.3).toFixed(1) + 'm' }
    if (tideLevel > 0) return { label: 'Rising Tide', height: (0.8 + Math.random() * 0.4).toFixed(1) + 'm' }
    return { label: 'Falling Tide', height: (0.5 + Math.random() * 0.3).toFixed(1) + 'm' }
  }

  const tide = getTideInfo()
  const Icon = getWeatherIcon(data.weathercode)

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-4 space-y-4 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm">
            <Icon className={cn("h-6 w-6", data.weathercode === 0 ? "text-amber-500" : "text-blue-500")} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Current Weather</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{getWeatherLabel(data.weathercode)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(data.temperature)}°C</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{data.windspeed} km/h</span>
        </div>
        <div className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{tide.label} ({tide.height})</span>
        </div>
      </div>
    </div>
  )
}
