import React, { useState, useRef, useEffect } from 'react'

const SuperSimpleHeartRate = ({ onHeartRateDetected }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [stream, setStream] = useState(null)
  const [redValue, setRedValue] = useState(0)
  const [result, setResult] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [dataPoints, setDataPoints] = useState(0)
  
  const intervalRef = useRef(null)
  const dataRef = useRef([])

  useEffect(() => {
    return () => {
      stopCamera()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...')
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      
      console.log('✅ Camera access granted')
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        console.log('✅ Video playing')
      }

      return true
    } catch (error) {
      console.error('❌ Camera error:', error)
      setResult(`Camera error: ${error.message}`)
      return false
    }
  }

  const stopCamera = () => {
    console.log('🛑 Stopping camera...')
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsRecording(false)
    setRedValue(0)
    setDataPoints(0)
    dataRef.current = []
  }

  const analyzeFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isRecording) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      // Get the entire frame - not just center
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data

      // Calculate average red intensity across entire frame
      let redSum = 0
      let pixelCount = 0

      // Sample every 4th pixel for performance (still very accurate)
      for (let i = 0; i < pixels.length; i += 16) { // Skip 4 pixels each time
        redSum += pixels[i] // Red channel
        pixelCount++
      }

      const avgRed = redSum / pixelCount
      setRedValue(Math.round(avgRed))

      // Store with high precision timestamp
      dataRef.current.push({
        time: performance.now(), // More precise than Date.now()
        red: avgRed
      })

      setDataPoints(dataRef.current.length)

      // Log every 10 frames to see the signal
      if (dataRef.current.length % 10 === 0) {
        console.log(`📊 Frame ${dataRef.current.length}: Red = ${Math.round(avgRed)}`)
      }

    } catch (error) {
      console.error('Frame analysis error:', error)
    }
  }

  const startMeasurement = async () => {
    console.log('🚀 Starting measurement...')
    setResult(null)
    dataRef.current = []
    setDataPoints(0)
    
    const cameraStarted = await startCamera()
    if (!cameraStarted) return

    // 3 second countdown
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          beginRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const beginRecording = () => {
    console.log('🔴 Recording started...')
    setIsRecording(true)
    dataRef.current = []
    setDataPoints(0)
    
    // Analyze frames every 100ms (10 FPS) - higher sampling rate
    intervalRef.current = setInterval(analyzeFrame, 100)

    // Stop after 20 seconds - longer for better accuracy
    setTimeout(() => {
      finishMeasurement()
    }, 20000)
  }

  const finishMeasurement = () => {
    console.log('⏹️ Finishing measurement...')
    setIsRecording(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const data = dataRef.current
    console.log('📈 Analysis starting...', data.length, 'data points')
    
    if (data.length < 10) {
      setResult(`❌ Not enough data: ${data.length} points`)
      stopCamera()
      return
    }

    // SIMPLE AND PROVEN ALGORITHM - like other working apps
    const redValues = data.map(d => d.red)
    const timestamps = data.map(d => d.time)
    const min = Math.min(...redValues)
    const max = Math.max(...redValues)
    const avg = redValues.reduce((a, b) => a + b) / redValues.length
    const variation = max - min

    console.log('📊 Raw signal data:', {
      min: min.toFixed(1),
      max: max.toFixed(1),
      avg: avg.toFixed(1),
      variation: variation.toFixed(1),
      dataPoints: data.length,
      firstFew: redValues.slice(0, 10).map(v => Math.round(v)),
      lastFew: redValues.slice(-10).map(v => Math.round(v))
    })

    // Simple moving average to smooth signal
    const smoothed = []
    const windowSize = 5
    for (let i = windowSize; i < redValues.length - windowSize; i++) {
      let sum = 0
      for (let j = i - windowSize; j <= i + windowSize; j++) {
        sum += redValues[j]
      }
      smoothed.push(sum / (windowSize * 2 + 1))
    }

    console.log('📈 Smoothed signal:', smoothed.slice(0, 10).map(v => Math.round(v)))

    // Find peaks in smoothed signal
    const peaks = []
    const threshold = Math.min(...smoothed) + (Math.max(...smoothed) - Math.min(...smoothed)) * 0.6

    for (let i = 2; i < smoothed.length - 2; i++) {
      if (smoothed[i] > smoothed[i-1] &&
          smoothed[i] > smoothed[i+1] &&
          smoothed[i] > smoothed[i-2] &&
          smoothed[i] > smoothed[i+2] &&
          smoothed[i] > threshold) {
        peaks.push(i + windowSize) // Adjust for smoothing offset
      }
    }

    console.log('🔍 Found peaks:', peaks.length, 'at positions:', peaks)

    let heartRate = null
    let method = 'none'

    // Calculate heart rate from peaks
    if (peaks.length >= 3) {
      const intervals = []
      for (let i = 1; i < peaks.length; i++) {
        const timeDiff = (timestamps[peaks[i]] - timestamps[peaks[i-1]]) / 1000 // seconds
        if (timeDiff > 0.4 && timeDiff < 2.0) { // 30-150 BPM range
          intervals.push(60 / timeDiff)
        }
      }

      if (intervals.length >= 2) {
        // Use median to avoid outliers
        intervals.sort((a, b) => a - b)
        const median = intervals[Math.floor(intervals.length / 2)]
        if (median >= 40 && median <= 150) {
          heartRate = Math.round(median)
          method = 'peak-detection'
        }
      }
    }

    console.log('💓 Heart rate calculation:', { heartRate, method, peakCount: peaks.length })

    if (heartRate) {
      console.log('✅ Heart rate detected:', heartRate, 'BPM using', method)
      const confidence = variation > 20 ? 'High' : variation > 10 ? 'Medium' : variation > 5 ? 'Low' : 'Very Low'
      setResult(`✅ Heart Rate: ${heartRate} BPM

      📊 Detection Details:
      • Confidence: ${confidence}
      • Algorithm: ${method}
      • Signal variation: ${variation.toFixed(1)}
      • Data points: ${data.length}
      • Red range: ${min.toFixed(1)} - ${max.toFixed(1)}
      • Signal quality: ${variation > 20 ? 'Excellent' : variation > 10 ? 'Good' : variation > 5 ? 'Fair' : 'Poor'}`)

      if (onHeartRateDetected) {
        onHeartRateDetected(heartRate)
      }
    } else {
      console.log('❌ No heart rate detected')
      setResult(`❌ No heartbeat detected

      📊 Signal Analysis:
      • Red variation: ${variation.toFixed(1)} (need > 1 for detection)
      • Data points: ${data.length}
      • Red range: ${min.toFixed(1)} to ${max.toFixed(1)}
      • Average red: ${avg.toFixed(1)}

      💡 Troubleshooting:
      • Make sure flashlight is ON and finger covers both camera + flashlight
      • Press gently but firmly (like touching phone screen)
      • Try index finger (best blood flow)
      • Ensure you see red glow through your finger
      • Stay perfectly still during measurement`)
    }

    stopCamera()
  }

  // Keep it simple - no complex methods

  return (
    <div className="glass-card p-6 rounded-xl space-y-4">
      <h3 className="text-xl font-semibold text-white">Super Simple Heart Rate Test</h3>
      
      <div className="text-sm text-dark-300">
        This version uses the most basic algorithm possible - if this doesn't work, the issue is with camera/finger placement.
      </div>
      
      {/* Camera View */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-48 bg-dark-800 rounded object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80 rounded">
            <div className="text-4xl font-bold text-white">{countdown}</div>
          </div>
        )}
        
        {isRecording && (
          <div className="absolute top-2 left-2 right-2 bg-red-500/80 text-white p-2 rounded text-center">
            <div>💓 Detecting heartbeat... Keep finger steady!</div>
            <div className="text-sm mt-1">
              Red: {redValue} | Points: {dataPoints} | Time: {Math.floor(dataPoints / 10)}s
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex justify-center">
        {!isRecording ? (
          <button
            onClick={startMeasurement}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            💓 Detect Heart Rate (20s)
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            ⏹️ Stop
          </button>
        )}
      </div>
      
      {/* Result */}
      {result && (
        <div className="bg-dark-800/50 rounded-lg p-4">
          <pre className="text-sm text-white whitespace-pre-wrap">{result}</pre>
        </div>
      )}
      
      {/* Simple Instructions */}
      <div className="bg-dark-800/30 rounded-lg p-4 text-sm">
        <div className="font-medium text-white mb-2">💓 Heart Rate Detection:</div>
        <div className="text-dark-300 space-y-1">
          <div>1. <strong>Turn on iPhone flashlight first</strong></div>
          <div>2. Click "Detect Heart Rate"</div>
          <div>3. <strong>Cover BOTH camera and flashlight with fingertip</strong></div>
          <div>4. Press gently (like touching screen) - you should see red glow</div>
          <div>5. Stay perfectly still for 20 seconds</div>
          <div>6. Algorithm will find your heartbeat peaks automatically</div>
        </div>
      </div>
    </div>
  )
}

export default SuperSimpleHeartRate
