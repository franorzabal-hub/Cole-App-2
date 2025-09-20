'use client';

import { useState } from 'react';

export default function TestLogin() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');

    try {
      const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                accessToken
                user {
                  id
                  email
                  firstName
                  lastName
                  role
                  tenantId
                }
              }
            }
          `,
          variables: {
            input: {
              email: 'admin@coleapp.com',
              password: 'admin123'
            }
          }
        })
      });

      const data = await response.json();

      if (data.errors) {
        setResult('❌ Error: ' + JSON.stringify(data.errors, null, 2));
      } else if (data.data?.login) {
        setResult('✅ Login successful!\n\n' + JSON.stringify(data.data.login, null, 2));
      } else {
        setResult('❓ Unexpected response: ' + JSON.stringify(data, null, 2));
      }
    } catch (error: any) {
      setResult('❌ Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Login</h1>

      <div className="mb-4">
        <p>Email: admin@coleapp.com</p>
        <p>Password: admin123</p>
      </div>

      <button
        onClick={testLogin}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test Login'}
      </button>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <pre className="whitespace-pre-wrap">{result}</pre>
      </div>
    </div>
  );
}