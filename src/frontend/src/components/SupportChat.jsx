import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, User } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const SupportChat = ({ onBack }) => {
    const { token } = useAuth();
    const [messages, setMessages] = useState([
        { sender: 'ai', text: "Hi there! I'm Buddy, your supportive companion. How are you feeling today?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const chatEndRef = useRef(null);

    // Effect to scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (!userMessage || isLoading) return;

        // Add user message to the chat
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInputValue('');
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${apiBase}/chat/buddy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Crucial for protected routes
                },
                body: JSON.stringify({ text: userMessage }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to get a response.');
            }

            const data = await response.json();
            // Add AI response to the chat
            setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);

        } catch (err) {
            setError(err.message);
            // Optionally add an error message to the chat
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[85vh] max-w-3xl mx-auto">
            <div className="text-center mb-6">
                <h1 className="text-4xl font-bold neon-text">Support Buddy</h1>
                <p className="text-dark-300">A safe space to share your thoughts. I'm here to listen.</p>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 glass-card p-4 rounded-xl overflow-y-auto custom-scrollbar space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="p-2 bg-primary-800 rounded-full"><Bot className="w-5 h-5 text-primary-400" /></div>}
                        <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-dark-700 text-dark-200'}`}>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                        {msg.sender === 'user' && <div className="p-2 bg-dark-700 rounded-full"><User className="w-5 h-5 text-dark-300" /></div>}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-start gap-3 justify-start">
                        <div className="p-2 bg-primary-800 rounded-full"><Bot className="w-5 h-5 text-primary-400" /></div>
                        <div className="max-w-md p-3 rounded-lg bg-dark-700 text-dark-200">
                           <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-dark-400 rounded-full animate-pulse delay-75"></span>
                                <span className="w-2 h-2 bg-dark-400 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-dark-400 rounded-full animate-pulse delay-300"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="mt-6 flex items-center gap-3">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 bg-dark-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isLoading}
                />
                <button type="submit" className="bg-primary-600 hover:bg-primary-700 p-3 rounded-lg" disabled={isLoading}>
                    <Send className="w-6 h-6 text-white" />
                </button>
            </form>
            <div className="text-center mt-8">
                 <button onClick={onBack} className="glass-card px-6 py-3 rounded-lg text-primary-400">← Home</button>
            </div>
        </div>
    );
};

export default SupportChat;