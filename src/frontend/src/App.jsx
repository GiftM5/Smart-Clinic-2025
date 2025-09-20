import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Pages/Components
import Login from './components/Login';
import Register from './components/Register';
import MainApp from './components/MainApp'; // We will create this next
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Route */}
      <Route 
        path="/*" // Match all other paths
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;