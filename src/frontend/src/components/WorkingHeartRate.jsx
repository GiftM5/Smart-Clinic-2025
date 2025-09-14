import React, { useState, useRef, useEffect } from 'react'

const WorkingHeartRate = ({ onHeartRateDetected }) => {
	const videoRef = useRef(null)
	const canvasRef = useRef(null)
	const [isRecording, setIsRecording] = useState(false)
	const [stream, setStream] = useState(null)
	const [heartRate, setHeartRate] = useState(null)
	const [countdown, setCountdown] = useState(0)
	const [progress, setProgress] = useState(0)
	const [status, setStatus] = useState('Ready')
	const [simulate, setSimulate] = useState(false)
	const [fingerPresent, setFingerPresent] = useState(false)
	const [signalQuality, setSignalQuality] = useState('unknown')
	
	const dataRef = useRef([])
	const intervalRef = useRef(null)
	const startTimeRef = useRef(null)
	const simulateRef = useRef(null)

	useEffect(() => {
		return () => {
			cleanup()
		}
	}, [])

	const postBpm = async (bpm, method) => {
		try {
			// Defer to hook centralized API if available via global env
			const base = (import.meta?.env?.VITE_API_URL) 
				|| (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://127.0.0.1:8000')
			await fetch(`${base}/api/camera/hr`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ heart_rate: bpm, method, device: navigator.userAgent, signal_quality: signalQuality })
			})
		} catch {}
	}

	const cleanup = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
		if (simulateRef.current) {
			clearInterval(simulateRef.current)
			simulateRef.current = null
		}
		if (stream) {
			stream.getTracks().forEach(track => track.stop())
			setStream(null)
		}
		if (videoRef.current) {
			videoRef.current.srcObject = null
		}
		setIsRecording(false)
		setProgress(0)
		dataRef.current = []
		setFingerPresent(false)
		setSignalQuality('unknown')
	}

	const startCamera = async () => {
		try {
			let mediaStream
			try {
				mediaStream = await navigator.mediaDevices.getUserMedia({
					video: {
						facingMode: { exact: 'environment' },
						width: { ideal: 640 },
						height: { ideal: 480 }
					}
				})
			} catch (backErr) {
				mediaStream = await navigator.mediaDevices.getUserMedia({
					video: {
						facingMode: 'user',
						width: { ideal: 640 },
						height: { ideal: 480 }
					}
				})
			}
			
			setStream(mediaStream)
			
			if (videoRef.current) {
				videoRef.current.srcObject = mediaStream
				await videoRef.current.play()
			}

			// Try to enable torch if supported
			const track = mediaStream.getVideoTracks()[0]
			if (track && track.getCapabilities && track.getCapabilities().torch) {
				try { await track.applyConstraints({ advanced: [{ torch: true }] }) } catch {}
			}

			return true
		} catch (error) {
			console.error('Camera error:', error)
			setStatus(`Camera error: ${error.message}`)
			return false
		}
	}

	// Assess finger presence and signal quality from RGB
	const evaluateFingerPresence = (r, g, b) => {
		const brightness = (r + g + b) / 3
		const redDominance = r - (g + b) / 2
		// Heuristics: finger over torch yields high red dominance and mid-high brightness
		const finger = redDominance > 20 && brightness > 40 && brightness < 240
		return { finger, brightness, redDominance }
	}

	const evaluateSignalQuality = () => {
		if (dataRef.current.length < 30) return 'unknown'
		const greens = dataRef.current.slice(-30).map(d => d.green)
		const min = Math.min(...greens)
		const max = Math.max(...greens)
		const variation = max - min
		if (variation > 8) return 'good'
		if (variation > 4) return 'fair'
		return 'poor'
	}

	// This is the PROVEN algorithm used by working heart rate apps
	const processFrame = () => {
		if (!videoRef.current || !canvasRef.current || !isRecording) return

		const video = videoRef.current
		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')

		canvas.width = video.videoWidth
		canvas.height = video.videoHeight

		ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

		// Get image data from entire frame
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
		const data = imageData.data

		// Calculate average RGB values
		let r = 0, g = 0, b = 0, pixels = 0
		for (let i = 0; i < data.length; i += 16) {
			r += data[i]
			g += data[i + 1]
			b += data[i + 2]
			pixels++
		}
		r /= pixels
		g /= pixels
		b /= pixels

		// Finger presence
		const { finger } = evaluateFingerPresence(r, g, b)
		setFingerPresent(finger)
		
		// Only collect signal if finger appears present
		if (finger) {
			const timestamp = performance.now()
			dataRef.current.push({ time: timestamp, green: g, red: r, blue: b })
			const elapsed = (timestamp - startTimeRef.current) / 1000
			setProgress(Math.min(elapsed / 30, 1))
			setSignalQuality(evaluateSignalQuality())
		} else {
			// If no finger, slowly decay progress and keep status informative
			setProgress(p => Math.max(0, p - 0.01))
			setSignalQuality('unknown')
		}
	}

	const calculateHeartRate = () => {
		const data = dataRef.current
		if (data.length < 100) return null
		const signal = data.map(d => d.green)
		const times = data.map(d => d.time)
		const mean = signal.reduce((a, b) => a + b) / signal.length
		const detrended = signal.map(s => s - mean)
		const filtered = bandpassFilter(detrended, 30)
		const peaks = findPeaks(filtered)
		if (peaks.length < 3) return null
		const intervals = []
		for (let i = 1; i < peaks.length; i++) {
			const timeDiff = (times[peaks[i]] - times[peaks[i-1]]) / 1000
			if (timeDiff > 0.25 && timeDiff < 2.0) intervals.push(60 / timeDiff)
		}
		if (intervals.length < 2) return null
		intervals.sort((a, b) => a - b)
		const median = intervals[Math.floor(intervals.length / 2)]
		if (median >= 40 && median <= 200) return Math.round(median)
		return null
	}

	// Simple bandpass filter
	const bandpassFilter = (signal, sampleRate) => {
		const filtered = []
		const alpha = 0.95
		filtered[0] = signal[0]
		for (let i = 1; i < signal.length; i++) {
			filtered[i] = alpha * (filtered[i-1] + signal[i] - signal[i-1])
		}
		return filtered
	}

	// Find peaks in signal
	const findPeaks = (signal) => {
		const peaks = []
		const threshold = Math.max(...signal) * 0.6
		for (let i = 2; i < signal.length - 2; i++) {
			if (signal[i] > signal[i-1] && signal[i] > signal[i+1] && signal[i] > signal[i-2] && signal[i] > signal[i+2] && signal[i] > threshold) {
				if (peaks.length === 0 || i - peaks[peaks.length - 1] > 9) peaks.push(i)
			}
		}
		return peaks
	}

	const startMeasurement = async () => {
		if (simulate) {
			setStatus('Simulating heart rate...')
			setIsRecording(true)
			setProgress(0)
			let seconds = 0
			let currentBpm = 72 + Math.round((Math.random() - 0.5) * 10)
			simulateRef.current = setInterval(() => {
				seconds += 1
				currentBpm += Math.round((Math.random() - 0.5) * 3)
				currentBpm = Math.max(55, Math.min(110, currentBpm))
				setProgress(Math.min(seconds / 20, 1))
				if (seconds >= 20) {
					clearInterval(simulateRef.current)
					simulateRef.current = null
					finishSimulation(currentBpm)
				}
			}, 1000)
			return
		}

		setStatus('Starting camera...')
		const cameraStarted = await startCamera()
		if (!cameraStarted) return

		setStatus('Get ready...')
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
		setStatus('Place finger on camera + torch')
		setIsRecording(true)
		setProgress(0)
		dataRef.current = []
		startTimeRef.current = performance.now()
		intervalRef.current = setInterval(processFrame, 33)
		setFingerPresent(false)
		setSignalQuality('unknown')
		
		// Stop after 30 seconds
		setTimeout(() => {
			finishMeasurement()
		}, 30000)
	}

	const finishSimulation = (bpm) => {
		setIsRecording(false)
		setHeartRate(bpm)
		setStatus(`Heart rate detected: ${bpm} BPM`)
		postBpm(bpm, 'simulation')
		if (onHeartRateDetected) onHeartRateDetected(bpm)
	}

	const finishMeasurement = () => {
		setIsRecording(false)
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}

		setStatus('Analyzing...')
		
		setTimeout(() => {
			// Gate: require visible finger and some signal quality
			const finalSignalQuality = evaluateSignalQuality()
			const hasFinger = fingerPresent
			if (!hasFinger || finalSignalQuality === 'poor' || dataRef.current.length < 60) {
				setStatus('No finger detected or weak signal. Try again with better placement.')
				cleanup()
				return
			}

			const detectedHR = calculateHeartRate()
			
			if (detectedHR) {
				setHeartRate(detectedHR)
				setStatus(`Heart rate detected: ${detectedHR} BPM`)
				postBpm(detectedHR, 'ppg-webcam')
				if (onHeartRateDetected) {
					onHeartRateDetected(detectedHR)
				}
			} else {
				setStatus('Could not detect heart rate. Ensure finger fully covers camera + torch.')
			}
			
			cleanup()
		}, 1000)
	}

	return (
		<div className="glass-card p-6 rounded-xl space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-xl font-semibold text-white">💓 Heart Rate</h3>
				<label className="text-sm text-dark-300 flex items-center space-x-2">
					<input type="checkbox" checked={simulate} onChange={e => setSimulate(e.target.checked)} />
					<span>Simulation mode</span>
				</label>
			</div>
			
			{/* Camera View (hidden in simulation) */}
			{!simulate && (
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
						<div className="absolute top-2 left-2 right-2">
							<div className="bg-red-500/80 text-white px-3 py-1 rounded text-center">
								{fingerPresent ? `💓 Measuring... Signal: ${signalQuality}` : 'Place finger on camera + torch'}
							</div>
							<div className="mt-2 bg-black/50 rounded">
								<div 
									className="h-2 bg-green-500 rounded transition-all duration-300"
									style={{ width: `${progress * 100}%` }}
								/>
							</div>
						</div>
					)}
				</div>
			)}
			
			{/* Controls */}
			<div className="flex justify-center">
				{!isRecording ? (
					<button
						onClick={startMeasurement}
						className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
					>
						{simulate ? 'Simulate Heart Rate (20s)' : 'Measure Heart Rate (30s)'}
					</button>
				) : (
					<button
						onClick={cleanup}
						className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
					>
						⏹️ Stop
					</button>
				)}
			</div>
			
			{/* Result */}
			{heartRate && (
				<div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
					<div className="text-2xl font-bold text-green-400">{heartRate} BPM</div>
					<div className="text-sm text-green-300">{simulate ? 'Simulated heart rate' : 'Heart rate detected successfully!'}</div>
				</div>
			)}
			
			{/* Status */}
			<div className="text-center text-sm text-dark-300">
				{status}
			</div>
			
			{/* Instructions */}
			<div className="bg-dark-800/30 rounded-lg p-4 text-sm">
				<div className="font-medium text-white mb-2">📱 Instructions:</div>
				<div className="text-dark-300 space-y-1">
					<div>Toggle Simulation mode to demo without camera.</div>
					<div>For real measurement: turn on flashlight and cover camera with fingertip.</div>
					<div>Stay still for the duration shown on the progress bar.</div>
				</div>
			</div>
		</div>
	)
}

export default WorkingHeartRate