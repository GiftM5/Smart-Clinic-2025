import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null); // We can store user details here later
    const [isLoading, setIsLoading] = useState(false);

    // This effect runs on initial load to check for a token
    useEffect(() => {
        if (token) {
            // Here you could add a function to fetch user profile
            // based on the token to verify it's still valid.
            // For now, we'll assume the token is valid if it exists.
        }
    }, [token]);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('username', email); // FastAPI's form expects 'username'
            formData.append('password', password);

            const response = await fetch(`${apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }

            const data = await response.json();
            setToken(data.access_token);
            localStorage.setItem('authToken', data.access_token);
            setIsLoading(false);
            return { success: true };
        } catch (error) {
            setIsLoading(false);
            return { success: false, message: error.message };
        }
    };

    const register = async (email, fullName, password) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiBase}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, full_name: fullName, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Registration failed');
            }
            
            // Optionally log the user in directly after registration
            setIsLoading(false);
            return { success: true };

        } catch (error) {
            setIsLoading(false);
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
    };

    const value = {
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
