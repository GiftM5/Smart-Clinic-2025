import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts'
import { Calendar, TrendingUp } from 'lucide-react'

const VitalsChart = ({ vitalsData }) => {
  const [chartData, setChartData] = useState([])
  const [selectedMetric, setSelectedMetric] = useState('heartRate')
  const [timeRange, setTimeRange] = useState('1h')

  // Generate sample historical data
  useEffect(() => {
    const generateData = () => {
      const now = new Date()
      const data = []
      const points = timeRange === '1h' ? 12 : timeRange === '6h' ? 36 : 48
      
      for (let i = points; i >= 0; i--) {
        const time = new Date(now.getTime() - i * (timeRange === '1h' ? 5 : timeRange === '6h' ? 10 : 15) * 60000)
        
        // Generate realistic vital signs data with some variation
        const baseHeartRate = 75 + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 8
        const baseSpo2 = 98 + Math.sin(i * 0.05) * 1.5 + (Math.random() - 0.5) * 2
        const baseHrv = 35 + Math.sin(i * 0.08) * 8 + (Math.random() - 0.5) * 6
        
        data.push({
          time: time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          timestamp: time.getTime(),
          heartRate: Math.max(50, Math.min(120, Math.round(baseHeartRate))),
          spo2: Math.max(90, Math.min(100, Math.round(baseSpo2 * 10) / 10)),
          hrv: Math.max(15, Math.min(60, Math.round(baseHrv)))
        })
      }
      
      // Add current data if available
      if (vitalsData) {
        data[data.length - 1] = {
          ...data[data.length - 1],
          heartRate: vitalsData.heartRate || data[data.length - 1].heartRate,
          spo2: vitalsData.spo2 || data[data.length - 1].spo2,
          hrv: vitalsData.hrv || data[data.length - 1].hrv
        }
      }
      
      return data
    }

    setChartData(generateData())
  }, [vitalsData, timeRange])

  const metrics = {
    heartRate: {
      name: 'Heart Rate',
      color: '#ff005c',
      unit: 'BPM',
      domain: [50, 120]
    },
    spo2: {
      name: 'Blood Oxygen',
      color: '#00e0ff',
      unit: '%',
      domain: [90, 100]
    },
    hrv: {
      name: 'HRV',
      color: '#10b981',
      unit: 'ms',
      domain: [15, 60]
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="glass-card p-3 rounded-lg border border-dark-600/50">
          <p className="text-sm text-dark-300 mb-1">{label}</p>
          <p className="text-lg font-semibold" style={{ color: data.color }}>
            {data.value} {metrics[selectedMetric].unit}
          </p>
        </div>
      )
    }
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  return (
    <motion.div
      className="glass-card p-6 rounded-xl space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">
            Vitals Trend
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-dark-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
          >
            <option value="1h">1 Hour</option>
            <option value="6h">6 Hours</option>
            <option value="12h">12 Hours</option>
          </select>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex space-x-2">
        {Object.entries(metrics).map(([key, metric]) => (
          <button
            key={key}
            onClick={() => setSelectedMetric(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              selectedMetric === key
                ? 'bg-dark-700 text-white border border-dark-600'
                : 'text-dark-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            {metric.name}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={metrics[selectedMetric].color} 
                  stopOpacity={0.3}
                />
                <stop 
                  offset="95%" 
                  stopColor={metrics[selectedMetric].color} 
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            
            <YAxis 
              domain={metrics[selectedMetric].domain}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              width={40}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={metrics[selectedMetric].color}
              strokeWidth={2}
              fill={`url(#gradient-${selectedMetric})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: metrics[selectedMetric].color,
                stroke: '#1e293b',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-700/50">
        {chartData.length > 0 && (
          <>
            <div className="text-center">
              <p className="text-xs text-dark-400 mb-1">Current</p>
              <p className="text-lg font-semibold" style={{ color: metrics[selectedMetric].color }}>
                {chartData[chartData.length - 1]?.[selectedMetric]} {metrics[selectedMetric].unit}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-dark-400 mb-1">Average</p>
              <p className="text-lg font-semibold text-white">
                {Math.round(
                  chartData.reduce((sum, item) => sum + item[selectedMetric], 0) / chartData.length
                )} {metrics[selectedMetric].unit}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-dark-400 mb-1">Range</p>
              <p className="text-lg font-semibold text-white">
                {Math.min(...chartData.map(item => item[selectedMetric]))} - {Math.max(...chartData.map(item => item[selectedMetric]))}
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default VitalsChart
