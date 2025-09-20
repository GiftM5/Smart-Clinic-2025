import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Zap, Smartphone, Brain, Shield } from 'lucide-react'
import { MessageSquare } from 'lucide-react'


const Landing = ({ onGetStarted, onOpenClinic, onOpenLearn, onOpenLogin, onOpenChat }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const features = [
    {
      icon: Heart,
      title: "Heart Rate",
      description: "Real-time monitoring using smartphone camera"
    },
    {
      icon: Activity,
      title: "SpO₂ Levels",
      description: "Blood oxygen saturation tracking"
    },
    {
      icon: Zap,
      title: "HRV Analysis",
      description: "Heart rate variability insights"
    },
    {
      icon: Brain,
      title: "AI Predictions",
      description: "Early risk detection with machine learning"
    },
    {
      icon: Smartphone,
      title: "No Wearables",
      description: "Just your smartphone - no extra devices needed"
    },
    {
      icon: Shield,
      title: "Health Insights",
      description: "Actionable recommendations for better health"
    }
  ]

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-danger-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-400/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 text-center max-w-6xl mx-auto px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="space-y-8 mb-16" variants={itemVariants}>
          <motion.h1 
            className="text-6xl md:text-8xl font-bold neon-text leading-tight"
            variants={itemVariants}
          >
            Pulse<span className="text-white">AI</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-dark-300 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Next-generation health monitoring that empowers you to track vital signs using just your smartphone. 
            AI-powered insights detect risks before they become critical.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={itemVariants}
          >
            <motion.button
              onClick={onGetStarted}
              className="glass-card px-8 py-4 rounded-xl text-lg font-semibold text-primary-400 hover-glow transition-all duration-300 glow-border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Monitoring
            </motion.button>
            
            <motion.button
              onClick={onOpenClinic}
              className="glass-card px-8 py-4 rounded-xl text-lg font-semibold text-green-400 hover-glow transition-all duration-300 glow-border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enter AI Clinic
            </motion.button>

            <motion.button
              onClick={onOpenLearn}
              className="glass-card px-8 py-4 rounded-xl text-lg font-semibold text-dark-300 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
             
            <motion.button
              onClick={onOpenChat} // Add this onClick handler
              className="glass-card px-8 py-4 rounded-xl text-lg font-semibold text-purple-400 hover-glow transition-all duration-300 glow-border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
            Talk to Buddy
            </motion.button>

            <motion.button
              onClick={onOpenLogin}
              className="glass-card px-8 py-4 rounded-xl text-lg font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="glass-card p-6 rounded-xl hover-glow group"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-lg bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-dark-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="mt-16 text-center"
          variants={itemVariants}
        >
          <p className="text-dark-400 text-sm">
            No wearables required • Real-time monitoring • AI-powered insights
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Landing
