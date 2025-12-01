import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { TodoProvider } from './context/TodoContext';
import Router from './router';

export default function App() {
  return (
    <AuthProvider>
      <TodoProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <Router />
        </div>
      </TodoProvider>
    </AuthProvider>
  );
}
