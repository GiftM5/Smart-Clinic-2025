import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Heart, Brain, X, Info, TrendingUp } from 'lucide-react'

const RiskAlert = ({ riskLevel, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  const getRiskConfig = (level) => {
    switch (level) {
      case 'high':
        return {
          icon: AlertTriangle,
          title: 'High Risk Detected',
          message: 'AI Prediction: Elevated risk of cardiovascular stress detected',
          description: 'Your vital signs indicate potential health concerns. Consider consulting a healthcare professional.',
          bgGradient: 'from-danger-500/20 via-danger-400/15 to-danger-500/20',
          borderColor: 'border-danger-500/50',
          textColor: 'text-danger-400',
          iconColor: 'text-danger-500',
          recommendations: [
            'Take deep breaths and try to relax',
            'Avoid strenuous activity',
            'Consider contacting your healthcare provider',
            'Monitor symptoms closely'
          ]
        }
      case 'medium':
        return {
          icon: Info,
          title: 'Moderate Risk',
          message: 'AI Analysis: Some vital signs are outside normal range',
          description: 'Your readings suggest mild stress or fatigue. Consider taking preventive measures.',
          bgGradient: 'from-yellow-500/20 via-yellow-400/15 to-yellow-500/20',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-400',
          iconColor: 'text-yellow-500',
          recommendations: [
            'Take a short break and rest',
            'Stay hydrated',
            'Practice stress reduction techniques',
            'Continue monitoring'
          ]
        }
      default:
        return {
          icon: Heart,
          title: 'Normal Range',
          message: 'AI Assessment: All vital signs within healthy parameters',
          description: 'Your health metrics look good. Keep up the healthy lifestyle!',
          bgGradient: 'from-primary-500/20 via-primary-400/15 to-primary-500/20',
          borderColor: 'border-primary-500/50',
          textColor: 'text-primary-400',
          iconColor: 'text-primary-500',
          recommendations: [
            'Maintain current activity level',
            'Continue healthy habits',
            'Regular monitoring recommended',
            'Stay active and hydrated'
          ]
        }
    }
  }

  const config = getRiskConfig(riskLevel)

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      if (onDismiss) onDismiss()
    }, 300)
  }

  // Auto-dismiss low risk alerts after 5 seconds
  useEffect(() => {
    if (riskLevel === 'low') {
      const timer = setTimeout(() => {
        handleDismiss()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [riskLevel])

  const slideVariants = {
    hidden: {
      y: -100,
      opacity: 0,
      scale: 0.95
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    exit: {
      y: -100,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  }

  const detailsVariants = {
    hidden: {
      height: 0,
      opacity: 0
    },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 p-4"
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div
              className={`glass-card border ${config.borderColor} rounded-xl overflow-hidden`}
              style={{
                background: `linear-gradient(135deg, ${config.bgGradient.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')})`
              }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Main Alert */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg bg-dark-800/50`}>
                        <config.icon className={`w-6 h-6 ${config.iconColor}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className={`text-lg font-semibold ${config.textColor}`}>
                          {config.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-primary-400" />
                          <span className="text-xs text-primary-400 font-medium">
                            AI POWERED
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-white font-medium">
                        {config.message}
                      </p>
                      
                      <p className="text-dark-300 text-sm leading-relaxed">
                        {config.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3 pt-2">
                        <button
                          onClick={() => setShowDetails(!showDetails)}
                          className="flex items-center space-x-2 text-sm text-dark-300 hover:text-white transition-colors duration-200"
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>{showDetails ? 'Hide' : 'View'} Recommendations</span>
                        </button>
                        
                        {riskLevel === 'high' && (
                          <button className="text-sm bg-danger-500/20 hover:bg-danger-500/30 text-danger-400 px-3 py-1 rounded-lg transition-colors duration-200">
                            Contact Doctor
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-dark-700/50 transition-colors duration-200 group"
                  >
                    <X className="w-5 h-5 text-dark-400 group-hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Expandable Details */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    variants={detailsVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="border-t border-dark-700/50 bg-dark-800/30"
                  >
                    <div className="p-4 space-y-4">
                      <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-primary-400" />
                        <span>AI Recommendations</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {config.recommendations.map((recommendation, index) => (
                          <motion.div
                            key={index}
                            className="flex items-start space-x-3 p-3 rounded-lg bg-dark-700/30"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className={`w-2 h-2 rounded-full ${config.iconColor.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
                            <p className="text-sm text-dark-300 leading-relaxed">
                              {recommendation}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="text-xs text-dark-500 pt-2 border-t border-dark-700/30">
                        <p>
                          * This is an AI-generated assessment based on your vital signs. 
                          Always consult healthcare professionals for medical advice.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Bar for Auto-dismiss */}
              {riskLevel === 'low' && (
                <div className="h-1 bg-dark-800/50 overflow-hidden">
                  <motion.div
                    className={`h-full ${config.iconColor.replace('text-', 'bg-')}`}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RiskAlert
