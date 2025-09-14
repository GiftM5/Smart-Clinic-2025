import React from 'react'

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props)
		this.state = { hasError: false, message: '' }
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, message: error?.message || 'Unknown error' }
	}

	componentDidCatch(error, errorInfo) {
		// Optional: log to a service
		console.error('Dashboard error:', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="glass-card p-6 rounded-xl">
					<h3 className="text-xl font-semibold text-white">Something went wrong</h3>
					<p className="text-dark-300 text-sm mt-2">{this.state.message}</p>
					<p className="text-dark-500 text-xs mt-1">Check browser console for details.</p>
				</div>
			)
		}
		return this.props.children
	}
}

export default ErrorBoundary