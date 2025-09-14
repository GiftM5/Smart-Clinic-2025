import React from 'react'

const SimulationControls = ({ onAnxiety, onLowSpO2, onReset }) => {
	return (
		<div className="glass-card p-6 rounded-xl space-y-4">
			<h3 className="text-xl font-semibold text-white">🧪 Scenario Simulator</h3>
			<div className="text-sm text-dark-300">Trigger realistic scenarios for demo.</div>
			<div className="flex flex-wrap gap-3">
				<button
					onClick={() => onAnxiety(60)}
					className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
				>
					😰 Anxiety (60s)
				</button>
				<button
					onClick={() => onLowSpO2(60)}
					className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
				>
					🫁 Low SpO₂ (60s)
				</button>
				<button
					onClick={onReset}
					className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
				>
					🔄 Reset
				</button>
			</div>
			<div className="text-xs text-dark-400">
				Anxiety raises HR and lowers HRV slightly. Low SpO₂ reduces oxygen and raises HR a bit.
			</div>
		</div>
	)
}

export default SimulationControls