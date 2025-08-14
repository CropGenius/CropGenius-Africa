import { forwardRef, HTMLAttributes, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface LiquidWeatherGlassProps extends HTMLAttributes<HTMLDivElement> {
  temperature?: number
  humidity?: number
  condition?: string
  windSpeed?: number
  variant?: "compact" | "full" | "minimal"
  animated?: boolean
  showDetails?: boolean
}

const LiquidWeatherGlass = forwardRef<HTMLDivElement, LiquidWeatherGlassProps>(
  ({ 
    className, 
    temperature = 25, 
    humidity = 65, 
    condition = "Partly Cloudy",
    windSpeed = 12,
    variant = "full",
    animated = true,
    showDetails = true,
    ...props 
  }, ref) => {
    const [liquidLevel, setLiquidLevel] = useState(50)
    const [bubbleAnimation, setBubbleAnimation] = useState(false)

    useEffect(() => {
      // Calculate liquid level based on temperature (0-100 range)
      const normalizedTemp = Math.max(0, Math.min(100, (temperature + 10) * 2.5))
      setLiquidLevel(normalizedTemp)
      
      // Trigger bubble animation
      setBubbleAnimation(true)
      const timer = setTimeout(() => setBubbleAnimation(false), 2000)
      return () => clearTimeout(timer)
    }, [temperature])

    const getLiquidColor = () => {
      if (temperature < 10) return "from-blue-400/80 to-blue-600/80" // Cold
      if (temperature < 20) return "from-cyan-400/80 to-blue-500/80" // Cool
      if (temperature < 30) return "from-green-400/80 to-emerald-500/80" // Warm
      return "from-orange-400/80 to-red-500/80" // Hot
    }

    const getConditionIcon = () => {
      switch (condition?.toLowerCase()) {
        case "sunny":
        case "clear":
          return "☀️"
        case "partly cloudy":
        case "clouds":
          return "⛅"
        case "cloudy":
          return "☁️"
        case "rain":
        case "light rain":
          return "🌧️"
        case "heavy rain":
          return "⛈️"
        case "thunderstorm":
          return "🌩️"
        case "snow":
          return "❄️"
        default:
          return "🌤️"
      }
    }

    const compactContent = (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-1">{getConditionIcon()}</div>
          <div className="text-lg font-bold">{Math.round(temperature)}°</div>
          <div className="text-xs opacity-80">{condition}</div>
        </div>
      </div>
    )

    const fullContent = (
      <div className="relative w-full h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold">{Math.round(temperature)}°C</div>
            <div className="text-sm opacity-80 flex items-center gap-1">
              <span>{getConditionIcon()}</span>
              <span>{condition}</span>
            </div>
          </div>
          <div className="text-right text-sm">
            <div>💧 {humidity}%</div>
            <div>💨 {windSpeed} km/h</div>
          </div>
        </div>

        {/* Temperature Scale */}
        <div className="relative h-32 mb-4 rounded-lg overflow-hidden bg-slate-900/20 backdrop-blur-sm">
          {/* Liquid */}
          <motion.div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t transition-all duration-1000",
              getLiquidColor()
            )}
            style={{ height: `${liquidLevel}%` }}
            initial={{ height: 0 }}
            animate={{ height: `${liquidLevel}%` }}
            transition={{ duration: animated ? 1.5 : 0, ease: "easeOut" }}
          >
            {/* Bubbles */}
            {bubbleAnimation && Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  bottom: `${Math.random() * 20}%`,
                }}
                animate={{
                  y: [-10, -60],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
            ))}
          </motion.div>

          {/* Temperature markers */}
          <div className="absolute right-2 top-2 bottom-2 flex flex-col justify-between text-xs text-white/70">
            <span>40°</span>
            <span>20°</span>
            <span>0°</span>
          </div>
        </div>

        {/* Details */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <div className="opacity-80">Feels like</div>
              <div className="font-semibold">{Math.round(temperature + (Math.random() - 0.5) * 4)}°</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <div className="opacity-80">UV Index</div>
              <div className="font-semibold">
                {temperature > 30 ? "High" : temperature > 20 ? "Medium" : "Low"}
              </div>
            </div>
          </div>
        )}
      </div>
    )

    const minimalContent = (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-1">{getConditionIcon()}</div>
          <div className="text-xl font-bold">{Math.round(temperature)}°</div>
        </div>
      </div>
    )

    const getVariantContent = () => {
      switch (variant) {
        case "compact":
          return compactContent
        case "minimal":
          return minimalContent
        default:
          return fullContent
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/20",
          "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md",
          "shadow-[0_8px_32px_rgba(0,0,0,0.1)]",
          "hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] transition-all duration-300",
          className
        )}
        {...props}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 via-transparent to-purple-400/20" />
        
        {/* Content */}
        <div className="relative z-10">
          {getVariantContent()}
        </div>

        {/* Glass reflection */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/20 to-transparent rotate-45 opacity-30" />
        </div>
      </div>
    )
  }
)

LiquidWeatherGlass.displayName = "LiquidWeatherGlass"

export { LiquidWeatherGlass }
export default LiquidWeatherGlass