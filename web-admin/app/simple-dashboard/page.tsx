'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function SimpleDashboard() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Dashboard (No Layout)</h1>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Auth State:</h2>
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <p>User: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
      </div>

      {user ? (
        <div>
          <p className="text-green-600 font-semibold mb-4">✅ You are logged in!</p>
          <p>Email: {user.email}</p>
          <p>Name: {user.firstName} {user.lastName}</p>
          <p>Role: {user.role}</p>

          <button
            onClick={logout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p className="text-red-600 font-semibold">❌ Not logged in</p>
          <a href="/login" className="text-blue-500 underline">Go to login</a>
        </div>
      )}
    </div>
  );
}