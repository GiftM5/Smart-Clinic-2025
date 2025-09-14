import React, { useRef, useState, useEffect } from "react"

const HeartRateMonitor = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)

  const [heartRate, setHeartRate] = useState(null)
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [signal, setSignal] = useState([])

  const SAMPLE_RATE = 30 // 30Hz sampling

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // back camera if available
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err) {
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const analyzeFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext("2d")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = frame.data

    let redSum = 0
    for (let i = 0; i < pixels.length; i += 4) {
      redSum += pixels[i] // red channel
    }

    const avgRed = redSum / (pixels.length / 4)

    // Save to signal buffer
    setSignal(prev => {
      const newSignal = [...prev, avgRed].slice(-SAMPLE_RATE * 10) // keep last 10s
      return newSignal
    })
  }

  // Peak detection (basic)
  const calculateHeartRate = (data) => {
    if (data.length < SAMPLE_RATE * 5) return null // need at least 5s

    // Normalize
    const mean = data.reduce((a, b) => a + b, 0) / data.length
    const normalized = data.map(x => x - mean)

    // Detect peaks
    let peaks = 0
    for (let i = 1; i < normalized.length - 1; i++) {
      if (normalized[i] > normalized[i - 1] && normalized[i] > normalized[i + 1] && normalized[i] > 0) {
        peaks++
      }
    }

    const durationSec = data.length / SAMPLE_RATE
    const bpm = (peaks / durationSec) * 60
    return Math.round(bpm)
  }

  useEffect(() => {
    if (signal.length > SAMPLE_RATE * 5) {
      const bpm = calculateHeartRate(signal)
      if (bpm && bpm > 40 && bpm < 180) {
        setHeartRate(bpm)
      }
    }
  }, [signal])

  const startMeasurement = () => {
    setIsMeasuring(true)
    setSignal([])
    startCamera()
    intervalRef.current = setInterval(analyzeFrame, 1000 / SAMPLE_RATE)
  }

  const stopMeasurement = () => {
    setIsMeasuring(false)
    stopCamera()
    clearInterval(intervalRef.current)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
      <h1 className="text-2xl font-bold mb-4">Heart Rate Monitor</h1>
      <video ref={videoRef} className="w-64 h-64 rounded-lg" autoPlay playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      <div className="mt-4">
        {isMeasuring ? (
          <button
            onClick={stopMeasurement}
            className="px-6 py-2 bg-red-600 rounded-lg shadow-md"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={startMeasurement}
            className="px-6 py-2 bg-green-600 rounded-lg shadow-md"
          >
            Start
          </button>
        )}
      </div>
      {heartRate && (
        <div className="mt-6 text-xl">
          ❤️ Heart Rate: <span className="font-bold">{heartRate} BPM</span>
        </div>
      )}
    </div>
  )
}

export default HeartRateMonitor

