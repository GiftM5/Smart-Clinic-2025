import React, { useEffect, useRef, useState } from 'react'

const AutoDemoControls = ({ onTrigger, onReset }) => {
	const [running, setRunning] = useState(false)
	const [stepSeconds, setStepSeconds] = useState(30)
	const timerRef = useRef(null)
	const stepRef = useRef(0)

	useEffect(() => {
		return () => stop()
	}, [])

	const sequence = [
		{ key: 'baseline', action: () => onReset() },
		{ key: 'anxiety', action: () => onTrigger('anxiety', stepSeconds) },
		{ key: 'baseline', action: () => onReset() },
		{ key: 'low_spo2', action: () => onTrigger('low_spo2', stepSeconds) },
		{ key: 'baseline', action: () => onReset() },
	]

	const tick = () => {
		const seq = sequence[stepRef.current % sequence.length]
		seq.action()
		stepRef.current += 1
	}

	const start = () => {
		if (running) return
		setRunning(true)
		stepRef.current = 0
		tick()
		timerRef.current = setInterval(tick, stepSeconds * 1000)
	}
	const stop = () => {
		setRunning(false)
		if (timerRef.current) clearInterval(timerRef.current)
		timerRef.current = null
		onReset()
	}

	useEffect(() => {
		if (!running) return
		// restart timer when stepSeconds changes
		if (timerRef.current) clearInterval(timerRef.current)
		timerRef.current = setInterval(tick, stepSeconds * 1000)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stepSeconds])

	return (
		<div className="glass-card p-6 rounded-xl space-y-3">
			<h3 className="text-xl font-semibold text-white">🎬 Auto Demo</h3>
			<div className="text-sm text-dark-300">Cycles: Baseline → Anxiety → Baseline → Low SpO₂ → Baseline</div>
			<div className="flex items-center gap-3">
				<label className="text-sm text-dark-300">Step seconds</label>
				<input type="number" min={10} max={120} value={stepSeconds} onChange={e => setStepSeconds(Number(e.target.value) || 30)} className="w-24 bg-dark-800 text-white px-2 py-1 rounded" />
				{!running ? (
					<button onClick={start} className="px-4 py-2 rounded bg-green-600 text-white">Start</button>
				) : (
					<button onClick={stop} className="px-4 py-2 rounded bg-red-600 text-white">Stop</button>
				)}
			</div>
		</div>
	)
}

export default AutoDemoControls