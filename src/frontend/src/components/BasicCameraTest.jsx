import React, { useState, useRef } from 'react'

const BasicCameraTest = () => {
  const videoRef = useRef(null)
  const [status, setStatus] = useState('Click to test camera')
  const [stream, setStream] = useState(null)

  const testCamera = async () => {
    setStatus('Requesting camera access...')
    console.log('Testing camera access...')
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus('❌ Camera not supported in this browser')
        console.error('getUserMedia not supported')
        return
      }

      console.log('getUserMedia is supported')
      setStatus('Camera supported, requesting access...')

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true
      })

      console.log('Camera access granted!')
      setStatus('✅ Camera access granted! Video should appear below.')
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
        console.log('Video element set up')
      }

    } catch (error) {
      console.error('Camera error:', error)
      setStatus(`❌ Camera error: ${error.name} - ${error.message}`)
      
      // Provide specific error messages
      if (error.name === 'NotAllowedError') {
        setStatus('❌ Camera permission denied. Please allow camera access and try again.')
      } else if (error.name === 'NotFoundError') {
        setStatus('❌ No camera found on this device.')
      } else if (error.name === 'NotSupportedError') {
        setStatus('❌ Camera not supported. Try a different browser or enable HTTPS.')
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setStatus('Camera stopped')
      console.log('Camera stopped')
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  return (
    <div className="glass-card p-6 rounded-xl space-y-4">
      <h3 className="text-xl font-semibold text-white">Basic Camera Test</h3>
      
      <div className="text-sm text-dark-300">
        {status}
      </div>
      
      <div className="space-x-4">
        <button
          onClick={testCamera}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Test Camera
        </button>
        
        <button
          onClick={stopCamera}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Stop Camera
        </button>
      </div>
      
      <video
        ref={videoRef}
        className="w-full h-48 bg-dark-800 rounded"
        playsInline
        muted
        autoPlay
      />
      
      <div className="text-xs text-dark-400">
        <p><strong>Instructions:</strong></p>
        <p>1. Click "Test Camera"</p>
        <p>2. Allow camera permission when prompted</p>
        <p>3. You should see yourself in the video above</p>
        <p>4. Check browser console (F12) for detailed logs</p>
      </div>
    </div>
  )
}

export default BasicCameraTest
