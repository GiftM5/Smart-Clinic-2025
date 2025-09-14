import React, { useState } from 'react'

const Login = ({ onLogin, onBack }) => {
	const [phone, setPhone] = useState('')
	const [pin, setPin] = useState('')
	const [error, setError] = useState('')

	const submit = (e) => {
		e.preventDefault()
		setError('')
		// Local-only stub: validate SA phone length and 4+ digit PIN
		if (!/^\d{10}$/.test(phone)) {
			setError('Enter a 10-digit SA phone number')
			return
		}
		if (!/^\d{4,6}$/.test(pin)) {
			setError('Enter a 4-6 digit PIN')
			return
		}
		onLogin?.({ phone })
	}

	return (
		<div className="space-y-6">
			<div className="glass-card p-6 rounded-xl">
				<h2 className="text-3xl font-bold text-white">Login</h2>
				<p className="text-dark-300 text-sm mt-2">Local demo login. No server or passwords are stored.</p>
			</div>
			<form onSubmit={submit} className="glass-card p-6 rounded-xl space-y-3">
				<input className="w-full bg-dark-800 text-white px-3 py-2 rounded" placeholder="SA phone (10 digits)" value={phone} onChange={e => setPhone(e.target.value)} />
				<input className="w-full bg-dark-800 text-white px-3 py-2 rounded" placeholder="PIN (4-6 digits)" value={pin} onChange={e => setPin(e.target.value)} />
				{error && <div className="text-red-400 text-sm">{error}</div>}
				<div className="flex items-center gap-3">
					<button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded">Login</button>
					<button type="button" onClick={onBack} className="glass-card px-4 py-2 rounded text-primary-400">Back</button>
				</div>
			</form>
		</div>
	)
}

export default Login