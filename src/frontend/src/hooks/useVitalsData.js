import { useState, useEffect, useRef } from 'react'

export const useVitalsData = () => {
	const [vitalsData, setVitalsData] = useState(null)
	const [previousData, setPreviousData] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const [riskLevel, setRiskLevel] = useState('low')
	const intervalRef = useRef(null)
	const retryCountRef = useRef(0)
	const scenarioTimeoutRef = useRef(null)
	const currentScenarioRef = useRef('none')

	// Centralized API base URL
	const API_BASE = (import.meta?.env?.VITE_API_URL) 
		|| (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://127.0.0.1:8000')

	// Simulate realistic vital signs data when API is not available
	const generateMockData = () => {
		const now = Date.now()
		const timeOfDay = new Date().getHours()
		
		// Simulate circadian rhythm effects
		const circadianFactor = Math.sin((timeOfDay - 6) * Math.PI / 12) * 0.1 + 1
		
		// Base values with some realistic variation
		const baseHeartRate = 72 * circadianFactor + (Math.random() - 0.5) * 10
		const baseSpo2 = 98 + (Math.random() - 0.5) * 2
		const baseHrv = 35 + (Math.random() - 0.5) * 15
		
		// Add some occasional "stress" events
		const stressEvent = Math.random() < 0.1 // 10% chance
		const exerciseEvent = Math.random() < 0.05 // 5% chance
		
		let heartRate = baseHeartRate
		let spo2 = baseSpo2
		let hrv = baseHrv
		
		if (stressEvent) {
			heartRate += 15 + Math.random() * 10
			hrv -= 10 + Math.random() * 5
		}
		
		if (exerciseEvent) {
			heartRate += 25 + Math.random() * 20
			spo2 -= 1 + Math.random() * 2
			hrv += 5 + Math.random() * 10
		}
		
		// Ensure values stay within realistic bounds
		heartRate = Math.max(50, Math.min(150, Math.round(heartRate)))
		spo2 = Math.max(90, Math.min(100, Math.round(spo2 * 10) / 10))
		hrv = Math.max(15, Math.min(80, Math.round(hrv)))
		
		return {
			heartRate,
			spo2,
			hrv,
			timestamp: now,
			// Calculate trends if we have previous data
			heartRateTrend: previousData ? heartRate - previousData.heartRate : 0,
			spo2Trend: previousData ? spo2 - previousData.spo2 : 0,
			hrvTrend: previousData ? hrv - previousData.hrv : 0,
		}
	}

	// Calculate risk level based on vital signs
	const calculateRiskLevel = (data) => {
		if (!data) return 'low'
		
		let riskScore = 0
		
		// Heart rate risk factors
		if (data.heartRate < 60 || data.heartRate > 100) riskScore += 2
		else if (data.heartRate < 65 || data.heartRate > 95) riskScore += 1
		
		// SpO2 risk factors
		if (data.spo2 < 95) riskScore += 3
		else if (data.spo2 < 97) riskScore += 1
		
		// HRV risk factors
		if (data.hrv < 20) riskScore += 2
		else if (data.hrv < 25) riskScore += 1
		
		// Trend analysis
		if (data.heartRateTrend > 10) riskScore += 1
		if (data.spo2Trend < -2) riskScore += 2
		if (data.hrvTrend < -5) riskScore += 1
		
		if (riskScore >= 4) return 'high'
		if (riskScore >= 2) return 'medium'
		return 'low'
	}

	// Apply scenario transformations
	const applyScenarioToVitals = (base, scenario) => {
		const data = { ...base }
		if (scenario === 'anxiety') {
			data.heartRate = Math.min(150, (data.heartRate || 72) + 25 + Math.round(Math.random() * 15))
			data.hrv = Math.max(10, (data.hrv || 35) - 10 - Math.round(Math.random() * 5))
			data.spo2 = Math.max(95, (data.spo2 || 98) - Math.random())
		} else if (scenario === 'low_spo2') {
			data.spo2 = Math.max(88, Math.min(93, 90 + (Math.random() - 0.5) * 4))
			data.heartRate = Math.min(130, (data.heartRate || 72) + 10 + Math.round(Math.random() * 10))
			data.hrv = Math.max(15, (data.hrv || 35) - 5)
		}
		data.heartRate = Math.round(data.heartRate)
		data.hrv = Math.round(data.hrv)
		data.spo2 = Math.round(data.spo2 * 10) / 10
		data.timestamp = Date.now()
		data.heartRateTrend = previousData ? data.heartRate - previousData.heartRate : 0
		data.spo2Trend = previousData ? data.spo2 - previousData.spo2 : 0
		data.hrvTrend = previousData ? data.hrv - previousData.hrv : 0
		return data
	}

	// Fetch data from API or use mock data
	const fetchVitalsData = async () => {
		try {
			setError(null)
			
			// Try to fetch from FastAPI backend
			const response = await fetch(`${API_BASE}/api/vitals`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				// Add timeout
				signal: AbortSignal.timeout(3000)
			})
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			
			const data = await response.json()
			
			// Reset retry count on successful fetch
			retryCountRef.current = 0
			
			// Calculate trends
			const dataWithTrends = {
				...data,
				heartRateTrend: previousData ? data.heartRate - previousData.heartRate : 0,
				spo2Trend: previousData ? data.spo2 - previousData.spo2 : 0,
				hrvTrend: previousData ? data.hrv - previousData.hrv : 0,
				timestamp: Date.now()
			}
			
			setPreviousData(vitalsData)
			setVitalsData(dataWithTrends)
			setRiskLevel(calculateRiskLevel(dataWithTrends))
			setIsLoading(false)
			
		} catch (err) {
			console.warn('API not available, using mock data:', err.message)
			
			// Increment retry count
			retryCountRef.current += 1
			
			// Use mock data when API is not available
			const mockData = generateMockData()
			
			setPreviousData(vitalsData)
			setVitalsData(mockData)
			setRiskLevel(calculateRiskLevel(mockData))
			setIsLoading(false)
			
			// Only set error after multiple retries
			if (retryCountRef.current > 3) {
				setError('Unable to connect to monitoring device. Using simulated data.')
			}
		}
	}

	// Start with empty data - only show real camera measurements
	useEffect(() => {
		// Set initial empty state
		setVitalsData({
			heartRate: 0,
			spo2: 0,
			hrv: 0,
			timestamp: Date.now(),
			heartRateTrend: 0,
			spo2Trend: 0,
			hrvTrend: 0
		})
		setRiskLevel('low')
		setIsLoading(false)

		// Don't start automatic polling - wait for real camera data

		// Cleanup
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
			if (scenarioTimeoutRef.current) {
				clearTimeout(scenarioTimeoutRef.current)
			}
		}
	}, []) // Empty dependency array - only run once

	// Manual refresh function
	const refreshData = () => {
		setIsLoading(true)
		fetchVitalsData()
	}

	// Stop/start monitoring
	const toggleMonitoring = (enabled) => {
		if (enabled) {
			if (!intervalRef.current) {
				intervalRef.current = setInterval(fetchVitalsData, 5000)
			}
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
		}
	}

	// Helper to POST camera BPM to backend (best-effort)
	const postCameraBpm = async (bpm) => {
		try {
			await fetch(`${API_BASE}/api/camera/hr`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					heart_rate: bpm,
					method: 'ppg-webcam',
					signal_quality: 'unknown',
					device: navigator.userAgent
				})
			})
		} catch (e) {
			// Silent fail; backend might not be running
		}
	}

	// Update vitals with real camera data
	const updateVitalsFromCamera = (heartRate) => {
		const newData = {
			heartRate: heartRate,
			spo2: 0, // Camera can't detect SpO2
			hrv: 0,  // Camera can't detect HRV
			timestamp: Date.now(),
			heartRateTrend: previousData ? heartRate - previousData.heartRate : 0,
			spo2Trend: 0,
			hrvTrend: 0
		}

		setPreviousData(vitalsData)
		setVitalsData(newData)
		setRiskLevel(calculateRiskLevel(newData))
		// Fire-and-forget POST to backend
		postCameraBpm(heartRate)
	}

	// Scenario controls
	const triggerScenario = (scenario, durationSeconds = 60) => {
		currentScenarioRef.current = scenario
		const base = vitalsData || { heartRate: 72, spo2: 98, hrv: 35 }
		const scenarioData = applyScenarioToVitals(base, scenario)
		setPreviousData(vitalsData)
		setVitalsData(scenarioData)
		setRiskLevel(calculateRiskLevel(scenarioData))
		if (scenarioTimeoutRef.current) clearTimeout(scenarioTimeoutRef.current)
		scenarioTimeoutRef.current = setTimeout(() => {
			resetScenario()
		}, durationSeconds * 1000)
	}

	const resetScenario = () => {
		currentScenarioRef.current = 'none'
		const base = { heartRate: 72, spo2: 98, hrv: 35 }
		base.timestamp = Date.now()
		base.heartRateTrend = previousData ? base.heartRate - (previousData.heartRate || 0) : 0
		base.spo2Trend = previousData ? base.spo2 - (previousData.spo2 || 0) : 0
		base.hrvTrend = previousData ? base.hrv - (previousData.hrv || 0) : 0
		setPreviousData(vitalsData)
		setVitalsData(base)
		setRiskLevel(calculateRiskLevel(base))
	}

	return {
		vitalsData,
		previousData,
		isLoading,
		error,
		riskLevel,
		refreshData,
		toggleMonitoring,
		updateVitalsFromCamera,
		isMonitoring: !!intervalRef.current,
		triggerScenario,
		resetScenario,
		currentScenario: currentScenarioRef
	}
}
