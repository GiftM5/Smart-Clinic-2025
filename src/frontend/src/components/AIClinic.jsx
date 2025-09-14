import React, { useMemo, useState } from 'react'
import ReportButton from './ReportButton'
import CoughCheck from './CoughCheck'

const apiBase = (import.meta?.env?.VITE_API_URL)
	|| (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://127.0.0.1:8000')

const mockClinics = [
	{ id: 'cl1', name: 'Hillbrow Community Health Centre', services: ['TB', 'HIV', 'Maternal'], hours: '08:00-16:00', loadshedding: false, distanceKm: 1.2 },
	{ id: 'cl2', name: 'Soweto Clinic North', services: ['HIV', 'General'], hours: '08:00-18:00', loadshedding: true, distanceKm: 5.4 },
	{ id: 'cl3', name: 'Tembisa West Clinic', services: ['TB', 'General'], hours: '07:30-16:00', loadshedding: false, distanceKm: 8.7 },
]

const AIClinic = () => {
	const [triage, setTriage] = useState({ name: '', age: '', language: 'en', cough_days: 0, fever: false, night_sweats: false, weight_loss: false, breathlessness: false, chest_pain: false, other: '' })
	const [triageResult, setTriageResult] = useState(null)
	const [appt, setAppt] = useState({ name: '', phone: '', id_number: '', preferred_time: '', reason: '', clinic_id: 'cl1' })
	const [lastAppointment, setLastAppointment] = useState(null)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState('')
	const [coughDetected, setCoughDetected] = useState(false)

	const selectedClinic = useMemo(() => mockClinics.find(c => c.id === appt.clinic_id) || mockClinics[0], [appt.clinic_id])

	const rankedClinics = useMemo(() => {
		const tbConcern = ((triage.cough_days || 0) >= 14) || triage.night_sweats || triage.weight_loss || coughDetected
		return [...mockClinics]
			.sort((a, b) => {
				let sa = 0, sb = 0
				if (tbConcern) {
					sa += a.services.includes('TB') ? -2 : 0
					sb += b.services.includes('TB') ? -2 : 0
				}
				sa += a.loadshedding ? 1 : 0
				sb += b.loadshedding ? 1 : 0
				sa += a.distanceKm
				sb += b.distanceKm
				return sa - sb
			})
	}, [triage, coughDetected])

	const localTriageFallback = () => {
		let score = 0
		const coughDays = triage.cough_days ? Number(triage.cough_days) : (coughDetected ? 3 : 0)
		if (coughDays >= 14) score += 3
		if (triage.fever) score += 1
		if (triage.night_sweats) score += 2
		if (triage.weight_loss) score += 2
		if (triage.breathlessness) score += 1
		if (triage.chest_pain) score += 1
		const txt = (triage.other || '').toLowerCase()
		if (txt.includes('blood')) score += 2
		if (txt.includes('hiv')) score += 1
		if (coughDetected) score += 1
		let risk = 'low'
		if (score >= 6) risk = 'high'
		else if (score >= 3) risk = 'medium'
		const recs = []
		if (coughDetected && risk !== 'high') recs.push('Flu-like cough suspected: rest, hydrate, paracetamol; seek care if worsening.')
		if (risk === 'high') recs.push('Please visit a clinic for TB screening within 24–48 hours.')
		else if (risk === 'medium') recs.push('Monitor symptoms and visit a clinic this week if cough persists.')
		else recs.push('Self-care: rest, hydration, and monitor symptoms.')
		return {
			risk_level: risk,
			score,
			summary: `Local triage for ${triage.name || 'patient'}: score ${score}, risk ${risk}.`,
			recommendations: recs,
			timestamp: Date.now()
		}
	}

	const validateReception = () => {
		if (!appt.name) return 'Name is required'
		if (appt.phone && !/^\d{10}$/.test(appt.phone)) return 'Phone must be 10 digits (SA)'
		if (appt.id_number && !/^\d{13}$/.test(appt.id_number)) return 'ID number must be 13 digits'
		return ''
	}

	const submitTriage = async (e) => {
		e.preventDefault()
		setBusy(true); setError('')
		try {
			const res = await fetch(`${apiBase}/api/clinic/triage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...triage,
					age: triage.age ? Number(triage.age) : undefined,
					cough_days: triage.cough_days ? Number(triage.cough_days) : (coughDetected ? 3 : 0)
				})
			})
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const data = await res.json()
			setTriageResult(data)
		} catch (err) {
			const fallback = localTriageFallback()
			setTriageResult(fallback)
			setError(`Triage: backend unavailable, used local scoring (${err.message}).`)
		} finally {
			setBusy(false)
		}
	}

	const submitAppointment = async (e) => {
		e.preventDefault()
		const v = validateReception()
		if (v) { setError(v); return }
		setBusy(true); setError('')
		const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedClinic.name)}`
		try {
			const res = await fetch(`${apiBase}/api/clinic/appointments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: appt.name, phone: appt.phone, id_number: appt.id_number, preferred_time: appt.preferred_time, reason: appt.reason })
			})
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const data = await res.json()
			setLastAppointment({ ...data, clinic: selectedClinic.name, directions })
		} catch (err) {
			const fake = {
				id: Math.random().toString(36).slice(2, 10),
				name: appt.name,
				phone: appt.phone,
				preferred_time: appt.preferred_time,
				reason: appt.reason,
				status: 'booked',
				created_at: new Date().toISOString(),
				clinic: selectedClinic.name,
				directions
			}
			setLastAppointment(fake)
			setError(`Booking: backend unavailable, created local ticket (${err.message}).`)
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="glass-card p-6 rounded-xl">
				<h2 className="text-2xl font-semibold text-white">🏥 AI Clinic</h2>
				<p className="text-dark-300 text-sm mt-1">Reception, AI triage, clinic navigation — now with Cough Check.</p>
				<div className="text-xs text-dark-400 mt-2">We guide you to care. Not a diagnosis. Your checks run on-device; only bookings are sent.</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Reception */}
				<div className="glass-card p-6 rounded-xl space-y-4">
					<h3 className="text-xl font-semibold text-white">🧾 Reception</h3>
					<form onSubmit={submitAppointment} className="space-y-3">
						<input className="w-full bg-dark-800 text-white px-3 py-2 rounded" placeholder="Full name" value={appt.name} onChange={e => setAppt({ ...appt, name: e.target.value })} required />
						<input className="w-full bg-dark-800 text-white px-3 py-2 rounded" placeholder="SA phone (10 digits)" value={appt.phone} onChange={e => setAppt({ ...appt, phone: e.target.value })} />
						<input className="w-full bg-dark-800 text-white px-3 py-2 rounded" placeholder="ID number (13 digits)" value={appt.id_number} onChange={e => setAppt({ ...appt, id_number: e.target.value })} />
						<input className="w-full bg-dark-800 text-white px-3 py-2 rounded" placeholder="Preferred time (e.g., 10:30)" value={appt.preferred_time} onChange={e => setAppt({ ...appt, preferred_time: e.target.value })} />
						<input className="w-full bg-dark-800 text-white px-3 py-2 rounded" placeholder="Reason (optional)" value={appt.reason} onChange={e => setAppt({ ...appt, reason: e.target.value })} />
						<select className="w-full bg-dark-800 text-white px-3 py-2 rounded" value={appt.clinic_id} onChange={e => setAppt({ ...appt, clinic_id: e.target.value })}>
							{mockClinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
						</select>
						<button disabled={busy} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded">Book Appointment</button>
					</form>
					{lastAppointment && (
						<div className="text-sm text-green-400">Booked #{lastAppointment.id} at {lastAppointment.preferred_time || 'next available'} for {lastAppointment.name} • <a href={lastAppointment.directions} target="_blank" rel="noreferrer" className="text-primary-400">Directions</a></div>
					)}
					{error && <div className="text-yellow-400 text-sm">{error}</div>}
				</div>

				{/* Triage + Cough */}
				<div className="space-y-6">
					<div className="glass-card p-6 rounded-xl space-y-4">
						<h3 className="text-xl font-semibold text-white">🤖 Symptom Checker</h3>
						<form onSubmit={submitTriage} className="space-y-3">
							<div className="grid grid-cols-2 gap-3">
								<input className="bg-dark-800 text-white px-3 py-2 rounded" placeholder="Name" value={triage.name} onChange={e => setTriage({ ...triage, name: e.target.value })} />
								<input className="bg-dark-800 text-white px-3 py-2 rounded" placeholder="Age" value={triage.age} onChange={e => setTriage({ ...triage, age: e.target.value })} />
							</div>
							<div className="grid grid-cols-2 gap-3">
								<input className="bg-dark-800 text-white px-3 py-2 rounded" placeholder="Cough days" value={triage.cough_days} onChange={e => setTriage({ ...triage, cough_days: e.target.value })} />
								<select className="bg-dark-800 text-white px-3 py-2 rounded" value={triage.language} onChange={e => setTriage({ ...triage, language: e.target.value })}>
									<option value="en">English</option>
									<option value="zu">Zulu</option>
									<option value="xh">Xhosa</option>
									<option value="st">Sotho</option>
								</select>
							</div>
							<div className="grid grid-cols-2 gap-3 text-sm text-dark-300">
								<label className="flex items-center gap-2"><input type="checkbox" checked={triage.fever} onChange={e => setTriage({ ...triage, fever: e.target.checked })} /> Fever</label>
								<label className="flex items-center gap-2"><input type="checkbox" checked={triage.night_sweats} onChange={e => setTriage({ ...triage, night_sweats: e.target.checked })} /> Night sweats</label>
								<label className="flex items-center gap-2"><input type="checkbox" checked={triage.weight_loss} onChange={e => setTriage({ ...triage, weight_loss: e.target.checked })} /> Weight loss</label>
								<label className="flex items-center gap-2"><input type="checkbox" checked={triage.breathlessness} onChange={e => setTriage({ ...triage, breathlessness: e.target.checked })} /> Breathlessness</label>
								<label className="flex items-center gap-2"><input type="checkbox" checked={triage.chest_pain} onChange={e => setTriage({ ...triage, chest_pain: e.target.checked })} /> Chest pain</label>
							</div>
							<textarea className="w-full bg-dark-800 text-white px-3 py-2 rounded" placeholder="Other symptoms (optional)" rows={2} value={triage.other} onChange={e => setTriage({ ...triage, other: e.target.value })} />
							<button disabled={busy} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Run Check</button>
						</form>
						{triageResult && (
							<div className="bg-dark-800/50 rounded p-3 text-sm">
								<div className="text-white font-medium">Risk: {triageResult.risk_level} (score {triageResult.score})</div>
								<div className="text-dark-300 mt-1">{triageResult.summary}</div>
								<ul className="mt-2 list-disc list-inside text-dark-300">
									{triageResult.recommendations.map((r, i) => <li key={i}>{r}</li>)}
								</ul>
							</div>
						)}
					</div>

					<CoughCheck onResult={(r) => {
						setCoughDetected(!!r.coughDetected && !!r.fluLike)
						if (r.coughDetected && (!triage.cough_days || Number(triage.cough_days) < 1)) {
							setTriage(prev => ({ ...prev, cough_days: 3 }))
						}
					}} />
				</div>
			</div>

			{/* Navigator + Report */}
			<div className="glass-card p-6 rounded-xl space-y-4">
				<h3 className="text-xl font-semibold text-white">🧭 Clinic Navigator</h3>
				<div className="space-y-2">
					{rankedClinics.map(c => (
						<div key={c.id} className="flex items-center justify-between bg-dark-800/40 rounded p-3 text-sm">
							<div>
								<div className="text-white font-medium">{c.name}</div>
								<div className="text-dark-300">{c.services.join(', ')} • {c.hours} • {c.distanceKm} km {c.loadshedding ? '• Load shedding' : ''}</div>
							</div>
							<a className="text-primary-400" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name)}`} target="_blank" rel="noreferrer">Directions</a>
						</div>
					))}
				</div>
				<div>
					<ReportButton vitals={triageResult ? { heartRate: 0, spo2: 0, hrv: 0, timestamp: Date.now(), triageResult, appointment: lastAppointment, coughDetected } : null} scenarioRef={{ current: 'ai-clinic' }} riskLevel={triageResult?.risk_level || 'low'} />
				</div>
			</div>
		</div>
	)
}

export default AIClinic