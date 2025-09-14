import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Droplets, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const VitalsDashboard = ({ vitalsData, isLoading }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const getStatusColor = (value, type) => {
    if (!value) return 'text-dark-400'
    
    switch (type) {
      case 'heartRate':
        if (value < 60 || value > 100) return 'text-danger-500'
        if (value < 70 || value > 90) return 'text-yellow-500'
        return 'text-primary-500'
      case 'spo2':
        if (value < 95) return 'text-danger-500'
        if (value < 98) return 'text-yellow-500'
        return 'text-primary-500'
      case 'hrv':
        if (value < 20) return 'text-danger-500'
        if (value < 30) return 'text-yellow-500'
        return 'text-primary-500'
      default:
        return 'text-primary-500'
    }
  }

  const getStatusBorder = (value, type) => {
    if (!value) return 'border-dark-700'
    
    switch (type) {
      case 'heartRate':
        if (value < 60 || value > 100) return 'border-danger-500/50'
        if (value < 70 || value > 90) return 'border-yellow-500/50'
        return 'border-primary-500/50'
      case 'spo2':
        if (value < 95) return 'border-danger-500/50'
        if (value < 98) return 'border-yellow-500/50'
        return 'border-primary-500/50'
      case 'hrv':
        if (value < 20) return 'border-danger-500/50'
        if (value < 30) return 'border-yellow-500/50'
        return 'border-primary-500/50'
      default:
        return 'border-primary-500/50'
    }
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-dark-400" />
  }

  const vitals = [
    {
      id: 'heartRate',
      title: 'Heart Rate',
      value: vitalsData?.heartRate || 0,
      unit: 'BPM',
      icon: Heart,
      trend: vitalsData?.heartRateTrend || 0,
      description: 'Beats per minute',
      normalRange: '60-100 BPM'
    },
    {
      id: 'spo2',
      title: 'Blood Oxygen',
      value: vitalsData?.spo2 || 0,
      unit: '%',
      icon: Droplets,
      trend: vitalsData?.spo2Trend || 0,
      description: 'Oxygen saturation',
      normalRange: '95-100%'
    },
    {
      id: 'hrv',
      title: 'Heart Rate Variability',
      value: vitalsData?.hrv || 0,
      unit: 'ms',
      icon: Activity,
      trend: vitalsData?.hrvTrend || 0,
      description: 'Variability between heartbeats',
      normalRange: '20-50 ms'
    }
  ]

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vitals.map((vital) => (
          <motion.div
            key={vital.id}
            className={`glass-card p-6 rounded-xl hover-glow group transition-all duration-300 ${getStatusBorder(vital.value, vital.id)}`}
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br from-dark-700 to-dark-800 group-hover:from-dark-600 group-hover:to-dark-700 transition-all duration-300`}>
                <vital.icon className={`w-6 h-6 ${getStatusColor(vital.value, vital.id)}`} />
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(vital.trend)}
                <span className="text-xs text-dark-400">
                  {Math.abs(vital.trend).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-dark-300">
                {vital.title}
              </h3>
              
              <div className="flex items-baseline space-x-2">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-16 bg-dark-700 rounded"></div>
                  </div>
                ) : (
                  <motion.span
                    className={`text-3xl font-bold ${getStatusColor(vital.value, vital.id)}`}
                    key={vital.value}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {vital.value}
                  </motion.span>
                )}
                <span className="text-sm text-dark-400 font-medium">
                  {vital.unit}
                </span>
              </div>

              <p className="text-xs text-dark-400 leading-relaxed">
                {vital.description}
              </p>
              
              <div className="pt-2 border-t border-dark-700/50">
                <p className="text-xs text-dark-500">
                  Normal: {vital.normalRange}
                </p>
              </div>
            </div>

            {/* Pulse animation for heart rate */}
            {vital.id === 'heartRate' && vital.value > 0 && (
              <div className="absolute top-4 right-4">
                <motion.div
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 60 / (vital.value || 70), 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Status Summary */}
      <motion.div
        className="glass-card p-4 rounded-xl"
        variants={cardVariants}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-white">
              {isLoading ? 'Collecting data...' : 'Monitoring active'}
            </span>
          </div>
          <div className="text-xs text-dark-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default VitalsDashboard
