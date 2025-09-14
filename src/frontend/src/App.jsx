import React, { useState } from 'react'
import Landing from './components/Landing'
import VitalsDashboard from './components/VitalsDashboard'
import VitalsChart from './components/VitalsChart'
import RiskAlert from './components/RiskAlert'
import WorkingHeartRate from './components/WorkingHeartRate'
import SimulationControls from './components/SimulationControls'
import RespiratoryRateSimulator from './components/RespiratoryRateSimulator'
import AutoDemoControls from './components/AutoDemoControls'
import ReportButton from './components/ReportButton'
import ErrorBoundary from './components/ErrorBoundary'
import AIClinic from './components/AIClinic'
import LearnMore from './components/LearnMore'
import Login from './components/Login'
import { useVitalsData } from './hooks/useVitalsData'

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [realHeartRate, setRealHeartRate] = useState(null)
  const [user, setUser] = useState(null)
  const { vitalsData, riskLevel, isLoading, updateVitalsFromCamera, triggerScenario, resetScenario, currentScenario } = useVitalsData()

  const handleHeartRateDetected = (heartRate) => {
    setRealHeartRate(heartRate)
    updateVitalsFromCamera(heartRate)
  }

  return (
    <div className="min-h-screen gradient-bg">
      {riskLevel && riskLevel !== 'low' && (
        <RiskAlert riskLevel={riskLevel} />
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {currentView === 'landing' && (
          <Landing onGetStarted={() => setCurrentView('dashboard')} onOpenClinic={() => setCurrentView('clinic')} />
        )}

        {currentView === 'learn' && (
          <ErrorBoundary>
            <LearnMore onBack={() => setCurrentView('landing')} />
          </ErrorBoundary>
        )}

        {currentView === 'login' && (
          <ErrorBoundary>
            <Login onLogin={(u) => { setUser(u); setCurrentView('clinic') }} onBack={() => setCurrentView('landing')} />
          </ErrorBoundary>
        )}
        
        {currentView === 'clinic' && (
          <ErrorBoundary>
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="text-center space-y-1">
                  <h1 className="text-4xl font-bold neon-text">AI Clinic</h1>
                  <p className="text-dark-300 text-sm">Digital reception, symptom checking and navigation</p>
                </div>
                <div className="text-xs text-dark-300">{user ? `Logged in: ${user.phone}` : <button className="text-primary-400" onClick={() => setCurrentView('login')}>Login</button>}</div>
              </div>
              <AIClinic />
              <div className="flex justify-center mt-8 gap-3">
                <button onClick={() => setCurrentView('landing')} className="glass-card px-6 py-3 rounded-lg text-primary-400">← Home</button>
                <button onClick={() => setCurrentView('learn')} className="glass-card px-6 py-3 rounded-lg text-green-400">Learn More</button>
              </div>
            </div>
          </ErrorBoundary>
        )}
        
        {currentView === 'dashboard' && (
          <ErrorBoundary>
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold neon-text">
                  PulseAI Dashboard
                </h1>
                <p className="text-dark-300 text-lg max-w-2xl mx-auto">
                  Real-time health monitoring with AI-powered insights
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <VitalsDashboard vitalsData={vitalsData} isLoading={isLoading} />
                  <WorkingHeartRate onHeartRateDetected={handleHeartRateDetected} />
                  <SimulationControls onAnxiety={(sec) => triggerScenario('anxiety', sec)} onLowSpO2={(sec) => triggerScenario('low_spo2', sec)} onReset={() => resetScenario()} />
                  <AutoDemoControls onTrigger={(scenario, sec) => triggerScenario(scenario, sec)} onReset={() => resetScenario()} />
                  <div>
                    <ReportButton vitals={vitalsData} scenarioRef={currentScenario} riskLevel={riskLevel} />
                  </div>
                </div>
                <div className="lg:col-span-1 space-y-8">
                  <VitalsChart vitalsData={vitalsData} />
                  <RespiratoryRateSimulator />
                </div>
              </div>
              <div className="flex justify-center mt-12 gap-3">
                <button onClick={() => setCurrentView('landing')} className="glass-card px-6 py-3 rounded-lg text-primary-400">← Home</button>
                <button onClick={() => setCurrentView('learn')} className="glass-card px-6 py-3 rounded-lg text-green-400">Learn More</button>
                <button onClick={() => setCurrentView('clinic')} className="glass-card px-6 py-3 rounded-lg text-yellow-400">Enter AI Clinic</button>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  )
}

export default App
