import React, { useEffect, useRef, useState } from 'react'

const RespiratoryRateSimulator = () => {
	const canvasRef = useRef(null)
	const [rr, setRr] = useState(16)
	const [running, setRunning] = useState(false)
	const animationRef = useRef(null)
	const startTimeRef = useRef(0)

	useEffect(() => {
		return () => {
			if (animationRef.current) cancelAnimationFrame(animationRef.current)
		}
	}, [])

	const drawWave = (time) => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		const w = canvas.width
		const h = canvas.height
		ctx.clearRect(0, 0, w, h)
		
		// Breathing frequency in Hz
		const freq = rr / 60
		const t = (time - startTimeRef.current) / 1000
		
		// Base sinusoid with slight variability
		ctx.strokeStyle = '#34d399'
		ctx.lineWidth = 2
		ctx.beginPath()
		for (let x = 0; x < w; x++) {
			const phase = 2 * Math.PI * freq * (x / w * 5 + t)
			const noise = Math.sin(phase * 3) * 0.05
			const y = h/2 - Math.sin(phase) * (h * 0.3) * (0.9 + noise)
			if (x === 0) ctx.moveTo(x, y)
			else ctx.lineTo(x, y)
		}
		ctx.stroke()
	}

	const loop = (time) => {
		drawWave(time)
		animationRef.current = requestAnimationFrame(loop)
	}

	const start = () => {
		if (running) return
		startTimeRef.current = performance.now()
		setRunning(true)
		animationRef.current = requestAnimationFrame(loop)
	}
	const stop = () => {
		setRunning(false)
		if (animationRef.current) cancelAnimationFrame(animationRef.current)
	}

	useEffect(() => {
		if (running) {
			// restart to apply new RR smoothly
			stop()
			start()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rr])

	return (
		<div className="glass-card p-6 rounded-xl space-y-4">
			<h3 className="text-xl font-semibold text-white">🫁 Respiratory Rate</h3>
			<div className="text-sm text-dark-300">Animated breathing waveform. Adjust RR to simulate.</div>
			<canvas ref={canvasRef} width={600} height={160} className="w-full rounded bg-dark-800" />
			<div className="flex items-center justify-between">
				<div className="text-white text-2xl font-bold">{rr} brpm</div>
				<div className="flex items-center gap-2">
					<button onClick={() => setRr(Math.max(8, rr - 2))} className="px-3 py-2 rounded bg-gray-600 text-white">-</button>
					<button onClick={() => setRr(Math.min(30, rr + 2))} className="px-3 py-2 rounded bg-gray-600 text-white">+</button>
					{!running ? (
						<button onClick={start} className="px-4 py-2 rounded bg-blue-600 text-white">Start</button>
					) : (
						<button onClick={stop} className="px-4 py-2 rounded bg-red-600 text-white">Stop</button>
					)}
				</div>
			</div>
			<div className="text-xs text-dark-400">Normal adult RR ~12–20 breaths/min. Increase to simulate exertion or anxiety.</div>
		</div>
	)
}

export default RespiratoryRateSimulator