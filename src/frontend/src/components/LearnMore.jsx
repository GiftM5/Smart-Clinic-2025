import React from 'react'

const LearnMore = ({ onBack }) => {
	return (
		<div className="space-y-6">
			<div className="glass-card p-6 rounded-xl">
				<h2 className="text-3xl font-bold text-white">About AI Clinic</h2>
				<p className="text-dark-300 mt-2">A digital front door for clinics in South Africa: quick symptom checks, booking slips, and directions — designed to work even with limited connectivity.</p>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="glass-card p-6 rounded-xl space-y-3">
					<h3 className="text-xl font-semibold text-white">What it does</h3>
					<ul className="text-dark-300 text-sm space-y-1 list-disc list-inside">
						<li>Self-check symptoms (offline-friendly)</li>
						<li>Cough check (on-device) and simple vitals tools</li>
						<li>Create a booking slip with a ticket ID</li>
						<li>Find nearby clinics and get directions</li>
					</ul>
				</div>
				<div className="glass-card p-6 rounded-xl space-y-3">
					<h3 className="text-xl font-semibold text-white">What it’s not</h3>
					<ul className="text-dark-300 text-sm space-y-1 list-disc list-inside">
						<li>Not a diagnosis tool</li>
						<li>Does not replace clinicians</li>
						<li>Use for guidance and prepare for a clinic visit</li>
					</ul>
				</div>
			</div>
			<div className="glass-card p-6 rounded-xl space-y-3">
				<h3 className="text-xl font-semibold text-white">Privacy & Safety</h3>
				<p className="text-dark-300 text-sm">Checks run on your device where possible. Only booking slip data is sent when you choose to book. Always seek care urgently if you have red flags: severe chest pain, difficulty breathing, confusion, blue lips or face, or coughing blood.</p>
			</div>
			<div className="flex justify-center">
				<button onClick={onBack} className="glass-card px-6 py-3 rounded-lg text-primary-400 hover:text-primary-300">← Back</button>
			</div>
		</div>
	)
}

export default LearnMore