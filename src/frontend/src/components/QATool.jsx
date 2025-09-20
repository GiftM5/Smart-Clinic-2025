import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clipboard, Check, FileText, Code, Shield } from 'lucide-react';
import { Remarkable } from 'remarkable';

const md = new Remarkable();
const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const MarkdownRenderer = ({ content }) => {
    const html = md.render(content);
    return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
};

const ADAPTIVE_HACKER_LOG_SEQUENCE = [
    { type: 'info', text: 'Initializing Adaptive Test Hacker...' },
    { type: 'info', text: 'Target: Smart Clinic API @ /api/appointments' },
    { type: 'attack', text: "Injecting invalid input: Appointment date '2099-13-40'" },
    { type: 'success', text: 'Result: REJECTED ✔ - Server correctly handled invalid date.' },
    { type: 'attack', text: "Injecting invalid input: Patient Name with <script> tag" },
    { type: 'success', text: 'Result: REJECTED ✔ - Server sanitized XSS attempt.' },
    
    { type: 'info', text: 'Target: Smart Clinic API @ /api/points' },
    { type: 'attack', text: "Testing business logic: Attempting to add negative reward points (points: -500)" },
    { type: 'success', text: 'Result: REJECTED ✔ - Business logic correctly prevented negative value transaction.' },
   
    { type: 'info', text: 'Target: Smart Clinic API @ /api/users' },
    { type: 'attack', text: "Injecting SQL-style input: user_id = '1 OR 1=1'" },
    { type: 'failure', text: "Result: FAILED ⚠ - Server responded with 500 Internal Error. Potential SQL injection vulnerability detected." },
    { type: 'adaptive', text: 'ADAPTIVE FEEDBACK TRIGGERED' },
    
    { type: 'info', text: 'Target: Smart Clinic API @ /static/generated' },
    { type: 'attack', text: 'Probing for directory traversal vulnerability: file=../../etc/passwd' },
    { type: 'success', text: 'Result: REJECTED ✔ - Path normalization appears to be in place.' },
   
    { type: 'info', text: 'Scanning for unauthorized access points...' },
    { type: 'attack', text: 'Attempting to access honeypot_user record without credentials...' },
    { type: 'success', text: 'Result: ACCESS DENIED ✔ - Honeypot is secure.' },
    { type: 'info', text: 'Simulation complete.' },
];


