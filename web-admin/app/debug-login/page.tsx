'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugLogin() {
  const [email, setEmail] = useState('admin@coleapp.com');
  const [password, setPassword] = useState('admin123');
  const [logs, setLogs] = useState<string[]>([]);
  const { login, user, loading } = useAuth();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleLogin = async () => {
    addLog('Starting login process...');

    try {
      addLog(`Calling login with email: ${email}`);
      await login(email, password);
      addLog('Login completed successfully');
      addLog(`Current user state: ${JSON.stringify(user, null, 2)}`);

      // Try direct navigation
      setTimeout(() => {
        addLog('Attempting direct navigation to /dashboard');
        window.location.href = '/dashboard';
      }, 500);
    } catch (error: any) {
      addLog(`Login failed: ${error.message}`);
      console.error('Full error:', error);
    }
  };

  const handleDirectNavigation = () => {
    addLog('Direct navigation to /dashboard');
    window.location.href = '/dashboard';
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Login</h1>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Login Form</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Login
            </button>

            <button
              onClick={handleDirectNavigation}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Direct Navigate to Dashboard
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2">Current State:</h3>
            <div className="bg-gray-100 p-3 rounded text-xs">
              <p>Loading: {loading ? 'true' : 'false'}</p>
              <p>User: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded h-96 overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}