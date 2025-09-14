import React, { useState, useRef, useEffect } from 'react'

const DebugCameraTest = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isRunning, setIsRunning] = useState(false)
  const [stream, setStream] = useState(null)
  const [redValue, setRedValue] = useState(0)
  const [greenValue, setGreenValue] = useState(0)
  const [blueValue, setBlueValue] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [values, setValues] = useState([])
  
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      return true
    } catch (error) {
      console.error('Camera error:', error)
      return false
    }
  }

  const stopCamera = () => {
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
    
    setIsRunning(false)
    setFrameCount(0)
    setValues([])
  }

  const analyzeFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isRunning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get center area
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const size = 100

    try {
      const imageData = ctx.getImageData(
        centerX - size/2, 
        centerY - size/2, 
        size, 
        size
      )

      let redSum = 0, greenSum = 0, blueSum = 0
      const pixels = imageData.data
      
      for (let i = 0; i < pixels.length; i += 4) {
        redSum += pixels[i]     // Red
        greenSum += pixels[i + 1] // Green
        blueSum += pixels[i + 2]  // Blue
      }

      const pixelCount = pixels.length / 4
      const avgRed = redSum / pixelCount
      const avgGreen = greenSum / pixelCount
      const avgBlue = blueSum / pixelCount
      
      setRedValue(Math.round(avgRed))
      setGreenValue(Math.round(avgGreen))
      setBlueValue(Math.round(avgBlue))
      setFrameCount(prev => prev + 1)
      
      // Store last 20 values for trend analysis
      setValues(prev => {
        const newValues = [...prev, avgRed].slice(-20)
        return newValues
      })

    } catch (error) {
      console.error('Frame analysis error:', error)
    }
  }

  const startTest = async () => {
    const cameraStarted = await startCamera()
    if (!cameraStarted) return

    setIsRunning(true)
    setFrameCount(0)
    setValues([])
    
    // Analyze frames every 200ms
    intervalRef.current = setInterval(analyzeFrame, 200)
  }

  const calculateStats = () => {
    if (values.length < 2) return null
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b) / values.length
    const variation = max - min
    
    return { min, max, avg, variation }
  }

  const stats = calculateStats()

  return (
    <div className="glass-card p-6 rounded-xl space-y-4">
      <h3 className="text-xl font-semibold text-white">🔍 Debug Camera Test</h3>
      
      <div className="text-sm text-dark-300">
        This shows exactly what the camera sees. Use this to debug finger placement.
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
        
        {isRunning && (
          <div className="absolute top-2 left-2 right-2 bg-black/80 text-white p-2 rounded text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>🔴 Red: {redValue}</div>
              <div>🟢 Green: {greenValue}</div>
              <div>🔵 Blue: {blueValue}</div>
              <div>📊 Frames: {frameCount}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Real-time Stats */}
      {stats && (
        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">📈 Signal Analysis (Last 20 frames):</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-dark-300">
              <div>Min Red: {stats.min.toFixed(1)}</div>
              <div>Max Red: {stats.max.toFixed(1)}</div>
            </div>
            <div className="text-dark-300">
              <div>Average: {stats.avg.toFixed(1)}</div>
              <div>Variation: {stats.variation.toFixed(1)}</div>
            </div>
          </div>
          
          <div className="mt-2 text-sm">
            <div className={`font-medium ${stats.variation > 10 ? 'text-green-400' : stats.variation > 5 ? 'text-yellow-400' : 'text-red-400'}`}>
              Signal Quality: {stats.variation > 10 ? '✅ Excellent' : stats.variation > 5 ? '⚠️ Good' : stats.variation > 2 ? '🔶 Fair' : '❌ Poor'}
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {!isRunning ? (
          <button
            onClick={startTest}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            🔍 Start Debug Test
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
      
      {/* Instructions */}
      <div className="bg-dark-800/30 rounded-lg p-4 text-sm">
        <div className="font-medium text-white mb-2">🎯 Debug Instructions:</div>
        <div className="text-dark-300 space-y-1">
          <div>1. <strong>Turn on iPhone flashlight first</strong></div>
          <div>2. Click "Start Debug Test"</div>
          <div>3. Try different finger positions and watch the values change:</div>
          <div className="ml-4 space-y-1">
            <div>• <strong>No finger</strong>: Red ~20-50</div>
            <div>• <strong>Good placement</strong>: Red 100-200+, varies slightly</div>
            <div>• <strong>Too hard</strong>: Red very high but no variation</div>
            <div>• <strong>Perfect</strong>: Red 100-200, variation 5-20+</div>
          </div>
          <div>4. <strong>Goal</strong>: Get red values 100+ with variation 5+</div>
        </div>
      </div>
    </div>
  )
}

export default DebugCameraTest