const QATool = ({ onBack }) => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('cases');
    
    const [description, setDescription] = useState('Feature: User Login\nAs a registered user, I want to be able to log in with my email and password so that I can access my dashboard.');
    const [generatedCases, setGeneratedCases] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [generatedScript, setGeneratedScript] = useState('');
    const [framework, setFramework] = useState('playwright');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const [hackerLogs, setHackerLogs] = useState([]);
    const [isHacking, setIsHacking] = useState(false);
    const intervalRef = useRef(null);
    const logContainerRef = useRef(null);
    
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [hackerLogs]);

    const runAdaptiveFeedback = async (failedTest) => {
        try {
            const response = await fetch(`${apiBase}/testing/adaptive-feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ description: failedTest }),
            });
            if (!response.ok) throw new Error("AI feedback failed.");
            const data = await response.json();
            setHackerLogs(prev => [...prev, { type: 'suggestion', text: `New Suggestion: ${data.suggestion}` }]);
        } catch (err) {
            setHackerLogs(prev => [...prev, { type: 'failure', text: 'Could not get adaptive feedback from AI.' }]);
        }
    };
    
    const startHacking = () => {
        setIsHacking(true);
        setHackerLogs([]);
        let i = 0;
        const tick = async () => {
            if (i >= ADAPTIVE_HACKER_LOG_SEQUENCE.length) {
                stopHacking();
                return;
            }
            const logEntry = ADAPTIVE_HACKER_LOG_SEQUENCE[i];
            setHackerLogs(prev => [...prev, logEntry]);

            if (logEntry.type === 'adaptive') {
                clearInterval(intervalRef.current);
                const failedTest = ADAPTIVE_HACKER_LOG_SEQUENCE.find(l => l.type === 'failure').text;
                await runAdaptiveFeedback(failedTest);
                i++;
            
                intervalRef.current = setInterval(tick, 2000);
            } else {
                 i++;
            }
        };
        tick(); 
        intervalRef.current = setInterval(tick, 1200);
    };

    const stopHacking = () => {
        setIsHacking(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
    
    useEffect(() => {
        return () => stopHacking();
    }, []);

    const handleGenerate = async () => {
        setIsLoading(true); setError(''); setGeneratedCases(''); setGeneratedScript('');
        let endpoint = activeTab === 'cases' ? `${apiBase}/testing/generate-cases` : `${apiBase}/testing/generate-script`;
        let body = activeTab === 'cases' ? { description } : { code: inputCode, framework };
        try {
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
            if (!response.ok) { const err = await response.json(); throw new Error(err.detail); }
            const data = await response.json();
            if (activeTab === 'cases') setGeneratedCases(data.cases); else setGeneratedScript(data.script);
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    const handleCopy = () => {
        const contentToCopy = activeTab === 'scripts' ? generatedScript : generatedCases;
        if (!contentToCopy) return;
        navigator.clipboard.writeText(contentToCopy); setCopied(true); setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <header className="text-center mb-6">
                <h1 className="text-4xl font-bold neon-text">AI QA Co-Pilot</h1>
                <p className="text-dark-300 mt-2">A unified tool for AI-assisted test planning, automation, and security analysis.</p>
            </header>
            
            <main className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-center mb-4">
                    <div className="flex items-center gap-2 p-1 bg-dark-900 rounded-lg">
                        <button onClick={() => setActiveTab('cases')} className={`flex items-center gap-2 px-4 py-2 text-sm rounded ${activeTab === 'cases' ? 'bg-primary-600' : ''}`}><FileText size={16}/> Test Case Generator</button>
                        <button onClick={() => setActiveTab('scripts')} className={`flex items-center gap-2 px-4 py-2 text-sm rounded ${activeTab === 'scripts' ? 'bg-primary-600' : ''}`}><Code size={16}/> Test Script Generator</button>
                        <button onClick={() => setActiveTab('hacker')} className={`flex items-center gap-2 px-4 py-2 text-sm rounded ${activeTab === 'hacker' ? 'bg-danger-600' : ''}`}><Shield size={16}/> Adaptive Hacker</button>
                    </div>
                </div>

                {activeTab === 'hacker' ? (
                    <div className="flex-1 flex flex-col min-h-0 glass-card p-4 rounded-xl">
                        <div ref={logContainerRef} className="flex-1 bg-dark-950 p-3 rounded font-mono text-sm text-gray-300 overflow-y-auto custom-scrollbar">
                            {hackerLogs.map((log, i) => (
                                <p key={i} className={`whitespace-pre-wrap ${log.type === 'success' ? 'text-green-400' : log.type === 'failure' ? 'text-red-400' : log.type === 'attack' ? 'text-yellow-400' : log.type === 'suggestion' ? 'text-primary-400' : ''}`}>
                                    {`[${new Date().toLocaleTimeString()}] ${log.text}`}
                                </p>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                        <div className="flex flex-col glass-card p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-lg font-semibold">1. Input</h2>
                                {activeTab === 'scripts' && (<div className="flex items-center gap-2 p-1 bg-dark-900 rounded-lg"><button onClick={() => setFramework('playwright')} className={`px-2 py-1 text-xs rounded ${framework === 'playwright' ? 'bg-primary-600' : ''}`}>Playwright</button><button onClick={() => setFramework('cypress')} className={`px-2 py-1 text-xs rounded ${framework === 'cypress' ? 'bg-green-600' : ''}`}>Cypress</button></div>)}
                            </div>
                            {activeTab === 'cases' ? (<textarea value={description} onChange={(e) => setDescription(e.target.value)} className="flex-1 w-full bg-dark-900 text-gray-300 font-mono text-sm p-3 rounded custom-scrollbar" />) : (<textarea value={inputCode} onChange={(e) => setInputCode(e.target.value)} placeholder="Paste component code here..." className="flex-1 w-full bg-dark-900 text-gray-300 font-mono text-sm p-3 rounded custom-scrollbar" />)}
                        </div>
                        <div className="flex flex-col glass-card p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-2"><h2 className="text-lg font-semibold">2. AI Generated Output</h2><button onClick={handleCopy} className="p-2 hover:bg-dark-700 rounded-lg">{copied ? <Check className="w-4 h-4 text-green-400" /> : <Clipboard className="w-4 h-4 text-dark-300" />}</button></div>
                            <div className="flex-1 bg-dark-900 p-3 rounded custom-scrollbar overflow-y-auto">{isLoading ? <p className="text-center p-4">Generating...</p> : error ? <p className="text-red-400 p-4">Error: {error}</p> : activeTab === 'cases' ? <MarkdownRenderer content={generatedCases} /> : <pre className="text-sm text-green-300 whitespace-pre-wrap font-mono"><code>{generatedScript}</code></pre>}</div>
                        </div>
                    </div>
                )}
            </main>
            
            <footer className="text-center mt-6 flex justify-center items-center gap-4">
                {activeTab === 'hacker' ? (
                    <button onClick={isHacking ? stopHacking : startHacking} className={`px-6 py-3 rounded-lg text-white font-bold ${isHacking ? 'bg-red-600' : 'bg-green-600'}`}>{isHacking ? 'Stop Simulation' : 'Start Adaptive Hacking'}</button>
                ) : (
                    <button onClick={handleGenerate} disabled={isLoading} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg">✨ Generate</button>
                )}
                <button onClick={onBack} className="glass-card px-6 py-3 rounded-lg text-primary-400">← Back to Smart Clinic</button>
            </footer>
        </div>
    );
};

export default QATool;