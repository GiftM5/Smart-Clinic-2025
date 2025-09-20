import React, { useState } from 'react'
import Landing from './Landing'
import VitalsDashboard from './VitalsDashboard'
import VitalsChart from './VitalsChart'
import RiskAlert from './RiskAlert'
import WorkingHeartRate from './WorkingHeartRate'
import SimulationControls from './SimulationControls'
import RespiratoryRateSimulator from './RespiratoryRateSimulator'
import AutoDemoControls from './AutoDemoControls'
import ReportButton from './ReportButton'
import ErrorBoundary from './ErrorBoundary'
import AIClinic from './AIClinic'
import LearnMore from './LearnMore'
import { useVitalsData } from '../hooks/useVitalsData'
import { useAuth } from '../context/AuthContext' 
import SupportChat from './SupportChat'
import QATool from './QATool'

function MainApp() {
  const [currentView, setCurrentView] = useState('landing')
  const [realHeartRate, setRealHeartRate] = useState(null)
  const { vitalsData, riskLevel, isLoading, updateVitalsFromCamera, triggerScenario, resetScenario, currentScenario } = useVitalsData()
  const { logout } = useAuth();

  const handleHeartRateDetected = (heartRate) => {
    setRealHeartRate(heartRate)
    updateVitalsFromCamera(heartRate)
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {riskLevel && riskLevel !== 'low' && (
        <RiskAlert riskLevel={riskLevel} />
      )}
      
    
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-1 flex flex-col min-h-0">
        <header className="absolute top-4 right-4 z-10">
          <button onClick={logout} className="glass-card px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors">
            Logout
          </button>
        </header>

        {currentView === 'landing' && (
          <Landing 
            onGetStarted={() => setCurrentView('dashboard')} 
            onOpenClinic={() => setCurrentView('clinic')} 
            onOpenLearn={() => setCurrentView('learn')}
            onOpenChat={() => setCurrentView('supportChat')}
            onOpenQATool={() => setCurrentView('qaTool')}
          />
        )}

        {currentView === 'qaTool' && (
             <ErrorBoundary>
                <QATool onBack={() => setCurrentView('landing')} />
             </ErrorBoundary>
        )}

    
        {currentView === 'supportChat' && (
          <ErrorBoundary>
            <SupportChat onBack={() => setCurrentView('landing')} />
          </ErrorBoundary>
        )}

        {currentView === 'learn' && (
          <ErrorBoundary>
            <LearnMore onBack={() => setCurrentView('landing')} />
          </ErrorBoundary>
        )}
        
        {currentView === 'clinic' && (
          <ErrorBoundary>
            <div className="space-y-8">
              <div className="text-center space-y-1">
                  <h1 className="text-4xl font-bold neon-text">Smart Clinic</h1>
                  <p className="text-dark-300 text-sm">Digital reception, symptom checking and navigation</p>
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
                Smart Clinic Dashboard
                </h1>
                <p className="text-dark-300 text-lg max-w-2xl mx-auto">
                  Real-time health monitoring with AI-powered insights
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg-col-span-2 space-y-8">
                  <VitalsDashboard vitalsData={vitalsData} isLoading={isLoading} />
                  <WorkingHeartRate onHeartRateDetected={handleHeartRateDetected} />
                  <SimulationControls onAnxiety={(sec) => triggerScenario('anxiety', sec)} onLowSpO2={(sec) => triggerScenario('low_spo2', sec)} onReset={() => resetScenario()} />
                  <AutoDemoControls onTrigger={(scenario, sec) => triggerScenario(scenario, sec)} onReset={() => resetScenario()} />
                  <div>
                    <ReportButton vitals={vitalsData} scenarioRef={currentScenario} riskLevel={riskLevel} />
                  </div>
                </div>
                <div className="lg-col-span-1 space-y-8">
                  <VitalsChart vitalsData={vitalsData} />
                  <RespiratoryRateSimulator />
                </div>
              </div>
              <div className="flex justify-center mt-12 gap-3">
                <button onClick={() => setCurrentView('landing')} className="glass-card px-6 py-3 rounded-lg text-primary-400">← Home</button>
                <button onClick={() => setCurrentView('learn')} className="glass-card px-6 py-3 rounded-lg text-green-400">Learn More</button>
                <button onClick={() => setCurrentView('clinic')} className="glass-card px-6 py-3 rounded-lg text-yellow-400">Enter Smart Clinic</button>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  )
}

export default MainApp